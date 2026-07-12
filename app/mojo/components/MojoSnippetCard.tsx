'use client'

import { useState } from 'react'
import { updateMojoSnippet, deleteMojoSnippet } from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'
import type { Tables } from '@/types/database'

type MojoSnippet = Tables<'mojo_snippets'>

const TYPE_OPTIONS = [
  { value: 'general', label: 'General Note' },
  { value: 'app_code', label: 'App Code' },
  { value: 'template', label: 'Template' },
  { value: 'formatting', label: 'Formatting' },
  { value: 'other', label: 'Other' },
]

const TYPE_LABELS: Record<string, string> = Object.fromEntries(TYPE_OPTIONS.map((t) => [t.value, t.label]))
const MONO_TYPES = new Set(['app_code', 'formatting'])

function navigateToLibrary() {
  window.location.href = '/mojo/library'
}

async function copySnippetContent(content: string, onCopied: () => void) {
  try {
    await navigator.clipboard.writeText(content)
    onCopied()
  } catch {
    // ignore clipboard failures
  }
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

export default function MojoSnippetCard({ snippet }: { snippet: MojoSnippet }) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const [title, setTitle] = useState(snippet.title)
  const [type, setType] = useState(snippet.type)
  const [tags, setTags] = useState(snippet.tags ?? '')
  const [content, setContent] = useState(snippet.content)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const isMono = MONO_TYPES.has(snippet.type)
  const lines = snippet.content.split('\n')
  const isLong = lines.length > 3
  const preview = isLong ? lines.slice(0, 3).join('\n') : snippet.content

  function startEdit() {
    setTitle(snippet.title)
    setType(snippet.type)
    setTags(snippet.tags ?? '')
    setContent(snippet.content)
    setError(null)
    setEditing(true)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateMojoSnippet(snippet.id, { title, content, type, tags })
    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }
    navigateToLibrary()
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const result = await deleteMojoSnippet(snippet.id)
    if ('error' in result) {
      setDeleteLoading(false)
      return
    }
    navigateToLibrary()
  }

  function handleCopy() {
    copySnippetContent(snippet.content, () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  if (editing) {
    return (
      <div style={{ background: 'var(--raised)', border: '1px solid var(--gold-dim)', borderRadius: 4, padding: '14px 16px', marginBottom: 8 }}>
        {error && <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 8px' }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={INPUT_STYLE} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select value={type} onChange={(e) => setType(e.target.value)} style={INPUT_STYLE}>
              {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma-separated tags" style={INPUT_STYLE} />
          </div>
          {MONO_TYPES.has(type) ? (
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
        <div style={{ marginTop: 10 }}>
          <button type="button" onClick={handleSave} disabled={loading} style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '6px 16px', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--faded)', marginLeft: 12, fontFamily: 'var(--f-body)', fontSize: '0.82rem', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--claret)', border: '1px solid var(--elevated)', borderRadius: 4, padding: '14px 16px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--f-head)', fontSize: '0.94rem', color: 'var(--roseash)' }}>{snippet.title}</span>
          <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--faded)', background: 'var(--raised)', padding: '2px 6px', borderRadius: 2 }}>
            {TYPE_LABELS[snippet.type] ?? snippet.type}
          </span>
          {snippet.tags && (
            <span style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)' }}>
              {snippet.tags}
            </span>
          )}
        </div>

        {confirmingDelete ? (
          <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--faded)' }}>Delete &lsquo;{snippet.title}&rsquo;? </span>
            <button type="button" onClick={handleDelete} disabled={deleteLoading} style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
              Yes, delete
            </button>
            <span style={{ color: 'var(--faded)' }}> · </span>
            <button type="button" onClick={() => setConfirmingDelete(false)} style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
              Cancel
            </button>
          </span>
        ) : (
          <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
            <button type="button" onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'var(--moonstone)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
              {copied ? '✓' : 'Copy'}
            </button>
            <span style={{ color: 'var(--faded)' }}> · </span>
            <button type="button" onClick={startEdit} style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
              Edit
            </button>
            <span style={{ color: 'var(--faded)' }}> · </span>
            <button type="button" onClick={() => setConfirmingDelete(true)} style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
              Delete
            </button>
          </span>
        )}
      </div>

      {isMono ? (
        <pre style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '0.82rem',
          color: 'var(--mist)',
          margin: '8px 0 0',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
        }}>
          {expanded ? snippet.content : preview}
        </pre>
      ) : (
        <div style={{ margin: '8px 0 0', maxHeight: expanded ? 'none' : '4.8em', overflow: 'hidden' }}>
          <MojoRichTextEditor content={snippet.content} onChange={() => {}} readonly />
        </div>
      )}

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem', marginTop: 4 }}
        >
          {expanded ? 'Show less ▴' : 'Show more ▾'}
        </button>
      )}
    </div>
  )
}
