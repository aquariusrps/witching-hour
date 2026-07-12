'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteMojoFaceclaim } from '@/lib/actions/mojo'

function navigateToFaceclaims() {
  window.location.href = '/mojo/faceclaims'
}

export default function MojoFaceclaimRow({
  fc,
}: {
  fc: { id: string; name: string; resource_count: number; character_count: number }
}) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const result = await deleteMojoFaceclaim(fc.id)

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToFaceclaims()
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--claret)',
      border: '1px solid var(--elevated)',
      borderRadius: 4,
      padding: '12px 16px',
      marginBottom: 8,
      gap: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <Link
          href={`/mojo/faceclaims/${fc.id}`}
          style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', textDecoration: 'none' }}
        >
          {fc.name}
        </Link>
        <div style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', color: 'var(--faded)', marginTop: 2 }}>
          {fc.resource_count} resource{fc.resource_count === 1 ? '' : 's'} · {fc.character_count} character{fc.character_count === 1 ? '' : 's'}
        </div>
        {error && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--ember)', margin: '4px 0 0' }}>
            {error}
          </p>
        )}
      </div>

      {confirming ? (
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.72rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ color: 'var(--faded)' }}>Delete {fc.name}? This removes it from all characters. </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Yes, delete
          </button>
          <span style={{ color: 'var(--faded)' }}> · </span>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.72rem', flexShrink: 0 }}
        >
          Delete
        </button>
      )}
    </div>
  )
}
