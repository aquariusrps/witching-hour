import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'

const MAX_BYTES = 20 * 1024 * 1024

export async function POST(request: Request) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const ok = await isSuperAdmin(user.id)
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const url = body?.url as string | undefined

  if (!url) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  let response: Response
  try {
    response = await fetch(url, { signal: controller.signal })
  } catch {
    clearTimeout(timeout)
    return NextResponse.json({ error: 'Could not fetch image' }, { status: 400 })
  }
  clearTimeout(timeout)

  if (!response.ok) {
    return NextResponse.json({ error: 'Could not fetch image' }, { status: 400 })
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_BYTES) {
    return NextResponse.json({ error: 'Image too large (max 20MB)' }, { status: 413 })
  }

  const mimeType = response.headers.get('content-type') ?? ''
  if (!mimeType.startsWith('image/')) {
    return NextResponse.json({ error: 'URL does not point to an image' }, { status: 400 })
  }

  const isGif = mimeType === 'image/gif'

  if (isGif) {
    const arrayBuffer = await response.arrayBuffer()
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'X-Is-Gif': 'true',
      },
    })
  }

  // PNG conversion via sharp: normalizes all non-gif fetches to PNG.
  const buffer = Buffer.from(await response.arrayBuffer())
  const pngBuffer = await sharp(buffer).png().toBuffer()

  return new NextResponse(new Uint8Array(pngBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'X-Is-Gif': 'false',
      'X-Original-Mime': mimeType,
    },
  })
}
