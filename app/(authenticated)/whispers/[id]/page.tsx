import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { deleteWhisper } from '@/lib/actions/whispers'
import { SystemMessageBody } from './MessageView'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: message } = await supabase
    .from('mail_messages')
    .select('*')
    .eq('id', id)
    .single()

  if (
    !message ||
    (message.recipient_id !== user.id && message.sender_id !== user.id)
  ) {
    redirect('/whispers')
  }

  const admin = getAdminClient()

  // Mark as read server-side before rendering
  if (message.recipient_id === user.id && !message.read_at) {
    await admin
      .from('mail_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', message.id)
      .eq('recipient_id', user.id)
      .is('read_at', null)
  }

  // Resolve sender and recipient display names
  const participantIds = [
    ...(message.sender_id ? [message.sender_id] : []),
    message.recipient_id,
  ].filter((v, i, a) => a.indexOf(v) === i)

  const { data: participantRows } = await admin
    .from('users')
    .select('id, display_name')
    .in('id', participantIds)

  const nameMap: Record<string, string> = {}
  participantRows?.forEach((u) => {
    nameMap[u.id] = u.display_name
  })

  const senderName = message.is_system_message
    ? 'The Council'
    : (message.sender_id ? nameMap[message.sender_id] ?? 'Unknown' : 'The Council')
  const recipientName = nameMap[message.recipient_id] ?? 'Unknown'

  const isRecipient = message.recipient_id === user.id
  const isSender    = message.sender_id === user.id

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 22px' }}>

      <div style={{ marginBottom: 28 }}>
        <Link href="/whispers" style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.7rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          textDecoration: 'none',
        }}>
          ← Back to Whispers
        </Link>
      </div>

      {/* Council Notice treatment */}
      {message.is_system_message && (
        <div style={{
          display: 'inline-block',
          fontFamily: 'var(--f-ui)',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          border: '1px solid var(--gold-dim)',
          borderRadius: 'var(--r-xs)',
          padding: '3px 10px',
          marginBottom: 16,
        }}>
          Council Notice
        </div>
      )}

      {/* Subject */}
      <h1 style={{
        fontFamily: 'var(--f-heading)',
        fontWeight: 700,
        fontSize: '1.65rem',
        color: 'var(--roseash)',
        margin: '0 0 12px',
        lineHeight: 1.25,
      }}>
        {message.subject}
      </h1>

      {/* Meta */}
      <p style={{
        fontFamily: 'var(--f-body)',
        fontStyle: 'italic',
        fontSize: '0.85rem',
        color: 'var(--mist)',
        margin: '0 0 8px',
      }}>
        {senderName}
        {' '}
        <span style={{ color: 'var(--faded)' }}>to</span>
        {' '}
        {recipientName}
      </p>
      <p style={{
        fontFamily: 'var(--f-body)',
        fontSize: '0.78rem',
        color: 'var(--faded)',
        margin: '0 0 32px',
      }}>
        {formatDate(message.created_at)}
      </p>

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, var(--ember-dim), var(--gold-dim), transparent)',
        marginBottom: 32,
      }} />

      {/* Body */}
      <div style={{
        background: 'var(--claret)',
        border: message.is_system_message ? '1px solid var(--gold-dim)' : '1px solid var(--border)',
        borderLeft: message.is_system_message ? '3px solid var(--gold)' : '1px solid var(--border)',
        borderRadius: 'var(--r-sm)',
        padding: '24px 28px',
        marginBottom: 32,
      }}>
        {message.is_system_message ? (
          <SystemMessageBody html={message.body} />
        ) : (
          <p style={{
            fontFamily: 'var(--f-body)',
            fontSize: '1rem',
            lineHeight: 1.75,
            color: 'var(--roseash)',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {message.body}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        {isRecipient && (
          <form action={async () => {
            'use server'
            await deleteWhisper(message.id, 'recipient')
            redirect('/whispers')
          }}>
            <button type="submit" style={{
              padding: '8px 18px',
              background: 'none',
              border: '1px solid var(--ember-dim)',
              borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ember)',
              cursor: 'pointer',
            }}>
              Delete
            </button>
          </form>
        )}
        {isSender && !message.is_system_message && (
          <form action={async () => {
            'use server'
            await deleteWhisper(message.id, 'sender')
            redirect('/whispers')
          }}>
            <button type="submit" style={{
              padding: '8px 18px',
              background: 'none',
              border: '1px solid var(--ember-dim)',
              borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ember)',
              cursor: 'pointer',
            }}>
              Unsend
            </button>
          </form>
        )}
      </div>

    </div>
  )
}
