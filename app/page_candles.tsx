/**
 * _page-candles.tsx
 * Alternate landing page — Blood Moon with cream candles flanking the show ribbon.
 * Candles sit bottom-aligned against the TOP of the ribbon bar.
 * Ribbon spans the full viewport width, fixed to the bottom.
 *
 * To activate: copy contents to app/page.tsx
 * Requires: app/components/Candles.tsx (cream variant)
 */

import Candles from '@/app/components/Candles'
import Link from 'next/link'

export const metadata = {
  title: 'The Witching Hour',
  description: 'For those who never stopped believing in magic.',
  openGraph: {
    title: 'The Witching Hour',
    description: 'For those who never stopped believing in magic.',
    url: 'https://atwitchinghour.com',
    siteName: 'The Witching Hour',
    type: 'website',
  },
}

const SHOWS = [
  { label: 'Charmed',             color: '#e0b028' },
  { label: 'Buffy',               color: '#3878a8' },
  { label: 'Angel',               color: '#c83818' },
  { label: 'The Secret Circle',   color: '#b89080' },
  { label: 'The Craft',           color: '#b89080' },
  { label: 'Witches of East End', color: '#b89080' },
  { label: 'Practical Magic',     color: '#b89080' },
]

// Ribbon height — referenced in two places so they stay in sync
const RIBBON_H = 38 // px

// 5 candles per side — picked for varied heights, mirrored for symmetry
const LEFT_INDICES  = [5, 0, 2, 6, 1] // short → tall, left to right
const RIGHT_INDICES = [1, 6, 2, 0, 5] // tall → short, left to right (mirror)

export default function HomeCandles() {
  return (
    <>
      {/* Ambient background glows */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 10% 5%,  rgba(200,56,24,0.18) 0%, transparent 70%),
          radial-gradient(ellipse 50% 60% at 90% 45%, rgba(224,176,40,0.12) 0%, transparent 70%),
          radial-gradient(ellipse 70% 40% at 50% 100%,rgba(56,120,168,0.10) 0%, transparent 70%)
        `,
      }} />

      {/* Pentacle watermark */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.04,
      }}>
        <svg width="420" height="420" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="210" cy="210" r="200" stroke="#e0b028" strokeWidth="1.5" />
          <polygon points="210,30 390,330 50,140 370,140 30,330" fill="none" stroke="#e0b028" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Main content — padded so it doesn't hide behind ribbon */}
      <main style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingBottom: RIBBON_H + 16,
      }}>
        {/* Logo mark */}
        <div style={{ marginBottom: '2rem', animation: 'moonRise 1.2s ease-out both' }}>
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="45" cy="45" r="40" stroke="#e0b028" strokeWidth="1" fill="none" opacity="0.6" />
            <line x1="45" y1="4"  x2="45" y2="12" stroke="#e0b028" strokeWidth="1.5" />
            <line x1="45" y1="78" x2="45" y2="86" stroke="#e0b028" strokeWidth="1.5" />
            <line x1="4"  y1="45" x2="12" y2="45" stroke="#e0b028" strokeWidth="1.5" />
            <line x1="78" y1="45" x2="86" y2="45" stroke="#e0b028" strokeWidth="1.5" />
            <circle cx="45" cy="45" r="34" fill="#c83818" opacity="0.85" />
            <circle cx="62" cy="45" r="28" fill="#100808" />
            <g transform="translate(28, 28) scale(0.38)" opacity="0.9">
              <polygon points="34,4 64,52 8,22 60,22 4,52" fill="none" stroke="#e0b028" strokeWidth="2.5" strokeLinejoin="round" />
            </g>
          </svg>
        </div>

        {/* Hero headline */}
        <h1 style={{
          fontFamily: "'Cormorant Upright', serif",
          fontSize: 'clamp(2.4rem, 7vw, 5.2rem)',
          fontWeight: 300,
          lineHeight: 1.05,
          textAlign: 'center',
          marginBottom: '1.25rem',
          animation: 'fadeUp 0.9s 0.2s ease-out both',
        }}>
          <span style={{ color: '#e0b028', fontWeight: 600 }}>The Witching Hour</span>
          <span style={{ color: '#f0d4c0' }}> is upon us.</span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: "'EB Garamond', serif",
          fontStyle: 'italic',
          fontSize: 'clamp(1rem, 2.2vw, 1.35rem)',
          color: '#b89080',
          marginBottom: '2.5rem',
          animation: 'fadeUp 0.9s 0.4s ease-out both',
        }}>
          For those who never stopped believing in magic.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.9s 0.6s ease-out both',
        }}>
          <Link href="/register" style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '0.85rem 2rem',
            background: '#c83818',
            color: '#f0d4c0',
            borderRadius: '2px',
            textDecoration: 'none',
            display: 'inline-block',
          }}>
            Enter the Circle
          </Link>
          <Link href="/login" style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '0.85rem 2rem',
            border: '1px solid #c83818',
            color: '#f0d4c0',
            borderRadius: '2px',
            textDecoration: 'none',
            display: 'inline-block',
            background: 'transparent',
          }}>
            I Already Belong
          </Link>
        </div>
      </main>

      {/* Show ribbon — full width, fixed to very bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: RIBBON_H,
        zIndex: 2,
        background: 'rgba(48,16,16,0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(200,56,24,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1.2rem',
        padding: '0 1rem',
      }}>
        {SHOWS.map((s) => (
          <span key={s.label} style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#b89080',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <span style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: s.color,
              flexShrink: 0,
              boxShadow: `0 0 4px ${s.color}80`,
              display: 'inline-block',
            }} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Candle clusters — fixed, bottom edge sits on top of ribbon */}
      {/* Left cluster */}
      <div style={{
        position: 'fixed',
        bottom: RIBBON_H,   /* base of candles aligns with top of ribbon */
        left: '2vw',
        zIndex: 3,
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <Candles variant="cream" indices={LEFT_INDICES} />
      </div>

      {/* Right cluster */}
      <div style={{
        position: 'fixed',
        bottom: RIBBON_H,
        right: '2vw',
        zIndex: 3,
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <Candles variant="cream" indices={RIGHT_INDICES} />
      </div>

      <style>{`
        @keyframes moonRise {
          from { opacity: 0; transform: translateY(16px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
        @media (max-width: 540px) {
          .twh-candles { display: none !important; }
        }
      `}</style>
    </>
  )
}
