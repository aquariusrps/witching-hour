import { getAdminClient } from '@/lib/supabase/adminClient'
import { getMojoRpsWithCharacters } from '@/lib/db/mojo'
import MojoArchivedRps from './components/MojoArchivedRps'
import MojoRpCard, { type DashboardRp } from './components/MojoRpCard'

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

export default async function MojoDashboardPage() {
  const rps = await getMojoRpsWithCharacters()

  const admin = getAdminClient()

  const { count: activeThreadTotal } = await admin
    .from('mojo_threads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const { data: activeThreadRows } = await admin
    .from('mojo_threads')
    .select('rp_id')
    .eq('status', 'active')

  const activeThreadsByRp = new Map<string, number>()
  for (const row of activeThreadRows ?? []) {
    activeThreadsByRp.set(row.rp_id, (activeThreadsByRp.get(row.rp_id) ?? 0) + 1)
  }

  const activeRpCount = rps.filter((r) => r.status === 'active').length
  const totalCharacters = rps.reduce((sum, r) => sum + r.characters.length, 0)

  const dashboardRps: DashboardRp[] = rps.map((r) => ({
    id: r.id,
    name: r.name,
    site_name: r.site_name,
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

      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        <StatTile value={activeRpCount} label="Active RPs" />
        <StatTile value={totalCharacters} label="Total Characters" />
        <StatTile value={activeThreadTotal ?? 0} label="Active Threads" />
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
