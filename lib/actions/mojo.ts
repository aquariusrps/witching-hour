'use server'

import { isSuperAdmin } from '@/lib/permissions'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getServerClient } from '@/lib/supabase/serverClient'
import { revalidatePath } from 'next/cache'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { registerImageToken, getProxyUrl } from '@/lib/mojo/proxy'
import {
  getMojoFamiliarConversations,
  createMojoFamiliarConversation,
  deleteMojoFamiliarConversation,
  updateMojoFamiliarConversationTitle,
} from '@/lib/db/mojo'

type MojoRp = Tables<'mojo_rps'>
type MojoCharacter = Tables<'mojo_characters'>
type MojoThread = Tables<'mojo_threads'>
type MojoFaceclaim = Tables<'mojo_faceclaims'>
type MojoResource = Tables<'mojo_resources'>
type MojoSnippet = Tables<'mojo_snippets'>
type MojoWishlist = Tables<'mojo_wishlist'>
type MojoPartner = Tables<'mojo_partners'>
type MojoImageStack = Tables<'mojo_image_stacks'>
type MojoImageStackMember = Tables<'mojo_image_stack_members'>
type MojoAvatar = Tables<'mojo_avatars'>
type MojoImageFolder = Tables<'mojo_image_folders'>
type MojoPersonalImage = Tables<'mojo_personal_images'>
type MojoWanted = Tables<'mojo_wanted'>

const SNIPPET_TYPES = ['general', 'app_code', 'template', 'formatting', 'other']
const WISHLIST_TYPES = ['character_concept', 'plot_idea', 'fandom', 'other']
const ROTATION_MODES = ['truly_random', 'weighted', 'sequential', 'no_repeat']

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
  reply_order?: string
  thread_type?: 'rp' | 'class' | 'upcoming'
  assignment_due_at?: string | null
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
      reply_order: payload.reply_order?.trim() || null,
      thread_type: payload.thread_type ?? 'rp',
      assignment_due_at: payload.assignment_due_at ?? null,
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
  payload: {
    title?: string
    url?: string | null
    partner_names?: string | null
    reply_order?: string | null
    thread_type?: 'rp' | 'class' | 'upcoming'
    assignment_due_at?: string | null
  }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('title' in payload && !payload.title?.trim()) {
    return { error: 'Thread title cannot be empty' }
  }

  const admin = getAdminClient()

  const { data: thread } = await admin
    .from('mojo_threads')
    .select('character_id, rp_id, thread_type')
    .eq('id', threadId)
    .single()

  if (!thread) return { error: 'Thread not found' }

  // Auto-transition: upcoming + URL provided → active RP (silent, no
  // prompt). An upcoming thread never reaches the display layer still
  // typed as 'upcoming' once it has a URL.
  let resolvedThreadType = payload.thread_type ?? thread.thread_type
  if (thread.thread_type === 'upcoming' && payload.url?.trim()) {
    resolvedThreadType = 'rp'
  }

  const updates: TablesUpdate<'mojo_threads'> = {
    ...payload,
    thread_type: resolvedThreadType,
  }

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

// ─── FACECLAIM ACTIONS ─────────────────────────────────────

export async function createMojoFaceclaim(payload: {
  name: string
  notes?: string
}): Promise<ActionError | { success: true; faceclaim: MojoFaceclaim }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const name = payload.name?.trim()
  if (!name) return { error: 'Faceclaim name is required' }

  const admin = getAdminClient()

  const { data: existing } = await admin
    .from('mojo_faceclaims')
    .select('id')
    .ilike('name', name)
    .maybeSingle()

  if (existing) return { error: 'A faceclaim with that name already exists.' }

  const { data, error } = await admin
    .from('mojo_faceclaims')
    .insert({ name, notes: payload.notes?.trim() || null })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create faceclaim' }

  revalidatePath('/mojo/faceclaims')
  return { success: true as const, faceclaim: data }
}

export async function updateMojoFaceclaim(
  fcId: string,
  payload: { name?: string; notes?: string }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  if ('name' in payload) {
    const name = payload.name?.trim()
    if (!name) return { error: 'Faceclaim name cannot be empty' }

    const { data: existing } = await admin
      .from('mojo_faceclaims')
      .select('id')
      .ilike('name', name)
      .neq('id', fcId)
      .maybeSingle()

    if (existing) return { error: 'A faceclaim with that name already exists.' }
  }

  const updates: TablesUpdate<'mojo_faceclaims'> = { ...payload }

  const { error } = await admin
    .from('mojo_faceclaims')
    .update(updates)
    .eq('id', fcId)

  if (error) return { error: 'Failed to update faceclaim' }

  revalidatePath('/mojo/faceclaims')
  revalidatePath('/mojo/faceclaims/' + fcId)
  return { success: true as const }
}

export async function deleteMojoFaceclaim(
  fcId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  await admin.from('mojo_characters').update({ faceclaim_id: null }).eq('faceclaim_id', fcId)
  await admin.from('mojo_resources').update({ faceclaim_id: null }).eq('faceclaim_id', fcId)

  const { error } = await admin.from('mojo_faceclaims').delete().eq('id', fcId)

  if (error) return { error: 'Failed to delete faceclaim' }

  revalidatePath('/mojo/faceclaims')
  return { success: true as const }
}

