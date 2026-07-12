'use client'

import { useState } from 'react'
import { createMojoImageStack } from '@/lib/actions/mojo'

function navigateToStacks() {
  window.location.href = '/mojo/stacks'
}

type RotationMode = 'truly_random' | 'weighted' | 'sequential' | 'no_repeat'
type ExpiryOption = 'never' | '1year' | 'custom'

const ROTATION_HELP: Record<RotationMode, string> = {
  truly_random: 'Each request picks any image with equal probability',
  weighted: 'Images with higher weight appear more often',
  sequential: 'Cycles through images in order',
  no_repeat: 'Random, but never shows the same image twice in a row',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'var(--raised)',
  color: 'var(--roseash)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-ui)',
  fontSize: '0.65rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  marginBottom: 4,
}

type CharacterOption = { id: string; name: string; rp_name: string }
type FaceclaimOption = { id: string; name: string }

export default function MojoCreateStack({
  characters,
  faceclaims,
}: {
  characters: CharacterOption[]
  faceclaims: FaceclaimOption[]
}) {
  const [label, setLabel] = useState('')
  const [rotationMode, setRotationMode] = useState<RotationMode>('truly_random')
  const [characterId, setCharacterId] = useState('')
  const [faceclaimId, setFaceclaimId] = useState('')
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>('never')
  const [customDate, setCustomDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rpGroups: Record<string, CharacterOption[]> = {}
  for (const c of characters) {
    if (!rpGroups[c.rp_name]) rpGroups[c.rp_name] = []
    rpGroups[c.rp_name].push(c)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let expiresAt: string | null = null
    if (expiryOption === '1year') {
      const d = new Date()
      d.setFullYear(d.getFullYear() + 1)
      expiresAt = d.toISOString()
    } else if (expiryOption === 'custom' && customDate) {
      expiresAt = new Date(customDate).toISOString()
    }

    const result = await createMojoImageStack({
      label,
      rotation_mode: rotationMode,
      character_id: characterId || null,
      faceclaim_id: faceclaimId || null,
      expires_at: expiresAt,
    })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToStacks()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderRadius: 4,
        padding: 18,
        marginBottom: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {error && (
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--ember)', margin: 0 }}>{error}</p>
      )}

      <div>
        <label style={LABEL_STYLE}>Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Arwen winter avatars"
          required
          style={INPUT_STYLE}
        />
      </div>

      <div>
        <label style={LABEL_STYLE}>Rotation Mode</label>
        <select
          value={rotationMode}
          onChange={(e) => setRotationMode(e.target.value as RotationMode)}
          style={INPUT_STYLE}
        >
          <option value="truly_random">Truly Random</option>
          <option value="weighted">Weighted</option>
          <option value="sequential">Sequential</option>
          <option value="no_repeat">No Repeat</option>
        </select>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: '4px 0 0' }}>
          {ROTATION_HELP[rotationMode]}
        </p>
      </div>

      <div>
        <label style={LABEL_STYLE}>Assign to Character</label>
        <select
          value={characterId}
          onChange={(e) => setCharacterId(e.target.value)}
          style={INPUT_STYLE}
        >
          <option value="">— No character —</option>
          {Object.entries(rpGroups).map(([rpName, chars]) => (
            <optgroup key={rpName} label={rpName}>
              {chars.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label style={LABEL_STYLE}>Assign to Faceclaim</label>
        <select
          value={faceclaimId}
          onChange={(e) => setFaceclaimId(e.target.value)}
          style={INPUT_STYLE}
        >
          <option value="">— No faceclaim —</option>
          {faceclaims.map((fc) => (
            <option key={fc.id} value={fc.id}>{fc.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={LABEL_STYLE}>Link expires</label>
        <select
          value={expiryOption}
          onChange={(e) => setExpiryOption(e.target.value as ExpiryOption)}
          style={INPUT_STYLE}
        >
          <option value="never">Never (indefinite)</option>
          <option value="1year">1 year from now</option>
          <option value="custom">Custom date</option>
        </select>
        {expiryOption === 'custom' && (
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            style={{ ...INPUT_STYLE, marginTop: 8 }}
          />
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--ember)',
            color: 'var(--roseash)',
            border: 'none',
            borderRadius: 2,
            padding: '8px 20px',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.8125rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Creating…' : '+ Create Stack'}
        </button>
      </div>
    </form>
  )
}
