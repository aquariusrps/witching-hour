import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await getServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      void sendWelcomeNotice(data.session.user.id)
      return NextResponse.redirect(new URL('/dashboard', origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=confirmation_failed', origin))
}

async function sendWelcomeNotice(userId: string): Promise<void> {
  try {
    const admin = getAdminClient()

    const { data: userRow } = await admin
      .from('users')
      .select('display_name')
      .eq('id', userId)
      .single()

    const displayName = userRow?.display_name ?? 'Initiate'

    // mail_messages table created in a future migration; cast bypasses missing type
    const rawAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    await rawAdmin.from('mail_messages').insert({
      sender_id: null,
      recipient_id: userId,
      subject: 'Welcome to The Witching Hour',
      body: `The circle is complete. Welcome, ${displayName}. Your journey begins now. Visit My Characters to create your first character and choose your faction.`,
      is_system_message: true,
      is_welcome: true,
    })
  } catch {
    // Fire-and-forget: fails silently until mail_messages migration is applied
  }
}
