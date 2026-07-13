'use client'

import { useState } from 'react'
import { updateMojoCharacterStatus } from '@/lib/actions/mojo'
import { deriveWhoseTurn } from '@/lib/mojo/utils'
import type { DashboardCharacter } from '@/lib/db/mojo'
import MojoPortraitCard from './MojoPortraitCard'

function navigateToDashboard() {
  window.location.href = '/mojo'
}

function navigateToChar(charId: string) {
  window.location.href = '/mojo/characters/' + charId
}

function navigateToCharTab(charId: string, tab: string) {
  window.location.href = '/mojo/characters/' + charId + '?tab=' + tab
}

const QUICK_ACTION_STYLE: React.CSSProperties = {
  padding: '4px 0',
  cursor: 'pointer',
  fontFamily: 'var(--f-ui)',
  fontSize: '0.625rem',
  background: 'transparent',
  border: 'none',
}

export default function MojoDashboardCharCard({
  character,
}: {
  character: DashboardCharacter
  rpId: string
}) {
  const [isActing, setIsActing] = useState(false)

  const avatarToken = character.primary_stack_token ?? character.avatar_token
  const isArchived = character.status === 'archived'

  const myTurnCount = character.active_threads.filter(
    (t) => deriveWhoseTurn(t, character.name) === 'mine'
  ).length

  async function handleArchiveToggle() {
    setIsActing(true)
    const result = await updateMojoCharacterStatus(character.id, isArchived ? 'active' : 'archived')
    if ('error' in result) {
      setIsActing(false)
      return
    }
    navigateToDashboard()
  }

  return (
    <div
      style={{
        width: 160,
        flex: 'none',
        background: 'var(--raised)',
        border: '1px solid var(--elevated)',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: isArchived ? 0.6 : 1,
      }}
    >
      <div
        style={{
          width: '110px',
          margin: '10px auto 0',
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={() => navigateToChar(character.id)}
      >
        <MojoPortraitCard
          token={avatarToken}
          alt={character.name}
          size="sm"
          idSuffix={`dash-char-${character.id}`}
        />

        {myTurnCount > 0 && (
          <span
            title={`${myTurnCount} thread${myTurnCount === 1 ? '' : 's'} awaiting your reply`}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'var(--gold)',
              color: 'white',
              fontSize: '9px',
              fontFamily: 'Cinzel, serif',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 0 8px rgba(160,40,64,0.4)',
            }}
          >
            {myTurnCount}↻
          </span>
        )}
      </div>

      <div style={{ padding: 8 }}>
        <span
          onClick={() => navigateToChar(character.id)}
          style={{
            display: 'block',
            fontFamily: 'var(--f-head)',
            fontSize: '0.8125rem',
            color: 'var(--roseash)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {character.name}
        </span>
        {character.faceclaim_name && (
          <span style={{ display: 'block', fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.6875rem', color: 'var(--faded)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {character.faceclaim_name}
          </span>
        )}
        {isArchived && (
          <span style={{ display: 'block', fontFamily: 'var(--f-ui)', fontSize: '0.6rem', color: 'var(--faded)', marginTop: 2 }}>
            [archived]
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--elevated)', padding: '4px 8px 8px', position: 'relative' }}>
        {isActing ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
            <style>{`
              @keyframes mojoCharCardSpin {
                0%, 20% { opacity: 0.2; }
                50% { opacity: 1; }
                100% { opacity: 0.2; }
              }
              .mojo-charcard-dot { animation: mojoCharCardSpin 1.2s infinite ease-in-out; display: inline-block; color: var(--faded); font-size: 0.75rem; }
              .mojo-charcard-dot:nth-child(2) { animation-delay: 0.2s; }
              .mojo-charcard-dot:nth-child(3) { animation-delay: 0.4s; }
            `}</style>
            <span className="mojo-charcard-dot">•</span>
            <span className="mojo-charcard-dot">•</span>
            <span className="mojo-charcard-dot">•</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <button type="button" onClick={() => navigateToChar(character.id)} style={{ ...QUICK_ACTION_STYLE, color: 'var(--gold-dim)' }}>
              View
            </button>
            <button type="button" onClick={() => navigateToCharTab(character.id, 'threads')} style={{ ...QUICK_ACTION_STYLE, color: 'var(--moonstone)' }}>
              Threads{myTurnCount > 0 && <span style={{ color: 'var(--gold)' }}> ({myTurnCount})</span>}
            </button>
            <button type="button" onClick={() => navigateToCharTab(character.id, 'resources')} style={{ ...QUICK_ACTION_STYLE, color: 'var(--mist)' }}>
              Resources
            </button>
            <button type="button" onClick={handleArchiveToggle} style={{ ...QUICK_ACTION_STYLE, color: isArchived ? 'var(--moonstone)' : 'var(--ember-dim)' }}>
              {isArchived ? 'Restore' : 'Archive'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