export async function assignFaceclaimToCharacter(
  characterId: string,
  faceclaimId: string | null
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: character } = await admin
    .from('mojo_characters')
    .select('rp_id')
    .eq('id', characterId)
    .single()

  if (!character) return { error: 'Character not found' }

  const { error } = await admin
    .from('mojo_characters')
    .update({ faceclaim_id: faceclaimId })
    .eq('id', characterId)

  if (error) return { error: 'Failed to assign faceclaim' }

  revalidatePath('/mojo/characters/' + characterId)
  revalidatePath('/mojo/rps/' + character.rp_id)
  return { success: true as const }
}

export async function createAndAssignFaceclaim(
  name: string,
  characterId: string
): Promise<ActionError | { success: true; faceclaimId: string }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const trimmed = name?.trim()
  if (!trimmed) return { error: 'Faceclaim name is required' }

  const admin = getAdminClient()

  const { data: existing } = await admin
    .from('mojo_faceclaims')
    .select('id')
    .ilike('name', trimmed)
    .maybeSingle()

  let faceclaimId = existing?.id ?? null

  if (!faceclaimId) {
    const { data: created, error: createError } = await admin
      .from('mojo_faceclaims')
      .insert({ name: trimmed })
      .select('id')
      .single()

    if (createError || !created) return { error: 'Failed to create faceclaim' }
    faceclaimId = created.id
  }

  const { error: assignError } = await admin
    .from('mojo_characters')
    .update({ faceclaim_id: faceclaimId })
    .eq('id', characterId)

  if (assignError) return { error: 'Failed to assign faceclaim' }

  revalidatePath('/mojo/characters/' + characterId)
  revalidatePath('/mojo/faceclaims')
  return { success: true as const, faceclaimId }
}

// ─── RESOURCE ACTIONS ──────────────────────────────────────

