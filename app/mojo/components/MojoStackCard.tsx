'use client'

import { useState } from 'react'
import { updateMojoImageStack, deleteMojoImageStack } from '@/lib/actions/mojo'
import MojoStackUrlCopy from './MojoStackUrlCopy'
import MojoStackMembers from './MojoStackMembers'
import {
  SvgRotationRandom, SvgRotationWeighted,
  SvgRotationSequential, SvgRotationNoRepeat,
  SvgCornerBracket,
} from './MojoSvgAssets'
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

function getSpecimenNumber(createdAt: string): string {
  // Use last 3 digits of the timestamp for a human-readable ID
  const ts = new Date(createdAt).getTime()
  const suffix = (ts % 1000).toString().padStart(3, '0')
  return `SP-${suffix}`
}

function getModeColor(mode: string): string {
  switch (mode) {
    case 'truly_random': return 'var(--moonstone)'
    case 'weighted':     return 'var(--gold)'
    case 'sequential':   return 'var(--roseash)'
    case 'no_repeat':    return 'var(--mist)'
    default:             return 'var(--faded)'
  }
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 'truly_random': return 'Random'
    case 'weighted':     return 'Weighted'
    case 'sequential':   return 'Sequential'
    case 'no_repeat':    return 'No Repeat'
    default:             return mode
  }
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
    <div
      className="mojo-specimen-card"
      style={{
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '2px',
        marginBottom: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Corner brackets */}
      <SvgCornerBracket size={14}
        color="#9c9ab8"
        rotation={0}
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.25,
                 pointerEvents: 'none' }} />
      <SvgCornerBracket size={14}
        color="#9c9ab8"
        rotation={90}
        style={{ position: 'absolute', top: 0, right: 0, opacity: 0.25,
                 pointerEvents: 'none' }} />
      <SvgCornerBracket size={14}
        color="#9c9ab8"
        rotation={270}
        style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.25,
                 pointerEvents: 'none' }} />
      <SvgCornerBracket size={14}
        color="#9c9ab8"
        rotation={180}
        style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.25,
                 pointerEvents: 'none' }} />

      {/* Card header — specimen header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
        padding: '14px 16px 10px',
        background: 'rgba(0,0,0,0.15)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
      }}>
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)' }}>
            {stack.label}
          </span>
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '9px',
            letterSpacing: '0.15em',
            color: 'var(--faded)',
            opacity: 0.6,
            flexShrink: 0,
          }}>
            {getSpecimenNumber(stack.created_at)}
          </span>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: 'var(--elevated)',
            padding: '2px 8px 2px 6px',
            borderRadius: '2px',
          }}>
            <span style={{ color: getModeColor(stack.rotation_mode), display: 'inline-flex' }}>
              {stack.rotation_mode === 'truly_random' && (
                <SvgRotationRandom size={13} active={true} />
              )}
              {stack.rotation_mode === 'weighted' && (
                <SvgRotationWeighted size={13} active={true} />
              )}
              {stack.rotation_mode === 'sequential' && (
                <SvgRotationSequential size={13} active={true} />
              )}
              {stack.rotation_mode === 'no_repeat' && (
                <SvgRotationNoRepeat size={13} active={true} />
              )}
            </span>
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: getModeColor(stack.rotation_mode),
            }}>
              {getModeLabel(stack.rotation_mode)}
            </span>
          </div>
          {(characterName || faceclaimName) && (
            <span style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8125rem', color: 'var(--faded)' }}>
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
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
          }}>
            Live Specimen
          </span>{' '}
          <span style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '11px',
            fontStyle: 'italic',
            color: 'var(--faded)',
          }}>
            · refreshes on view
          </span>
        </p>
        {stack.member_count > 0 ? (
          <div className="mojo-vitrine-preview" style={{ display: 'inline-block' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proxyUrl}
              alt={stack.label}
              style={{ maxHeight: 120, maxWidth: 200, objectFit: 'contain', display: 'block' }}
            />
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: 0 }}>
            No images in this stack yet.
          </p>
        )}
      </div>

      {/* Proxy URL row — catalog entry */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'var(--char)',
        padding: '8px 16px',
      }}>
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '9px',
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          display: 'block',
          marginBottom: 6,
        }}>
          Catalog Entry
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
