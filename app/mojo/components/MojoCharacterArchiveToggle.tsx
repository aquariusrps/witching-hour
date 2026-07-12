'use client'

import { useState } from 'react'
import { updateMojoCharacterStatus } from '@/lib/actions/mojo'

export default function MojoCharacterArchiveToggle({
  charId,
  status,
}: {
  charId: string
  status: 'active' | 'archived'
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const nextStatus = status === 'active' ? 'archived' : 'active'
    const result = await updateMojoCharacterStatus(charId, nextStatus)

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    window.location.href = '/mojo/characters/' + charId
  }

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {error && (
        <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--ember-light)' }}>
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          background: 'none',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--f-ui)',
          fontSize: '0.72rem',
          color: status === 'active' ? 'var(--faded)' : 'var(--moonstone)',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {status === 'active' ? 'Archive character' : 'Restore character'}
      </button>
    </span>
  )
}
