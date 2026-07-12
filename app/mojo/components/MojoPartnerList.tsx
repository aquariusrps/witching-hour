'use client'

import { useState } from 'react'
import MojoPartnerCard from './MojoPartnerCard'
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
      {partners.map((partner) => (
        <MojoPartnerCard
          key={partner.id}
          partner={partner}
          isExpanded={expandedPartnerId === partner.id}
          onToggle={() =>
            setExpandedPartnerId((current) => (current === partner.id ? null : partner.id))
          }
        />
      ))}
    </div>
  )
}
