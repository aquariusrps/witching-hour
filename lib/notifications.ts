import { getAdminClient } from '@/lib/supabase/adminClient'

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  body: string
  link?: string
}

/**
 * Insert a notification for a user.
 * Always uses the admin client — notifications are system
 * writes, never user writes.
 * Always call as: void createNotification(...)
 * Never await — fire-and-forget only.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
    })
  if (error) {
    console.error('[createNotification] failed:', error.message)
  }
}

/**
 * Insert a Council Notice (system Whisper) for a user.
 * sender_id is null — system messages have no sender.
 * Always call as: void createCouncilNotice(...)
 * Never await — fire-and-forget only.
 */
export async function createCouncilNotice(params: {
  recipientId: string
  subject: string
  body: string
  isWelcome?: boolean
}): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin
    .from('mail_messages')
    .insert({
      sender_id: null,
      recipient_id: params.recipientId,
      subject: params.subject,
      body: params.body,
      is_system_message: true,
      is_welcome: params.isWelcome ?? false,
      system_message_audience: 'individual',
    })
  if (error) {
    console.error('[createCouncilNotice] failed:', error.message)
  }
}
