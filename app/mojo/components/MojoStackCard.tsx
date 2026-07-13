'use client'

import { useState } from 'react'
import { updateMojoImageStack, deleteMojoImageStack } from '@/lib/actions/mojo'
import MojoStackUrlCopy from './MojoStackUrlCopy'
import MojoStackMembers from './MojoStackMembers'
import type { Tables } from '@/types/database'

type MojoImageStack = Tables<'mojo_image_stacks'>
type MojoImageStackMember = Tables<'mojo_image_stack_members'>

function navigateToStacks() {
  window.location.href = '/mojo/stacks'
}

type RotationMode = 'truly_random' | 'weighted' | 'sequential' | 'no_repeat'
type ExpiryOption = 'never' | '1year' | 'custom'

const ROTATION_HELP: Record<RotationMode, string> = {
  truly_random: 'Each request picks any image with equal probability',
  weighted: 'Images with higher weight appear more often',
  sequential: 'Cycles through images in order',
  no_repeat: 'Random, but never shows the same image twice in a row',
}

const ROTATION_BADGE_COLOR: Record<string, string> = {
  truly_random: 'var(--moonstone)',
  weighted: 'var(--gold)',
  sequential: 'var(--ember)',
  no_repeat: 'var(--mist)',
}

const ROTATION_LABEL: Record<string, string> = {
  truly_random: 'Truly Random',
  weighted: 'Weighted',
  sequential: 'Sequential',
  no_repeat: 'No Repeat',
}

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

