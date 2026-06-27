import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'

const MOD_SECTIONS = [
  {
    label: 'Reports Queue',
    href: '/mod',
    permission: 'moderate_boards',
  },
  {
    label: 'Faction Tools',
    href: '/mod/faction',
    permission: 'manage_faction',
  },
  {
    label: 'Announcements',
    href: '/mod/announcements',
    permission: 'post_announcement',
  },
]

export default async function ModLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) redirect('/login')

  const [permissions, superAdmin] = await Promise.all([
    getUserPermissions(userId),
    isSuperAdmin(userId),
  ])

  const hasModAccess =
    superAdmin ||
    permissions.some((p) =>
      ['moderate_boards', 'manage_faction', 'post_announcement'].includes(p)
    )

  if (!hasModAccess) redirect('/dashboard')

  const visibleSections = MOD_SECTIONS.filter(
    (s) => superAdmin || permissions.includes(s.permission)
  )

  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 96px)' }}>
      {/* Mod nav sidebar */}
      <nav style={{
        background: 'var(--claret)',
        borderRight: '1px solid var(--ember-dim)',
        width: 200,
        flexShrink: 0,
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <span style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.5rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          padding: '0 20px 8px',
        }}>
          Mod Panel
        </span>
        {visibleSections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: 'block',
              padding: '7px 20px',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              color: 'var(--mist)',
              textDecoration: 'none',
            }}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <main style={{ flex: 1, padding: '32px 40px', minWidth: 0, background: 'var(--char)' }}>
        {children}
      </main>
    </div>
  )
}
