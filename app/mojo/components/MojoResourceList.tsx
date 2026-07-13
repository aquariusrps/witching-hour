'use client'

import { useState } from 'react'
import {
  updateMojoResource,
  deleteMojoResource,
  unlinkResourceFromCharacter,
} from '@/lib/actions/mojo'
import type { Tables } from '@/types/database'

type MojoResource = Tables<'mojo_resources'>

function navigateTo(path: string) {
  window.location.href = path
}

function truncateUrl(url: string, max = 40): string {
  if (url.length <= max) return url
  return url.slice(0, max - 1) + '…'
}

const GROUP_LABELS: Record<string, string> = {
  image: 'Images & GIFs',
  text: 'Text Notes',
  link: 'Links',
  snippet: 'Code Snippets',
}

const GROUP_ORDER = ['image', 'text', 'link', 'snippet']

function groupKey(type: string): string {
  return type === 'gif' ? 'image' : type
}

export default function MojoResourceList({
  resources,
  redirectPath,
  ownedCharacterId,
  linkedFromFaceclaimName,
  onLinkToCharacter,
}: {
  resources: MojoResource[]
  redirectPath: string
  ownedCharacterId?: string
  linkedFromFaceclaimName?: string
  onLinkToCharacter?: (resourceId: string) => void
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  if (resources.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
        No resources yet.
      </p>
    )
  }

  const groups = new Map<string, MojoResource[]>()
  for (const r of resources) {
    const key = groupKey(r.type)
    const list = groups.get(key) ?? []
    list.push(r)
    groups.set(key, list)
  }

  function isLinked(resource: MojoResource): boolean {
    return !!ownedCharacterId && resource.character_id !== ownedCharacterId
  }

  async function handleCopy(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // ignore clipboard failures
    }
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDelete(id: string) {
    setActionLoadingId(id)
    setRowError(null)
    const result = await deleteMojoResource(id)

    if ('error' in result) {
      setActionLoadingId(null)
      setRowError({ id, message: result.error })
      return
    }

    navigateTo(redirectPath)
  }

  async function handleUnlink(id: string) {
    if (!ownedCharacterId) return
    setActionLoadingId(id)
    setRowError(null)
    const result = await unlinkResourceFromCharacter(id, ownedCharacterId)

    if ('error' in result) {
      setActionLoadingId(null)
      setRowError({ id, message: result.error })
      return
    }

    navigateTo(redirectPath)
  }

  function startEdit(resource: MojoResource) {
    setEditingId(resource.id)
    setEditContent(resource.content ?? '')
    setEditError(null)
  }

  async function handleEditSave(id: string) {
    setEditLoading(true)
    setEditError(null)
    const result = await updateMojoResource(id, { content: editContent })

    if ('error' in result) {
      setEditLoading(false)
      setEditError(result.error)
      return
    }

    navigateTo(redirectPath)
  }

  function renderBadge(resource: MojoResource) {
    if (!isLinked(resource) || !linkedFromFaceclaimName) return null
    return (
      <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.62rem', color: 'var(--faded)', marginLeft: 8 }}>
        ↗ {linkedFromFaceclaimName}
      </span>
    )
  }

  function renderActions(resource: MojoResource) {
    const linked = isLinked(resource)
    const hasRowError = rowError?.id === resource.id

    if (confirmId === resource.id) {
      return (
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--faded)' }}>Delete? </span>
          <button
            type="button"
            onClick={() => handleDelete(resource.id)}
            disabled={actionLoadingId === resource.id}
            style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Yes
          </button>
          <span style={{ color: 'var(--faded)' }}> · </span>
          <button
            type="button"
            onClick={() => setConfirmId(null)}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Cancel
          </button>
        </span>
      )
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {hasRowError && (
          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--ember)' }}>
            {rowError!.message}
          </span>
        )}
        {onLinkToCharacter && (
          <button
            type="button"
            onClick={() => onLinkToCharacter(resource.id)}
            style={{ background: 'none', border: 'none', color: 'var(--moonstone)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}
          >
            Link →
          </button>
        )}
        {linked ? (
          <button
            type="button"
            onClick={() => handleUnlink(resource.id)}
            disabled={actionLoadingId === resource.id}
            style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}
          >
            Unlink
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmId(resource.id)}
            style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}
          >
            Delete
          </button>
        )}
      </span>
    )
  }

  return (
    <div>
      {GROUP_ORDER.filter((key) => groups.has(key)).map((key) => (
        <div key={key} style={{ marginBottom: 24 }}>
          <h4 style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.68rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            margin: '0 0 10px',
          }}>
            {GROUP_LABELS[key]}
          </h4>

          {groups.get(key)!.map((resource) => {
            if (key === 'image') {
              return (
                <div
                  key={resource.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--elevated)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resource.public_url ?? ''}
                    alt={resource.title}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--roseash)', flexShrink: 0 }}>
                    {resource.title}
                  </span>
                  {renderBadge(resource)}
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.68rem',
                    color: 'var(--faded)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {truncateUrl(resource.public_url ?? '')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(resource.id, resource.public_url ?? '')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.7rem', color: 'var(--moonstone)', flexShrink: 0 }}
                  >
                    {copiedId === resource.id ? '✓ Copied' : 'Copy'}
                  </button>
                  {renderActions(resource)}
                </div>
              )
            }

            if (key === 'text') {
              const isExpanded = expandedIds.has(resource.id)
              const isEditing = editingId === resource.id
              const content = resource.content ?? ''
              const preview = content.length > 80 ? content.slice(0, 80) + '…' : content

              return (
                <div
                  key={resource.id}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid var(--elevated)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--f-head)', fontSize: '0.92rem', color: 'var(--roseash)' }}>
                      {resource.title}
                      {renderBadge(resource)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEdit(resource)}
                          aria-label="Edit note"
                          style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          ✎
                        </button>
                      )}
                      {renderActions(resource)}
                    </span>
                  </div>

                  {isEditing ? (
                    <div style={{ marginTop: 8 }}>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: 100,
                          resize: 'vertical',
                          background: 'var(--raised)',
                          color: 'var(--roseash)',
                          border: '1px solid var(--elevated)',
                          borderRadius: 2,
                          padding: 10,
                          fontFamily: 'var(--f-body)',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box',
                        }}
                      />
                      {editError && (
                        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--ember)', margin: '6px 0' }}>
                          {editError}
                        </p>
                      )}
                      <div style={{ marginTop: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleEditSave(resource.id)}
                          disabled={editLoading}
                          style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '6px 14px', fontFamily: 'var(--f-ui)', fontSize: '0.72rem', cursor: editLoading ? 'not-allowed' : 'pointer' }}
                        >
                          {editLoading ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          style={{ background: 'none', border: 'none', color: 'var(--faded)', marginLeft: 10, fontFamily: 'var(--f-body)', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--mist)', margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                      {isExpanded ? content : preview}
                      {content.length > 80 && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(resource.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.68rem', marginLeft: 6 }}
                        >
                          {isExpanded ? 'less' : 'more'}
                        </button>
                      )}
                    </p>
                  )}
                </div>
              )
            }

            if (key === 'link') {
              return (
                <div
                  key={resource.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--elevated)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <a
                      href={resource.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--f-body)', fontSize: '0.9rem', color: 'var(--roseash)' }}
                    >
                      {resource.title}
                    </a>
                    {renderBadge(resource)}
                    <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--faded)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {resource.url}
                    </p>
                  </div>
                  {renderActions(resource)}
                </div>
              )
            }

            // snippet
            return (
              <div
                key={resource.id}
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--elevated)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--f-head)', fontSize: '0.92rem', color: 'var(--roseash)' }}>
                    {resource.title}
                    {renderBadge(resource)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleCopy(resource.id, resource.content ?? '')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.7rem', color: 'var(--moonstone)' }}
                    >
                      {copiedId === resource.id ? '✓ Copied' : 'Copy'}
                    </button>
                    {renderActions(resource)}
                  </span>
                </div>
                <pre style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.78rem',
                  color: 'var(--roseash)',
                  background: 'var(--raised)',
                  border: '1px solid var(--elevated)',
                  borderRadius: 2,
                  padding: 10,
                  overflowX: 'auto',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}>
                  {resource.content}
                </pre>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
