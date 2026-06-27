import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { isSuperAdmin } from '@/lib/permissions'
import { getCachedFactions } from '@/lib/cached-settings'
import { RoleSearch } from './RoleSearch'
import { RoleManager } from './RoleManager'

type SearchUser = {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string | null
  user_roles: Array<{
    roles: {
      name: string
      display_name: string
      is_invisible: boolean
    } | null
  }>
}

type UserRole = {
  id: string
  scope_id: string | null
  granted_at: string | null
  roles: {
    id: string
    name: string
    display_name: string
    is_invisible: boolean
    is_permanent: boolean
  } | null
}

export default async function AdminRolesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; user?: string }>
}) {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const superAdmin = await isSuperAdmin(userId)
  if (!superAdmin) redirect('/admin')

  const { q = '', user: selectedUserId } = await searchParams
  const admin = getAdminClient()

  // Search results
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

  // Selected user detail
  type SimpleUser = { id: string; display_name: string; avatar_url: string | null; created_at: string | null }

  const detail = selectedUserId
    ? await (async () => {
        const [userRow, rolesRow, factionsData] = await Promise.all([
          admin
            .from('users')
            .select('id, display_name, avatar_url, created_at')
            .eq('id', selectedUserId)
            .single(),
          admin
            .from('user_roles')
            .select('id, scope_id, granted_at, roles(id, name, display_name, is_invisible, is_permanent)')
            .eq('user_id', selectedUserId),
          getCachedFactions(),
        ])
        return {
          user: userRow.data as unknown as SimpleUser | null,
          roles: (rolesRow.data ?? []) as unknown as UserRole[],
          factions: factionsData.map((f) => ({ id: f.id, name: f.name, color_hex: f.color_hex })),
        }
      })()
    : null

  const detailUser = detail?.user ?? null
  const userRoles = detail?.roles ?? []
  const factions = detail?.factions ?? []

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{
            fontFamily: 'var(--f-heading)',
            fontSize: '1.9rem',
            fontWeight: 700,
            color: 'var(--roseash)',
            margin: 0,
          }}>
            Role &amp; Admin Manager
          </h1>
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.58rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            border: '1px solid var(--gold-dim)',
            borderRadius: 2,
            padding: '2px 8px',
          }}>
            Super Admin
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.62rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          margin: 0,
        }}>
          Grant and revoke roles and admin permissions
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
            Find Member
          </div>

          <RoleSearch initialQuery={q} />

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
                          border: isSelected ? '1px solid var(--gold-dim)' : '1px solid transparent',
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
                              {formatDate(u.created_at)}
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
                            href={`/admin/roles?q=${encodeURIComponent(q)}&user=${u.id}`}
                            style={{
                              fontFamily: 'var(--f-ui)',
                              fontSize: '0.58rem',
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              color: isSelected ? 'var(--faded)' : 'var(--gold)',
                              textDecoration: 'none',
                              pointerEvents: isSelected ? 'none' : 'auto',
                            }}
                          >
                            {isSelected ? 'Managing' : 'Manage Roles →'}
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

        {/* RIGHT — Role assignment panel */}
        {detailUser ? (
          <div style={{
            background: 'var(--claret)',
            border: '1px solid var(--ember-dim)',
            borderRadius: 7,
            padding: 28,
          }}>
            {/* User header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              {detailUser.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={detailUser.avatar_url}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--raised)',
                  border: '1px solid var(--ember-dim)',
                  flexShrink: 0,
                }} />
              )}
              <div>
                <div style={{
                  fontFamily: 'var(--f-heading)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: 'var(--roseash)',
                  lineHeight: 1.2,
                }}>
                  {detailUser.display_name}
                </div>
                <div style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.57rem',
                  letterSpacing: '0.1em',
                  color: 'var(--faded)',
                  marginTop: 4,
                }}>
                  Joined {formatDate(detailUser.created_at)}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--ember-dim)', marginBottom: 24 }} />

            <RoleManager
              targetUserId={detailUser.id}
              targetDisplayName={detailUser.display_name}
              initialRoles={userRoles}
              factions={factions}
            />
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
              Search for a member to manage their roles.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
