'use server'

import { Resend } from 'resend'
import { getAdminClient } from '@/lib/supabase/adminClient'

const VALID_CANONS = [
  'charmed', 'buffy', 'the_craft', 'practical_magic',
  'ahs_coven', 'chilling_adventures', 'secret_circle',
  'witches_of_east_end', 'motherland_fort_salem',
  'discovery_of_witches', 'sabrina_90s',
] as const

type Canon = typeof VALID_CANONS[number]

export async function joinWaitlist(
  formData: FormData
): Promise<{ error: string } | { success: true }> {
  const name  = (formData.get('name')  as string | null)?.trim() ?? ''
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const canon = (formData.get('canon') as string | null)?.trim() ?? ''

  if (!name || name.length < 2 || name.length > 50) {
    return { error: 'Please enter your name (2–50 characters).' }
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }
  if (!VALID_CANONS.includes(canon as Canon)) {
    return { error: 'Please select a show.' }
  }

  const admin = getAdminClient()

  // Duplicate check
  const { data: existing } = await admin
    .from('waitlist_signups')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return { error: 'This email is already on the waitlist.' }
  }

  // Add to Resend audience (best-effort)
  let resendId: string | null = null
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data: contact, error: resendError } = await resend.contacts.create({
      audienceId: process.env.RESEND_AUDIENCE_ID!,
      email,
      firstName: name,
      unsubscribed: false,
    })
    if (resendError) {
      console.error('[waitlist] Resend contact create failed:', resendError)
    } else {
      resendId = contact?.id ?? null
    }
  } catch (err) {
    console.error('[waitlist] Resend threw:', err)
  }

  // Insert into DB
  const { error: insertError } = await admin
    .from('waitlist_signups')
    .insert({ email, name, canon, resend_id: resendId })

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'This email is already on the waitlist.' }
    }
    console.error('[waitlist] Insert failed:', insertError)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}
