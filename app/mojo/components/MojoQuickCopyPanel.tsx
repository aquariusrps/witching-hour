'use client'

import { useState } from 'react'
import type { Tables } from '@/types/database'

type MojoResource = Tables<'mojo_resources'>

function truncateUrl(url: string, max = 40): string {
  if (url.length <= max) return url
  return url.slice(0, max - 1) + '…'
}

export default function MojoQuickCopyPanel({ resources }: { resources: MojoResource[] }) {
  const [open, setOpen] = useState(resources.length > 0)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopy(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // ignore clipboard failures
    }
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--f-ui)',
          fontSize: '0.75rem',
          color: 'var(--gold-dim)',
          marginBottom: open ? 12 : 0,
        }}
      >
        {open ? '▼' : '▶'} Quick Copy URLs ({resources.length} images)
      </button>

      {open && (
        resources.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
            No image resources yet — upload some below.
          </p>
        ) : (
          <div>
            {resources.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 0',
                  borderBottom: '1px solid var(--elevated)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.public_url ?? ''}
                  alt={r.title}
                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                />
                <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--roseash)', flexShrink: 0 }}>
                  {r.title}
                </span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.68rem',
                  color: 'var(--faded)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {truncateUrl(r.public_url ?? '')}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(r.id, r.public_url ?? '')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.7rem',
                    color: 'var(--moonstone)',
                    flexShrink: 0,
                  }}
                >
                  {copiedId === r.id ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
