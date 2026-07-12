'use client'

import { useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browserClient'
import { registerUploadedAvatar } from '@/lib/actions/mojo'
import MojoAvatarCrop from './MojoAvatarCrop'

const MAX_FILE_BYTES = 20 * 1024 * 1024

type Phase = 'idle' | 'crop' | 'uploading' | 'error'
type UploadStep = 'processing' | 'uploading' | 'registering'
type CropMeta = { title: string; expiresAt: string | null }

const STEP_LABEL: Record<UploadStep, string> = {
  processing: 'Processing',
  uploading: 'Uploading',
  registering: 'Registering',
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

  const [queue, setQueue] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [uploadStep, setUploadStep] = useState<UploadStep | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<{ blob: Blob; meta: CropMeta } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [skipWarning, setSkipWarning] = useState<string | null>(null)
  const [successFlash, setSuccessFlash] = useState<string | null>(null)

  function enqueueFiles(files: FileList | File[]) {
    const valid: File[] = []
    let warning: string | null = null
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue
      if (f.size > MAX_FILE_BYTES) {
        warning = `${f.name} is over 20MB and was skipped`
        continue
      }
      valid.push(f)
    }
    setSkipWarning(warning)
    if (valid.length === 0) return

    if (currentFile || phase !== 'idle') {
      setQueue((q) => [...q, ...valid])
    } else {
      const [first, ...rest] = valid
      setQueue(rest)
      setCurrentFile(first)
      setPhase('crop')
    }
  }

  function advanceQueue() {
    setQueue((q) => {
      if (q.length === 0) {
        setCurrentFile(null)
        setPhase('idle')
        return q
      }
      const [next, ...rest] = q
      setCurrentFile(next)
      setPhase('crop')
      return rest
    })
  }

  async function runUpload(blob: Blob, meta: CropMeta) {
    setPhase('uploading')
    setError(null)
    setPending({ blob, meta })

    setUploadStep('processing')
    const isGif = blob.type === 'image/gif'
    const formData = new FormData()
    formData.append('file', blob, isGif ? 'image.gif' : 'image.png')

    let response: Response
    try {
      response = await fetch('/api/mojo/process-image', { method: 'POST', body: formData })
    } catch {
      setPhase('error')
      setError('Failed to process image')
      return
    }
    if (!response.ok) {
      setPhase('error')
      setError('Failed to process image')
      return
    }
    const processedBlob = await response.blob()
    const processedMime = response.headers.get('Content-Type') ?? 'image/png'
    const finalIsGif = response.headers.get('X-Is-Gif') === 'true'

    setUploadStep('uploading')
    const supabase = createBrowserClient()
    const ext = finalIsGif ? 'gif' : 'png'
    const storagePath = 'avatars/' + crypto.randomUUID() + '.' + ext

    const { error: uploadError } = await supabase.storage
      .from('mojo-private')
      .upload(storagePath, processedBlob, { contentType: processedMime, upsert: false })

    if (uploadError) {
      setPhase('error')
      setError('Upload failed: ' + uploadError.message)
      return
    }

    setUploadStep('registering')
    const result = await registerUploadedAvatar({
      storage_path: storagePath,
      mime_type: processedMime,
      title: meta.title,
      expires_at: meta.expiresAt,
      character_id: characterId,
      faceclaim_id: faceclaimId,
      width: null,
      height: null,
      file_size: processedBlob.size,
    })

    if ('error' in result) {
      setPhase('error')
      setError(result.error)
      return
    }

    setUploadStep(null)
    setPending(null)
    setSuccessFlash(meta.title)
    onUploadComplete()
    setTimeout(() => setSuccessFlash(null), 1500)
    advanceQueue()
  }

  function handleRetry() {
    if (pending) runUpload(pending.blob, pending.meta)
  }

  function handleSkipFile() {
    setPending(null)
    setError(null)
    setUploadStep(null)
    advanceQueue()
  }

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

      {successFlash && (
        <p style={{ fontFamily: 'var(--f-ui)', fontSize: '0.8rem', color: 'var(--gold)', margin: '0 0 10px' }}>
          ✓ {successFlash} uploaded
        </p>
      )}

      {phase === 'idle' && (
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
      )}

      {phase === 'crop' && currentFile && (
        <div>
          {queue.length > 0 && (
            <p style={{ fontFamily: 'var(--f-ui)', fontSize: '0.7rem', color: 'var(--faded)', margin: '0 0 10px' }}>
              {queue.length} more in queue
            </p>
          )}
          <MojoAvatarCrop
            file={currentFile}
            onCrop={(blob, meta) => runUpload(blob, meta)}
            onSkip={(blob, meta) => runUpload(blob, meta)}
          />
        </div>
      )}

      {phase === 'uploading' && uploadStep && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--f-ui)', fontSize: '0.8125rem', color: 'var(--mist)', margin: 0 }}>
            {STEP_LABEL[uploadStep]}
            <span className="mojo-spinner-dot">.</span>
            <span className="mojo-spinner-dot">.</span>
            <span className="mojo-spinner-dot">.</span>
          </p>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ padding: 16, background: 'var(--raised)', border: '1px solid var(--ember-dim)', borderRadius: 4 }}>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--ember)', margin: '0 0 10px' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '6px 14px', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', cursor: 'pointer', marginRight: 10 }}
          >
            Retry
          </button>
          <button
            type="button"
            onClick={handleSkipFile}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', fontFamily: 'var(--f-body)', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Skip this file
          </button>
        </div>
      )}
    </div>
  )
}
