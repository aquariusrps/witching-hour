'use client'

import { useState } from 'react'
import MojoCharacterNotes from './MojoCharacterNotes'
import MojoThreadTracker from './MojoThreadTracker'
import type { Tables } from '@/types/database'

type MojoCharacter = Tables<'mojo_characters'>
type MojoThread = Tables<'mojo_threads'>

const TABS = [
  { key: 'notes', label: 'Notes' },
  { key: 'threads', label: 'Threads' },
  { key: 'resources', label: 'Resources' },
  { key: 'avatars', label: 'Avatars' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function MojoCharacterTabs({
  character,
  threads,
  charId,
  rpId,
}: {
  character: MojoCharacter
  threads: MojoThread[]
  charId: string
  rpId: string
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('notes')

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--elevated)', marginBottom: 24 }}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '10px 20px',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.8rem',
                color: isActive ? 'var(--gold)' : 'var(--faded)',
                borderBottom: isActive ? '2px solid var(--ember)' : '2px solid transparent',
                marginBottom: -1,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--mist)' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--faded)' }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'notes' && (
        <MojoCharacterNotes charId={charId} rpId={rpId} character={character} />
      )}

      {activeTab === 'threads' && (
        <MojoThreadTracker charId={charId} rpId={rpId} initialThreads={threads} />
      )}

      {activeTab === 'resources' && (
        <div>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', color: 'var(--gold)', margin: '0 0 8px' }}>
            Resources
          </h2>
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--mist)', margin: 0 }}>
            Character resource library — coming in MOJO-3.
          </p>
        </div>
      )}

      {activeTab === 'avatars' && (
        <div>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', color: 'var(--gold)', margin: '0 0 8px' }}>
            Avatars
          </h2>
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--mist)', margin: 0 }}>
            Avatar manager with crop, resize, and one-click URL copy — coming in MOJO-4.
          </p>
        </div>
      )}
    </div>
  )
}
