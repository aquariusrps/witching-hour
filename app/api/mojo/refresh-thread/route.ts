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
      .select('id, url, character_id')
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

    const result = await fetchThreadStatus(thread.url)
    const lastCheckedAt = new Date().toISOString()

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
