'use client'

import { useState } from 'react'
import MojoCharacterNotes from './MojoCharacterNotes'
import MojoThreadTracker from './MojoThreadTracker'
import MojoResourcesTab from './MojoResourcesTab'
import MojoCharacterAvatarTabs from './MojoCharacterAvatarTabs'
import type { Tables } from '@/types/database'

type MojoCharacter = Tables<'mojo_characters'>
type MojoThread = Tables<'mojo_threads'>
type MojoResource = Tables<'mojo_resources'>
type MojoImageStack = Tables<'mojo_image_stacks'>
type MojoAvatar = Tables<'mojo_avatars'>

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
  resources,
  faceclaimResources,
  faceclaimName,
  characterStacks,
  characterAvatars,
}: {
  character: MojoCharacter
  threads: MojoThread[]
  charId: string
  rpId: string
  resources: MojoResource[]
  faceclaimResources: MojoResource[]
  faceclaimName: string | null
  characterStacks: Array<MojoImageStack & { member_count: number }>
  characterAvatars: MojoAvatar[]
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
        <MojoResourcesTab
          charId={charId}
          rpId={rpId}
          faceclaimId={character.faceclaim_id}
          faceclaimName={faceclaimName}
          resources={resources}
          faceclaimResources={faceclaimResources}
        />
      )}

      {activeTab === 'avatars' && (
        <MojoCharacterAvatarTabs
          charId={charId}
          rpId={rpId}
          characterStacks={characterStacks}
          primaryStackId={character.primary_stack_id}
          characterAvatars={characterAvatars}
          faceclaimId={character.faceclaim_id}
        />
      )}
    </div>
  )
}
