'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BoardNode } from '@/lib/cached-settings'
import LocalTime from '@/components/LocalTime'

interface ForumsAltLayoutProps {
  boardTree: BoardNode[]
  unreadSet: Set<string>
  userMap: Map<string, string>
}

function OrnamentalRule() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      maxWidth: '600px',
      margin: '0 auto',
      opacity: 0.55,
    }}>
      <div style={{
        flex: 1,
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--ember), var(--gold), var(--ember), transparent)',
      }} />
      <span style={{
        fontFamily: 'var(--f-display)',
        fontSize: '0.7rem',
        color: 'var(--gold)',
        letterSpacing: '0.3em',
        flexShrink: 0,
      }}>✦</span>
      <div style={{
        flex: 1,
        height: '1px',
        background: 'linear-gradient(to left, transparent, var(--ember), var(--gold), var(--ember), transparent)',
      }} />
    </div>
  )
}

function CategoryHeader({ name, boardCount }: { name: string; boardCount: number }) {
  const doubleRule = (
    <div style={{ position: 'relative', height: '8px' }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--elevated), var(--ember-dim), var(--elevated), transparent)',
      }} />
      <div style={{
        position: 'absolute',
        top: '6px', left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--elevated), var(--ember-dim), var(--elevated), transparent)',
      }} />
    </div>
  )

  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
      <div style={{ marginBottom: '1rem' }}>{doubleRule}</div>

      <h2 style={{
        fontFamily: 'var(--f-ui)',
        fontSize: '0.72rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--mist)',
        fontWeight: 500,
        marginBottom: '0.3rem',
        display: 'inline-block',
        padding: '0 1.25rem',
        background: 'var(--char)',
        position: 'relative',
      }}>
        {name}
      </h2>

      <p style={{
        fontFamily: 'var(--f-ui)',
        fontSize: '0.58rem',
        letterSpacing: '0.12em',
        color: 'var(--faded)',
        textTransform: 'uppercase',
      }}>
        {boardCount} {boardCount === 1 ? 'board' : 'boards'}
      </p>

      <div style={{ marginTop: '0.75rem' }}>{doubleRule}</div>
    </div>
  )
}

function BoardCard({
  board,
  hasUnread,
  lastPostUser,
}: {
  board: BoardNode
  hasUnread: boolean
  lastPostUser: string | null
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered ? 'var(--claret)' : 'var(--raised)',
        borderRadius: '2px',
        padding: '1.25rem',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 200ms ease',
        boxShadow: hovered
          ? 'inset 0 0 0 1px var(--ember-dim), 0 8px 24px rgba(0,0,0,0.4), 0 0 12px rgba(200,56,24,0.12)'
          : 'inset 0 0 0 1px var(--elevated)',
      }}
    >
      {/* Corner bracket — top left */}
      <div style={{
        position: 'absolute',
        top: '8px', left: '8px',
        width: '10px', height: '10px',
        borderTop: `1px solid ${hovered ? 'var(--ember)' : 'var(--elevated)'}`,
        borderLeft: `1px solid ${hovered ? 'var(--ember)' : 'var(--elevated)'}`,
        transition: 'border-color 200ms',
      }} />

      {/* Corner bracket — bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '8px', right: '8px',
        width: '10px', height: '10px',
        borderBottom: `1px solid ${hovered ? 'var(--ember)' : 'var(--elevated)'}`,
        borderRight: `1px solid ${hovered ? 'var(--ember)' : 'var(--elevated)'}`,
        transition: 'border-color 200ms',
      }} />

      {/* Name row — icon glyph + name + unread indicator */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem' }}>
        {board.icon_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={board.icon_url}
            alt=""
            style={{
              width: '20px',
              height: '20px',
              objectFit: 'contain',
              opacity: 0.7,
              flexShrink: 0,
              marginTop: '2px',
            }}
          />
        ) : (
          // Default: small rotated diamond in accent color
          <div style={{
            width: '7px',
            height: '7px',
            background: 'var(--mist)',
            transform: 'rotate(45deg)',
            flexShrink: 0,
            marginTop: '6px',
            opacity: 0.5,
          }} />
        )}

        <Link
          href={`/forums/${board.id}`}
          style={{
            fontFamily: 'var(--f-head)',
            fontSize: '1rem',
            fontWeight: 500,
            color: hovered ? 'var(--gold)' : 'var(--roseash)',
            transition: 'color 200ms',
            flex: 1,
            lineHeight: 1.3,
            textDecoration: 'none',
          }}
        >
          {board.name}
        </Link>

        {hasUnread && (
          <div style={{
            width: '7px',
            height: '7px',
            background: 'var(--ember)',
            transform: 'rotate(45deg)',
            flexShrink: 0,
            marginTop: '6px',
            animation: 'twh-unread-pulse 2s ease-in-out infinite',
          }} />
        )}
      </div>

      {board.description && (
        <p style={{
          fontFamily: 'var(--f-body)',
          fontStyle: 'italic',
          fontSize: '0.85rem',
          color: 'var(--mist)',
          lineHeight: 1.6,
          marginBottom: '0.75rem',
          paddingLeft: '1.35rem',
          opacity: 0.8,
        }}>
          {board.description}
        </p>
      )}

      {board.children.length > 0 && (
        <div style={{ paddingLeft: '1.35rem', marginBottom: '0.75rem' }}>
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.56rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            marginRight: '0.4rem',
          }}>
            Subforums
          </span>
          {board.children.map((sub, i) => (
            <span key={sub.id}>
              <Link
                href={`/forums/${sub.id}`}
                style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.62rem',
                  color: hovered ? 'var(--ember)' : 'var(--faded)',
                  textDecoration: 'none',
                  transition: 'color 200ms',
                  letterSpacing: '0.05em',
                }}
              >
                {sub.name}
              </Link>
              {i < board.children.length - 1 && (
                <span style={{ color: 'var(--elevated)', margin: '0 0.3rem', fontSize: '0.5rem' }}>
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: '0.75rem',
        borderTop: '0.5px solid var(--elevated)',
        paddingLeft: '1.35rem',
      }}>
        <div style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.58rem',
          letterSpacing: '0.08em',
          color: 'var(--faded)',
          lineHeight: 1.6,
        }}>
          <span>{board.thread_count}</span>
          <span style={{ color: 'var(--elevated)', margin: '0 0.3rem' }}>threads</span>
          <span style={{ color: 'var(--elevated)', margin: '0 0.3rem' }}>·</span>
          <span>{board.post_count}</span>
          <span style={{ color: 'var(--elevated)', margin: '0 0.3rem' }}>posts</span>
        </div>

        {lastPostUser && board.last_post_at ? (
          <div style={{
            textAlign: 'right',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.56rem',
            letterSpacing: '0.06em',
            color: 'var(--faded)',
          }}>
            <span style={{ color: 'var(--ember)', display: 'block' }}>
              {lastPostUser}
            </span>
            <LocalTime iso={board.last_post_at} className="forums-alt-timestamp" />
          </div>
        ) : (
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.56rem',
            color: 'var(--elevated)',
            letterSpacing: '0.06em',
          }}>
            No posts yet
          </span>
        )}
      </div>
    </div>
  )
}

