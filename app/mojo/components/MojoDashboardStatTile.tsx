'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MojoDashboardStatTile({
  href,
  value,
  label,
}: {
  href: string
  value: number
  label: string
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
        background: hover ? 'var(--raised)' : 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderRadius: 4,
        padding: 16,
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <p style={{ fontFamily: 'var(--f-display)', fontSize: '1.75rem', color: 'var(--gold)', margin: '0 0 4px' }}>
        {value}
      </p>
      <p style={{
        fontFamily: 'var(--f-ui)',
        fontSize: '0.68rem',
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
