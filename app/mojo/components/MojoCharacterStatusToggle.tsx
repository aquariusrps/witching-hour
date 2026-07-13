'use client'

import { useState } from 'react'
import { updateMojoCharacterStatus } from '@/lib/actions/mojo'

function navigateToRp(rpId: string) {
  window.location.href = '/mojo/rps/' + rpId
}

export default function MojoCharacterStatusToggle({
  characterId,
  rpId,
  status,
}: {
  characterId: string
  rpId: string
  status: 'active' | 'archived'
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const nextStatus = status === 'active' ? 'archived' : 'active'
    const result = await updateMojoCharacterStatus(characterId, nextStatus)

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToRp(rpId)
  }

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {error && (
        <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.7rem', color: 'var(--ember-light)' }}>
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
          fontSize: '0.68rem',
          color: status === 'active' ? 'var(--faded)' : 'var(--moonstone)',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {status === 'active' ? 'Archive' : 'Restore'}
      </button>
    </span>
  )
}
