'use client'

import { useState } from 'react'
import { createMojoSnippet } from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'
import { SvgNavLibrary } from '@/app/mojo/components/MojoSvgAssets'

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

  const isCodeType = MONO_TYPES.has(type)

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
        <form onSubmit={handleSubmit} style={{
          background: `
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.006) 0px,
              rgba(255,255,255,0.006) 1px,
              transparent 1px,
              transparent 4px
            ),
            var(--raised)
          `,
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '2px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '10px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <SvgNavLibrary active={false} />
            New Entry
          </div>
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
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  ...INPUT_STYLE,
                  borderColor: isCodeType ? 'var(--moonstone)' : 'var(--elevated)',
                  fontFamily: isCodeType ? "'Courier New', monospace" : INPUT_STYLE.fontFamily,
                }}
              >
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
            {isCodeType ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '13px',
                  color: 'var(--roseash)',
                  background: 'var(--raised)',
                  border: '1px solid var(--elevated)',
                  borderRadius: '2px',
                  padding: '8px 12px',
                  minHeight: '140px',
                  width: '100%',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                placeholder="Paste your code or formatting template..."
              />
            ) : (
              <MojoRichTextEditor
                content={content}
                onChange={setContent}
                minHeight="140px"
                placeholder="Write your snippet content..."
              />
            )}
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
