'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { signOut } from '@/lib/actions/auth'

const ADMIN_PERMS = [
  'manage_site', 'manage_users', 'manage_factions', 'manage_boards',
  'manage_events', 'manage_apothecary', 'manage_waitlist',
  'approve_characters', 'award_xp', 'ban_users', 'manage_admins',
  'moderate_boards',
]

interface MastheadUserProps {
  displayName: string
  avatarUrl: string | null
  permissions: string[]
  superAdmin: boolean
}

function getInitial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

const DROPDOWN_CSS = `
  .mast-drop-item {
    display: block;
    width: 100%;
    padding: 10px 15px;
    font-family: var(--f-body);
    font-size: 0.88rem;
    color: var(--mist);
    text-align: left;
    text-decoration: none;
    background: transparent;
    border: none;
    cursor: pointer;
    box-sizing: border-box;
    transition: background 0.1s, color 0.1s;
    white-space: nowrap;
  }
  .mast-drop-item:hover {
    background: var(--raised);
    color: var(--roseash);
  }
  .mast-drop-item.danger:hover {
    background: var(--raised);
    color: var(--ember-light);
  }
`

export default function MastheadUser({ displayName, avatarUrl, permissions, superAdmin }: MastheadUserProps) {
  const showAdmin = superAdmin || permissions.some((p) => ADMIN_PERMS.includes(p))
  const showMod =
    permissions.includes('moderate_boards') ||
    permissions.includes('manage_faction') ||
    permissions.includes('post_announcement')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <style>{DROPDOWN_CSS}</style>
      <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>

        {/* Trigger — chip */}
        <button
          onClick={() => setIsOpen(o => !o)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid var(--cov-border)',
            flexShrink: 0,
            background: 'var(--raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt={displayName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{
                fontFamily: 'var(--f-display)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--gold)',
                lineHeight: 1,
              }}>
                {getInitial(displayName)}
              </span>
            )}
          </div>

          {/* Display name */}
          <span style={{
            fontFamily: 'var(--f-body)',
            fontSize: '0.86rem',
            color: 'var(--mist)',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </span>

          {/* Chevron — rotates when open */}
          <svg
            viewBox="0 0 10 6"
            fill="currentColor"
            aria-hidden="true"
            style={{
              width: 9,
              height: 5,
              color: 'var(--faded)',
              flexShrink: 0,
              transition: 'transform 0.15s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path d="M0 0l5 6 5-6H0z" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 160,
              background: 'var(--elevated)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-md)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 300,
              overflow: 'hidden',
            }}
          >
            <Link
              href="/profile"
              role="menuitem"
              className="mast-drop-item"
              onClick={() => setIsOpen(false)}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              View Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              className="mast-drop-item"
              onClick={() => setIsOpen(false)}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              Settings
            </Link>
            {(showAdmin || showMod) && (
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {showAdmin && (
                  <Link
                    href="/admin"
                    role="menuitem"
                    className="mast-drop-item"
                    onClick={() => setIsOpen(false)}
                    style={{
                      color: 'var(--gold)',
                      borderLeft: '2px solid var(--gold)',
                    }}
                  >
                    Admin Panel
                  </Link>
                )}
                {showMod && (
                  <Link
                    href="/mod"
                    role="menuitem"
                    className="mast-drop-item"
                    onClick={() => setIsOpen(false)}
                    style={{
                      color: 'var(--moonstone)',
                      borderLeft: '2px solid var(--moonstone)',
                      borderTop: showAdmin ? '1px solid var(--border)' : undefined,
                    }}
                  >
                    Mod Panel
                  </Link>
                )}
              </div>
            )}
            <form action={signOut} style={{ display: 'block', borderTop: '1px solid var(--border)' }}>
              <button
                type="submit"
                role="menuitem"
                className="mast-drop-item danger"
              >
                Sign Out
              </button>
            </form>
          </div>
        )}

      </div>
    </>
  )
}
