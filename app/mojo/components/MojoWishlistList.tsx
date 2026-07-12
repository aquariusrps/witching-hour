'use client'

import { useState } from 'react'
import MojoWishlistItem from './MojoWishlistItem'
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
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
          Nothing here yet.
        </p>
      ) : activeFilter === 'all' ? (
        <div>
          {STATUS_SECTIONS.map(({ key, label }) => {
            const sectionItems = filtered.filter((i) => i.status === key)
            if (sectionItems.length === 0) return null
            return (
              <div key={key} style={{ marginBottom: 24 }}>
                <h3 style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--faded)',
                  margin: '0 0 10px',
                }}>
                  {label} ({sectionItems.length})
                </h3>
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
