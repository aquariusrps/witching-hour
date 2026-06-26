import { getAdminClient } from '@/lib/supabase/adminClient'

export async function logSession(userId: string, headers: Headers) {
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  const userAgent = headers.get('user-agent') ?? null
  const admin = getAdminClient()

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const { count } = await admin
    .from('session_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('ip_address', ip)
    .gte('created_at', oneHourAgo)

  if ((count ?? 0) > 0) return

  await admin.from('session_logs').insert({
    user_id: userId,
    ip_address: ip,
    user_agent: userAgent,
  })
}
