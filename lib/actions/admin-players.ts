'use server'

import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { hasPermission, isSuperAdmin } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

export async function searchUsers(query: string) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const canSearch = await hasPermission(user.id, 'manage_users')
  if (!canSearch) return { error: 'Forbidden' }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('users')
    .select(`
      id,
      display_name,
      avatar_url,
      created_at,
      user_roles (
        id,
        scope_id,
        roles (
          name,
          display_name,
          is_invisible
        )
      )
    `)
    .ilike('display_name', `%${query}%`)
    .order('display_name')
    .limit(20)

  if (error) return { error: 'Search failed' }
  return { data }
}

// Q1: grantEssence deferred — users.essence column does not exist yet.
// Apply a migration to add `essence integer not null default 0` and
// `last_offering_at timestamptz` to the users table, then implement:
//
// export async function grantEssence(
//   targetUserId: string,
//   amount: number,
//   reason: string
// ) { ... }
//
// The action should:
// 1. Call rpc('increment_user_essence', { p_user_id, p_amount })
// 2. Insert a row into essence_log (user_id, amount, reason, awarded_by)
// 3. revalidatePath('/admin/players')

export async function banUser(
  targetUserId: string,
  reason: string,
  expiresAt?: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const canBan = await hasPermission(user.id, 'ban_users')
  if (!canBan) return { error: 'Forbidden' }

  if (!reason?.trim()) {
    return { error: 'A reason is required' }
  }

  if (targetUserId === user.id) {
    return { error: 'You cannot ban yourself' }
  }

  const targetIsSuperAdmin = await isSuperAdmin(targetUserId)
  if (targetIsSuperAdmin) {
    return { error: 'Super Admin accounts cannot be banned' }
  }

  const admin = getAdminClient()

  const { data: session } = await admin
    .from('session_logs')
    .select('ip_address')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!session?.ip_address) {
    return {
      error: 'No session found for this user. Cannot determine IP address to ban.',
    }
  }

  const { error: banError } = await admin
    .from('ip_bans')
    .upsert(
      {
        ip_address: session.ip_address,
        reason: reason.trim(),
        banned_by: user.id,
        expires_at: expiresAt ?? null,
      },
      { onConflict: 'ip_address' }
    )

  if (banError) return { error: 'Failed to create IP ban' }

  const { error: signOutError } = await admin.auth.admin.signOut(targetUserId)

  if (signOutError) {
    console.error('[banUser] session invalidation failed:', signOutError.message)
  }

  revalidatePath('/admin/players')
  return { success: true }
}

export async function unbanUser(targetUserId: string): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const canBan = await hasPermission(user.id, 'ban_users')
  if (!canBan) return { error: 'Forbidden' }

  const admin = getAdminClient()

  const { data: session } = await admin
    .from('session_logs')
    .select('ip_address')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!session?.ip_address) {
    return { error: 'No session IP found for this user' }
  }

  const { error } = await admin
    .from('ip_bans')
    .delete()
    .eq('ip_address', session.ip_address)

  if (error) return { error: 'Failed to remove ban' }

  revalidatePath('/admin/players')
  return { success: true }
}

export async function checkIsBanned(targetUserId: string): Promise<boolean> {
  const admin = getAdminClient()

  const { data: session } = await admin
    .from('session_logs')
    .select('ip_address')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!session?.ip_address) return false

  const { data: ban } = await admin
    .from('ip_bans')
    .select('id')
    .eq('ip_address', session.ip_address)
    .maybeSingle()

  return !!ban
}
