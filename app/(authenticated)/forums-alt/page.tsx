import { getCachedBoardTree, type BoardNode } from '@/lib/cached-settings'
import { getUnreadBoardIds } from '@/lib/forums'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import ForumsAltLayout from './ForumsAltLayout'

function computeUnreadSet(nodes: BoardNode[], rawUnread: Set<string>): Set<string> {
  const result = new Set<string>()
  function walk(node: BoardNode): boolean {
    let hasUnread = rawUnread.has(node.id)
    for (const child of node.children) {
      if (walk(child)) hasUnread = true
    }
    if (hasUnread) result.add(node.id)
    return hasUnread
  }
  for (const node of nodes) walk(node)
  return result
}

function collectUserIds(nodes: BoardNode[]): string[] {
  const ids = new Set<string>()
  function walk(node: BoardNode) {
    if (node.last_post_user_id) ids.add(node.last_post_user_id)
    for (const child of node.children) walk(child)
  }
  for (const node of nodes) walk(node)
  return [...ids]
}

export default async function ForumsAltPage() {
  const supabase = await getServerClient()
  const [boardTree, { data: { user } }] = await Promise.all([
    getCachedBoardTree(),
    supabase.auth.getUser(),
  ])

  const unreadBoardIds = await getUnreadBoardIds(user!.id)
  const unreadSet = computeUnreadSet(boardTree, unreadBoardIds)

  // Batch-fetch display names for last post users (R12 — public.users only)
  const userIds = collectUserIds(boardTree)
  const userMap = new Map<string, string>()
  if (userIds.length > 0) {
    const admin = getAdminClient()
    const { data: userRows } = await admin
      .from('users')
      .select('id, display_name')
      .in('id', userIds)
    for (const u of userRows ?? []) userMap.set(u.id, u.display_name)
  }

  return (
    <ForumsAltLayout
      boardTree={boardTree}
      unreadSet={unreadSet}
      userMap={userMap}
    />
  )
}
