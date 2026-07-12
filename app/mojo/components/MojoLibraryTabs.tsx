'use client'

import { useState } from 'react'
import MojoSnippetCard from './MojoSnippetCard'
import type { Tables } from '@/types/database'

type MojoSnippet = Tables<'mojo_snippets'>

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'general', label: 'General' },
  { key: 'app_code', label: 'App Code' },
  { key: 'template', label: 'Templates' },
  { key: 'formatting', label: 'Formatting' },
  { key: 'other', label: 'Other' },
] as const

type FilterKey = (typeof FILTER_TABS)[number]['key']

export default function MojoLibraryTabs({ snippets }: { snippets: MojoSnippet[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const filtered = activeFilter === 'all' ? snippets : snippets.filter((s) => s.type === activeFilter)

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
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
          No snippets of this type yet.
        </p>
      ) : (
        <div>
          {filtered.map((s) => (
            <MojoSnippetCard key={s.id} snippet={s} />
          ))}
        </div>
      )}
    </div>
  )
}
