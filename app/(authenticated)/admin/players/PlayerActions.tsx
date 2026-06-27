'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { banUser, unbanUser, grantEssence, awardXp } from '@/lib/actions/admin-players'
import { revokeRole } from '@/lib/actions/admin-roles'

type RoleDisplay = {
  id: string
  roleName: string
  displayName: string
  isInvisible: boolean
  isPermanent: boolean
}

type Character = {
  id: string
  name: string
  level: number
  xp: number
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--f-ui)',
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--faded)',
  marginBottom: 10,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--raised)',
  border: '1px solid var(--ember-dim)',
  borderRadius: 4,
  padding: '8px 12px',
  color: 'var(--roseash)',
  fontFamily: 'var(--f-body)',
  fontSize: '0.9rem',
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const fieldLabel: React.CSSProperties = {
  fontFamily: 'var(--f-ui)',
  fontSize: '0.6rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: 'var(--faded)',
  display: 'block',
  marginBottom: 6,
}

export function PlayerActions({
  targetUserId,
  targetDisplayName,
  isBanned: initialIsBanned,
  roles: initialRoles,
  essence: initialEssence,
  characters,
}: {
  targetUserId: string
  targetDisplayName: string
  isBanned: boolean
  roles: RoleDisplay[]
  essence: number
  characters: Character[]
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

  // Economy state — Essence
  const [essenceBalance, setEssenceBalance] = useState(initialEssence)
  const [essenceAmount, setEssenceAmount] = useState('')
  const [essenceReason, setEssenceReason] = useState('')
  const [essenceLoading, setEssenceLoading] = useState(false)
  const [essenceError, setEssenceError] = useState<string | null>(null)
  const [essenceSuccess, setEssenceSuccess] = useState<string | null>(null)

  // Economy state — XP
  const [selectedCharacterId, setSelectedCharacterId] = useState(characters[0]?.id ?? '')
  const [xpAmount, setXpAmount] = useState('')
  const [xpReason, setXpReason] = useState('')
  const [xpLoading, setXpLoading] = useState(false)
  const [xpError, setXpError] = useState<string | null>(null)
  const [xpSuccess, setXpSuccess] = useState<string | null>(null)

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

  const handleGrantEssence = async () => {
    setEssenceLoading(true)
    setEssenceError(null)
    setEssenceSuccess(null)
    const result = await grantEssence(targetUserId, Number(essenceAmount), essenceReason)
    setEssenceLoading(false)
    if ('error' in result) {
      setEssenceError(result.error)
    } else {
      setEssenceBalance(result.newBalance)
      setEssenceSuccess(`✦ ${essenceAmount} Essence granted. New balance: ${result.newBalance}`)
      setEssenceAmount('')
      setEssenceReason('')
      setTimeout(() => setEssenceSuccess(null), 3000)
    }
  }

  const handleAwardXp = async () => {
    setXpLoading(true)
    setXpError(null)
    setXpSuccess(null)
    const char = characters.find((c) => c.id === selectedCharacterId)
    const result = await awardXp(selectedCharacterId, targetUserId, Number(xpAmount), xpReason)
    setXpLoading(false)
    if ('error' in result) {
      setXpError(result.error)
    } else {
      setXpSuccess(`✦ ${xpAmount} XP awarded to ${char?.name ?? 'character'}. New total: ${result.newXp}`)
      setXpAmount('')
      setXpReason('')
      setTimeout(() => setXpSuccess(null), 3000)
    }
  }

  return (
    <div>
      {/* Role list */}
      {roles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionLabel}>Roles</div>
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
        <div style={sectionLabel}>Account Actions</div>
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

      {/* Economy section */}
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--ember-dim)' }}>

        {/* Grant Essence */}
        <div style={{ marginBottom: 28 }}>
          <div style={sectionLabel}>Grant Essence</div>

          <div style={{
            fontFamily: 'var(--f-body)',
            fontSize: '0.82rem',
            color: 'var(--mist)',
            marginBottom: 14,
          }}>
            Current Essence: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{essenceBalance}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'block' }}>
              <span style={fieldLabel}>Amount</span>
              <input
                type="number"
                min={1}
                value={essenceAmount}
                onChange={(e) => setEssenceAmount(e.target.value)}
                placeholder="e.g. 50"
                style={inputStyle}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span style={fieldLabel}>Reason</span>
              <input
                type="text"
                value={essenceReason}
                onChange={(e) => setEssenceReason(e.target.value)}
                placeholder="Reason for this Essence grant…"
                style={inputStyle}
              />
            </label>
          </div>

          {essenceError && (
            <p style={{ color: 'var(--ember)', fontFamily: 'var(--f-body)', fontSize: '0.82rem', marginTop: 8, marginBottom: 0 }}>
              {essenceError}
            </p>
          )}
          {essenceSuccess && (
            <p style={{ color: 'var(--gold)', fontFamily: 'var(--f-body)', fontSize: '0.82rem', marginTop: 8, marginBottom: 0 }}>
              {essenceSuccess}
            </p>
          )}

          <button
            onClick={handleGrantEssence}
            disabled={essenceLoading || !essenceAmount || Number(essenceAmount) <= 0 || !essenceReason.trim()}
            style={{
              marginTop: 12,
              background: essenceLoading || !essenceAmount || Number(essenceAmount) <= 0 || !essenceReason.trim()
                ? 'var(--gold-dim)'
                : 'var(--gold)',
              border: 'none',
              borderRadius: 4,
              padding: '7px 22px',
              color: 'var(--char)',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: essenceLoading ? 'not-allowed' : 'pointer',
              opacity: essenceLoading ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {essenceLoading ? 'Granting…' : 'Grant Essence'}
          </button>
        </div>

        {/* Award XP */}
        <div>
          <div style={sectionLabel}>Award XP</div>

          {characters.length === 0 ? (
            <p style={{
              fontFamily: 'var(--f-body)',
              fontStyle: 'italic',
              color: 'var(--faded)',
              fontSize: '0.875rem',
              margin: 0,
            }}>
              No active characters.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'block' }}>
                  <span style={fieldLabel}>Character</span>
                  <select
                    value={selectedCharacterId}
                    onChange={(e) => setSelectedCharacterId(e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                    }}
                  >
                    {characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Lv {c.level} — {c.xp} XP)
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'block' }}>
                  <span style={fieldLabel}>Amount</span>
                  <input
                    type="number"
                    min={1}
                    value={xpAmount}
                    onChange={(e) => setXpAmount(e.target.value)}
                    placeholder="e.g. 25"
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={fieldLabel}>Reason</span>
                  <input
                    type="text"
                    value={xpReason}
                    onChange={(e) => setXpReason(e.target.value)}
                    placeholder="Reason for this XP award…"
                    style={inputStyle}
                  />
                </label>
              </div>

              {xpError && (
                <p style={{ color: 'var(--ember)', fontFamily: 'var(--f-body)', fontSize: '0.82rem', marginTop: 8, marginBottom: 0 }}>
                  {xpError}
                </p>
              )}
              {xpSuccess && (
                <p style={{ color: 'var(--moonstone)', fontFamily: 'var(--f-body)', fontSize: '0.82rem', marginTop: 8, marginBottom: 0 }}>
                  {xpSuccess}
                </p>
              )}

              <button
                onClick={handleAwardXp}
                disabled={xpLoading || !xpAmount || Number(xpAmount) <= 0 || !xpReason.trim() || !selectedCharacterId}
                style={{
                  marginTop: 12,
                  background: 'transparent',
                  border: `1px solid ${xpLoading || !xpAmount || Number(xpAmount) <= 0 || !xpReason.trim() ? 'var(--moon-dim)' : 'var(--moonstone)'}`,
                  borderRadius: 4,
                  padding: '7px 22px',
                  color: xpLoading || !xpAmount || Number(xpAmount) <= 0 || !xpReason.trim()
                    ? 'var(--moon-dim)'
                    : 'var(--moonstone)',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: xpLoading ? 'not-allowed' : 'pointer',
                  opacity: xpLoading ? 0.7 : 1,
                }}
              >
                {xpLoading ? 'Awarding…' : 'Award XP'}
              </button>
            </>
          )}
        </div>
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
              fontFamily: 'var(--f-head)',
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
              <span style={{ ...fieldLabel, marginBottom: 6 }}>
                Reason *
              </span>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="State the reason for this ban…"
                style={inputStyle}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 24 }}>
              <span style={{ ...fieldLabel, marginBottom: 6 }}>
                Expires — leave blank for permanent
              </span>
              <input
                type="datetime-local"
                value={banExpiry}
                onChange={(e) => setBanExpiry(e.target.value)}
                style={{ ...inputStyle, colorScheme: 'dark' as const }}
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
