'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STALE_THRESHOLD_MS = 15 * 60 * 1000 // 15 minutes

// Statuses that indicate the last fetch attempt was inconclusive —
// these should never be protected by the 15-minute cooldown, since
// there is no good data to protect. Only 'unsupported' (structural,
// won't work regardless of retry) and 'success' are throttled.
const RETRY_IMMEDIATELY = ['failed', 'uncertain', 'pending', null, '']

function isStale(lastCheckedAt: string | null | undefined): boolean {
  if (!lastCheckedAt) return true
  return Date.now() - new Date(lastCheckedAt).getTime() > STALE_THRESHOLD_MS
}

export default function MojoThreadAutoRefresh({
  threads,
}: {
  threads: Array<{
    id: string
    last_checked_at: string | null
    fetch_status?: string | null
    url?: string | null
  }>
}) {
  const router = useRouter()

  useEffect(() => {
    const stale = threads.filter(
      (t) =>
        t.url &&
        t.fetch_status !== 'unsupported' &&
        (RETRY_IMMEDIATELY.includes(t.fetch_status ?? null) || isStale(t.last_checked_at))
    )

    if (stale.length === 0) return

    const refreshAll = async () => {
      await Promise.allSettled(
        stale.map((t) =>
          fetch('/api/mojo/refresh-thread', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId: t.id }),
          }).catch(() => {})
        )
      )
      router.refresh()
    }

    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
