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

// When a thread has reply_order set, determines the name of the
// person who should post next after last_poster.
//
// Returns:
//   null      — reply_order not set, or can't determine next person,
//               or it's the caller's own turn (use deriveWhoseTurn)
//   string    — the name of the person who should post next
//               (from the reply_order list, as the operator typed it)
export function getWaitingOn(
  thread: {
    reply_order?: string | null
    last_poster?: string | null
    manual_whose_turn?: string | null
  },
  myCharacterName: string
): string | null {
  // Manual override takes priority — don't second-guess it
  if (thread.manual_whose_turn) return null

  // No reply_order set → freeform mode → no "waiting on" info
  if (!thread.reply_order?.trim()) return null

  // No last_poster → can't determine position in order
  if (!thread.last_poster?.trim()) return null

  // Parse the order list
  const order = thread.reply_order
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (order.length < 2) return null

  const lowerPoster = thread.last_poster.toLowerCase()

  // Find last poster in order (case-insensitive partial match)
  const posterIdx = order.findIndex(
    (name) =>
      lowerPoster.includes(name.toLowerCase()) ||
      name.toLowerCase().includes(lowerPoster)
  )

  // Last poster not found in order list → freeform fallback
  if (posterIdx === -1) return null

  // Next person in the cycle
  const nextIdx = (posterIdx + 1) % order.length
  const nextName = order[nextIdx]

  // If next person is the caller themselves → their turn, not "waiting on"
  const lowerMe = myCharacterName.toLowerCase()
  const lowerNext = nextName.toLowerCase()
  if (lowerNext.includes(lowerMe) || lowerMe.includes(lowerNext)) {
    return null // deriveWhoseTurn handles the 'mine' case
  }

  return nextName
}

export type ThreadDisplayState =
  | 'awaiting_start' // url is null — thread not yet started
  | 'due' // class thread, not yet submitted
  | 'submitted' // class thread, completed (archived)
  | 'mine' // RP: your turn
  | 'theirs' // RP: partner's turn (no specific name)
  | 'waiting' // RP: ordered thread, specific next person
  | 'unknown' // RP: cannot determine
  | 'upcoming' // planned thread, held on deck until activated

// Single source of truth for thread badge display state. Handles
// all thread types and states. Call this instead of deriveWhoseTurn()
// at display sites.
export function getThreadDisplayState(
  thread: {
    url?: string | null
    thread_type?: string | null
    completed_at?: string | null
    status?: string | null
    manual_whose_turn?: string | null
    last_poster?: string | null
    reply_order?: string | null
    partner_names?: string | null
    fetch_status?: string | null
  },
  characterName: string
): ThreadDisplayState {
  // 1. Upcoming — checked first, takes priority over url-null.
  // An upcoming thread with url=null must not appear as awaiting_start.
  if (thread.thread_type === 'upcoming') return 'upcoming'

  // 2. No URL — thread not yet started (any type)
  if (!thread.url?.trim()) return 'awaiting_start'

  // 3. Class thread
  if (thread.thread_type === 'class') {
    if (thread.completed_at) return 'submitted'
    return 'due'
  }

  // 4. RP thread — use existing logic
  const base = deriveWhoseTurn(
    {
      last_poster: thread.last_poster ?? null,
      fetch_status: thread.fetch_status ?? null,
      manual_whose_turn: thread.manual_whose_turn ?? null,
    },
    characterName
  )

  if (base === 'mine') {
    // Before concluding it's the caller's turn, check reply_order:
    // in a 3+ person thread a third party may have posted last,
    // making the next-in-cycle person someone other than the caller.
    const wo = getWaitingOn(thread, characterName)
    if (wo) return 'waiting'
    return 'mine'
  }

  if (base === 'theirs') {
    const wo = getWaitingOn(thread, characterName)
    return wo ? 'waiting' : 'theirs'
  }

  return 'unknown'
}

// Returns { className, label } for a given display state — the
// single source of truth for badge rendering across all four
// thread display surfaces.
export function getDisplayBadge(
  state: ThreadDisplayState,
  waitingOn?: string | null
): { className: string; label: string } {
  switch (state) {
    case 'awaiting_start':
      return {
        className: 'mojo-turn-badge mojo-turn-pending',
        label: 'Awaiting Starter',
      }
    case 'upcoming':
      return {
        className: 'mojo-turn-badge mojo-turn-upcoming',
        label: 'On Deck',
      }
    case 'due':
      return {
        className: 'mojo-turn-badge mojo-turn-pending',
        label: 'Due',
      }
    case 'submitted':
      return {
        className: 'mojo-turn-badge mojo-turn-unknown',
        label: 'Submitted',
      }
    case 'mine':
      return {
        className: 'mojo-turn-badge mojo-turn-mine',
        label: 'Your Turn',
      }
    case 'waiting':
      return {
        className: 'mojo-turn-badge mojo-turn-waiting',
        label: waitingOn ? `Waiting on ${waitingOn}` : 'Their Turn',
      }
    case 'theirs':
      return {
        className: 'mojo-turn-badge mojo-turn-theirs',
        label: 'Their Turn',
      }
    case 'unknown':
    default:
      return {
        className: 'mojo-turn-badge mojo-turn-unknown',
        label: 'Unknown',
      }
  }
}

// Single source of truth for thread sort priority across all four
// thread display surfaces. Lower number = higher priority (shown first).
export function getThreadStatePriority(state: ThreadDisplayState): number {
  switch (state) {
    case 'due':            return 0
    case 'mine':           return 1
    case 'awaiting_start': return 2
    case 'waiting':        return 3
    case 'theirs':         return 4
    case 'unknown':        return 5
    case 'upcoming':       return 6
    case 'submitted':      return 7
    default:               return 8
  }
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
