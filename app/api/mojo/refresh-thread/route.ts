import { NextResponse } from 'next/server'
import { fetchThreadStatus } from '@/lib/mojo/thread-fetchers'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'
import type { TablesUpdate } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const ok = await isSuperAdmin(user.id)
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const threadId = body?.threadId as string | undefined

    if (!threadId) {
      return NextResponse.json({ error: 'threadId required' }, { status: 400 })
    }

    const admin = getAdminClient()
    const { data: thread } = await admin
      .from('mojo_threads')
      .select('id, url, character_id, thread_type, last_poster')
      .eq('id', threadId)
      .single()

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    if (!thread.url) {
      return NextResponse.json({
        success: true,
        fetch_status: 'unsupported',
        last_poster: null,
        last_checked_at: new Date().toISOString(),
        message: 'Thread has no URL',
      })
    }

    // Get character name for class thread completion detection
    let characterName: string | null = null
    if (thread.thread_type === 'class') {
      const { data: char } = await admin
        .from('mojo_characters')
        .select('name')
        .eq('id', thread.character_id)
        .single()
      characterName = char?.name ?? null
    }

    const result = await fetchThreadStatus(thread.url, characterName ?? undefined)
    const lastCheckedAt = new Date().toISOString()

    // Professor mode detection (FIX-045-B) — must run and short-circuit
    // BEFORE the student-path auto-archive check below. A professor's
    // own first post on their own class thread would otherwise satisfy
    // result.my_post_found === true (the character posted somewhere on
    // the page) and incorrectly trigger the student-path archive.
    if (
      thread.thread_type === 'class' &&
      characterName &&
      result.all_authors &&
      result.all_authors.length > 0
    ) {
      const allAuthors = result.all_authors
      const firstAuthor = allAuthors[0] ?? null
      const isProfessor =
        firstAuthor !== null &&
        firstAuthor.trim().toLowerCase() === characterName.trim().toLowerCase()

      if (isProfessor) {
        const professorUpdate: TablesUpdate<'mojo_threads'> = {
          thread_mode: 'professor',
          first_poster: firstAuthor,
          fetch_status: result.fetch_status,
          last_checked_at: lastCheckedAt,
        }
        // Only overwrite class_name when this scrape actually found a
        // breadcrumb — preserve any existing value on extraction failure.
        if (result.scraped_class_name) {
          professorUpdate.class_name = result.scraped_class_name
        }

        await admin
          .from('mojo_threads')
          .update(professorUpdate)
          .eq('id', threadId)

        const nonProfessorAuthors = allAuthors.filter(
          (a) => a.trim().toLowerCase() !== characterName.trim().toLowerCase()
        )
        const uniqueStudents = [...new Set(nonProfessorAuthors.map((a) => a.trim()))]

        if (uniqueStudents.length > 0) {
          await admin
            .from('mojo_grade_submissions')
            .upsert(
              uniqueStudents.map((student_name) => ({ thread_id: threadId, student_name })),
              { onConflict: 'thread_id,student_name', ignoreDuplicates: true }
            )
        }

        return NextResponse.json({
          success: true,
          professor_mode: true,
          message: 'Professor mode thread updated',
        })
      }
    }

    // Class thread auto-archive: character's post detected among any
    // author on the page — the assignment is submitted.
    if (thread.thread_type === 'class' && result.my_post_found === true) {
      await admin
        .from('mojo_threads')
        .update({
          status: 'archived',
          completed_at: lastCheckedAt,
          fetch_status: 'success',
          last_checked_at: lastCheckedAt,
          thread_mode: 'student',
        })
        .eq('id', threadId)

      return NextResponse.json({
        success: true,
        completed: true,
        message: 'Class thread auto-archived — submission detected',
      })
    }

    const updatePayload: TablesUpdate<'mojo_threads'> = {
      fetch_status: result.fetch_status,
      detected_platform: result.detected_platform,
      last_checked_at: lastCheckedAt,
    }
    if (thread.thread_type === 'class') {
      updatePayload.thread_mode = 'student'
    }
    // Only overwrite last_poster when the scrape returned a usable value —
    // a failed/timed-out fetch returns null and must not destroy the last
    // known-good poster (confirmed root cause: MOJO-DIAG-002/003).
    if (result.last_poster) {
      updatePayload.last_poster = result.last_poster
    }

    await admin
      .from('mojo_threads')
      .update(updatePayload)
      .eq('id', threadId)

    // Report the preserved value back to the caller too — otherwise the
    // client would overwrite its own local state with the failed scrape's
    // null, reintroducing the same bug in the UI until the next page load.
    const effectiveLastPoster = result.last_poster || thread.last_poster

    return NextResponse.json({
      success: true,
      last_poster: effectiveLastPoster,
      fetch_status: result.fetch_status,
      detected_platform: result.detected_platform,
      last_checked_at: lastCheckedAt,
    })
  } catch (err) {
    console.error('refresh-thread error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
