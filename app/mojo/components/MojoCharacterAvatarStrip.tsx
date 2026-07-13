'use client'

import { useState } from 'react'
import { setCharacterPrimaryStack, deleteMojoAvatar } from '@/lib/actions/mojo'
import MojoPortraitCard from './MojoPortraitCard'
import MojoAvatarUpload from './MojoAvatarUpload'
import type { Tables } from '@/types/database'

type MojoAvatar = Tables<'mojo_avatars'>
type MojoImageStack = Tables<'mojo_image_stacks'>

function navigateToCharacter(characterId: string) {
  window.location.href = '/mojo/characters/' + characterId
}

export default function MojoCharacterAvatarStrip({
  characterId,
  faceclaimId,
  avatars,
  stacks,
  primaryStackId,
  primaryToken,
}: {
  characterId: string
  faceclaimId: string | null
  avatars: MojoAvatar[]
  stacks: Array<MojoImageStack & { member_count: number }>
  primaryStackId: string | null
  primaryToken: string | null
}) {
  const [avatarsState, setAvatarsState] = useState(avatars)
  const [primaryTokenState, setPrimaryTokenState] = useState(primaryToken)
  const [primaryStackIdState, setPrimaryStackIdState] = useState(primaryStackId)
  const [primaryActionLoadingId, setPrimaryActionLoadingId] = useState<string | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showUploader, setShowUploader] = useState(false)

  // "Set as primary" is only meaningful for stacks — character.primary_stack_id
  // is a FK to mojo_image_stacks. There is no action to designate a single
  // mojo_avatars row as primary; the fallback display token is simply the
  // most recently uploaded avatar (characterAvatars[0], ordered by created_at
  // DESC server-side). See Q-items in the MOJO-FIX-008 build report.
  async function handleSetPrimaryStack(stackId: string, token: string) {
    setPrimaryActionLoadingId(stackId)
    setActionError(null)
    const result = await setCharacterPrimaryStack(characterId, stackId)
    setPrimaryActionLoadingId(null)

    if ('error' in result) {
      setActionError(result.error)
      return
    }

    setPrimaryStackIdState(stackId)
    setPrimaryTokenState(token)
  }

  async function handleDeleteAvatar(avatarId: string, token: string) {
    setDeleteLoadingId(avatarId)
    setActionError(null)
    const result = await deleteMojoAvatar(avatarId)
    setDeleteLoadingId(null)

    if ('error' in result) {
      setActionError(result.error)
      return
    }

    const remaining = avatarsState.filter((a) => a.id !== avatarId)
    setAvatarsState(remaining)
    // Mirror the server's fallback priority (primary stack → most recent
    // avatar) if the deleted avatar was the displayed fallback primary.
    if (!primaryStackIdState && token === primaryTokenState) {
      setPrimaryTokenState(remaining[0]?.token ?? null)
    }
  }

  const secondaryStacks = stacks.filter((s) => s.id !== primaryStackIdState)
  const secondaryAvatars = avatarsState.filter((av) => av.token !== primaryTokenState)

  return (
    <div>
      {actionError && (
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 10px' }}>
          {actionError}
        </p>
      )}

      {/* Secondary avatar strip — the large primary portrait is rendered
          directly by the character page (Zone 2, left column); this strip
          shows only non-primary avatars/stacks + the upload trigger. */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        padding: '4px 4px 12px',
        flexWrap: 'nowrap',
        alignItems: 'flex-start',
      }}>
        {/* Non-primary stacks — real "Set Primary" via setCharacterPrimaryStack */}
        {secondaryStacks.map((stack) => (
          <div key={stack.id}
            className="mojo-avatar-strip-card"
            style={{ position: 'relative', flexShrink: 0 }}>
            <MojoPortraitCard
              token={stack.token}
              alt={stack.label}
              size="sm"
              idSuffix={`char-stack-${stack.id}`}
              showFrame={false}
            />
            <button
              className="mojo-avatar-set-primary"
              onClick={() => handleSetPrimaryStack(stack.id, stack.token)}
              disabled={primaryActionLoadingId === stack.id}
              style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.75)',
                color: 'var(--roseash)',
                border: 'none',
                cursor: primaryActionLoadingId === stack.id ? 'not-allowed' : 'pointer',
                padding: '4px 0',
              }}
            >
              {primaryActionLoadingId === stack.id ? 'Setting…' : 'Set Primary'}
            </button>
          </div>
        ))}

        {/* Non-primary avatars — Delete only (no per-avatar primary mechanism exists) */}
        {secondaryAvatars.map((av) => (
          <div key={av.id}
            className="mojo-avatar-strip-card"
            style={{ position: 'relative', flexShrink: 0 }}>
            <MojoPortraitCard
              token={av.token}
              alt={av.title ?? 'Avatar'}
              size="sm"
              idSuffix={`char-av-${av.id}`}
              showFrame={false}
            />
            <button
              onClick={() => handleDeleteAvatar(av.id, av.token)}
              disabled={deleteLoadingId === av.id}
              style={{
                position: 'absolute',
                top: '2px', right: '2px',
                background: 'rgba(0,0,0,0.65)',
                border: 'none',
                color: 'var(--faded)',
                cursor: deleteLoadingId === av.id ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                padding: '1px 5px',
                borderRadius: '2px',
                lineHeight: 1,
              }}
            >×</button>
          </div>
        ))}

        {/* Upload trigger — styled as a dashed portrait-sized card.
            Reveals the full MojoAvatarUpload pipeline below (drag-drop,
            optional crop, expiry) rather than cramming it into a 110px slot. */}
        <div style={{
          width: '110px',
          aspectRatio: '3 / 5',
          border: '1px dashed rgba(255,255,255,0.15)',
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexShrink: 0,
          cursor: 'pointer',
          background: 'var(--raised)',
        }}
        onClick={() => setShowUploader((v) => !v)}
        >
          <span style={{ fontSize: '24px', color: 'var(--faded)', lineHeight: 1 }}>+</span>
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: '8px',
            letterSpacing: '0.12em', color: 'var(--faded)',
            textTransform: 'uppercase',
          }}>{showUploader ? 'Close' : 'Upload'}</span>
        </div>
      </div>

      {showUploader && (
        <div style={{ marginTop: '12px' }}>
          <MojoAvatarUpload
            characterId={characterId}
            faceclaimId={faceclaimId}
            onUploadComplete={() => navigateToCharacter(characterId)}
          />
        </div>
      )}
    </div>
  )
}
