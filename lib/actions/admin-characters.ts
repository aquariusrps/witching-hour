'use server'

import { getServerClient }    from '@/lib/supabase/serverClient'
import { getAdminClient }     from '@/lib/supabase/adminClient'
import { hasPermission }      from '@/lib/permissions'
import { createNotification } from '@/lib/notifications'
import { revalidatePath }     from 'next/cache'

async function requireApprovePermission(userId: string) {
  const ok = await hasPermission(userId, 'approve_characters')
  if (!ok) throw new Error('Forbidden')
}

async function fetchCharacterWithUser(characterId: string) {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('characters')
    .select(`
      id, name, status, user_id,
      users ( id, display_name )
    `)
    .eq('id', characterId)
    .single()
  if (error || !data) throw new Error('Character not found')
  return data
}

async function writeRevision(params: {
  characterId:  string
  reviewerId:   string
  feedback:     string | null
  statusBefore: string
  statusAfter:  string
}) {
  const admin = getAdminClient()
  const { error } = await admin
    .from('character_revisions')
    .insert({
      character_id:  params.characterId,
      reviewer_id:   params.reviewerId,
      feedback:      params.feedback,
      status_before: params.statusBefore,
      status_after:  params.statusAfter,
    })
  if (error) {
    console.error('[writeRevision] failed:', error.message)
  }
}

// ── approveCharacter ─────────────────────────────────
export async function approveCharacter(
  characterId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireApprovePermission(user.id) }
  catch { return { error: 'Forbidden' } }

  const character = await fetchCharacterWithUser(characterId)
    .catch(() => null)
  if (!character) return { error: 'Character not found' }

  if (character.status === 'active') {
    return { error: 'Character is already active' }
  }

  const admin = getAdminClient()
  const { error } = await admin
    .from('characters')
    .update({ status: 'active' })
    .eq('id', characterId)

  if (error) return { error: 'Failed to approve character' }

  await writeRevision({
    characterId,
    reviewerId:   user.id,
    feedback:     null,
    statusBefore: character.status,
    statusAfter:  'active',
  })

  void createNotification({
    userId: character.user_id,
    type:   'character_approved',
    title:  'Character Approved',
    body:   `Your character ${character.name} has been approved and is now active.`,
    link:   `/characters/${characterId}`,
  })

  revalidatePath('/admin/characters')
  return { success: true }
}

// ── rejectCharacter ───────────────────────────────────
export async function rejectCharacter(
  characterId: string,
  reason: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireApprovePermission(user.id) }
  catch { return { error: 'Forbidden' } }

  if (!reason?.trim()) {
    return {
      error: 'A reason is required when rejecting a character'
    }
  }

  const character = await fetchCharacterWithUser(characterId)
    .catch(() => null)
  if (!character) return { error: 'Character not found' }

  const admin = getAdminClient()
  const { error } = await admin
    .from('characters')
    .update({ status: 'suspended' })
    .eq('id', characterId)

  if (error) return { error: 'Failed to reject character' }

  await writeRevision({
    characterId,
    reviewerId:   user.id,
    feedback:     reason.trim(),
    statusBefore: character.status,
    statusAfter:  'suspended',
  })

  void createNotification({
    userId: character.user_id,
    type:   'character_rejected',
    title:  'Character Not Approved',
    body:   `Your character ${character.name} was not approved. Reason: ${reason.trim()}`,
    link:   '/my-characters',
  })

  revalidatePath('/admin/characters')
  return { success: true }
}

// ── requestRevision ───────────────────────────────────
export async function requestRevision(
  characterId: string,
  feedback: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  try { await requireApprovePermission(user.id) }
  catch { return { error: 'Forbidden' } }

  if (!feedback?.trim()) {
    return {
      error: 'Feedback is required when requesting revision'
    }
  }

  const character = await fetchCharacterWithUser(characterId)
    .catch(() => null)
  if (!character) return { error: 'Character not found' }

  if (!['pending', 'needs_revision'].includes(character.status)) {
    return {
      error: 'Can only request revision on pending or needs_revision characters'
    }
  }

  const admin = getAdminClient()
  const { error } = await admin
    .from('characters')
    .update({ status: 'needs_revision' })
    .eq('id', characterId)

  if (error) return { error: 'Failed to request revision' }

  await writeRevision({
    characterId,
    reviewerId:   user.id,
    feedback:     feedback.trim(),
    statusBefore: character.status,
    statusAfter:  'needs_revision',
  })

  void createNotification({
    userId: character.user_id,
    type:   'character_needs_revision',
    title:  'Character Revision Requested',
    body:   `Your character ${character.name} needs some changes before approval. Feedback: ${feedback.trim()}`,
    link:   '/my-characters',
  })

  revalidatePath('/admin/characters')
  return { success: true }
}
