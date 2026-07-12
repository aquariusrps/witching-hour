'use client'

import { useState } from 'react'
import { createMojoCharacter } from '@/lib/actions/mojo'

const INPUT_STYLE: React.CSSProperties = {
  padding: '8px 10px',
  background: 'var(--raised)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.85rem',
  color: 'var(--roseash)',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
}

export default function MojoAddCharacter({ rpId }: { rpId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData()
    fd.set('rp_id', rpId)
    fd.set('name', name)
    fd.set('bio', bio)
    // faceclaim_id assignment: MOJO-3

    const result = await createMojoCharacter(fd)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    window.location.href = '/mojo/rps/' + rpId
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', margin: 0 }}>
          Characters
        </h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.72rem',
            color: 'var(--gold)',
          }}
        >
          + Add Character
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember-light)', margin: 0 }}>
              {error}
            </p>
          )}
          <input
            type="text"
            placeholder="Character name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={INPUT_STYLE}
          />
          <textarea
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ ...INPUT_STYLE, minHeight: 80, resize: 'vertical' }}
          />
          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--ember)',
                color: 'var(--roseash)',
                border: 'none',
                borderRadius: 2,
                padding: '6px 16px',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Adding…' : 'Add Character'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--faded)',
                marginLeft: 12,
                fontFamily: 'var(--f-body)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
