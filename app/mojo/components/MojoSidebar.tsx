'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createMojoRp } from '@/lib/actions/mojo'
import {
  SvgSidebarOrnamentTop,
  SvgSidebarOrnamentBottom,
  SvgFiligreeRule,
  SvgNavDashboard,
  SvgNavImages,
  SvgNavFaceclaims,
  SvgNavLibrary,
  SvgNavWishlist,
  SvgNavPartners,
  SvgNavStacks,
  SvgNavSearch,
} from './MojoSvgAssets'

type MojoCharacter = {
  id: string
  name: string
  status: string
  display_order: number
  rp_id: string
}

type MojoRpWithCharacters = {
  id: string
  name: string
  color_hex: string
  status: string
  characters: MojoCharacter[]
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/mojo', Icon: SvgNavDashboard },
  { label: 'Images', href: '/mojo/images', Icon: SvgNavImages },
  { label: 'Faceclaims', href: '/mojo/faceclaims', Icon: SvgNavFaceclaims },
  { label: 'Library', href: '/mojo/library', Icon: SvgNavLibrary },
  { label: 'Wishlist', href: '/mojo/wishlist', Icon: SvgNavWishlist },
  { label: 'Partners', href: '/mojo/partners', Icon: SvgNavPartners },
  { label: 'Stacks', href: '/mojo/stacks', Icon: SvgNavStacks },
  { label: 'Search', href: '/mojo/search', Icon: SvgNavSearch },
]

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'Cinzel, serif',
  fontSize: '9px',
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
}

const INPUT_STYLE: React.CSSProperties = {
  padding: '6px 8px',
  background: 'var(--raised)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.8rem',
  color: 'var(--roseash)',
  outline: 'none',
}

function Divider() {
  return (
    <div style={{
      height: 1,
      margin: '10px 16px',
      background: 'linear-gradient(to right, var(--ember), var(--gold))',
      opacity: 0.4,
    }} />
  )
}

