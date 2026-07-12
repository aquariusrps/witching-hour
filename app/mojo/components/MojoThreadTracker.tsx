'use client'

import { useState } from 'react'
import {
  createMojoThread,
  updateMojoThread,
  updateMojoThreadStatus,
  deleteMojoThread,
} from '@/lib/actions/mojo'
import type { Tables } from '@/types/database'

type MojoThread = Tables<'mojo_threads'>

const INPUT_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--raised)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.875rem',
  color: 'var(--roseash)',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
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

const ACTION_BTN_STYLE: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'inherit',
}

function FiligreeDividerLight() {
  return (
    <div style={{
      height: 1,
      margin: '20px 0',
      background: 'linear-gradient(to right, var(--ember), var(--gold))',
      opacity: 0.35,
    }} />
  )
}

function navigateToCharacter(charId: string) {
  window.location.href = '/mojo/characters/' + charId
}

export default function MojoThreadTracker({
  charId,
  rpId,
  initialThreads,
}: {
  charId: string
  rpId: string
  initialThreads: MojoThread[]
}) {
  // Add form state
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [partnerNames, setPartnerNames] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Edit state
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editPartnerNames, setEditPartnerNames] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete confirmation state
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null)

  // Archive section toggle
  const [showArchived, setShowArchived] = useState(false)
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null)

  const activeThreads = initialThreads.filter((t) => t.status === 'active')
  const archivedThreads = initialThreads.filter((t) => t.status !== 'active')

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)

    const result = await createMojoThread({
      rp_id: rpId,
      character_id: charId,
      title,
      url,
      partner_names: partnerNames,
    })

    if ('error' in result) {
      setAddLoading(false)
      setAddError(result.error)
      return
    }

    navigateToCharacter(charId)
  }

  function startEdit(thread: MojoThread) {
    setEditingThreadId(thread.id)
    setEditTitle(thread.title)
    setEditUrl(thread.url ?? '')
    setEditPartnerNames(thread.partner_names ?? '')
    setEditError(null)
    setConfirmingDelete(null)
  }

  async function handleEditSave(threadId: string) {
    setEditLoading(true)
    setEditError(null)

    const result = await updateMojoThread(threadId, {
      title: editTitle,
      url: editUrl || null,
      partner_names: editPartnerNames || null,
    })

    if ('error' in result) {
      setEditLoading(false)
      setEditError(result.error)
      return
    }

    navigateToCharacter(charId)
  }

  async function handleStatusChange(threadId: string, nextStatus: 'active' | 'archived') {
    setStatusLoadingId(threadId)
    setRowError(null)
    const result = await updateMojoThreadStatus(threadId, nextStatus)

    if ('error' in result) {
      setStatusLoadingId(null)
      setRowError({ id: threadId, message: result.error })
      return
    }

    navigateToCharacter(charId)
  }

  async function handleDelete(threadId: string) {
    setDeleteLoading(true)
    setRowError(null)
    const result = await deleteMojoThread(threadId)

    if ('error' in result) {
      setDeleteLoading(false)
      setRowError({ id: threadId, message: result.error })
      return
    }

    navigateToCharacter(charId)
  }

  function renderThreadRow(thread: MojoThread, archived: boolean) {
    const isEditing = editingThreadId === thread.id
    const isConfirmingDelete = confirmingDelete === thread.id
    const rowHasError = rowError?.id === thread.id

    if (isEditing) {
      return (
        <div
          key={thread.id}
          style={{
            background: 'var(--raised)',
            border: '1px solid var(--gold-dim)',
            borderRadius: 4,
            padding: '12px 16px',
            marginBottom: 8,
          }}
        >
          {editError && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 8px' }}>
              {editError}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={INPUT_STYLE} placeholder="Thread title" />
            <input type="text" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} style={INPUT_STYLE} placeholder="URL" />
            <input type="text" value={editPartnerNames} onChange={(e) => setEditPartnerNames(e.target.value)} style={INPUT_STYLE} placeholder="Partner(s)" />
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => handleEditSave(thread.id)}
              disabled={editLoading}
              style={{
                background: 'var(--ember)',
                color: 'var(--roseash)',
                border: 'none',
                borderRadius: 2,
                padding: '6px 16px',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                cursor: editLoading ? 'not-allowed' : 'pointer',
                opacity: editLoading ? 0.6 : 1,
              }}
            >
              {editLoading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditingThreadId(null)}
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
        </div>
      )
    }

    return (
      <div
        key={thread.id}
        style={{
          background: archived ? 'var(--char)' : 'var(--claret)',
          border: '1px solid var(--elevated)',
          borderRadius: 4,
          padding: '12px 16px',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          {thread.url ? (
            <a
              href={thread.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--f-body)',
                fontSize: '0.94rem',
                color: archived ? 'var(--faded)' : 'var(--roseash)',
              }}
            >
              {thread.title}
            </a>
          ) : (
            <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.94rem', color: archived ? 'var(--faded)' : 'var(--roseash)' }}>
              {thread.title}
            </span>
          )}

          {isConfirmingDelete ? (
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--faded)' }}>Delete this thread? </span>
              <button
                type="button"
                onClick={() => handleDelete(thread.id)}
                disabled={deleteLoading}
                style={{ ...ACTION_BTN_STYLE, color: 'var(--ember)' }}
              >
                Yes, delete
              </button>
              <span style={{ color: 'var(--faded)' }}> · </span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(null)}
                style={{ ...ACTION_BTN_STYLE, color: 'var(--faded)' }}
              >
                Cancel
              </button>
            </span>
          ) : (
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {!archived && (
                <>
                  <button type="button" onClick={() => startEdit(thread)} style={{ ...ACTION_BTN_STYLE, color: 'var(--gold-dim)' }}>
                    Edit
                  </button>
                  <span style={{ color: 'var(--faded)' }}> · </span>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(thread.id, 'archived')}
                    disabled={statusLoadingId === thread.id}
                    style={{ ...ACTION_BTN_STYLE, color: 'var(--faded)' }}
                  >
                    Archive
                  </button>
                  <span style={{ color: 'var(--faded)' }}> · </span>
                </>
              )}
              {archived && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(thread.id, 'active')}
                    disabled={statusLoadingId === thread.id}
                    style={{ ...ACTION_BTN_STYLE, color: 'var(--moonstone)' }}
                  >
                    Restore
                  </button>
                  <span style={{ color: 'var(--faded)' }}> · </span>
                </>
              )}
              <button
                type="button"
                onClick={() => { setConfirmingDelete(thread.id); setEditingThreadId(null) }}
                style={{ ...ACTION_BTN_STYLE, color: 'var(--ember-dim)' }}
              >
                Delete
              </button>
            </span>
          )}
        </div>
        {thread.partner_names && (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--mist)', margin: '4px 0 0' }}>
            with {thread.partner_names}
          </p>
        )}
        {rowHasError && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--ember)', margin: '4px 0 0' }}>
            {rowError!.message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Add thread form */}
      <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', margin: '0 0 12px' }}>
        Add a Thread
      </h3>
      <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
        {addError && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--ember)', margin: 0 }}>
            {addError}
          </p>
        )}
        <div>
          <label style={LABEL_STYLE}>Thread Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={INPUT_STYLE} />
        </div>
        <div>
          <label style={LABEL_STYLE}>URL</label>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} style={INPUT_STYLE} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Partner(s)</label>
          <input type="text" value={partnerNames} onChange={(e) => setPartnerNames(e.target.value)} style={INPUT_STYLE} />
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: '4px 0 0' }}>
            Separate multiple partners with commas
          </p>
        </div>
        <div>
          <button
            type="submit"
            disabled={addLoading}
            style={{
              background: 'var(--ember)',
              color: 'var(--roseash)',
              border: 'none',
              borderRadius: 2,
              padding: '8px 20px',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.8rem',
              cursor: addLoading ? 'not-allowed' : 'pointer',
              opacity: addLoading ? 0.6 : 1,
            }}
          >
            {addLoading ? 'Adding…' : '+ Add Thread'}
          </button>
        </div>
      </form>

      <FiligreeDividerLight />

      {/* Active threads */}
      <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', margin: '0 0 12px' }}>
        Active Threads{' '}
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--faded)' }}>
          ({activeThreads.length})
        </span>
      </h3>

      {activeThreads.length === 0 ? (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)', marginBottom: 24 }}>
          No active threads. Add one above.
        </p>
      ) : (
        <div style={{ marginBottom: 24 }}>
          {activeThreads.map((t) => renderThreadRow(t, false))}
        </div>
      )}

      {/* Archived threads */}
      {archivedThreads.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.75rem',
              color: 'var(--faded)',
              marginBottom: showArchived ? 12 : 0,
            }}
          >
            {showArchived ? '▼' : '▶'} Archived Threads ({archivedThreads.length})
          </button>

          {showArchived && (
            <div>
              {archivedThreads.map((t) => renderThreadRow(t, true))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
