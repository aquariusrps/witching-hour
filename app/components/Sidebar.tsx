'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'

interface SidebarProps {
  user: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
}

const FILIGREE: React.CSSProperties = {
  height: 1,
  margin: '0.5rem 0',
  background: 'linear-gradient(to right, var(--ember), var(--gold))',
  opacity: 0.3,
}

const SECTION_LABEL: React.CSSProperties = {
  fontFamily: 'Cinzel, serif',
  fontSize: '0.5rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  padding: '0.5rem 0.875rem 0.25rem',
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.4rem 0.875rem',
        fontFamily: 'Cinzel, serif',
        fontSize: '0.6rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: isActive ? 'var(--gold)' : 'var(--mist)',
        textDecoration: 'none',
        borderLeft: isActive ? '2px solid var(--ember)' : '2px solid transparent',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {children}
    </Link>
  )
}

export default function Sidebar({ user }: SidebarProps) {
  if (!user) return null

  return (
    <aside style={{
      width: 200,
      flexShrink: 0,
      background: 'var(--claret)',
      borderRight: '1px solid var(--ember-dim)',
      minHeight: '100%',
      paddingTop: '0.75rem',
      paddingBottom: '1.5rem',
    }}>
      {/* Section 1 — Personal */}
      <p style={SECTION_LABEL}>Personal</p>

      <NavLink href="/whispers">
        <span style={{ flex: 1 }}>Whispers</span>
        {/* Unread badge stub — wired in future */}
        <span style={{
          background: 'var(--ember)',
          color: 'var(--roseash)',
          fontFamily: 'Cinzel, serif',
          fontSize: '0.5rem',
          borderRadius: '2px',
          padding: '0 4px',
          lineHeight: '16px',
          display: 'inline-block',
          visibility: 'hidden', // stub: hidden until count wired
        }}>0</span>
      </NavLink>

      <NavLink href="/characters">My Characters</NavLink>
      <NavLink href="/apothecary">The Apothecary</NavLink>
      <NavLink href="/bookmarks">Bookmarks</NavLink>

      <div style={FILIGREE} />

      {/* Section 2 — Account */}
      <p style={SECTION_LABEL}>Account</p>

      <NavLink href="/profile">Edit Profile</NavLink>
      <NavLink href="/settings">Settings</NavLink>

      {/* Sign Out */}
      <form action={signOut} style={{ margin: 0 }}>
        <button
          type="submit"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '0.4rem 0.875rem',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--mist)',
            background: 'none',
            border: 'none',
            borderLeft: '2px solid transparent',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </form>
    </aside>
  )
}
