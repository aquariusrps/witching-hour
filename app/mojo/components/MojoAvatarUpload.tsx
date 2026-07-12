'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browserClient'
import { registerUploadedAvatar } from '@/lib/actions/mojo'
import MojoAvatarCrop from './MojoAvatarCrop'

const MAX_FILE_BYTES = 20 * 1024 * 1024

type ExpiryOption = 'never' | '1year' | 'custom'
type QueueStatus = 'pending' | 'cropping' | 'processing' | 'uploading' | 'done' | 'error'

type QueueItem = {
  id: string
  file: File
  title: string
  expiryOption: ExpiryOption
  customDate: string
  expiresAt: string | null
  blob: Blob | null
  status: QueueStatus
  errorMessage?: string
  fading?: boolean
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const FIELD_STYLE: React.CSSProperties = {
  padding: '5px 8px',
  background: 'var(--raised)',
  color: 'var(--roseash)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.78rem',
  outline: 'none',
}

export default function MojoAvatarUpload({
  characterId = null,
  faceclaimId = null,
  onUploadComplete,
}: {
  characterId?: string | null
  faceclaimId?: string | null
  onUploadComplete: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hadItemsRef = useRef(false)

  const [queue, setQueue] = useState<QueueItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [skipWarning, setSkipWarning] = useState<string | null>(null)

  function updateItem(id: string, patch: Partial<QueueItem>) {
    setQueue((q) => q.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  function removeItem(id: string) {
    setQueue((q) => q.filter((i) => i.id !== id))
  }

  function enqueueFiles(files: FileList | File[]) {
    const valid: QueueItem[] = []
    let warning: string | null = null
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue
      if (f.size > MAX_FILE_BYTES) {
        warning = `${f.name} is over 20MB and was skipped`
        continue
      }
      valid.push({
        id: crypto.randomUUID(),
        file: f,
        title: f.name.replace(/\.[^.]+$/, ''),
        expiryOption: 'never',
        customDate: '',
        expiresAt: null,
        blob: null,
        status: 'pending',
      })
    }
    setSkipWarning(warning)
    if (valid.length === 0) return
    setQueue((q) => [...q, ...valid])
  }

  const processItem = useCallback(
    async (item: QueueItem) => {
      updateItem(item.id, { status: 'processing' })

      const source: Blob = item.blob ?? item.file
      const isGif = source.type === 'image/gif'
      const formData = new FormData()
      formData.append('file', source, isGif ? 'image.gif' : 'image.png')

      let response: Response
      try {
        response = await fetch('/api/mojo/process-image', { method: 'POST', body: formData })
      } catch {
        updateItem(item.id, { status: 'error', errorMessage: 'Failed to process image' })
        return
      }
      if (!response.ok) {
        updateItem(item.id, { status: 'error', errorMessage: 'Failed to process image' })
        return
      }
      const processedBlob = await response.blob()
      const processedMime = response.headers.get('Content-Type') ?? 'image/png'
      const finalIsGif = response.headers.get('X-Is-Gif') === 'true'

      updateItem(item.id, { status: 'uploading' })
      const supabase = createBrowserClient()
      const ext = finalIsGif ? 'gif' : 'png'
      const storagePath = 'avatars/' + crypto.randomUUID() + '.' + ext

      const { error: uploadError } = await supabase.storage
        .from('mojo-private')
        .upload(storagePath, processedBlob, { contentType: processedMime, upsert: false })

      if (uploadError) {
        updateItem(item.id, { status: 'error', errorMessage: 'Upload failed: ' + uploadError.message })
        return
      }

      const result = await registerUploadedAvatar({
        storage_path: storagePath,
        mime_type: processedMime,
        title: item.title,
        expires_at: item.expiresAt,
        character_id: characterId,
        faceclaim_id: faceclaimId,
        width: null,
        height: null,
        file_size: processedBlob.size,
      })

      if ('error' in result) {
        updateItem(item.id, { status: 'error', errorMessage: result.error })
        return
      }

      updateItem(item.id, { status: 'done' })
      setTimeout(() => updateItem(item.id, { fading: true }), 1700)
      setTimeout(() => removeItem(item.id), 2000)
    },
    [characterId, faceclaimId]
  )

  // Auto-advance the queue: whenever nothing is mid-flight, pick up the next pending item.
  // Deferred via setTimeout so the state update doesn't happen synchronously within the effect.
  useEffect(() => {
    const hasActive = queue.some((i) => i.status === 'processing' || i.status === 'uploading')
    if (hasActive) return
    const next = queue.find((i) => i.status === 'pending')
    if (next) {
      const t = setTimeout(() => processItem(next), 0)
      return () => clearTimeout(t)
    }
  }, [queue, processItem])

  // Fire onUploadComplete once per batch, when the queue drains back to empty.
  useEffect(() => {
    if (queue.length > 0) {
      hadItemsRef.current = true
      return
    }
    if (hadItemsRef.current) {
      hadItemsRef.current = false
      const t = setTimeout(() => onUploadComplete(), 1000)
      return () => clearTimeout(t)
    }
  }, [queue.length, onUploadComplete])

  const anyCropping = queue.some((i) => i.status === 'cropping')

  return (
    <div>
      <style>{`
        @keyframes mojoSpinnerDots {
          0%, 20% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .mojo-spinner-dot { animation: mojoSpinnerDots 1.2s infinite ease-in-out; display: inline-block; }
        .mojo-spinner-dot:nth-child(2) { animation-delay: 0.2s; }
        .mojo-spinner-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {queue.length === 0 ? (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (e.dataTransfer.files.length > 0) enqueueFiles(e.dataTransfer.files)
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--elevated)',
              borderRadius: 4,
              background: dragOver ? 'var(--raised)' : 'var(--char)',
              padding: 40,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 32, color: 'var(--faded)', marginBottom: 8 }}>↑</div>
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.9375rem', color: 'var(--mist)', margin: '0 0 4px' }}>
              Drop images here or click to browse
            </p>
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: 0 }}>
              PNG, JPG, GIF, WebP — max 20MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) enqueueFiles(e.target.files)
                e.target.value = ''
              }}
              style={{ display: 'none' }}
            />
          </div>
          {skipWarning && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--ember)', margin: '8px 0 0' }}>
              {skipWarning}
            </p>
          )}
        </div>
      ) : (
        <div>
          {queue.map((item) => {
            if (item.status === 'pending') {
              return (
                <div key={item.id} style={{ background: 'var(--claret)', border: '1px solid var(--elevated)', borderRadius: 2, padding: '8px 12px', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.8125rem', color: 'var(--mist)' }}>
                        {item.file.name}
                      </span>
                      <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.65rem', color: 'var(--faded)', marginLeft: 8 }}>
                        {formatBytes(item.file.size)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                      {!anyCropping && (
                        <button
                          type="button"
                          onClick={() => updateItem(item.id, { status: 'cropping' })}
                          style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.7rem' }}
                        >
                          ✂ Crop
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.7rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      style={{ ...FIELD_STYLE, flex: '1 1 160px' }}
                    />
                    <select
                      value={item.expiryOption}
                      onChange={(e) => {
                        const expiryOption = e.target.value as ExpiryOption
                        updateItem(item.id, { expiryOption, expiresAt: computeExpiryIso(expiryOption, item.customDate) })
                      }}
                      style={FIELD_STYLE}
                    >
                      <option value="never">Never</option>
                      <option value="1year">1 year</option>
                      <option value="custom">Custom date</option>
                    </select>
                    {item.expiryOption === 'custom' && (
                      <input
                        type="date"
                        value={item.customDate}
                        onChange={(e) => {
                          const customDate = e.target.value
                          updateItem(item.id, { customDate, expiresAt: computeExpiryIso('custom', customDate) })
                        }}
                        style={FIELD_STYLE}
                      />
                    )}
                  </div>
                </div>
              )
            }

            if (item.status === 'cropping') {
              return (
                <div key={item.id} style={{ background: 'var(--claret)', border: '1px solid var(--gold-dim)', borderRadius: 2, padding: 12, marginBottom: 6 }}>
                  <MojoAvatarCrop
                    file={item.file}
                    onCrop={(blob, meta) => updateItem(item.id, { blob, title: meta.title, expiresAt: meta.expiresAt, status: 'pending' })}
                    onSkip={(_blob, meta) => updateItem(item.id, { blob: null, title: meta.title, expiresAt: meta.expiresAt, status: 'pending' })}
                  />
                </div>
              )
            }

            if (item.status === 'processing' || item.status === 'uploading') {
              return (
                <div key={item.id} style={{ background: 'var(--claret)', border: '1px solid var(--elevated)', borderRadius: 2, padding: '8px 12px', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.8rem', color: 'var(--mist)' }}>
                    {item.title} — {item.status === 'processing' ? 'Processing' : 'Uploading'}
                    <span className="mojo-spinner-dot">.</span>
                    <span className="mojo-spinner-dot">.</span>
                    <span className="mojo-spinner-dot">.</span>
                  </span>
                </div>
              )
            }

            if (item.status === 'done') {
              return (
                <div
                  key={item.id}
                  style={{ padding: '8px 12px', marginBottom: 6, opacity: item.fading ? 0 : 1, transition: 'opacity 0.3s ease' }}
                >
                  <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--moonstone)' }}>
                    ✓ {item.title} uploaded
                  </span>
                </div>
              )
            }

            // item.status === 'error'
            return (
              <div key={item.id} style={{ background: 'var(--raised)', border: '1px solid var(--ember-dim)', borderRadius: 2, padding: '8px 12px', marginBottom: 6 }}>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 6px' }}>
                  {item.title}: {item.errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => updateItem(item.id, { status: 'pending', errorMessage: undefined })}
                  style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '5px 12px', fontFamily: 'var(--f-ui)', fontSize: '0.72rem', cursor: 'pointer', marginRight: 10 }}
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--faded)', fontFamily: 'var(--f-body)', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Skip
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