export async function createMojoResource(payload: {
  faceclaim_id?: string | null
  character_id?: string | null
  title: string
  type: 'text' | 'link' | 'snippet' | 'image' | 'gif'
  content?: string | null
  url?: string | null
  storage_path?: string | null
  proxy_token?: string | null
}): Promise<ActionError | { success: true; resource: MojoResource }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const title = payload.title?.trim()
  if (!title) return { error: 'Title is required' }

  if ((payload.type === 'text' || payload.type === 'snippet') && !payload.content?.trim()) {
    return { error: 'Content is required' }
  }
  if (payload.type === 'link' && !payload.url?.trim()) {
    return { error: 'URL is required' }
  }
  if ((payload.type === 'image' || payload.type === 'gif') && !payload.storage_path?.trim()) {
    return { error: 'Storage path is required' }
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_resources')
    .insert({
      faceclaim_id: payload.faceclaim_id ?? null,
      character_id: payload.character_id ?? null,
      title,
      type: payload.type,
      content: payload.content?.trim() || null,
      url: payload.url?.trim() || null,
      storage_path: payload.storage_path?.trim() || null,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create resource' }

  if (payload.faceclaim_id) revalidatePath('/mojo/faceclaims/' + payload.faceclaim_id)
  if (payload.character_id) revalidatePath('/mojo/characters/' + payload.character_id)
  return { success: true as const, resource: data }
}

export async function updateMojoResource(
  resourceId: string,
  payload: { title?: string; content?: string | null; url?: string | null }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('title' in payload && !payload.title?.trim()) {
    return { error: 'Title cannot be empty' }
  }

  const admin = getAdminClient()

  const { data: resource } = await admin
    .from('mojo_resources')
    .select('faceclaim_id, character_id')
    .eq('id', resourceId)
    .single()

  if (!resource) return { error: 'Resource not found' }

  const updates: TablesUpdate<'mojo_resources'> = { ...payload }

  const { error } = await admin
    .from('mojo_resources')
    .update(updates)
    .eq('id', resourceId)

  if (error) return { error: 'Failed to update resource' }

  if (resource.faceclaim_id) revalidatePath('/mojo/faceclaims/' + resource.faceclaim_id)
  if (resource.character_id) revalidatePath('/mojo/characters/' + resource.character_id)
  return { success: true as const }
}

export async function deleteMojoResource(
  resourceId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: resource } = await admin
    .from('mojo_resources')
    .select('faceclaim_id, character_id, storage_path')
    .eq('id', resourceId)
    .single()

  if (!resource) return { error: 'Resource not found' }

  if (resource.storage_path) {
    const { error: storageError } = await admin.storage
      .from('mojo-private')
      .remove([resource.storage_path])
    if (storageError) {
      console.error('Failed to delete storage object:', storageError)
    }
  }

  const { error } = await admin.from('mojo_resources').delete().eq('id', resourceId)

  if (error) return { error: 'Failed to delete resource' }

  if (resource.faceclaim_id) revalidatePath('/mojo/faceclaims/' + resource.faceclaim_id)
  if (resource.character_id) revalidatePath('/mojo/characters/' + resource.character_id)
  return { success: true as const }
}

export async function linkResourceToCharacter(
  resourceId: string,
  characterId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { error } = await admin
    .from('mojo_character_resources')
    .upsert(
      { character_id: characterId, resource_id: resourceId },
      { onConflict: 'character_id,resource_id', ignoreDuplicates: true }
    )

  if (error) return { error: 'Failed to link resource' }

  revalidatePath('/mojo/characters/' + characterId)
  return { success: true as const }
}

export async function unlinkResourceFromCharacter(
  resourceId: string,
  characterId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { error } = await admin
    .from('mojo_character_resources')
    .delete()
    .eq('character_id', characterId)
    .eq('resource_id', resourceId)

  if (error) return { error: 'Failed to unlink resource' }

  revalidatePath('/mojo/characters/' + characterId)
  return { success: true as const }
}

export async function registerUploadedImage(payload: {
  storagePath: string
  mimeType: string
  label: string
  expiresAt: string | null
  faceclaim_id?: string | null
  character_id?: string | null
  title: string
  type: 'image' | 'gif'
}): Promise<ActionError | { success: true; proxyUrl: string; resource: MojoResource }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const title = payload.title?.trim()
  if (!title) return { error: 'Title is required' }

  let token: string
  try {
    token = await registerImageToken(
      payload.storagePath,
      payload.mimeType,
      payload.expiresAt ? new Date(payload.expiresAt) : null,
      payload.label
    )
  } catch {
    return { error: 'Failed to register image token' }
  }

  const proxyUrl = getProxyUrl(token)

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_resources')
    .insert({
      faceclaim_id: payload.faceclaim_id ?? null,
      character_id: payload.character_id ?? null,
      title,
      type: payload.type,
      storage_path: payload.storagePath,
      public_url: proxyUrl,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to save resource' }

  if (payload.faceclaim_id) revalidatePath('/mojo/faceclaims/' + payload.faceclaim_id)
  if (payload.character_id) revalidatePath('/mojo/characters/' + payload.character_id)
  return { success: true as const, proxyUrl, resource: data }
}

// ─── SNIPPET ACTIONS ───────────────────────────────────────

export async function createMojoSnippet(payload: {
  title: string
  content: string
  type: string
  tags?: string
}): Promise<ActionError | { success: true; snippet: MojoSnippet }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const title = payload.title?.trim()
  const content = payload.content?.trim()
  if (!title) return { error: 'Title is required' }
  if (!content) return { error: 'Content is required' }
  if (!SNIPPET_TYPES.includes(payload.type)) return { error: 'Invalid snippet type' }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_snippets')
    .insert({
      title,
      content,
      type: payload.type,
      tags: payload.tags?.trim() || null,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create snippet' }

  revalidatePath('/mojo/library')
  return { success: true as const, snippet: data }
}

export async function updateMojoSnippet(
  snippetId: string,
  payload: { title?: string; content?: string; type?: string; tags?: string }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('title' in payload && !payload.title?.trim()) {
    return { error: 'Title cannot be empty' }
  }
  if ('content' in payload && !payload.content?.trim()) {
    return { error: 'Content cannot be empty' }
  }
  if (payload.type && !SNIPPET_TYPES.includes(payload.type)) {
    return { error: 'Invalid snippet type' }
  }

  const admin = getAdminClient()
  const updates: TablesUpdate<'mojo_snippets'> = { ...payload }

  const { error } = await admin
    .from('mojo_snippets')
    .update(updates)
    .eq('id', snippetId)

  if (error) return { error: 'Failed to update snippet' }

  revalidatePath('/mojo/library')
  return { success: true as const }
}

export async function deleteMojoSnippet(
  snippetId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()
  const { error } = await admin.from('mojo_snippets').delete().eq('id', snippetId)

  if (error) return { error: 'Failed to delete snippet' }

  revalidatePath('/mojo/library')
  return { success: true as const }
}

// ─── WISHLIST ACTIONS ──────────────────────────────────────

export async function createMojoWishlistItem(payload: {
  title: string
  notes?: string
  type: string
  image_token?: string | null
}): Promise<ActionError | { success: true; item: MojoWishlist }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const title = payload.title?.trim()
  if (!title) return { error: 'Title is required' }
  if (!WISHLIST_TYPES.includes(payload.type)) return { error: 'Invalid wishlist type' }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_wishlist')
    .insert({
      title,
      notes: payload.notes?.trim() || null,
      type: payload.type,
      image_token: payload.image_token ?? null,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create wishlist item' }

  revalidatePath('/mojo/wishlist')
  return { success: true as const, item: data }
}

export async function updateMojoWishlistItem(
  itemId: string,
  payload: { title?: string; notes?: string; type?: string; image_token?: string | null }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('title' in payload && !payload.title?.trim()) {
    return { error: 'Title cannot be empty' }
  }
  if (payload.type && !WISHLIST_TYPES.includes(payload.type)) {
    return { error: 'Invalid wishlist type' }
  }

  const admin = getAdminClient()
  const updates: TablesUpdate<'mojo_wishlist'> = { ...payload }

  const { error } = await admin
    .from('mojo_wishlist')
    .update(updates)
    .eq('id', itemId)

  if (error) return { error: 'Failed to update wishlist item' }

  revalidatePath('/mojo/wishlist')
  return { success: true as const }
}

export async function updateMojoWishlistStatus(
  itemId: string,
  status: 'idea' | 'active' | 'shelved'
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()
  const { error } = await admin
    .from('mojo_wishlist')
    .update({ status })
    .eq('id', itemId)

  if (error) return { error: 'Failed to update status' }

  revalidatePath('/mojo/wishlist')
  return { success: true as const }
}

export async function deleteMojoWishlistItem(
  itemId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: item } = await admin
    .from('mojo_wishlist')
    .select('image_token')
    .eq('id', itemId)
    .single()

  if (item?.image_token) {
    const { data: tokenRow } = await admin
      .from('mojo_image_tokens')
      .select('storage_path')
      .eq('token', item.image_token)
      .single()

    if (tokenRow) {
      const { error: storageError } = await admin.storage
        .from('mojo-private')
        .remove([tokenRow.storage_path])
      if (storageError) {
        console.error('Failed to delete storage object:', storageError)
      }
    }

    await admin.from('mojo_image_tokens').delete().eq('token', item.image_token)
  }

  const { error } = await admin.from('mojo_wishlist').delete().eq('id', itemId)

  if (error) return { error: 'Failed to delete wishlist item' }

  revalidatePath('/mojo/wishlist')
  return { success: true as const }
}

export async function registerWishlistImage(payload: {
  storage_path: string
  mime_type: string
  item_id?: string
}): Promise<ActionError | { success: true; token: string; proxyUrl: string }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const storagePath = payload.storage_path?.trim()
  if (!storagePath) return { error: 'Storage path is required' }

  const token = await registerImageToken(storagePath, payload.mime_type, null, 'wishlist-ref')
  const proxyUrl = getProxyUrl(token)

  revalidatePath('/mojo/wishlist')
  return { success: true as const, token, proxyUrl }
}

export async function removeWishlistImage(
  itemId: string,
  token: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: tokenRow } = await admin
    .from('mojo_image_tokens')
    .select('storage_path')
    .eq('token', token)
    .single()

  if (tokenRow) {
    const { error: storageError } = await admin.storage
      .from('mojo-private')
      .remove([tokenRow.storage_path])
    if (storageError) {
      console.error('Failed to delete storage object:', storageError)
    }
  }

  await admin.from('mojo_image_tokens').delete().eq('token', token)

  const { error } = await admin
    .from('mojo_wishlist')
    .update({ image_token: null })
    .eq('id', itemId)

  if (error) return { error: 'Failed to remove image' }

  revalidatePath('/mojo/wishlist')
  return { success: true as const }
}

// ─── PARTNER ACTIONS ───────────────────────────────────────

export async function createMojoPartner(payload: {
  handle: string
  sites?: string
  pace_notes?: string
  style_notes?: string
  history_notes?: string
}): Promise<ActionError | { success: true; partner: MojoPartner }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const handle = payload.handle?.trim()
  if (!handle) return { error: 'Handle is required' }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_partners')
    .insert({
      handle,
      sites: payload.sites?.trim() || null,
      pace_notes: payload.pace_notes?.trim() || null,
      style_notes: payload.style_notes?.trim() || null,
      history_notes: payload.history_notes?.trim() || null,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create partner' }

  revalidatePath('/mojo/partners')
  return { success: true as const, partner: data }
}

export async function updateMojoPartner(
  partnerId: string,
  payload: {
    handle?: string
    sites?: string
    pace_notes?: string
    style_notes?: string
    history_notes?: string
  }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('handle' in payload && !payload.handle?.trim()) {
    return { error: 'Handle cannot be empty' }
  }

  const admin = getAdminClient()
  const updates: TablesUpdate<'mojo_partners'> = { ...payload }

  const { error } = await admin
    .from('mojo_partners')
    .update(updates)
    .eq('id', partnerId)

  if (error) return { error: 'Failed to update partner' }

  revalidatePath('/mojo/partners')
  return { success: true as const }
}

export async function deleteMojoPartner(
  partnerId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()
  const { error } = await admin.from('mojo_partners').delete().eq('id', partnerId)

  if (error) return { error: 'Failed to delete partner' }

  revalidatePath('/mojo/partners')
  return { success: true as const }
}

// ─── IMAGE STACK ACTIONS ───────────────────────────────────

export async function createMojoImageStack(payload: {
  label: string
  rotation_mode: 'truly_random' | 'weighted' | 'sequential' | 'no_repeat'
  character_id?: string | null
  faceclaim_id?: string | null
  expires_at?: string | null
}): Promise<ActionError | { success: true; stack: MojoImageStack }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const label = payload.label?.trim()
  if (!label) return { error: 'Label is required' }
  if (!ROTATION_MODES.includes(payload.rotation_mode)) {
    return { error: 'Invalid rotation mode' }
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_image_stacks')
    .insert({
      label,
      rotation_mode: payload.rotation_mode,
      character_id: payload.character_id ?? null,
      faceclaim_id: payload.faceclaim_id ?? null,
      expires_at: payload.expires_at ?? null,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create stack' }

  revalidatePath('/mojo/stacks')
  if (payload.character_id) revalidatePath('/mojo/characters/' + payload.character_id)
  if (payload.faceclaim_id) revalidatePath('/mojo/faceclaims/' + payload.faceclaim_id)
  return { success: true as const, stack: data }
}

export async function updateMojoImageStack(
  stackId: string,
  payload: {
    label?: string
    rotation_mode?: 'truly_random' | 'weighted' | 'sequential' | 'no_repeat'
    expires_at?: string | null
    character_id?: string | null
    faceclaim_id?: string | null
  }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('label' in payload && !payload.label?.trim()) {
    return { error: 'Label cannot be empty' }
  }
  if (payload.rotation_mode && !ROTATION_MODES.includes(payload.rotation_mode)) {
    return { error: 'Invalid rotation mode' }
  }

  const admin = getAdminClient()

  const { data: stack } = await admin
    .from('mojo_image_stacks')
    .select('character_id, faceclaim_id')
    .eq('id', stackId)
    .single()

  if (!stack) return { error: 'Stack not found' }

  const updates: TablesUpdate<'mojo_image_stacks'> = { ...payload }

  const { error } = await admin
    .from('mojo_image_stacks')
    .update(updates)
    .eq('id', stackId)

  if (error) return { error: 'Failed to update stack' }

  revalidatePath('/mojo/stacks')
  if (stack.character_id) revalidatePath('/mojo/characters/' + stack.character_id)
  if (stack.faceclaim_id) revalidatePath('/mojo/faceclaims/' + stack.faceclaim_id)
  if (payload.character_id) revalidatePath('/mojo/characters/' + payload.character_id)
  if (payload.faceclaim_id) revalidatePath('/mojo/faceclaims/' + payload.faceclaim_id)
  return { success: true as const }
}

export async function deleteMojoImageStack(
  stackId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: stack } = await admin
    .from('mojo_image_stacks')
    .select('character_id, faceclaim_id')
    .eq('id', stackId)
    .single()

  if (!stack) return { error: 'Stack not found' }

  await admin
    .from('mojo_characters')
    .update({ primary_stack_id: null })
    .eq('primary_stack_id', stackId)

  const { error } = await admin.from('mojo_image_stacks').delete().eq('id', stackId)

  if (error) return { error: 'Failed to delete stack' }

  revalidatePath('/mojo/stacks')
  if (stack.character_id) revalidatePath('/mojo/characters/' + stack.character_id)
  if (stack.faceclaim_id) revalidatePath('/mojo/faceclaims/' + stack.faceclaim_id)
  return { success: true as const }
}

export async function addMemberToStack(payload: {
  stack_id: string
  storage_path: string
  mime_type: string
  weight?: number
  display_order?: number
}): Promise<ActionError | { success: true; member: MojoImageStackMember }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const stackId = payload.stack_id?.trim()
  const storagePath = payload.storage_path?.trim()
  if (!stackId || !storagePath) {
    return { error: 'Stack and storage path are required' }
  }
  if (!payload.mime_type?.startsWith('image/')) {
    return { error: 'MIME type must be an image type' }
  }

  const admin = getAdminClient()

  const { data, error } = await admin
    .from('mojo_image_stack_members')
    .insert({
      stack_id: stackId,
      storage_path: storagePath,
      mime_type: payload.mime_type,
      weight: payload.weight ?? 1,
      display_order: payload.display_order ?? 0,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to add image to stack' }

  revalidatePath('/mojo/stacks')
  return { success: true as const, member: data }
}

export async function removeMemberFromStack(
  memberId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: member } = await admin
    .from('mojo_image_stack_members')
    .select('stack_id')
    .eq('id', memberId)
    .single()

  if (!member) return { error: 'Image not found' }

  await admin
    .from('mojo_image_stacks')
    .update({ last_served_member_id: null })
    .eq('last_served_member_id', memberId)

  const { error } = await admin.from('mojo_image_stack_members').delete().eq('id', memberId)

  if (error) return { error: 'Failed to remove image from stack' }

  revalidatePath('/mojo/stacks')
  return { success: true as const }
}

export async function updateStackMember(
  memberId: string,
  payload: { weight?: number; display_order?: number }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: member } = await admin
    .from('mojo_image_stack_members')
    .select('stack_id')
    .eq('id', memberId)
    .single()

  if (!member) return { error: 'Image not found' }

  const updates: TablesUpdate<'mojo_image_stack_members'> = { ...payload }

  const { error } = await admin
    .from('mojo_image_stack_members')
    .update(updates)
    .eq('id', memberId)

  if (error) return { error: 'Failed to update image' }

  revalidatePath('/mojo/stacks')
  return { success: true as const }
}

export async function setCharacterPrimaryStack(
  characterId: string,
  stackId: string | null
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  if (stackId) {
    const { data: stack } = await admin
      .from('mojo_image_stacks')
      .select('character_id')
      .eq('id', stackId)
      .single()

    if (!stack || stack.character_id !== characterId) {
      return { error: 'Stack does not belong to this character' }
    }
  }

  const { error } = await admin
    .from('mojo_characters')
    .update({ primary_stack_id: stackId })
    .eq('id', characterId)

  if (error) return { error: 'Failed to set primary stack' }

  revalidatePath('/mojo/characters/' + characterId)
  return { success: true as const }
}

// ─── AVATAR ACTIONS ────────────────────────────────────────

export async function registerUploadedAvatar(payload: {
  storage_path: string
  mime_type: string
  title: string
  expires_at: string | null
  character_id?: string | null
  faceclaim_id?: string | null
  width?: number | null
  height?: number | null
  file_size?: number | null
}): Promise<ActionError | { success: true; proxyUrl: string; avatar: MojoAvatar }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const storagePath = payload.storage_path?.trim()
  const title = payload.title?.trim()
  if (!storagePath || !title) {
    return { error: 'Storage path and title are required' }
  }

  let token: string
  try {
    token = await registerImageToken(
      storagePath,
      payload.mime_type,
      payload.expires_at ? new Date(payload.expires_at) : null,
      title
    )
  } catch {
    return { error: 'Failed to register image token' }
  }

  const proxyUrl = getProxyUrl(token)

  const admin = getAdminClient()
  const insertPayload: TablesInsert<'mojo_avatars'> = {
    character_id: payload.character_id ?? null,
    faceclaim_id: payload.faceclaim_id ?? null,
    title,
    storage_path: storagePath,
    token,
    expires_at: payload.expires_at ?? null,
    width: payload.width ?? null,
    height: payload.height ?? null,
    file_size: payload.file_size ?? null,
    mime_type: payload.mime_type,
  }

  const { data, error } = await admin
    .from('mojo_avatars')
    .insert(insertPayload)
    .select()
    .single()

  if (error || !data) return { error: 'Failed to save avatar' }

  revalidatePath('/mojo/avatars')
  if (payload.character_id) revalidatePath('/mojo/characters/' + payload.character_id)
  if (payload.faceclaim_id) revalidatePath('/mojo/faceclaims/' + payload.faceclaim_id)
  return { success: true as const, proxyUrl, avatar: data }
}

export async function updateMojoAvatar(
  avatarId: string,
  payload: {
    title?: string
    expires_at?: string | null
    character_id?: string | null
    faceclaim_id?: string | null
  }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('title' in payload && !payload.title?.trim()) {
    return { error: 'Title cannot be empty' }
  }

  const admin = getAdminClient()

  const { data: avatar } = await admin
    .from('mojo_avatars')
    .select('token, character_id, faceclaim_id')
    .eq('id', avatarId)
    .single()

  if (!avatar) return { error: 'Avatar not found' }

  const updates: TablesUpdate<'mojo_avatars'> = { ...payload }

  const { error } = await admin
    .from('mojo_avatars')
    .update(updates)
    .eq('id', avatarId)

  if (error) return { error: 'Failed to update avatar' }

  if ('expires_at' in payload) {
    await admin
      .from('mojo_image_tokens')
      .update({ expires_at: payload.expires_at ?? null })
      .eq('token', avatar.token)
  }

  revalidatePath('/mojo/avatars')
  if (avatar.character_id) revalidatePath('/mojo/characters/' + avatar.character_id)
  if (avatar.faceclaim_id) revalidatePath('/mojo/faceclaims/' + avatar.faceclaim_id)
  if (payload.character_id) revalidatePath('/mojo/characters/' + payload.character_id)
  if (payload.faceclaim_id) revalidatePath('/mojo/faceclaims/' + payload.faceclaim_id)
  return { success: true as const }
}

export async function deleteMojoAvatar(
  avatarId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: avatar } = await admin
    .from('mojo_avatars')
    .select('storage_path, token, character_id, faceclaim_id')
    .eq('id', avatarId)
    .single()

  if (!avatar) return { error: 'Avatar not found' }

  const { error: storageError } = await admin.storage
    .from('mojo-private')
    .remove([avatar.storage_path])
  if (storageError) {
    console.error('Failed to delete storage object:', storageError)
  }

  await admin.from('mojo_image_tokens').delete().eq('token', avatar.token)

  const { error } = await admin.from('mojo_avatars').delete().eq('id', avatarId)

  if (error) return { error: 'Failed to delete avatar' }

  const { data: staleMembers } = await admin
    .from('mojo_image_stack_members')
    .select('id')
    .eq('storage_path', avatar.storage_path)

  const staleMemberIds = (staleMembers ?? []).map((m) => m.id)
  if (staleMemberIds.length > 0) {
    await admin
      .from('mojo_image_stacks')
      .update({ last_served_member_id: null })
      .in('last_served_member_id', staleMemberIds)
  }

  revalidatePath('/mojo/avatars')
  revalidatePath('/mojo/stacks')
  if (avatar.character_id) revalidatePath('/mojo/characters/' + avatar.character_id)
  if (avatar.faceclaim_id) revalidatePath('/mojo/faceclaims/' + avatar.faceclaim_id)
  return { success: true as const }
}

