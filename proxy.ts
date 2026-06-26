import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = [
  '/dashboard', '/forums', '/circle', '/grimoire', '/rewatch',
  '/members', '/whispers', '/characters', '/apothecary',
  '/bookmarks', '/profile', '/settings', '/admin', '/mod',
]

const MAINTENANCE_EXEMPT = ['/maintenance', '/login', '/api']

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    c => c.name.includes('auth-token') && c.name.startsWith('sb-')
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const authHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  }

  // 3a — IP ban check
  try {
    const ip = getClientIp(request)
    if (ip !== 'unknown') {
      const now = new Date().toISOString()
      const banUrl = new URL(`${supabaseUrl}/rest/v1/ip_bans`)
      banUrl.searchParams.set('select', 'id')
      banUrl.searchParams.set('ip_address', `eq.${ip}`)
      banUrl.searchParams.set('or', `(expires_at.is.null,expires_at.gt.${now})`)
      banUrl.searchParams.set('limit', '1')

      const banRes = await fetch(banUrl.toString(), { headers: authHeaders })
      if (banRes.ok) {
        const bans: unknown[] = await banRes.json()
        if (Array.isArray(bans) && bans.length > 0) {
          return NextResponse.redirect(new URL('/banned', request.url))
        }
      }
    }
  } catch {
    // fail open — don't block legitimate traffic on DB errors
  }

  // 3b — Maintenance mode check
  try {
    const settingsUrl = new URL(`${supabaseUrl}/rest/v1/site_settings`)
    settingsUrl.searchParams.set('key', 'eq.maintenance_mode')
    settingsUrl.searchParams.set('select', 'value')
    settingsUrl.searchParams.set('limit', '1')

    const settingsRes = await fetch(settingsUrl.toString(), { headers: authHeaders })
    if (settingsRes.ok) {
      const rows: Array<{ value: string }> = await settingsRes.json()
      if (rows[0]?.value === 'true') {
        const isExempt = MAINTENANCE_EXEMPT.some(p => pathname.startsWith(p))
        const hasSession = hasSessionCookie(request)
        if (!isExempt && !hasSession) {
          return NextResponse.redirect(new URL('/maintenance', request.url))
        }
      }
    }
  } catch {
    // fail open
  }

  // 3c — Auth guard
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  if (isProtected && !hasSessionCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
