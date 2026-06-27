import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'

export default async function AdminSettingsPage() {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const [permissions, superAdmin] = await Promise.all([
    getUserPermissions(userId),
    isSuperAdmin(userId),
  ])

  if (
    !superAdmin &&
    !permissions.includes('manage_site') &&
    !permissions.includes('manage_waitlist')
  ) {
    redirect('/admin')
  }

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--f-heading)',
        fontSize: '1.9rem',
        fontWeight: 700,
        color: 'var(--roseash)',
        marginBottom: 16,
      }}>
        Site Settings
      </h1>
      <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--mist)' }}>
        Site Settings — coming in TWH-2.6
      </p>
    </div>
  )
}
