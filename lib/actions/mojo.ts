'use server'

import { isSuperAdmin } from '@/lib/permissions'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getServerClient } from '@/lib/supabase/serverClient'
import { revalidatePath } from 'next/cache'
import type { Tables, TablesUpdate } from '@/types/database'

type MojoRp = Tables<'mojo_rps'>
type MojoCharacter = Tables<'mojo_characters'>
type MojoThread = Tables<'mojo_threads'>

type ActionError = { error: string }

async function requireSuperAdmin(): Promise<string | null> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const ok = await isSuperAdmin(user.id)
  return ok ? user.id : null
}

export async function createMojoRp(
  formData: FormData
): Promise<ActionError | { success: true; rp: MojoRp }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const name = (formData.get('name') as string)?.trim()
  const site_name = (formData.get('site_name') as string)?.trim()
  const site_url = (formData.get('site_url') as string)?.trim() || null
  const color_hex = (formData.get('color_hex') as string)?.trim() || '#c83818'

  if (!name || !site_name) {
    return { error: 'RP name and site name are required' }
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_rps')
    .insert({ name, site_name, site_url, color_hex })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create RP' }

  revalidatePath('/mojo')
  revalidatePath('/mojo/rps')
  return { success: true as const, rp: data }
}

export async function updateMojoRp(
  rpId: string,
  formData: FormData
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const updates: TablesUpdate<'mojo_rps'> = {}

  if (formData.has('name')) updates.name = (formData.get('name') as string)?.trim()
  if (formData.has('site_name')) updates.site_name = (formData.get('site_name') as string)?.trim()
  if (formData.has('site_url')) updates.site_url = (formData.get('site_url') as string)?.trim() || null
  if (formData.has('color_hex')) updates.color_hex = (formData.get('color_hex') as string)?.trim()
  if (formData.has('status')) updates.status = formData.get('status') as string
  if (formData.has('notes_plot')) updates.notes_plot = formData.get('notes_plot') as string
  if (formData.has('notes_partners')) updates.notes_partners = formData.get('notes_partners') as string
  if (formData.has('notes_misc')) updates.notes_misc = formData.get('notes_misc') as string

  const admin = getAdminClient()
  const { error } = await admin.from('mojo_rps').update(updates).eq('id', rpId)

  if (error) return { error: 'Failed to update RP' }

  revalidatePath('/mojo/rps/' + rpId)
  revalidatePath('/mojo')
  return { success: true as const }
}

export async function createMojoCharacter(
  formData: FormData
): Promise<ActionError | { success: true; character: MojoCharacter }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const rp_id = formData.get('rp_id') as string
  const name = (formData.get('name') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim() || null

  if (!rp_id || !name) {
    return { error: 'RP and character name are required' }
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_characters')
    .insert({
      rp_id,
      name,
      bio,
      // faceclaim_id assignment: MOJO-3
      faceclaim_id: null,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create character' }

  revalidatePath('/mojo/rps/' + rp_id)
  return { success: true as const, character: data }
}

export async function updateMojoCharacterStatus(
  characterId: string,
  status: 'active' | 'archived'
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: character } = await admin
    .from('mojo_characters')
    .select('rp_id')
    .eq('id', characterId)
    .single()

  const { error } = await admin
    .from('mojo_characters')
    .update({ status })
    .eq('id', characterId)

  if (error) return { error: 'Failed to update character status' }

  if (character) revalidatePath('/mojo/rps/' + character.rp_id)
  return { success: true as const }
}

export async function updateMojoCharacter(
  charId: string,
  payload: {
    name?: string
    bio?: string
    notes_plot?: string
    notes_partners?: string
    notes_misc?: string
  }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('name' in payload && !payload.name?.trim()) {
    return { error: 'Character name cannot be empty' }
  }

  const admin = getAdminClient()

  const { data: character } = await admin
    .from('mojo_characters')
    .select('rp_id')
    .eq('id', charId)
    .single()

  if (!character) return { error: 'Character not found' }

  const updates: TablesUpdate<'mojo_characters'> = { ...payload }

  const { error } = await admin
    .from('mojo_characters')
    .update(updates)
    .eq('id', charId)

  if (error) return { error: 'Failed to update character' }

  revalidatePath('/mojo/characters/' + charId)
  revalidatePath('/mojo/rps/' + character.rp_id)
  return { success: true as const }
}

export async function createMojoThread(payload: {
  rp_id: string
  character_id: string
  title: string
  url?: string
  partner_names?: string
}): Promise<ActionError | { success: true; thread: MojoThread }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const title = payload.title?.trim()
  if (!title) return { error: 'Thread title is required' }
  if (!payload.rp_id || !payload.character_id) {
    return { error: 'RP and character are required' }
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_threads')
    .insert({
      rp_id: payload.rp_id,
      character_id: payload.character_id,
      title,
      url: payload.url?.trim() || null,
      partner_names: payload.partner_names?.trim() || null,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create thread' }

  revalidatePath('/mojo/characters/' + payload.character_id)
  revalidatePath('/mojo/rps/' + payload.rp_id)
  return { success: true as const, thread: data }
}

export async function updateMojoThread(
  threadId: string,
  payload: { title?: string; url?: string | null; partner_names?: string | null }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('title' in payload && !payload.title?.trim()) {
    return { error: 'Thread title cannot be empty' }
  }

  const admin = getAdminClient()

  const { data: thread } = await admin
    .from('mojo_threads')
    .select('character_id, rp_id')
    .eq('id', threadId)
    .single()

  if (!thread) return { error: 'Thread not found' }

  const updates: TablesUpdate<'mojo_threads'> = { ...payload }

  const { error } = await admin
    .from('mojo_threads')
    .update(updates)
    .eq('id', threadId)

  if (error) return { error: 'Failed to update thread' }

  revalidatePath('/mojo/characters/' + thread.character_id)
  revalidatePath('/mojo/rps/' + thread.rp_id)
  return { success: true as const }
}

export async function updateMojoThreadStatus(
  threadId: string,
  status: 'active' | 'archived'
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: thread } = await admin
    .from('mojo_threads')
    .select('character_id, rp_id')
    .eq('id', threadId)
    .single()

  if (!thread) return { error: 'Thread not found' }

  const { error } = await admin
    .from('mojo_threads')
    .update({ status })
    .eq('id', threadId)

  if (error) return { error: 'Failed to update thread status' }

  revalidatePath('/mojo/characters/' + thread.character_id)
  revalidatePath('/mojo/rps/' + thread.rp_id)
  return { success: true as const }
}

export async function deleteMojoThread(
  threadId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: thread } = await admin
    .from('mojo_threads')
    .select('character_id, rp_id')
    .eq('id', threadId)
    .single()

  if (!thread) return { error: 'Thread not found' }

  const { error } = await admin.from('mojo_threads').delete().eq('id', threadId)

  if (error) return { error: 'Failed to delete thread' }

  revalidatePath('/mojo/characters/' + thread.character_id)
  revalidatePath('/mojo/rps/' + thread.rp_id)
  return { success: true as const }
}
