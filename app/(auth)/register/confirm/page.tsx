import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check Your Email — The Witching Hour',
  description: 'Confirm your email address to complete registration.',
}

export default function ConfirmPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: [
        'radial-gradient(ellipse 65% 55% at top left,    rgba(200,56,24,0.12) 0%, transparent 60%)',
        'radial-gradient(ellipse 55% 60% at right center, rgba(224,176,40,0.09) 0%, transparent 60%)',
        'var(--char)',
      ].join(', '),
      textAlign: 'center',
    }}>
      {/* Logo + site name */}
      <svg
        aria-hidden="true"
        viewBox="0 0 38 38"
        fill="none"
        style={{
          width: 48, height: 48,
          display: 'block',
          margin: '0 auto 0.75rem',
          filter: 'drop-shadow(0 0 10px rgba(200,56,24,0.4))',
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

      <p style={{
        fontFamily: 'Cormorant Upright, serif',
        fontWeight: 600,
        fontSize: '1.1rem',
        color: 'var(--gold)',
        marginBottom: '2rem',
        letterSpacing: '0.02em',
      }}>
        The Witching Hour
      </p>

      <h1 style={{
        fontFamily: 'Cormorant Upright, serif',
        fontWeight: 600,
        fontSize: 'clamp(2rem,5vw,3rem)',
        color: 'var(--gold)',
        marginBottom: '1.25rem',
        lineHeight: 1.1,
      }}>
        Check your inbox.
      </h1>

      <p style={{
        fontFamily: 'EB Garamond, Georgia, serif',
        fontStyle: 'italic',
        fontSize: 'clamp(1rem,2.2vw,1.2rem)',
        color: 'var(--mist)',
        maxWidth: 440,
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        We&rsquo;ve sent a confirmation link to your email address. Click it to complete
        your registration and enter the circle.
      </p>

      <p style={{
        fontFamily: 'EB Garamond, Georgia, serif',
        fontSize: '0.9rem',
        color: 'var(--faded)',
      }}>
        Didn&rsquo;t receive it? Check your spam folder.
      </p>
    </div>
  )
}
