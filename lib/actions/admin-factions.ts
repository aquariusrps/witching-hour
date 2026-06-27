'use server'

import sanitizeHtml from 'sanitize-html'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { hasPermission } from '@/lib/permissions'
import { revalidateTag, revalidatePath } from 'next/cache'

async function requireFactionPermission(userId: string) {
  const ok = await hasPermission(userId, 'manage_factions')
  if (!ok) throw new Error('Forbidden')
}

function sanitizeLore(lore: string | null | undefined): string {
  return sanitizeHtml(lore ?? '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['u', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'style'],
    },
  })
}

export async function createFaction(formData: FormData) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireFactionPermission(user.id) }
  catch { return { error: 'Forbidden' } }

  const name         = formData.get('name') as string
  const slug         = formData.get('slug') as string
  const color_hex    = formData.get('color_hex') as string
  const description  = formData.get('description') as string
  const lore         = formData.get('lore') as string
  const leader_title = formData.get('leader_title') as string

  if (!name?.trim() || !slug?.trim() || !color_hex?.trim()) {
    return { error: 'Name, slug, and color are required' }
  }

  const cleanLore = sanitizeLore(lore)

  const admin = getAdminClient()
  const { error } = await admin.from('factions').insert({
    name:         name.trim(),
    slug:         slug.trim().toLowerCase(),
    color_hex:    color_hex.trim(),
    description:  description?.trim() ?? '',
    lore:         cleanLore,
    leader_title: leader_title?.trim() || 'Keeper',
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'A faction with that name or slug already exists' }
    }
    return { error: 'Failed to create faction' }
  }

  revalidateTag('factions', {})
  revalidatePath('/admin/factions')
  return { success: true }
}

export async function updateFaction(id: string, formData: FormData) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireFactionPermission(user.id) }
  catch { return { error: 'Forbidden' } }

  const lore = formData.get('lore') as string
  const cleanLore = sanitizeLore(lore)

  const admin = getAdminClient()
  const { error } = await admin
    .from('factions')
    .update({
      name:          (formData.get('name') as string)?.trim(),
      slug:          (formData.get('slug') as string)?.trim().toLowerCase(),
      color_hex:     (formData.get('color_hex') as string)?.trim(),
      description:   (formData.get('description') as string)?.trim() ?? '',
      lore:          cleanLore,
      leader_title:  (formData.get('leader_title') as string)?.trim() || 'Keeper',
      display_order: parseInt(formData.get('display_order') as string) || 0,
    })
    .eq('id', id)

  if (error) return { error: 'Failed to update faction' }

  revalidateTag('factions', {})
  revalidatePath('/admin/factions')
  return { success: true }
}

export async function deleteFaction(id: string) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireFactionPermission(user.id) }
  catch { return { error: 'Forbidden' } }

  const admin = getAdminClient()
  const { count } = await admin
    .from('characters')
    .select('id', { count: 'exact', head: true })
    .eq('faction_id', id)

  if (count && count > 0) {
    return {
      error: `Cannot delete — ${count} character(s) are members of this faction. Reassign them first.`,
    }
  }

  const { error } = await admin.from('factions').delete().eq('id', id)
  if (error) return { error: 'Failed to delete faction' }

  revalidateTag('factions', {})
  revalidatePath('/admin/factions')
  return { success: true }
}

export async function reorderFactions(orderedIds: string[]) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireFactionPermission(user.id) }
  catch { return { error: 'Forbidden' } }

  const admin = getAdminClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      admin.from('factions').update({ display_order: index }).eq('id', id)
    )
  )

  revalidateTag('factions', {})
  revalidatePath('/admin/factions')
  return { success: true }
}
