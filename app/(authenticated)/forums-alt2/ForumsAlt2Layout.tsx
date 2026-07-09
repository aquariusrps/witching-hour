'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BoardNode } from '@/lib/cached-settings'
import LocalTime from '@/components/LocalTime'

interface ForumsAlt2LayoutProps {
  boardTree: BoardNode[]
  unreadSet: Set<string>
  userMap: Map<string, string>
}

function GrandRule() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      maxWidth: '700px',
      margin: '0 auto',
    }}>
      {/* Left arm */}
      <div style={{
        flex: 1, height: '1px',
        background: 'linear-gradient(to right, transparent, rgba(200,56,24,0.3), rgba(224,176,40,0.5))',
      }} />
      {/* Left node */}
      <div style={{
        width: '4px', height: '4px',
        background: 'var(--ember)',
        transform: 'rotate(45deg)',
        flexShrink: 0,
        opacity: 0.6,
      }} />
      {/* Center ornament */}
      <div style={{
        flexShrink: 0,
        padding: '0 0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
      }}>
        <div style={{ width: '1px', height: '12px', background: 'rgba(200,56,24,0.4)' }} />
        <span style={{
          fontFamily: 'var(--f-display)',
          fontSize: '0.65rem',
          color: 'var(--gold)',
          opacity: 0.7,
          letterSpacing: '0.25em',
        }}>✦</span>
        <div style={{ width: '1px', height: '12px', background: 'rgba(200,56,24,0.4)' }} />
      </div>
      {/* Right node */}
      <div style={{
        width: '4px', height: '4px',
        background: 'var(--ember)',
        transform: 'rotate(45deg)',
        flexShrink: 0,
        opacity: 0.6,
      }} />
      {/* Right arm */}
      <div style={{
        flex: 1, height: '1px',
        background: 'linear-gradient(to left, transparent, rgba(200,56,24,0.3), rgba(224,176,40,0.5))',
      }} />
    </div>
  )
}

