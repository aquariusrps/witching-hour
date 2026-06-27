import { getAdminClient } from '@/lib/supabase/adminClient'

export async function getUnreadBoardIds(userId: string): Promise<Set<string>> {
  const admin = getAdminClient()

  const { data: boards } = await admin
    .from('boards')
    .select('id')
    .in('scope', ['public', 'rp'])

  const boardIds = (boards ?? []).map(b => b.id)
  if (boardIds.length === 0) return new Set()

  const { data: threads } = await admin
    .from('board_threads')
    .select('id, board_id, updated_at')
    .in('board_id', boardIds)

  if (!threads || threads.length === 0) return new Set()

  const threadIds = threads.map(t => t.id)
  const { data: reads } = await admin
    .from('thread_reads')
    .select('thread_id, last_read_at')
    .eq('user_id', userId)
    .in('thread_id', threadIds)

  const readMap = new Map<string, string>()
  for (const r of reads ?? []) readMap.set(r.thread_id, r.last_read_at)

  const unreadBoardIds = new Set<string>()
  for (const thread of threads) {
    const lastRead = readMap.get(thread.id)
    if (!lastRead || thread.updated_at > lastRead) {
      unreadBoardIds.add(thread.board_id)
    }
  }

  return unreadBoardIds
}
