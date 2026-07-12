'use client'

import { useState } from 'react'
import { createMojoWishlistItem } from '@/lib/actions/mojo'

function navigateToWishlist() {
  window.location.href = '/mojo/wishlist'
}

const TYPE_OPTIONS = [
  { value: 'plot_idea', label: 'Plot Idea' },
  { value: 'character_concept', label: 'Character Concept' },
  { value: 'fandom', label: 'Fandom' },
  { value: 'other', label: 'Other' },
]

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

export default function MojoAddWishlistItem() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('plot_idea')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMojoWishlistItem({ title, notes, type })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToWishlist()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderRadius: 4,
        padding: 18,
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {error && (
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--ember)', margin: 0 }}>{error}</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={INPUT_STYLE} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={INPUT_STYLE}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label style={LABEL_STYLE}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...INPUT_STYLE, minHeight: 80, resize: 'vertical' }}
        />
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
            fontSize: '0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Adding…' : '+ Add to Wishlist'}
        </button>
      </div>
    </form>
  )
}
