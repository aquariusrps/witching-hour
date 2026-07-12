import { getMojoDashboardData } from '@/lib/db/mojo'
import MojoDashboardStatTile from './components/MojoDashboardStatTile'
import MojoDashboardRpPanel from './components/MojoDashboardRpPanel'
import MojoCollapsedRps from './components/MojoCollapsedRps'

function FiligreeDivider() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '20px auto',
      maxWidth: 360,
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--ember), var(--gold))' }} />
      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, var(--ember), var(--gold))' }} />
    </div>
  )
}

export default async function MojoDashboardPage() {
  const { stats, activeRps, inactiveRps } = await getMojoDashboardData()

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.875rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          ✦ The Mojo Dashboard
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Your personal RP command centre
        </p>
      </div>

      <FiligreeDivider />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <MojoDashboardStatTile href="/mojo" value={stats.activeRpCount} label="Active RPs" />
        <MojoDashboardStatTile href="/mojo" value={stats.characterCount} label="Characters" />
        <MojoDashboardStatTile href="/mojo" value={stats.activeThreadCount} label="Active Threads" />
        <MojoDashboardStatTile href="/mojo/library" value={stats.snippetCount} label="Snippets" />
        <MojoDashboardStatTile href="/mojo/partners" value={stats.partnerCount} label="Partners" />
        <MojoDashboardStatTile href="/mojo/stacks" value={stats.stackCount} label="Stacks" />
      </div>

      <FiligreeDivider />

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--f-head)', fontSize: '1.25rem', color: 'var(--roseash)', margin: '0 0 16px' }}>
          Active Roleplays
        </h2>
        {activeRps.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)', textAlign: 'center' }}>
            No active roleplays yet. Create one using the sidebar.
          </p>
        ) : (
          activeRps.map((rp) => <MojoDashboardRpPanel key={rp.id} rp={rp} />)
        )}
      </section>

      {inactiveRps.length > 0 && (
        <MojoCollapsedRps rps={inactiveRps} />
      )}
    </div>
  )
}