export default function MojoSidebar({ rps }: { rps: MojoRpWithCharacters[] }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(rps.map((r) => r.id)))
  const [showNewForm, setShowNewForm] = useState(false)
  const [name, setName] = useState('')
  const [siteName, setSiteName] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [colorHex, setColorHex] = useState('#c83818')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pathParts = pathname.split('/')
  const activeRpId = pathParts[2] === 'rps' ? pathParts[3] : null
  const activeCharId = pathParts[2] === 'characters' ? pathParts[3] : null

  function toggleExpanded(rpId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(rpId)) next.delete(rpId)
      else next.add(rpId)
      return next
    })
  }

  async function handleCreateRp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData()
    fd.set('name', name)
    fd.set('site_name', siteName)
    fd.set('site_url', siteUrl)
    fd.set('color_hex', colorHex)

    const result = await createMojoRp(fd)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    window.location.href = '/mojo'
  }

  return (
    <aside style={{
      width: 260,
      flexShrink: 0,
      background: `
        repeating-linear-gradient(
          180deg,
          rgba(255,255,255,0.010) 0px,
          rgba(255,255,255,0.010) 1px,
          transparent 1px,
          transparent 4px
        ),
        var(--claret)
      `,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.03), 4px 0 20px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0 12px',
          color: 'var(--mist)',
        }}>
          <SvgSidebarOrnamentTop />
        </div>

        <div style={{ padding: '18px 16px 8px' }}>
          <span style={SECTION_LABEL_STYLE}>
            The Circle
          </span>
        </div>

        <Divider />

        <nav style={{ padding: '0 8px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.Icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mojo-nav-item${isActive ? ' mojo-nav-active' : ''}`}
                style={{
                  padding: '7px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: isActive ? 'var(--roseash)' : 'var(--mist)',
                  fontFamily: 'EB Garamond, serif',
                  fontSize: '14px',
                  borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(224,176,40,0.08) 0%, transparent 100%)'
                    : 'transparent',
                  borderRadius: 2,
                  textDecoration: 'none',
                }}
              >
                <Icon active={isActive} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '4px 12px 8px', color: 'var(--faded)' }}>
          <SvgFiligreeRule />
        </div>

        <div style={{ padding: '0 16px 6px' }}>
          <span style={SECTION_LABEL_STYLE}>
            Your RPs
          </span>
        </div>

        <div style={{ padding: '0 8px' }}>
          {rps.length === 0 && (
            <p style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              fontSize: '0.8rem',
              color: 'var(--faded)',
              padding: '4px 12px 8px',
            }}>
              No RPs yet.
            </p>
          )}

          {rps.map((rp) => {
            const isActiveRp = rp.id === activeRpId
            const isExpanded = expanded.has(rp.id)

            return (
              <div key={rp.id} style={{ marginBottom: 2 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: `8px solid ${rp.color_hex}`,
                  background: isActiveRp ? 'var(--raised)' : 'transparent',
                  borderRadius: 2,
                }}>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(rp.id)}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--faded)',
                      cursor: 'pointer',
                      padding: '8px 4px 8px 8px',
                      fontSize: '0.6rem',
                      lineHeight: 1,
                    }}
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <Link
                    href={`/mojo/rps/${rp.id}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '8px 12px 8px 4px',
                      textDecoration: 'none',
                      minWidth: 0,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span className="mojo-rp-ember" style={{ backgroundColor: rp.color_hex }} />
                      <span style={{
                        fontFamily: 'var(--f-body)',
                        fontSize: '0.85rem',
                        color: 'var(--roseash)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {rp.name}
                      </span>
                    </span>
                    {rp.status !== 'active' && (
                      <span style={{
                        fontFamily: 'var(--f-ui)',
                        fontSize: '0.55rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: rp.status === 'hiatus' ? 'var(--gold-dim)' : 'var(--faded)',
                        flexShrink: 0,
                      }}>
                        {rp.status}
                      </span>
                    )}
                  </Link>
                </div>

                {isExpanded && rp.characters.length > 0 && (
                  <div style={{ paddingLeft: 28 }}>
                    {rp.characters.map((char) => {
                      const isActiveChar = char.id === activeCharId
                      return (
                        <Link
                          key={char.id}
                          href={`/mojo/characters/${char.id}`}
                          style={{
                            display: 'block',
                            padding: '4px 12px',
                            fontFamily: 'var(--f-body)',
                            fontSize: '0.8rem',
                            color: isActiveChar ? 'var(--ember)' : 'var(--mist)',
                            textDecoration: 'none',
                          }}
                        >
                          · {char.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ padding: '10px 16px 0' }}>
          {!showNewForm ? (
            <button
              type="button"
              onClick={() => setShowNewForm(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold-dim)',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              + New RP
            </button>
          ) : (
            <form onSubmit={handleCreateRp} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 10 }}>
              {error && (
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--ember-light)', margin: 0 }}>
                  {error}
                </p>
              )}
              <input
                type="text"
                placeholder="RP name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={INPUT_STYLE}
              />
              <input
                type="text"
                placeholder="Site name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                style={INPUT_STYLE}
              />
              <input
                type="text"
                placeholder="Site URL (optional)"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                style={INPUT_STYLE}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  style={{ width: 32, height: 28, padding: 0, border: '1px solid var(--elevated)', borderRadius: 2, cursor: 'pointer', background: 'var(--raised)' }}
                />
                <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.75rem', color: 'var(--faded)' }}>Color</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    background: 'var(--ember)',
                    color: 'var(--roseash)',
                    border: 'none',
                    borderRadius: 2,
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.7rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewForm(false); setError(null) }}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    color: 'var(--faded)',
                    border: '1px solid var(--elevated)',
                    borderRadius: 2,
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div style={{ padding: '10px 16px', flexShrink: 0 }}>
        <div style={{
          height: 1,
          marginBottom: 8,
          background: 'linear-gradient(to right, var(--ember), var(--gold))',
          opacity: 0.3,
        }} />
        <p style={{
          textAlign: 'center',
          fontFamily: 'Cinzel, serif',
          fontSize: '9px',
          letterSpacing: '0.3em',
          color: 'var(--faded)',
          margin: 0,
        }}>
          mojo v1
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '12px',
        color: 'var(--faded)',
        opacity: 0.4,
      }}>
        <SvgSidebarOrnamentBottom />
      </div>
    </aside>
  )
}
