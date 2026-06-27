import { unstable_cache } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/adminClient'

export const getCachedSiteSettings = unstable_cache(
  async () => {
    const admin = getAdminClient()
    const { data } = await admin.from('site_settings').select('key, value')
    const map: Record<string, string> = {}
    for (const row of data ?? []) map[row.key] = row.value
    return map
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 300 }
)

export const getCachedFactions = unstable_cache(
  async () => {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('factions')
      .select('id, name, slug, color_hex, description, lore, leader_user_id, display_order')
      .order('display_order', { ascending: true })
    if (error) throw error
    return data ?? []
  },
  ['factions'],
  { revalidate: 3600, tags: ['factions'] }
)

export const getCachedCharacterLevelThresholds = unstable_cache(
  async () => {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('character_level_thresholds')
      .select('level, xp_required, label, unlocks_description')
      .order('level', { ascending: true })
    if (error) throw error
    return data ?? []
  },
  ['level-thresholds'],
  { revalidate: 3600, tags: ['level-thresholds'] }
)

export const getCachedPublicBoards = unstable_cache(
  async () => {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('boards')
      .select(
        'id, name, description, category, scope, ' +
        'is_rp_board, forced_theme, min_level_required, ' +
        'discord_announce, display_order'
      )
      .in('scope', ['public', 'rp'])
      .order('display_order', { ascending: true })
    if (error) throw error
    return data ?? []
  },
  ['public-boards'],
  { revalidate: 300, tags: ['boards'] }
)
