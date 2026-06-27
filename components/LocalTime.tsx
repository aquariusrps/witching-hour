'use client'

import { useState, useEffect } from 'react'

const fmt = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export default function LocalTime({ iso, className }: { iso: string; className?: string }) {
  const [formatted, setFormatted] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormatted(fmt.format(new Date(iso)))
  }, [iso])

  if (!formatted) return null
  return (
    <time dateTime={iso} className={className}>
      {formatted}
    </time>
  )
}
