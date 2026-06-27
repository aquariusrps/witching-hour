import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Under Maintenance — The Witching Hour',
  description: 'The Witching Hour is currently undergoing maintenance. We will return shortly.',
}

export default function MaintenancePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#100808',
        backgroundImage: [
          'radial-gradient(ellipse 60% 50% at 10% 0%, rgba(200,56,24,0.10) 0%, transparent 70%)',
          'radial-gradient(ellipse 50% 60% at 90% 40%, rgba(224,176,40,0.07) 0%, transparent 70%)',
          'radial-gradient(ellipse 50% 60% at 40% 100%, rgba(56,120,168,0.07) 0%, transparent 70%)',
        ].join(', '),
        fontFamily: "'EB Garamond', serif",
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/witchinghourlogo.png"
        alt="The Witching Hour"
        width={80}
        height={80}
        style={{ marginBottom: '1.5rem', opacity: 0.85 }}
      />

      <div
        style={{
          width: '1px',
          height: '40px',
          background: 'linear-gradient(to bottom, transparent, #7a2010)',
          margin: '0 auto 1.5rem',
        }}
      />

      <h1
        style={{
          fontFamily: "'Cormorant Upright', serif",
          fontSize: '2.5rem',
          fontWeight: 600,
          color: '#e0b028',
          marginBottom: '0.35rem',
          lineHeight: 1.1,
        }}
      >
        The Witching Hour
      </h1>

      <p
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#6a4838',
          marginBottom: '2rem',
        }}
      >
        Under Maintenance
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          opacity: 0.4,
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to right, transparent, #c83818, #e0b028, transparent)',
          }}
        />
        <span style={{ fontSize: '0.65rem', color: '#e0b028', letterSpacing: '0.2em' }}>
          ✦
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(to right, transparent, #e0b028, #c83818, transparent)',
          }}
        />
      </div>

      <p
        style={{
          fontFamily: "'EB Garamond', serif",
          fontStyle: 'italic',
          fontSize: '1.05rem',
          color: '#b89080',
          maxWidth: '420px',
          lineHeight: 1.75,
          marginBottom: '2rem',
        }}
      >
        The circle is temporarily closed. We are tending to the craft and will return shortly.
      </p>

      <Link
        href="/login"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '0.6rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#6a4838',
          textDecoration: 'none',
          borderBottom: '0.5px solid #3e1818',
          paddingBottom: '0.1rem',
        }}
      >
        Staff Sign In
      </Link>
    </main>
  )
}
