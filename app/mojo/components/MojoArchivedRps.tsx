'use client'

import { useState } from 'react'
import MojoRpCard, { type DashboardRp } from './MojoRpCard'

export default function MojoArchivedRps({ rps }: { rps: DashboardRp[] }) {
  const [open, setOpen] = useState(false)

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'var(--f-ui)',
          fontSize: '0.75rem',
          letterSpacing: '0.06em',
          color: 'var(--faded)',
          marginBottom: open ? 14 : 0,
        }}
      >
        {open ? '▾' : '▸'} Archived &amp; On Hiatus ({rps.length})
      </button>

      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {rps.map((rp) => (
            <MojoRpCard key={rp.id} rp={rp} mutedBorder />
          ))}
        </div>
      )}
    </section>
  )
}
