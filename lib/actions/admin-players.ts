'use server'

import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { hasPermission, isSuperAdmin } from '@/lib/permissions'
import { createNotification } from '@/lib/notifications'
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

export async function grantEssence(
  targetUserId: string,
  amount: number,
  reason: string
): Promise<{ error: string } | { success: true; newBalance: number }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const canGrant =
    await hasPermission(user.id, 'manage_users') ||
    await hasPermission(user.id, 'award_xp')
  if (!canGrant) return { error: 'Forbidden' }

  if (!amount || amount <= 0) {
    return { error: 'Amount must be a positive number' }
  }
  if (!reason?.trim()) {
    return { error: 'A reason is required' }
  }

  const admin = getAdminClient()

  const { data: newBalance, error: rpcError } = await admin
    .rpc('increment_user_essence', {
      p_user_id: targetUserId,
      p_amount:  amount,
    })

  if (rpcError) {
    return { error: 'Failed to grant Essence' }
  }

  const { error: logError } = await admin
    .from('essence_log')
    .insert({
      user_id:    targetUserId,
      amount:     amount,
      reason:     reason.trim(),
      awarded_by: user.id,
    })

  if (logError) {
    console.error(
      '[grantEssence] log write failed:', logError.message
    )
  }

  return { success: true, newBalance: newBalance as number }
}

export async function awardXp(
  characterId: string,
  targetUserId: string,
  amount: number,
  reason: string
): Promise<{ error: string } | { success: true; newXp: number }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const canAward = await hasPermission(user.id, 'award_xp')
  if (!canAward) return { error: 'Forbidden' }

  if (!amount || amount <= 0) {
    return { error: 'Amount must be a positive number' }
  }
  if (!reason?.trim()) {
    return { error: 'A reason is required' }
  }

  const admin = getAdminClient()

  const { data: character } = await admin
    .from('characters')
    .select('id, name, user_id')
    .eq('id', characterId)
    .eq('user_id', targetUserId)
    .single()

  if (!character) {
    return { error: 'Character not found or does not belong to this user' }
  }

  const { data: newXp, error: rpcError } = await admin
    .rpc('award_character_xp', {
      p_character_id: characterId,
      p_amount:       amount,
    })

  if (rpcError) {
    return { error: 'Failed to award XP' }
  }

  const { error: logError } = await admin
    .from('character_xp_log')
    .insert({
      character_id: characterId,
      amount:       amount,
      reason:       reason.trim(),
      awarded_by:   user.id,
    })

  if (logError) {
    console.error(
      '[awardXp] log write failed:', logError.message
    )
  }

  void createNotification({
    userId: targetUserId,
    type:   'xp_awarded',
    title:  'XP Awarded',
    body:   `${amount} XP has been awarded to ${character.name}. Reason: ${reason.trim()}`,
    link:   `/characters/${characterId}`,
  })

  return { success: true, newXp: newXp as number }
}

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
