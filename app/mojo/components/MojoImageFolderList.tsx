'use client'

import { useState } from 'react'
import { createMojoImageFolder, updateMojoImageFolder, deleteMojoImageFolder } from '@/lib/actions/mojo'
import type { Tables } from '@/types/database'

type MojoImageFolder = Tables<'mojo_image_folders'>

function navigateToImages() {
  window.location.href = '/mojo/images'
}

function itemStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    padding: '6px 16px',
    cursor: 'pointer',
    fontFamily: 'var(--f-body)',
    fontSize: '0.875rem',
    color: isActive ? 'var(--roseash)' : 'var(--mist)',
    background: isActive ? 'var(--elevated)' : 'transparent',
    borderRight: isActive ? '2px solid var(--ember)' : '2px solid transparent',
  }
}

function FolderRow({
  folder,
  isActive,
  onSelect,
}: {
  folder: MojoImageFolder & { image_count: number }
  isActive: boolean
  onSelect: () => void
}) {
  const [hover, setHover] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(folder.name)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  async function commitRename() {
    const name = nameDraft.trim()
    setRenaming(false)
    if (!name || name === folder.name) return
    await updateMojoImageFolder(folder.id, { name })
    navigateToImages()
  }

  async function handleDelete() {
    await deleteMojoImageFolder(folder.id)
    navigateToImages()
  }

  if (renaming) {
    return (
      <div style={{ padding: '4px 16px' }}>
        <input
          type="text"
          value={nameDraft}
          autoFocus
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') { setNameDraft(folder.name); setRenaming(false) }
          }}
          style={{
            width: '100%', padding: '4px 6px', background: 'var(--char)', color: 'var(--roseash)',
            border: '1px solid var(--gold-dim)', borderRadius: 2, fontFamily: 'var(--f-body)', fontSize: '0.8125rem',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>
    )
  }

  if (confirmingDelete) {
    return (
      <div style={{ padding: '6px 16px' }}>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--faded)', margin: '0 0 4px' }}>
          Delete? ({folder.image_count} images become unassigned)
        </p>
        <button type="button" onClick={handleDelete} style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', padding: 0, marginRight: 10 }}>
          Yes
        </button>
        <button type="button" onClick={() => setConfirmingDelete(false)} style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', padding: 0 }}>
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div
      style={itemStyle(isActive)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span onClick={onSelect} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        📁 {folder.name} ({folder.image_count})
      </span>
      {hover && (
        <span style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setRenaming(true)}
            aria-label="Rename folder"
            style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontSize: '0.6875rem', padding: 0 }}
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Delete folder"
            style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontSize: '0.6875rem', padding: 0 }}
          >
            ×
          </button>
        </span>
      )}
    </div>
  )
}

export default function MojoImageFolderList({
  folders,
  totalCount,
  untaggedCount,
  activeFolder,
  onSelectFolder,
}: {
  folders: Array<MojoImageFolder & { image_count: number }>
  totalCount: number
  untaggedCount: number
  activeFolder: string | 'all' | 'untagged'
  onSelectFolder: (folder: string | 'all' | 'untagged') => void
}) {
  const [newFolderName, setNewFolderName] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    const name = newFolderName.trim()
    if (!name) return
    setCreating(true)
    const result = await createMojoImageFolder({ name })
    if ('error' in result) {
      setCreating(false)
      return
    }
    navigateToImages()
  }

  return (
    <div style={{ width: 220, flexShrink: 0, background: 'var(--raised)', borderRight: '1px solid var(--elevated)', padding: '16px 0', overflowY: 'auto' }}>
      <div style={itemStyle(activeFolder === 'all')} onClick={() => onSelectFolder('all')}>
        <span>All Images ({totalCount})</span>
      </div>
      {untaggedCount > 0 && (
        <div style={itemStyle(activeFolder === 'untagged')} onClick={() => onSelectFolder('untagged')}>
          <span>Untagged ({untaggedCount})</span>
        </div>
      )}

      <div style={{ height: 1, background: 'var(--elevated)', margin: '8px 16px' }} />

      <p style={{ fontFamily: 'var(--f-ui)', fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--faded)', padding: '4px 16px', margin: 0 }}>
        Folders
      </p>

      {folders.map((folder) => (
        <FolderRow
          key={folder.id}
          folder={folder}
          isActive={activeFolder === folder.id}
          onSelect={() => onSelectFolder(folder.id)}
        />
      ))}

      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name..."
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          style={{
            flex: 1, padding: '5px 8px', background: 'var(--char)', color: 'var(--roseash)',
            border: '1px solid var(--elevated)', borderRadius: 2, fontFamily: 'var(--f-body)', fontSize: '0.78rem',
            outline: 'none', minWidth: 0,
          }}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          style={{
            background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2,
            padding: '5px 10px', fontFamily: 'var(--f-ui)', fontSize: '0.78rem', cursor: creating ? 'not-allowed' : 'pointer',
          }}
        >
          {creating ? '...' : '+'}
        </button>
      </div>
    </div>
  )
}
