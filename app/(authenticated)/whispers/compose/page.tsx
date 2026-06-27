'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { findUserByDisplayName, sendWhisper } from '@/lib/actions/whispers'

export default function ComposePage() {
  const router = useRouter()

  const [recipientInput, setRecipientInput]   = useState('')
  const [recipientId, setRecipientId]         = useState('')
  const [recipientName, setRecipientName]     = useState('')
  const [recipientStatus, setRecipientStatus] = useState<
    'idle' | 'searching' | 'found' | 'not_found'
  >('idle')
  const [subject, setSubject] = useState('')
  const [body, setBody]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleRecipientBlur() {
    const trimmed = recipientInput.trim()
    if (!trimmed) {
      setRecipientStatus('idle')
      setRecipientId('')
      setRecipientName('')
      return
    }
    setRecipientStatus('searching')
    const result = await findUserByDisplayName(trimmed)
    if (result) {
      setRecipientId(result.id)
      setRecipientName(result.display_name)
      setRecipientStatus('found')
    } else {
      setRecipientId('')
      setRecipientName('')
      setRecipientStatus('not_found')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!recipientId) {
      setError('Please enter a valid recipient.')
      return
    }

    const fd = new FormData()
    fd.append('recipientId', recipientId)
    fd.append('subject', subject)
    fd.append('body', body)

    setLoading(true)
    const result = await sendWhisper(fd)
    setLoading(false)

    if ('error' in result) {
      setError((result as { error: string }).error)
      return
    }

    router.push('/whispers?sent=1')
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 22px' }}>

      <div style={{ marginBottom: 28 }}>
        <Link href="/whispers" style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.7rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
          textDecoration: 'none',
        }}>
          ← Back to Whispers
        </Link>
      </div>

      <h1 style={{
        fontFamily: 'var(--f-display)',
        fontWeight: 500,
        fontSize: '1.8rem',
        color: 'var(--roseash)',
        marginBottom: 32,
        letterSpacing: '0.02em',
      }}>
        Compose a Whisper
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Recipient */}
        <div>
          <label style={{
            display: 'block',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.68rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            marginBottom: 8,
          }}>
            Recipient
          </label>
          <input
            type="text"
            value={recipientInput}
            onChange={(e) => {
              setRecipientInput(e.target.value)
              setRecipientStatus('idle')
              setRecipientId('')
              setRecipientName('')
            }}
            onBlur={handleRecipientBlur}
            placeholder="Display name"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--raised)',
              border: `1px solid ${
                recipientStatus === 'found'
                  ? 'var(--gold-dim)'
                  : recipientStatus === 'not_found'
                  ? 'var(--ember-dim)'
                  : 'var(--border)'
              }`,
              borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--f-body)',
              fontSize: '0.92rem',
              color: 'var(--roseash)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {recipientStatus === 'searching' && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--faded)', marginTop: 6 }}>
              Searching…
            </p>
          )}
          {recipientStatus === 'found' && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--gold)', marginTop: 6 }}>
              ✓ {recipientName}
            </p>
          )}
          {recipientStatus === 'not_found' && (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--ember)', marginTop: 6 }}>
              User not found
            </p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label style={{
            display: 'block',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.68rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            marginBottom: 8,
          }}>
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            placeholder="Subject"
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--f-body)',
              fontSize: '0.92rem',
              color: 'var(--roseash)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Body */}
        <div>
          <label style={{
            display: 'block',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.68rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
            marginBottom: 8,
          }}>
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your whisper…"
            required
            rows={8}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'var(--raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--f-body)',
              fontSize: '0.95rem',
              color: 'var(--roseash)',
              lineHeight: 1.65,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p style={{
            fontFamily: 'var(--f-body)',
            fontSize: '0.85rem',
            color: 'var(--ember)',
            margin: 0,
          }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: loading ? 'var(--elevated)' : 'var(--ember)',
              color: 'var(--roseash)',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 'var(--r-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending…' : 'Send Whisper'}
          </button>
          <Link href="/whispers" style={{
            fontFamily: 'var(--f-body)',
            fontSize: '0.85rem',
            color: 'var(--faded)',
            textDecoration: 'none',
          }}>
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
