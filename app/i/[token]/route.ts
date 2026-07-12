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

  if (!error && row) {
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

  // ── Stack lookup ──
  const { data: stack, error: stackError } = await admin
    .from('mojo_image_stacks')
    .select('id, rotation_mode, expires_at, last_served_index, last_served_member_id')
    .eq('token', token)
    .single()

  if (stackError || !stack) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Check stack expiry
  if (stack.expires_at && new Date(stack.expires_at) < new Date()) {
    return new NextResponse('Expired', { status: 410 })
  }

  // Fetch all members ordered by display_order ASC
  const { data: members } = await admin
    .from('mojo_image_stack_members')
    .select('id, storage_path, mime_type, weight, display_order')
    .eq('stack_id', stack.id)
    .order('display_order', { ascending: true })

  // Empty stack → 404
  if (!members || members.length === 0) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Select member based on rotation_mode
  let selectedMember = members[0] // fallback

  if (stack.rotation_mode === 'truly_random') {
    // Pure random — stateless
    const idx = Math.floor(Math.random() * members.length)
    selectedMember = members[idx]
  } else if (stack.rotation_mode === 'weighted') {
    // Weighted random — stateless
    // Build pool: each member appears weight times
    const pool: typeof members = []
    for (const m of members) {
      const w = Math.max(1, m.weight ?? 1)
      for (let i = 0; i < w; i++) pool.push(m)
    }
    const idx = Math.floor(Math.random() * pool.length)
    selectedMember = pool[idx]
  } else if (stack.rotation_mode === 'sequential') {
    // Sequential — reads and writes last_served_index
    const currentIndex = stack.last_served_index ?? -1
    const nextIndex = (currentIndex + 1) % members.length
    selectedMember = members[nextIndex]
    // Write new index BEFORE serving (fail-safe)
    await admin
      .from('mojo_image_stacks')
      .update({ last_served_index: nextIndex })
      .eq('id', stack.id)
  } else if (stack.rotation_mode === 'no_repeat') {
    // No immediate repeat — reads and writes last_served_member_id
    const lastId = stack.last_served_member_id
    const pool = members.filter((m) => m.id !== lastId)
    // If only one member or all filtered out, use full list
    const source = pool.length > 0 ? pool : members
    const idx = Math.floor(Math.random() * source.length)
    selectedMember = source[idx]
    // Write new last_served_member_id BEFORE serving
    await admin
      .from('mojo_image_stacks')
      .update({ last_served_member_id: selectedMember.id })
      .eq('id', stack.id)
  }

  // Download selected member from storage and serve
  const { data: fileData, error: fileError } = await admin.storage
    .from('mojo-private')
    .download(selectedMember.storage_path)

  if (fileError || !fileData) {
    return new NextResponse('Not found', { status: 404 })
  }

  const arrayBuffer = await fileData.arrayBuffer()
  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': selectedMember.mime_type,
      'Cache-Control': 'no-store', // stacks must NOT be cached — different image each request
      'X-Robots-Tag': 'noindex',
    },
  })
}
