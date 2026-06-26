import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getCachedSiteSettings } from '@/lib/cached-settings'
import { getUserRow } from '@/lib/db/users'
import { logSession } from '@/lib/db/session'
import Masthead from '@/app/components/Masthead'
import Footer from '@/app/components/Footer'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  const [settings, { data: { user } }, userRow] = await Promise.all([
    getCachedSiteSettings(),
    supabase.auth.getUser(),
    getUserRow(userId),
  ])

  if (!user) redirect('/login')

  const hdrs = await headers()
  void logSession(user.id, hdrs)

  const theme = userRow?.theme_preference ?? 'blood-moon'

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--char)', display: 'flex', flexDirection: 'column' }}>
      <Masthead user={userRow} settings={settings} />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <Footer />
    </div>
  )
}
