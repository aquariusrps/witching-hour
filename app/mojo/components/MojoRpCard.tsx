import Link from 'next/link'

export type DashboardRp = {
  id: string
  name: string
  site_name: string
  color_hex: string
  status: string
  characterCount: number
  activeThreadCount: number
}

export default function MojoRpCard({ rp, mutedBorder }: { rp: DashboardRp; mutedBorder?: boolean }) {
  return (
    <div style={{
      borderLeft: `4px solid ${mutedBorder ? 'var(--faded)' : rp.color_hex}`,
      background: 'var(--claret)',
      border: '1px solid var(--elevated)',
      borderLeftWidth: 4,
      borderRadius: 4,
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <Link
          href={`/mojo/rps/${rp.id}`}
          style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', textDecoration: 'none' }}
        >
          {rp.name}
        </Link>
        {mutedBorder && (
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: rp.status === 'hiatus' ? 'var(--gold-dim)' : 'var(--faded)',
            flexShrink: 0,
          }}>
            {rp.status}
          </span>
        )}
      </div>
      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--mist)', margin: '4px 0 10px' }}>
        {rp.site_name}
      </p>
      <div style={{ display: 'flex', gap: 14 }}>
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', color: 'var(--faded)' }}>
          {rp.characterCount} character{rp.characterCount === 1 ? '' : 's'}
        </span>
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', color: 'var(--gold-dim)' }}>
          {rp.activeThreadCount} active thread{rp.activeThreadCount === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  )
}
