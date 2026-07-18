import { getMojoAllThreads, getMojoRpsWithCharacters } from '@/lib/db/mojo'
import MojoThreadAutoRefresh from '@/app/mojo/components/MojoThreadAutoRefresh'
import MojoChronicleAddForm from '@/app/mojo/components/MojoChronicleAddForm'
import MojoPortraitCard from '@/app/mojo/components/MojoPortraitCard'
import {
  SvgGrimoire,
  SvgIvyColumn,
  SvgChronicleQuill,
  SvgCandleRealistic,
  SvgWaxSeal,
  SvgPageHeaderRule,
  SvgFiligreeRule,
  SvgScrollEnd,
} from '@/app/mojo/components/MojoSvgAssets'
import {
  getThreadDisplayState,
  getWaitingOn,
  getDisplayBadge,
  getThreadStatePriority,
  formatRelativeTime,
} from '@/lib/mojo/utils'

// A thread "owes a reply" when its computed display state is 'mine'
// (Your Turn badge) or 'due' (Due badge) — see getDisplayBadge() in
// lib/mojo/utils.ts for the state → label mapping (FIX-042).
type ThreadForOwedSort = Parameters<typeof getThreadDisplayState>[0] & {
  last_checked_at: string | null
}

function getOwedThreads<T extends ThreadForOwedSort>(
  threads: T[],
  characterName: string
): T[] {
  return threads.filter((t) => {
    const state = getThreadDisplayState(t, characterName)
    return state === 'mine' || state === 'due'
  })
}

// Oldest last_checked_at among a character's owed threads — a never-
// checked thread (null) counts as maximally overdue.
function earliestOwedTimestamp(threads: ThreadForOwedSort[]): number {
  return Math.min(
    ...threads.map((t) =>
      t.last_checked_at ? new Date(t.last_checked_at).getTime() : -Infinity
    )
  )
}

