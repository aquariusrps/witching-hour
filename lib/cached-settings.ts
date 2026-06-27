import { unstable_cache } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/adminClient'

export type BoardNode = {
  id: string
  name: string
  description: string | null
  scope: string
  scope_id: string | null
  parent_id: string | null
  is_category: boolean
  is_rp_board: boolean
  display_order: number
  thread_count: number
  post_count: number
  last_post_at: string | null
  last_post_user_id: string | null
  icon_url: string | null
  discord_announce: boolean
  forced_theme: string | null
  min_level_required: number | null
  children: BoardNode[]
}

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
      .select('id, name, slug, color_hex, description, lore, leader_user_id, leader_title, display_order')
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
        'id, name, description, scope, ' +
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

export const getCachedBoardTree = unstable_cache(
  async (): Promise<BoardNode[]> => {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('boards')
      .select(
        'id, name, description, scope, scope_id, ' +
        'parent_id, is_category, is_rp_board, ' +
        'display_order, thread_count, post_count, ' +
        'last_post_at, last_post_user_id, icon_url, ' +
        'discord_announce, forced_theme, min_level_required'
      )
      .in('scope', ['public', 'rp'])
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error

    const rows = (data ?? []) as unknown as Omit<BoardNode, 'children'>[]

    const nodeMap = new Map<string, BoardNode>()
    for (const row of rows) {
      nodeMap.set(row.id, { ...row, children: [] })
    }

    const roots: BoardNode[] = []
    for (const node of nodeMap.values()) {
      if (node.parent_id && nodeMap.has(node.parent_id)) {
        nodeMap.get(node.parent_id)!.children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  },
  ['board-tree'],
  { revalidate: 300, tags: ['board-tree'] }
)
