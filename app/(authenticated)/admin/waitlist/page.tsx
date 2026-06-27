import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { CANONS } from '@/lib/canons'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default async function AdminWaitlistPage() {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const [permissions, superAdmin] = await Promise.all([
    getUserPermissions(userId),
    isSuperAdmin(userId),
  ])

  if (!superAdmin && !permissions.includes('manage_waitlist')) {
    redirect('/admin')
  }

  const admin = getAdminClient()
  const { data: signups, count } = await admin
    .from('waitlist_signups')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  const list = signups ?? []

  const byCanon = list.reduce<Record<string, number>>((acc, s) => {
    acc[s.canon] = (acc[s.canon] ?? 0) + 1
    return acc
  }, {})

  const canonColorMap = Object.fromEntries(CANONS.map((c) => [c.db, c.color]))

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--f-heading)',
        fontSize: '1.9rem',
        fontWeight: 700,
        color: 'var(--roseash)',
        marginBottom: 8,
      }}>
        Waitlist Manager
      </h1>
      <p style={{
        fontFamily: 'var(--f-body)',
        fontStyle: 'italic',
        color: 'var(--mist)',
        marginBottom: 32,
        fontSize: '0.9rem',
      }}>
        Read-only view of pre-launch signups. Export and management coming in a future update.
      </p>

      {/* Stat card */}
      <div style={{
        display: 'inline-block',
        background: 'var(--claret)',
        border: '1px solid var(--ember-dim)',
        borderRadius: 'var(--r-md)',
        padding: '16px 28px',
        marginBottom: 24,
      }}>
        <div style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.55rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          marginBottom: 4,
        }}>
          Total Signups
        </div>
        <div style={{
          fontFamily: 'var(--f-display)',
          fontSize: '2.4rem',
          fontWeight: 600,
          color: 'var(--gold)',
          lineHeight: 1,
        }}>
          {count ?? 0}
        </div>
      </div>

      {/* Canon breakdown */}
      {Object.keys(byCanon).length > 0 && (
        <div style={{
          background: 'var(--claret)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 'var(--r-md)',
          padding: 20,
          marginBottom: 28,
        }}>
          <div style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.55rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            marginBottom: 14,
          }}>
            By Canon
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(byCanon)
              .sort((a, b) => b[1] - a[1])
              .map(([canon, n]) => {
                const color = canonColorMap[canon] ?? '#6a4838'
                const canonLabel = CANONS.find((c) => c.db === canon)?.label ?? canon
                return (
                  <div key={canon} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '5px 12px',
                    background: 'var(--raised)',
                    border: `1px solid ${color}55`,
                    borderRadius: 'var(--r-sm)',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: color,
                      boxShadow: `0 0 4px ${color}`,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.65rem',
                      letterSpacing: '0.06em',
                      color: 'var(--mist)',
                    }}>
                      {canonLabel}
                    </span>
                    <span style={{
                      fontFamily: 'var(--f-body)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color,
                    }}>
                      {n}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Signups table */}
      {list.length === 0 ? (
        <p style={{
          fontFamily: 'var(--f-body)',
          fontStyle: 'italic',
          color: 'var(--mist)',
          marginTop: 32,
        }}>
          No signups yet.
        </p>
      ) : (
        <div style={{
          background: 'var(--claret)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ember-dim)', background: 'var(--raised)' }}>
                {['Name', 'Email', 'Canon', 'Joined'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--faded)',
                    textAlign: 'left',
                    fontWeight: 400,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => {
                const color = canonColorMap[s.canon] ?? '#6a4838'
                const canonLabel = CANONS.find((c) => c.db === s.canon)?.label ?? s.canon
                return (
                  <tr key={s.id} style={{
                    borderBottom: i < list.length - 1 ? '1px solid var(--raised)' : undefined,
                  }}>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--f-body)', fontSize: '0.88rem', color: 'var(--roseash)' }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--mist)', maxWidth: 200 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {s.email}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '2px 8px',
                        background: `${color}22`,
                        border: `1px solid ${color}55`,
                        borderRadius: 'var(--r-xs)',
                        fontFamily: 'var(--f-ui)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.06em',
                        color,
                        whiteSpace: 'nowrap',
                      }}>
                        {canonLabel}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span title={formatDate(s.created_at)} style={{
                        fontFamily: 'var(--f-body)',
                        fontSize: '0.78rem',
                        color: 'var(--faded)',
                      }}>
                        {relativeTime(s.created_at)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
