import { redirect } from 'next/navigation'
import Link from 'next/link'
import sanitizeHtml from 'sanitize-html'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import { CANONS } from '@/lib/canons'
import { CharacterReviewPanel } from './CharacterReviewPanel'

type QueueCharacter = {
  id: string
  name: string
  avatar_url: string | null
  canon_source: string
  created_at: string
  users: { id: string; display_name: string } | null
  factions: { name: string; color_hex: string } | null
}

type DetailCharacter = {
  id: string
  name: string
  avatar_url: string | null
  bio: string | null
  canon_source: string
  status: string
  xp: number
  level: number
  is_npc: boolean
  created_at: string
  users: { id: string; display_name: string } | null
  factions: { name: string; color_hex: string; leader_title: string } | null
}

type Revision = {
  id: string
  feedback: string | null
  status_before: string
  status_after: string
  created_at: string
  reviewer_id: string | null
}

function relativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function statusColor(status: string): string {
  if (status === 'active') return 'var(--gold)'
  if (status === 'needs_revision' || status === 'suspended') return 'var(--ember)'
  return 'var(--mist)'
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:        { label: 'Pending Review',      bg: 'var(--gold)',      color: 'var(--char)'    },
  needs_revision: { label: 'Revision Requested',  bg: 'var(--ember)',     color: 'var(--roseash)' },
  active:         { label: 'Active',              bg: 'var(--moonstone)', color: 'var(--char)'    },
  suspended:      { label: 'Suspended',           bg: 'var(--faded)',     color: 'var(--roseash)' },
}

