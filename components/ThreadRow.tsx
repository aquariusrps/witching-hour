'use client'

import { useState } from 'react'
import Link from 'next/link'
import LocalTime from '@/components/LocalTime'
import { CANONS } from '@/lib/canons'

export type ThreadRowProps = {
  thread: {
    id: string
    title: string
    author_id: string
    canon_source: string | null
    is_spoiler: boolean
    is_pinned: boolean
    is_locked: boolean
    thread_type: 'standard' | 'combat' | 'ascension'
    reply_count: number
    updated_at: string | null
    created_at: string
  }
  boardId: string
  authorDisplayName: string
  isUnread: boolean
  showBoardName?: boolean
  boardName?: string
}

// Canon color map — show canons use fixed brand hex; 'all' and 'original' use CSS vars
// 'angel' shares the Buffy & Angel ribbon hex (#3878a8) but has its own db value
const CANON_COLOR_MAP: Record<string, string> = {
  ...Object.fromEntries(CANONS.map(c => [c.db, c.color] as [string, string])),
  angel: '#3878a8',
  all: 'var(--mist)',
  original: 'var(--faded)',
}

const CANON_LABEL_MAP: Record<string, string> = {
  ...Object.fromEntries(CANONS.map(c => [c.db, c.label] as [string, string])),
  angel: 'Angel',
  all: 'All Canons',
  original: 'Original',
}

function getCanonColor(canonSource: string | null): string | null {
  if (!canonSource) return null
  return CANON_COLOR_MAP[canonSource] ?? null
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const BADGE_BASE: React.CSSProperties = {
  fontFamily: 'var(--f-ui)',
  fontSize: '0.58rem',
  letterSpacing: '0.08em',
  padding: '0.12rem 0.45rem',
  borderRadius: 2,
}

export default function ThreadRow({
  thread,
  boardId,
  authorDisplayName,
  isUnread,
  showBoardName,
  boardName,
}: ThreadRowProps) {
  const [hovered, setHovered] = useState(false)

  const canonColor = getCanonColor(thread.canon_source)
  const canonLabel = thread.canon_source
    ? (CANON_LABEL_MAP[thread.canon_source] ?? thread.canon_source)
    : null
  const canonIsHex = canonColor?.startsWith('#') ?? false

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--raised)',
        background: hovered ? 'var(--raised)' : 'transparent',
        transition: 'background 150ms ease',
      }}
    >
      {/* LEFT — unread indicator, fixed 40px width for alignment */}
      <div style={{
        width: 40,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '0.15rem',
      }}>
        <div style={{
          width: 8,
          height: 8,
          transform: 'rotate(45deg)',
          background: isUnread ? 'var(--ember)' : 'transparent',
          boxShadow: isUnread ? '0 0 6px rgba(200,56,24,0.45)' : 'none',
        }} />
      </div>

      {/* CENTER — badges, title, meta */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Row 1: badges inline with title */}
        <div style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: '0.35rem',
        }}>

          {thread.thread_type === 'combat' && (
            <span style={{
              ...BADGE_BASE,
              color: 'var(--ember)',
              border: '0.5px solid var(--ember-dim)',
              background: 'rgba(200,56,24,0.08)',
            }}>Combat</span>
          )}

          {thread.thread_type === 'ascension' && (
            <span style={{
              ...BADGE_BASE,
              color: 'var(--gold)',
              border: '0.5px solid var(--gold-dim)',
              background: 'rgba(224,176,40,0.08)',
            }}>Ascension Rite</span>
          )}

          {thread.is_spoiler && (
            <span style={{
              ...BADGE_BASE,
              color: 'var(--moonstone)',
              border: '0.5px solid var(--moon-dim)',
              background: 'rgba(56,120,168,0.08)',
            }}>Spoiler</span>
          )}

          {thread.is_locked && (
            <span style={{
              ...BADGE_BASE,
              color: 'var(--faded)',
              border: '0.5px solid var(--elevated)',
              background: 'transparent',
            }}>Locked</span>
          )}

          {canonColor !== null && canonLabel !== null && (
            <span style={canonIsHex ? {
              fontFamily: 'var(--f-ui)',
              fontSize: '0.56rem',
              letterSpacing: '0.08em',
              padding: '0.1rem 0.4rem',
              borderRadius: 2,
              background: hexToRgba(canonColor, 0.10),
              border: `0.5px solid ${hexToRgba(canonColor, 0.40)}`,
              color: canonColor,
            } : {
              // 'all' → var(--mist), 'original' → var(--faded) — no border
              fontFamily: 'var(--f-ui)',
              fontSize: '0.56rem',
              letterSpacing: '0.08em',
              padding: '0.1rem 0.4rem',
              borderRadius: 2,
              color: canonColor,
            }}>
              {canonLabel}
            </span>
          )}

          <Link
            href={`/forums/${boardId}/${thread.id}`}
            style={{
              fontFamily: 'var(--f-head)',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: hovered ? 'var(--gold)' : 'var(--roseash)',
              transition: 'color 150ms',
              display: 'inline',
              textDecoration: 'none',
            }}
          >
            {thread.title}
          </Link>
        </div>

        {/* Row 2: meta line */}
        <div style={{
          marginTop: '0.2rem',
          fontFamily: 'var(--f-body)',
          fontSize: '0.78rem',
          color: 'var(--faded)',
          lineHeight: 1.4,
        }}>
          {showBoardName && boardName ? (
            <>
              <span style={{ color: 'var(--faded)' }}>in </span>
              <span style={{ color: 'var(--mist)' }}>{boardName}</span>
              <span style={{ color: 'var(--elevated)' }}> · </span>
              <span style={{ color: 'var(--faded)' }}>by </span>
              <span style={{ color: 'var(--mist)' }}>{authorDisplayName}</span>
            </>
          ) : (
            <>
              <span style={{ color: 'var(--faded)' }}>by </span>
              <span style={{ color: 'var(--mist)' }}>{authorDisplayName}</span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT — reply count and last activity */}
      <div style={{
        flexShrink: 0,
        minWidth: 110,
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.2rem',
      }}>
        <span style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.62rem',
          letterSpacing: '0.07em',
          color: 'var(--faded)',
        }}>
          {thread.reply_count === 0
            ? 'No replies'
            : thread.reply_count === 1
              ? '1 reply'
              : `${thread.reply_count} replies`}
        </span>

        {thread.updated_at !== null ? (
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.58rem',
            color: 'var(--faded)',
            display: 'block',
          }}>
            <LocalTime iso={thread.updated_at} />
          </span>
        ) : (
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.58rem',
            color: 'var(--faded)',
            display: 'block',
          }}>New</span>
        )}
      </div>
    </div>
  )
}
