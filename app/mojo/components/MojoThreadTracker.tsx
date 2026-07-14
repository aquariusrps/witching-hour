'use client'

import { useState } from 'react'
import {
  createMojoThread,
  updateMojoThread,
  updateMojoThreadStatus,
  deleteMojoThread,
  updateMojoThreadWhoseTurn,
} from '@/lib/actions/mojo'
import { deriveWhoseTurn, getWaitingOn, detectPlatformClient, formatRelativeTime } from '@/lib/mojo/utils'
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

const PLATFORM_BADGE: Record<string, { label: string; color: string }> = {
  tumblr: { label: '[T]', color: 'var(--ember)' },
  jcink: { label: '[J]', color: 'var(--moonstone)' },
  generic: { label: '[?]', color: 'var(--faded)' },
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

type RefreshResponse = {
  last_poster: string | null
  fetch_status: string
  detected_platform: string
  last_checked_at: string
}

export default function MojoThreadTracker({
  charId,
  rpId,
  characterName,
  initialThreads,
}: {
  charId: string
  rpId: string
  characterName: string
  initialThreads: MojoThread[]
}) {
  const [threads, setThreads] = useState<MojoThread[]>(initialThreads)
  // Adjust local state during render (React's recommended pattern for
  // resetting state from props) rather than in an effect — resyncs
  // after the full-page reloads that follow add/edit/delete/archive.
  const [prevInitialThreads, setPrevInitialThreads] = useState(initialThreads)
  if (initialThreads !== prevInitialThreads) {
    setPrevInitialThreads(initialThreads)
    setThreads(initialThreads)
  }

  // Add form state
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [partnerNames, setPartnerNames] = useState('')
  const [replyOrder, setReplyOrder] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Edit state
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editPartnerNames, setEditPartnerNames] = useState('')
  const [editReplyOrder, setEditReplyOrder] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete confirmation state
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null)

  // Archive section toggle
  const [showArchived, setShowArchived] = useState(false)
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null)

  // Refresh state
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [refreshingAll, setRefreshingAll] = useState(false)
  const [refreshProgress, setRefreshProgress] = useState(0)

  // Manual override state
  const [overrideLoadingId, setOverrideLoadingId] = useState<string | null>(null)
  const [openOverride, setOpenOverride] = useState<string | null>(null)

  const activeThreads = threads.filter((t) => t.status === 'active')
  const archivedThreads = threads.filter((t) => t.status !== 'active')
  const activeThreadsWithUrls = activeThreads.filter((t) => t.url)

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
      reply_order: replyOrder,
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
    setEditReplyOrder(thread.reply_order ?? '')
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
      reply_order: editReplyOrder || null,
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

  async function refreshThread(threadId: string): Promise<void> {
    try {
      const response = await fetch('/api/mojo/refresh-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data || data.error) {
        setRowError({ id: threadId, message: data?.error ?? 'Refresh failed' })
        return
      }

      const updated = data as RefreshResponse
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                last_poster: updated.last_poster,
                fetch_status: updated.fetch_status,
                detected_platform: updated.detected_platform,
                last_checked_at: updated.last_checked_at,
              }
            : t
        )
      )
    } catch {
      setRowError({ id: threadId, message: 'Refresh failed' })
    }
  }

  async function handleRefreshOne(threadId: string) {
    setRefreshingId(threadId)
    setRowError(null)
    await refreshThread(threadId)
    setRefreshingId(null)
  }

  async function handleRefreshAll() {
    if (activeThreadsWithUrls.length === 0) return
    setRefreshingAll(true)
    setRefreshProgress(0)
    setRowError(null)

    for (const thread of activeThreadsWithUrls) {
      await refreshThread(thread.id)
      if (thread.url && detectPlatformClient(thread.url) === 'tumblr') {
        await new Promise((r) => setTimeout(r, 300))
      }
      setRefreshProgress((p) => p + 1)
    }

    setRefreshingAll(false)
    setRefreshProgress(0)
  }

  async function handleSetWhoseTurn(threadId: string, value: 'mine' | 'theirs' | null) {
    setOverrideLoadingId(threadId)
    setRowError(null)
    const result = await updateMojoThreadWhoseTurn(threadId, value)
    setOverrideLoadingId(null)

    if ('error' in result) {
      setRowError({ id: threadId, message: result.error })
      return
    }

    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, manual_whose_turn: value } : t)))
  }

  function renderWhoseTurnBadge(thread: MojoThread) {
    const whoseTurn = deriveWhoseTurn(thread, characterName)
    const waitingOn = getWaitingOn(thread, characterName)
    const badgeClass = [
      'mojo-turn-badge',
      whoseTurn === 'mine' ? 'mojo-turn-mine' :
      whoseTurn === 'theirs' && waitingOn ? 'mojo-turn-waiting' :
      whoseTurn === 'theirs' ? 'mojo-turn-theirs' :
      'mojo-turn-unknown',
    ].filter(Boolean).join(' ')
    const badgeLabel =
      whoseTurn === 'mine' ? 'Your Turn' :
      whoseTurn === 'theirs' && waitingOn ? `Waiting on ${waitingOn}` :
      whoseTurn === 'theirs' ? 'Their Turn' :
      'Unknown'
    return (
      <span className={badgeClass}>
        {badgeLabel}
        {thread.manual_whose_turn && (
          <span style={{ opacity: 0.75, fontSize: '0.85em', marginLeft: 6, textTransform: 'none', letterSpacing: 'normal' }}>
            (manual)
          </span>
        )}
      </span>
    )
  }

  function renderLastPosterLine(thread: MojoThread) {
    if (!thread.last_poster) return null
    const isTumblr = thread.detected_platform === 'tumblr'
    return (
      <p
        style={{ fontFamily: 'var(--f-body)', fontSize: '0.6875rem', color: 'var(--mist)', margin: '4px 0 0' }}
        title={isTumblr ? 'Tumblr shows the blog name, not the character name. Use the manual override buttons to set whose turn it is.' : undefined}
      >
        last poster: {thread.last_poster}{isTumblr && ' ⓘ'}
      </p>
    )
  }

  function renderCheckedLine(thread: MojoThread) {
    if (thread.fetch_status === 'failed') {
      return (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.6875rem', color: 'var(--ember)', margin: '2px 0 0' }}>
          ↻ fetch failed
        </p>
      )
    }
    if (thread.detected_platform === 'jcink' && thread.fetch_status === 'unsupported') {
      return (
        <p
          style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.6875rem', color: 'var(--faded)', margin: '2px 0 0' }}
          title="This board requires login to view. If credentials are configured, try refreshing. Otherwise use the Mine/Theirs buttons to track manually."
        >
          ↻ members only ⓘ
        </p>
      )
    }
    if (thread.fetch_status === 'uncertain') {
      return (
        <p
          style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.6875rem', color: 'var(--faded)', margin: '2px 0 0' }}
          title="The last poster could not be verified with confidence. Check manually and use the override buttons if needed."
        >
          ↻ unverified ⓘ
        </p>
      )
    }
    if (thread.last_checked_at) {
      const badge = thread.detected_platform ? PLATFORM_BADGE[thread.detected_platform] : undefined
      return (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.6875rem', color: 'var(--faded)', margin: '2px 0 0' }}>
          {badge && <span style={{ color: badge.color, marginRight: 4 }}>{badge.label}</span>}
          ↻ checked {formatRelativeTime(thread.last_checked_at)}
        </p>
      )
    }
    return null
  }

  function renderOverrideTrigger(thread: MojoThread) {
    return (
      <button
        type="button"
        className="mojo-override-trigger"
        onClick={() => setOpenOverride(openOverride === thread.id ? null : thread.id)}
        title="Manual whose-turn override"
        aria-label="Override whose turn"
      >
        ···
      </button>
    )
  }

  function renderOverrideRow(thread: MojoThread) {
    const options: Array<{ key: 'auto' | 'mine' | 'theirs'; label: string; value: 'mine' | 'theirs' | null }> = [
      { key: 'auto', label: 'Auto', value: null },
      { key: 'mine', label: 'Mine', value: 'mine' },
      { key: 'theirs', label: 'Theirs', value: 'theirs' },
    ]
    return (
      <div className="mojo-override-row">
        {options.map((opt) => {
          const isActive = opt.key === 'auto' ? !thread.manual_whose_turn : thread.manual_whose_turn === opt.value
          return (
            <button
              key={opt.key}
              type="button"
              disabled={overrideLoadingId === thread.id}
              className={['mojo-override-btn', isActive ? 'mojo-override-btn-active' : ''].filter(Boolean).join(' ')}
              onClick={() => {
                handleSetWhoseTurn(thread.id, opt.value)
                setOpenOverride(null)
              }}
              style={{ cursor: overrideLoadingId === thread.id ? 'not-allowed' : 'pointer' }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    )
  }

  function renderThreadRow(thread: MojoThread, archived: boolean) {
    const isEditing = editingThreadId === thread.id
    const isConfirmingDelete = confirmingDelete === thread.id
    const rowHasError = rowError?.id === thread.id
    const isRefreshing = refreshingId === thread.id

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
            <input type="text" value={editReplyOrder} onChange={(e) => setEditReplyOrder(e.target.value)} style={INPUT_STYLE} placeholder="Reply order (optional) — Remy, Johnny, Sue, Peter" />
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
                    Close
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
                onClick={() => handleRefreshOne(thread.id)}
                disabled={isRefreshing}
                title="Refresh reply status"
                style={{ ...ACTION_BTN_STYLE, color: 'var(--gold-dim)' }}
              >
                {isRefreshing ? '↻…' : '↻'}
              </button>
              <span style={{ color: 'var(--faded)' }}> · </span>
              {!archived && (
                <>
                  {renderOverrideTrigger(thread)}
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

        <div style={{ marginTop: 6 }}>
          {renderWhoseTurnBadge(thread)}
        </div>

        {thread.partner_names && (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--mist)', margin: '4px 0 0' }}>
            with {thread.partner_names}
          </p>
        )}

        {renderLastPosterLine(thread)}
        {renderCheckedLine(thread)}

        {!archived && openOverride === thread.id && renderOverrideRow(thread)}

        {rowHasError && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--ember)', margin: '6px 0 0' }}>
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
          <label style={LABEL_STYLE}>
            Reply Order
            <span style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              textTransform: 'none',
              letterSpacing: 0,
              fontSize: '0.72rem',
              marginLeft: 6,
              opacity: 0.7,
            }}>
              (optional — for combat/ordered threads)
            </span>
          </label>
          <input type="text" value={replyOrder} onChange={(e) => setReplyOrder(e.target.value)} style={INPUT_STYLE} placeholder="Remy, Johnny, Sue, Peter" />
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', margin: 0 }}>
          Active Threads{' '}
          <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--faded)' }}>
            ({activeThreads.length})
          </span>
        </h3>
        {activeThreadsWithUrls.length > 0 && (
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={refreshingAll}
            style={{
              background: 'none',
              border: 'none',
              cursor: refreshingAll ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.75rem',
              color: 'var(--faded)',
            }}
          >
            {refreshingAll ? `Refreshing ${refreshProgress}/${activeThreadsWithUrls.length}…` : '↻ Refresh all'}
          </button>
        )}
      </div>

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
            {showArchived ? '▼' : '▶'} Closed Threads ({archivedThreads.length})
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
