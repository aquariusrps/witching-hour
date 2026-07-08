import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — The Witching Hour',
  description: 'The page you seek does not exist.',
}

export default function NotFound() {
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
      <div
        style={{
          width: '1px',
          height: '48px',
          background: 'linear-gradient(to bottom, transparent, #7a2010)',
          margin: '0 auto 1.75rem',
        }}
      />

      <p
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '3rem',
          fontWeight: 600,
          letterSpacing: '0.2em',
          color: '#7a2010',
          marginBottom: '0.5rem',
          lineHeight: 1,
        }}
      >
        404
      </p>

      <h1
        style={{
          fontFamily: "'Cormorant Upright', serif",
          fontSize: '2.2rem',
          fontWeight: 500,
          color: '#e0b028',
          marginBottom: '0.35rem',
          lineHeight: 1.1,
        }}
      >
        Lost between worlds.
      </h1>

      <p
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '0.62rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#6a4838',
          marginBottom: '2rem',
        }}
      >
        The path you seek does not exist.
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
          fontSize: '1rem',
          color: '#b89080',
          maxWidth: '480px',
          lineHeight: 1.75,
          marginBottom: '2rem',
        }}
      >
        The circle holds many secrets, but this is not one of them. Perhaps the spell was misdirected.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link
          href="/"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.62rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#100808',
            background: '#e0b028',
            padding: '0.6rem 1.4rem',
            borderRadius: '2px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Return Home
        </Link>
        <Link
          href="/forums"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.62rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#c83818',
            background: 'transparent',
            border: '0.5px solid #7a2010',
            padding: '0.6rem 1.4rem',
            borderRadius: '2px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          The Boards
        </Link>
      </div>
    </main>
  )
}
