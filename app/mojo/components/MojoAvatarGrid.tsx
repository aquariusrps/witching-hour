'use client'

import { useState } from 'react'
import { updateMojoAvatar } from '@/lib/actions/mojo'
import type { Tables } from '@/types/database'

type MojoAvatar = Tables<'mojo_avatars'>
type ExpiryOption = 'never' | '1year' | 'custom'

function reloadPage() {
  window.location.reload()
}

async function copyAvatarUrl(url: string): Promise<void> {
  await navigator.clipboard.writeText(url)
}

function computeExpiryIso(option: ExpiryOption, customDate: string): string | null {
  if (option === 'never') return null
  if (option === '1year') {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString()
  }
  if (customDate) return new Date(customDate).toISOString()
  return null
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-ui)',
  fontSize: '0.6rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  marginBottom: 3,
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  background: 'var(--char)',
  color: 'var(--roseash)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.78rem',
  outline: 'none',
  boxSizing: 'border-box',
}

function AvatarCard({
  avatar,
  showDragHandle,
  onDelete,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  avatar: MojoAvatar
  showDragHandle: boolean
  onDelete: (avatarId: string) => void
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [copied, setCopied] = useState(false)

  const [title, setTitle] = useState(avatar.title ?? '')
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>(avatar.expires_at ? 'custom' : 'never')
  const [customDate, setCustomDate] = useState(
    avatar.expires_at ? new Date(avatar.expires_at).toISOString().slice(0, 10) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const proxyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/i/${avatar.token}`
  const mimeBadge = avatar.mime_type === 'image/gif' ? 'GIF' : 'PNG'

  function startEdit() {
    setTitle(avatar.title ?? '')
    setExpiryOption(avatar.expires_at ? 'custom' : 'never')
    setCustomDate(avatar.expires_at ? new Date(avatar.expires_at).toISOString().slice(0, 10) : '')
    setError(null)
    setEditing(true)
  }

  async function handleCopy() {
    try {
      await copyAvatarUrl(proxyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard failures
    }
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateMojoAvatar(avatar.id, {
      title,
      expires_at: computeExpiryIso(expiryOption, customDate),
    })
    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }
    reloadPage()
  }

  return (
    <div
      draggable={showDragHandle}
      onDragStart={(e) => {
        if (!showDragHandle) return
        e.dataTransfer.setData(
          'application/mojo-avatar',
          JSON.stringify({
            storage_path: avatar.storage_path,
            mime_type: avatar.mime_type,
            avatar_id: avatar.id,
          })
        )
        e.dataTransfer.effectAllowed = 'copy'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      style={{
        background: 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        cursor: showDragHandle ? 'grab' : 'default',
        opacity: dragging ? 0.6 : 1,
      }}
    >
      {showDragHandle && (
        <span
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            color: 'var(--faded)',
            fontSize: '0.75rem',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          ⠿
        </span>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxyUrl}
        alt={avatar.title ?? 'Avatar'}
        style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
      />

      {editing ? (
        <div style={{ padding: 10, background: 'var(--raised)', borderTop: '1px solid var(--elevated)' }}>
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--ember)', margin: '0 0 6px' }}>{error}</p>
          )}
          <div style={{ marginBottom: 8 }}>
            <label style={LABEL_STYLE}>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={INPUT_STYLE} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={LABEL_STYLE}>Expires</label>
            <select value={expiryOption} onChange={(e) => setExpiryOption(e.target.value as ExpiryOption)} style={INPUT_STYLE}>
              <option value="never">Never</option>
              <option value="1year">1 year</option>
              <option value="custom">Custom date</option>
            </select>
            {expiryOption === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{ ...INPUT_STYLE, marginTop: 6 }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '5px 12px', fontFamily: 'var(--f-ui)', fontSize: '0.7rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', marginLeft: 8, fontFamily: 'var(--f-body)', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ padding: '10px 10px 8px' }}>
          <p style={{
            fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--roseash)', margin: '0 0 4px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {avatar.title ?? 'Untitled'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.56rem', color: 'var(--faded)' }}>{mimeBadge}</span>
            {avatar.expires_at && (
              <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.68rem', color: 'var(--faded)' }}>
                expires {new Date(avatar.expires_at).toLocaleDateString()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'var(--moonstone)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem', padding: 0 }}>
              {copied ? '✓' : 'Copy URL'}
            </button>
            <button type="button" onClick={startEdit} style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem', padding: 0 }}>
              Edit
            </button>
            {confirmingDelete ? (
              <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}>
                <span style={{ color: 'var(--faded)' }}>Delete? </span>
                <button type="button" onClick={() => onDelete(avatar.id)} style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Yes
                </button>
                <span style={{ color: 'var(--faded)' }}> · </span>
                <button type="button" onClick={() => setConfirmingDelete(false)} style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmingDelete(true)} style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem', padding: 0 }}>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MojoAvatarGrid({
  avatars,
  onDelete,
  showDragHandle,
}: {
  avatars: MojoAvatar[]
  onDelete: (avatarId: string) => void
  showDragHandle?: boolean
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  if (avatars.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
        No images uploaded yet.
      </p>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
      {avatars.map((avatar) => (
        <AvatarCard
          key={avatar.id}
          avatar={avatar}
          showDragHandle={showDragHandle ?? false}
          onDelete={onDelete}
          dragging={draggingId === avatar.id}
          onDragStart={() => setDraggingId(avatar.id)}
          onDragEnd={() => setDraggingId(null)}
        />
      ))}
    </div>
  )
}
