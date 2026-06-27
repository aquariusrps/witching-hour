'use server'

import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function findUserByDisplayName(
  displayName: string
): Promise<{ id: string; display_name: string } | null> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = getAdminClient()
  const { data } = await admin
    .from('users')
    .select('id, display_name')
    .ilike('display_name', displayName.trim())
    .neq('id', user.id)
    .maybeSingle()

  return data ?? null
}

export async function sendWhisper(formData: FormData) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const recipientId = formData.get('recipientId') as string
  const subject     = formData.get('subject') as string
  const body        = formData.get('body') as string

  if (!recipientId || !subject?.trim() || !body?.trim()) {
    return { error: 'All fields are required' }
  }

  const admin = getAdminClient()

  const { data: recipient } = await admin
    .from('users')
    .select('id, display_name')
    .eq('id', recipientId)
    .single()

  if (!recipient) return { error: 'Recipient not found' }

  const { error } = await admin
    .from('mail_messages')
    .insert({
      sender_id:         user.id,
      recipient_id:      recipientId,
      subject:           subject.trim(),
      body:              body.trim(),
      is_system_message: false,
      is_welcome:        false,
    })

  if (error) return { error: 'Failed to send message' }

  void createNotification({
    userId: recipientId,
    type:   'new_whisper',
    title:  'New Whisper',
    body:   `You have a new message from ${user.user_metadata?.display_name ?? 'someone'}.`,
    link:   '/whispers',
  })

  revalidatePath('/whispers')
  return { success: true }
}

export async function markWhisperRead(messageId: string) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = getAdminClient()
  const { error } = await admin
    .from('mail_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('recipient_id', user.id)
    .is('read_at', null)

  if (error) return { error: 'Failed to mark as read' }
  revalidatePath('/whispers')
  return { success: true }
}

export async function deleteWhisper(
  messageId: string,
  role: 'sender' | 'recipient'
) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = getAdminClient()
  const updatePayload = role === 'sender'
    ? { deleted_by_sender: true }
    : { deleted_by_recipient: true }
  const idField = role === 'sender' ? 'sender_id' : 'recipient_id'

  const { error } = await admin
    .from('mail_messages')
    .update(updatePayload)
    .eq('id', messageId)
    .eq(idField, user.id)

  if (error) return { error: 'Failed to delete message' }
  revalidatePath('/whispers')
  return { success: true }
}
