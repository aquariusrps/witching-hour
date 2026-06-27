import Link from 'next/link'
import MastheadNav from '@/app/components/MastheadNav'
import MastheadUser from '@/app/components/MastheadUser'
import { CANONS } from '@/lib/canons'

interface MastheadProps {
  user: {
    id: string
    display_name: string
    avatar_url: string | null
    theme_preference: string | null
    active_character_id: string | null
  } | null
  settings: Record<string, string>
  permissions: string[]
  unreadWhisperCount: number
  superAdmin: boolean
}

export default function Masthead({ user, permissions, superAdmin, unreadWhisperCount }: MastheadProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
    }}>
      {/* Row 1 — 60px */}
      <div style={{
        background: 'var(--masthead-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 22px',
        height: 60,
        gap: 0,
      }}>

        {/* Logo group */}
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          flexShrink: 0,
          marginRight: 30,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/witchinghourlogo.png"
            alt="The Witching Hour"
            width={52}
            height={52}
            style={{ objectFit: 'contain', margin: '-7px 0' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{
              fontFamily: 'var(--f-display)',
              fontWeight: 600,
              fontSize: '1.25rem',
              color: 'var(--roseash)',
              letterSpacing: '0.01em',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
            }}>
              The{' '}
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Witching Hour</em>
            </span>
            <span style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              fontSize: '0.64rem',
              color: 'var(--faded)',
              lineHeight: 1,
            }}>
              a fan community
            </span>
          </div>
        </Link>

        {/* Center nav */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <MastheadNav />
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Messages button with unread badge */}
          <Link href="/whispers" aria-label="Messages" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            height: 32,
            padding: '0 12px',
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            fontFamily: 'var(--f-body)',
            fontSize: '0.82rem',
            color: 'var(--mist)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15, flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 4.5h15a1 1 0 011 1v8a1 1 0 01-1 1h-9l-4 3v-3H3.5a1 1 0 01-1-1v-8a1 1 0 011-1z" />
            </svg>
            <span>Messages</span>
            {unreadWhisperCount > 0 && (
              <span style={{
                background: 'var(--ember)',
                color: 'var(--roseash)',
                borderRadius: '999px',
                fontSize: '10px',
                fontFamily: 'var(--f-ui)',
                padding: '1px 6px',
                marginLeft: '6px',
              }}>
                {unreadWhisperCount > 99 ? '99+' : unreadWhisperCount}
              </span>
            )}
          </Link>

          {/* Notifications button */}
          <button aria-label="Notifications" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            color: 'var(--mist)',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10a5 5 0 00-10 0v3l-1.5 2h13L15 13v-3zm-5 7a2 2 0 004 0" />
            </svg>
          </button>

          {/* Separator */}
          <div style={{ width: 1, height: 26, background: 'var(--border)', flexShrink: 0, margin: '0 4px' }} aria-hidden="true" />

          {/* User chip + dropdown */}
          {user && (
            <MastheadUser
              displayName={user.display_name}
              avatarUrl={user.avatar_url}
              permissions={permissions}
              superAdmin={superAdmin}
            />
          )}
        </div>
      </div>

      {/* Row 2 — Show ribbon 36px */}
      <div style={{
        background: 'var(--raised)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        height: 36,
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 22px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: 0,
        }}>
          {/* Canons label */}
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.56rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            paddingRight: 16,
            marginRight: 16,
            borderRight: '1px solid var(--border)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            Canons
          </span>

          {/* Show links */}
          <div style={{ display: 'flex', gap: 4, flex: 1, alignItems: 'center', overflow: 'hidden' }}>
            {CANONS.map((c) => (
              <Link
                key={c.db}
                href={`/forums?canon=${c.db.replace(/_/g, '-')}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '0 10px',
                  height: 24,
                  borderRadius: 'var(--r-xs)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: c.color,
                  boxShadow: c.primary ? `0 0 5px ${c.color}` : undefined,
                  flexShrink: 0,
                }} aria-hidden="true" />
                <span style={{
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--mist)',
                }}>
                  {c.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Tagline */}
          <span style={{
            fontFamily: 'var(--f-body)',
            fontStyle: 'italic',
            fontSize: '0.75rem',
            color: 'var(--faded)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            paddingLeft: 16,
          }}>
            &amp; the magic that never left
          </span>
        </div>
      </div>
    </header>
  )
}