function CanonBadge({ canonSource }: { canonSource: string }) {
  const canon = CANONS.find((c) => c.db === canonSource)
  const label = canon?.label ?? (canonSource === 'angel' ? 'Angel' : canonSource === 'original' ? 'Original' : canonSource.replace(/_/g, ' '))
  const color = canon?.color ?? '#6a4838'
  return (
    <span style={{
      fontFamily: 'var(--f-ui)',
      fontSize: '0.5rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color,
      border: `1px solid ${color}60`,
      borderRadius: 2,
      padding: '1px 5px',
      flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

function FactionPip({ color }: { color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 6,
      height: 6,
      background: color,
      transform: 'rotate(45deg)',
      boxShadow: `0 0 4px ${color}80`,
      flexShrink: 0,
    }} />
  )
}

function InitialsCircle({ name, size }: { name: string; size: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 4,
      background: 'var(--elevated)',
      border: '1px solid var(--ember-dim)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontFamily: 'var(--f-ui)',
      fontSize: size > 60 ? '1.1rem' : '0.65rem',
      color: 'var(--mist)',
      letterSpacing: '0.05em',
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default async function AdminCharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; character?: string }>
}) {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const [permissions, superAdmin] = await Promise.all([
    getUserPermissions(userId),
    isSuperAdmin(userId),
  ])

  if (!superAdmin && !permissions.includes('approve_characters')) {
    redirect('/admin')
  }

  const { tab = 'pending', character: characterId } = await searchParams
  const activeTab = tab === 'needs_revision' ? 'needs_revision' : 'pending'
  const admin = getAdminClient()

  // Always fetch both queues in parallel
  const [pendingResult, revisionResult] = await Promise.all([
    admin
      .from('characters')
      .select(`
        id, name, avatar_url, canon_source, created_at,
        users ( id, display_name ),
        factions ( name, color_hex )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),

    admin
      .from('characters')
      .select(`
        id, name, avatar_url, canon_source, created_at,
        users ( id, display_name ),
        factions ( name, color_hex )
      `)
      .eq('status', 'needs_revision')
      .order('created_at', { ascending: true }),
  ])

  const pendingChars = (pendingResult.data ?? []) as unknown as QueueCharacter[]
  const revisionChars = (revisionResult.data ?? []) as unknown as QueueCharacter[]
  const activeList = activeTab === 'pending' ? pendingChars : revisionChars

  // Fetch character detail if selected
  let detailChar: DetailCharacter | null = null
  let revisions: Revision[] = []
  let reviewerMap: Record<string, string> = {}
  let cleanBio = ''

  if (characterId) {
    const [charResult, revisionsResult] = await Promise.all([
      admin
        .from('characters')
        .select(`
          id, name, avatar_url, bio, canon_source,
          status, xp, level, is_npc, created_at,
          users ( id, display_name ),
          factions ( name, color_hex, leader_title )
        `)
        .eq('id', characterId)
        .single(),

      admin
        .from('character_revisions')
        .select('id, feedback, status_before, status_after, created_at, reviewer_id')
        .eq('character_id', characterId)
        .order('created_at', { ascending: false }),
    ])

    detailChar = charResult.data as unknown as DetailCharacter | null
    revisions = (revisionsResult.data ?? []) as unknown as Revision[]

    // Fetch reviewer display names from public.users (reviewer_id -> auth.users,
    // but public.users shares the same id space)
    const reviewerIds = [...new Set(
      revisions.map(r => r.reviewer_id).filter((id): id is string => id !== null)
    )]
    if (reviewerIds.length > 0) {
      const { data: reviewerData } = await admin
        .from('users')
        .select('id, display_name')
        .in('id', reviewerIds)
      reviewerMap = Object.fromEntries(
        (reviewerData ?? []).map(u => [u.id, u.display_name])
      )
    }

    cleanBio = sanitizeHtml(detailChar?.bio ?? '', {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['u']),
      allowedAttributes: sanitizeHtml.defaults.allowedAttributes,
    })
  }

  const tabLink = (t: string) => `/admin/characters?tab=${t}`

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--f-head)',
          fontSize: '1.9rem',
          fontWeight: 700,
          color: 'var(--roseash)',
          margin: 0,
          marginBottom: 4,
        }}>
          Character Approval Queue
        </h1>
        <p style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.62rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          margin: 0,
        }}>
          Review, approve, and manage character submissions
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT — Queue list */}
        <div style={{
          background: 'var(--claret)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 7,
          overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--ember-dim)',
          }}>
            {(['pending', 'needs_revision'] as const).map((t) => {
              const count = t === 'pending' ? pendingChars.length : revisionChars.length
              const isActive = activeTab === t
              return (
                <Link
                  key={t}
                  href={tabLink(t)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    textAlign: 'center',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive ? 'var(--roseash)' : 'var(--faded)',
                    borderBottom: isActive ? '2px solid var(--ember)' : '2px solid transparent',
                    background: 'transparent',
                    transition: 'color 0.15s',
                  }}
                >
                  {t === 'pending' ? 'Pending' : 'Needs Revision'} ({count})
                </Link>
              )
            })}
          </div>

          {/* Character cards */}
          <div style={{ padding: '8px 0' }}>
            {activeList.length === 0 ? (
              <p style={{
                fontFamily: 'var(--f-body)',
                fontStyle: 'italic',
                color: 'var(--mist)',
                textAlign: 'center',
                padding: '2rem 16px',
                margin: 0,
              }}>
                {activeTab === 'pending'
                  ? 'No characters awaiting approval. ✦'
                  : 'No characters awaiting revision.'}
              </p>
            ) : (
              activeList.map((char) => {
                const isSelected = characterId === char.id
                const canon = CANONS.find((c) => c.db === char.canon_source)
                const canonColor = canon?.color ?? '#6a4838'
                return (
                  <Link
                    key={char.id}
                    href={`/admin/characters?tab=${activeTab}&character=${char.id}`}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      background: isSelected ? 'var(--raised)' : 'transparent',
                      borderLeft: isSelected ? '2px solid var(--ember)' : '2px solid transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {char.avatar_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={char.avatar_url}
                          alt=""
                          style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <InitialsCircle name={char.name} size={36} />
                      )}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontFamily: 'var(--f-head)',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'var(--roseash)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {char.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          <CanonBadge canonSource={char.canon_source} />
                          {char.factions && (
                            <FactionPip color={char.factions.color_hex} />
                          )}
                        </div>
                        <div style={{
                          fontFamily: 'var(--f-body)',
                          fontSize: '0.75rem',
                          color: 'var(--mist)',
                          marginTop: 3,
                        }}>
                          {char.users?.display_name ?? '—'}
                        </div>
                        <div style={{
                          fontFamily: 'var(--f-body)',
                          fontSize: '0.68rem',
                          color: 'var(--faded)',
                          marginTop: 1,
                        }}>
                          {activeTab === 'pending'
                            ? `Submitted ${relativeTime(char.created_at)}`
                            : `Awaiting revision ${relativeTime(char.created_at)}`}
                        </div>
                      </div>
                      {char.factions && (
                        <div style={{
                          width: 3,
                          alignSelf: 'stretch',
                          background: canonColor,
                          borderRadius: 2,
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT — Review panel */}
        {!detailChar ? (
          <div style={{
            background: 'var(--claret)',
            border: '1px solid var(--ember-dim)',
            borderRadius: 7,
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
          }}>
            <p style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              color: 'var(--faded)',
              margin: 0,
            }}>
              Select a character from the queue to review.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'var(--claret)',
            border: '1px solid var(--ember-dim)',
            borderRadius: 7,
            padding: 28,
          }}>
            {/* Character header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
              {detailChar.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={detailChar.avatar_url}
                  alt=""
                  style={{ width: 120, height: 120, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <InitialsCircle name={detailChar.name} size={120} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--roseash)',
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}>
                  {detailChar.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <CanonBadge canonSource={detailChar.canon_source} />
                  {detailChar.factions && (
                    <FactionPip color={detailChar.factions.color_hex} />
                  )}
                  {detailChar.factions && (
                    <span style={{
                      fontFamily: 'var(--f-body)',
                      fontSize: '0.75rem',
                      color: 'var(--mist)',
                    }}>
                      {detailChar.factions.name}
                    </span>
                  )}
                  {detailChar.is_npc && (
                    <span style={{
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.5rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--faded)',
                      border: '1px solid var(--ember-dim)',
                      borderRadius: 2,
                      padding: '1px 5px',
                    }}>
                      NPC
                    </span>
                  )}
                </div>
                {(() => {
                  const s = STATUS_CONFIG[detailChar.status] ?? STATUS_CONFIG.suspended
                  return (
                    <span style={{
                      display: 'inline-block',
                      background: s.bg,
                      color: s.color,
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      borderRadius: 3,
                      padding: '3px 8px',
                      marginBottom: 6,
                    }}>
                      {s.label}
                    </span>
                  )
                })()}
                <div style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.75rem',
                  color: 'var(--mist)',
                }}>
                  Played by {detailChar.users?.display_name ?? '—'}
                </div>
                <div style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.7rem',
                  color: 'var(--faded)',
                  marginTop: 2,
                }}>
                  Lv {detailChar.level} · {detailChar.xp} XP · Submitted {relativeTime(detailChar.created_at)}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--ember-dim)', marginBottom: 20 }} />

            {/* Biography */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--faded)',
                marginBottom: 10,
              }}>
                Biography
              </div>
              {cleanBio ? (
                <div
                  style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.9rem',
                    color: 'var(--roseash)',
                    lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{ __html: cleanBio }}
                />
              ) : (
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontStyle: 'italic',
                  color: 'var(--faded)',
                  margin: 0,
                  fontSize: '0.875rem',
                }}>
                  No biography provided.
                </p>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--ember-dim)', marginBottom: 20 }} />

            {/* Review history */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--faded)',
                marginBottom: 12,
              }}>
                Review History
              </div>
              {revisions.length === 0 ? (
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontStyle: 'italic',
                  color: 'var(--faded)',
                  margin: 0,
                  fontSize: '0.875rem',
                }}>
                  No review history yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {revisions.map((rev, i) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: i < revisions.length - 1
                          ? '1px solid var(--ember-dim)'
                          : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{
                          fontFamily: 'var(--f-ui)',
                          fontSize: '0.6rem',
                          letterSpacing: '0.1em',
                          color: 'var(--mist)',
                        }}>
                          {rev.reviewer_id ? (reviewerMap[rev.reviewer_id] ?? 'Staff') : 'System'}
                        </span>
                        <span style={{
                          fontFamily: 'var(--f-body)',
                          fontSize: '0.68rem',
                          color: 'var(--faded)',
                        }}>
                          {relativeTime(rev.created_at)}
                        </span>
                      </div>
                      <div style={{
                        fontFamily: 'var(--f-body)',
                        fontSize: '0.78rem',
                        color: 'var(--mist)',
                        marginBottom: 6,
                      }}>
                        <span style={{ color: statusColor(rev.status_before) }}>{rev.status_before}</span>
                        {' → '}
                        <span style={{ color: statusColor(rev.status_after) }}>{rev.status_after}</span>
                      </div>
                      {rev.feedback ? (
                        <p style={{
                          fontFamily: 'var(--f-body)',
                          fontStyle: 'italic',
                          fontSize: '0.875rem',
                          color: 'var(--roseash)',
                          margin: 0,
                          lineHeight: 1.6,
                        }}>
                          &ldquo;{rev.feedback}&rdquo;
                        </p>
                      ) : (
                        <p style={{
                          fontFamily: 'var(--f-body)',
                          fontStyle: 'italic',
                          fontSize: '0.875rem',
                          color: 'var(--faded)',
                          margin: 0,
                        }}>
                          No feedback recorded.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--ember-dim)', marginBottom: 20 }} />

            {/* Action buttons — Client Component */}
            <CharacterReviewPanel
              characterId={detailChar.id}
              characterName={detailChar.name}
              currentStatus={detailChar.status}
            />
          </div>
        )}
      </div>
    </div>
  )
}
