import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'About',     href: '/about' },
  { label: 'Rules',     href: '/rules' },
  { label: 'Staff',     href: '/staff' },
  { label: 'Discord',   href: '/discord' },
  { label: 'Donate',    href: '/donate' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Privacy',   href: '/privacy' },
  { label: 'Contact',   href: '/contact' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--raised)',
      padding: '28px 26px 32px',
      marginTop: 'auto',
    }}>
      {/* Filigree */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 18,
      }}>
        <span style={{ flex: 1, maxWidth: 160, height: 1, background: 'var(--border)' }} />
        <svg aria-hidden="true" viewBox="0 0 32 16" fill="none" style={{ width: 32, height: 16, color: 'var(--faded)', flexShrink: 0 }}>
          <circle cx="16" cy="8" r="3.5" stroke="currentColor" strokeWidth="0.8"/>
          <circle cx="16" cy="8" r="1.2" fill="currentColor"/>
          <line x1="0"  y1="8" x2="11"  y2="8" stroke="currentColor" strokeWidth="0.5"/>
          <line x1="21" y1="8" x2="32"  y2="8" stroke="currentColor" strokeWidth="0.5"/>
          <circle cx="3"  cy="8" r="1" fill="currentColor" opacity="0.5"/>
          <circle cx="29" cy="8" r="1" fill="currentColor" opacity="0.5"/>
        </svg>
        <span style={{ flex: 1, maxWidth: 160, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Footer links */}
      <nav aria-label="Footer navigation" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px 20px',
        marginBottom: 14,
      }}>
        {FOOTER_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.54rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Copyright */}
      <p style={{
        textAlign: 'center',
        fontFamily: 'var(--f-body)',
        fontStyle: 'italic',
        fontSize: '0.78rem',
        color: 'var(--faded)',
        margin: 0,
      }}>
        © {year} The Witching Hour · Fan community · Not affiliated with any network or studio
      </p>
    </footer>
  )
}