// ─── THREAD MANUAL OVERRIDE ACTION ─────────────────────────

export async function updateMojoThreadWhoseTurn(
  threadId: string,
  whoseTurn: 'mine' | 'theirs' | null
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
    .update({ manual_whose_turn: whoseTurn })
    .eq('id', threadId)

  if (error) return { error: 'Failed to update whose turn' }

  revalidatePath('/mojo/characters/' + thread.character_id)
  revalidatePath('/mojo/rps/' + thread.rp_id)
  return { success: true as const }
}

// ─── PERSONAL IMAGE REPOSITORY ACTIONS ─────────────────────

export async function createMojoImageFolder(
  payload: { name: string }
): Promise<ActionError | { success: true; folder: MojoImageFolder }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const name = payload.name?.trim()
  if (!name) return { error: 'Folder name is required' }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_image_folders')
    .insert({ name })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create folder' }

  revalidatePath('/mojo/images')
  return { success: true as const, folder: data }
}

export async function updateMojoImageFolder(
  folderId: string,
  payload: { name?: string; display_order?: number }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('name' in payload && !payload.name?.trim()) {
    return { error: 'Folder name cannot be empty' }
  }

  const admin = getAdminClient()
  const updates: TablesUpdate<'mojo_image_folders'> = { ...payload }

  const { error } = await admin
    .from('mojo_image_folders')
    .update(updates)
    .eq('id', folderId)

  if (error) return { error: 'Failed to update folder' }

  revalidatePath('/mojo/images')
  return { success: true as const }
}

