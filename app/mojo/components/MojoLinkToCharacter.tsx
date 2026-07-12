'use client'

import { useState } from 'react'
import { linkResourceToCharacter } from '@/lib/actions/mojo'

type CharacterOption = { id: string; name: string; rp_name: string }

export default function MojoLinkToCharacter({
  resourceId,
  characters,
}: {
  resourceId: string
  characters: CharacterOption[]
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [linkedName, setLinkedName] = useState<string | null>(null)

  const grouped = new Map<string, CharacterOption[]>()
  for (const c of characters) {
    const list = grouped.get(c.rp_name) ?? []
    list.push(c)
    grouped.set(c.rp_name, list)
  }

  async function handleLink() {
    if (!selected) {
      setError('Choose a character first')
      return
    }
    setLoading(true)
    setError(null)
    const result = await linkResourceToCharacter(resourceId, selected)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    const char = characters.find((c) => c.id === selected)
    setLinkedName(char?.name ?? 'character')
    setOpen(false)
    setTimeout(() => setLinkedName(null), 2500)
  }

  if (linkedName) {
    return (
      <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.7rem', color: 'var(--moonstone)' }}>
        ✓ Linked to {linkedName}
      </span>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}
      >
        Link to character →
      </button>
    )
  }

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{
          padding: '3px 6px',
          background: 'var(--raised)',
          color: 'var(--roseash)',
          border: '1px solid var(--elevated)',
          borderRadius: 2,
          fontFamily: 'var(--f-body)',
          fontSize: '0.75rem',
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
        style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '3px 10px', fontFamily: 'var(--f-ui)', fontSize: '0.68rem', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? '…' : 'Link'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        style={{ background: 'none', border: 'none', color: 'var(--faded)', fontFamily: 'var(--f-body)', fontSize: '0.72rem', cursor: 'pointer' }}
      >
        Cancel
      </button>
      {error && <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.7rem', color: 'var(--ember)' }}>{error}</span>}
    </span>
  )
}
