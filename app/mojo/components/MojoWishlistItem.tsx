'use client'

import { useState } from 'react'
import {
  updateMojoWishlistItem,
  updateMojoWishlistStatus,
  deleteMojoWishlistItem,
} from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'
import type { Tables } from '@/types/database'

type MojoWishlist = Tables<'mojo_wishlist'>

function navigateToWishlist() {
  window.location.href = '/mojo/wishlist'
}

const TYPE_OPTIONS = [
  { value: 'plot_idea', label: 'Plot Idea' },
  { value: 'character_concept', label: 'Character Concept' },
  { value: 'fandom', label: 'Fandom' },
  { value: 'other', label: 'Other' },
]

const TYPE_LABELS: Record<string, string> = Object.fromEntries(TYPE_OPTIONS.map((t) => [t.value, t.label]))

const TYPE_BORDER_COLOR: Record<string, string> = {
  plot_idea: 'var(--gold)',
  character_concept: 'var(--moonstone)',
  fandom: 'var(--ember)',
  other: 'var(--faded)',
}

const STATUS_OPTIONS: Array<'idea' | 'active' | 'shelved'> = ['idea', 'active', 'shelved']

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

export default function MojoWishlistItem({ item }: { item: MojoWishlist }) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const [title, setTitle] = useState(item.title)
  const [type, setType] = useState(item.type)
  const [notes, setNotes] = useState(item.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function startEdit() {
    setTitle(item.title)
    setType(item.type)
    setNotes(item.notes ?? '')
    setError(null)
    setEditing(true)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateMojoWishlistItem(item.id, { title, notes, type })
    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }
    navigateToWishlist()
  }

  async function handleStatusChange(status: 'idea' | 'active' | 'shelved') {
    if (status === item.status) return
    setStatusLoading(true)
    const result = await updateMojoWishlistStatus(item.id, status)
    if ('error' in result) {
      setStatusLoading(false)
      return
    }
    navigateToWishlist()
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const result = await deleteMojoWishlistItem(item.id)
    if ('error' in result) {
      setDeleteLoading(false)
      return
    }
    navigateToWishlist()
  }

  if (editing) {
    return (
      <div style={{
        background: 'var(--raised)',
        border: '1px solid var(--gold-dim)',
        borderRadius: 4,
        padding: '12px 16px',
        marginBottom: 8,
      }}>
        {error && <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 8px' }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={INPUT_STYLE} />
          <select value={type} onChange={(e) => setType(e.target.value)} style={INPUT_STYLE}>
            {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <MojoRichTextEditor content={notes} onChange={setNotes} minHeight="80px" />
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
      borderLeft: `3px solid ${TYPE_BORDER_COLOR[item.type] ?? 'var(--faded)'}`,
      borderRadius: 4,
      padding: '12px 16px',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--f-head)', fontSize: '0.94rem', color: 'var(--roseash)' }}>
              {item.title}
            </span>
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--faded)', background: 'var(--raised)', padding: '2px 6px', borderRadius: 2 }}>
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
          </span>
          {item.notes && (
            <div style={{ margin: '6px 0 0' }}>
              <MojoRichTextEditor content={item.notes} onChange={() => {}} readonly />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ display: 'flex', gap: 4 }}>
            {STATUS_OPTIONS.map((s) => {
              const isCurrent = item.status === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  disabled={statusLoading}
                  style={{
                    background: isCurrent ? 'var(--raised)' : 'none',
                    border: 'none',
                    borderRadius: 2,
                    padding: '3px 8px',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    color: isCurrent ? 'var(--gold)' : 'var(--faded)',
                    cursor: statusLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {s === 'idea' ? 'Idea' : s === 'active' ? 'Active' : 'Shelved'}
                </button>
              )
            })}
          </span>

          {confirmingDelete ? (
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
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
              <button type="button" onClick={startEdit} aria-label="Edit item" style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                ✎
              </button>
              <span style={{ color: 'var(--faded)' }}> · </span>
              <button type="button" onClick={() => setConfirmingDelete(true)} style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Delete
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
