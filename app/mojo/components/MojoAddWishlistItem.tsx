'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browserClient'
import { createMojoWishlistItem, registerWishlistImage } from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'
import { SvgDreamHeader } from '@/app/mojo/components/MojoSvgAssets'

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

export default function MojoAddWishlistItem() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('plot_idea')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pendingImageToken, setPendingImageToken] = useState<string | null>(null)
  const [pendingProxyUrl, setPendingProxyUrl] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImageUploading(true)
    setImageError(null)

    const result = await uploadWishlistImage(file)
    setImageUploading(false)

    if ('error' in result) {
      setImageError(result.error)
      return
    }

    setPendingImageToken(result.token)
    setPendingProxyUrl(result.proxyUrl)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMojoWishlistItem({ title, notes, type, image_token: pendingImageToken })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToWishlist()
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%,
            rgba(96,64,192,0.05) 0%, transparent 60%),
          var(--raised)
        `,
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px',
        color: 'var(--faded)',
      }}>
        <SvgDreamHeader idSuffix="add-wishlist-form" />
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '10px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
        }}>
          New Desire
        </span>
      </div>
      {error && (
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--ember)', margin: 0 }}>{error}</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={INPUT_STYLE} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={INPUT_STYLE}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label style={LABEL_STYLE}>Notes</label>
        <MojoRichTextEditor
          content={notes}
          onChange={setNotes}
          minHeight="80px"
          placeholder="Add any notes about this idea..."
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          fontFamily: 'Cinzel, serif', fontSize: '10px',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--faded)', display: 'block', marginBottom: '6px',
        }}>
          Reference Image (optional)
        </label>
        {pendingImageToken ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingProxyUrl ?? undefined} alt="Preview"
              style={{ maxHeight: '120px', maxWidth: '100%',
                       borderRadius: '2px', display: 'block' }} />
            <button
              type="button"
              onClick={() => { setPendingImageToken(null); setPendingProxyUrl(null) }}
              style={{ position: 'absolute', top: 2, right: 2,
                       background: 'rgba(0,0,0,0.6)', border: 'none',
                       color: 'white', cursor: 'pointer', fontSize: '11px',
                       padding: '1px 5px', borderRadius: '2px' }}>
              ×
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={imageUploading}
            style={{ color: 'var(--faded)', fontSize: '12px' }}
          />
        )}
        {imageUploading && (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: '4px 0 0' }}>
            Uploading…
          </p>
        )}
        {imageError && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--ember)', margin: '4px 0 0' }}>
            {imageError}
          </p>
        )}
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--ember)',
            color: 'var(--roseash)',
            border: 'none',
            borderRadius: 2,
            padding: '8px 20px',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Adding…' : '+ Add to Wishlist'}
        </button>
      </div>
    </form>
  )
}
