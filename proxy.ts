import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = [
  '/dashboard', '/forums', '/circle', '/grimoire', '/rewatch',
  '/members', '/whispers', '/characters', '/apothecary',
  '/bookmarks', '/profile', '/settings', '/admin', '/mod',
]

const MAINTENANCE_WHITELIST = [
  '/maintenance',
  '/login',
  '/auth/callback',
  '/favicon.ico',
  '/witchinghourlogo.png',
]

let _maintenanceMode: boolean = false
let _maintenanceCacheAt: number = 0
const MAINTENANCE_CACHE_TTL = 60_000

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

function isWhitelisted(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    MAINTENANCE_WHITELIST.some(p => pathname === p)
  )
}

async function getMaintenanceMode(): Promise<boolean> {
  const now = Date.now()
  if (now - _maintenanceCacheAt < MAINTENANCE_CACHE_TTL) {
    return _maintenanceMode
  }
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const url = new URL(`${supabaseUrl}/rest/v1/site_settings`)
    url.searchParams.set('key', 'eq.maintenance_mode')
    url.searchParams.set('select', 'value')
    url.searchParams.set('limit', '1')
    const res = await fetch(url.toString(), {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })
    if (res.ok) {
      const rows: Array<{ value: string }> = await res.json()
      _maintenanceMode = rows[0]?.value === 'true'
      _maintenanceCacheAt = now
    }
  } catch {
    // On error, keep existing cached value — never block on DB errors
  }
  return _maintenanceMode
}

async function isAdminUser(request: NextRequest): Promise<boolean> {
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() { /* read-only: no cookie writes in proxy context */ },
        },
      }
    )
    const { data } = await supabase.rpc('is_admin')
    return data === true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Maintenance mode — checked first, before all other logic
  if (!isWhitelisted(pathname)) {
    const inMaintenance = await getMaintenanceMode()
    if (inMaintenance) {
      const adminUser = await isAdminUser(request)
      if (!adminUser) {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
      // Admin users fall through to normal proxy logic
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const authHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  }

  // IP ban check
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

  // Auth guard
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