function CategorySection({
  category,
  unreadSet,
  userMap,
}: {
  category: BoardNode
  unreadSet: Set<string>
  userMap: Map<string, string>
}) {
  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 0' }}>
      <CategoryHeader name={category.name} boardCount={category.children.length} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
        marginBottom: '2rem',
      }}>
        {category.children.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            hasUnread={unreadSet.has(board.id)}
            lastPostUser={board.last_post_user_id ? (userMap.get(board.last_post_user_id) ?? null) : null}
          />
        ))}
      </div>

      <OrnamentalRule />
    </section>
  )
}

export default function ForumsAltLayout({ boardTree, unreadSet, userMap }: ForumsAltLayoutProps) {
  const categories = boardTree.filter((node) => node.is_category)

  return (
    <>
      <style>{`
        @keyframes twh-unread-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(200,56,24,0.6); }
          50% { opacity: 0.4; box-shadow: 0 0 2px rgba(200,56,24,0.2); }
        }
        .forums-alt-timestamp {
          display: block;
          font-family: var(--f-ui);
          font-size: 0.56rem;
          letter-spacing: 0.06em;
          color: var(--faded);
          margin-top: 0.1rem;
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'var(--char)', padding: '0 0 4rem' }}>
        <header style={{ textAlign: 'center', padding: '3rem 1.5rem 2.5rem', position: 'relative' }}>
          <div style={{
            width: '1px',
            height: '64px',
            background: 'linear-gradient(to bottom, transparent, var(--ember))',
            margin: '0 auto 0',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '7px',
              height: '7px',
              background: 'var(--ember)',
            }} />
          </div>

          <div style={{ height: '1.5rem' }} />

          <h1 style={{
            fontFamily: 'var(--f-display)',
            fontSize: '3rem',
            fontWeight: 600,
            color: 'var(--gold)',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            marginBottom: '0.4rem',
          }}>
            The Boards
          </h1>

          <p style={{
            fontFamily: 'var(--f-body)',
            fontStyle: 'italic',
            color: 'var(--mist)',
            fontSize: '1rem',
            marginBottom: '2rem',
          }}>
            Gathered wisdom of the coven.
          </p>

          <OrnamentalRule />
        </header>

        {categories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '6rem 1.5rem',
            fontFamily: 'var(--f-body)',
            fontStyle: 'italic',
            color: 'var(--mist)',
            fontSize: '1.05rem',
          }}>
            The grimoire is being written. Return when the moon rises.
          </div>
        ) : (
          categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              unreadSet={unreadSet}
              userMap={userMap}
            />
          ))
        )}
      </main>
    </>
  )
}
