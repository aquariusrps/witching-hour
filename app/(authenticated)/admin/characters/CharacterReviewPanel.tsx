'use client'

import { useState } from 'react'
import {
  approveCharacter,
  rejectCharacter,
  requestRevision,
} from '@/lib/actions/admin-characters'

type Props = {
  characterId:   string
  characterName: string
  currentStatus: string
}

type ModalType = null | 'approve' | 'revision' | 'reject' | 'suspend' | 'reactivate'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--char)',
  border: '1px solid var(--ember-dim)',
  borderRadius: 4,
  padding: '10px 12px',
  color: 'var(--roseash)',
  fontFamily: 'var(--f-body)',
  fontSize: '0.875rem',
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--f-ui)',
  fontSize: '0.58rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: 'var(--faded)',
  display: 'block',
  marginBottom: 8,
}

export function CharacterReviewPanel({ characterId, characterName, currentStatus }: Props) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // Approve state
  const [approveLoading, setApproveLoading] = useState(false)
  const [approveError,   setApproveError]   = useState<string | null>(null)

  // Revision state
  const [revisionFeedback, setRevisionFeedback] = useState('')
  const [revisionLoading,  setRevisionLoading]  = useState(false)
  const [revisionError,    setRevisionError]    = useState<string | null>(null)

  // Reject state
  const [rejectReason,  setRejectReason]  = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const [rejectError,   setRejectError]   = useState<string | null>(null)

  // Suspend state (reuse reject action — sets status to 'suspended')
  const [suspendReason,  setSuspendReason]  = useState('')
  const [suspendLoading, setSuspendLoading] = useState(false)
  const [suspendError,   setSuspendError]   = useState<string | null>(null)

  // Reactivate state (reuse approve action — sets status to 'active')
  const [reactivateLoading, setReactivateLoading] = useState(false)
  const [reactivateError,   setReactivateError]   = useState<string | null>(null)

  function closeModal() {
    setActiveModal(null)
    setApproveError(null)
    setRevisionFeedback('')
    setRevisionError(null)
    setRejectReason('')
    setRejectError(null)
    setSuspendReason('')
    setSuspendError(null)
    setReactivateError(null)
  }

  async function handleApprove() {
    setApproveLoading(true)
    setApproveError(null)
    const result = await approveCharacter(characterId)
    setApproveLoading(false)
    if ('error' in result) {
      setApproveError(result.error)
    } else {
      window.location.href = '/admin/characters'
    }
  }

  async function handleRevision() {
    setRevisionLoading(true)
    setRevisionError(null)
    const result = await requestRevision(characterId, revisionFeedback)
    setRevisionLoading(false)
    if ('error' in result) {
      setRevisionError(result.error)
    } else {
      window.location.href = '/admin/characters'
    }
  }

  async function handleReject() {
    setRejectLoading(true)
    setRejectError(null)
    const result = await rejectCharacter(characterId, rejectReason)
    setRejectLoading(false)
    if ('error' in result) {
      setRejectError(result.error)
    } else {
      window.location.href = '/admin/characters'
    }
  }

  async function handleSuspend() {
    setSuspendLoading(true)
    setSuspendError(null)
    const result = await rejectCharacter(characterId, suspendReason)
    setSuspendLoading(false)
    if ('error' in result) {
      setSuspendError(result.error)
    } else {
      window.location.href = '/admin/characters'
    }
  }

  async function handleReactivate() {
    setReactivateLoading(true)
    setReactivateError(null)
    const result = await approveCharacter(characterId)
    setReactivateLoading(false)
    if ('error' in result) {
      setReactivateError(result.error)
    } else {
      window.location.href = '/admin/characters'
    }
  }

  const isReviewable = currentStatus === 'pending' || currentStatus === 'needs_revision'
  const isActive     = currentStatus === 'active'
  const isSuspended  = currentStatus === 'suspended'

  return (
    <>
      {/* Action buttons */}
      <div>
        <div style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.58rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          marginBottom: 12,
        }}>
          Actions
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isReviewable && (
            <>
              <button
                onClick={() => setActiveModal('approve')}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '9px 20px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Approve
              </button>
              <button
                onClick={() => setActiveModal('revision')}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--ember)',
                  color: 'var(--ember)',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '9px 20px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Request Revision
              </button>
              <button
                onClick={() => setActiveModal('reject')}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--ember-dim)',
                  color: 'var(--faded)',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '9px 20px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
            </>
          )}
          {isActive && (
            <button
              onClick={() => setActiveModal('suspend')}
              style={{
                background: 'transparent',
                border: '1px solid var(--ember)',
                color: 'var(--ember)',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '9px 20px',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Suspend Character
            </button>
          )}
          {isSuspended && (
            <button
              onClick={() => setActiveModal('reactivate')}
              style={{
                background: 'transparent',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '9px 20px',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Reactivate Character
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16,8,8,0.75)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--elevated)',
              border: '0.5px solid var(--ember-dim)',
              borderRadius: 7,
              padding: 28,
              width: '100%',
              maxWidth: 480,
            }}
          >

            {/* ── Approve ── */}
            {activeModal === 'approve' && (
              <>
                <h3 style={{
                  fontFamily: 'var(--f-head)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--roseash)',
                  margin: '0 0 8px',
                }}>
                  Approve Character
                </h3>
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  color: 'var(--mist)',
                  margin: '0 0 24px',
                  lineHeight: 1.6,
                }}>
                  Approve <strong style={{ color: 'var(--roseash)' }}>{characterName}</strong>?
                  Their status will be set to Active and they will be notified.
                </p>
                {approveError && (
                  <p style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.82rem',
                    color: 'var(--ember)',
                    margin: '0 0 16px',
                  }}>
                    {approveError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={closeModal} style={{
                    background: 'transparent',
                    border: '1px solid var(--ember-dim)',
                    color: 'var(--faded)',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '8px 18px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={approveLoading}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold)',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '8px 18px',
                      borderRadius: 4,
                      cursor: approveLoading ? 'not-allowed' : 'pointer',
                      opacity: approveLoading ? 0.6 : 1,
                    }}
                  >
                    {approveLoading ? 'Approving…' : 'Approve'}
                  </button>
                </div>
              </>
            )}

            {/* ── Request Revision ── */}
            {activeModal === 'revision' && (
              <>
                <h3 style={{
                  fontFamily: 'var(--f-head)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--roseash)',
                  margin: '0 0 8px',
                }}>
                  Request Revision
                </h3>
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  color: 'var(--mist)',
                  margin: '0 0 18px',
                  lineHeight: 1.6,
                }}>
                  Send feedback to the player for <strong style={{ color: 'var(--roseash)' }}>{characterName}</strong>.
                  They will be notified and asked to revise.
                </p>
                <label style={labelStyle}>Feedback</label>
                <textarea
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  rows={5}
                  placeholder="Describe what needs to be changed…"
                  style={inputStyle}
                />
                {revisionError && (
                  <p style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.82rem',
                    color: 'var(--ember)',
                    margin: '10px 0 0',
                  }}>
                    {revisionError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={closeModal} style={{
                    background: 'transparent',
                    border: '1px solid var(--ember-dim)',
                    color: 'var(--faded)',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '8px 18px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleRevision}
                    disabled={revisionLoading || !revisionFeedback.trim()}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--ember)',
                      color: 'var(--ember)',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '8px 18px',
                      borderRadius: 4,
                      cursor: (revisionLoading || !revisionFeedback.trim()) ? 'not-allowed' : 'pointer',
                      opacity: (revisionLoading || !revisionFeedback.trim()) ? 0.6 : 1,
                    }}
                  >
                    {revisionLoading ? 'Sending…' : 'Send Feedback'}
                  </button>
                </div>
              </>
            )}

            {/* ── Reject ── */}
            {activeModal === 'reject' && (
              <>
                <h3 style={{
                  fontFamily: 'var(--f-head)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--roseash)',
                  margin: '0 0 8px',
                }}>
                  Reject Character
                </h3>
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  color: 'var(--mist)',
                  margin: '0 0 18px',
                  lineHeight: 1.6,
                }}>
                  Reject <strong style={{ color: 'var(--roseash)' }}>{characterName}</strong>?
                  Their status will be set to Suspended and they will be notified with the reason.
                </p>
                <label style={labelStyle}>Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder="Explain why this character cannot be approved…"
                  style={inputStyle}
                />
                {rejectError && (
                  <p style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.82rem',
                    color: 'var(--ember)',
                    margin: '10px 0 0',
                  }}>
                    {rejectError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={closeModal} style={{
                    background: 'transparent',
                    border: '1px solid var(--ember-dim)',
                    color: 'var(--faded)',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '8px 18px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejectLoading || !rejectReason.trim()}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--ember-dim)',
                      color: 'var(--faded)',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '8px 18px',
                      borderRadius: 4,
                      cursor: (rejectLoading || !rejectReason.trim()) ? 'not-allowed' : 'pointer',
                      opacity: (rejectLoading || !rejectReason.trim()) ? 0.6 : 1,
                    }}
                  >
                    {rejectLoading ? 'Rejecting…' : 'Reject Character'}
                  </button>
                </div>
              </>
            )}

            {/* ── Suspend (active character) ── */}
            {activeModal === 'suspend' && (
              <>
                <h3 style={{
                  fontFamily: 'var(--f-head)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--roseash)',
                  margin: '0 0 8px',
                }}>
                  Suspend Character
                </h3>
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  color: 'var(--mist)',
                  margin: '0 0 18px',
                  lineHeight: 1.6,
                }}>
                  Suspend <strong style={{ color: 'var(--roseash)' }}>{characterName}</strong>?
                  This will mark them inactive and notify the player.
                </p>
                <label style={labelStyle}>Reason</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={4}
                  placeholder="Reason for suspension…"
                  style={inputStyle}
                />
                {suspendError && (
                  <p style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.82rem',
                    color: 'var(--ember)',
                    margin: '10px 0 0',
                  }}>
                    {suspendError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={closeModal} style={{
                    background: 'transparent',
                    border: '1px solid var(--ember-dim)',
                    color: 'var(--faded)',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '8px 18px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleSuspend}
                    disabled={suspendLoading || !suspendReason.trim()}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--ember)',
                      color: 'var(--ember)',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '8px 18px',
                      borderRadius: 4,
                      cursor: (suspendLoading || !suspendReason.trim()) ? 'not-allowed' : 'pointer',
                      opacity: (suspendLoading || !suspendReason.trim()) ? 0.6 : 1,
                    }}
                  >
                    {suspendLoading ? 'Suspending…' : 'Suspend'}
                  </button>
                </div>
              </>
            )}

            {/* ── Reactivate (suspended character) ── */}
            {activeModal === 'reactivate' && (
              <>
                <h3 style={{
                  fontFamily: 'var(--f-head)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--roseash)',
                  margin: '0 0 8px',
                }}>
                  Reactivate Character
                </h3>
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '0.9rem',
                  color: 'var(--mist)',
                  margin: '0 0 24px',
                  lineHeight: 1.6,
                }}>
                  Reactivate <strong style={{ color: 'var(--roseash)' }}>{characterName}</strong>?
                  Their status will return to Active and they will be notified.
                </p>
                {reactivateError && (
                  <p style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.82rem',
                    color: 'var(--ember)',
                    margin: '0 0 16px',
                  }}>
                    {reactivateError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={closeModal} style={{
                    background: 'transparent',
                    border: '1px solid var(--ember-dim)',
                    color: 'var(--faded)',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '8px 18px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleReactivate}
                    disabled={reactivateLoading}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--gold)',
                      color: 'var(--gold)',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '8px 18px',
                      borderRadius: 4,
                      cursor: reactivateLoading ? 'not-allowed' : 'pointer',
                      opacity: reactivateLoading ? 0.6 : 1,
                    }}
                  >
                    {reactivateLoading ? 'Reactivating…' : 'Reactivate'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
