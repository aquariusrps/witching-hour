import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'
import { getMojoRpsWithCharacters } from '@/lib/db/mojo'
import MojoSidebar from './components/MojoSidebar'

export default async function MojoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!userId) redirect('/')

  const superAdmin = await isSuperAdmin(userId)
  if (!superAdmin) redirect('/')

  const rps = await getMojoRpsWithCharacters()

  return (
    <div data-theme="silver-onyx" style={{ display: 'flex', minHeight: '100vh', background: 'var(--char)' }}>
      <MojoSidebar rps={rps} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 28px',
          borderBottom: '1px solid var(--elevated)',
        }}>
          <Link
            href="/mojo"
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.85rem',
              color: 'var(--gold)',
              textDecoration: 'none',
            }}
          >
            ✦ Mojo
          </Link>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--f-body)',
              fontSize: '0.8rem',
              color: 'var(--faded)',
              textDecoration: 'none',
            }}
          >
            ← Back to TWH
          </Link>
        </header>

        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
