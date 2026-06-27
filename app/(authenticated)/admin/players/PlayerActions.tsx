'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { banUser, unbanUser } from '@/lib/actions/admin-players'
import { revokeRole } from '@/lib/actions/admin-roles'

type RoleDisplay = {
  id: string
  roleName: string
  displayName: string
  isInvisible: boolean
  isPermanent: boolean
}

export function PlayerActions({
  targetUserId,
  targetDisplayName,
  isBanned: initialIsBanned,
  roles: initialRoles,
}: {
  targetUserId: string
  targetDisplayName: string
  isBanned: boolean
  roles: RoleDisplay[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banExpiry, setBanExpiry] = useState('')
  const [isBanned, setIsBanned] = useState(initialIsBanned)
  const [roles, setRoles] = useState(initialRoles)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const handleBan = async () => {
    setLoading(true)
    setError(null)
    const iso = banExpiry ? new Date(banExpiry).toISOString() : undefined
    const result = await banUser(targetUserId, banReason, iso)
    setLoading(false)
    if ('error' in result) {
      setError(result.error ?? null)
    } else {
      setIsBanned(true)
      setShowBanModal(false)
      setBanReason('')
      setBanExpiry('')
      setMessage('User has been banned.')
      router.refresh()
    }
  }

  const handleUnban = async () => {
    setLoading(true)
    setError(null)
    const result = await unbanUser(targetUserId)
    setLoading(false)
    if ('error' in result) {
      setError(result.error ?? null)
    } else {
      setIsBanned(false)
      setMessage('Ban has been removed.')
      router.refresh()
    }
  }

  const handleRevoke = async (userRoleId: string, roleName: string) => {
    setRevokingId(userRoleId)
    setError(null)
    const result = await revokeRole(userRoleId, targetUserId, roleName)
    setRevokingId(null)
    if ('error' in result) {
      setError(result.error ?? null)
    } else {
      setRoles((prev) => prev.filter((r) => r.id !== userRoleId))
      router.refresh()
    }
  }

  return (
    <div>
      {/* Role list */}
      {roles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            marginBottom: 10,
          }}>
            Roles
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {roles.map((role) => (
              <div
                key={role.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--raised)',
                  border: '1px solid var(--ember-dim)',
                  borderRadius: 4,
                  padding: '6px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.9rem',
                    color: 'var(--roseash)',
                  }}>
                    {role.displayName}
                  </span>
                  {role.isInvisible && (
                    <span style={{
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--faded)',
                      border: '1px solid var(--ember-dim)',
                      borderRadius: 2,
                      padding: '1px 5px',
                    }}>
                      Staff
                    </span>
                  )}
                  {role.isPermanent && (
                    <span style={{
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                      border: '1px solid var(--gold-dim)',
                      borderRadius: 2,
                      padding: '1px 5px',
                    }}>
                      Permanent
                    </span>
                  )}
                </div>
                {!role.isPermanent && (
                  <button
                    onClick={() => handleRevoke(role.id, role.roleName)}
                    disabled={revokingId === role.id}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--ember-dim)',
                      borderRadius: 3,
                      padding: '3px 10px',
                      color: 'var(--ember)',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: revokingId === role.id ? 'not-allowed' : 'pointer',
                      opacity: revokingId === role.id ? 0.5 : 1,
                    }}
                  >
                    {revokingId === role.id ? '…' : 'Revoke'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {roles.length === 0 && (
        <p style={{
          fontFamily: 'var(--f-body)',
          fontStyle: 'italic',
          color: 'var(--faded)',
          fontSize: '0.875rem',
          marginBottom: 20,
        }}>
          No roles assigned.
        </p>
      )}

      {/* Ban status */}
      {isBanned && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(200,56,24,0.1)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 4,
          padding: '5px 12px',
          marginBottom: 16,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ember)', display: 'inline-block' }} />
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--ember)',
          }}>
            IP Banned
          </span>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--ember)', fontFamily: 'var(--f-body)', fontSize: '0.875rem', marginBottom: 12 }}>
          {error}
        </p>
      )}
      {message && (
        <p style={{ color: 'var(--moonstone)', fontFamily: 'var(--f-body)', fontSize: '0.875rem', marginBottom: 12 }}>
          {message}
        </p>
      )}

      {/* Ban / Unban */}
      <div style={{ marginTop: 4 }}>
        <div style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.6rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          marginBottom: 10,
        }}>
          Account Actions
        </div>
        {!isBanned ? (
          <button
            onClick={() => { setShowBanModal(true); setError(null); setMessage(null) }}
            style={{
              background: 'transparent',
              border: '1px solid var(--ember-dim)',
              borderRadius: 4,
              padding: '7px 18px',
              color: 'var(--ember)',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Ban User
          </button>
        ) : (
          <button
            onClick={handleUnban}
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid var(--moon-dim)',
              borderRadius: 4,
              padding: '7px 18px',
              color: 'var(--moonstone)',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Removing…' : 'Remove Ban'}
          </button>
        )}
      </div>

      {/* Ban confirm modal */}
      {showBanModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.72)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            background: 'var(--elevated)',
            border: '1px solid var(--ember-dim)',
            borderRadius: 7,
            padding: 32,
            width: '100%',
            maxWidth: 460,
          }}>
            <h3 style={{
              fontFamily: 'var(--f-heading)',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--roseash)',
              marginTop: 0,
              marginBottom: 6,
            }}>
              Ban {targetDisplayName}
            </h3>
            <p style={{
              fontFamily: 'var(--f-body)',
              fontSize: '0.875rem',
              color: 'var(--mist)',
              marginTop: 0,
              marginBottom: 22,
            }}>
              This will ban the user&apos;s IP address and sign them out immediately.
              The proxy enforces IP bans on every request.
            </p>

            <label style={{ display: 'block', marginBottom: 16 }}>
              <span style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--faded)',
                display: 'block',
                marginBottom: 6,
              }}>
                Reason *
              </span>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="State the reason for this ban…"
                style={{
                  width: '100%',
                  background: 'var(--raised)',
                  border: '1px solid var(--ember-dim)',
                  borderRadius: 4,
                  padding: '8px 12px',
                  color: 'var(--roseash)',
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 24 }}>
              <span style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--faded)',
                display: 'block',
                marginBottom: 6,
              }}>
                Expires — leave blank for permanent
              </span>
              <input
                type="datetime-local"
                value={banExpiry}
                onChange={(e) => setBanExpiry(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--raised)',
                  border: '1px solid var(--ember-dim)',
                  borderRadius: 4,
                  padding: '8px 12px',
                  color: 'var(--roseash)',
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  colorScheme: 'dark',
                }}
              />
            </label>

            {error && (
              <p style={{ color: 'var(--ember)', fontFamily: 'var(--f-body)', fontSize: '0.875rem', marginBottom: 16 }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowBanModal(false); setError(null) }}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--ember-dim)',
                  borderRadius: 4,
                  padding: '7px 18px',
                  color: 'var(--mist)',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={loading || !banReason.trim()}
                style={{
                  background: banReason.trim() && !loading ? 'var(--ember)' : 'var(--ember-dim)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '7px 22px',
                  color: '#fff',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: loading || !banReason.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Banning…' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