export async function deleteMojoImageFolder(
  folderId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()
  const { error } = await admin.from('mojo_image_folders').delete().eq('id', folderId)

  if (error) return { error: 'Failed to delete folder' }

  revalidatePath('/mojo/images')
  return { success: true as const }
}

export async function registerUploadedPersonalImage(payload: {
  storage_path: string
  mime_type: string
  title: string
  expires_at: string | null
  folder_id?: string | null
  tags?: string | null
  file_size?: number | null
}): Promise<ActionError | { success: true; proxyUrl: string; image: MojoPersonalImage }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const storagePath = payload.storage_path?.trim()
  const title = payload.title?.trim()
  if (!storagePath || !title) {
    return { error: 'Storage path and title are required' }
  }

  let token: string
  try {
    token = await registerImageToken(
      storagePath,
      payload.mime_type,
      payload.expires_at ? new Date(payload.expires_at) : null,
      title
    )
  } catch {
    return { error: 'Failed to register image token' }
  }

  const proxyUrl = getProxyUrl(token)

  const admin = getAdminClient()
  const insertPayload: TablesInsert<'mojo_personal_images'> = {
    folder_id: payload.folder_id ?? null,
    title,
    storage_path: storagePath,
    token,
    mime_type: payload.mime_type,
    expires_at: payload.expires_at ?? null,
    tags: payload.tags ?? null,
    file_size: payload.file_size ?? null,
  }

  const { data, error } = await admin
    .from('mojo_personal_images')
    .insert(insertPayload)
    .select()
    .single()

  if (error || !data) return { error: 'Failed to save image' }

  revalidatePath('/mojo/images')
  return { success: true as const, proxyUrl, image: data }
}

