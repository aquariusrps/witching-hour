import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'
import { getMojoRpsWithCharacters } from '@/lib/db/mojo'
import MojoSidebar from './components/MojoSidebar'
import MojoMobileNav from './components/MojoMobileNav'
import { SvgCrescent, SvgPortalIcon } from './components/MojoSvgAssets'

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
    <div
      data-theme="silver-onyx"
      className="mojo-bg-tile"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 85% 8%, rgba(90,74,122,0.20) 0%, transparent 45%),
          radial-gradient(ellipse at 12% 92%, rgba(60,50,80,0.18) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 50%, rgba(18,16,24,1) 0%, var(--char) 100%)
        `,
      }}
    >
      <MojoMobileNav>
        <MojoSidebar rps={rps} />
      </MojoMobileNav>

      <div className="mojo-content-area" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,10,16,0.4)',
          backdropFilter: 'blur(8px)',
        }}>
          <Link
            href="/mojo"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <SvgCrescent size={16} style={{ color: 'var(--gold)' }} />
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '13px',
              letterSpacing: '0.35em',
              color: 'var(--roseash)',
              marginLeft: '8px',
            }}>
              MOJO
            </span>
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'var(--f-body)',
              fontSize: '0.8rem',
              color: 'var(--faded)',
              textDecoration: 'none',
            }}
          >
            <SvgPortalIcon
              style={{ color: 'var(--faded)', marginRight: '5px' }}
              className="mojo-portal-glow"
            />
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
