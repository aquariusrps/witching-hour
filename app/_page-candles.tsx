import type { Metadata } from 'next'
import Link from 'next/link'
import Candles from '@/app/components/Candles'

export const metadata: Metadata = {
  title: 'The Witching Hour — A Fan Community for Charmed, Buffy & Angel',
  description:
    'For those who never stopped believing in magic. A fan community and roleplay hub for Charmed, Buffy the Vampire Slayer, Angel, and the magic that never left.',
  openGraph: {
    title: 'The Witching Hour — A Fan Community for Charmed, Buffy & Angel',
    description:
      'For those who never stopped believing in magic. A fan community and roleplay hub for Charmed, Buffy the Vampire Slayer, Angel, and the magic that never left.',
    type: 'website',
    url: 'https://atwitchinghour.com',
  },
}

const CANONS = [
  { label: 'Charmed',                 color: '#e0b028', glow: 'rgba(224,176,40,0.5)',  primary: true  },
  { label: 'Buffy the Vampire Slayer', color: '#3878a8', glow: 'rgba(56,120,168,0.5)',  primary: true  },
  { label: 'Angel',                   color: '#c83818', glow: 'rgba(200,56,24,0.5)',   primary: true  },
  { label: 'The Secret Circle',       color: '#7a6080', glow: 'transparent',           primary: false },
  { label: 'The Craft',               color: '#608060', glow: 'transparent',           primary: false },
  { label: 'Witches of East End',     color: '#806040', glow: 'transparent',           primary: false },
  { label: 'Practical Magic',         color: '#806870', glow: 'transparent',           primary: false },
]

const PENTACLE_PATH =
  'M100,5 L155.8,176.9 L9.6,70.6 L190.4,70.6 L44.2,176.9 Z'

const ANIMATIONS = `
  @keyframes moonRise {
    from { opacity: 0; transform: scale(1.0); }
    to   { opacity: 1; transform: scale(1.04); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim-moon { animation: moonRise 0.9s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-1    { animation: fadeUp  0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 350ms; }
  .anim-2    { animation: fadeUp  0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 500ms; }
  .anim-3    { animation: fadeUp  0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 650ms; }
  .anim-4    { animation: fadeUp  0.7s cubic-bezier(0.16,1,0.3,1) both; animation-delay: 800ms; }
  @media (prefers-reduced-motion: reduce) {
    .anim-moon, .anim-1, .anim-2, .anim-3, .anim-4 {
      animation: none; opacity: 1; transform: none;
    }
  }
`

export default function LandingPage() {
  return (
    <>
      <style>{ANIMATIONS}</style>

      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          background: [
            'radial-gradient(ellipse 65% 55% at top left,    rgba(200,56,24,0.15) 0%, transparent 60%)',
            'radial-gradient(ellipse 55% 60% at right center, rgba(224,176,40,0.12) 0%, transparent 60%)',
            'radial-gradient(ellipse 65% 50% at bottom center,rgba(56,120,168,0.10) 0%, transparent 60%)',
            'var(--char)',
          ].join(', '),
        }}
      >
        {/* ── Hero ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Pentacle watermark */}
          <svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            fill="none"
            className="anim-moon"
            style={{
              position: 'absolute',
              width: 'min(600px, 85vmin)',
              height: 'min(600px, 85vmin)',
              opacity: 0.04,
              pointerEvents: 'none',
            }}
          >
            <circle cx="100" cy="100" r="95" stroke="var(--roseash)" strokeWidth="0.6" />
            <path
              d={PENTACLE_PATH}
              stroke="var(--roseash)"
              strokeWidth="0.6"
              fill="none"
              strokeLinejoin="miter"
            />
          </svg>

          {/* Blood moon mark */}
          <svg
            aria-hidden="true"
            viewBox="0 0 38 38"
            fill="none"
            className="anim-moon"
            style={{
              width: 120,
              height: 120,
              marginBottom: '1.5rem',
              filter: 'drop-shadow(0 0 18px rgba(200,56,24,0.45))',
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

          {/* Declaration */}
          <h1
            className="anim-1"
            style={{
              fontFamily: 'Cormorant Upright, serif',
              lineHeight: 1.05,
              marginBottom: '1rem',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--gold)',    fontSize: 'clamp(2.4rem,6.5vw,4.5rem)' }}>The Witching Hour</span>
            <span style={{ fontWeight: 300, color: 'var(--roseash)', fontSize: 'clamp(1.9rem,5.2vw,3.5rem)' }}> is upon us.</span>
          </h1>

          {/* Tagline */}
          <p
            className="anim-2"
            style={{
              fontFamily: 'EB Garamond, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1rem,2.2vw,1.3rem)',
              color: 'var(--mist)',
              marginBottom: '2rem',
            }}
          >
            For those who never stopped believing in magic.
          </p>

          {/* CTAs */}
          <div
            className="anim-3"
            style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link
              href="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.75rem 2rem',
                background: 'var(--ember)',
                color: 'var(--roseash)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                border: 'none', borderRadius: '2px', textDecoration: 'none',
              }}
            >
              Enter the Circle
            </Link>
            <Link
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.75rem 2rem',
                background: 'transparent',
                color: 'var(--mist)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                border: '1px solid rgba(122,32,16,0.6)', borderRadius: '2px', textDecoration: 'none',
              }}
            >
              I already belong
            </Link>
          </div>
        </div>

        {/* ── Altar & Candles ── */}
        <div
          className="anim-4"
          style={{
            position: 'relative',
            background: 'var(--claret)',
            borderTop: '1px solid rgba(122,32,16,0.5)',
          }}
        >
          {/* Altar ledge gradient line */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, rgba(200,56,24,0.3) 20%, rgba(224,176,40,0.4) 50%, rgba(200,56,24,0.3) 80%, transparent)',
            }}
          />
          <Candles />
        </div>

        {/* ── Show ribbon ── */}
        <div
          style={{
            background: 'rgba(16,4,4,0.6)',
            borderTop: '1px solid rgba(122,32,16,0.35)',
            padding: '0.6rem 1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem 1.5rem',
            }}
          >
            {CANONS.map(({ label, color, glow, primary }) => (
              <span
                key={label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: primary ? 'rgba(176,140,112,0.8)' : 'var(--faded)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: 5, height: 5,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: glow !== 'transparent' ? `0 0 4px ${glow}` : 'none',
                    flexShrink: 0,
                  }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
