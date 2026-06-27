'use server'

import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getCachedSiteSettings } from '@/lib/cached-settings'
import { hasPermission } from '@/lib/permissions'
import { revalidateTag } from 'next/cache'
import { CANONS } from '@/lib/canons'

type CreateThreadInput = {
  boardId: string
  title: string
  canonSource?: string | null
  isSpoiler?: boolean
  threadType?: 'standard' | 'combat' | 'ascension'
}

export async function createThread(
  input: CreateThreadInput
): Promise<{ error: string } | { success: true; threadId: string }> {
  // 1. Authenticate
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 2. Fetch board row
  const admin = getAdminClient()
  const { data: board } = await admin
    .from('boards')
    .select('id, name, staff_only_threads, discord_announce, is_rp_board, scope')
    .eq('id', input.boardId)
    .single()
  if (!board) return { error: 'Board not found' }

  // 3. Validate title
  const trimmedTitle = input.title.trim()
  if (!trimmedTitle) return { error: 'Title is required' }

  const settings = await getCachedSiteSettings()
  const maxLen = parseInt(settings['max_thread_title_length'] ?? '200', 10)
  if (trimmedTitle.length > maxLen)
    return { error: `Title must be ${maxLen} characters or fewer` }

  // 4. staff_only_threads gate — hasPermission uses getAdminClient() internally, no two-cookie conflict
  if (board.staff_only_threads) {
    const canPost = await hasPermission(user.id, 'moderate_boards')
    if (!canPost) return { error: 'Only staff can create threads in this board' }
  }

  // 5. Validate canon_source — CANONS.db values are the allowed set; null and empty string are valid
  const validCanonSources = new Set<string>(CANONS.map(c => c.db))
  if (input.canonSource && !validCanonSources.has(input.canonSource)) {
    return { error: 'Invalid canon source' }
  }

  // 6. Insert thread
  const { data: thread, error: insertError } = await admin
    .from('board_threads')
    .insert({
      board_id: input.boardId,
      title: trimmedTitle,
      author_id: user.id,
      canon_source: input.canonSource ?? null,
      is_spoiler: input.isSpoiler ?? false,
      thread_type: input.threadType ?? 'standard',
      is_pinned: false,
      is_locked: false,
    })
    .select('id')
    .single()

  if (insertError || !thread) return { error: 'Failed to create thread' }

  // 7. Discord webhook — fire-and-forget, never blocks thread creation
  const webhookUrl = settings['discord_webhook_url']
  if (board.discord_announce && webhookUrl) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    void fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: null,
        embeds: [{
          title: trimmedTitle,
          url: `${siteUrl}/forums/${input.boardId}/${thread.id}`,
          description: `New thread in **${board.name}**`,
          color: 0xc83818,
          footer: { text: input.canonSource ?? 'All canons' },
        }],
      }),
    }).catch(() => {})
  }

  // 8. Invalidate board caches
  revalidateTag('board-tree', {})
  revalidateTag('boards', {})
  revalidateTag('board-tree-admin', {})

  // 9. Return success
  return { success: true, threadId: thread.id }
}
