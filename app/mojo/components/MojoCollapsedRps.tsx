'use client'

import { useState } from 'react'
import MojoDashboardRpPanel from './MojoDashboardRpPanel'
import { SvgFiligreeRule } from '@/app/mojo/components/MojoSvgAssets'
import type { DashboardRp } from '@/lib/db/mojo'

export default function MojoCollapsedRps({ rps }: { rps: DashboardRp[] }) {
  const [showSection, setShowSection] = useState(false)

  return (
    <div>
      <div style={{ color: 'var(--elevated)', margin: '16px 0 12px', opacity: 0.4 }}>
        <SvgFiligreeRule />
      </div>

      <div
        onClick={() => setShowSection((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: showSection ? 14 : 0, color: 'var(--faded)', opacity: 0.6 }}
      >
        <span style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--faded)' }}>
          On Hiatus &amp; Archived ({rps.length})
        </span>
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', color: 'var(--faded)' }}>
          {showSection ? '▼ Hide' : '▶ Show'}
        </span>
      </div>

      {showSection && (
        <div>
          {rps.map((rp) => (
            <MojoDashboardRpPanel key={rp.id} rp={rp} muted />
          ))}
        </div>
      )}
    </div>
  )
}
