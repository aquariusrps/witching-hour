import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'

export default async function AdminApothecaryPage() {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const [permissions, superAdmin] = await Promise.all([
    getUserPermissions(userId),
    isSuperAdmin(userId),
  ])

  if (!superAdmin && !permissions.includes('manage_apothecary')) {
    redirect('/admin')
  }

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--f-heading)',
        fontSize: '1.9rem',
        fontWeight: 700,
        color: 'var(--roseash)',
        marginBottom: 12,
      }}>
        Apothecary Manager
      </h1>
      <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--mist)' }}>
        Coming in TWH-7.x
      </p>
    </div>
  )
}
