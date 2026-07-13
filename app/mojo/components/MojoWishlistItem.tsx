'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browserClient'
import {
  updateMojoWishlistItem,
  updateMojoWishlistStatus,
  deleteMojoWishlistItem,
  removeWishlistImage,
  registerWishlistImage,
} from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'
import {
  SvgCandleFlame, SvgCandleUnlit, SvgCandleSnuffed,
  SvgNavFaceclaims, SvgNavSearch, SvgNavDashboard, SvgNavLibrary,
} from '@/app/mojo/components/MojoSvgAssets'
import type { Tables } from '@/types/database'

type MojoWishlist = Tables<'mojo_wishlist'>

function navigateToWishlist() {
  window.location.href = '/mojo/wishlist'
}

async function uploadWishlistImage(
  file: File
): Promise<{ error: string } | { success: true; token: string; proxyUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)

  let response: Response
  try {
    response = await fetch('/api/mojo/process-image', { method: 'POST', body: formData })
  } catch {
    return { error: 'Failed to process image' }
  }
  if (!response.ok) {
    return { error: 'Failed to process image' }
  }

  const processedBlob = await response.blob()
  const processedMime = response.headers.get('Content-Type') ?? 'image/png'
  const finalIsGif = response.headers.get('X-Is-Gif') === 'true'

  const supabase = createBrowserClient()
  const ext = finalIsGif ? 'gif' : 'png'
  const storagePath = 'wishlist/' + crypto.randomUUID() + '.' + ext

  const { error: uploadError } = await supabase.storage
    .from('mojo-private')
    .upload(storagePath, processedBlob, { contentType: processedMime, upsert: false })

  if (uploadError) {
    return { error: 'Upload failed: ' + uploadError.message }
  }

  return registerWishlistImage({
    storage_path: storagePath,
    mime_type: processedMime,
  })
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

const TYPE_BADGE_LABELS: Record<string, string> = {
  plot_idea: 'Plot',
  character_concept: 'Character',
  fandom: 'Fandom',
  other: 'Other',
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'character_concept') return <SvgNavFaceclaims active={false} />
  if (type === 'plot_idea') return <SvgNavSearch active={false} />
  if (type === 'fandom') return <SvgNavDashboard active={false} />
  return <SvgNavLibrary active={false} />
}

function CandleIndicator({ status }: { status: string }) {
  if (status === 'active') return <SvgCandleFlame size={18} delay="0s" />
  if (status === 'idea') return <SvgCandleUnlit size={18} />
  return <SvgCandleSnuffed size={18} />
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

  const [imageToken, setImageToken] = useState(item.image_token)
  const [removeImageLoading, setRemoveImageLoading] = useState(false)

  const [pendingImageToken, setPendingImageToken] = useState<string | null>(item.image_token)
  const [pendingProxyUrl, setPendingProxyUrl] = useState<string | null>(
    item.image_token ? `${process.env.NEXT_PUBLIC_SITE_URL}/i/${item.image_token}.png` : null
  )
  const [imageUploadLoading, setImageUploadLoading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)

  function startEdit() {
    setTitle(item.title)
    setType(item.type)
    setNotes(item.notes ?? '')
    setError(null)
    setPendingImageToken(imageToken)
    setPendingProxyUrl(imageToken ? `${process.env.NEXT_PUBLIC_SITE_URL}/i/${imageToken}.png` : null)
    setImageUploadError(null)
    setEditing(true)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    const result = await updateMojoWishlistItem(item.id, { title, notes, type, image_token: pendingImageToken })
    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }
    navigateToWishlist()
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImageUploadLoading(true)
    setImageUploadError(null)

    const result = await uploadWishlistImage(file)
    setImageUploadLoading(false)

    if ('error' in result) {
      setImageUploadError(result.error)
      return
    }

    setPendingImageToken(result.token)
    setPendingProxyUrl(result.proxyUrl)
  }

  function removePendingImage() {
    setPendingImageToken(null)
    setPendingProxyUrl(null)
  }

  async function handleRemoveImage() {
    if (!imageToken) return
    setRemoveImageLoading(true)
    const result = await removeWishlistImage(item.id, imageToken)
    setRemoveImageLoading(false)
    if ('error' in result) return
    setImageToken(null)
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
        background: `
          repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.007) 0px,
            rgba(255,255,255,0.007) 1px,
            transparent 1px,
            transparent 4px
          ),
          var(--raised)
        `,
        border: '1px solid var(--elevated)',
        borderRadius: '4px',
        padding: '14px',
        marginBottom: 8,
      }}>
        {error && <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 8px' }}>{error}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={INPUT_STYLE} />
          <select value={type} onChange={(e) => setType(e.target.value)} style={INPUT_STYLE}>
            {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <MojoRichTextEditor content={notes} onChange={setNotes} minHeight="80px" />
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
              marginBottom: 4,
            }}>
              Reference Image
            </label>
            {pendingProxyUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pendingProxyUrl} alt="Reference" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 2 }} />
                <button
                  type="button"
                  onClick={removePendingImage}
                  style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.7rem' }}
                >
                  Remove image
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={imageUploadLoading}
                style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--mist)' }}
              />
            )}
            {imageUploadLoading && (
              <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: '4px 0 0' }}>
                Uploading…
              </p>
            )}
            {imageUploadError && (
              <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--ember)', margin: '4px 0 0' }}>
                {imageUploadError}
              </p>
            )}
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

  const isActive = item.status === 'active'
  const isIdea = item.status === 'idea'
  const isShelved = item.status === 'shelved'

  return (
    <div
      className={[
        'mojo-desire-card',
        isActive ? 'mojo-desire-active' : '',
        isIdea ? 'mojo-desire-idea' : '',
        isShelved ? 'mojo-desire-shelved' : '',
      ].join(' ').trim()}
      style={{
        padding: '14px 16px',
        marginBottom: '12px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        {/* Candle status indicator */}
        <div aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: isActive ? 'var(--roseash)' : 'var(--faded)', opacity: isShelved ? 0.6 : 1 }}>
          <CandleIndicator status={item.status} />
        </div>

        {/* Type icon */}
        <div aria-hidden="true" style={{ flexShrink: 0, marginTop: 2, color: TYPE_BORDER_COLOR[item.type] ?? 'var(--faded)' }}>
          <TypeIcon type={item.type} />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--f-head)', fontSize: '0.94rem', color: 'var(--roseash)' }}>
              {item.title}
            </span>
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--faded)', background: 'var(--raised)', padding: '2px 6px', borderRadius: 2 }}>
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
          </span>
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

      {imageToken && (
        <div style={{ marginBottom: '10px', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_SITE_URL}/i/${imageToken}.png`}
            alt="Reference"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
              borderRadius: '3px',
              display: 'block',
            }}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={removeImageLoading}
            style={{
              position: 'absolute',
              top: '4px', right: '4px',
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              color: 'var(--faded)',
              cursor: removeImageLoading ? 'not-allowed' : 'pointer',
              borderRadius: '2px',
              padding: '2px 6px',
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
            }}
          >
            × Remove image
          </button>
        </div>
      )}

      {item.notes && (
        <div style={{ margin: '6px 0 0' }}>
          <MojoRichTextEditor content={item.notes} onChange={() => {}} readonly />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '1px 6px',
          borderRadius: '1px',
        }}>
          {TYPE_BADGE_LABELS[item.type] ?? 'Other'}
        </span>
      </div>
    </div>
  )
}