function BoardRow2({
  board,
  hasUnread,
  lastPostDisplayName,
  isLast,
}: {
  board: BoardNode
  hasUnread: boolean
  lastPostDisplayName: string | null
  isLast: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        borderBottom: isLast ? 'none' : '0.5px solid rgba(200,56,24,0.08)',
        background: hovered ? 'rgba(60,5,5,0.4)' : 'transparent',
        transition: 'background 200ms',
        minHeight: '72px',
      }}
    >
      {/* LEFT ACCENT COLUMN */}
      <div style={{
        width: '64px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: `1px solid ${hovered ? 'rgba(200,56,24,0.3)' : 'rgba(200,56,24,0.1)'}`,
        transition: 'border-color 200ms',
        padding: '1rem 0',
        position: 'relative',
      }}>
        {board.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={board.icon_url}
            alt=""
            style={{
              width: '28px',
              height: '28px',
              objectFit: 'contain',
              opacity: hovered ? 0.9 : 0.6,
              transition: 'opacity 200ms',
            }}
          />
        ) : (
          <div style={{
            position: 'relative',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              border: `1px solid ${hovered ? 'rgba(200,56,24,0.5)' : 'rgba(200,56,24,0.2)'}`,
              borderRadius: '50%',
              transition: 'border-color 200ms',
            }} />
            <div style={{
              width: '6px',
              height: '6px',
              background: hasUnread ? 'var(--ember)' : 'rgba(200,56,24,0.3)',
              transform: 'rotate(45deg)',
              animation: hasUnread ? 'twh2-pulse 2s ease-in-out infinite' : 'none',
            }} />
          </div>
        )}
      </div>

      {/* CENTER CONTENT COLUMN */}
      <div style={{
        flex: 1,
        padding: '0.85rem 1.1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '0.3rem',
        minWidth: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href={`/forums/${board.id}`}
            style={{
              fontFamily: 'var(--f-head)',
              fontSize: '1rem',
              fontWeight: 500,
              color: hovered ? 'var(--gold)' : 'var(--roseash)',
              textDecoration: 'none',
              textShadow: hovered ? '0 0 20px rgba(224,176,40,0.3)' : 'none',
              transition: 'color 200ms, text-shadow 200ms',
              lineHeight: 1.2,
            }}
          >
            {board.name}
          </Link>

          {board.staff_only_threads && (
            <span style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.52rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(200,56,24,0.7)',
              border: '0.5px solid rgba(200,56,24,0.3)',
              padding: '0.1rem 0.4rem',
              borderRadius: '1px',
            }}>
              Staff
            </span>
          )}
        </div>

        {board.description && (
          <p style={{
            fontFamily: 'var(--f-body)',
            fontStyle: 'italic',
            fontSize: '0.82rem',
            color: 'rgba(184,144,128,0.7)',
            lineHeight: 1.55,
            margin: 0,
          }}>
            {board.description}
          </p>
        )}

        {board.children.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
            <span style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.54rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(200,56,24,0.5)',
            }}>
              Sub
            </span>
            <div style={{ width: '1px', height: '8px', background: 'rgba(200,56,24,0.25)' }} />
            {board.children.map((sub, i) => (
              <span key={sub.id}>
                <Link
                  href={`/forums/${sub.id}`}
                  style={{
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.06em',
                    color: hovered ? 'rgba(200,56,24,0.8)' : 'rgba(106,72,56,0.9)',
                    textDecoration: 'none',
                    transition: 'color 200ms',
                  }}
                >
                  {sub.name}
                </Link>
                {i < board.children.length - 1 && (
                  <span style={{ color: 'rgba(62,24,24,0.8)', margin: '0 0.25rem', fontSize: '0.5rem' }}>·</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT STAT BLOCK */}
      <div style={{
        width: '190px',
        flexShrink: 0,
        borderLeft: `1px solid ${hovered ? 'rgba(200,56,24,0.2)' : 'rgba(200,56,24,0.08)'}`,
        transition: 'border-color 200ms',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '0.5px solid rgba(200,56,24,0.08)',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.6rem 0.5rem',
            borderRight: '0.5px solid rgba(200,56,24,0.08)',
          }}>
            <span style={{
              fontFamily: 'var(--f-display)',
              fontSize: '1.2rem',
              fontWeight: 300,
              color: hovered ? 'rgba(224,176,40,0.9)' : 'rgba(184,144,128,0.7)',
              lineHeight: 1,
              transition: 'color 200ms',
            }}>
              {board.thread_count}
            </span>
            <span style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.5rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(106,72,56,0.7)',
              marginTop: '2px',
            }}>
              Threads
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.6rem 0.5rem',
          }}>
            <span style={{
              fontFamily: 'var(--f-display)',
              fontSize: '1.2rem',
              fontWeight: 300,
              color: hovered ? 'rgba(224,176,40,0.9)' : 'rgba(184,144,128,0.7)',
              lineHeight: 1,
              transition: 'color 200ms',
            }}>
              {board.post_count}
            </span>
            <span style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.5rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(106,72,56,0.7)',
              marginTop: '2px',
            }}>
              Posts
            </span>
          </div>
        </div>

        <div style={{
          padding: '0.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '36px',
        }}>
          {lastPostDisplayName && board.last_post_at ? (
            <>
              <span style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.05em',
                color: hovered ? 'var(--ember)' : 'rgba(200,56,24,0.65)',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'color 200ms',
              }}>
                {lastPostDisplayName}
              </span>
              <LocalTime iso={board.last_post_at} className="twh2-ts" />
            </>
          ) : (
            <span style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.54rem',
              letterSpacing: '0.1em',
              color: 'rgba(62,24,24,0.8)',
              textTransform: 'uppercase',
            }}>
              No posts yet
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function CategorySection2({
  category,
  unreadSet,
  userMap,
  isLast,
}: {
  category: BoardNode
  unreadSet: Set<string>
  userMap: Map<string, string>
  isLast: boolean
}) {
  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 0' }}>
      {/* Category band */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.85rem 1.25rem',
        background: 'linear-gradient(to right, rgba(140,10,10,0.35), rgba(60,5,5,0.25), rgba(30,2,2,0.15))',
        borderTop: '1px solid rgba(200,56,24,0.35)',
        borderBottom: '1px solid rgba(200,56,24,0.15)',
        marginBottom: 0,
        gap: '0.85rem',
      }}>
        <div style={{
          width: '3px',
          height: '32px',
          background: 'linear-gradient(to bottom, var(--ember), rgba(200,56,24,0.3))',
          borderRadius: '1px',
          flexShrink: 0,
          boxShadow: '0 0 8px rgba(200,56,24,0.4)',
        }} />

        <span style={{
          fontFamily: 'var(--f-display)',
          fontSize: '0.85rem',
          color: 'rgba(200,56,24,0.6)',
          flexShrink: 0,
          lineHeight: 1,
        }}>✦</span>

        <h2 style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--mist)',
          flex: 1,
          margin: 0,
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        }}>
          {category.name}
        </h2>

        <span style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.56rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(200,56,24,0.55)',
          border: '0.5px solid rgba(200,56,24,0.2)',
          padding: '0.2rem 0.6rem',
          borderRadius: '1px',
          flexShrink: 0,
        }}>
          {category.children.length}&nbsp;{category.children.length === 1 ? 'board' : 'boards'}
        </span>
      </div>

      {/* Board rows */}
      <div style={{ border: '0.5px solid rgba(200,56,24,0.12)', borderTop: 'none' }}>
        {category.children.map((board, i) => (
          <BoardRow2
            key={board.id}
            board={board}
            hasUnread={unreadSet.has(board.id)}
            lastPostDisplayName={board.last_post_user_id ? (userMap.get(board.last_post_user_id) ?? null) : null}
            isLast={i === category.children.length - 1}
          />
        ))}
      </div>

      {!isLast && (
        <div style={{ padding: '2rem 0 0' }}>
          <GrandRule />
        </div>
      )}
    </section>
  )
}

