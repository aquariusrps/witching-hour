import { getAdminClient } from '@/lib/supabase/adminClient'

export async function getUnreadWhisperCount(userId: string): Promise<number> {
  const admin = getAdminClient()
  const { count } = await admin
    .from('mail_messages')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null)
    .eq('deleted_by_recipient', false)
  return count ?? 0
}
