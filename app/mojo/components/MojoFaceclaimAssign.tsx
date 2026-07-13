'use client'

import { useState } from 'react'
import { assignFaceclaimToCharacter, createAndAssignFaceclaim } from '@/lib/actions/mojo'

function navigateToCharacter(characterId: string) {
  window.location.href = '/mojo/characters/' + characterId
}

export default function MojoFaceclaimAssign({
  characterId,
  currentFaceclaimId,
  currentFaceclaimName,
  allFaceclaims,
}: {
  characterId: string
  currentFaceclaimId: string | null
  currentFaceclaimName: string | null
  allFaceclaims: Array<{ id: string; name: string }>
}) {
  const [editing, setEditing] = useState(false)
  const [selected, setSelected] = useState(currentFaceclaimId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const trimmedSearch = searchTerm.trim()
  const hasExactMatch = allFaceclaims.some(
    (fc) => fc.name.toLowerCase() === trimmedSearch.toLowerCase()
  )
  const showCreateOption = trimmedSearch.length > 0 && !hasExactMatch

  async function handleAssign() {
    setLoading(true)
    setError(null)
    const result = await assignFaceclaimToCharacter(characterId, selected || null)

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToCharacter(characterId)
  }

  async function handleCreateAndAssign() {
    setCreating(true)
    setCreateError(null)
    const result = await createAndAssignFaceclaim(trimmedSearch, characterId)

    if ('error' in result) {
      setCreating(false)
      setCreateError(result.error)
      return
    }

    setSearchTerm('')
    navigateToCharacter(characterId)
  }

  if (!editing) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {currentFaceclaimName ? (
          <>
            <span style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--mist)' }}>
              played by {currentFaceclaimName}
            </span>
            <button
              type="button"
              onClick={() => { setSelected(currentFaceclaimId ?? ''); setEditing(true); setError(null) }}
              aria-label="Change faceclaim"
              style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✎
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => { setSelected(''); setEditing(true); setError(null) }}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.72rem' }}
          >
            + Assign faceclaim
          </button>
        )}
      </span>
    )
  }

  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            padding: '4px 8px',
            background: 'var(--raised)',
            color: 'var(--roseash)',
            border: '1px solid var(--elevated)',
            borderRadius: 2,
            fontFamily: 'var(--f-body)',
            fontSize: '0.82rem',
          }}
        >
          <option value="">— None —</option>
          {allFaceclaims.map((fc) => (
            <option key={fc.id} value={fc.id}>{fc.name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAssign}
          disabled={loading}
          style={{
            background: 'var(--ember)',
            color: 'var(--roseash)',
            border: 'none',
            borderRadius: 2,
            padding: '4px 12px',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.72rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving…' : 'Assign'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          style={{ background: 'none', border: 'none', color: 'var(--faded)', fontFamily: 'var(--f-body)', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Cancel
        </button>
        {error && (
          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--ember)' }}>{error}</span>
        )}
      </span>

      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Or type a new name to create…"
          style={{
            padding: '4px 8px',
            background: 'var(--raised)',
            color: 'var(--roseash)',
            border: '1px solid var(--elevated)',
            borderRadius: 2,
            fontFamily: 'var(--f-body)',
            fontSize: '0.82rem',
          }}
        />
        {showCreateOption && (
          <button
            type="button"
            onClick={handleCreateAndAssign}
            disabled={creating}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '6px 10px',
              fontFamily: 'EB Garamond, serif',
              fontSize: '13px',
              color: 'var(--moonstone)',
              background: 'rgba(40,136,144,0.08)',
              border: 'none',
              borderTop: '1px solid var(--elevated)',
              cursor: creating ? 'not-allowed' : 'pointer',
            }}
          >
            {creating ? 'Creating…' : `+ Create "${trimmedSearch}" as new faceclaim`}
          </button>
        )}
        {createError && (
          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--ember)' }}>{createError}</span>
        )}
      </span>
    </span>
  )
}
