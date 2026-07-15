'use client'

import { useState, useEffect } from 'react'
import { SvgNavFamiliar } from './MojoSvgAssets'
import {
  listFamiliarConversations,
  createFamiliarConversation,
  deleteFamiliarConversation,
  renameFamiliarConversation,
} from '@/lib/actions/mojo'

type Conversation = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export default function MojoFamiliarSidebar({
  activeConversationId,
  refreshKey,
  onSelect,
  onNew,
}: {
  activeConversationId: string | null
  refreshKey: number
  onSelect: (id: string) => void
  onNew: (id: string) => void
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadConversations() {
    const result = await listFamiliarConversations()
    if (Array.isArray(result)) {
      setConversations(result)
    }
    setLoading(false)
  }

  // Refresh when the active conversation changes (new title, new
  // conversation) or when a background auto-title call resolves.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConversations()
  }, [activeConversationId, refreshKey])

  async function handleNew() {
    const result = await createFamiliarConversation()
    if ('conversation' in result && result.conversation) {
      const conversation = result.conversation
      setConversations((prev) => [conversation, ...prev])
      onNew(conversation.id)
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    await deleteFamiliarConversation(id)
    const remaining = conversations.filter((c) => c.id !== id)
    setConversations(remaining)
    if (id === activeConversationId) {
      if (remaining.length > 0) onSelect(remaining[0].id)
      else onNew('')
    }
  }

  async function handleRenameSubmit(id: string) {
    if (renameValue.trim()) {
      await renameFamiliarConversation(id, renameValue.trim())
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: renameValue.trim() } : c))
      )
    }
    setRenamingId(null)
    setRenameValue('')
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now  = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7)  return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="mojo-familiar-sidebar">
      <div className="mojo-familiar-sidebar-heading">
        <SvgNavFamiliar active={false} />
        Memory
      </div>

      <button type="button" onClick={handleNew} className="mojo-familiar-new-btn">
        + New Consultation
      </button>

      {loading ? (
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '12px',
          fontStyle: 'italic',
          color: 'var(--faded)',
          padding: '8px 10px',
        }}>
          Remembering…
        </p>
      ) : conversations.length === 0 ? (
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '12px',
          fontStyle: 'italic',
          color: 'var(--faded)',
          padding: '8px 10px',
        }}>
          No past consultations.
        </p>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.id}
            className={`mojo-familiar-conv-item${conv.id === activeConversationId ? ' active' : ''}`}
            onClick={() => {
              if (renamingId !== conv.id) onSelect(conv.id)
            }}
          >
            {renamingId === conv.id ? (
              <input
                className="mojo-familiar-conv-rename"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit(conv.id)
                  if (e.key === 'Escape') {
                    setRenamingId(null)
                    setRenameValue('')
                  }
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <div
                  className="mojo-familiar-conv-title"
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setRenamingId(conv.id)
                    setRenameValue(conv.title)
                  }}
                  title="Double-click to rename"
                >
                  {conv.title}
                </div>
                <div className="mojo-familiar-conv-date">
                  {formatDate(conv.updated_at)}
                </div>
                <button
                  type="button"
                  className="mojo-familiar-conv-delete"
                  onClick={(e) => handleDelete(e, conv.id)}
                  aria-label="Delete conversation"
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  )
}
