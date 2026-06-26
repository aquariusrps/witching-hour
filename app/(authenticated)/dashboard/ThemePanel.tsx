'use client'

import { useState } from 'react'
import { updateTheme } from '@/lib/actions/settings'

const THEMES = [
  { key: 'blood-moon',           name: 'Blood Moon',           swatch: 'var(--swatch-blood-moon)' },
  { key: 'silver-onyx',          name: 'Silver & Onyx',        swatch: 'var(--swatch-silver-onyx)' },
  { key: 'midnight-garden',      name: 'Midnight Garden',      swatch: 'var(--swatch-midnight-garden)' },
  { key: 'crimson-athenaeum',    name: 'Crimson Athenaeum',    swatch: 'var(--swatch-crimson-athenaeum)' },
  { key: 'blackthorn-parchment', name: 'Blackthorn & Parchment', swatch: 'var(--swatch-blackthorn-parchment)' },
  { key: 'the-craft-1996',       name: 'The Craft 1996',       swatch: 'var(--swatch-the-craft-1996)' },
]

export default function ThemePanel({ currentTheme }: { currentTheme: string }) {
  const [activeTheme, setActiveTheme] = useState(currentTheme)

  async function handleThemeClick(key: string) {
    setActiveTheme(key)
    document.querySelector('[data-theme]')?.setAttribute('data-theme', key)
    await updateTheme(key)
  }

  const activeEntry = THEMES.find(t => t.key === activeTheme)

  return (
    <>
      <div style={{ display: 'flex', gap: 6, padding: '10px 14px 6px', flexWrap: 'wrap' }}>
        {THEMES.map(({ key, name, swatch }) => (
          <button
            key={key}
            title={name}
            onClick={() => handleThemeClick(key)}
            aria-pressed={activeTheme === key}
            style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--r-xs)',
              background: swatch,
              border: activeTheme === key
                ? '2px solid var(--ember)'
                : '1px solid var(--border-mid)',
              transform: activeTheme === key ? 'scale(1.12)' : undefined,
              cursor: 'pointer',
              transition: 'transform 0.15s, border-color 0.15s',
              padding: 0,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <p style={{
        fontFamily: 'var(--f-body)',
        fontStyle: 'italic',
        fontSize: '0.72rem',
        color: 'var(--faded)',
        padding: '0 14px 10px',
        margin: 0,
      }}>
        {activeEntry?.name ?? 'Blood Moon'} · active
      </p>
    </>
  )
}
