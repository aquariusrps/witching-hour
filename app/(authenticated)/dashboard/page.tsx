import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getCachedSiteSettings } from '@/lib/cached-settings'
import { getUserRow } from '@/lib/db/users'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import DashboardNav from './DashboardNav'
import ThemePanel from './ThemePanel'

// Mirrors MastheadUser.tsx's ADMIN_PERMS gate (TWH-2.6) — same definition of
// "isAdmin" used for the equivalent Admin Panel / Mod Panel links elsewhere.
const ADMIN_PERMS = [
  'manage_site', 'manage_users', 'manage_factions', 'manage_boards',
  'manage_events', 'manage_apothecary', 'manage_waitlist',
  'approve_characters', 'award_xp', 'ban_users', 'manage_admins',
  'moderate_boards',
]

// ─── CSS injected into the page ─────────────────────────────────────────────

const PAGE_CSS = `
  @keyframes ring-cw  { to { transform: rotate(360deg);  } }
  @keyframes ring-ccw { to { transform: rotate(-360deg); } }
  .ring-cw  { animation: ring-cw  12s linear infinite; }
  .ring-ccw { animation: ring-ccw  8s linear infinite; }
  @media (prefers-reduced-motion: reduce) {
    .ring-cw, .ring-ccw { animation-play-state: paused; }
  }
  .dash-grid {
    display: grid;
    grid-template-columns: 220px 1fr 240px;
    gap: 22px;
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px 26px 64px;
  }
  @media (max-width: 1100px) {
    .dash-grid { grid-template-columns: 200px 1fr 220px; }
  }
  @media (max-width: 880px) {
    .dash-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 580px) {
    .dash-grid { padding: 16px 14px 48px; gap: 14px; }
  }
`

// ─── Type ────────────────────────────────────────────────────────────────────

type ActiveEvent = { name: string; banner_text: string | null; description: string | null }

// ─── Helpers for tables not yet in types/database.ts ─────────────────────────

function getRawAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function fetchUnreadCount(userId: string): Promise<number> {
  if (!userId) return 0
  const client = getRawAdmin()
  const { count, error } = await client
    .from('mail_messages')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .is('read_at', null)
  if (error) return 0
  return count ?? 0
}

async function fetchActiveEvent(): Promise<ActiveEvent | null> {
  const client = getRawAdmin()
  const { data, error } = await client
    .from('site_events')
    .select('name, banner_text, description')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return data as ActiveEvent
}

function formatMemberSince(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getInitial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

// ─── Panel wrapper ────────────────────────────────────────────────────────────

function Panel({ title, children, style }: {
  title?: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <section style={{
      background: 'var(--raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      marginBottom: 14,
      overflow: 'hidden',
      ...style,
    }}>
      {title && (
        <div style={{
          borderBottom: '1px solid var(--border)',
          padding: '9px 14px',
        }}>
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.57rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
          }}>
            {title}
          </span>
        </div>
      )}
      {children}
    </section>
  )
}

// ─── Stub empty state ─────────────────────────────────────────────────────────

