import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default async function WhispersPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const params = await searchParams
  const justSent = params.sent === '1'

  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: messages } = await supabase
    .from('mail_messages')
    .select('id, sender_id, subject, created_at, read_at, is_system_message, is_welcome')
    .eq('recipient_id', user.id)
    .eq('deleted_by_recipient', false)
    .order('created_at', { ascending: false })

  const senderIds = [
    ...new Set(
      (messages ?? [])
        .filter((m) => m.sender_id)
        .map((m) => m.sender_id!)
    ),
  ]

  const senderMap: Record<string, string> = {}
  if (senderIds.length > 0) {
    const admin = getAdminClient()
    const { data: senderRows } = await admin
      .from('users')
      .select('id, display_name')
      .in('id', senderIds)
    senderRows?.forEach((u) => {
      senderMap[u.id] = u.display_name
    })
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 22px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <h1 style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 500,
          fontSize: '2rem',
          color: 'var(--roseash)',
          margin: 0,
          letterSpacing: '0.02em',
        }}>
          Whispers
        </h1>
        <Link href="/whispers/compose" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 18px',
          background: 'var(--ember)',
          color: 'var(--roseash)',
          fontFamily: 'var(--f-ui)',
          fontSize: '0.75rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          borderRadius: 'var(--r-sm)',
        }}>
          + Compose
        </Link>
      </div>

      {/* Sent confirmation */}
      {justSent && (
        <div style={{
          background: 'rgba(224,176,40,0.08)',
          border: '1px solid var(--gold-dim)',
          borderRadius: 'var(--r-sm)',
          padding: '10px 16px',
          marginBottom: 20,
          fontFamily: 'var(--f-body)',
          fontStyle: 'italic',
          fontSize: '0.88rem',
          color: 'var(--gold)',
        }}>
          Whisper sent.
        </div>
      )}

      {/* Message list */}
      {(!messages || messages.length === 0) ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          fontFamily: 'var(--f-body)',
          fontStyle: 'italic',
          fontSize: '1.05rem',
          color: 'var(--faded)',
        }}>
          Your Whispers await. The silence won&apos;t last long.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg) => {
            const isUnread = !msg.read_at
            const isSystem = msg.is_system_message
            const senderName = isSystem
              ? 'The Council'
              : (msg.sender_id ? senderMap[msg.sender_id] ?? 'Unknown' : 'The Council')

            return (
              <Link
                key={msg.id}
                href={`/whispers/${msg.id}`}
                style={{
                  display: 'block',
                  padding: '14px 18px',
                  background: isUnread ? 'var(--raised)' : 'var(--claret)',
                  borderLeft: isSystem
                    ? '3px solid var(--gold)'
                    : `3px solid ${isUnread ? 'var(--ember)' : 'transparent'}`,
                  borderRadius: 'var(--r-sm)',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                {/* Council Notice label */}
                {isSystem && (
                  <div style={{
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: 5,
                  }}>
                    Council Notice
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {/* Unread indicator */}
                  {isUnread && (
                    <span style={{
                      display: 'inline-block',
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--ember)',
                      boxShadow: '0 0 6px var(--ember-glow)',
                      flexShrink: 0,
                      marginTop: 5,
                    }} aria-label="unread" />
                  )}
                  {!isUnread && <span style={{ width: 7, flexShrink: 0 }} />}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{
                        fontFamily: 'var(--f-body)',
                        fontWeight: isUnread ? 600 : 400,
                        fontSize: '0.82rem',
                        color: 'var(--mist)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {senderName}
                      </span>
                      <span style={{
                        fontFamily: 'var(--f-body)',
                        fontSize: '0.72rem',
                        color: 'var(--faded)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--f-heading)',
                      fontSize: '0.92rem',
                      color: isUnread ? 'var(--roseash)' : 'var(--mist)',
                      marginTop: 3,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {msg.subject}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
