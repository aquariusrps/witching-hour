'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteMojoFaceclaim } from '@/lib/actions/mojo'
import { SvgCandleFlame } from '@/app/mojo/components/MojoSvgAssets'
import MojoPortraitCard from '@/app/mojo/components/MojoPortraitCard'

function navigateToFaceclaims() {
  window.location.href = '/mojo/faceclaims'
}

export default function MojoFaceclaimRow({
  fc,
  avatarToken,
}: {
  fc: { id: string; name: string; resource_count: number; character_count: number }
  avatarToken?: string | null
}) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    const result = await deleteMojoFaceclaim(fc.id)

    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }

    navigateToFaceclaims()
  }

  return (
    <div
      className="mojo-portrait-card"
      style={{
        position: 'relative',
        background: 'var(--claret)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '2px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Link href={`/mojo/faceclaims/${fc.id}`} style={{ display: 'block', position: 'relative' }}>
        <MojoPortraitCard
          token={avatarToken}
          alt={fc.name}
          idSuffix={fc.id}
          className="mojo-portrait-card"
        />

        {/* Candle flame hover effect */}
        <div
          aria-hidden="true"
          className="mojo-portrait-flame"
          style={{
            position: 'absolute',
            top: '6px',
            right: '10px',
            color: 'var(--roseash)',
            pointerEvents: 'none',
          }}
        >
          <SvgCandleFlame size={14} delay="0s" />
        </div>
      </Link>

      <Link
        href={`/mojo/faceclaims/${fc.id}`}
        className="mojo-brass-plate"
        style={{
          display: 'block',
          textDecoration: 'none',
          padding: '10px 12px 8px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '12px',
          letterSpacing: '0.08em',
          color: 'var(--roseash)',
          marginBottom: '3px',
          textShadow:
            '1px 1px 0 rgba(0,0,0,0.4), -1px -1px 0 rgba(255,255,255,0.06)',
        }}>
          {fc.name}
        </div>

        <div style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '11px',
          fontStyle: 'italic',
          color: 'var(--faded)',
        }}>
          {fc.resource_count} resource{fc.resource_count === 1 ? '' : 's'} · {fc.character_count} character{fc.character_count === 1 ? '' : 's'}
        </div>
      </Link>

      {error && (
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--ember)', margin: '0 8px', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        padding: '6px 8px 8px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        {confirming ? (
          <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.68rem', textAlign: 'center' }}>
            <span style={{ color: 'var(--faded)' }}>Delete {fc.name}? This removes it from all characters. </span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              style={{ background: 'none', border: 'none', color: 'var(--ember)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Yes, delete
            </button>
            <span style={{ color: 'var(--faded)' }}> · </span>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            style={{ background: 'none', border: 'none', color: 'var(--ember-dim)', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.72rem' }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
