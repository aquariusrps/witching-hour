import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { isSuperAdmin } from '@/lib/permissions'

export default async function AdminDashboardPage() {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const admin = getAdminClient()

  const [userCount, pendingCharCount, openReportCount, superAdmin] = await Promise.all([
    admin.from('users').select('id', { count: 'exact', head: true }),
    admin.from('characters').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('post_reports').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    isSuperAdmin(userId),
  ])

  const stats = [
    {
      label: 'Total Members',
      value: userCount.count ?? 0,
      highlight: false,
    },
    {
      label: 'Characters Awaiting Approval',
      value: pendingCharCount.count ?? 0,
      highlight: (pendingCharCount.count ?? 0) > 0,
    },
    {
      label: 'Open Reports',
      value: openReportCount.count ?? 0,
      highlight: (openReportCount.count ?? 0) > 0,
    },
  ]

  return (
    <div>
      {/* Heading */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h1 style={{
            fontFamily: 'var(--f-head)',
            fontSize: '1.9rem',
            fontWeight: 700,
            color: 'var(--roseash)',
            margin: 0,
          }}>
            Admin Panel
          </h1>
          {superAdmin && (
            <span style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              border: '1px solid var(--gold-dim)',
              borderRadius: 2,
              padding: '2px 8px',
            }}>
              Super Admin
            </span>
          )}
        </div>
        <p style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          margin: 0,
        }}>
          The Council Chamber
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--claret)',
              border: '1px solid var(--ember-dim)',
              borderRadius: 4,
              padding: '24px 28px',
            }}
          >
            <div style={{
              fontFamily: 'var(--f-head)',
              fontSize: '2.4rem',
              fontWeight: 700,
              color: stat.highlight ? 'var(--ember)' : 'var(--roseash)',
              lineHeight: 1,
              marginBottom: 8,
            }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--mist)',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
