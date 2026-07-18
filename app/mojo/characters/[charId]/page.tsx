import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getMojoCharacter,
  getMojoCharacterThreads,
  getMojoFaceclaims,
  getMojoCharacterResources,
  getMojoFaceclaimResources,
  getMojoImageStacks,
  getMojoAvatars,
  getMojoGradeSubmissions,
} from '@/lib/db/mojo'
import MojoCharacterArchiveToggle from '@/app/mojo/components/MojoCharacterArchiveToggle'
import MojoFaceclaimAssign from '@/app/mojo/components/MojoFaceclaimAssign'
import MojoCharacterAvatarStrip from '@/app/mojo/components/MojoCharacterAvatarStrip'
import MojoPortraitCard from '@/app/mojo/components/MojoPortraitCard'
import MojoCharacterNotes from '@/app/mojo/components/MojoCharacterNotes'
import MojoThreadTracker from '@/app/mojo/components/MojoThreadTracker'
import MojoResourcesTab from '@/app/mojo/components/MojoResourcesTab'
import MojoThreadAutoRefresh from '@/app/mojo/components/MojoThreadAutoRefresh'
import MojoGradeModal from '@/app/mojo/components/MojoGradeModal'
import {
  SvgIvyBorder, SvgDossierQuill, SvgOpenBook,
  SvgCandleRealistic, SvgWaxSeal, SvgScrollEnd,
  SvgPageHeaderRule, SvgFiligreeRule,
} from '@/app/mojo/components/MojoSvgAssets'
import { getThreadDisplayState, getWaitingOn, getDisplayBadge, getThreadStatePriority, formatRelativeTime } from '@/lib/mojo/utils'

