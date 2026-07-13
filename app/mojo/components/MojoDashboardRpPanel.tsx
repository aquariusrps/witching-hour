'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { updateMojoRp } from '@/lib/actions/mojo'
import MojoDashboardNotes from './MojoDashboardNotes'
import MojoDashboardCharCard from './MojoDashboardCharCard'
import { SvgCornerBracket } from '@/app/mojo/components/MojoSvgAssets'
import type { DashboardRp } from '@/lib/db/mojo'

function navigateToDashboard() {
  window.location.href = '/mojo'
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  hiatus: 'Hiatus',
  ended: 'Ended',
}

function MojoRpStatusMenu({ rpId, currentStatus }: { rpId: string; currentStatus: string }) {
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
          padding: '2px 8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--f-ui)',
          fontSize: '0.6875rem',
          color: 'var(--faded)',
        }}
      >
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
        background: 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderLeft: `4px solid ${muted ? 'var(--faded)' : rp.color_hex}`,
        borderRadius: 4,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      <style>{`
        .mojo-char-row::-webkit-scrollbar { height: 4px; }
        .mojo-char-row::-webkit-scrollbar-thumb { background: var(--elevated); border-radius: 2px; }
      `}</style>

      {/* Corner brackets — decorative, inset to stay clear of overflow:hidden clipping */}
      <SvgCornerBracket
        size={16} color={rp.color_hex} rotation={0}
        style={{ position: 'absolute', top: 2, left: 2 }}
      />
      <SvgCornerBracket
        size={16} color={rp.color_hex} rotation={90}
        style={{ position: 'absolute', top: 2, right: 2 }}
      />
      <SvgCornerBracket
        size={16} color={rp.color_hex} rotation={270}
        style={{ position: 'absolute', bottom: 2, left: 2 }}
      />
      <SvgCornerBracket
        size={16} color={rp.color_hex} rotation={180}
        style={{ position: 'absolute', bottom: 2, right: 2 }}
      />

      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <Link
            href={`/mojo/rps/${rp.id}`}
            style={{ fontFamily: 'var(--f-display)', fontSize: '1.375rem', color: muted ? 'var(--mist)' : 'var(--gold)', textDecoration: 'none', display: 'block' }}
          >
            {rp.name}
          </Link>
          {rp.site_url ? (
            <a
              href={rp.site_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--f-body)', fontSize: '0.8125rem', color: 'var(--mist)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
            >
              {rp.site_name}
            </a>
          ) : (
            <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.8125rem', color: 'var(--mist)' }}>
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
          <MojoRpStatusMenu rpId={rp.id} currentStatus={rp.status} />
        </div>
      </div>

      {rp.notes_plot && rp.notes_plot.trim() !== '' && (
        <div style={{ padding: '0 16px 10px' }}>
          <MojoDashboardNotes html={rp.notes_plot} />
        </div>
      )}

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

      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--elevated)', background: 'var(--raised)' }}>
        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6875rem', color: 'var(--faded)' }}>
          {rp.total_thread_count} threads total · {rp.active_thread_count} active
        </span>
      </div>
    </div>
  )
}
