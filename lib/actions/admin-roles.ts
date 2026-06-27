'use server'

import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { hasPermission, isSuperAdmin } from '@/lib/permissions'
import { createNotification } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

const ADMIN_TIER_ROLES = [
  'admin',
  'super_admin',
  'character_manager',
  'faction_manager',
  'board_manager',
  'events_manager',
  'apothecary_manager',
  'settings_manager',
  'player_manager',
  'ban_manager',
] as const

function isAdminTier(name: string): boolean {
  return (ADMIN_TIER_ROLES as readonly string[]).includes(name)
}

export async function getUserRoles(targetUserId: string) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const canView = await hasPermission(user.id, 'manage_users')
  if (!canView) return { error: 'Forbidden' }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('user_roles')
    .select(`
      id,
      scope_id,
      granted_at,
      roles (
        id,
        name,
        display_name,
        is_invisible,
        is_permanent
      )
    `)
    .eq('user_id', targetUserId)

  if (error) return { error: 'Failed to fetch roles' }
  return { data }
}

export async function grantRole(
  targetUserId: string,
  roleName: string,
  scopeId?: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (isAdminTier(roleName)) {
    const canManageAdmins = await hasPermission(user.id, 'manage_admins')
    if (!canManageAdmins) {
      return { error: 'Only Super Admin can grant admin roles' }
    }
  } else {
    const canManageUsers = await hasPermission(user.id, 'manage_users')
    if (!canManageUsers) return { error: 'Forbidden' }
  }

  if (roleName === 'super_admin') {
    const granterIsSuperAdmin = await isSuperAdmin(user.id)
    if (!granterIsSuperAdmin) {
      return { error: 'Only a Super Admin can grant the Super Admin role' }
    }
  }

  const admin = getAdminClient()

  const { data: role } = await admin
    .from('roles')
    .select('id, display_name')
    .eq('name', roleName)
    .single()

  if (!role) return { error: `Role '${roleName}' not found` }

  const { data: existing } = await admin
    .from('user_roles')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('role_id', role.id)
    .maybeSingle()

  if (existing) {
    return { error: 'User already has this role' }
  }

  const { error } = await admin
    .from('user_roles')
    .insert({
      user_id: targetUserId,
      role_id: role.id,
      scope_id: scopeId ?? null,
      granted_by: user.id,
    })

  if (error) return { error: 'Failed to grant role' }

  void createNotification({
    userId: targetUserId,
    type: 'role_granted',
    title: 'Role Granted',
    body: `You have been granted the ${role.display_name} role.`,
    link: '/dashboard',
  })

  revalidatePath('/admin/roles')
  return { success: true }
}

export async function revokeRole(
  userRoleId: string,
  targetUserId: string,
  roleName: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (isAdminTier(roleName)) {
    const canManageAdmins = await hasPermission(user.id, 'manage_admins')
    if (!canManageAdmins) {
      return { error: 'Only Super Admin can revoke admin roles' }
    }
  } else {
    const canManageUsers = await hasPermission(user.id, 'manage_users')
    if (!canManageUsers) return { error: 'Forbidden' }
  }

  if (roleName === 'super_admin' && targetUserId === user.id) {
    return { error: 'You cannot revoke your own Super Admin role' }
  }

  const admin = getAdminClient()
  const { data: roleRow } = await admin
    .from('user_roles')
    .select('id, roles(is_permanent, display_name)')
    .eq('id', userRoleId)
    .single()

  if (!roleRow) return { error: 'Role grant not found' }

  const roleData = (roleRow.roles as unknown) as {
    is_permanent: boolean
    display_name: string
  } | null

  if (roleData?.is_permanent) {
    return {
      error: `The ${roleData.display_name} role is permanent and cannot be revoked`,
    }
  }

  const { error } = await admin
    .from('user_roles')
    .delete()
    .eq('id', userRoleId)

  if (error) return { error: 'Failed to revoke role' }

  void createNotification({
    userId: targetUserId,
    type: 'role_revoked',
    title: 'Role Removed',
    body: `The ${roleData?.display_name ?? roleName} role has been removed from your account.`,
    link: '/dashboard',
  })

  revalidatePath('/admin/roles')
  return { success: true }
}
