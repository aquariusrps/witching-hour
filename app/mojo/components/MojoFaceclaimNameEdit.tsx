'use client'

import { useState } from 'react'
import { updateMojoFaceclaim } from '@/lib/actions/mojo'

function navigateToFaceclaim(fcId: string) {
  window.location.href = '/mojo/faceclaims/' + fcId
}

export default function MojoFaceclaimNameEdit({ fcId, name }: { fcId: string; name: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateMojoFaceclaim(fcId, { name: draft })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToFaceclaim(fcId)
  }

  if (!editing) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: 0 }}>
          {name}
        </h1>
        <button
          type="button"
          onClick={() => { setDraft(name); setEditing(true); setError(null) }}
          aria-label="Edit name"
          style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          ✎
        </button>
      </span>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: '1.4rem',
            color: 'var(--roseash)',
            background: 'var(--raised)',
            border: '1px solid var(--elevated)',
            borderRadius: 2,
            padding: '4px 10px',
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          style={{
            background: 'var(--ember)',
            color: 'var(--roseash)',
            border: 'none',
            borderRadius: 2,
            padding: '6px 14px',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.75rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          style={{ background: 'none', border: 'none', color: 'var(--faded)', fontFamily: 'var(--f-body)', fontSize: '0.82rem', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '6px 0 0' }}>
          {error}
        </p>
      )}
    </div>
  )
}
