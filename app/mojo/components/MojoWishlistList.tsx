'use client'

import { useState } from 'react'
import MojoWishlistItem from './MojoWishlistItem'
import { SvgCandleFlame, SvgCandleUnlit, SvgCandleSnuffed } from '@/app/mojo/components/MojoSvgAssets'
import type { Tables } from '@/types/database'

type MojoWishlist = Tables<'mojo_wishlist'>

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'idea', label: 'Ideas' },
  { key: 'active', label: 'Active' },
  { key: 'shelved', label: 'Shelved' },
] as const

type FilterKey = (typeof FILTER_TABS)[number]['key']

const STATUS_SECTIONS: Array<{ key: 'idea' | 'active' | 'shelved'; label: string }> = [
  { key: 'idea', label: 'Ideas' },
  { key: 'active', label: 'Active' },
  { key: 'shelved', label: 'Shelved' },
]

function SectionCandle({ status }: { status: 'idea' | 'active' | 'shelved' }) {
  if (status === 'active') {
    return (
      <div aria-hidden="true" style={{ color: 'var(--roseash)' }}>
        <SvgCandleFlame size={14} delay="0s" />
      </div>
    )
  }
  if (status === 'idea') {
    return (
      <div aria-hidden="true" style={{ color: 'var(--faded)' }}>
        <SvgCandleUnlit size={14} />
      </div>
    )
  }
  return (
    <div aria-hidden="true" style={{ color: 'var(--faded)' }}>
      <SvgCandleSnuffed size={14} />
    </div>
  )
}

export default function MojoWishlistList({ items }: { items: MojoWishlist[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const filtered = activeFilter === 'all' ? items : items.filter((i) => i.status === activeFilter)

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {FILTER_TABS.map((tab) => {
          const isActive = tab.key === activeFilter
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.68rem',
                color: isActive ? 'var(--gold)' : 'var(--faded)',
                borderBottom: isActive ? '1px solid var(--ember)' : '1px solid transparent',
                paddingBottom: 2,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '24px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          textAlign: 'center',
        }}>
          Your desires await.
        </p>
      ) : activeFilter === 'all' ? (
        <div>
          {STATUS_SECTIONS.map(({ key, label }) => {
            const sectionItems = filtered.filter((i) => i.status === key)
            if (sectionItems.length === 0) return null
            return (
              <div key={key} style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  marginTop: '20px',
                  color: 'var(--faded)',
                }}>
                  <SectionCandle status={key} />
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}>
                    {label} ({sectionItems.length})
                  </span>
                  <div style={{
                    flex: 1, height: '1px',
                    background: 'var(--elevated)', opacity: 0.35,
                  }} />
                </div>
                {sectionItems.map((item) => (
                  <MojoWishlistItem key={item.id} item={item} />
                ))}
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          {filtered.map((item) => (
            <MojoWishlistItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
