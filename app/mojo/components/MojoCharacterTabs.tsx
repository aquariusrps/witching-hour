'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MojoCharacterNotes from './MojoCharacterNotes'
import MojoThreadTracker from './MojoThreadTracker'
import MojoResourcesTab from './MojoResourcesTab'
import MojoCharacterAvatarTabs from './MojoCharacterAvatarTabs'
import { SvgNavLibrary, SvgNavSearch, SvgNavStacks, SvgNavImages, SvgFiligreeRule } from './MojoSvgAssets'
import type { Tables } from '@/types/database'

type MojoCharacter = Tables<'mojo_characters'>
type MojoThread = Tables<'mojo_threads'>
type MojoResource = Tables<'mojo_resources'>
type MojoImageStack = Tables<'mojo_image_stacks'>
type MojoAvatar = Tables<'mojo_avatars'>

const TABS = [
  { key: 'notes', label: 'Notes', Icon: SvgNavLibrary },
  { key: 'threads', label: 'Threads', Icon: SvgNavSearch },
  { key: 'resources', label: 'Resources', Icon: SvgNavStacks },
  { key: 'avatars', label: 'Avatars', Icon: SvgNavImages },
] as const

type TabKey = (typeof TABS)[number]['key']

const VALID_TABS: TabKey[] = ['notes', 'threads', 'resources', 'avatars']

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
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as TabKey | null
  const [activeTab, setActiveTab] = useState<TabKey>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : 'notes'
  )

  return (
    <div>
      <div style={{
        display: 'flex',
        background: 'var(--char)',
        borderBottom: '1px solid var(--elevated)',
        position: 'relative',
        marginBottom: 0,
      }}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab
          const Icon = tab.Icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px',
                cursor: 'pointer',
                fontFamily: 'Cinzel, serif',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                transition: 'all 0.15s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                ...(isActive
                  ? {
                      color: 'var(--roseash)',
                      background: 'var(--raised)',
                      border: 'none',
                      borderTop: '1.5px solid var(--gold)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      borderRight: '1px solid rgba(255,255,255,0.06)',
                      marginBottom: '-1px',
                      borderBottom: '1px solid var(--raised)',
                      zIndex: 1,
                    }
                  : {
                      color: 'var(--faded)',
                      background: 'transparent',
                      border: 'none',
                      borderTop: '1.5px solid transparent',
                      opacity: 0.7,
                    }),
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--mist)'; e.currentTarget.style.opacity = '1' } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--faded)'; e.currentTarget.style.opacity = '0.7' } }}
            >
              <Icon active={isActive} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{
        background: `
          repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.006) 0px,
            rgba(255,255,255,0.006) 1px,
            transparent 1px,
            transparent 4px
          ),
          var(--claret)
        `,
        border: '1px solid rgba(255,255,255,0.04)',
        borderTop: 'none',
        borderRadius: '0 0 4px 4px',
        padding: 0,
      }}>
        <div style={{ color: 'var(--elevated)', padding: '12px 20px 0', opacity: 0.6 }}>
          <SvgFiligreeRule />
        </div>

        <div style={{ padding: '12px 20px 20px' }}>
          {activeTab === 'notes' && (
            <MojoCharacterNotes charId={charId} rpId={rpId} character={character} />
          )}

          {activeTab === 'threads' && (
            <MojoThreadTracker charId={charId} rpId={rpId} characterName={character.name} initialThreads={threads} />
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
      </div>
    </div>
  )
}
