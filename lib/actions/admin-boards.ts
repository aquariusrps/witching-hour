'use server'

import { revalidateTag } from 'next/cache'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { hasPermission } from '@/lib/permissions'
import type { TablesUpdate } from '@/types/database'

const VALID_SCOPES = ['public', 'rp', 'faction', 'staff', 'admin'] as const
type BoardScope = typeof VALID_SCOPES[number]

const VALID_THEMES = [
  'blood-moon', 'silver-onyx', 'midnight-garden',
  'crimson-athenaeum', 'blackthorn-parchment', 'the-craft-1996',
] as const

function invalidateBoards() {
  revalidateTag('board-tree', {})
  revalidateTag('boards', {})
}

async function requireBoardPermission(userId: string) {
  const ok = await hasPermission(userId, 'manage_boards')
  if (!ok) throw new Error('Forbidden')
}

// ── createBoard ──────────────────────────────────────────────────────────────

export type CreateBoardInput = {
  name: string
  description?: string
  parent_id?: string | null
  is_category: boolean
  scope: BoardScope
  scope_id?: string | null
  is_rp_board?: boolean
  discord_announce?: boolean
  min_level_required?: number | null
  forced_theme?: string | null
  display_order?: number
  icon_url?: string | null
}

export async function createBoard(
  input: CreateBoardInput
): Promise<{ error: string } | { success: true; id: string }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireBoardPermission(user.id) }
  catch { return { error: 'Insufficient permissions' } }

  const name = input.name?.trim()
  if (!name) return { error: 'Board name is required' }

  if (input.is_category && input.parent_id) {
    return { error: 'Categories must be root-level — parent_id must be null for categories' }
  }

  if (input.is_category && input.scope !== 'public') {
    return { error: 'Categories must use public scope' }
  }

  if (!VALID_SCOPES.includes(input.scope)) {
    return { error: 'Invalid scope value' }
  }

  if (input.scope === 'faction' && !input.scope_id) {
    return { error: 'scope_id (faction) is required when scope is faction' }
  }

  const admin = getAdminClient()

  if (input.scope_id) {
    const { data: faction } = await admin
      .from('factions')
      .select('id')
      .eq('id', input.scope_id)
      .maybeSingle()
    if (!faction) return { error: 'Faction not found' }
  }

  const { data, error } = await admin
    .from('boards')
    .insert({
      name,
      description: input.description?.trim() || null,
      parent_id: input.is_category ? null : (input.parent_id ?? null),
      is_category: input.is_category,
      scope: input.scope,
      scope_id: input.scope_id ?? null,
      is_rp_board: input.is_rp_board ?? false,
      discord_announce: input.discord_announce ?? false,
      min_level_required: input.min_level_required ?? null,
      forced_theme: input.forced_theme ?? null,
      display_order: input.display_order ?? 0,
      icon_url: input.icon_url ?? null,
    })
    .select('id')
    .single()

  if (error) return { error: 'Failed to create board: ' + error.message }

  invalidateBoards()
  return { success: true, id: data.id }
}

// ── updateBoard ──────────────────────────────────────────────────────────────

export type UpdateBoardData = Partial<{
  name: string
  description: string | null
  icon_url: string | null
  scope: BoardScope
  scope_id: string | null
  is_rp_board: boolean
  discord_announce: boolean
  min_level_required: number | null
  forced_theme: string | null
  display_order: number
}>

