import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/adminClient'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = getAdminClient()

  const { data: row, error } = await admin
    .from('mojo_image_tokens')
    .select('storage_path, mime_type, expires_at')
    .eq('token', token)
    .single()

  if (error || !row) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return new NextResponse('Expired', { status: 410 })
  }

  const { data: file, error: downloadError } = await admin.storage
    .from('mojo-private')
    .download(row.storage_path)

  if (downloadError || !file) {
    return new NextResponse('Not found', { status: 404 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': row.mime_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Robots-Tag': 'noindex',
    },
  })
}