export default async function ChronicleThreadsPage() {
  // Auth: handled entirely by app/mojo/layout.tsx (getServerClient +
  // isSuperAdmin + redirect). No page-level auth check — matches
  // every other page under app/mojo/ (confirmed via faceclaims/page.tsx).

  const [allThreads, rps] = await Promise.all([
    getMojoAllThreads(),
    getMojoRpsWithCharacters(),
  ])

  // Flatten RP -> characters into selector options, carrying rp_id
  // (createMojoThread requires both rp_id and character_id).
  const characterOptions = rps.flatMap((rp) =>
    rp.characters.map((c) => ({
      id: c.id,
      name: c.name,
      rp_id: rp.id,
      rp_name: rp.name,
      status: c.status,
    }))
  )

  // Split by status
  const activeThreads = allThreads.filter((t) => t.status === 'active')
  const archivedThreads = allThreads.filter((t) => t.status !== 'active')

  // Group active threads by character
  const groupMap = new Map<string, {
    characterId: string
    characterName: string
    rpName: string
    rpColorHex: string
    avatarToken: string | null
    threads: typeof activeThreads
  }>()

  for (const thread of activeThreads) {
    const charId = thread.character_id
    if (!groupMap.has(charId)) {
      groupMap.set(charId, {
        characterId: charId,
        characterName: thread.character_name ?? 'Unknown',
        rpName: thread.rp_name ?? '',
        rpColorHex: thread.rp_color_hex ?? '#a02840',
        // First thread in group carries the character's avatar token
        // (all threads in a group have the same character_id).
        avatarToken: thread.character_avatar_token ?? null,
        threads: [],
      })
    }
    groupMap.get(charId)!.threads.push(thread)
  }

  const groups = Array.from(groupMap.values())

  // Sort threads within each group by state priority (DUE first,
  // AWAITING STARTER last)
  for (const group of groups) {
    group.threads.sort((a, b) =>
      getThreadStatePriority(getThreadDisplayState(a, group.characterName)) -
      getThreadStatePriority(getThreadDisplayState(b, group.characterName))
    )
  }

  // Sort character cards by owed-reply urgency (FIX-042):
  //   1. Owed count (YOUR TURN + DUE threads) descending — more owed first
  //   2. Among ties, earliest last_checked_at among owed threads ascending
  //      — the most overdue owed thread sorts its character first
  //   3. Among remaining ties, character name ascending (case-insensitive)
  groups.sort((a, b) => {
    const aOwed = getOwedThreads(a.threads, a.characterName)
    const bOwed = getOwedThreads(b.threads, b.characterName)

    if (aOwed.length !== bOwed.length) {
      return bOwed.length - aOwed.length
    }

    if (aOwed.length > 0) {
      const aEarliest = earliestOwedTimestamp(aOwed)
      const bEarliest = earliestOwedTimestamp(bOwed)
      if (aEarliest !== bEarliest) {
        return aEarliest - bEarliest
      }
    }

    return a.characterName.toLowerCase().localeCompare(b.characterName.toLowerCase())
  })

  return (
    <div className="mojo-chronicle-page">

      {/* ── AUTO-REFRESH ── */}
      <MojoThreadAutoRefresh
        threads={activeThreads.map((t) => ({
          id: t.id,
          last_checked_at: t.last_checked_at,
          fetch_status: t.fetch_status,
          url: t.url,
        }))}
      />

      {/* ── THE GRIMOIRE HEADER ── */}
      <div style={{ marginBottom: '24px' }}>

        {/* Grimoire illustration — full width */}
        <div style={{ marginBottom: '0' }}>
          <SvgGrimoire idSuffix="chronicle-header" />
        </div>

        {/* Page title */}
        <div style={{ marginTop: '20px', marginBottom: '6px' }}>
          <h1 style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: '38px',
            fontWeight: 600,
            color: 'var(--roseash)',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
            The Grimoire
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 16px',
        }}>
          Every thread, every word. The record is kept.
        </p>

        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>

      </div>

      {/* Content zone with ivy flanking */}
      <div style={{ position: 'relative' }}>

        {/* Left ivy column */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-28px',
            top: '0',
            bottom: '0',
            width: '24px',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <SvgIvyColumn
            height={9999}
            flip={false}
            idSuffix="chr-ivy-l"
          />
        </div>

        {/* Right ivy column */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-28px',
            top: '0',
            bottom: '0',
            width: '24px',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <SvgIvyColumn
            height={9999}
            flip={true}
            idSuffix="chr-ivy-r"
          />
        </div>

      {/* ════ ZONE 2: ADD NEW ENTRY ════ */}
      <div style={{ marginTop: '24px' }}>
        <MojoChronicleAddForm characters={characterOptions} />
      </div>

      {/* ════ ZONE 3: ACTIVE THREADS ════ */}
      <div>
        {/* Candle heading */}
        <div
          className="mojo-chronicle-section-heading mojo-corr-heading"
          style={{ justifyContent: 'center' }}
        >
          <div aria-hidden="true">
            <SvgCandleRealistic height={72} idSuffix="chron-left" flameDelay="0s" />
          </div>
          <h2>Active Correspondences</h2>
          <div aria-hidden="true">
            <SvgCandleRealistic height={72} idSuffix="chron-right" flameDelay="0.35s" />
          </div>
        </div>

        {groups.length === 0 ? (
          <p style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '16px',
            fontStyle: 'italic',
            color: 'var(--faded)',
            textAlign: 'center',
            padding: '32px 0',
          }}>
            No active threads. Begin a new entry above.
          </p>
        ) : (
          <div className="mojo-corr-container">
          <div className="mojo-corr-grid">
          {groups.map((group) => {
            const activeGroupThreads = group.threads.filter((t) =>
              getThreadDisplayState(t, group.characterName) !== 'upcoming'
            )
            const onDeckThreads = group.threads.filter((t) =>
              getThreadDisplayState(t, group.characterName) === 'upcoming'
            )

            return (
            <div key={group.characterId} className="mojo-corr-card">

              {/* TOP BAR — character name + RP name, full width */}
              <div className="mojo-corr-card-header">
                <div className="mojo-corr-card-char-name">
                  {group.characterName}
                </div>
                {group.rpName && (
                  <div className="mojo-corr-card-rp-name">
                    {group.rpName}
                  </div>
                )}
              </div>

              <div className="mojo-corr-card-body">

              {/* LEFT COLUMN — portrait only, 250x400 (5:8) presentation.
                  Page-local wrapper overrides the effective aspect ratio
                  for this card only — MojoPortraitCard and the shared
                  3:5 .mojo-portrait-frame rule are untouched (FIX-041). */}
              <div className="mojo-corr-card-left">
                <div
                  style={{
                    width: '100%',
                    height: '400px',
                    aspectRatio: '5 / 8',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MojoPortraitCard
                    token={group.avatarToken}
                    alt={group.characterName}
                    size="lg"
                    showFrame={false}
                    idSuffix={`chr-card-${group.characterId}`}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN — thread list */}
              <div className="mojo-corr-card-right">
                {activeGroupThreads.map((thread, i) => {
                  const state = getThreadDisplayState(thread, group.characterName)
                  const waitingOn = state === 'waiting' ? getWaitingOn(thread, group.characterName) : null
                  const { className: badgeClass, label: badgeLabel } = getDisplayBadge(state, waitingOn)

                  return (
                    <div
                      key={thread.id}
                      className="mojo-thread-card"
                      style={{
                        padding: '10px 16px',
                        borderBottom: i < activeGroupThreads.length - 1
                          ? '1px solid rgba(255,255,255,0.04)'
                          : 'none',
                        background: state === 'mine'
                          ? 'rgba(139,26,26,0.06)'
                          : 'transparent',
                      }}
                    >
                      {/* Row 1 — title (left, wraps) + badge (right) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '4px',
                      }}>
                        {thread.url ? (
                          <a
                            href={thread.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: 'Playfair Display, serif',
                              fontSize: '15px',
                              color: 'var(--roseash)',
                              textDecoration: 'none',
                              flex: '1 1 auto',
                              minWidth: 0,
                              overflowWrap: 'break-word',
                            }}
                          >
                            {thread.title}
                          </a>
                        ) : (
                          <span style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '15px',
                            color: 'var(--mist)',
                            flex: '1 1 auto',
                            minWidth: 0,
                            overflowWrap: 'break-word',
                          }}>
                            {thread.title}
                          </span>
                        )}
                        <span className={badgeClass} style={{ flexShrink: 0 }}>
                          {badgeLabel}
                        </span>
                      </div>

                      {/* Row 2 — partner/last-poster info (left) + timestamp (right) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}>
                          {thread.partner_names && (
                            <span style={{
                              fontFamily: 'EB Garamond, serif',
                              fontSize: '13px',
                              fontStyle: 'italic',
                              color: 'var(--mist)',
                            }}>
                              with {thread.partner_names}
                            </span>
                          )}
                          {thread.last_poster && (
                            <span style={{
                              fontFamily: 'Cinzel, serif',
                              fontSize: '9px',
                              letterSpacing: '0.10em',
                              color: 'var(--faded)',
                            }}>
                              ↳ {thread.last_poster}
                            </span>
                          )}
                        </div>
                        {thread.last_checked_at && (
                          <span style={{
                            fontFamily: 'Cinzel, serif',
                            fontSize: '8px',
                            color: 'var(--faded)',
                            opacity: 0.6,
                          }}>
                            {formatRelativeTime(thread.last_checked_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* On Deck divider — only when both arrays non-empty */}
                {activeGroupThreads.length > 0 && onDeckThreads.length > 0 && (
                  <div className="mojo-corr-on-deck-divider">
                    On Deck
                  </div>
                )}

                {/* Upcoming/on-deck threads — slightly muted, neutral (no scrape data) */}
                <div className={onDeckThreads.length > 0 ? 'mojo-corr-upcoming' : undefined}>
                {onDeckThreads.map((thread, i) => {
                  const state = getThreadDisplayState(thread, group.characterName)
                  const { className: badgeClass, label: badgeLabel } = getDisplayBadge(state)

                  return (
                    <div
                      key={thread.id}
                      className="mojo-thread-card"
                      style={{
                        opacity: 0.70,
                        padding: '8px 16px',
                        borderBottom: i < onDeckThreads.length - 1
                          ? '1px solid rgba(255,255,255,0.03)'
                          : 'none',
                      }}
                    >
                      {/* Row 1 — title (left, wraps) + badge (right) */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: thread.partner_names ? '4px' : 0,
                      }}>
                        {thread.url ? (
                          <a
                            href={thread.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: 'Playfair Display, serif',
                              fontSize: '15px',
                              color: 'var(--roseash)',
                              textDecoration: 'none',
                              flex: '1 1 auto',
                              minWidth: 0,
                            }}
                          >
                            {thread.title}
                          </a>
                        ) : (
                          <span style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '15px',
                            color: 'var(--mist)',
                            flex: '1 1 auto',
                            minWidth: 0,
                          }}>
                            {thread.title}
                          </span>
                        )}
                        <span className={badgeClass} style={{ flexShrink: 0 }}>
                          {badgeLabel}
                        </span>
                      </div>

                      {/* Row 2 — partner info (left); no last_checked_at, upcoming threads aren't scraped */}
                      {thread.partner_names && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}>
                          <span style={{
                            fontFamily: 'EB Garamond, serif',
                            fontSize: '13px',
                            fontStyle: 'italic',
                            color: 'var(--mist)',
                          }}>
                            with {thread.partner_names}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
                </div>
              </div>

              </div>
            </div>
            )
          })}
          </div>
          </div>
        )}
      </div>

      {/* Separator before archive */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        margin: '40px 0 8px',
        opacity: 0.45,
      }} aria-hidden="true">
        <div style={{ flex: 1, color: 'var(--elevated)' }}>
          <SvgFiligreeRule />
        </div>
      </div>

      {/* ════ ZONE 4: CLOSED THREADS ════ */}
      <div className="mojo-chronicle-archive">

        {/* Archive heading */}
        <div className="mojo-chronicle-archive-heading">
          <SvgWaxSeal size={28} idSuffix="arch-l" />
          <div className="mojo-chronicle-section-rule" />
          <h2 style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--faded)',
            margin: '0 12px',
            flexShrink: 0,
          }}>
            Closed Correspondence
          </h2>
          <div
            className="mojo-chronicle-section-rule"
            style={{ background: 'linear-gradient(90deg, transparent, var(--elevated))' }}
          />
          <SvgWaxSeal size={28} idSuffix="arch-r" />
        </div>

        {archivedThreads.length === 0 ? (
          <p style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '14px',
            fontStyle: 'italic',
            color: 'var(--faded)',
            textAlign: 'center',
            padding: '16px 0',
          }}>
            No closed threads yet.
          </p>
        ) : (
          archivedThreads.map((thread) => (
            <div key={thread.id} className="mojo-thread-archived-card">
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div className="mojo-thread-archived-title">
                    {thread.title}
                  </div>
                  <div className="mojo-thread-archived-meta">
                    {thread.character_name}
                    {thread.partner_names ? ` · with ${thread.partner_names}` : ''}
                    {thread.rp_name ? ` · ${thread.rp_name}` : ''}
                  </div>
                </div>
                {thread.last_checked_at && (
                  <span className="mojo-thread-archived-meta" style={{ flexShrink: 0 }}>
                    {formatRelativeTime(thread.last_checked_at)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {/* End of chronicle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '28px',
          opacity: 0.4,
        }} aria-hidden="true">
          <SvgChronicleQuill />
        </div>
        <div style={{ color: 'var(--elevated)', marginTop: '8px', opacity: 0.35 }}>
          <SvgScrollEnd flip={false} />
        </div>
      </div>

      </div>

    </div>
  )
}
