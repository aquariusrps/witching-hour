import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import AdminNav from './AdminNav'

const ADMIN_PANEL_PERMISSIONS = [
  'manage_site', 'manage_users', 'manage_factions',
  'manage_boards', 'manage_events', 'manage_apothecary',
  'manage_waitlist', 'approve_characters', 'award_xp',
  'ban_users', 'manage_admins', 'moderate_boards',
]

export default async function AdminLayout({
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

  const hasAnyAdminAccess =
    superAdmin ||
    permissions.some((p) => ADMIN_PANEL_PERMISSIONS.includes(p))

  if (!hasAnyAdminAccess) redirect('/dashboard')

  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 96px)' }}>
      <AdminNav permissions={permissions} superAdmin={superAdmin} />
      <main style={{ flex: 1, padding: '32px 40px', minWidth: 0, background: 'var(--char)' }}>
        {children}
      </main>
    </div>
  )
}
