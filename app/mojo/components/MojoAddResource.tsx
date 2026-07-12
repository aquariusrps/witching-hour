'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browserClient'
import { createMojoResource, registerUploadedImage } from '@/lib/actions/mojo'

type ResourceType = 'image' | 'text' | 'link' | 'snippet'

const TYPE_TABS: { key: ResourceType; label: string }[] = [
  { key: 'image', label: 'Image/GIF' },
  { key: 'text', label: 'Text Note' },
  { key: 'link', label: 'Link' },
  { key: 'snippet', label: 'Code Snippet' },
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

function navigateTo(path: string) {
  window.location.href = path
}

function submitButtonStyle(loading: boolean): React.CSSProperties {
  return {
    background: 'var(--ember)',
    color: 'var(--roseash)',
    border: 'none',
    borderRadius: 2,
    padding: '8px 20px',
    fontFamily: 'var(--f-ui)',
    fontSize: '0.8rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
  }
}

function computeExpiryIso(option: 'never' | '1year' | 'custom', customDate: string): string | null {
  if (option === 'never') return null
  if (option === '1year') {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString()
  }
  if (customDate) return new Date(customDate).toISOString()
  return null
}

export default function MojoAddResource({
  faceclaimId,
  characterId,
  redirectPath,
}: {
  faceclaimId: string | null
  characterId: string | null
  redirectPath: string
}) {
  const [activeType, setActiveType] = useState<ResourceType>('image')
  const [title, setTitle] = useState('')

  // Image/GIF — upload sub-mode
  const [uploadSubMode, setUploadSubMode] = useState<'upload' | 'fetch'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expiryOption, setExpiryOption] = useState<'never' | '1year' | 'custom'>('never')
  const [customDate, setCustomDate] = useState('')
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'registering'>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Image/GIF — fetch sub-mode
  const [fetchUrl, setFetchUrl] = useState('')
  const [fetchStage, setFetchStage] = useState<'idle' | 'fetching' | 'uploading' | 'registering' | 'done'>('idle')
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Text / Link / Snippet
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function selectType(type: ResourceType) {
    setActiveType(type)
    setUploadError(null)
    setFetchError(null)
    setError(null)
  }

  async function handleUploadFile() {
    if (!selectedFile) {
      setUploadError('Choose a file first')
      return
    }
    if (!title.trim()) {
      setUploadError('Title is required')
      return
    }

    setUploadError(null)
    setUploadStage('uploading')

    const supabase = createBrowserClient()
    const ext = selectedFile.name.split('.').pop() || 'png'
    const path = 'resources/' + crypto.randomUUID() + '.' + ext

    const { error: uploadErr } = await supabase.storage
      .from('mojo-private')
      .upload(path, selectedFile, { contentType: selectedFile.type })

    if (uploadErr) {
      setUploadStage('idle')
      setUploadError('Upload failed: ' + uploadErr.message)
      return
    }

    setUploadStage('registering')

    // PNG conversion via sharp: MOJO-4
    const result = await registerUploadedImage({
      storagePath: path,
      mimeType: selectedFile.type,
      label: title,
      expiresAt: computeExpiryIso(expiryOption, customDate),
      faceclaim_id: faceclaimId,
      character_id: characterId,
      title,
      type: selectedFile.type === 'image/gif' ? 'gif' : 'image',
    })

    if ('error' in result) {
      setUploadStage('idle')
      setUploadError(result.error)
      return
    }

    navigateTo(redirectPath)
  }

  async function handleFetchImage() {
    if (!fetchUrl.trim()) {
      setFetchError('Enter a URL first')
      return
    }
    if (!title.trim()) {
      setFetchError('Title is required')
      return
    }

    setFetchError(null)
    setFetchStage('fetching')

    const response = await fetch('/api/mojo/fetch-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: fetchUrl }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: 'Could not fetch image' }))
      setFetchStage('idle')
      setFetchError(body.error ?? 'Could not fetch image')
      return
    }

    const isGif = response.headers.get('X-Is-Gif') === 'true'
    const blob = await response.blob()
    const mimeType = isGif ? 'image/gif' : 'image/png'

    setFetchStage('uploading')

    const supabase = createBrowserClient()
    const path = 'resources/' + crypto.randomUUID() + (isGif ? '.gif' : '.png')

    const { error: uploadErr } = await supabase.storage
      .from('mojo-private')
      .upload(path, blob, { contentType: mimeType })

    if (uploadErr) {
      setFetchStage('idle')
      setFetchError('Upload failed: ' + uploadErr.message)
      return
    }

    setFetchStage('registering')

    const result = await registerUploadedImage({
      storagePath: path,
      mimeType,
      label: title,
      expiresAt: computeExpiryIso(expiryOption, customDate),
      faceclaim_id: faceclaimId,
      character_id: characterId,
      title,
      type: isGif ? 'gif' : 'image',
    })

    if ('error' in result) {
      setFetchStage('idle')
      setFetchError(result.error)
      return
    }

    setFetchStage('done')
    setTimeout(() => navigateTo(redirectPath), 900)
  }

  async function handleTextSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMojoResource({
      faceclaim_id: faceclaimId,
      character_id: characterId,
      title,
      type: 'text',
      content,
    })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateTo(redirectPath)
  }

  async function handleLinkSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMojoResource({
      faceclaim_id: faceclaimId,
      character_id: characterId,
      title,
      type: 'link',
      url,
    })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateTo(redirectPath)
  }

  async function handleSnippetSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createMojoResource({
      faceclaim_id: faceclaimId,
      character_id: characterId,
      title,
      type: 'snippet',
      content,
    })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateTo(redirectPath)
  }

  return (
    <div style={{ background: 'var(--claret)', border: '1px solid var(--elevated)', borderRadius: 4, padding: 18, marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {TYPE_TABS.map((tab) => {
          const isActive = tab.key === activeType
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => selectType(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                color: isActive ? 'var(--gold)' : 'var(--faded)',
                padding: 0,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={LABEL_STYLE}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={INPUT_STYLE}
        />
      </div>

      {activeType === 'image' && (
        <div>
          <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => setUploadSubMode('upload')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.68rem',
                color: uploadSubMode === 'upload' ? 'var(--roseash)' : 'var(--faded)',
                borderBottom: uploadSubMode === 'upload' ? '1px solid var(--ember)' : '1px solid transparent',
                paddingBottom: 2,
              }}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadSubMode('fetch')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.68rem',
                color: uploadSubMode === 'fetch' ? 'var(--roseash)' : 'var(--faded)',
                borderBottom: uploadSubMode === 'fetch' ? '1px solid var(--ember)' : '1px solid transparent',
                paddingBottom: 2,
              }}
            >
              Fetch from URL
            </button>
          </div>

          {uploadSubMode === 'upload' ? (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--roseash)', marginBottom: 10, display: 'block' }}
              />
              {selectedFile && (
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--mist)', margin: '0 0 10px' }}>
                  Selected: {selectedFile.name}
                </p>
              )}

              <div style={{ marginBottom: 10 }}>
                <label style={LABEL_STYLE}>Link expires</label>
                <select
                  value={expiryOption}
                  onChange={(e) => setExpiryOption(e.target.value as 'never' | '1year' | 'custom')}
                  style={INPUT_STYLE}
                >
                  <option value="never">Never (indefinite)</option>
                  <option value="1year">1 year</option>
                  <option value="custom">Custom date</option>
                </select>
                {expiryOption === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    style={{ ...INPUT_STYLE, marginTop: 8 }}
                  />
                )}
              </div>

              {uploadError && (
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 10px' }}>
                  {uploadError}
                </p>
              )}

              <button
                type="button"
                onClick={handleUploadFile}
                disabled={uploadStage !== 'idle'}
                style={submitButtonStyle(uploadStage !== 'idle')}
              >
                {uploadStage === 'uploading' ? 'Uploading…' : uploadStage === 'registering' ? 'Registering…' : 'Upload'}
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="https://..."
                value={fetchUrl}
                onChange={(e) => setFetchUrl(e.target.value)}
                style={{ ...INPUT_STYLE, marginBottom: 10 }}
              />

              <div style={{ marginBottom: 10 }}>
                <label style={LABEL_STYLE}>Link expires</label>
                <select
                  value={expiryOption}
                  onChange={(e) => setExpiryOption(e.target.value as 'never' | '1year' | 'custom')}
                  style={INPUT_STYLE}
                >
                  <option value="never">Never (indefinite)</option>
                  <option value="1year">1 year</option>
                  <option value="custom">Custom date</option>
                </select>
                {expiryOption === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    style={{ ...INPUT_STYLE, marginTop: 8 }}
                  />
                )}
              </div>

              {fetchError && (
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 10px' }}>
                  {fetchError}
                </p>
              )}

              <button
                type="button"
                onClick={handleFetchImage}
                disabled={fetchStage !== 'idle'}
                style={submitButtonStyle(fetchStage !== 'idle')}
              >
                {fetchStage === 'fetching' ? 'Fetching…'
                  : fetchStage === 'uploading' ? 'Uploading…'
                  : fetchStage === 'registering' ? 'Registering…'
                  : fetchStage === 'done' ? `✓ Saved as ${title}`
                  : 'Fetch Image'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeType === 'text' && (
        <form onSubmit={handleTextSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ ...INPUT_STYLE, minHeight: 100, resize: 'vertical', marginBottom: 10 }}
          />
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 10px' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
            {loading ? 'Saving…' : 'Add Note'}
          </button>
        </form>
      )}

      {activeType === 'link' && (
        <form onSubmit={handleLinkSubmit}>
          <input
            type="text"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={{ ...INPUT_STYLE, marginBottom: 10 }}
          />
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 10px' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
            {loading ? 'Saving…' : 'Add Link'}
          </button>
        </form>
      )}

      {activeType === 'snippet' && (
        <form onSubmit={handleSnippetSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{
              ...INPUT_STYLE,
              minHeight: 120,
              resize: 'vertical',
              marginBottom: 10,
              fontFamily: "'Courier New', monospace",
            }}
          />
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 10px' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} style={submitButtonStyle(loading)}>
            {loading ? 'Saving…' : 'Add Snippet'}
          </button>
        </form>
      )}
    </div>
  )
}
