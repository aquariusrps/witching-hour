import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import { checkIsBanned } from '@/lib/actions/admin-players'
import { PlayerSearch } from './PlayerSearch'
import { PlayerActions } from './PlayerActions'

type SearchUser = {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string | null
  user_roles: Array<{
    id: string
    scope_id: string | null
    roles: {
      name: string
      display_name: string
      is_invisible: boolean
    } | null
  }>
}

export default async function AdminPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; user?: string }>
}) {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const [permissions, superAdmin] = await Promise.all([
    getUserPermissions(userId),
    isSuperAdmin(userId),
  ])

  if (!superAdmin && !permissions.includes('manage_users')) {
    redirect('/admin')
  }

  const { q = '', user: selectedUserId } = await searchParams
  const admin = getAdminClient()

  // Fetch search results
  let searchResults: SearchUser[] = []
  if (q.trim()) {
    const { data } = await admin
      .from('users')
      .select(`
        id,
        display_name,
        avatar_url,
        created_at,
        user_roles (
          id,
          scope_id,
          roles (
            name,
            display_name,
            is_invisible
          )
        )
      `)
      .ilike('display_name', `%${q.trim()}%`)
      .order('display_name')
      .limit(20)
    searchResults = (data ?? []) as unknown as SearchUser[]
  }

  // Fetch selected user detail
  type DetailUser = {
    id: string
    display_name: string
    avatar_url: string | null
    created_at: string | null
    essence: number
  }
  type DetailRole = {
    id: string
    scope_id: string | null
    roles: {
      name: string
      display_name: string
      is_invisible: boolean
      is_permanent: boolean
    } | null
  }
  type ActiveCharacter = {
    id: string
    name: string
    level: number
    xp: number
  }

  const detail = selectedUserId
    ? await (async () => {
        const [userRow, rolesRow, charCountRow, bannedFlag, charDataRow] = await Promise.all([
          admin
            .from('users')
            .select('id, display_name, avatar_url, created_at, essence')
            .eq('id', selectedUserId)
            .single(),
          admin
            .from('user_roles')
            .select('id, scope_id, roles(name, display_name, is_invisible, is_permanent)')
            .eq('user_id', selectedUserId),
          admin
            .from('characters')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', selectedUserId),
          checkIsBanned(selectedUserId),
          admin
            .from('characters')
            .select('id, name, level, xp')
            .eq('user_id', selectedUserId)
            .eq('status', 'active')
            .order('name'),
        ])
        return {
          user: userRow.data as unknown as DetailUser | null,
          roles: (rolesRow.data ?? []) as unknown as DetailRole[],
          charCount: charCountRow.count ?? 0,
          isBanned: bannedFlag,
          activeCharacters: (charDataRow.data ?? []) as unknown as ActiveCharacter[],
        }
      })()
    : null

  const detailUser = detail?.user ?? null
  const detailRoles = detail?.roles ?? []
  const charCount = detail?.charCount ?? 0
  const isBanned = detail?.isBanned ?? false
  const activeCharacters = detail?.activeCharacters ?? []

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

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
          Player Manager
        </h1>
        <p style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.62rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          margin: 0,
        }}>
          Search, inspect, and moderate player accounts
        </p>
      </div>

      {/* Two-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT — Search panel */}
        <div style={{
          background: 'var(--claret)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 7,
          padding: 20,
        }}>
          <div style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            marginBottom: 12,
          }}>
            Search Members
          </div>

          <PlayerSearch initialQuery={q} />

          {/* Results */}
          {q.trim() && (
            <div style={{ marginTop: 16 }}>
              {searchResults.length === 0 ? (
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontStyle: 'italic',
                  color: 'var(--faded)',
                  fontSize: '0.875rem',
                  margin: 0,
                }}>
                  No members found.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {searchResults.map((u) => {
                    const visibleRoles = u.user_roles
                      .map((ur) => ur.roles)
                      .filter((r) => r && !r.is_invisible)
                    const isSelected = selectedUserId === u.id
                    return (
                      <div
                        key={u.id}
                        style={{
                          background: isSelected ? 'var(--raised)' : 'var(--char)',
                          border: isSelected ? '1px solid var(--ember-dim)' : '1px solid transparent',
                          borderRadius: 4,
                          padding: '10px 12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {u.avatar_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={u.avatar_url}
                              alt=""
                              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: 'var(--raised)',
                              border: '1px solid var(--ember-dim)',
                              flexShrink: 0,
                            }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontFamily: 'var(--f-body)',
                              fontSize: '0.9rem',
                              color: 'var(--roseash)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {u.display_name}
                            </div>
                            <div style={{
                              fontFamily: 'var(--f-ui)',
                              fontSize: '0.55rem',
                              color: 'var(--faded)',
                              letterSpacing: '0.08em',
                            }}>
                              Joined {formatDate(u.created_at)}
                            </div>
                          </div>
                        </div>
                        {visibleRoles.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, paddingLeft: 36 }}>
                            {visibleRoles.map((r) => r && (
                              <span
                                key={r.name}
                                style={{
                                  fontFamily: 'var(--f-ui)',
                                  fontSize: '0.5rem',
                                  letterSpacing: '0.1em',
                                  textTransform: 'uppercase',
                                  color: 'var(--gold)',
                                  border: '1px solid var(--gold-dim)',
                                  borderRadius: 2,
                                  padding: '1px 5px',
                                }}
                              >
                                {r.display_name}
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ paddingLeft: 36 }}>
                          <Link
                            href={`/admin/players?q=${encodeURIComponent(q)}&user=${u.id}`}
                            style={{
                              fontFamily: 'var(--f-ui)',
                              fontSize: '0.58rem',
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              color: isSelected ? 'var(--faded)' : 'var(--moonstone)',
                              textDecoration: 'none',
                              pointerEvents: isSelected ? 'none' : 'auto',
                            }}
                          >
                            {isSelected ? 'Viewing' : 'View →'}
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {!q.trim() && (
            <p style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              color: 'var(--faded)',
              fontSize: '0.85rem',
              marginTop: 16,
              marginBottom: 0,
            }}>
              Enter a name to search.
            </p>
          )}
        </div>

        {/* RIGHT — Detail panel */}
        {detailUser ? (
          <div style={{
            background: 'var(--claret)',
            border: '1px solid var(--ember-dim)',
            borderRadius: 7,
            padding: 28,
          }}>
            {/* User header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {detailUser.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={detailUser.avatar_url}
                  alt=""
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--raised)',
                  border: '1px solid var(--ember-dim)',
                  flexShrink: 0,
                }} />
              )}
              <div>
                <div style={{
                  fontFamily: 'var(--f-head)',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--roseash)',
                  lineHeight: 1.2,
                }}>
                  {detailUser.display_name}
                </div>
                <div style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.12em',
                  color: 'var(--faded)',
                  marginTop: 4,
                }}>
                  Joined {formatDate(detailUser.created_at)}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
              <div style={{
                background: 'var(--raised)',
                border: '1px solid var(--ember-dim)',
                borderRadius: 4,
                padding: '12px 18px',
                flex: 1,
              }}>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  color: 'var(--roseash)',
                  lineHeight: 1,
                }}>
                  {charCount}
                </div>
                <div style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--faded)',
                  marginTop: 4,
                }}>
                  Characters
                </div>
              </div>
              <div style={{
                background: 'var(--raised)',
                border: '1px solid var(--gold-dim)',
                borderRadius: 4,
                padding: '12px 18px',
                flex: 1,
              }}>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: '1.6rem',
                  fontWeight: 600,
                  color: 'var(--gold)',
                  lineHeight: 1,
                }}>
                  {detailUser?.essence ?? 0}
                </div>
                <div style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--faded)',
                  marginTop: 4,
                }}>
                  Essence
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--ember-dim)', marginBottom: 24 }} />

            {/* Role list + ban/unban + economy actions (client component) */}
            <PlayerActions
              targetUserId={detailUser.id}
              targetDisplayName={detailUser.display_name}
              isBanned={isBanned}
              roles={detailRoles.map((ur) => ({
                id: ur.id,
                roleName: ur.roles?.name ?? '',
                displayName: ur.roles?.display_name ?? '',
                isInvisible: ur.roles?.is_invisible ?? false,
                isPermanent: ur.roles?.is_permanent ?? false,
              }))}
              essence={detailUser.essence}
              characters={activeCharacters}
            />

            {/* Link to role manager */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ember-dim)' }}>
              <Link
                href={`/admin/roles?user=${detailUser.id}`}
                style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--moonstone)',
                  textDecoration: 'none',
                }}
              >
                Manage Roles in Role Manager →
              </Link>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--claret)',
            border: '1px solid var(--ember-dim)',
            borderRadius: 7,
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}>
            <p style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              color: 'var(--faded)',
              margin: 0,
            }}>
              Select a member to view their profile.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
