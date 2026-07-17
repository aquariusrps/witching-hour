'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { updateMojoRp } from '@/lib/actions/mojo'
import MojoDashboardNotes from './MojoDashboardNotes'
import MojoDashboardCharCard from './MojoDashboardCharCard'
import { SvgCornerBracket, SvgFiligreeRule } from '@/app/mojo/components/MojoSvgAssets'
import type { DashboardRp } from '@/lib/db/mojo'

function navigateToDashboard() {
  window.location.href = '/mojo'
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  hiatus: 'Hiatus',
  ended: 'Ended',
}

function MojoRpStatusMenu({ rpId, currentStatus, accentColor }: { rpId: string; currentStatus: string; accentColor: string }) {
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const options: Array<{ label: string; status: string }> =
    currentStatus === 'active'
      ? [{ label: 'Set to Hiatus', status: 'hiatus' }, { label: 'Archive (Ended)', status: 'ended' }]
      : currentStatus === 'hiatus'
      ? [{ label: 'Reactivate', status: 'active' }, { label: 'Archive (Ended)', status: 'ended' }]
      : [{ label: 'Reactivate', status: 'active' }]

  async function handleSelect(status: string) {
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.set('status', status)
    const result = await updateMojoRp(rpId, fd)
    if ('error' in result) {
      setLoading(false)
      setError(result.error)
      return
    }
    navigateToDashboard()
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setShowMenu((v) => !v)}
        disabled={loading}
        style={{
          background: 'none',
          border: '1px solid var(--elevated)',
          borderRadius: 2,
          padding: '4px 10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Cinzel, serif',
          fontSize: '9px',
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
          color: currentStatus === 'active' ? 'var(--mist)' : 'var(--faded)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <span style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: currentStatus === 'active' ? accentColor : 'var(--faded)',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        {STATUS_LABEL[currentStatus] ?? currentStatus} ▾
      </button>
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'var(--elevated)',
            border: '1px solid var(--elevated)',
            borderRadius: 2,
            zIndex: 50,
            minWidth: 140,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.status}
              type="button"
              onClick={() => handleSelect(opt.status)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 10px',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.6875rem',
                color: 'var(--roseash)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, fontFamily: 'var(--f-body)', fontSize: '0.6875rem', color: 'var(--ember)', whiteSpace: 'nowrap' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default function MojoDashboardRpPanel({
  rp,
  muted,
}: {
  rp: DashboardRp
  muted?: boolean
}) {
  const sortedCharacters = [...rp.characters].sort((a, b) => {
    const rank = (s: string) => (s === 'active' ? 0 : 1)
    return rank(a.status) - rank(b.status)
  })

  return (
    <div
      style={{
        background: muted
          ? 'var(--raised)'
          : `radial-gradient(ellipse at top left, ${rp.color_hex}0a 0%, transparent 60%), var(--claret)`,
        border: `1px solid ${muted ? 'var(--elevated)' : rp.color_hex + '33'}`,
        borderLeft: `3px solid ${muted ? 'var(--faded)' : rp.color_hex + '80'}`,
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: muted
          ? 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.35)'
          : `inset 0 0 0 1px ${rp.color_hex}14, 0 4px 24px rgba(0,0,0,0.35)`,
      }}
    >
      <style>{`
        .mojo-char-row::-webkit-scrollbar { height: 4px; }
        .mojo-char-row::-webkit-scrollbar-thumb { background: var(--elevated); border-radius: 2px; }
      `}</style>

      {/* Corner brackets — decorative, inset to stay clear of overflow:hidden clipping */}
      <SvgCornerBracket
        size={24} color={rp.color_hex} rotation={0}
        style={{ position: 'absolute', top: 2, left: 2 }}
      />
      <SvgCornerBracket
        size={24} color={rp.color_hex} rotation={90}
        style={{ position: 'absolute', top: 2, right: 2 }}
      />
      <SvgCornerBracket
        size={24} color={rp.color_hex} rotation={270}
        style={{ position: 'absolute', bottom: 2, left: 2 }}
      />
      <SvgCornerBracket
        size={24} color={rp.color_hex} rotation={180}
        style={{ position: 'absolute', bottom: 2, right: 2 }}
      />

      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Link
            href={`/mojo/rps/${rp.id}`}
            style={{
              fontFamily: 'Cormorant Upright, serif',
              fontSize: '32px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              color: muted ? 'var(--mist)' : rp.color_hex,
              textDecoration: 'none',
              display: 'block',
            }}
          >
            {rp.name}
          </Link>
          {rp.site_url ? (
            <a
              href={rp.site_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'EB Garamond, serif', fontSize: '15px', fontStyle: 'italic', color: 'var(--mist)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
            >
              {rp.site_name}
            </a>
          ) : (
            <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '15px', fontStyle: 'italic', color: 'var(--mist)' }}>
              {rp.site_name}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Link href={`/mojo/rps/${rp.id}/edit`} style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', color: 'var(--gold-dim)', textDecoration: 'none' }}>
            Edit
          </Link>
          <Link href={`/mojo/rps/${rp.id}`} style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', color: 'var(--moonstone)', textDecoration: 'none' }}>
            Add Character
          </Link>
          <MojoRpStatusMenu rpId={rp.id} currentStatus={rp.status} accentColor={rp.color_hex} />
        </div>
      </div>

      {rp.notes_plot && rp.notes_plot.trim() !== '' && (
        <div style={{ padding: '0 16px 10px' }}>
          <MojoDashboardNotes html={rp.notes_plot} />
        </div>
      )}

      <div style={{ padding: '0 16px 6px', opacity: 0.35, color: 'var(--faded)' }}>
        <SvgFiligreeRule />
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        {sortedCharacters.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8125rem', color: 'var(--faded)', margin: 0 }}>
            No characters yet.
          </p>
        ) : (
          <div className="mojo-char-row" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'thin' }}>
            {sortedCharacters.map((char) => (
              <div key={char.id} style={{ opacity: muted ? 0.75 : 1 }}>
                <MojoDashboardCharCard character={char} rpId={rp.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px', opacity: 0.35, color: 'var(--faded)' }}>
        <SvgFiligreeRule />
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--elevated)', background: 'var(--raised)' }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '9px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ color: muted ? 'var(--faded)' : rp.color_hex, opacity: 0.85 }}>
            {rp.active_thread_count} active
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{rp.total_thread_count - rp.active_thread_count} closed</span>
        </div>
      </div>
    </div>
  )
}