export async function updateMojoPersonalImage(
  imageId: string,
  payload: {
    title?: string
    folder_id?: string | null
    tags?: string | null
    expires_at?: string | null
  }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('title' in payload && !payload.title?.trim()) {
    return { error: 'Title cannot be empty' }
  }

  const admin = getAdminClient()

  const { data: image } = await admin
    .from('mojo_personal_images')
    .select('token')
    .eq('id', imageId)
    .single()

  if (!image) return { error: 'Image not found' }

  const updates: TablesUpdate<'mojo_personal_images'> = { ...payload }

  const { error } = await admin
    .from('mojo_personal_images')
    .update(updates)
    .eq('id', imageId)

  if (error) return { error: 'Failed to update image' }

  if ('expires_at' in payload) {
    await admin
      .from('mojo_image_tokens')
      .update({ expires_at: payload.expires_at ?? null })
      .eq('token', image.token)
  }

  revalidatePath('/mojo/images')
  return { success: true as const }
}

export async function deleteMojoPersonalImage(
  imageId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: image } = await admin
    .from('mojo_personal_images')
    .select('storage_path, token')
    .eq('id', imageId)
    .single()

  if (!image) return { error: 'Image not found' }

  const { error: storageError } = await admin.storage
    .from('mojo-private')
    .remove([image.storage_path])
  if (storageError) {
    console.error('Failed to delete storage object:', storageError)
  }

  await admin.from('mojo_image_tokens').delete().eq('token', image.token)

  const { error } = await admin.from('mojo_personal_images').delete().eq('id', imageId)

  if (error) return { error: 'Failed to delete image' }

  revalidatePath('/mojo/images')
  return { success: true as const }
}

