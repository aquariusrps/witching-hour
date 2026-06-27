'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { grantRole, revokeRole } from '@/lib/actions/admin-roles'

type UserRole = {
  id: string
  scope_id: string | null
  granted_at: string | null
  roles: {
    id: string
    name: string
    display_name: string
    is_invisible: boolean
    is_permanent: boolean
  } | null
}

type Faction = {
  id: string
  name: string
  color_hex: string
}

const FUNCTIONAL_ADMIN_ROLES = [
  { label: 'Character Approvals', name: 'character_manager' },
  { label: 'Faction Manager', name: 'faction_manager' },
  { label: 'Board Manager', name: 'board_manager' },
  { label: 'Events Manager', name: 'events_manager' },
  { label: 'Apothecary Manager', name: 'apothecary_manager' },
  { label: 'Site Settings', name: 'settings_manager' },
  { label: 'Player Manager', name: 'player_manager' },
  { label: 'Ban Manager', name: 'ban_manager' },
] as const

const OTHER_ROLE_OPTIONS = [
  { label: 'Moderator', name: 'moderator', needsFaction: false },
  { label: 'Lore Keeper', name: 'lore_keeper', needsFaction: false },
  { label: 'Founding Member', name: 'founding_member', needsFaction: false },
  { label: 'Faction Leader', name: 'faction_leader', needsFaction: true },
] as const

