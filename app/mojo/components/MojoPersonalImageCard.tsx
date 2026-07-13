'use client'

import { useState } from 'react'
import { updateMojoPersonalImage, deleteMojoPersonalImage } from '@/lib/actions/mojo'
import type { Tables } from '@/types/database'

type MojoPersonalImage = Tables<'mojo_personal_images'>
type MojoImageFolder = Tables<'mojo_image_folders'>
type ExpiryOption = 'never' | '1year' | 'custom'

function navigateToImages() {
  window.location.href = '/mojo/images'
}

async function copyPersonalImageUrl(url: string): Promise<void> {
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

function getCardRotation(index: number): string {
  const rotations = [-1.8, 0.9, -0.7, 1.4, -1.2, 0.6]
  return `rotate(${rotations[index % rotations.length]}deg)`
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

export default function MojoPersonalImageCard({
  image,
  folders,
  onDelete,
  index,
}: {
  image: MojoPersonalImage
  folders: MojoImageFolder[]
  onDelete: (imageId: string) => void
  index?: number
}) {
  const [dragging, setDragging] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [copied, setCopied] = useState(false)

  const [title, setTitle] = useState(image.title)
  const [folderId, setFolderId] = useState(image.folder_id ?? '')
  const [tags, setTags] = useState(image.tags ?? '')
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>(image.expires_at ? 'custom' : 'never')
  const [customDate, setCustomDate] = useState(
    image.expires_at ? new Date(image.expires_at).toISOString().slice(0, 10) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const proxyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/i/${image.token}.png`
  const folderName = image.folder_id ? folders.find((f) => f.id === image.folder_id)?.name ?? null : null
  const tagList = (image.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean)
  const visibleTags = tagList.slice(0, 3)
  const extraTagCount = tagList.length - visibleTags.length
  const isExpired = image.expires_at ? new Date(image.expires_at) < new Date() : false

  function startEdit() {
    setTitle(image.title)
    setFolderId(image.folder_id ?? '')
    setTags(image.tags ?? '')
    setExpiryOption(image.expires_at ? 'custom' : 'never')
    setCustomDate(image.expires_at ? new Date(image.expires_at).toISOString().slice(0, 10) : '')
    setError(null)
    setEditing(true)
  }

  async function handleCopy() {
    try {
      await copyPersonalImageUrl(proxyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard failures
    }
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateMojoPersonalImage(image.id, {
      title,
      folder_id: folderId || null,
      tags: tags.trim() || null,
      expires_at: computeExpiryIso(expiryOption, customDate),
    })
    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }
    navigateToImages()
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const result = await deleteMojoPersonalImage(image.id)
    if ('error' in result) {
      setDeleteLoading(false)
      return
    }
    onDelete(image.id)
  }

  return (
    <div>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(
            'application/mojo-avatar',
            JSON.stringify({
              storage_path: image.storage_path,
              mime_type: image.mime_type,
              avatar_id: image.id,
            })
          )
          e.dataTransfer.effectAllowed = 'copy'
          setDragging(true)
        }}
        onDragEnd={() => setDragging(false)}
        className="mojo-photograph"
        style={{
          transform: getCardRotation(index ?? 0),
          cursor: 'grab',
          opacity: dragging ? 0.6 : 1,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={proxyUrl}
          alt={image.title}
          style={{ display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 0 }}
        />
        <div style={{ paddingTop: '4px', textAlign: 'center' }}>
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '8px',
            letterSpacing: '0.10em',
            color: 'rgba(10,10,16,0.65)',
            textTransform: 'uppercase',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}>
            {image.title}
          </span>
        </div>
      </div>

      {editing ? (
        <div style={{ padding: 10, marginTop: 6, background: 'var(--raised)', border: '1px solid var(--gold-dim)' }}>
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--ember)', margin: '0 0 6px' }}>{error}</p>
          )}
          <div style={{ marginBottom: 8 }}>
            <label style={LABEL_STYLE}>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={INPUT_STYLE} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={LABEL_STYLE}>Folder</label>
            <select value={folderId} onChange={(e) => setFolderId(e.target.value)} style={INPUT_STYLE}>
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={LABEL_STYLE}>Tags</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} style={INPUT_STYLE} />
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
        <div style={{ padding: '6px 2px 0' }}>
          {folderName && (
            <span style={{
              display: 'inline-block', fontFamily: 'var(--f-ui)', fontSize: '0.5625rem', color: 'var(--faded)',
              background: 'var(--raised)', padding: '1px 6px', borderRadius: 2, marginBottom: 4,
            }}>
              📁 {folderName}
            </span>
          )}

          {tagList.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-block', fontFamily: 'var(--f-ui)', fontSize: '0.5625rem', color: 'var(--faded)',
                    background: 'var(--raised)', padding: '1px 5px', borderRadius: 99, marginRight: 3,
                  }}
                >
                  {tag}
                </span>
              ))}
              {extraTagCount > 0 && (
                <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.5625rem', color: 'var(--faded)' }}>
                  +{extraTagCount}
                </span>
              )}
            </div>
          )}

          {image.expires_at && !isExpired && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.6875rem', color: 'var(--faded)', margin: '0 0 6px' }}>
              expires {new Date(image.expires_at).toLocaleDateString()}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            <button type="button" onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'var(--moonstone)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', padding: 0 }}>
              {copied ? '✓' : 'Copy URL'}
            </button>
            <button type="button" onClick={startEdit} style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', padding: 0 }}>
              Edit
            </button>
            {confirmingDelete ? (
              <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6875rem' }}>
                <span style={{ color: 'var(--faded)' }}>Delete &lsquo;{image.title}&rsquo;? </span>
                <button type="button" onClick={handleDelete} disabled={deleteLoading} style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Yes, delete
                </button>
                <span style={{ color: 'var(--faded)' }}> · </span>
                <button type="button" onClick={() => setConfirmingDelete(false)} style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmingDelete(true)} style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', padding: 0 }}>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
