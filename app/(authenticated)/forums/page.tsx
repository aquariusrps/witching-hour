import Link from 'next/link'
import { getCachedBoardTree, type BoardNode } from '@/lib/cached-settings'
import { getUnreadBoardIds } from '@/lib/forums'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import LocalTime from '@/components/LocalTime'

function computeUnreadSet(nodes: BoardNode[], rawUnread: Set<string>): Set<string> {
  const result = new Set<string>()
  function walk(node: BoardNode): boolean {
    let hasUnread = rawUnread.has(node.id)
    for (const child of node.children) {
      if (walk(child)) hasUnread = true
    }
    if (hasUnread) result.add(node.id)
    return hasUnread
  }
  for (const node of nodes) walk(node)
  return result
}

function collectUserIds(nodes: BoardNode[]): string[] {
  const ids = new Set<string>()
  function walk(node: BoardNode) {
    if (node.last_post_user_id) ids.add(node.last_post_user_id)
    for (const child of node.children) walk(child)
  }
  for (const node of nodes) walk(node)
  return [...ids]
}

function DefaultBoardIcon() {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fontSize="18"
        fill="var(--mist)"
        fontFamily="serif"
      >
        ✦
      </text>
    </svg>
  )
}

function FiligreeDiv() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        margin: '1.25rem auto 0',
        maxWidth: 360,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(to right, var(--ember), var(--gold))',
        }}
      />
      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✦</span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(to left, var(--ember), var(--gold))',
        }}
      />
    </div>
  )
}

function BoardRow({
  board,
  hasUnread,
  lastPostDisplayName,
}: {
  board: BoardNode
  hasUnread: boolean
  lastPostDisplayName: string | null
}) {
  return (
    <div
      className="forum-board-row"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '0.85rem 1rem',
        borderTop: '1px solid var(--raised)',
        transition: 'background 150ms',
      }}
    >
      {/* Left: icon + unread dot */}
      <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
        {board.icon_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={board.icon_url}
            alt=""
            width={32}
            height={32}
            style={{ display: 'block', borderRadius: 2 }}
          />
        ) : (
          <DefaultBoardIcon />
        )}
        {hasUnread && (
          <div
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              background: 'var(--ember)',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 6px var(--ember)',
            }}
          />
        )}
      </div>

      {/* Center: name, description, subforums */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={`/forums/${board.id}`}
          style={{
            fontFamily: 'var(--f-head)',
            fontWeight: 500,
            fontSize: '1rem',
            color: 'var(--roseash)',
            textDecoration: 'none',
          }}
        >
          {board.name}
        </Link>
        {board.description && (
          <p
            style={{
              fontFamily: 'var(--f-body)',
              fontSize: '0.9rem',
              color: 'var(--mist)',
              margin: '0.2rem 0 0',
              lineHeight: 1.4,
            }}
          >
            {board.description}
          </p>
        )}
        {board.children.length > 0 && (
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', lineHeight: 1.4 }}>
            <span
              style={{
                fontFamily: 'var(--f-ui)',
                color: 'var(--faded)',
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
              }}
            >
              Subforums:{' '}
            </span>
            {board.children.map((child, i) => (
              <span key={child.id}>
                <Link
                  href={`/forums/${child.id}`}
                  className="subforum-link"
                  style={{
                    fontFamily: 'var(--f-body)',
                    color: 'var(--mist)',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  {child.name}
                </Link>
                {i < board.children.length - 1 && (
                  <span style={{ color: 'var(--faded)' }}>, </span>
                )}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Right: counts + last post */}
      <div
        style={{
          flexShrink: 0,
          textAlign: 'right',
          minWidth: 140,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.7rem',
            color: 'var(--faded)',
            letterSpacing: '0.03em',
            margin: 0,
          }}
        >
          {board.thread_count} thread{board.thread_count !== 1 ? 's' : ''} &middot;{' '}
          {board.post_count} post{board.post_count !== 1 ? 's' : ''}
        </p>
        <div style={{ marginTop: '0.3rem' }}>
          {board.last_post_at && lastPostDisplayName ? (
            <>
              <p
                style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.8rem',
                  color: 'var(--mist)',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Last post by{' '}
                <span style={{ color: 'var(--ember)' }}>{lastPostDisplayName}</span>
              </p>
              <LocalTime
                iso={board.last_post_at}
                className="forum-timestamp"
              />
            </>
          ) : (
            <p
              style={{
                fontFamily: 'var(--f-body)',
                fontSize: '0.8rem',
                color: 'var(--faded)',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              No posts yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function ForumsPage() {
  const supabase = await getServerClient()
  const [boardTree, { data: { user } }] = await Promise.all([
    getCachedBoardTree(),
    supabase.auth.getUser(),
  ])

  const unreadBoardIds = await getUnreadBoardIds(user!.id)
  const unreadSet = computeUnreadSet(boardTree, unreadBoardIds)

  // Batch-fetch display names for last post users (R12 — public.users only)
  const userIds = collectUserIds(boardTree)
  const userMap = new Map<string, string>()
  if (userIds.length > 0) {
    const admin = getAdminClient()
    const { data: userRows } = await admin
      .from('users')
      .select('id, display_name')
      .in('id', userIds)
    for (const u of userRows ?? []) userMap.set(u.id, u.display_name)
  }

  if (boardTree.length === 0) {
    return (
      <main style={{ background: 'var(--char)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--f-body)',
            fontStyle: 'italic',
            color: 'var(--mist)',
            fontSize: '1.1rem',
          }}
        >
          The boards are being prepared. Check back soon.
        </p>
      </main>
    )
  }

  return (
    <>
      <style>{`
        .forum-board-row:hover { background: var(--claret); }
        .subforum-link:hover { color: var(--ember) !important; }
        .forum-timestamp {
          display: block;
          font-family: var(--f-body);
          font-size: 0.75rem;
          color: var(--faded);
          margin-top: 0.1rem;
        }
      `}</style>

      <main style={{ background: 'var(--char)', minHeight: '100vh', padding: '2.5rem 1rem 3rem' }}>
        {/* Page header */}
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 500,
              fontSize: '2.75rem',
              color: 'var(--gold)',
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            The Boards
          </h1>
          <p
            style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              color: 'var(--mist)',
              fontSize: '1.05rem',
              marginTop: '0.5rem',
            }}
          >
            Your coven&apos;s gathering place.
          </p>
          <FiligreeDiv />
        </header>

        {/* Category sections */}
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          {boardTree.map(category => (
            <section key={category.id} style={{ marginBottom: '2rem' }}>
              {/* Category header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--raised)',
                  borderTop: '1px solid var(--ember-dim)',
                  padding: '0.6rem 1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--f-ui)',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--faded)',
                    textTransform: 'uppercase',
                  }}
                >
                  {category.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.7rem',
                    color: 'var(--faded)',
                  }}
                >
                  {category.children.length}{' '}
                  {category.children.length === 1 ? 'board' : 'boards'}
                </span>
              </div>

              {/* Board rows */}
              <div>
                {category.children.map(board => (
                  <BoardRow
                    key={board.id}
                    board={board}
                    hasUnread={unreadSet.has(board.id)}
                    lastPostDisplayName={
                      board.last_post_user_id
                        ? (userMap.get(board.last_post_user_id) ?? null)
                        : null
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