function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub?: string }) {
  return (
    <div style={{ padding: '22px 14px', textAlign: 'center' }}>
      <div style={{ color: 'var(--faded)', marginBottom: 8 }}>{icon}</div>
      <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--mist)', margin: '0 0 4px' }}>{text}</p>
      {sub && <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--faded)', margin: 0 }}>{sub}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const sessionUserId = session?.user?.id

  const [settings, { data: { user } }, userRow, unreadCount, activeEvent, permissions, superAdmin] = await Promise.all([
    getCachedSiteSettings(),
    supabase.auth.getUser(),
    getUserRow(sessionUserId),
    fetchUnreadCount(sessionUserId ?? ''),
    fetchActiveEvent(),
    sessionUserId ? getUserPermissions(sessionUserId) : Promise.resolve([] as string[]),
    sessionUserId ? isSuperAdmin(sessionUserId) : Promise.resolve(false),
  ])

  if (!user) redirect('/login')

  const displayName = userRow?.display_name ?? user.email?.split('@')[0] ?? 'Witch'
  const theme = userRow?.theme_preference ?? 'blood-moon'
  const memberSince = formatMemberSince(userRow?.created_at)
  const showAdmin = superAdmin || permissions.some((p) => ADMIN_PERMS.includes(p))
  const showMod = permissions.includes('moderate_boards')

  void settings // available for future use

  return (
    <>
      <style>{PAGE_CSS}</style>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        background: 'var(--claret)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '28px 26px 24px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Greeting */}
          <h1 style={{
            fontFamily: 'var(--f-display)',
            fontWeight: 400,
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            color: 'var(--roseash)',
            margin: '0 0 10px',
            lineHeight: 1.15,
          }}>
            Welcome back,{' '}
            <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{displayName}</span>.
          </h1>

          {/* Event / welcome banner */}
          {activeEvent ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: 10,
              background: 'var(--gold-fill)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--r-sm)',
              padding: '8px 14px',
              maxWidth: 560,
            }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>✦</span>
              <div>
                <p style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-dim)', margin: '0 0 3px' }}>
                  {activeEvent.name}
                </p>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.88rem', color: 'var(--roseash)', margin: 0 }}>
                  {activeEvent.banner_text ?? activeEvent.description ?? 'Something stirs in the circle.'}
                </p>
              </div>
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              color: 'var(--mist)',
              margin: 0,
              maxWidth: 480,
            }}>
              You&rsquo;re in the circle now. The magic is real.
            </p>
          )}
        </div>

        {/* Blood moon watermark */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}>
          <svg
            viewBox="0 0 340 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 340, height: 340, opacity: 0.055, color: 'var(--roseash)', marginRight: -50 }}
          >
            <circle cx="170" cy="170" r="162" stroke="currentColor" strokeWidth="0.5"/>
            <circle cx="170" cy="170" r="140" stroke="currentColor" strokeWidth="1"/>
            <circle cx="170" cy="170" r="151" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 6"/>
            <circle cx="170" cy="170" r="115" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="200" cy="155" r="95" fill="currentColor" opacity="0.15"/>
            {/* Pentacle — points skip-one in order */}
            <polygon points="170,55 238,263 61,135 279,135 102,263" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinejoin="round"/>
            {/* Cardinal dots */}
            <circle cx="170" cy="8"   r="3.5" fill="currentColor"/>
            <circle cx="332" cy="170" r="3.5" fill="currentColor"/>
            <circle cx="170" cy="332" r="3.5" fill="currentColor"/>
            <circle cx="8"   cy="170" r="3.5" fill="currentColor"/>
            {/* Diagonal marks at 45° positions on outer ring */}
            <line x1="120" y1="22"  x2="108" y2="34"  stroke="currentColor" strokeWidth="1"/>
            <line x1="220" y1="22"  x2="232" y2="34"  stroke="currentColor" strokeWidth="1"/>
            <line x1="318" y1="120" x2="306" y2="108" stroke="currentColor" strokeWidth="1"/>
            <line x1="318" y1="220" x2="306" y2="232" stroke="currentColor" strokeWidth="1"/>
            <line x1="220" y1="318" x2="232" y2="306" stroke="currentColor" strokeWidth="1"/>
            <line x1="120" y1="318" x2="108" y2="306" stroke="currentColor" strokeWidth="1"/>
            <line x1="22"  y1="220" x2="34"  y2="232" stroke="currentColor" strokeWidth="1"/>
            <line x1="22"  y1="120" x2="34"  y2="108" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>
      </section>

      {/* ── Three-column grid ───────────────────────────────────────── */}
      <div className="dash-grid">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
        <aside style={{ alignSelf: 'start', position: 'sticky', top: 108 }}>

          {/* Profile card */}
          <Panel>
            <div style={{ padding: '18px 14px 14px', textAlign: 'center' }}>
              {/* Avatar with spinning rings */}
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 12px' }}>
                <div className="ring-cw" style={{
                  position: 'absolute',
                  inset: -9,
                  border: '1.5px dashed var(--gold)',
                  borderRadius: '50%',
                  opacity: 0.4,
                }} />
                <div className="ring-ccw" style={{
                  position: 'absolute',
                  inset: -4,
                  border: '1.5px dashed var(--ember)',
                  borderRadius: '50%',
                  opacity: 0.55,
                }} />
                <div style={{
                  position: 'relative',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid var(--border-mid)',
                  background: 'var(--claret)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}>
                  {userRow?.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={userRow.avatar_url}
                      alt={displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{
                      fontFamily: 'var(--f-display)',
                      fontSize: '1.8rem',
                      fontWeight: 600,
                      color: 'var(--gold)',
                      lineHeight: 1,
                    }}>
                      {getInitial(displayName)}
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <p style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', margin: '0 0 3px' }}>
                {displayName}
              </p>
              <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.77rem', color: 'var(--faded)', margin: '0 0 14px' }}>
                Member since {memberSince}
              </p>

              {/* Stats row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 0, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {[
                  { label: 'Posts',  value: 0 },
                  { label: 'XP',     value: 0 },
                  { label: 'Chars',  value: 0 },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{
                    flex: 1,
                    textAlign: 'center',
                    borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined,
                  }}>
                    <p style={{ fontFamily: 'var(--f-head)', fontSize: '1.1rem', color: 'var(--roseash)', margin: 0, lineHeight: 1.2 }}>
                      {value}
                    </p>
                    <p style={{ fontFamily: 'var(--f-ui)', fontSize: '0.52rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--faded)', margin: 0 }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Navigate panel */}
          <Panel title="Navigate">
            <div style={{ padding: '6px 4px' }}>
              <DashboardNav showAdmin={showAdmin} showMod={showMod} />
            </div>
          </Panel>

          {/* Active character panel */}
          <Panel title="Playing As">
            {userRow?.active_character_id ? (
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.88rem', color: 'var(--mist)', margin: 0 }}>
                  Character name pending
                </p>
              </div>
            ) : (
              <EmptyState
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: 28, height: 28, margin: '0 auto' }}>
                    <circle cx="12" cy="8" r="4"/>
                    <path strokeLinecap="round" d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>
                  </svg>
                }
                text="No character playing."
                sub="Visit My Characters to create or activate one."
              />
            )}
          </Panel>

        </aside>

        {/* ── MAIN COLUMN ──────────────────────────────────────────── */}
        <main style={{ minWidth: 0 }}>

          {/* Activity panel */}
          <Panel title={`Activity ${unreadCount > 0 ? `· ${unreadCount} unread` : ''}`}>
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: 30, height: 30, margin: '0 auto' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 10h18M3 14h12" />
                </svg>
              }
              text="Quiet in the circle."
              sub="New messages and mentions will appear here."
            />
          </Panel>

          {/* Active boards */}
          <Panel title="Active Boards">
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: 30, height: 30, margin: '0 auto' }}>
                  <rect x="3" y="4" width="18" height="16" rx="2"/>
                  <path strokeLinecap="round" d="M7 9h10M7 13h6" />
                </svg>
              }
              text="No boards active."
              sub="Forum boards will surface here when you're subscribed."
            />
          </Panel>

        </main>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────────── */}
        <aside style={{ alignSelf: 'start', position: 'sticky', top: 108 }}>

          {/* Online now */}
          <Panel title="Online Now">
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22, margin: '0 auto', color: 'var(--faded)' }}>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1"/>
                </svg>
              }
              text="Checking who's about…"
            />
          </Panel>

          {/* Poll */}
          <Panel title="Circle Poll">
            <div style={{ padding: '12px 14px' }}>
              <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.84rem', color: 'var(--mist)', margin: '0 0 8px' }}>
                No poll active.
              </p>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--faded)', margin: 0 }}>
                Community polls will appear here.
              </p>
            </div>
          </Panel>

          {/* Rewatch */}
          <Panel title="Rewatch Club">
            <div style={{ padding: '12px 14px' }}>
              <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.84rem', color: 'var(--mist)', margin: '0 0 8px' }}>
                No current rewatch.
              </p>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--faded)', margin: 0 }}>
                Episode discussions will surface here.
              </p>
            </div>
          </Panel>

          {/* Theme switcher */}
          <Panel title="Theme">
            <ThemePanel currentTheme={theme} />
          </Panel>

        </aside>

      </div>
    </>
  )
}
