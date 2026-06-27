'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function PlayerSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [inputValue, setInputValue] = useState(initialQuery)

  const handleChange = useCallback(
    (value: string) => {
      setInputValue(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams()
        if (value.trim()) params.set('q', value.trim())
        router.push(`${pathname}?${params.toString()}`)
      }, 300)
    },
    [router, pathname]
  )

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search by display name…"
        style={{
          width: '100%',
          background: 'var(--raised)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 4,
          padding: '9px 14px',
          color: 'var(--roseash)',
          fontFamily: 'var(--f-body)',
          fontSize: '0.95rem',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
