'use client'

import { useState } from 'react'
import { createMojoThread } from '@/lib/actions/mojo'

const LABEL_STYLE = {
  fontFamily: 'Cinzel, serif',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--faded)',
  display: 'block',
  marginBottom: '4px',
}

const INPUT_STYLE = {
  width: '100%',
  background: 'var(--char)',
  border: '1px solid var(--elevated)',
  color: 'var(--mist)',
  padding: '6px 10px',
  fontFamily: 'EB Garamond, serif',
  fontSize: '14px',
  borderRadius: '1px',
}

type ChronicleCharacterOption = {
  id: string
  name: string
  rp_id: string
  rp_name: string | null
  status: string
}

export default function MojoChronicleAddForm({
  characters,
}: {
  characters: ChronicleCharacterOption[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [characterId, setCharacterId] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [partnerNames, setPartnerNames] = useState('')
  const [replyOrder, setReplyOrder] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setCharacterId('')
    setTitle('')
    setUrl('')
    setPartnerNames('')
    setReplyOrder('')
    setError(null)
  }

  async function handleSubmit() {
    if (!characterId || !title.trim()) return

    const selected = characters.find((c) => c.id === characterId)
    if (!selected) {
      setError('Selected character not found')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await createMojoThread({
      rp_id: selected.rp_id,
      character_id: characterId,
      title: title.trim(),
      url: url.trim() || undefined,
      partner_names: partnerNames.trim() || undefined,
      reply_order: replyOrder.trim() || undefined,
    })

    setSubmitting(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      resetForm()
      setIsOpen(false)
    }
  }

  const activeCharacters = characters.filter((c) => c.status === 'active')

  return (
    <div style={{ marginBottom: '24px' }}>
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) resetForm() }}
        className="mojo-chronicle-add-toggle"
      >
        <span style={{ fontSize: '16px', lineHeight: 1 }}>
          {isOpen ? '−' : '+'}
        </span>
        <span>New Thread Entry</span>
      </button>

      {isOpen && (
        <div className="mojo-chronicle-add-form" style={{ marginTop: '10px' }}>

          {/* Character selector */}
          <div style={{ marginBottom: '14px' }}>
            <label style={LABEL_STYLE}>Character</label>
            <select
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              style={{ ...INPUT_STYLE }}
            >
              <option value="">Select character…</option>
              {activeCharacters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.rp_name ? ` — ${c.rp_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '12px' }}>
            <label style={LABEL_STYLE}>Thread Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={INPUT_STYLE}
            />
          </div>

          {/* URL */}
          <div style={{ marginBottom: '12px' }}>
            <label style={LABEL_STYLE}>Thread URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={INPUT_STYLE}
            />
          </div>

          {/* Partners */}
          <div style={{ marginBottom: '12px' }}>
            <label style={LABEL_STYLE}>Partner(s)</label>
            <input
              type="text"
              value={partnerNames}
              onChange={(e) => setPartnerNames(e.target.value)}
              placeholder="Separate multiple with commas"
              style={INPUT_STYLE}
            />
          </div>

          {/* Reply order */}
          <div style={{ marginBottom: '18px' }}>
            <label style={LABEL_STYLE}>
              Reply Order
              <span style={{
                fontFamily: 'EB Garamond, serif',
                fontStyle: 'italic',
                textTransform: 'none',
                letterSpacing: 0,
                fontSize: '11px',
                marginLeft: '6px',
                opacity: 0.6,
              }}>
                (optional — for ordered threads)
              </span>
            </label>
            <input
              type="text"
              value={replyOrder}
              onChange={(e) => setReplyOrder(e.target.value)}
              placeholder="Remy, Johnny, Sue"
              style={INPUT_STYLE}
            />
          </div>

          {error && (
            <p style={{
              fontFamily: 'EB Garamond, serif',
              fontSize: '13px',
              color: 'var(--gold)',
              marginBottom: '10px',
            }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !characterId || !title.trim()}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                background: 'var(--ember)',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                cursor: (submitting || !characterId || !title.trim())
                  ? 'default' : 'pointer',
                opacity: (!characterId || !title.trim()) ? 0.5 : 1,
                borderRadius: '2px',
              }}
            >
              {submitting ? 'Recording…' : 'Record Thread'}
            </button>
            <button
              onClick={() => { setIsOpen(false); resetForm() }}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '10px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                background: 'transparent',
                color: 'var(--faded)',
                border: '1px solid var(--elevated)',
                padding: '8px 14px',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
