'use client'

import { useState } from 'react'
import { createMojoImageFolder, updateMojoImageFolder, deleteMojoImageFolder } from '@/lib/actions/mojo'
import { SvgFolderTab, SvgLeatherTexture, SvgNavImages } from '@/app/mojo/components/MojoSvgAssets'
import type { Tables } from '@/types/database'

type MojoImageFolder = Tables<'mojo_image_folders'>

function navigateToImages() {
  window.location.href = '/mojo/images'
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
      className={['mojo-folder-tab', isActive ? 'mojo-folder-tab-active' : ''].join(' ').trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 12px',
        cursor: 'pointer',
        fontFamily: 'EB Garamond, serif',
        fontSize: 13,
        justifyContent: 'space-between',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        onClick={onSelect}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflow: 'hidden',
          color: isActive ? 'var(--roseash)' : 'var(--mist)',
        }}
      >
        <SvgFolderTab active={isActive} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {folder.name} ({folder.image_count})
        </span>
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
    <div
      className="mojo-cabinet-panel"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: 220,
        flexShrink: 0,
        padding: '16px 0',
        overflowY: 'auto',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          color: 'var(--mist)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      >
        <SvgLeatherTexture />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 12px 8px',
          color: 'var(--faded)',
        }}>
          <SvgNavImages active={false} />
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '9px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
          }}>
            Files
          </span>
        </div>

        <div
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: activeFolder === 'all' ? 'var(--roseash)' : 'var(--faded)',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onClick={() => onSelectFolder('all')}
        >
          <SvgNavImages active={activeFolder === 'all'} />
          <span>All Images ({totalCount})</span>
        </div>
        {untaggedCount > 0 && (
          <div
            style={{
              fontFamily: 'EB Garamond, serif',
              fontSize: '12px',
              fontStyle: 'italic',
              color: activeFolder === 'untagged' ? 'var(--roseash)' : 'var(--faded)',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
            onClick={() => onSelectFolder('untagged')}
          >
            Untagged ({untaggedCount})
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
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
              opacity: 0.7,
              background: 'none',
              border: '1px solid var(--elevated)',
              borderRadius: 2,
              padding: '6px 12px',
              cursor: creating ? 'not-allowed' : 'pointer',
            }}
          >
            {creating ? '...' : '+'}
          </button>
        </div>
      </div>
    </div>
  )
}
