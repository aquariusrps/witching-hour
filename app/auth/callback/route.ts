import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/serverClient'
import { createCouncilNotice } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await getServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const displayName =
        data.session.user.user_metadata?.display_name ??
        data.session.user.email?.split('@')[0] ??
        'Initiate'

      void createCouncilNotice({
        recipientId: data.session.user.id,
        subject: 'Welcome to The Witching Hour',
        body: `<p>The circle is complete. Welcome, ${displayName}.</p>
               <p>Your account is confirmed and the site is yours to
               explore. If you have questions, the Council is listening.</p>
               <p>— The Council</p>`,
        isWelcome: true,
      })

      return NextResponse.redirect(new URL('/dashboard', origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=confirmation_failed', origin))
}
