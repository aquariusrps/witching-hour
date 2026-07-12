'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createMojoRp } from '@/lib/actions/mojo'

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
  { label: 'Dashboard', href: '/mojo' },
  { label: 'Faceclaims', href: '/mojo/faceclaims' },
  { label: 'Library', href: '/mojo/library' },
  { label: 'Wishlist', href: '/mojo/wishlist' },
  { label: 'Partners', href: '/mojo/partners' },
  { label: 'Search', href: '/mojo/search' },
]

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
      background: 'var(--claret)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
        <div style={{ padding: '18px 16px 8px' }}>
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.6rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
          }}>
            The Circle
          </span>
        </div>

        <Divider />

        <nav style={{ padding: '0 8px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.85rem',
                  color: isActive ? 'var(--gold)' : 'var(--roseash)',
                  textDecoration: 'none',
                  borderRadius: 2,
                  background: isActive ? 'var(--raised)' : 'transparent',
                }}
              >
                ✦ {item.label}
              </Link>
            )
          })}
        </nav>

        <Divider />

        <div style={{ padding: '0 16px 6px' }}>
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.6rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
          }}>
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
          fontFamily: 'var(--f-ui)',
          fontSize: '0.6rem',
          color: 'var(--faded)',
          margin: 0,
        }}>
          mojo v1
        </p>
      </div>
    </aside>
  )
}
