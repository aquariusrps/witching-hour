'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getServerClient } from '@/lib/supabase/serverClient'

const DISPLAY_NAME_RE = /^[a-zA-Z0-9_-]{3,30}$/

export async function registerUser(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const email       = ((formData.get('email')            as string | null) ?? '').trim()
  const displayName = ((formData.get('display_name')     as string | null) ?? '').trim()
  const password    =  (formData.get('password')         as string | null) ?? ''
  const confirm     =  (formData.get('confirm_password') as string | null) ?? ''

  // Server-side validation mirrors client rules
  if (!email || !displayName || !password || !confirm) {
    return { error: 'All fields are required.' }
  }
  if (!DISPLAY_NAME_RE.test(displayName)) {
    return { error: 'Display name must be 3–30 characters: letters, numbers, underscores, hyphens only.' }
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  const admin = getAdminClient()

  // Check registration_open
  const { data: setting } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', 'registration_open')
    .single()

  if (!setting || setting.value !== 'true') {
    return { error: 'Registration is currently closed.' }
  }

  // Check display_name availability
  const { data: taken } = await admin
    .from('users')
    .select('id')
    .eq('display_name', displayName)
    .maybeSingle()

  if (taken) {
    return { error: 'That display name is already taken.' }
  }

  // Sign up — anon client, no cookies (avoids two-cookie conflict; just fires confirmation email)
  // display_name stored in raw_user_meta_data for future trigger use
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error: signUpError } = await anon.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  return { success: true }
}

export async function loginUser(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const email    = ((formData.get('email')    as string | null) ?? '').trim()
  const password =  (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signOut() {
  const supabase = await getServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
