'use client'

import { useState } from 'react'
import MojoPartnerCard from './MojoPartnerCard'
import { SvgFiligreeRule } from './MojoSvgAssets'
import type { Tables } from '@/types/database'

type MojoPartner = Tables<'mojo_partners'>

export default function MojoPartnerList({ partners }: { partners: MojoPartner[] }) {
  const [expandedPartnerId, setExpandedPartnerId] = useState<string | null>(null)

  if (partners.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
        No partners yet. Add your first co-author above.
      </p>
    )
  }

  return (
    <div>
      {partners.map((partner, index) => (
        <div key={partner.id}>
          {index > 0 && (
            <div style={{
              color: 'var(--elevated)',
              padding: '4px 0',
              opacity: 0.35,
            }}>
              <SvgFiligreeRule />
            </div>
          )}
          <MojoPartnerCard
            partner={partner}
            isExpanded={expandedPartnerId === partner.id}
            onToggle={() =>
              setExpandedPartnerId((current) => (current === partner.id ? null : partner.id))
            }
          />
        </div>
      ))}
    </div>
  )
}
