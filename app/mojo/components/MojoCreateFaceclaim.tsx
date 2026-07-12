'use client'

import { useState } from 'react'
import { createMojoFaceclaim } from '@/lib/actions/mojo'

function navigateToFaceclaims() {
  window.location.href = '/mojo/faceclaims'
}

export default function MojoCreateFaceclaim() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMojoFaceclaim({ name })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToFaceclaims()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Faceclaim name"
          required
          style={{
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
          }}
        />
        {error && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '6px 0 0' }}>
            {error}
          </p>
        )}
      </div>
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
          fontSize: '0.8rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        {loading ? 'Adding…' : '+ Add Faceclaim'}
      </button>
    </form>
  )
}
