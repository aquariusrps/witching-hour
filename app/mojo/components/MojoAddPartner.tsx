'use client'

import { useState } from 'react'
import { createMojoPartner } from '@/lib/actions/mojo'

function navigateToPartners() {
  window.location.href = '/mojo/partners'
}

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

export default function MojoAddPartner() {
  const [open, setOpen] = useState(false)
  const [handle, setHandle] = useState('')
  const [sites, setSites] = useState('')
  const [paceNotes, setPaceNotes] = useState('')
  const [styleNotes, setStyleNotes] = useState('')
  const [historyNotes, setHistoryNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMojoPartner({
      handle,
      sites,
      pace_notes: paceNotes,
      style_notes: styleNotes,
      history_notes: historyNotes,
    })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToPartners()
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: open ? 14 : 0 }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--gold)' }}
        >
          {open ? 'Cancel' : '+ Add Partner'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--claret)', border: '1px solid var(--elevated)', borderRadius: 4, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--ember)', margin: 0 }}>{error}</p>
          )}
          <div>
            <label style={LABEL_STYLE}>Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username or display name"
              required
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>Sites</label>
            <input
              type="text"
              value={sites}
              onChange={(e) => setSites(e.target.value)}
              placeholder="Tumblr, JCINK, AO3..."
              style={INPUT_STYLE}
            />
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: '4px 0 0' }}>
              Separate multiple sites with commas
            </p>
          </div>
          <div>
            <label style={LABEL_STYLE}>Pace Notes</label>
            <textarea
              value={paceNotes}
              onChange={(e) => setPaceNotes(e.target.value)}
              placeholder="Fast, slow, matches partners, replies weekly..."
              style={{ ...INPUT_STYLE, minHeight: 60, resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>Style Notes</label>
            <textarea
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
              placeholder="Novella, para, multi-para, icons..."
              style={{ ...INPUT_STYLE, minHeight: 60, resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>History Notes</label>
            <textarea
              value={historyNotes}
              onChange={(e) => setHistoryNotes(e.target.value)}
              placeholder="How you met, RPs you've done, threads to remember..."
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
              {loading ? 'Adding…' : 'Add Partner'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
