import { getServerClient } from '@/lib/supabase/serverClient'

export async function getUserRow(userId: string | undefined) {
  if (!userId) return null
  const supabase = await getServerClient()
  const { data } = await supabase
    .from('users')
    .select('id, display_name, avatar_url, theme_preference, active_character_id')
    .eq('id', userId)
    .single()
  return data ?? null
}
