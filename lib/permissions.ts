import { cache } from 'react'
import { getAdminClient } from '@/lib/supabase/adminClient'

export const isSuperAdmin = cache(
  async (userId: string): Promise<boolean> => {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('user_roles')
      .select('id, roles!inner(name)')
      .eq('user_id', userId)
    if (error || !data) return false
    return (data as Array<{ roles: { name: string } | null }>)
      .some((ur) => ur.roles?.name === 'super_admin')
  }
)

export async function isAdminOrSuperAdmin(userId: string): Promise<boolean> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('user_roles')
    .select('id, roles!inner(name)')
    .eq('user_id', userId)
  if (error || !data) return false
  return (data as Array<{ roles: { name: string } | null }>)
    .some((ur) => ['admin', 'super_admin'].includes(ur.roles?.name ?? ''))
}

type UserRoleRow = {
  scope_id: string | null
  roles: {
    role_permissions: Array<{
      is_enabled: boolean
      permissions: { name: string } | null
    }>
  } | null
}

const ROLE_SELECT = `
  scope_id,
  roles!inner (
    role_permissions!inner (
      is_enabled,
      permissions!inner (
        name
      )
    )
  )
` as const

/**
 * Check whether a user has a specific named permission.
 * For scoped roles (faction_leader, moderate_own_board),
 * pass scopeId to restrict the check to that scope.
 * Permission column is is_enabled — NEVER is_granted.
 */
export async function hasPermission(
  userId: string,
  permissionName: string,
  scopeId?: string
): Promise<boolean> {
  const admin = getAdminClient()

  const query = admin
    .from('user_roles')
    .select(ROLE_SELECT)
    .eq('user_id', userId)

  if (scopeId) {
    query.or(`scope_id.eq.${scopeId},scope_id.is.null`)
  }

  const { data, error } = await query

  if (error || !data) return false

  return (data as UserRoleRow[]).some((userRole) =>
    userRole.roles?.role_permissions?.some(
      (rp) =>
        rp.is_enabled === true &&
        rp.permissions?.name === permissionName
    )
  )
}

/**
 * Return all permission names a user holds (is_enabled = true).
 * Called once per request in layout.tsx to build the full
 * permission set without additional round trips.
 */
export const getUserPermissions = cache(
  async (userId: string): Promise<string[]> => {
    const admin = getAdminClient()

    const { data, error } = await admin
      .from('user_roles')
      .select(ROLE_SELECT)
      .eq('user_id', userId)

    if (error || !data) return []

    const perms = new Set<string>()

    for (const userRole of data as UserRoleRow[]) {
      for (const rp of userRole.roles?.role_permissions ?? []) {
        if (rp.is_enabled === true && rp.permissions?.name) {
          perms.add(rp.permissions.name)
        }
      }
    }

    return Array.from(perms)
  }
)
