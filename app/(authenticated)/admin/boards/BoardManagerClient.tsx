'use client'

import { useState } from 'react'
import type { BoardNode } from '@/lib/cached-settings'
import { deleteBoard, reorderBoards } from '@/lib/actions/admin-boards'
import BoardFormModal from './BoardFormModal'

type Faction = {
  id: string
  name: string
  color_hex: string
  slug: string
  description: string
  lore: string
  leader_user_id: string | null
  leader_title: string
  display_order: number
}

type ModalContext = {
  parentId: string | null
  isCategory: boolean
  editTarget?: BoardNode
}

const SCOPE_COLORS: Record<string, string> = {
  public:  'var(--mist)',
  rp:      'var(--moonstone)',
  faction: 'var(--gold)',
  staff:   'var(--ember)',
  admin:   'var(--ember-dim)',
}

const THEME_OPTIONS = [
  { value: '', label: '(none)' },
  { value: 'blood-moon',           label: 'Blood Moon' },
  { value: 'silver-onyx',          label: 'Silver & Onyx' },
  { value: 'midnight-garden',      label: 'Midnight Garden' },
  { value: 'crimson-athenaeum',    label: 'Crimson Athenaeum' },
  { value: 'blackthorn-parchment', label: 'Blackthorn & Parchment' },
  { value: 'the-craft-1996',       label: 'The Craft 1996' },
]

// ── BoardTreeNode ─────────────────────────────────────────────────────────────

type BoardTreeNodeProps = {
  node: BoardNode
  depth: number
  siblings: BoardNode[]
  siblingIndex: number
  factions: Faction[]
  onEdit: (node: BoardNode) => void
  onDelete: (node: BoardNode) => void
  onAddChild: (parentId: string) => void
  onReorder: (siblings: BoardNode[], fromIndex: number, toIndex: number) => void
  deleteConfirm: string | null
  setDeleteConfirm: (id: string | null) => void
}

