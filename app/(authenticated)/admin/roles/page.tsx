import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'

export default async function AdminRolesPage() {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const superAdmin = await isSuperAdmin(userId)

  if (!superAdmin) {
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
        Role &amp; Admin Manager
      </h1>
      <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--mist)' }}>
        Role &amp; Admin Manager — coming in TWH-2.7
      </p>
    </div>
  )
}
