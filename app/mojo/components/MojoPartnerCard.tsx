'use client'

import { useState } from 'react'
import { updateMojoPartner, deleteMojoPartner } from '@/lib/actions/mojo'
import type { Tables } from '@/types/database'

type MojoPartner = Tables<'mojo_partners'>

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

function NoteSection({ label, content }: { label: string; content: string | null }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <span style={{
        fontFamily: 'var(--f-ui)',
        fontSize: '0.62rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--faded)',
      }}>
        {label}
      </span>
      {content ? (
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--roseash)', margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
          {content}
        </p>
      ) : (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--faded)', margin: '4px 0 0' }}>
          No {label.toLowerCase()} notes yet.
        </p>
      )}
    </div>
  )
}

export default function MojoPartnerCard({
  partner,
  isExpanded,
  onToggle,
}: {
  partner: MojoPartner
  isExpanded: boolean
  onToggle: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const [handle, setHandle] = useState(partner.handle)
  const [sites, setSites] = useState(partner.sites ?? '')
  const [paceNotes, setPaceNotes] = useState(partner.pace_notes ?? '')
  const [styleNotes, setStyleNotes] = useState(partner.style_notes ?? '')
  const [historyNotes, setHistoryNotes] = useState(partner.history_notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function startEdit() {
    setHandle(partner.handle)
    setSites(partner.sites ?? '')
    setPaceNotes(partner.pace_notes ?? '')
    setStyleNotes(partner.style_notes ?? '')
    setHistoryNotes(partner.history_notes ?? '')
    setError(null)
    setEditing(true)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateMojoPartner(partner.id, {
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

  async function handleDelete() {
    setDeleteLoading(true)
    const result = await deleteMojoPartner(partner.id)
    if ('error' in result) {
      setDeleteLoading(false)
      return
    }
    navigateToPartners()
  }

  const actionButtons = confirmingDelete ? (
    <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
      <span style={{ color: 'var(--faded)' }}>Delete {partner.handle}? </span>
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
      <button type="button" onClick={startEdit} aria-label="Edit partner" style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
        Edit
      </button>
      <span style={{ color: 'var(--faded)' }}> · </span>
      <button type="button" onClick={() => setConfirmingDelete(true)} style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
        Delete
      </button>
    </span>
  )

  if (editing) {
    return (
      <div style={{ background: 'var(--raised)', border: '1px solid var(--gold-dim)', borderRadius: 4, padding: '14px 16px', marginBottom: 8 }}>
        {error && <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 8px' }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={LABEL_STYLE}>Handle</label>
            <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} style={INPUT_STYLE} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Sites</label>
            <input type="text" value={sites} onChange={(e) => setSites(e.target.value)} style={INPUT_STYLE} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Pace Notes</label>
            <textarea value={paceNotes} onChange={(e) => setPaceNotes(e.target.value)} style={{ ...INPUT_STYLE, minHeight: 60, resize: 'vertical' }} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Style Notes</label>
            <textarea value={styleNotes} onChange={(e) => setStyleNotes(e.target.value)} style={{ ...INPUT_STYLE, minHeight: 60, resize: 'vertical' }} />
          </div>
          <div>
            <label style={LABEL_STYLE}>History Notes</label>
            <textarea value={historyNotes} onChange={(e) => setHistoryNotes(e.target.value)} style={{ ...INPUT_STYLE, minHeight: 80, resize: 'vertical' }} />
          </div>
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
    <div style={{
      background: 'var(--claret)',
      border: '1px solid var(--elevated)',
      borderRadius: 4,
      padding: '12px 16px',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <button
          type="button"
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            flexWrap: 'wrap',
            padding: 0,
          }}
        >
          <span style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)' }}>
            {partner.handle}
          </span>
          {!isExpanded && partner.sites && (
            <span style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--faded)' }}>
              · {partner.sites}
            </span>
          )}
        </button>

        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onToggle}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}
          >
            {isExpanded ? '▼ Collapse' : '▶ Expand'}
          </button>
          {actionButtons}
        </span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 14 }}>
          {partner.sites && (
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--faded)', margin: '0 0 12px' }}>
              {partner.sites}
            </p>
          )}
          <NoteSection label="Pace" content={partner.pace_notes} />
          <NoteSection label="Style" content={partner.style_notes} />
          <NoteSection label="History" content={partner.history_notes} />
        </div>
      )}
    </div>
  )
}
