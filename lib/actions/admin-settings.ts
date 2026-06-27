'use server'

import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { hasPermission } from '@/lib/permissions'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function updateSiteSetting(key: string, value: string) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const canManage =
    await hasPermission(user.id, 'manage_site') ||
    await hasPermission(user.id, 'manage_waitlist')
  if (!canManage) return { error: 'Forbidden' }

  const admin = getAdminClient()
  const { error } = await admin
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) return { error: 'Failed to save setting' }

  revalidateTag('site-settings', {})
  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: true }
}

export async function updateMultipleSiteSettings(
  settings: Record<string, string>
) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const canManage = await hasPermission(user.id, 'manage_site')
  if (!canManage) return { error: 'Forbidden' }

  const admin = getAdminClient()
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await admin.from('site_settings').upsert(rows)

  if (error) return { error: 'Failed to save settings' }

  revalidateTag('site-settings', {})
  revalidatePath('/admin/settings')
  revalidatePath('/')
  return { success: true }
}
