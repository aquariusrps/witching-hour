'use client'

import { useState } from 'react'
import { createMojoSnippet } from '@/lib/actions/mojo'

function navigateToLibrary() {
  window.location.href = '/mojo/library'
}

const TYPE_OPTIONS = [
  { value: 'general', label: 'General Note' },
  { value: 'app_code', label: 'App Code' },
  { value: 'template', label: 'Template' },
  { value: 'formatting', label: 'Formatting' },
  { value: 'other', label: 'Other' },
]

const MONO_TYPES = new Set(['app_code', 'formatting'])

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

export default function MojoAddSnippet() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('general')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMojoSnippet({ title, content, type, tags })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToLibrary()
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 14 : 0 }}>
        <h2 style={{ fontFamily: 'var(--f-head)', fontSize: '1.15rem', color: 'var(--roseash)', margin: 0 }}>
          Snippets &amp; Templates
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--gold)' }}
        >
          {open ? 'Cancel' : '+ Add Snippet'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--claret)', border: '1px solid var(--elevated)', borderRadius: 4, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--ember)', margin: 0 }}>{error}</p>
          )}
          <div>
            <label style={LABEL_STYLE}>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={INPUT_STYLE} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_STYLE}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={INPUT_STYLE}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LABEL_STYLE}>Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma-separated tags" style={INPUT_STYLE} />
            </div>
          </div>
          <div>
            <label style={LABEL_STYLE}>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{
                ...INPUT_STYLE,
                minHeight: 140,
                resize: 'vertical',
                fontFamily: MONO_TYPES.has(type) ? "'Courier New', monospace" : 'var(--f-body)',
              }}
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
              {loading ? 'Saving…' : 'Save Snippet'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
