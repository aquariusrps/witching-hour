import { NextResponse } from 'next/server'
import { fetchThreadStatus } from '@/lib/mojo/thread-fetchers'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'

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
      .select('id, url, character_id, thread_type')
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
        })
        .eq('id', threadId)

      return NextResponse.json({
        success: true,
        completed: true,
        message: 'Class thread auto-archived — submission detected',
      })
    }

    await admin
      .from('mojo_threads')
      .update({
        last_poster: result.last_poster,
        fetch_status: result.fetch_status,
        detected_platform: result.detected_platform,
        last_checked_at: lastCheckedAt,
      })
      .eq('id', threadId)

    return NextResponse.json({
      success: true,
      last_poster: result.last_poster,
      fetch_status: result.fetch_status,
      detected_platform: result.detected_platform,
      last_checked_at: lastCheckedAt,
    })
  } catch (err) {
    console.error('refresh-thread error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}
