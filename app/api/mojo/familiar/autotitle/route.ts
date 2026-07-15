import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'
import { updateMojoFamiliarConversationTitle } from '@/lib/db/mojo'

const CLAUDE_MODEL = 'claude-sonnet-4-6'

export async function POST(request: Request) {
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

  const { conversationId, firstMessage } = await request.json()

  if (!conversationId || !firstMessage) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 30,
        messages: [{
          role: 'user',
          content: `Give this conversation a title of 3-5 words. Be specific and evocative. Return ONLY the title, no punctuation, no quotes.\n\nFirst message: "${String(firstMessage).slice(0, 200)}"`,
        }],
      }),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json()
    const title = data.content?.[0]?.text?.trim()

    if (title) {
      await updateMojoFamiliarConversationTitle(conversationId, title)
    }

    return NextResponse.json({ success: true, title })
  } catch {
    // Silent failure — title stays as "New Consultation"
    return NextResponse.json({ success: false })
  }
}
