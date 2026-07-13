'use client'

import { useMemo, useState } from 'react'
import MojoImageFolderList from './MojoImageFolderList'
import MojoPersonalImageUpload from './MojoPersonalImageUpload'
import MojoPersonalImageCard from './MojoPersonalImageCard'
import type { Tables } from '@/types/database'

type MojoPersonalImage = Tables<'mojo_personal_images'>
type MojoImageFolder = Tables<'mojo_image_folders'>

function navigateToImages() {
  window.location.href = '/mojo/images'
}

function FiligreeDivider() {
  return (
    <div style={{ height: 1, margin: '16px 0', background: 'linear-gradient(to right, var(--ember), var(--gold))', opacity: 0.35 }} />
  )
}

export default function MojoPersonalImageManager({
  initialImages,
  initialFolders,
  totalCount,
  untaggedCount,
}: {
  initialImages: MojoPersonalImage[]
  initialFolders: Array<MojoImageFolder & { image_count: number }>
  totalCount: number
  untaggedCount: number
}) {
  const [activeFolder, setActiveFolder] = useState<string | 'all' | 'untagged'>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [images, setImages] = useState<MojoPersonalImage[]>(initialImages)

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (activeFolder === 'untagged') return !img.folder_id
      if (activeFolder !== 'all') {
        if (img.folder_id !== activeFolder) return false
      }
      if (activeTag) {
        const tags = (img.tags ?? '').split(',').map((t) => t.trim().toLowerCase())
        if (!tags.includes(activeTag.toLowerCase())) return false
      }
      return true
    })
  }, [images, activeFolder, activeTag])

  const allTags = useMemo(() => {
    return [...new Set(
      images.flatMap((img) => (img.tags ?? '').split(',').map((t) => t.trim())).filter(Boolean)
    )].sort()
  }, [images])

  function handleSelectFolder(folder: string | 'all' | 'untagged') {
    setActiveFolder(folder)
    setActiveTag(null)
  }

  function handleToggleTag(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag))
  }

  function handleDelete(imageId: string) {
    setImages((prev) => prev.filter((i) => i.id !== imageId))
  }

  const folderName = activeFolder !== 'all' && activeFolder !== 'untagged'
    ? initialFolders.find((f) => f.id === activeFolder)?.name ?? null
    : null

  let heading = `All Images (${images.length})`
  if (activeFolder === 'untagged') heading = `Untagged (${untaggedCount})`
  else if (folderName) {
    const count = initialFolders.find((f) => f.id === activeFolder)?.image_count ?? 0
    heading = `📁 ${folderName} (${count})`
  }
  if (activeTag) heading += ` · #${activeTag}`

  let emptyMessage = 'No images yet. Upload your first one above.'
  if (activeTag) emptyMessage = `No images tagged with '${activeTag}'.`
  else if (activeFolder === 'untagged') emptyMessage = 'No untagged images.'
  else if (activeFolder !== 'all') emptyMessage = 'No images in this folder yet.'

  return (
    <div style={{ display: 'flex', minHeight: '60vh', position: 'relative', zIndex: 1 }}>
      <MojoImageFolderList
        folders={initialFolders}
        totalCount={totalCount}
        untaggedCount={untaggedCount}
        activeFolder={activeFolder}
        onSelectFolder={handleSelectFolder}
      />

      <div style={{ flex: 1, padding: '0 24px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)' }}>
            {heading}
          </span>
          <button
            type="button"
            onClick={() => setShowUpload((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--ember)' }}
          >
            {showUpload ? 'Cancel' : '+ Upload Images'}
          </button>
        </div>

        {showUpload && (
          <div style={{ marginBottom: 12 }}>
            <MojoPersonalImageUpload
              folderId={activeFolder !== 'all' && activeFolder !== 'untagged' ? activeFolder : null}
              onUploadComplete={() => {
                setShowUpload(false)
                navigateToImages()
              }}
            />
            <FiligreeDivider />
          </div>
        )}

        {allTags.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', color: 'var(--faded)', marginRight: 8 }}>
              Filter by tag:
            </span>
            <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', verticalAlign: 'middle' }}>
              {allTags.map((tag) => {
                const isActive = activeTag === tag
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={['mojo-tag-chip', isActive ? 'mojo-tag-chip-active' : ''].join(' ').trim()}
                  >
                    {tag}
                  </button>
                )
              })}
              {activeTag && (
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  style={{
                    fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', padding: '3px 10px', borderRadius: 99,
                    cursor: 'pointer', background: 'none', border: 'none', color: 'var(--ember-dim)',
                  }}
                >
                  Clear filter ×
                </button>
              )}
            </span>
          </div>
        )}

        {filteredImages.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
            {emptyMessage}
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 70%)',
          }}>
            {filteredImages.map((image, index) => (
              <MojoPersonalImageCard
                key={image.id}
                image={image}
                index={index}
                folders={initialFolders}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