export async function updateBoard(
  id: string,
  data: UpdateBoardData
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireBoardPermission(user.id) }
  catch { return { error: 'Insufficient permissions' } }

  const admin = getAdminClient()
  const { data: board } = await admin
    .from('boards')
    .select('id, scope, scope_id')
    .eq('id', id)
    .maybeSingle()
  if (!board) return { error: 'Board not found' }

  // Build clean update object (strip disallowed fields at runtime)
  const cleanData: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    if (key !== 'parent_id' && key !== 'is_category') {
      cleanData[key] = val
    }
  }

  if (cleanData.name !== undefined) {
    const trimmed = (cleanData.name as string)?.trim()
    if (!trimmed) return { error: 'Board name cannot be empty' }
    cleanData.name = trimmed
  }

  if (cleanData.scope !== undefined) {
    if (!VALID_SCOPES.includes(cleanData.scope as BoardScope)) {
      return { error: 'Invalid scope value' }
    }
    if (cleanData.scope === 'faction' && !cleanData.scope_id && !board.scope_id) {
      return { error: 'scope_id (faction) is required when scope is faction' }
    }
  }

  if (cleanData.forced_theme !== undefined && cleanData.forced_theme !== null) {
    if (!VALID_THEMES.includes(cleanData.forced_theme as typeof VALID_THEMES[number])) {
      return { error: 'Invalid theme value' }
    }
  }

  const { error } = await admin
    .from('boards')
    .update(cleanData as TablesUpdate<'boards'>)
    .eq('id', id)

  if (error) return { error: 'Failed to update board: ' + error.message }

  invalidateBoards()
  return { success: true }
}

// ── deleteBoard ──────────────────────────────────────────────────────────────

export async function deleteBoard(
  id: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireBoardPermission(user.id) }
  catch { return { error: 'Insufficient permissions' } }

  const admin = getAdminClient()

  const { data: board } = await admin
    .from('boards')
    .select('id, name, thread_count')
    .eq('id', id)
    .maybeSingle()
  if (!board) return { error: 'Board not found' }

  if (board.thread_count > 0) {
    return {
      error: 'This board contains threads. Move or delete all threads before deleting this board.',
    }
  }

  const { data: children } = await admin
    .from('boards')
    .select('id, thread_count')
    .eq('parent_id', id)

  if (children && children.some((c) => c.thread_count > 0)) {
    return {
      error: 'One or more sub-boards contain threads. Clear all threads before deleting.',
    }
  }

  const { error } = await admin.from('boards').delete().eq('id', id)
  if (error) return { error: 'Failed to delete board: ' + error.message }

  invalidateBoards()
  return { success: true }
}

// ── reorderBoards ────────────────────────────────────────────────────────────

export async function reorderBoards(
  items: Array<{ id: string; display_order: number }>
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireBoardPermission(user.id) }
  catch { return { error: 'Insufficient permissions' } }

  if (!items.length) return { success: true }

  const admin = getAdminClient()
  const ids = items.map((i) => i.id)

  const { data: rows } = await admin
    .from('boards')
    .select('id, parent_id')
    .in('id', ids)

  if (!rows || rows.length !== ids.length) {
    return { error: 'One or more board IDs not found' }
  }

  const parentIds = new Set(rows.map((r) => r.parent_id))
  if (parentIds.size > 1) {
    return { error: 'Cannot reorder boards across different parents' }
  }

  for (const item of items) {
    const { error } = await admin
      .from('boards')
      .update({ display_order: item.display_order })
      .eq('id', item.id)
    if (error) return { error: 'Failed to update order: ' + error.message }
  }

  invalidateBoards()
  return { success: true }
}

// ── uploadBoardIcon ──────────────────────────────────────────────────────────

export async function uploadBoardIcon(
  boardId: string,
  url: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireBoardPermission(user.id) }
  catch { return { error: 'Insufficient permissions' } }

  if (!url || !url.startsWith('https://')) {
    return { error: 'Invalid icon URL' }
  }

  const admin = getAdminClient()
  const { data: board } = await admin
    .from('boards')
    .select('id')
    .eq('id', boardId)
    .maybeSingle()
  if (!board) return { error: 'Board not found' }

  const { error } = await admin
    .from('boards')
    .update({ icon_url: url })
    .eq('id', boardId)
  if (error) return { error: 'Failed to save icon URL: ' + error.message }

  invalidateBoards()
  return { success: true }
}
