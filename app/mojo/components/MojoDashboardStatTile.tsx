'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MojoDashboardStatTile({
  href,
  value,
  label,
  watermark,
}: {
  href: string
  value: number
  label: string
  watermark?: string
}) {
  const [hover, setHover] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        display: 'block',
        position: 'relative',
        background: hover ? 'var(--raised)' : 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderRadius: 4,
        padding: '10px 14px',
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      {watermark && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '6px',
            fontSize: '28px',
            lineHeight: 1,
            color: 'var(--roseash)',
            opacity: 0.07,
            fontFamily: 'serif',
            transform: 'rotate(-8deg)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {watermark}
        </span>
      )}
      <p style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', color: 'var(--gold)', margin: '0 0 2px' }}>
        {value}
      </p>
      <p style={{
        fontFamily: 'var(--f-ui)',
        fontSize: '0.625rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--mist)',
        margin: 0,
      }}>
        {label}
      </p>
    </Link>
  )
}
