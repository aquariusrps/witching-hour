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

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 415 })
  }

  const mimeType = file.type
  if (!mimeType.startsWith('image/')) {
    return NextResponse.json({ error: 'File is not an image' }, { status: 415 })
  }

  const isGif = mimeType === 'image/gif'

  if (isGif) {
    const buffer = Buffer.from(await file.arrayBuffer())
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'X-Is-Gif': 'true',
        'X-Original-Mime': mimeType,
      },
    })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
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