function BoardTreeNode({
  node,
  depth,
  siblings,
  siblingIndex,
  factions,
  onEdit,
  onDelete,
  onAddChild,
  onReorder,
  deleteConfirm,
  setDeleteConfirm,
}: BoardTreeNodeProps) {
  const isCategory = node.is_category
  const isPendingDelete = deleteConfirm === node.id
  const hasThreads = node.thread_count > 0
  const descendantHasThreads = node.children.some((c) => c.thread_count > 0)
  const canDelete = !hasThreads && !descendantHasThreads
  const faction = node.scope_id ? factions.find((f) => f.id === node.scope_id) : null

  const rowBg = isCategory ? 'var(--raised)' : 'transparent'
  const indent = depth === 0 ? 0 : depth === 1 ? 0 : (depth - 1) * 16

  const rowStyle: React.CSSProperties = {
    background: rowBg,
    borderBottom: '1px solid var(--ember-dim)',
    padding: '10px 12px',
    marginLeft: indent,
  }

  return (
    <div>
      <div style={rowStyle}>
        {isPendingDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--f-body)', color: 'var(--roseash)', fontSize: '0.9rem' }}>
              Delete <strong>{node.name}</strong>?
            </span>
            {!canDelete && (
              <span style={{ fontFamily: 'var(--f-body)', color: 'var(--ember)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                This board contains threads and cannot be deleted.
              </span>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(node)}
                style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  background: 'var(--ember)',
                  color: 'var(--char)',
                  border: 'none',
                  borderRadius: 2,
                  padding: '3px 10px',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            )}
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'transparent',
                color: 'var(--mist)',
                border: '1px solid var(--ember-dim)',
                borderRadius: 2,
                padding: '3px 10px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Reorder arrows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
              <button
                disabled={siblingIndex === 0}
                onClick={() => onReorder(siblings, siblingIndex, siblingIndex - 1)}
                title="Move up"
                style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6rem',
                  background: 'transparent',
                  border: 'none',
                  color: siblingIndex === 0 ? 'var(--ember-dim)' : 'var(--mist)',
                  cursor: siblingIndex === 0 ? 'default' : 'pointer',
                  padding: '0 2px',
                  lineHeight: 1,
                }}
              >▲</button>
              <button
                disabled={siblingIndex === siblings.length - 1}
                onClick={() => onReorder(siblings, siblingIndex, siblingIndex + 1)}
                title="Move down"
                style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6rem',
                  background: 'transparent',
                  border: 'none',
                  color: siblingIndex === siblings.length - 1 ? 'var(--ember-dim)' : 'var(--mist)',
                  cursor: siblingIndex === siblings.length - 1 ? 'default' : 'pointer',
                  padding: '0 2px',
                  lineHeight: 1,
                }}
              >▼</button>
            </div>

            {/* Icon */}
            {node.icon_url && (
              <img
                src={node.icon_url}
                alt=""
                width={32}
                height={32}
                style={{ borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
              />
            )}

            {/* Center content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: isCategory ? 'var(--f-ui)' : 'var(--f-head)',
                  fontSize: isCategory ? '0.7rem' : '0.95rem',
                  fontWeight: isCategory ? 500 : 500,
                  color: isCategory ? 'var(--faded)' : 'var(--roseash)',
                  textTransform: isCategory ? 'uppercase' : 'none',
                  letterSpacing: isCategory ? '0.08em' : 'normal',
                }}>
                  {node.name}
                </span>

                {!isCategory && (
                  <span style={{
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--char)',
                    background: SCOPE_COLORS[node.scope] ?? 'var(--mist)',
                    borderRadius: 2,
                    padding: '1px 6px',
                  }}>
                    {node.scope}
                    {faction ? ` · ${faction.name}` : ''}
                  </span>
                )}

                {node.is_rp_board && (
                  <span style={{
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--moonstone)',
                    border: '1px solid var(--moon-dim)',
                    borderRadius: 2,
                    padding: '1px 5px',
                  }}>
                    RP
                  </span>
                )}

                {node.thread_count > 0 && (
                  <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.65rem', color: 'var(--faded)' }}>
                    {node.thread_count} thread{node.thread_count !== 1 ? 's' : ''}
                    {node.post_count > 0 ? ` · ${node.post_count} post${node.post_count !== 1 ? 's' : ''}` : ''}
                  </span>
                )}

                {node.children.length > 0 && (
                  <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.65rem', color: 'var(--faded)' }}>
                    {node.children.length} sub-board{node.children.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {node.description && (
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.8rem',
                  color: 'var(--mist)',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 480,
                }}>
                  {node.description.length > 60
                    ? node.description.slice(0, 60) + '…'
                    : node.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {isCategory && (
                <button
                  onClick={() => onAddChild(node.id)}
                  style={actionBtnStyle('var(--moonstone)', 'var(--moon-dim)')}
                >
                  + Forum
                </button>
              )}
              {!isCategory && (
                <button
                  onClick={() => onAddChild(node.id)}
                  style={actionBtnStyle('var(--mist)', 'var(--ember-dim)')}
                >
                  + Sub-board
                </button>
              )}
              <button
                onClick={() => onEdit(node)}
                style={actionBtnStyle('var(--gold)', 'var(--gold-dim)')}
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(node.id)}
                style={actionBtnStyle('var(--ember)', 'var(--ember-dim)')}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      {node.children.map((child, idx) => (
        <BoardTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          siblings={node.children}
          siblingIndex={idx}
          factions={factions}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onReorder={onReorder}
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
        />
      ))}
    </div>
  )
}

function actionBtnStyle(color: string, border: string): React.CSSProperties {
  return {
    fontFamily: 'var(--f-ui)',
    fontSize: '0.7rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    background: 'transparent',
    color,
    border: `1px solid ${border}`,
    borderRadius: 2,
    padding: '3px 8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}

// ── BoardManagerClient ────────────────────────────────────────────────────────

export default function BoardManagerClient({
  boardTree,
  factions,
}: {
  boardTree: BoardNode[]
  factions: Faction[]
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [modalContext, setModalContext] = useState<ModalContext | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [reordering, setReordering] = useState(false)

  function openCreate(opts: { parentId: string | null; isCategory: boolean }) {
    setModalMode('create')
    setModalContext({ parentId: opts.parentId, isCategory: opts.isCategory })
    setModalOpen(true)
  }

  function openEdit(node: BoardNode) {
    setModalMode('edit')
    setModalContext({ parentId: node.parent_id, isCategory: node.is_category, editTarget: node })
    setModalOpen(true)
  }

  async function handleDelete(node: BoardNode) {
    setDeleting(true)
    const result = await deleteBoard(node.id)
    setDeleting(false)
    if ('error' in result) {
      alert(result.error)
      return
    }
    setDeleteConfirm(null)
    window.location.reload()
  }

  async function handleReorder(siblings: BoardNode[], fromIndex: number, toIndex: number) {
    if (reordering) return
    const updated = [...siblings]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    const items = updated.map((n, i) => ({ id: n.id, display_order: i }))
    setReordering(true)
    const result = await reorderBoards(items)
    setReordering(false)
    if ('error' in result) {
      alert(result.error)
      return
    }
    window.location.reload()
  }

  return (
    <div>
      {/* Top toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 16,
      }}>
        <button
          onClick={() => openCreate({ parentId: null, isCategory: true })}
          style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'var(--ember)',
            color: 'var(--char)',
            border: 'none',
            borderRadius: 2,
            padding: '6px 14px',
            cursor: 'pointer',
          }}
        >
          + New Category
        </button>
      </div>

      {/* Board tree */}
      <div style={{
        border: '1px solid var(--ember-dim)',
        borderRadius: 4,
        overflow: 'hidden',
        background: 'var(--claret)',
      }}>
        {boardTree.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--f-body)', color: 'var(--faded)', fontStyle: 'italic' }}>
              No boards yet. Create a category to begin.
            </p>
          </div>
        ) : (
          boardTree.map((node, idx) => (
            <BoardTreeNode
              key={node.id}
              node={node}
              depth={0}
              siblings={boardTree}
              siblingIndex={idx}
              factions={factions}
              onEdit={openEdit}
              onDelete={handleDelete}
              onAddChild={(parentId) => openCreate({ parentId, isCategory: false })}
              onReorder={handleReorder}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
            />
          ))
        )}
      </div>

      {(deleting || reordering) && (
        <p style={{
          fontFamily: 'var(--f-body)',
          color: 'var(--mist)',
          fontStyle: 'italic',
          fontSize: '0.85rem',
          marginTop: 8,
        }}>
          Saving…
        </p>
      )}

      {modalOpen && modalContext && (
        <BoardFormModal
          mode={modalMode}
          context={modalContext}
          factions={factions}
          themeOptions={THEME_OPTIONS}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
