'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { createFaction, updateFaction } from '@/lib/actions/admin-factions'

type FactionData = {
  id: string
  name: string
  slug: string
  color_hex: string
  description: string
  lore: string
  leader_title: string
  display_order: number
}

interface FactionFormProps {
  mode: 'create' | 'edit'
  faction?: FactionData
}

function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const INPUT_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  background: 'var(--raised)',
  border: '1px solid var(--ember-dim)',
  borderRadius: 'var(--r-sm)',
  fontFamily: 'var(--f-body)',
  fontSize: '0.9rem',
  color: 'var(--roseash)',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-ui)',
  fontSize: '0.65rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  marginBottom: 6,
}

export default function FactionForm({ mode, faction }: FactionFormProps) {
  const router = useRouter()
  const [name, setName]               = useState(faction?.name ?? '')
  const [slug, setSlug]               = useState(faction?.slug ?? '')
  const [colorHex, setColorHex]       = useState(faction?.color_hex ?? '#e0b028')
  const [leaderTitle, setLeaderTitle] = useState(faction?.leader_title ?? 'Keeper')
  const [description, setDescription] = useState(faction?.description ?? '')
  const [displayOrder, setDisplayOrder] = useState(String(faction?.display_order ?? 0))
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: faction?.lore ?? '',
    editorProps: {
      attributes: {
        style: [
          'min-height: 160px',
          'padding: 10px',
          'background: var(--raised)',
          'border: 1px solid var(--ember-dim)',
          'border-radius: 4px',
          'font-family: var(--f-body)',
          'font-size: 0.9rem',
          'color: var(--roseash)',
          'outline: none',
          'line-height: 1.6',
        ].join('; '),
      },
    },
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    fd.set('lore', editor?.getHTML() ?? '')

    const result = mode === 'create'
      ? await createFaction(fd)
      : await updateFaction(faction!.id, fd)

    setLoading(false)

    if ('error' in result && result.error) {
      setError(result.error)
    } else {
      router.push('/admin/factions')
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--f-heading)',
          fontSize: '1.9rem',
          fontWeight: 700,
          color: 'var(--roseash)',
          margin: 0,
        }}>
          {mode === 'create' ? 'Create Faction' : `Edit: ${faction?.name}`}
        </h1>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--raised)',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-sm)',
          fontFamily: 'var(--f-body)',
          fontSize: '0.88rem',
          color: 'var(--ember-light)',
          marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'var(--claret)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 'var(--r-md)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}>
          {/* Name + Slug */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={LABEL_STYLE}>Name *</label>
              <input
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (!slug) setSlug(slugify(name))
                }}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Slug *</label>
              <input
                name="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          {/* Color + Leader Title */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={LABEL_STYLE}>Faction Color *</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  style={{
                    width: 40,
                    height: 36,
                    padding: 2,
                    background: 'var(--raised)',
                    border: '1px solid var(--ember-dim)',
                    borderRadius: 'var(--r-sm)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <input
                  name="color_hex"
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  pattern="^#[0-9a-fA-F]{6}$"
                  placeholder="#e0b028"
                  style={{ ...INPUT_STYLE, flex: 1 }}
                />
              </div>
            </div>
            <div>
              <label style={LABEL_STYLE}>Leader Title</label>
              <input
                name="leader_title"
                type="text"
                value={leaderTitle}
                onChange={(e) => setLeaderTitle(e.target.value)}
                placeholder="Keeper"
                style={INPUT_STYLE}
              />
            </div>
          </div>

          {/* Display Order */}
          <div style={{ width: 120 }}>
            <label style={LABEL_STYLE}>Display Order</label>
            <input
              name="display_order"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              style={INPUT_STYLE}
            />
          </div>

          {/* Description */}
          <div>
            <label style={LABEL_STYLE}>Description</label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short description shown on faction cards (~200 chars)"
              style={{ ...INPUT_STYLE, resize: 'vertical' }}
            />
          </div>

          {/* Lore — Tiptap */}
          <div>
            <label style={LABEL_STYLE}>Lore (Rich Text)</label>
            <div style={{ marginBottom: 6 }}>
              {/* Minimal toolbar */}
              {editor && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[
                    { label: 'B', cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
                    { label: 'I', cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
                    { label: 'U', cmd: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
                  ].map(({ label, cmd, active }) => (
                    <button
                      key={label}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); cmd() }}
                      style={{
                        padding: '3px 8px',
                        background: active ? 'var(--ember-dim)' : 'var(--raised)',
                        border: '1px solid var(--ember-dim)',
                        borderRadius: 'var(--r-xs)',
                        fontFamily: 'var(--f-body)',
                        fontSize: '0.8rem',
                        color: active ? 'var(--roseash)' : 'var(--mist)',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 4 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '9px 22px',
                background: loading ? 'var(--raised)' : 'var(--ember)',
                color: 'var(--roseash)',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving…' : mode === 'create' ? 'Create Faction' : 'Save Changes'}
            </button>
            <Link
              href="/admin/factions"
              style={{
                padding: '9px 16px',
                background: 'transparent',
                color: 'var(--mist)',
                border: '1px solid var(--ember-dim)',
                borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textDecoration: 'none',
              }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