// ─── WANTED / CONNECTIONS BOARD ACTIONS ─────────────────────

export async function createMojoWanted(payload: {
  rp_id: string
  character_id?: string | null
  title: string
  description?: string | null
  image_token?: string | null
}): Promise<ActionError | { success: true; item: MojoWanted }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const rpId = payload.rp_id?.trim()
  const title = payload.title?.trim()
  if (!rpId || !title) {
    return { error: 'RP and title are required' }
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_wanted')
    .insert({
      rp_id: rpId,
      character_id: payload.character_id ?? null,
      title,
      description: payload.description ?? null,
      image_token: payload.image_token ?? null,
    })
    .select()
    .single()

  if (error || !data) return { error: 'Failed to create connection' }

  revalidatePath('/mojo/rps/' + rpId)
  return { success: true as const, item: data }
}

export async function updateMojoWanted(
  itemId: string,
  payload: {
    title?: string
    description?: string | null
    character_id?: string | null
    image_token?: string | null
  }
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  if ('title' in payload && !payload.title?.trim()) {
    return { error: 'Title cannot be empty' }
  }

  const admin = getAdminClient()

  const { data: item } = await admin
    .from('mojo_wanted')
    .select('rp_id')
    .eq('id', itemId)
    .single()

  if (!item) return { error: 'Item not found' }

  const updates: TablesUpdate<'mojo_wanted'> = { ...payload }

  const { error } = await admin
    .from('mojo_wanted')
    .update(updates)
    .eq('id', itemId)

  if (error) return { error: 'Failed to update connection' }

  revalidatePath('/mojo/rps/' + item.rp_id)
  return { success: true as const }
}

