'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Home',       href: '/dashboard' },
  { label: 'Forums',     href: '/forums' },
  { label: 'The Circle', href: '/circle' },
  { label: 'Grimoire',   href: '/grimoire' },
  { label: 'Rewatch',    href: '/rewatch' },
  { label: 'Members',    href: '/members' },
]

export default function MastheadNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary navigation" style={{ display: 'flex', height: 60, alignItems: 'stretch' }}>
      {NAV_LINKS.map(({ label, href }) => {
        const isActive = href === '/dashboard'
          ? pathname === href
          : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              fontFamily: 'var(--f-body)',
              fontSize: '0.88rem',
              color: isActive ? 'var(--roseash)' : 'var(--mist)',
              textDecoration: 'none',
              borderBottom: isActive ? '2px solid var(--ember)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
