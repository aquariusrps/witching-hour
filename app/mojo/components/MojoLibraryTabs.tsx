'use client'

import { useState } from 'react'
import MojoSnippetCard from './MojoSnippetCard'
import { SvgNavLibrary, SvgFiligreeRule } from '@/app/mojo/components/MojoSvgAssets'
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
      <div style={{ display: 'flex', gap: '2px', marginBottom: 0, flexWrap: 'wrap', borderBottom: '1px solid var(--elevated)', position: 'relative' }}>
        {FILTER_TABS.map((tab) => {
          const isActive = tab.key === activeFilter
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              style={{
                padding: '7px 20px',
                cursor: 'pointer',
                fontFamily: 'Cinzel, serif',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                ...(isActive
                  ? {
                      color: 'var(--roseash)',
                      background: 'var(--raised)',
                      borderTop: '1.5px solid var(--gold)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      borderRight: '1px solid rgba(255,255,255,0.06)',
                      borderBottom: '1px solid var(--raised)',
                      marginBottom: '-1px',
                      zIndex: 1,
                      boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
                    }
                  : {
                      color: 'var(--faded)',
                      background: 'transparent',
                      borderTop: '1.5px solid transparent',
                    }),
              }}
            >
              <SvgNavLibrary active={isActive} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{ color: 'var(--elevated)', padding: '8px 0 12px', opacity: 0.6 }}>
        <SvgFiligreeRule />
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
