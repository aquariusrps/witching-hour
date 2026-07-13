'use client'

import { useState } from 'react'
import { updateMojoRp } from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'

export default function MojoRpNotePanel({
  rpId,
  label,
  field,
  initialValue,
}: {
  rpId: string
  label: string
  field: string
  initialValue: string | null
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue ?? '')
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit() {
    setDraft(value)
    setError(null)
    setIsEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.set(field, draft)

    const result = await updateMojoRp(rpId, fd)
    setSaving(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    setValue(draft)
    setIsEditing(false)
  }

  return (
    <div className="mojo-rp-note-panel">
      {/* Header — label + edit/save toggle */}
      <div className="mojo-rp-note-header">
        <span className="mojo-rp-note-label">{label}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--moonstone)',
                  background: 'transparent',
                  border: 'none',
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setError(null) }}
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--faded)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '9px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--faded)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label={`Edit ${label}`}
            >
              ✎
            </button>
          )}
        </div>
      </div>

      {/* Body — readonly display or edit mode */}
      <div className="mojo-rp-note-body">
        {error && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--ember)', margin: '0 0 8px' }}>
            {error}
          </p>
        )}
        {isEditing ? (
          <MojoRichTextEditor
            content={draft}
            onChange={setDraft}
            minHeight="120px"
            autoFocus
          />
        ) : value ? (
          <MojoRichTextEditor content={value} onChange={() => {}} readonly />
        ) : (
          <p style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '13px',
            fontStyle: 'italic',
            color: 'var(--faded)',
            margin: 0,
          }}>
            No notes yet.
          </p>
        )}
      </div>
    </div>
  )
}
