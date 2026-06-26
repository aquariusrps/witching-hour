'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/dashboard',
    exact: true,
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1z" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/whispers',
    exact: false,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 3h12a.5.5 0 01.5.5v7a.5.5 0 01-.5.5H8l-3 2.5V11H2.5A.5.5 0 012 10.5v-7A.5.5 0 012.5 3z" />
      </svg>
    ),
  },
  {
    label: 'My Posts',
    href: '/posts',
    exact: false,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h10M3 7h8M3 10h6" />
      </svg>
    ),
  },
  {
    label: 'Watched Threads',
    href: '/bookmarks',
    exact: false,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 2h10v13l-5-3-5 3V2z" />
      </svg>
    ),
  },
  {
    label: 'My Characters',
    href: '/characters',
    exact: false,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <circle cx="8" cy="6" r="3" strokeLinecap="round"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 14c0-2.5 2.5-4 6-4s6 1.5 6 4" />
      </svg>
    ),
  },
  {
    label: 'The Apothecary',
    href: '/apothecary',
    exact: false,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 2h6M6 2v3L3 11a1 1 0 000 2h10a1 1 0 000-2L10 5V2" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    exact: false,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <circle cx="8" cy="8" r="2.5"/>
        <path strokeLinecap="round" d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
      </svg>
    ),
  },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Dashboard navigation">
      {NAV_ITEMS.map(({ label, href, exact, icon }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              borderRadius: 'var(--r-xs)',
              fontFamily: 'var(--f-body)',
              fontSize: '0.88rem',
              color: isActive ? 'var(--roseash)' : 'var(--mist)',
              background: isActive ? 'var(--ember-fill)' : 'transparent',
              textDecoration: 'none',
              borderLeft: isActive ? '2px solid var(--ember)' : '2px solid transparent',
              transition: 'color 0.12s, background 0.12s',
            }}
          >
            <span style={{ color: isActive ? 'var(--ember)' : 'var(--faded)', display: 'flex', alignItems: 'center' }}>
              {icon}
            </span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
