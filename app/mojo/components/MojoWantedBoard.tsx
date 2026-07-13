'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browserClient'
import {
  createMojoWanted,
  updateMojoWanted,
  updateMojoWantedStatus,
  deleteMojoWanted,
  registerWantedImage,
} from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'
import type { Tables } from '@/types/database'

type MojoWanted = Tables<'mojo_wanted'>
type WantedItem = MojoWanted & { character_name: string | null; proxy_url: string | null }
type CharacterOption = { id: string; name: string; status: string }

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

async function uploadWantedImage(
  file: File,
  rpId: string
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
  const storagePath = 'wanted/' + crypto.randomUUID() + '.' + ext

  const { error: uploadError } = await supabase.storage
    .from('mojo-private')
    .upload(storagePath, processedBlob, { contentType: processedMime, upsert: false })

  if (uploadError) {
    return { error: 'Upload failed: ' + uploadError.message }
  }

  return registerWantedImage({
    storage_path: storagePath,
    mime_type: processedMime,
    rp_id: rpId,
  })
}

function MojoWantedItemRow({
  item,
  characters,
  rpId,
  onChange,
  onDelete,
}: {
  item: WantedItem
  characters: CharacterOption[]
  rpId: string
  onChange: (item: WantedItem) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [title, setTitle] = useState(item.title)
  const [characterId, setCharacterId] = useState(item.character_id ?? '')
  const [description, setDescription] = useState(item.description ?? '')
  const [imageToken, setImageToken] = useState(item.image_token)
  const [proxyUrl, setProxyUrl] = useState(item.proxy_url)
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const activeCharacters = characters.filter((c) => c.status === 'active')

  function startEdit() {
    setTitle(item.title)
    setCharacterId(item.character_id ?? '')
    setDescription(item.description ?? '')
    setImageToken(item.image_token)
    setProxyUrl(item.proxy_url)
    setSaveError(null)
    setImageError(null)
    setEditing(true)
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setImageError(null)

    const result = await uploadWantedImage(file, rpId)
    setUploading(false)

    if ('error' in result) {
      setImageError(result.error)
      return
    }

    setImageToken(result.token)
    setProxyUrl(result.proxyUrl)
  }

  function removeImage() {
    setImageToken(null)
    setProxyUrl(null)
  }

  async function handleSave() {
    if (!title.trim()) {
      setSaveError('Title is required')
      return
    }
    setSaveLoading(true)
    setSaveError(null)

    const result = await updateMojoWanted(item.id, {
      title: title.trim(),
      description: description || null,
      character_id: characterId || null,
      image_token: imageToken,
    })

    setSaveLoading(false)

    if ('error' in result) {
      setSaveError(result.error)
      return
    }

    const character = characters.find((c) => c.id === characterId)
    onChange({
      ...item,
      title: title.trim(),
      description: description || null,
      character_id: characterId || null,
      character_name: character?.name ?? null,
      image_token: imageToken,
      proxy_url: proxyUrl,
    })
    setEditing(false)
  }

  async function handleToggleStatus() {
    const newStatus = item.status === 'open' ? 'filled' : 'open'
    setStatusLoading(true)
    const result = await updateMojoWantedStatus(item.id, newStatus)
    setStatusLoading(false)
    if ('error' in result) return
    onChange({ ...item, status: newStatus })
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const result = await deleteMojoWanted(item.id)
    setDeleteLoading(false)
    if ('error' in result) return
    onDelete(item.id)
  }

  if (editing) {
    return (
      <div style={{ background: 'var(--raised)', border: '1px solid var(--gold-dim)', borderRadius: 4, padding: 14, marginBottom: 8 }}>
        {saveError && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 10px' }}>{saveError}</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={LABEL_STYLE}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Seeking a rival for Remy, enemies to lovers"
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>Assign to character</label>
            <select value={characterId} onChange={(e) => setCharacterId(e.target.value)} style={INPUT_STYLE}>
              <option value="">— No character —</option>
              {activeCharacters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL_STYLE}>Description</label>
            <MojoRichTextEditor
              content={description}
              onChange={setDescription}
              minHeight="100px"
              placeholder="Describe what you're looking for, the dynamic, backstory hooks..."
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>Reference image</label>
            {proxyUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proxyUrl} alt="Reference" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 2 }} />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.7rem' }}
                >
                  Remove image
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--mist)' }}
              />
            )}
            {uploading && (
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
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveLoading}
            style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '7px 18px', fontFamily: 'var(--f-ui)', fontSize: '0.78rem', cursor: saveLoading ? 'not-allowed' : 'pointer' }}
          >
            {saveLoading ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', marginLeft: 12, fontFamily: 'var(--f-body)', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderLeft: `3px solid ${item.status === 'open' ? 'var(--gold)' : 'var(--faded)'}`,
        borderRadius: 4,
        padding: '12px 16px',
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontFamily: 'var(--f-head)', fontSize: '0.9375rem', color: 'var(--roseash)' }}>
          {item.title}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {confirmingDelete ? (
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}>
              <span style={{ color: 'var(--faded)' }}>Delete this connection? </span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                Yes, delete
              </button>
              <span style={{ color: 'var(--faded)' }}> · </span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                Cancel
              </button>
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: statusLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6875rem',
                  color: item.status === 'open' ? 'var(--moonstone)' : 'var(--gold-dim)',
                }}
              >
                {item.status === 'open' ? 'Mark filled ✓' : 'Reopen'}
              </button>
              <button
                type="button"
                onClick={startEdit}
                aria-label="Edit connection"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', color: 'var(--gold-dim)' }}
              >
                ✎
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Delete connection"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', color: 'var(--ember-dim)' }}
              >
                ×
              </button>
            </>
          )}
        </span>
      </div>

      {item.character_name && (
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.625rem',
            color: 'var(--faded)',
            background: 'var(--raised)',
            padding: '2px 8px',
            borderRadius: 2,
            marginTop: 4,
          }}
        >
          → {item.character_name}
        </span>
      )}

      {item.description && (
        <div style={{ marginTop: 8 }}>
          <MojoRichTextEditor content={item.description} onChange={() => {}} readonly />
        </div>
      )}

      {item.proxy_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.proxy_url}
          alt="Reference"
          style={{ maxWidth: 120, maxHeight: 120, objectFit: 'cover', borderRadius: 2, marginTop: 8 }}
        />
      )}
    </div>
  )
}