export default async function MojoCharacterPage({
  params,
}: {
  params: Promise<{ charId: string }>
}) {
  const { charId } = await params
  const character = await getMojoCharacter(charId)
  if (!character) notFound()

  const threads = await getMojoCharacterThreads(charId)
  const allFaceclaims = await getMojoFaceclaims()
  const characterResources = await getMojoCharacterResources(charId)
  const faceclaimResources = character.faceclaim_id
    ? await getMojoFaceclaimResources(character.faceclaim_id)
    : []
  const characterStacks = await getMojoImageStacks({ character_id: charId })
  const characterAvatars = await getMojoAvatars({ character_id: charId })
  const { pending: pendingGrades, graded: gradedGrades } = await getMojoGradeSubmissions(charId)
  const isArchived = character.status === 'archived'

  // Portrait avatar: primary stack token → most recent avatar token →
  // placeholder, mirroring the priority established in getMojoDashboardData().
  const primaryStack = character.primary_stack_id
    ? characterStacks.find((s) => s.id === character.primary_stack_id)
    : undefined
  const avatarToken = primaryStack?.token ?? characterAvatars[0]?.token ?? null

  return (
    <div style={{ position: 'relative' }}>
      <MojoThreadAutoRefresh
        threads={threads.map((t) => ({
          id: t.id,
          last_checked_at: t.last_checked_at,
          fetch_status: t.fetch_status,
          url: t.url,
        }))}
      />

      {/* The Dossier stamp */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '40px',
          right: '-10px',
          fontFamily: 'Cinzel, serif',
          fontSize: '64px',
          fontWeight: 700,
          letterSpacing: '0.25em',
          color: 'var(--roseash)',
          opacity: 0.04,
          transform: 'rotate(-8deg)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          whiteSpace: 'nowrap',
        }}
      >
        DOSSIER
      </div>

      <div style={{ padding: '28px 32px 64px', position: 'relative' }}>

        {/* ════ ZONE 1: HEADER ════ */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            background: `
              repeating-linear-gradient(
                0deg,
                rgba(255,255,255,0.008) 0px,
                rgba(255,255,255,0.008) 1px,
                transparent 1px,
                transparent 3px
              ),
              var(--raised)
            `,
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '4px 4px 0 0',
            padding: '20px 24px 16px',
            marginBottom: 0,
            overflow: 'hidden',
          }}
        >
          {/* Ivy decorations */}
          <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} aria-hidden="true">
            <SvgIvyBorder width={160} height={100} flip={false} />
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none' }} aria-hidden="true">
            <SvgIvyBorder width={160} height={100} flip={true} />
          </div>

          {/* Quill — top right of header */}
          <div style={{
            position: 'absolute', top: '10px', right: '20px',
            pointerEvents: 'none', opacity: 0.60,
          }} aria-hidden="true">
            <SvgDossierQuill />
          </div>

          {/* Character name — centered */}
          <div style={{ position: 'relative', textAlign: 'center', padding: '0 140px' }}>
            <h1 style={{
              fontFamily: 'Cormorant Upright, serif',
              fontSize: '38px',
              fontWeight: 600,
              color: 'var(--gold)',
              margin: '0 0 4px',
              letterSpacing: '0.04em',
              textShadow: '0 0 40px rgba(160,40,64,0.25)',
              lineHeight: 1.15,
            }}>
              {character.name}
            </h1>

            {character.faceclaim_name && (
              <p style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: '15px',
                fontStyle: 'italic',
                color: 'var(--mist)',
                margin: '0 0 6px',
              }}>
                {character.faceclaim_name}
              </p>
            )}

            {/* RP name + status badge row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', marginBottom: '4px',
            }}>
              <Link
                href={`/mojo/rps/${character.rp_id}`}
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  color: 'var(--faded)',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                {character.rp_name}
              </Link>
              {isArchived && (
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  color: 'var(--faded)',
                  border: '1px solid var(--elevated)',
                  padding: '1px 6px',
                  transform: 'rotate(2deg)',
                  display: 'inline-block',
                }}>
                  ARCHIVED
                </span>
              )}
              {pendingGrades.length > 0 && (
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  color: '#ece6f8',
                  border: '1px solid var(--ember)',
                  background: 'rgba(96,64,192,0.18)',
                  padding: '1px 6px',
                  display: 'inline-block',
                }}>
                  GRADES DUE: {pendingGrades.length}
                </span>
              )}
            </div>

          </div>

          {/* Header rule at bottom */}
          <div style={{ marginTop: '14px', color: 'var(--elevated)' }}>
            <SvgPageHeaderRule />
          </div>
        </div>

        {/* ════ ZONE 2: PORTRAIT + METADATA ════ */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: '20px 24px',
          background: 'var(--raised)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '24px',
        }}>
          <div className="mojo-char-zone2-three-col">

            {/* LEFT: Primary portrait only — contained size */}
            <div style={{ flexShrink: 0 }}>
              <MojoPortraitCard
                token={avatarToken}
                alt={character.name}
                size="lg"
                idSuffix={`char-primary-${character.id}`}
              />
            </div>

            {/* RIGHT: Metadata + actions + secondary strip */}
            <div className="mojo-char-portrait-meta">

              {character.faceclaim_name && (
                <div>
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '9px',
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    color: 'var(--faded)',
                    display: 'block',
                    marginBottom: '3px',
                  }}>
                    Faceclaim
                  </span>
                  <span style={{
                    fontFamily: 'EB Garamond, serif',
                    fontSize: '16px',
                    fontStyle: 'italic',
                    color: 'var(--mist)',
                  }}>
                    {character.faceclaim_name}
                  </span>
                </div>
              )}

              {character.rp_name && (
                <div>
                  <span style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '9px',
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    color: 'var(--faded)',
                    display: 'block',
                    marginBottom: '3px',
                  }}>
                    Roleplay
                  </span>
                  <Link
                    href={`/mojo/rps/${character.rp_id}`}
                    style={{
                      fontFamily: 'EB Garamond, serif',
                      fontSize: '14px',
                      color: 'var(--roseash)',
                      textDecoration: 'none',
                    }}
                  >
                    {character.rp_name}
                  </Link>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <MojoFaceclaimAssign
                  characterId={character.id}
                  currentFaceclaimId={character.faceclaim_id}
                  currentFaceclaimName={character.faceclaim_name}
                  allFaceclaims={allFaceclaims.map((fc) => ({ id: fc.id, name: fc.name }))}
                />
                <MojoCharacterArchiveToggle
                  charId={character.id}
                  status={isArchived ? 'archived' : 'active'}
                />
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

              {/* Secondary avatar strip — non-primary avatars + upload */}
              <div>
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                  color: 'var(--faded)',
                  display: 'block',
                  marginBottom: '8px',
                }}>
                  All Portraits
                </span>
                <MojoCharacterAvatarStrip
                  characterId={character.id}
                  faceclaimId={character.faceclaim_id}
                  avatars={characterAvatars}
                  stacks={characterStacks}
                  primaryStackId={character.primary_stack_id}
                  primaryToken={avatarToken}
                />
              </div>

            </div>

            {/* RIGHT COLUMN: Active thread list */}
            <div className="mojo-char-zone2-threads">
              <div className="mojo-char-zone2-threads-heading">
                Active Threads
              </div>

              {threads.filter((t) => t.status === 'active' && getThreadDisplayState(t, character.name) !== 'upcoming').length === 0 ? (
                <p style={{
                  fontFamily: 'EB Garamond, serif',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: 'var(--faded)',
                  margin: 0,
                }}>
                  No active threads.
                </p>
              ) : (
                threads
                  .filter((t) => t.status === 'active')
                  .filter((t) => getThreadDisplayState(t, character.name) !== 'upcoming')
                  .sort((a, b) =>
                    getThreadStatePriority(getThreadDisplayState(a, character.name)) -
                    getThreadStatePriority(getThreadDisplayState(b, character.name))
                  )
                  .map((t) => {
                    const state = getThreadDisplayState(t, character.name)
                    const waitingOn = state === 'waiting' ? getWaitingOn(t, character.name) : null
                    const { className: badgeClass, label: badgeLabel } = getDisplayBadge(state, waitingOn)

                    return (
                      <div key={t.id} className="mojo-thread-mini-card">

                        {/* Title — links to thread URL */}
                        {t.url ? (
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mojo-thread-mini-title"
                          >
                            {t.title}
                          </a>
                        ) : (
                          <span className="mojo-thread-mini-title" style={{ color: 'var(--mist)' }}>
                            {t.title}
                          </span>
                        )}

                        {/* Partner */}
                        {t.partner_names && (
                          <div className="mojo-thread-mini-partner">
                            with {t.partner_names}
                          </div>
                        )}

                        {/* Whose-turn badge */}
                        <div style={{ marginBottom: '6px' }}>
                          <span className={badgeClass} style={{ fontSize: '9px', padding: '2px 8px' }}>
                            {badgeLabel}
                          </span>
                        </div>

                        {/* Last poster + checked time */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          {t.last_poster && (
                            <span className="mojo-thread-mini-meta">
                              ↳ {t.last_poster}
                            </span>
                          )}
                          {t.last_checked_at && (
                            <span className="mojo-thread-mini-meta" style={{ marginLeft: 'auto' }}>
                              {formatRelativeTime(t.last_checked_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </div>

        {/* ════ ZONE 2B: GRADED ASSIGNMENTS DUE (Professor Mode, FIX-045-C) ════
             Fully additive — renders nothing when pendingGrades is empty.
             New standalone section rather than an extension of the existing
             assignment-card rendering in MojoThreadTracker.tsx (that markup
             is closure-scoped inside a Client Component outside this
             prompt's file scope) — styled to match its card language
             (var(--claret) background, var(--elevated) border, same
             padding/typography tokens) without touching that file. */}
        {pendingGrades.length > 0 && (
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
            <div className="mojo-column-heading">
              <span>Graded Assignments Due</span>
            </div>
            <div>
              {pendingGrades.map((g) => (
                <div
                  key={g.id}
                  style={{
                    background: 'var(--claret)',
                    border: '1px solid var(--elevated)',
                    borderRadius: 4,
                    padding: '12px 16px',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.94rem', color: 'var(--roseash)' }}>
                      {g.student_name}
                    </span>
                    <span className="mojo-turn-badge mojo-turn-grade" style={{ flexShrink: 0 }}>
                      GRADE DUE
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--mist)', margin: '4px 0 8px' }}>
                    {g.thread_title}
                  </p>
                  <MojoGradeModal
                    submissionId={g.id}
                    studentName={g.student_name}
                    threadTitle={g.thread_title}
                    className={g.class_name ?? 'Class'}
                    characterName={character.name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ ZONE 2C: GRADEBOOK (Professor Mode, FIX-045-C) ════
             Same additive-section rationale as Graded Assignments Due
             above — archived professor threads and their graded
             submissions, as a new standalone block rather than
             extending MojoThreadTracker.tsx's archived-thread rendering
             (out of this prompt's file scope). Gated entirely on
             gradedGrades.length > 0; a professor thread with zero
             graded submissions renders nothing (no empty accordion). */}
        {gradedGrades.length > 0 && (
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
            <div className="mojo-column-heading">
              <span>Gradebook</span>
            </div>
            <div>
              {threads
                .filter((t) => t.status !== 'active' && t.thread_mode === 'professor')
                .map((t) => {
                  const submissionsForThread = gradedGrades.filter((g) => g.thread_id === t.id)
                  if (submissionsForThread.length === 0) return null
                  return (
                    <div
                      key={t.id}
                      style={{
                        background: 'var(--char)',
                        border: '1px solid var(--elevated)',
                        borderRadius: 4,
                        padding: '12px 16px',
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.94rem', color: 'var(--faded)' }}>
                        {t.title}
                      </span>
                      <details>
                        <summary
                          style={{
                            cursor: 'pointer',
                            fontFamily: 'EB Garamond, serif',
                            fontStyle: 'italic',
                            color: 'var(--mist)',
                            fontSize: '13px',
                            marginTop: '6px',
                          }}
                        >
                          Gradebook ({submissionsForThread.length} graded)
                        </summary>
                        {submissionsForThread.map((g) => (
                          <pre
                            key={g.id}
                            style={{
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'EB Garamond, serif',
                              fontSize: '13px',
                              color: 'var(--mist)',
                              margin: '8px 0',
                              borderTop: '1px solid var(--elevated)',
                              paddingTop: '8px',
                            }}
                          >
                            {g.grade_text}
                          </pre>
                        ))}
                      </details>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ════ ZONE 3: THREE COLUMNS ════ */}
        <div className="mojo-char-columns" style={{ position: 'relative', zIndex: 1, marginBottom: '32px' }}>

          {/* ── COLUMN 1: Notes (The Journal) ── */}
          <div>
            <div className="mojo-column-heading">
              <SvgCandleRealistic height={32} idSuffix="notes-sm" flameDelay="0s" />
              <span>The Journal</span>
            </div>
            <MojoCharacterNotes
              charId={character.id}
              rpId={character.rp_id}
              character={character}
            />
          </div>

          {/* ── COLUMN 2: Threads (Correspondence) ── */}
          <div>
            <div className="mojo-column-heading" style={{ justifyContent: 'space-between' }}>
              <SvgCandleRealistic height={32} idSuffix="threads-sm-l" flameDelay="0s" />
              <span>Correspondence</span>
              <SvgCandleRealistic height={32} idSuffix="threads-sm-r" flameDelay="0.35s" />
            </div>
            <MojoThreadTracker
              charId={character.id}
              rpId={character.rp_id}
              characterName={character.name}
              initialThreads={threads}
            />
          </div>

          {/* ── COLUMN 3: Resources (The Archive) ── */}
          <div>
            <div className="mojo-column-heading">
              <SvgOpenBook />
              <span>The Archive</span>
            </div>
            <MojoResourcesTab
              charId={character.id}
              rpId={character.rp_id}
              faceclaimId={character.faceclaim_id}
              faceclaimName={character.faceclaim_name}
              resources={characterResources}
              faceclaimResources={faceclaimResources}
            />
            <div style={{ color: 'var(--elevated)', marginTop: '16px', opacity: 0.5 }} aria-hidden="true">
              <SvgScrollEnd flip={false} />
            </div>
          </div>
        </div>

        {/* ════ ZONE 4: FOOTER ════ */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '16px', padding: '16px 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }} aria-hidden="true">
          <SvgWaxSeal size={28} idSuffix="char-footer-l" />
          <div style={{ flex: 1, color: 'var(--elevated)', opacity: 0.5 }}>
            <SvgFiligreeRule />
          </div>
          <SvgWaxSeal size={28} idSuffix="char-footer-r" />
        </div>

      </div>
    </div>
  )
}