export default function MojoStackCard({
  stack,
  characterName,
  rpName,
  faceclaimName,
  members,
  characters,
  faceclaims,
}: {
  stack: MojoImageStack & { member_count: number }
  characterName: string | null
  rpName: string | null
  faceclaimName: string | null
  members: MojoImageStackMember[]
  characters: Array<{ id: string; name: string; rp_name: string }>
  faceclaims: Array<{ id: string; name: string }>
}) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [managingImages, setManagingImages] = useState(false)

  const [label, setLabel] = useState(stack.label)
  const [rotationMode, setRotationMode] = useState<RotationMode>(stack.rotation_mode as RotationMode)
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>(stack.expires_at ? 'custom' : 'never')
  const [customDate, setCustomDate] = useState(
    stack.expires_at ? new Date(stack.expires_at).toISOString().slice(0, 10) : ''
  )
  const [characterId, setCharacterId] = useState(stack.character_id ?? '')
  const [faceclaimId, setFaceclaimId] = useState(stack.faceclaim_id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const proxyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/i/${stack.token}`

  const groupedCharacters = new Map<string, Array<{ id: string; name: string }>>()
  for (const c of characters) {
    const list = groupedCharacters.get(c.rp_name) ?? []
    list.push({ id: c.id, name: c.name })
    groupedCharacters.set(c.rp_name, list)
  }
  const sortedFaceclaims = [...faceclaims].sort((a, b) => a.name.localeCompare(b.name))

  function startEdit() {
    setLabel(stack.label)
    setRotationMode(stack.rotation_mode as RotationMode)
    setExpiryOption(stack.expires_at ? 'custom' : 'never')
    setCustomDate(stack.expires_at ? new Date(stack.expires_at).toISOString().slice(0, 10) : '')
    setCharacterId(stack.character_id ?? '')
    setFaceclaimId(stack.faceclaim_id ?? '')
    setError(null)
    setEditing(true)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)

    let expiresAt: string | null = null
    if (expiryOption === '1year') {
      const d = new Date()
      d.setFullYear(d.getFullYear() + 1)
      expiresAt = d.toISOString()
    } else if (expiryOption === 'custom' && customDate) {
      expiresAt = new Date(customDate).toISOString()
    }

    const result = await updateMojoImageStack(stack.id, {
      label,
      rotation_mode: rotationMode,
      expires_at: expiresAt,
      character_id: characterId || null,
      faceclaim_id: faceclaimId || null,
    })

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToStacks()
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const result = await deleteMojoImageStack(stack.id)
    if ('error' in result) {
      setDeleteLoading(false)
      return
    }
    navigateToStacks()
  }

  if (editing) {
    return (
      <div style={{ background: 'var(--raised)', border: '1px solid var(--gold-dim)', borderRadius: 4, padding: 18, marginBottom: 16 }}>
        {error && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.82rem', color: 'var(--ember)', margin: '0 0 10px' }}>{error}</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={LABEL_STYLE}>Label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} style={INPUT_STYLE} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Rotation Mode</label>
            <select value={rotationMode} onChange={(e) => setRotationMode(e.target.value as RotationMode)} style={INPUT_STYLE}>
              <option value="truly_random">Truly Random</option>
              <option value="weighted">Weighted</option>
              <option value="sequential">Sequential</option>
              <option value="no_repeat">No Repeat</option>
            </select>
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: '4px 0 0' }}>
              {ROTATION_HELP[rotationMode]}
            </p>
          </div>
          <div>
            <label style={LABEL_STYLE}>Link expires</label>
            <select value={expiryOption} onChange={(e) => setExpiryOption(e.target.value as ExpiryOption)} style={INPUT_STYLE}>
              <option value="never">Never (indefinite)</option>
              <option value="1year">1 year from now</option>
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
          <div>
            <label style={LABEL_STYLE}>Character</label>
            <select value={characterId} onChange={(e) => setCharacterId(e.target.value)} style={INPUT_STYLE}>
              <option value="">— No character —</option>
              {Array.from(groupedCharacters.entries()).map(([rpName, chars]) => (
                <optgroup key={rpName} label={rpName}>
                  {chars.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL_STYLE}>Faceclaim</label>
            <select value={faceclaimId} onChange={(e) => setFaceclaimId(e.target.value)} style={INPUT_STYLE}>
              <option value="">— No faceclaim —</option>
              {sortedFaceclaims.map((fc) => (
                <option key={fc.id} value={fc.id}>{fc.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            style={{ background: 'var(--ember)', color: 'var(--roseash)', border: 'none', borderRadius: 2, padding: '7px 18px', fontFamily: 'var(--f-ui)', fontSize: '0.78rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Saving…' : 'Save'}
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
    <div style={{ background: 'var(--claret)', border: '1px solid var(--elevated)', borderRadius: 4, marginBottom: 16 }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '14px 16px' }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)' }}>
            {stack.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.625rem',
              textTransform: 'uppercase',
              background: 'var(--raised)',
              color: ROTATION_BADGE_COLOR[stack.rotation_mode] ?? 'var(--faded)',
              padding: '2px 8px',
              borderRadius: 2,
              marginLeft: 8,
            }}
          >
            {ROTATION_LABEL[stack.rotation_mode] ?? stack.rotation_mode}
          </span>
          {(characterName || faceclaimName) && (
            <span style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8125rem', color: 'var(--faded)', marginLeft: 8 }}>
              {characterName ? `→ ${characterName}${rpName ? ` in ${rpName}` : ''}` : `→ ${faceclaimName}`}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', color: 'var(--faded)' }}>
            {stack.member_count} images
          </span>
          {stack.expires_at && (
            <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--faded)' }}>
              expires {new Date(stack.expires_at).toLocaleDateString()}
            </span>
          )}
          {confirmingDelete ? (
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}>
              <span style={{ color: 'var(--faded)' }}>Delete &lsquo;{stack.label}&rsquo;? This removes the stack permanently. Members are deleted. The proxy URL will stop working. </span>
              <button type="button" onClick={handleDelete} disabled={deleteLoading} style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Yes, delete
              </button>
              <span style={{ color: 'var(--faded)' }}> · </span>
              <button type="button" onClick={() => setConfirmingDelete(false)} style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Cancel
              </button>
            </span>
          ) : (
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem' }}>
              <button type="button" onClick={startEdit} style={{ background: 'none', border: 'none', color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Edit
              </button>
              <span style={{ color: 'var(--faded)' }}> · </span>
              <button type="button" onClick={() => setConfirmingDelete(true)} style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Delete
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div style={{ padding: '0 16px 14px' }}>
        <p style={{ margin: '0 0 8px' }}>
          <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.625rem', color: 'var(--faded)' }}>Live preview — </span>
          <span style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.72rem', color: 'var(--faded)' }}>refreshes on each page load</span>
        </p>
        {stack.member_count > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proxyUrl}
            alt={stack.label}
            style={{ maxHeight: 120, maxWidth: 200, objectFit: 'contain', border: '1px solid var(--elevated)', borderRadius: 2 }}
          />
        ) : (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: 0 }}>
            No images in this stack yet.
          </p>
        )}
      </div>

      {/* Proxy URL row */}
      <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--elevated)', paddingTop: 12 }}>
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.625rem', color: 'var(--faded)', display: 'block', marginBottom: 6 }}>
          Stack URL
        </span>
        <MojoStackUrlCopy url={proxyUrl} />
      </div>

      {/* Member management */}
      <div style={{ borderTop: '1px solid var(--elevated)' }}>
        <button
          type="button"
          onClick={() => setManagingImages((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--faded)', padding: '10px 16px', display: 'block' }}
        >
          {managingImages ? '▼' : '▶'} Manage images ({stack.member_count})
        </button>
        {managingImages && (
          <MojoStackMembers stackId={stack.id} stackLabel={stack.label} members={members} rotationMode={stack.rotation_mode} />
        )}
      </div>
    </div>
  )
}
