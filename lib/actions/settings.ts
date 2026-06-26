'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerClient } from '@/lib/supabase/serverClient'

const VALID_THEMES = [
  'blood-moon',
  'silver-onyx',
  'victorian-apothecary',
  'crimson-athenaeum',
  'midnight-garden',
] as const

type Theme = typeof VALID_THEMES[number]

export async function updateTheme(theme: string): Promise<{ error: string } | { success: true }> {
  if (!VALID_THEMES.includes(theme as Theme)) {
    return { error: 'Invalid theme.' }
  }

  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('users')
    .update({ theme_preference: theme })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
