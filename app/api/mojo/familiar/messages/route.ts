import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'
import { getMojoFamiliarMessages } from '@/lib/db/mojo'

export async function GET(request: Request) {
  // ── AUTH ── (same pattern as the main familiar route)
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const ok = await isSuperAdmin(user.id)
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
  }

  const messages = await getMojoFamiliarMessages(conversationId, 50)
  return NextResponse.json({ messages })
}
