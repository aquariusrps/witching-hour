import Link from 'next/link'

interface MastheadProps {
  user: {
    id: string
    display_name: string
    avatar_url: string | null
    theme_preference: string | null
    active_character_id: string | null
  } | null
  settings: Record<string, string>
}

const NAV_LINKS = [
  { label: 'Home',      href: '/dashboard' },
  { label: 'Forums',    href: '/forums' },
  { label: 'The Circle', href: '/circle' },
  { label: 'Grimoire',  href: '/grimoire' },
  { label: 'Rewatch',   href: '/rewatch' },
  { label: 'Members',   href: '/members' },
]

const SHOWS = [
  { label: 'Charmed',             color: 'var(--gold)' },
  { label: 'Buffy',               color: 'var(--moonstone)' },
  { label: 'Angel',               color: 'var(--ember)' },
  { label: 'The Secret Circle',   color: 'var(--mist)' },
  { label: 'The Craft',           color: 'var(--mist)' },
  { label: 'Witches of East End', color: 'var(--mist)' },
  { label: 'Practical Magic',     color: 'var(--mist)' },
]

function getInitial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

export default function Masthead({ user }: MastheadProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
    }}>
      {/* Row 1 — Top bar */}
      <div style={{
        background: 'var(--masthead-bg)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--ember-dim)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.25rem',
        height: 52,
        gap: '1.5rem',
      }}>
        {/* Left — Logo + site title */}
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          <svg
            aria-hidden="true"
            viewBox="0 0 38 38"
            fill="none"
            style={{
              width: 32, height: 32,
              filter: 'drop-shadow(0 0 6px rgba(200,56,24,0.5))',
            }}
          >
            <circle cx="19" cy="19" r="17" stroke="#c83818" strokeWidth="0.5" opacity="0.4" />
            <circle cx="19" cy="19" r="13" fill="rgba(200,56,24,0.12)" stroke="#c83818" strokeWidth="0.8" opacity="0.7" />
            <circle cx="23" cy="17" r="10" fill="rgba(16,8,8,0.75)" />
            <polygon points="14,6 24,28 4,15 24,15 4,28" fill="none" stroke="#e0b028" strokeWidth="0.7" strokeLinejoin="round" opacity="0.8" />
            <circle cx="14" cy="19" r="1.5" fill="#c83818" opacity="0.8" />
            <circle cx="19" cy="2"  r="1" fill="#e0b028" opacity="0.45" />
            <circle cx="36" cy="19" r="1" fill="#e0b028" opacity="0.45" />
            <circle cx="19" cy="36" r="1" fill="#e0b028" opacity="0.45" />
            <circle cx="2"  cy="19" r="1" fill="#e0b028" opacity="0.45" />
          </svg>
          <span style={{
            fontFamily: 'Cormorant Upright, serif',
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--gold)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}>
            The Witching Hour
          </span>
        </Link>

        {/* Center — Nav links */}
        <nav style={{
          display: 'flex',
          gap: '1.25rem',
          flex: 1,
          justifyContent: 'center',
        }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--mist)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right — Bell + user chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
          {/* Notification bell stub */}
          <button
            aria-label="Notifications"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--mist)',
              padding: '4px',
              lineHeight: 1,
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
              <path d="M10 2a6 6 0 00-6 6v2.586l-1.707 1.707A1 1 0 003 14h14a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-2-2h4a2 2 0 01-2 2z" />
            </svg>
          </button>

          {/* User chip */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}>
              {/* Avatar */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1px solid var(--ember)',
                flexShrink: 0,
                background: 'var(--claret)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {user.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.7rem',
                    color: 'var(--mist)',
                    fontWeight: 600,
                  }}>
                    {getInitial(user.display_name)}
                  </span>
                )}
              </div>

              {/* Display name */}
              <span style={{
                fontFamily: 'EB Garamond, Georgia, serif',
                fontSize: '0.875rem',
                color: 'var(--roseash)',
                maxWidth: 120,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.display_name}
              </span>

              {/* Chevron stub */}
              <svg viewBox="0 0 10 6" fill="currentColor" style={{ width: 10, height: 6, color: 'var(--faded)', flexShrink: 0 }}>
                <path d="M0 0l5 6 5-6H0z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — Show ribbon */}
      <div style={{
        background: 'var(--claret)',
        borderBottom: '1px solid var(--ember-dim)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.25rem',
        height: 28,
        gap: '1.25rem',
        overflow: 'hidden',
      }}>
        {/* Shows */}
        <div style={{ display: 'flex', gap: '1.25rem', flex: 1, alignItems: 'center' }}>
          {SHOWS.map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.55rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--mist)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <span style={{
          fontFamily: 'EB Garamond, Georgia, serif',
          fontStyle: 'italic',
          fontSize: '0.75rem',
          color: 'var(--faded)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          For those who never stopped believing in magic.
        </span>
      </div>
    </header>
  )
}
