'use client'

import { useState } from 'react'
import { updateMojoPartner, deleteMojoPartner } from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'
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

function NoteSection({ label, content, first = false }: { label: string; content: string | null; first?: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: 'block',
        fontFamily: 'Cinzel, serif',
        fontSize: '9px',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'var(--faded)',
        marginBottom: '6px',
        marginTop: first ? undefined : '14px',
        opacity: 0.7,
      }}>
        {label}
      </div>
      <div style={{
        width: '40px',
        height: '1px',
        background: 'linear-gradient(90deg, var(--faded), transparent)',
        opacity: 0.3,
        marginBottom: '8px',
      }} />
      {content ? (
        <div style={{ margin: '4px 0 0', fontSize: '13px', lineHeight: '24px' }}>
          <MojoRichTextEditor content={content} onChange={() => {}} readonly />
        </div>
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
      <div style={{
        background: `
          repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 23px,
            rgba(255,255,255,0.03) 23px,
            rgba(255,255,255,0.03) 24px
          ),
          var(--raised)
        `,
        border: '1px solid var(--elevated)',
        borderRadius: 2,
        padding: '14px 16px',
        marginBottom: 8,
      }}>
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
            <MojoRichTextEditor content={paceNotes} onChange={setPaceNotes} minHeight="60px" />
          </div>
          <div>
            <label style={LABEL_STYLE}>Style Notes</label>
            <MojoRichTextEditor content={styleNotes} onChange={setStyleNotes} minHeight="60px" />
          </div>
          <div>
            <label style={LABEL_STYLE}>History Notes</label>
            <MojoRichTextEditor content={historyNotes} onChange={setHistoryNotes} minHeight="80px" />
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
    <div
      className="mojo-partner-card"
      style={{
        position: 'relative',
        background: 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderLeft: '3px solid rgba(255,255,255,0.06)',
        borderRadius: '2px',
        marginBottom: '0',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--elevated)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: 'Cinzel, serif',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--faded)',
            userSelect: 'none',
          }}>
            {partner.handle.charAt(0).toUpperCase()}
          </div>
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
            <span style={{ fontFamily: 'Cormorant Upright, serif', fontSize: '20px', fontWeight: 600, color: 'var(--gold)' }}>
              {partner.handle}
            </span>
            {!isExpanded && partner.sites && (
              <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '12px', fontStyle: 'italic', color: 'var(--mist)' }}>
                · {partner.sites}
              </span>
            )}
          </button>
        </div>

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
        <div className="mojo-notes-lined" style={{ padding: '14px 16px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {partner.sites && (
            <p style={{ fontFamily: 'EB Garamond, serif', fontSize: '12px', fontStyle: 'italic', color: 'var(--mist)', margin: '0 0 12px' }}>
              {partner.sites}
            </p>
          )}
          <NoteSection label="Pace" content={partner.pace_notes} first />
          <NoteSection label="Style" content={partner.style_notes} />
          <NoteSection label="History" content={partner.history_notes} />
        </div>
      )}
    </div>
  )
}
