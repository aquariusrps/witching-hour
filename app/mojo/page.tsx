import { getAdminClient } from '@/lib/supabase/adminClient'
import { getMojoRpsWithCharacters, getMojoDashboardStats } from '@/lib/db/mojo'
import MojoArchivedRps from './components/MojoArchivedRps'
import MojoRpCard, { type DashboardRp } from './components/MojoRpCard'
import MojoDashboardStatTile from './components/MojoDashboardStatTile'

function FiligreeDivider() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '14px auto 0',
      maxWidth: 360,
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--ember), var(--gold))' }} />
      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, var(--ember), var(--gold))' }} />
    </div>
  )
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div style={{
      flex: 1,
      background: 'var(--claret)',
      border: '1px solid var(--elevated)',
      borderRadius: 4,
      padding: 16,
    }}>
      <p style={{ fontFamily: 'var(--f-display)', fontSize: '1.75rem', color: 'var(--gold)', margin: '0 0 4px' }}>
        {value}
      </p>
      <p style={{
        fontFamily: 'var(--f-ui)',
        fontSize: '0.68rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--mist)',
        margin: 0,
      }}>
        {label}
      </p>
    </div>
  )
}

function StatsRowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--f-ui)',
      fontSize: '0.68rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--faded)',
      margin: '0 0 8px',
    }}>
      {children}
    </p>
  )
}

export default async function MojoDashboardPage() {
  const rps = await getMojoRpsWithCharacters()
  const stats = await getMojoDashboardStats()

  const admin = getAdminClient()

  const { data: activeThreadRows } = await admin
    .from('mojo_threads')
    .select('rp_id')
    .eq('status', 'active')

  const activeThreadsByRp = new Map<string, number>()
  for (const row of activeThreadRows ?? []) {
    activeThreadsByRp.set(row.rp_id, (activeThreadsByRp.get(row.rp_id) ?? 0) + 1)
  }

  const dashboardRps: DashboardRp[] = rps.map((r) => ({
    id: r.id,
    name: r.name,
    site_name: r.site_name,
    site_url: r.site_url,
    color_hex: r.color_hex,
    status: r.status,
    characterCount: r.characters.length,
    activeThreadCount: activeThreadsByRp.get(r.id) ?? 0,
  }))

  const activeRps = dashboardRps.filter((r) => r.status === 'active')
  const otherRps = dashboardRps.filter((r) => r.status !== 'active')

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          ✦ The Mojo Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Your personal RP command centre
        </p>
        <FiligreeDivider />
      </div>

      <div style={{ marginBottom: 20 }}>
        <StatsRowLabel>Roleplays</StatsRowLabel>
        <div style={{ display: 'flex', gap: 12 }}>
          <StatTile value={stats.activeRpCount} label="Active RPs" />
          <StatTile value={stats.characterCount} label="Total Characters" />
          <StatTile value={stats.activeThreadCount} label="Active Threads" />
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <StatsRowLabel>The Library</StatsRowLabel>
        <div style={{ display: 'flex', gap: 12 }}>
          <MojoDashboardStatTile href="/mojo/library" value={stats.snippetCount} label="Snippets" />
          <MojoDashboardStatTile href="/mojo/wishlist" value={stats.wishlistCount} label="Wishlist Items" />
          <MojoDashboardStatTile href="/mojo/partners" value={stats.partnerCount} label="Partners" />
        </div>
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--f-head)', fontSize: '1.15rem', color: 'var(--roseash)', margin: '0 0 14px' }}>
          Active Roleplays
        </h2>
        {activeRps.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
            No active roleplays yet. Use the sidebar to create your first one.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {activeRps.map((rp) => (
              <MojoRpCard key={rp.id} rp={rp} />
            ))}
          </div>
        )}
      </section>

      {otherRps.length > 0 && (
        <MojoArchivedRps rps={otherRps} />
      )}
    </div>
  )
}
