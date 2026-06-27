import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import { getAdminClient } from '@/lib/supabase/adminClient'
import SettingsForm from './SettingsForm'

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

  const admin = getAdminClient()
  const { data: rows } = await admin
    .from('site_settings')
    .select('key, value')
    .order('key')

  const settings = Object.fromEntries(
    (rows ?? []).map((r) => [r.key, r.value])
  )

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--f-head)',
        fontSize: '1.9rem',
        fontWeight: 700,
        color: 'var(--roseash)',
        marginBottom: 8,
      }}>
        Site Settings
      </h1>
      <p style={{
        fontFamily: 'var(--f-body)',
        fontStyle: 'italic',
        color: 'var(--mist)',
        marginBottom: 32,
        fontSize: '0.9rem',
      }}>
        Configure global site behaviour, economy values, and integrations.
      </p>
      <SettingsForm settings={settings} />
    </div>
  )
}