export default function ForumsAlt2Layout({ boardTree, unreadSet, userMap }: ForumsAlt2LayoutProps) {
  const categories = boardTree.filter((n) => n.is_category)

  return (
    <>
      <style>{`
        @keyframes twh2-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(200,56,24,0.7); }
          50% { opacity: 0.35; box-shadow: 0 0 2px rgba(200,56,24,0.2); }
        }
        @keyframes twh2-rotate-slow {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes twh2-rotate-reverse {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        .twh2-ts {
          font-family: var(--f-ui);
          font-size: 0.54rem;
          letter-spacing: 0.08em;
          color: var(--faded);
          display: block;
          margin-top: 2px;
        }
      `}</style>

      <main style={{
        minHeight: '100vh',
        background: 'var(--char)',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 0% 0%, rgba(120,10,10,0.35) 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 100% 0%, rgba(120,10,10,0.35) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 50% 100%, rgba(80,8,8,0.25) 0%, transparent 70%)
        `,
        paddingBottom: '5rem',
      }}>
        <header style={{
          position: 'relative',
          textAlign: 'center',
          padding: '4rem 1.5rem 3.5rem',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(140,15,15,0.45) 0%, transparent 70%)',
          borderBottom: '1px solid rgba(200,56,24,0.15)',
        }}>
          {/* CSS MAGIC CIRCLE */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '1px', height: '1px',
            pointerEvents: 'none',
          }}>
            {/* Outermost ring — slow rotation */}
            <div style={{
              position: 'absolute',
              width: '520px', height: '520px',
              border: '1px solid rgba(180,30,10,0.12)',
              borderRadius: '50%',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              animation: 'twh2-rotate-slow 120s linear infinite',
            }} />

            {/* Second ring */}
            <div style={{
              position: 'absolute',
              width: '420px', height: '420px',
              border: '0.5px solid rgba(200,56,24,0.10)',
              borderRadius: '50%',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
            }} />

            {/* Third ring — reverse rotation */}
            <div style={{
              position: 'absolute',
              width: '320px', height: '320px',
              border: '1px solid rgba(180,30,10,0.10)',
              borderStyle: 'dashed',
              borderRadius: '50%',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              animation: 'twh2-rotate-reverse 90s linear infinite',
            }} />

            {/* Inner ring */}
            <div style={{
              position: 'absolute',
              width: '200px', height: '200px',
              border: '0.5px solid rgba(200,56,24,0.12)',
              borderRadius: '50%',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
            }} />

            {/* Innermost ring */}
            <div style={{
              position: 'absolute',
              width: '100px', height: '100px',
              border: '1px solid rgba(180,30,10,0.10)',
              borderRadius: '50%',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
            }} />

            {/* Horizontal cross line */}
            <div style={{
              position: 'absolute',
              width: '540px', height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(200,56,24,0.06), rgba(200,56,24,0.12), rgba(200,56,24,0.06), transparent)',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
            }} />

            {/* Vertical cross line */}
            <div style={{
              position: 'absolute',
              width: '1px', height: '540px',
              background: 'linear-gradient(to bottom, transparent, rgba(200,56,24,0.06), rgba(200,56,24,0.12), rgba(200,56,24,0.06), transparent)',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
            }} />

            {/* Diagonal line — 45° */}
            <div style={{
              position: 'absolute',
              width: '540px', height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(180,30,10,0.05), rgba(180,30,10,0.08), rgba(180,30,10,0.05), transparent)',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }} />

            {/* Diagonal line — 135° */}
            <div style={{
              position: 'absolute',
              width: '540px', height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(180,30,10,0.05), rgba(180,30,10,0.08), rgba(180,30,10,0.05), transparent)',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%) rotate(135deg)',
            }} />

            {/* Center node — small diamond */}
            <div style={{
              position: 'absolute',
              width: '5px', height: '5px',
              background: 'rgba(200,56,24,0.4)',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              top: '50%', left: '50%',
            }} />
          </div>
          {/* END MAGIC CIRCLE */}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '1px', height: '56px',
              background: 'linear-gradient(to bottom, transparent, rgba(200,56,24,0.6))',
              margin: '0 auto',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '6px', height: '6px',
                background: 'var(--ember)',
                boxShadow: '0 0 8px rgba(200,56,24,0.8)',
              }} />
            </div>

            <div style={{ height: '1.25rem' }} />

            <h1 style={{
              fontFamily: 'var(--f-display)',
              fontSize: '3.5rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              lineHeight: 1.0,
              marginBottom: '0.3rem',
              color: 'var(--gold)',
              textShadow: `
                0 0 40px rgba(224,176,40,0.4),
                0 0 80px rgba(200,56,24,0.2),
                0 2px 4px rgba(0,0,0,0.8)
              `,
            }}>
              The Boards
            </h1>

            <p style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.6rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(200,56,24,0.7)',
              marginBottom: '2rem',
            }}>
              ✦ &nbsp; Gathered wisdom of the coven &nbsp; ✦
            </p>

            <GrandRule />
          </div>
        </header>

        {categories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '8rem 1.5rem',
            fontFamily: 'var(--f-body)',
            fontStyle: 'italic',
            color: 'rgba(184,144,128,0.5)',
            fontSize: '1.05rem',
          }}>
            The circle has not yet been cast.<br />
            Return when the moon rises.
          </div>
        ) : (
          categories.map((category, catIdx) => (
            <CategorySection2
              key={category.id}
              category={category}
              unreadSet={unreadSet}
              userMap={userMap}
              isLast={catIdx === categories.length - 1}
            />
          ))
        )}
      </main>
    </>
  )
}
