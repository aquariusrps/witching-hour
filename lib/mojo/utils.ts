// Client-safe utilities — no Node.js APIs, no process.env access,
// no server-only imports. Safe to import in Server or Client Components.
//
// deriveWhoseTurn and detectPlatformClient intentionally mirror logic
// also present in lib/mojo/thread-fetchers.ts (a server module that
// cannot be imported from Client Components). Keep both in sync if the
// derivation logic changes.

export function deriveWhoseTurn(
  thread: {
    last_poster: string | null
    fetch_status: string | null
    manual_whose_turn: string | null
  },
  characterName: string
): 'mine' | 'theirs' | 'unknown' {
  if (thread.manual_whose_turn === 'mine') return 'mine'
  if (thread.manual_whose_turn === 'theirs') return 'theirs'

  const unresolvable = ['uncertain', 'failed', 'unsupported', 'pending', null, '']
  if (!thread.fetch_status || unresolvable.includes(thread.fetch_status)) {
    return 'unknown'
  }

  if (!thread.last_poster) return 'unknown'

  const posterLower = thread.last_poster.toLowerCase().trim()
  const charLower = characterName.toLowerCase().trim()

  // last poster is my character → I replied last → their turn now
  if (posterLower === charLower) return 'theirs'
  return 'mine'
}

export function detectPlatformClient(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    if (hostname.includes('tumblr.com')) return 'tumblr'
    if (hostname.endsWith('.jcink.net') || hostname.endsWith('.jcink.com')) return 'jcink'
    return 'generic'
  } catch {
    return 'unknown'
  }
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
