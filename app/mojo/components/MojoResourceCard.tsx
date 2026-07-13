'use client'

import { useState } from 'react'
import { SvgNavLibrary, SvgNavSearch, SvgNavImages, SvgNavStacks } from './MojoSvgAssets'
import type { Tables } from '@/types/database'

type MojoResource = Tables<'mojo_resources'>

const TYPE_BORDER_COLOR: Record<string, string> = {
  text: 'var(--roseash)',
  link: 'var(--moonstone)',
  image: 'var(--gold)',
  gif: 'var(--gold)',
  snippet: 'var(--ember)',
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'text') return <SvgNavLibrary active={false} />
  if (type === 'link') return <SvgNavSearch active={false} />
  if (type === 'snippet') return <SvgNavStacks active={false} />
  return <SvgNavImages active={false} />
}

export default function MojoResourceCard({
  resource,
  onEdit,
  onDelete,
  onLinkToCharacter,
}: {
  resource: MojoResource
  onEdit: () => void
  onDelete: (id: string) => void
  onLinkToCharacter?: (id: string) => void
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [copied, setCopied] = useState(false)

  const preview = resource.content
    ? (resource.content.length > 80 ? resource.content.slice(0, 80) + '…' : resource.content)
    : ''

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard failures
    }
  }

  const borderColor = TYPE_BORDER_COLOR[resource.type] ?? 'var(--faded)'

  return (
    <div
      className="mojo-resource-card"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ color: borderColor, flexShrink: 0, display: 'flex' }} aria-hidden="true">
          <TypeIcon type={resource.type} />
        </span>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '14px', color: 'var(--roseash)', flex: 1, minWidth: 0 }}>
          {resource.title}
        </span>
      </div>

      {resource.type === 'link' && resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            fontFamily: 'var(--f-body)',
            fontSize: '0.72rem',
            color: 'var(--moonstone)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: 6,
          }}
        >
          {resource.url}
        </a>
      )}

      {(resource.type === 'text' || resource.type === 'snippet') && preview && (
        <p style={{
          fontFamily: resource.type === 'snippet' ? "'Courier New', monospace" : 'var(--f-body)',
          fontSize: '0.78rem',
          color: 'var(--mist)',
          margin: '0 0 6px',
          whiteSpace: 'pre-wrap',
        }}>
          {preview}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {(resource.type === 'link' || resource.type === 'snippet') && (
          <button
            type="button"
            onClick={() => handleCopy(resource.type === 'link' ? (resource.url ?? '') : (resource.content ?? ''))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.66rem', color: 'var(--moonstone)' }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}

        {onLinkToCharacter && (
          <button
            type="button"
            onClick={() => onLinkToCharacter(resource.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--moonstone)' }}
          >
            Link →
          </button>
        )}

        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit resource"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--gold-dim)' }}
        >
          Edit
        </button>

        {confirmingDelete ? (
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.08em' }}>
            <span style={{ color: 'var(--faded)' }}>Delete? </span>
            <button
              type="button"
              onClick={() => onDelete(resource.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--ember)' }}
            >
              Yes
            </button>
            <span style={{ color: 'var(--faded)' }}> · </span>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--faded)' }}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--ember-dim)' }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
