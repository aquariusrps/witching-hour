import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMojoRpWithCharactersAndThreads, getMojoWanted } from '@/lib/db/mojo'
import MojoRpNotes from '@/app/mojo/components/MojoRpNotes'
import MojoAddCharacter from '@/app/mojo/components/MojoAddCharacter'
import MojoCharacterStatusToggle from '@/app/mojo/components/MojoCharacterStatusToggle'
import MojoWantedBoard from '@/app/mojo/components/MojoWantedBoard'

function FiligreeDivider() {
  return (
    <div style={{ height: 1, margin: '28px 0', background: 'linear-gradient(to right, var(--ember), var(--gold))', opacity: 0.4 }} />
  )
}

const STATUS_COLOR: Record<string, string> = {
  active: 'var(--moonstone)',
  hiatus: 'var(--gold-dim)',
  ended: 'var(--faded)',
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
    <div style={{ padding: '28px 32px 64px' }}>
      {/* Header */}
      <div style={{
        borderLeft: `4px solid ${rp.color_hex}`,
        paddingLeft: 16,
        marginBottom: 28,
        position: 'relative',
      }}>
        <Link
          href={`/mojo/rps/${rp.id}/edit`}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            fontFamily: 'var(--f-body)',
            fontSize: '0.8rem',
            color: 'var(--faded)',
            textDecoration: 'none',
          }}
        >
          Edit RP →
        </Link>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.75rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          {rp.name}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.88rem', color: 'var(--mist)', margin: 0 }}>
            {rp.site_url ? (
              <a href={rp.site_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                {rp.site_name}
              </a>
            ) : (
              rp.site_name
            )}
          </p>
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.62rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: STATUS_COLOR[rp.status] ?? 'var(--faded)',
          }}>
            {rp.status}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '45% 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Notes */}
        <MojoRpNotes
          rpId={rp.id}
          initialPlot={rp.notes_plot}
          initialPartners={rp.notes_partners}
          initialMisc={rp.notes_misc}
        />

        {/* Right: Characters + Threads */}
        <div>
          <MojoAddCharacter rpId={rp.id} />

          {orderedCharacters.length === 0 ? (
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)', margin: '0 0 28px' }}>
              No characters yet. Add one above.
            </p>
          ) : (
            <div style={{ marginBottom: 28 }}>
              {orderedCharacters.map((char, i) => {
                const isArchived = char.status === 'archived'
                const textColor = isArchived ? 'var(--faded)' : 'var(--roseash)'
                return (
                  <div
                    key={char.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: i < orderedCharacters.length - 1 ? '1px solid var(--elevated)' : undefined,
                    }}
                  >
                    <Link
                      href={`/mojo/characters/${char.id}`}
                      style={{ fontFamily: 'var(--f-head)', fontSize: '0.9rem', color: textColor, textDecoration: 'none' }}
                    >
                      · {char.name}
                      {isArchived && (
                        <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.62rem', color: 'var(--faded)', marginLeft: 6 }}>
                          [archived]
                        </span>
                      )}
                    </Link>
                    <MojoCharacterStatusToggle
                      characterId={char.id}
                      rpId={rp.id}
                      status={char.status === 'archived' ? 'archived' : 'active'}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Threads */}
          <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', margin: '0 0 4px' }}>
            All Threads in this RP
          </h3>
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--faded)', margin: '0 0 12px' }}>
            Across all characters — manage threads from each character&rsquo;s page.
          </p>

          {orderedThreads.length === 0 ? (
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
              No threads yet. Add threads from each character&rsquo;s page.
            </p>
          ) : (
            <div>
              {orderedThreads.map((thread, i) => (
                <div
                  key={thread.id}
                  style={{
                    padding: '8px 0',
                    borderBottom: i < orderedThreads.length - 1 ? '1px solid var(--elevated)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
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
                  {thread.partner_names && (
                    <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--mist)', margin: '2px 0 0' }}>
                      with {thread.partner_names}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <FiligreeDivider />

          <MojoWantedBoard
            rpId={rp.id}
            initialItems={wanted}
            characters={rp.characters.map((c) => ({ id: c.id, name: c.name, status: c.status }))}
          />
        </div>
      </div>
    </div>
  )
}
