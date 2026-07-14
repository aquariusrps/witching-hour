import { getMojoAllThreads, getMojoRpsWithCharacters } from '@/lib/db/mojo'
import MojoThreadAutoRefresh from '@/app/mojo/components/MojoThreadAutoRefresh'
import MojoChronicleAddForm from '@/app/mojo/components/MojoChronicleAddForm'
import MojoPortraitCard from '@/app/mojo/components/MojoPortraitCard'
import {
  SvgOpenLedger,
  SvgChronicleQuill,
  SvgCandleRealistic,
  SvgWaxSeal,
  SvgPageHeaderRule,
  SvgFiligreeRule,
  SvgScrollEnd,
} from '@/app/mojo/components/MojoSvgAssets'
import {
  deriveWhoseTurn,
  getWaitingOn,
  formatRelativeTime,
} from '@/lib/mojo/utils'

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
        threads: [],
      })
    }
    groupMap.get(charId)!.threads.push(thread)
  }

  const groups = Array.from(groupMap.values())
    // Sort: characters with YOUR TURN threads first
    .sort((a, b) => {
      const aMine = a.threads.some((t) => deriveWhoseTurn(t, a.characterName) === 'mine')
      const bMine = b.threads.some((t) => deriveWhoseTurn(t, b.characterName) === 'mine')
      return (bMine ? 1 : 0) - (aMine ? 1 : 0)
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

      {/* ════ ZONE 1: HEADER ════ */}
      <div className="mojo-chronicle-header">
        <div aria-hidden="true" style={{ marginBottom: '20px' }}>
          <SvgOpenLedger />
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '44px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 6px',
          letterSpacing: '0.02em',
        }}>
          The Chronicle
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '17px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 16px',
        }}>
          Every thread. Every story. Every word owed.
        </p>
        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      {/* ════ ZONE 2: ADD NEW ENTRY ════ */}
      <div style={{ marginTop: '24px' }}>
        <MojoChronicleAddForm characters={characterOptions} />
      </div>

      {/* ════ ZONE 3: ACTIVE THREADS ════ */}
      <div>
        {/* Candle heading */}
        <div className="mojo-chronicle-section-heading">
          <div aria-hidden="true">
            <SvgCandleRealistic height={72} idSuffix="chron-left" flameDelay="0s" />
          </div>
          <h2>Active Correspondence</h2>
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
          groups.map((group) => (
            <div key={group.characterId} className="mojo-thread-group">

              {/* Character group header */}
              <div
                className="mojo-thread-group-header"
                style={{ borderLeft: `3px solid ${group.rpColorHex}` }}
              >
                <MojoPortraitCard
                  token={null}
                  alt={group.characterName}
                  size="sm"
                  showFrame={false}
                  idSuffix={`chron-${group.characterId}`}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mojo-thread-group-name">
                    {group.characterName}
                  </div>
                  {group.rpName && (
                    <div className="mojo-thread-group-rp">
                      {group.rpName}
                    </div>
                  )}
                </div>
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  color: 'var(--faded)',
                  flexShrink: 0,
                }}>
                  {group.threads.length}{' '}
                  {group.threads.length === 1 ? 'thread' : 'threads'}
                </span>
              </div>

              {/* Thread cards */}
              <div className="mojo-thread-group-body">
                {group.threads.map((thread, i) => {
                  const turn = deriveWhoseTurn(thread, group.characterName)
                  const waitingOn = getWaitingOn(thread, group.characterName)

                  const badgeClass = [
                    'mojo-turn-badge',
                    turn === 'mine' ? 'mojo-turn-mine' :
                    turn === 'theirs' && waitingOn ? 'mojo-turn-waiting' :
                    turn === 'theirs' ? 'mojo-turn-theirs' :
                    'mojo-turn-unknown',
                  ].filter(Boolean).join(' ')

                  const badgeLabel =
                    turn === 'mine' ? 'Your Turn' :
                    turn === 'theirs' && waitingOn ? `Waiting on ${waitingOn}` :
                    turn === 'theirs' ? 'Their Turn' :
                    'Unknown'

                  return (
                    <div
                      key={thread.id}
                      className="mojo-thread-card"
                      style={{
                        padding: '12px 16px',
                        borderBottom: i < group.threads.length - 1
                          ? '1px solid rgba(255,255,255,0.04)'
                          : 'none',
                        background: turn === 'mine'
                          ? 'rgba(139,26,26,0.06)'
                          : 'transparent',
                      }}
                    >
                      {/* Title row + badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '6px',
                        flexWrap: 'wrap',
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
                            }}
                          >
                            {thread.title}
                          </a>
                        ) : (
                          <span style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '15px',
                            color: 'var(--mist)',
                          }}>
                            {thread.title}
                          </span>
                        )}
                        <span className={badgeClass}>
                          {badgeLabel}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
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
                        {thread.last_checked_at && (
                          <span style={{
                            fontFamily: 'Cinzel, serif',
                            fontSize: '8px',
                            color: 'var(--faded)',
                            opacity: 0.6,
                            marginLeft: 'auto',
                          }}>
                            {formatRelativeTime(thread.last_checked_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
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
  )
}
