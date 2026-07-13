'use client'

import { useState } from 'react'
import MojoResourceList from './MojoResourceList'
import { linkResourceToCharacter } from '@/lib/actions/mojo'
import type { Tables } from '@/types/database'

type MojoResource = Tables<'mojo_resources'>
type CharacterOption = { id: string; name: string; rp_name: string }

export default function MojoLibraryResources({
  globalResources,
  characters,
}: {
  globalResources: MojoResource[]
  characters: CharacterOption[]
}) {
  const [linkingId, setLinkingId] = useState<string | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkedName, setLinkedName] = useState<string | null>(null)

  const grouped = new Map<string, CharacterOption[]>()
  for (const c of characters) {
    const list = grouped.get(c.rp_name) ?? []
    list.push(c)
    grouped.set(c.rp_name, list)
  }

  function startLinking(resourceId: string) {
    setLinkingId(resourceId)
    setSelectedCharacterId('')
    setError(null)
    setLinkedName(null)
  }

  function cancelLinking() {
    setLinkingId(null)
    setSelectedCharacterId('')
    setError(null)
  }

  async function handleLink() {
    if (!linkingId) return
    if (!selectedCharacterId) {
      setError('Choose a character first')
      return
    }
    setLoading(true)
    setError(null)
    const result = await linkResourceToCharacter(linkingId, selectedCharacterId)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    const character = characters.find((c) => c.id === selectedCharacterId)
    setLinkedName(character?.name ?? 'character')
    setLinkingId(null)
    setTimeout(() => setLinkedName(null), 2500)
  }

  const linkingResource = globalResources.find((r) => r.id === linkingId)

  return (
    <div>
      {linkingResource && (
        <div
          style={{
            background: 'var(--raised)',
            border: '1px solid var(--gold-dim)',
            borderRadius: 4,
            padding: '10px 14px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--mist)' }}>
            Link &lsquo;{linkingResource.title}&rsquo; to:
          </span>
          <select
            value={selectedCharacterId}
            onChange={(e) => setSelectedCharacterId(e.target.value)}
            style={{
              padding: '4px 8px',
              background: 'var(--char)',
              color: 'var(--roseash)',
              border: '1px solid var(--elevated)',
              borderRadius: 2,
              fontFamily: 'var(--f-body)',
              fontSize: '0.8rem',
            }}
          >
            <option value="">— Select character —</option>
            {Array.from(grouped.entries()).map(([rpName, chars]) => (
              <optgroup key={rpName} label={rpName}>
                {chars.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            onClick={handleLink}
            disabled={loading}
            style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '4px 12px', fontFamily: 'var(--f-ui)', fontSize: '0.72rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '…' : 'Link'}
          </button>
          <button
            type="button"
            onClick={cancelLinking}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', fontFamily: 'var(--f-body)', fontSize: '0.78rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
          {error && (
            <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--ember)' }}>{error}</span>
          )}
        </div>
      )}

      {linkedName && (
        <p style={{ fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--moonstone)', margin: '0 0 14px' }}>
          ✓ Linked to {linkedName}
        </p>
      )}

      <MojoResourceList
        resources={globalResources}
        redirectPath="/mojo/library"
        onLinkToCharacter={characters.length > 0 ? startLinking : undefined}
      />
    </div>
  )
}
