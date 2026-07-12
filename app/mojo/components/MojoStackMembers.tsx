'use client'

import { useState } from 'react'
import { addMemberToStack, removeMemberFromStack, updateStackMember } from '@/lib/actions/mojo'
import type { Tables } from '@/types/database'

type MojoImageStackMember = Tables<'mojo_image_stack_members'>

function navigateToStacks() {
  window.location.href = '/mojo/stacks'
}

function truncatePath(path: string, max = 50): string {
  if (path.length <= max) return path
  return path.slice(0, max - 1) + '…'
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  background: 'var(--raised)',
  color: 'var(--roseash)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.8rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-ui)',
  fontSize: '0.62rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  marginBottom: 4,
}

function MemberRow({ member, rotationMode }: { member: MojoImageStackMember; rotationMode: string }) {
  const [weight, setWeight] = useState(member.weight)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const [removing, setRemoving] = useState(false)

  async function handleWeightBlur() {
    if (weight === member.weight) return
    await updateStackMember(member.id, { weight })
  }

  async function handleRemove() {
    setRemoving(true)
    const result = await removeMemberFromStack(member.id)
    if ('error' in result) {
      setRemoving(false)
      return
    }
    navigateToStacks()
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--char)',
        border: '1px solid var(--elevated)',
        borderRadius: 2,
        padding: '8px 12px',
        marginBottom: 4,
      }}
    >
      <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.62rem', color: 'var(--faded)', flexShrink: 0 }}>
        {member.mime_type}
      </span>
      <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.8125rem', color: 'var(--mist)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {truncatePath(member.storage_path)}
      </span>
      {rotationMode === 'weighted' && (
        <input
          type="number"
          min={1}
          value={weight}
          onChange={(e) => setWeight(parseInt(e.target.value, 10) || 1)}
          onBlur={handleWeightBlur}
          style={{ width: 56, padding: '4px 6px', background: 'var(--raised)', color: 'var(--roseash)', border: '1px solid var(--elevated)', borderRadius: 2, fontFamily: 'var(--f-body)', fontSize: '0.78rem', flexShrink: 0 }}
        />
      )}
      {confirmingRemove ? (
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ color: 'var(--faded)' }}>Remove? </span>
          <button type="button" onClick={handleRemove} disabled={removing} style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
            Yes
          </button>
          <span style={{ color: 'var(--faded)' }}> · </span>
          <button type="button" onClick={() => setConfirmingRemove(false)} style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingRemove(true)}
          aria-label="Remove image"
          style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', flexShrink: 0 }}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function MojoStackMembers({
  stackId,
  members,
  rotationMode,
}: {
  stackId: string
  members: MojoImageStackMember[]
  rotationMode: string
}) {
  const [storagePath, setStoragePath] = useState('')
  const [mimeType, setMimeType] = useState('image/png')
  const [weight, setWeight] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await addMemberToStack({
      stack_id: stackId,
      storage_path: storagePath,
      mime_type: mimeType || 'image/png',
      weight: rotationMode === 'weighted' ? weight : undefined,
    })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToStacks()
  }

  return (
    <div style={{ padding: '4px 16px 16px' }}>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faded)', margin: '0 0 4px' }}>
          Add from library
        </h4>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--faded)', margin: '0 0 10px' }}>
          Paste a storage path from any existing image resource or avatar to add it to this stack.
        </p>

        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {error && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--ember)', margin: 0 }}>{error}</p>
          )}
          <div>
            <label style={LABEL_STYLE}>Storage path</label>
            <input
              type="text"
              value={storagePath}
              onChange={(e) => setStoragePath(e.target.value)}
              placeholder="resources/abc123.png"
              required
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>MIME type</label>
            <input
              type="text"
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              placeholder="image/png"
              style={INPUT_STYLE}
            />
          </div>
          {rotationMode === 'weighted' && (
            <div>
              <label style={LABEL_STYLE}>Weight</label>
              <input
                type="number"
                min={1}
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value, 10) || 1)}
                style={INPUT_STYLE}
              />
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--ember)',
                color: 'var(--roseash)',
                border: 'none',
                borderRadius: 2,
                padding: '7px 16px',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Adding…' : 'Add to stack'}
            </button>
          </div>
        </form>
      </div>

      {members.length === 0 ? (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--faded)' }}>
          No images yet. Add from library above, or upload avatars in MOJO-4B.
        </p>
      ) : (
        <div>
          {members.map((m) => (
            <MemberRow key={m.id} member={m} rotationMode={rotationMode} />
          ))}
        </div>
      )}
    </div>
  )
}
