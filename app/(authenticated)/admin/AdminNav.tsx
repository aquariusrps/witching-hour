'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminNavProps {
  permissions: string[]
  superAdmin: boolean
}

type NavItem = {
  label: string
  href: string
  always?: boolean
  anyOf?: string[]
  superAdminOnly?: boolean
}

type NavSection = {
  label?: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin', always: true },
    ],
  },
  {
    label: 'Site',
    items: [
      { label: 'Site Settings', href: '/admin/settings', anyOf: ['manage_site', 'manage_waitlist'] },
      { label: 'Waitlist', href: '/admin/waitlist', anyOf: ['manage_waitlist'] },
    ],
  },
  {
    label: 'Users',
    items: [
      { label: 'Players', href: '/admin/players', anyOf: ['manage_users'] },
      { label: 'Roles', href: '/admin/roles', superAdminOnly: true },
    ],
  },
  {
    label: 'RP',
    items: [
      { label: 'Character Queue', href: '/admin/characters', anyOf: ['approve_characters'] },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Factions', href: '/admin/factions', anyOf: ['manage_factions'] },
      { label: 'Boards', href: '/admin/boards', anyOf: ['manage_boards'] },
      { label: 'Events', href: '/admin/events', anyOf: ['manage_events'] },
      { label: 'Apothecary', href: '/admin/apothecary', anyOf: ['manage_apothecary'] },
    ],
  },
  {
    label: 'Moderation',
    items: [
      { label: 'Reports Queue', href: '/admin/reports', anyOf: ['moderate_boards'] },
    ],
  },
]

function canSeeItem(item: NavItem, permissions: string[], superAdmin: boolean): boolean {
  if (item.always) return true
  if (superAdmin) return true
  if (item.superAdminOnly) return false
  if (item.anyOf) return item.anyOf.some((p) => permissions.includes(p))
  return false
}

export default function AdminNav({ permissions, superAdmin }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        .adm-nav {
          background: var(--claret);
          border-bottom: 1px solid var(--ember-dim);
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          flex-shrink: 0;
          scrollbar-width: none;
        }
        .adm-nav::-webkit-scrollbar { display: none; }
        .adm-section-label {
          display: none;
        }
        .adm-divider {
          display: none;
        }
        .adm-link {
          display: flex;
          align-items: center;
          padding: 8px 14px;
          font-family: var(--f-ui);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          color: var(--mist);
          text-decoration: none;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .adm-link:hover {
          color: var(--roseash);
        }
        .adm-link.active {
          color: var(--roseash);
          border-bottom-color: var(--ember);
        }
        @media (min-width: 768px) {
          .adm-nav {
            flex-direction: column;
            width: 220px;
            min-height: calc(100vh - 96px);
            border-bottom: none;
            border-right: 1px solid var(--ember-dim);
            overflow-x: visible;
            padding: 16px 0;
          }
          .adm-section-label {
            display: block;
            font-family: var(--f-ui);
            font-size: 0.5rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--faded);
            padding: 12px 20px 4px;
          }
          .adm-divider {
            display: block;
            height: 1px;
            background: var(--raised);
            margin: 8px 16px;
          }
          .adm-link {
            padding: 7px 20px;
            border-bottom: none;
            border-left: 2px solid transparent;
          }
          .adm-link:hover {
            background: var(--raised);
          }
          .adm-link.active {
            border-bottom-color: transparent;
            border-left-color: var(--ember);
            background: var(--raised);
          }
        }
      `}</style>
      <nav className="adm-nav" aria-label="Admin navigation">
        {NAV_SECTIONS.map((section, si) => {
          const visibleItems = section.items.filter((item) =>
            canSeeItem(item, permissions, superAdmin)
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={si} style={{ display: 'contents' }}>
              {si > 0 && <div className="adm-divider" aria-hidden="true" />}
              {section.label && (
                <span className="adm-section-label">{section.label}</span>
              )}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`adm-link${isActive ? ' active' : ''}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>
    </>
  )
}
