'use client'

import { useState } from 'react'
import type { Tables } from '@/types/database'
import { SvgNavImages } from '@/app/mojo/components/MojoSvgAssets'

type MojoResource = Tables<'mojo_resources'>

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
          <div style={{
            position: 'relative',
            background: 'var(--char)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '4px',
            padding: '12px',
          }}>
            {/* Left film strip edge */}
            <div
              aria-hidden="true"
              className="mojo-film-strip-edge"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '10px',
                pointerEvents: 'none',
              }}
            />
            {/* Right film strip edge */}
            <div
              aria-hidden="true"
              className="mojo-film-strip-edge"
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '10px',
                pointerEvents: 'none',
              }}
            />

            {/* Panel heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', padding: '0 10px', color: 'var(--faded)' }}>
              <SvgNavImages active={false} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Contact Sheet
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
              gap: '10px',
              padding: '0 10px',
            }}>
              {resources.map((r) => (
                <div
                  key={r.id}
                  title={r.title}
                  style={{
                    padding: '3px',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    position: 'relative',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.public_url ?? ''}
                    alt={r.title}
                    style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(r.id, r.public_url ?? '')}
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      right: '3px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      border: 'none',
                      padding: '2px 6px',
                      fontFamily: 'Cinzel, serif',
                      fontSize: '9px',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedId === r.id ? '✓' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
