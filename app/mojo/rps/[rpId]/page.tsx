import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMojoRpWithCharactersAndThreads, getMojoWanted } from '@/lib/db/mojo'
import MojoRpNotePanel from '@/app/mojo/components/MojoRpNotePanel'
import MojoAddCharacter from '@/app/mojo/components/MojoAddCharacter'
import MojoCharacterStatusToggle from '@/app/mojo/components/MojoCharacterStatusToggle'
import MojoWantedBoard from '@/app/mojo/components/MojoWantedBoard'
import MojoPortraitCard from '@/app/mojo/components/MojoPortraitCard'
import MojoThreadAutoRefresh from '@/app/mojo/components/MojoThreadAutoRefresh'
import {
  SvgCandleRealistic, SvgParchmentEdge,
  SvgPageHeaderRule, SvgFiligreeRule, SvgCornerBracket,
} from '@/app/mojo/components/MojoSvgAssets'
import { deriveWhoseTurn, getWaitingOn } from '@/lib/mojo/utils'

const STATUS_COLOR: Record<string, string> = {
  active: 'var(--moonstone)',
  hiatus: 'var(--gold-dim)',
  ended: 'var(--faded)',
}

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'Cinzel, serif',
  fontSize: '10px',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
}

export default async function MojoRpDetailPage({
  params,
}: {
  params: Promise<{ rpId: string }>
}) {
  const { rpId } = await params
  const rp = await getMojoRpWithCharactersAndThreads(rpId)
  if (!rp) notFound()

  const wanted = await getMojoWanted(rpId)

  const activeCharacters = rp.characters.filter((c) => c.status === 'active')
  const archivedCharacters = rp.characters.filter((c) => c.status !== 'active')
  const orderedCharacters = [...activeCharacters, ...archivedCharacters]

  const activeThreads = rp.threads.filter((t) => t.status === 'active')
  const archivedThreads = rp.threads.filter((t) => t.status !== 'active')
  const orderedThreads = [...activeThreads, ...archivedThreads]

  return (
    <div style={{ padding: '28px 32px 64px', position: 'relative', zIndex: 1 }}>
      <MojoThreadAutoRefresh
        threads={rp.threads.map((t) => ({
          id: t.id,
          last_checked_at: t.last_checked_at,
          fetch_status: t.fetch_status,
          url: t.url,
        }))}
      />

      {/* ════ ZONE 1: RP HEADER ════ */}
      <div
        className="mojo-rp-banner"
        style={{
          marginBottom: '24px',
          padding: '20px 24px 16px',
          background: `
            linear-gradient(180deg,
              rgba(0,0,0,0.0) 0%,
              rgba(0,0,0,0.4) 100%),
            var(--raised)
          `,
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '4px',
        }}
      >
        {/* Color accent bar at top using rp.color_hex */}
        <div
          className="mojo-rp-banner-bar"
          style={{ background: rp.color_hex }}
          aria-hidden="true"
        />

        {/* Corner brackets in rp.color_hex */}
        <SvgCornerBracket size={16} color={rp.color_hex} rotation={0}
          style={{ position: 'absolute', top: 3, left: 0, opacity: 0.7, pointerEvents: 'none' }} />
        <SvgCornerBracket size={16} color={rp.color_hex} rotation={90}
          style={{ position: 'absolute', top: 3, right: 0, opacity: 0.7, pointerEvents: 'none' }} />
        <SvgCornerBracket size={16} color={rp.color_hex} rotation={270}
          style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.7, pointerEvents: 'none' }} />
        <SvgCornerBracket size={16} color={rp.color_hex} rotation={180}
          style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.7, pointerEvents: 'none' }} />

        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '36px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 4px',
          letterSpacing: '0.02em',
        }}>
          {rp.name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          {rp.site_name && (
            <span style={{ fontFamily: 'EB Garamond, serif', fontSize: '14px', fontStyle: 'italic', color: 'var(--mist)' }}>
              {rp.site_url ? (
                <a href={rp.site_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                  {rp.site_name}
                </a>
              ) : (
                rp.site_name
              )}
            </span>
          )}
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: STATUS_COLOR[rp.status] ?? 'var(--faded)',
            border: '1px solid var(--elevated)',
            padding: '1px 8px',
            borderRadius: '2px',
          }}>
            {rp.status}
          </span>
          <Link
            href={`/mojo/rps/${rp.id}/edit`}
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: 'var(--faded)',
              textDecoration: 'none',
              marginLeft: 'auto',
            }}
          >
            Edit →
          </Link>
        </div>

        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      {/* ════ ZONE 2: CHARACTER PORTRAIT SPREAD ════ */}
      <div style={{ marginBottom: '32px' }}>
        <MojoAddCharacter rpId={rp.id} />

        {orderedCharacters.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
            No characters yet. Add one above.
          </p>
        ) : (
          <>
            <div className="mojo-character-spread">
              {orderedCharacters.map((char) => (
                <div key={char.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                }}>
                  <Link href={`/mojo/characters/${char.id}`} style={{ textDecoration: 'none' }}>
                    <MojoPortraitCard
                      token={char.avatar_token}
                      alt={char.name}
                      size="sm"
                      idSuffix={`rp-char-${char.id}`}
                    />
                  </Link>
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    color: char.status === 'archived' ? 'var(--faded)' : 'var(--roseash)',
                    textAlign: 'center',
                    maxWidth: '110px',
                  }}>
                    {char.name}
                  </span>
                  {char.status === 'archived' && (
                    <span style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '8px',
                      letterSpacing: '0.12em',
                      color: 'var(--faded)',
                      border: '1px solid var(--elevated)',
                      padding: '0px 5px',
                      borderRadius: '1px',
                    }}>
                      ARCHIVED
                    </span>
                  )}
                  <MojoCharacterStatusToggle
                    characterId={char.id}
                    rpId={rp.id}
                    status={char.status === 'archived' ? 'archived' : 'active'}
                  />
                </div>
              ))}
            </div>
            <div style={{ color: 'var(--elevated)', marginTop: '8px', opacity: 0.5 }}>
              <SvgFiligreeRule />
            </div>
          </>
        )}
      </div>

      {/* ════ ZONE 3: TWO-COLUMN ════ */}
      <div className="mojo-rp-columns" style={{ marginBottom: '32px' }}>

        {/* LEFT: Threads */}
        <div>
          <div className="mojo-candle-heading" aria-labelledby="threads-heading">
            <div aria-hidden="true">
              <SvgCandleRealistic height={80} idSuffix="thread-left" flameDelay="0s" />
            </div>
            <h2 id="threads-heading">Correspondence</h2>
            <div aria-hidden="true">
              <SvgCandleRealistic height={80} idSuffix="thread-right" flameDelay="0.35s" />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <SvgParchmentEdge />

            {orderedThreads.length === 0 ? (
              <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
                No threads yet. Add threads from each character&rsquo;s page.
              </p>
            ) : (
              orderedThreads.map((thread) => {
                const whoseTurn = deriveWhoseTurn(thread, thread.character_name)
                const waitingOn = getWaitingOn(thread, thread.character_name)
                const turnClass = [
                  'mojo-turn-badge',
                  whoseTurn === 'mine' ? 'mojo-turn-mine' :
                  whoseTurn === 'theirs' && waitingOn ? 'mojo-turn-waiting' :
                  whoseTurn === 'theirs' ? 'mojo-turn-theirs' :
                  'mojo-turn-unknown',
                ].filter(Boolean).join(' ')
                const turnLabel =
                  whoseTurn === 'mine' ? 'Your Turn' :
                  whoseTurn === 'theirs' && waitingOn ? `Waiting on ${waitingOn}` :
                  whoseTurn === 'theirs' ? 'Their Turn' :
                  'Unknown'
                return (
                  <div key={thread.id} className="mojo-thread-card" style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.62rem', color: 'var(--gold-dim)', flexShrink: 0 }}>
                          as {thread.character_name}
                        </span>
                        {thread.url ? (
                          <a
                            href={thread.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: 'var(--f-body)',
                              fontSize: '0.88rem',
                              color: 'var(--roseash)',
                              textDecoration: 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {thread.title}
                          </a>
                        ) : (
                          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.88rem', color: 'var(--roseash)' }}>
                            {thread.title}
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontFamily: 'var(--f-ui)',
                        fontSize: '0.6rem',
                        letterSpacing: '0.06em',
                        color: thread.status === 'active' ? 'var(--moonstone)' : 'var(--faded)',
                        flexShrink: 0,
                      }}>
                        {thread.status === 'active' ? 'ACTIVE' : 'ARCHIVED'}
                      </span>
                    </div>

                    <span className={turnClass} style={{ fontSize: '0.6rem', padding: '2px 8px', marginTop: 6 }}>
                      {turnLabel}
                    </span>

                    {thread.partner_names && (
                      <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--mist)', margin: '4px 0 0' }}>
                        with {thread.partner_names}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* RIGHT: Notes */}
        <div className="mojo-rp-side-panel">
          <MojoRpNotePanel
            rpId={rp.id}
            label="Plot Threads"
            field="notes_plot"
            initialValue={rp.notes_plot}
          />
          <MojoRpNotePanel
            rpId={rp.id}
            label="Partner Info"
            field="notes_partners"
            initialValue={rp.notes_partners}
          />
          <MojoRpNotePanel
            rpId={rp.id}
            label="Misc Notes"
            field="notes_misc"
            initialValue={rp.notes_misc}
          />
        </div>
      </div>

      {/* ════ ZONE 4: WANTED / CONNECTIONS BOARD ════ */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={SECTION_LABEL_STYLE}>
            Connections
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--elevated)', opacity: 0.5 }} />
        </div>
        <MojoWantedBoard
          rpId={rp.id}
          initialItems={wanted}
          characters={rp.characters.map((c) => ({ id: c.id, name: c.name, status: c.status }))}
        />
      </div>

    </div>
  )
}