export async function updateMojoWantedStatus(
  itemId: string,
  status: 'open' | 'filled'
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: item } = await admin
    .from('mojo_wanted')
    .select('rp_id')
    .eq('id', itemId)
    .single()

  if (!item) return { error: 'Item not found' }

  const { error } = await admin
    .from('mojo_wanted')
    .update({ status })
    .eq('id', itemId)

  if (error) return { error: 'Failed to update status' }

  revalidatePath('/mojo/rps/' + item.rp_id)
  return { success: true as const }
}

export async function deleteMojoWanted(
  itemId: string
): Promise<ActionError | { success: true }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const admin = getAdminClient()

  const { data: item } = await admin
    .from('mojo_wanted')
    .select('rp_id, image_token')
    .eq('id', itemId)
    .single()

  if (!item) return { error: 'Item not found' }

  if (item.image_token) {
    const { data: tokenRow } = await admin
      .from('mojo_image_tokens')
      .select('storage_path')
      .eq('token', item.image_token)
      .single()

    if (tokenRow) {
      const { error: storageError } = await admin.storage
        .from('mojo-private')
        .remove([tokenRow.storage_path])
      if (storageError) {
        console.error('Failed to delete storage object:', storageError)
      }
    }

    await admin.from('mojo_image_tokens').delete().eq('token', item.image_token)
  }

  const { error } = await admin.from('mojo_wanted').delete().eq('id', itemId)

  if (error) return { error: 'Failed to delete connection' }

  revalidatePath('/mojo/rps/' + item.rp_id)
  return { success: true as const }
}

export async function registerWantedImage(payload: {
  storage_path: string
  mime_type: string
  rp_id: string
}): Promise<ActionError | { success: true; token: string; proxyUrl: string }> {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

  const storagePath = payload.storage_path?.trim()
  if (!storagePath) return { error: 'Storage path is required' }

  const token = await registerImageToken(storagePath, payload.mime_type, null, 'wanted-ref')
  const proxyUrl = getProxyUrl(token)

  revalidatePath('/mojo/rps/' + payload.rp_id)
  return { success: true as const, token, proxyUrl }
}

// ─── THE FAMILIAR: CONVERSATION ACTIONS ─────────────────────
// Used by the chat UI for conversation management — not by the
// agent route itself (the route uses the DB helpers directly).

export async function listFamiliarConversations() {
  const userId = await requireSuperAdmin()
  if (!userId) return []
  return getMojoFamiliarConversations()
}

export async function createFamiliarConversation(title?: string) {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }
  const conv = await createMojoFamiliarConversation(title)
  revalidatePath('/mojo/familiar')
  return { success: true as const, conversation: conv }
}

export async function deleteFamiliarConversation(conversationId: string) {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }
  await deleteMojoFamiliarConversation(conversationId)
  revalidatePath('/mojo/familiar')
  return { success: true as const }
}

export async function renameFamiliarConversation(
  conversationId: string,
  title: string,
) {
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }
  await updateMojoFamiliarConversationTitle(conversationId, title)
  revalidatePath('/mojo/familiar')
  return { success: true as const }
}