export default function MojoWantedBoard({
  rpId,
  initialItems,
  characters,
}: {
  rpId: string
  initialItems: WantedItem[]
  characters: CharacterOption[]
}) {
  const [items, setItems] = useState<WantedItem[]>(initialItems)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilled, setShowFilled] = useState(false)

  const [title, setTitle] = useState('')
  const [characterId, setCharacterId] = useState('')
  const [description, setDescription] = useState('')
  const [pendingImageToken, setPendingImageToken] = useState<string | null>(null)
  const [pendingProxyUrl, setPendingProxyUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const activeCharacters = characters.filter((c) => c.status === 'active')
  const openItems = items.filter((i) => i.status === 'open')
  const filledItems = items.filter((i) => i.status === 'filled')

  function resetForm() {
    setTitle('')
    setCharacterId('')
    setDescription('')
    setPendingImageToken(null)
    setPendingProxyUrl(null)
    setImageError(null)
    setAddError(null)
  }

  function toggleAddForm() {
    if (showAddForm) {
      setShowAddForm(false)
      return
    }
    resetForm()
    setShowAddForm(true)
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setImageError(null)

    const result = await uploadWantedImage(file, rpId)
    setUploading(false)

    if ('error' in result) {
      setImageError(result.error)
      return
    }

    setPendingImageToken(result.token)
    setPendingProxyUrl(result.proxyUrl)
  }

  function removePendingImage() {
    setPendingImageToken(null)
    setPendingProxyUrl(null)
  }

  async function handleAdd() {
    if (!title.trim()) {
      setAddError('Title is required')
      return
    }
    setAddLoading(true)
    setAddError(null)

    const result = await createMojoWanted({
      rp_id: rpId,
      character_id: characterId || null,
      title: title.trim(),
      description: description || null,
      image_token: pendingImageToken,
    })

    setAddLoading(false)

    if ('error' in result) {
      setAddError(result.error)
      return
    }

    const character = characters.find((c) => c.id === characterId)
    setItems((prev) => [
      { ...result.item, character_name: character?.name ?? null, proxy_url: pendingProxyUrl },
      ...prev,
    ])
    resetForm()
    setShowAddForm(false)
  }

  function handleItemChange(updated: WantedItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }

  function handleItemDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', margin: 0 }}>
          Wanted / Connections
        </h3>
        <button
          type="button"
          onClick={toggleAddForm}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--gold)' }}
        >
          {showAddForm ? 'Cancel' : '+ Add Connection'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: 'var(--raised)', border: '1px solid var(--gold-dim)', borderRadius: 4, padding: 14, marginBottom: 16 }}>
          {addError && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 10px' }}>{addError}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={LABEL_STYLE}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Seeking a rival for Remy, enemies to lovers"
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Assign to character</label>
              <select value={characterId} onChange={(e) => setCharacterId(e.target.value)} style={INPUT_STYLE}>
                <option value="">— No character —</option>
                {activeCharacters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={LABEL_STYLE}>Description</label>
              <MojoRichTextEditor
                content={description}
                onChange={setDescription}
                minHeight="100px"
                placeholder="Describe what you're looking for, the dynamic, backstory hooks..."
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Reference image</label>
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
                <div>
                  <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--faded)', margin: '0 0 6px' }}>
                    Upload a reference image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--mist)' }}
                  />
                </div>
              )}
              {uploading && (
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
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={handleAdd}
              disabled={addLoading}
              style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '7px 18px', fontFamily: 'var(--f-ui)', fontSize: '0.8125rem', cursor: addLoading ? 'not-allowed' : 'pointer' }}
            >
              {addLoading ? 'Adding…' : 'Add Connection'}
            </button>
          </div>
        </div>
      )}

      {openItems.length === 0 ? (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
          No open connections yet. Add one above.
        </p>
      ) : (
        openItems.map((item) => (
          <MojoWantedItemRow
            key={item.id}
            item={item}
            characters={characters}
            rpId={rpId}
            onChange={handleItemChange}
            onDelete={handleItemDelete}
          />
        ))
      )}

      {filledItems.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={() => setShowFilled((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', color: 'var(--faded)', padding: 0, marginBottom: showFilled ? 10 : 0, display: 'block' }}
          >
            {showFilled ? '▼' : '▶'} Filled ({filledItems.length})
          </button>
          {showFilled && filledItems.map((item) => (
            <MojoWantedItemRow
              key={item.id}
              item={item}
              characters={characters}
              rpId={rpId}
              onChange={handleItemChange}
              onDelete={handleItemDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