export function RoleManager({
  targetUserId,
  targetDisplayName,
  initialRoles,
  factions,
}: {
  targetUserId: string
  targetDisplayName: string
  initialRoles: UserRole[]
  factions: Faction[]
}) {
  const router = useRouter()
  const [roles, setRoles] = useState(initialRoles)
  const [loadingRoles, setLoadingRoles] = useState<Record<string, boolean>>({})
  const [grantingAdmin, setGrantingAdmin] = useState(false)
  const [grantingOther, setGrantingOther] = useState(false)
  const [selectedOtherRole, setSelectedOtherRole] = useState<string>('moderator')
  const [selectedFaction, setSelectedFaction] = useState<string>(factions[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function setLoading(role: string, val: boolean) {
    setLoadingRoles((prev) => ({ ...prev, [role]: val }))
  }

  const hasRole = (name: string) =>
    roles.some((r) => r.roles?.name === name)

  const findUserRole = (name: string) =>
    roles.find((r) => r.roles?.name === name)

  const handleCheckboxToggle = async (roleName: string, checked: boolean) => {
    setLoading(roleName, true)
    setError(null)
    setMessage(null)

    if (checked) {
      const result = await grantRole(targetUserId, roleName)
      setLoading(roleName, false)
      if ('error' in result) {
        setError(result.error ?? null)
      } else {
        setMessage(`${roleName.replace('_', ' ')} granted.`)
        router.refresh()
      }
    } else {
      const userRole = findUserRole(roleName)
      if (!userRole) { setLoading(roleName, false); return }
      const result = await revokeRole(userRole.id, targetUserId, roleName)
      setLoading(roleName, false)
      if ('error' in result) {
        setError(result.error ?? null)
      } else {
        setRoles((prev) => prev.filter((r) => r.id !== userRole.id))
        setMessage(`${roleName.replace('_', ' ')} revoked.`)
        router.refresh()
      }
    }
  }

  const handleGrantAdminBadge = async () => {
    setGrantingAdmin(true)
    setError(null)
    setMessage(null)
    const result = await grantRole(targetUserId, 'admin')
    setGrantingAdmin(false)
    if ('error' in result) {
      setError(result.error ?? null)
    } else {
      setMessage('Administrator badge granted.')
      router.refresh()
    }
  }

  const handleGrantOtherRole = async () => {
    setGrantingOther(true)
    setError(null)
    setMessage(null)
    const needsFaction = OTHER_ROLE_OPTIONS.find((r) => r.name === selectedOtherRole)?.needsFaction
    const scopeId = needsFaction && selectedFaction ? selectedFaction : undefined
    const result = await grantRole(targetUserId, selectedOtherRole, scopeId)
    setGrantingOther(false)
    if ('error' in result) {
      setError(result.error ?? null)
    } else {
      setMessage('Role granted.')
      router.refresh()
    }
  }

  const handleRevokeOtherRole = async (userRoleId: string, roleName: string) => {
    setLoading(userRoleId, true)
    setError(null)
    setMessage(null)
    const result = await revokeRole(userRoleId, targetUserId, roleName)
    setLoading(userRoleId, false)
    if ('error' in result) {
      setError(result.error ?? null)
    } else {
      setRoles((prev) => prev.filter((r) => r.id !== userRoleId))
      setMessage('Role revoked.')
      router.refresh()
    }
  }

  const otherRoleNames = OTHER_ROLE_OPTIONS.map((r) => r.name as string)
  const currentOtherRoles = roles.filter(
    (r) => r.roles && otherRoleNames.includes(r.roles.name)
  )
  const selectedOtherRoleNeedsFaction =
    OTHER_ROLE_OPTIONS.find((r) => r.name === selectedOtherRole)?.needsFaction ?? false

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.58rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          marginBottom: 2,
        }}>
          Managing roles for
        </div>
        <div style={{
          fontFamily: 'var(--f-body)',
          fontSize: '1.05rem',
          color: 'var(--roseash)',
        }}>
          {targetDisplayName}
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(200,56,24,0.1)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 4,
          padding: '10px 16px',
          marginBottom: 16,
          fontFamily: 'var(--f-body)',
          fontSize: '0.875rem',
          color: 'var(--ember)',
        }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{
          background: 'rgba(56,120,168,0.08)',
          border: '1px solid var(--moon-dim)',
          borderRadius: 4,
          padding: '10px 16px',
          marginBottom: 16,
          fontFamily: 'var(--f-body)',
          fontSize: '0.875rem',
          color: 'var(--moonstone)',
        }}>
          {message}
        </div>
      )}

      {/* ── SECTION 1: Administrator Access ── */}
      <div style={{
        borderLeft: '3px solid var(--gold)',
        paddingLeft: 20,
        marginBottom: 32,
      }}>
        <div style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: 16,
        }}>
          Administrator Access
        </div>

        {/* Admin badge */}
        <div style={{ marginBottom: 20 }}>
          {hasRole('admin') ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(224,176,40,0.08)',
              border: '1px solid var(--gold-dim)',
              borderRadius: 4,
              padding: '6px 14px',
            }}>
              <span style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>✦</span>
              <span style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}>
                Administrator Badge Active
              </span>
            </div>
          ) : (
            <button
              onClick={handleGrantAdminBadge}
              disabled={grantingAdmin}
              style={{
                background: 'rgba(224,176,40,0.08)',
                border: '1px solid var(--gold-dim)',
                borderRadius: 4,
                padding: '7px 18px',
                color: 'var(--gold)',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: grantingAdmin ? 'not-allowed' : 'pointer',
                opacity: grantingAdmin ? 0.6 : 1,
              }}
            >
              {grantingAdmin ? 'Granting…' : '+ Grant Administrator Badge'}
            </button>
          )}
        </div>

        {/* Functional admin permission checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FUNCTIONAL_ADMIN_ROLES.map(({ label, name }) => {
            const checked = hasRole(name)
            const isLoading = loadingRoles[name] ?? false
            return (
              <label
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: isLoading ? 'wait' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                <div style={{ position: 'relative', width: 16, height: 16, flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isLoading}
                    onChange={(e) => handleCheckboxToggle(name, e.target.checked)}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: 'var(--gold)',
                      cursor: isLoading ? 'wait' : 'pointer',
                    }}
                  />
                  {isLoading && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 10, color: 'var(--gold)' }}>◌</span>
                    </div>
                  )}
                </div>
                <span style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  color: checked ? 'var(--roseash)' : 'var(--mist)',
                }}>
                  {label}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* ── SECTION 2: Other Roles ── */}
      <div style={{
        borderLeft: '3px solid var(--moonstone)',
        paddingLeft: 20,
      }}>
        <div style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.6rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--moonstone)',
          marginBottom: 16,
        }}>
          Other Roles
        </div>

        {/* Current other roles */}
        {currentOtherRoles.length > 0 && (
          <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {currentOtherRoles.map((ur) => {
              const isLoading = loadingRoles[ur.id] ?? false
              return (
                <div
                  key={ur.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--raised)',
                    border: '1px solid var(--moon-dim)',
                    borderRadius: 4,
                    padding: '7px 12px',
                  }}
                >
                  <div>
                    <span style={{
                      fontFamily: 'var(--f-body)',
                      fontSize: '0.9rem',
                      color: 'var(--roseash)',
                    }}>
                      {ur.roles?.display_name}
                    </span>
                    {ur.scope_id && factions.length > 0 && (
                      <span style={{
                        fontFamily: 'var(--f-ui)',
                        fontSize: '0.55rem',
                        color: 'var(--faded)',
                        letterSpacing: '0.08em',
                        marginLeft: 8,
                      }}>
                        ({factions.find((f) => f.id === ur.scope_id)?.name ?? 'scoped'})
                      </span>
                    )}
                  </div>
                  {!ur.roles?.is_permanent && (
                    <button
                      onClick={() => handleRevokeOtherRole(ur.id, ur.roles?.name ?? '')}
                      disabled={isLoading}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--ember-dim)',
                        borderRadius: 3,
                        padding: '3px 10px',
                        color: 'var(--ember)',
                        fontFamily: 'var(--f-ui)',
                        fontSize: '0.58rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      {isLoading ? '…' : 'Revoke'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Grant other role */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.57rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
              marginBottom: 6,
            }}>
              Role
            </div>
            <select
              value={selectedOtherRole}
              onChange={(e) => setSelectedOtherRole(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--raised)',
                border: '1px solid var(--moon-dim)',
                borderRadius: 4,
                padding: '8px 12px',
                color: 'var(--roseash)',
                fontFamily: 'var(--f-body)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            >
              {OTHER_ROLE_OPTIONS.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {selectedOtherRoleNeedsFaction && factions.length > 0 && (
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.57rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--faded)',
                marginBottom: 6,
              }}>
                Faction
              </div>
              <select
                value={selectedFaction}
                onChange={(e) => setSelectedFaction(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--raised)',
                  border: '1px solid var(--moon-dim)',
                  borderRadius: 4,
                  padding: '8px 12px',
                  color: 'var(--roseash)',
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                {factions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleGrantOtherRole}
            disabled={grantingOther}
            style={{
              background: 'rgba(56,120,168,0.1)',
              border: '1px solid var(--moon-dim)',
              borderRadius: 4,
              padding: '8px 18px',
              color: 'var(--moonstone)',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: grantingOther ? 'not-allowed' : 'pointer',
              opacity: grantingOther ? 0.6 : 1,
              alignSelf: 'flex-end',
            }}
          >
            {grantingOther ? 'Granting…' : 'Grant Role'}
          </button>
        </div>
      </div>
    </div>
  )
}
