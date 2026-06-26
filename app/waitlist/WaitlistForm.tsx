'use client'

import { useState } from 'react'
import { joinWaitlist } from '@/lib/actions/waitlist'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 1rem',
  background: 'var(--raised)',
  border: '1px solid var(--ember-dim)',
  borderRadius: 2,
  color: 'var(--roseash)',
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function WaitlistForm() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [canon,   setCanon]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          fontWeight: 600,
          color: 'var(--gold)',
          marginBottom: '0.5rem',
        }}>
          You&apos;re on the list.
        </p>
        <p style={{
          fontFamily: 'EB Garamond, Georgia, serif',
          fontStyle: 'italic',
          fontSize: '1rem',
          color: 'var(--mist)',
        }}>
          We&apos;ll summon you when the circle opens.
        </p>
      </div>
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.append('name',  name)
    fd.append('email', email)
    fd.append('canon', canon)
    const result = await joinWaitlist(fd)
    if ('error' in result) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 340, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={INPUT_STYLE}
          onFocus={e  => { e.currentTarget.style.borderColor = 'var(--ember)' }}
          onBlur={e   => { e.currentTarget.style.borderColor = 'var(--ember-dim)' }}
        />

        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={INPUT_STYLE}
          onFocus={e  => { e.currentTarget.style.borderColor = 'var(--ember)' }}
          onBlur={e   => { e.currentTarget.style.borderColor = 'var(--ember-dim)' }}
        />

        <select
          value={canon}
          onChange={e => setCanon(e.target.value)}
          style={INPUT_STYLE}
          onFocus={e  => { e.currentTarget.style.borderColor = 'var(--ember)' }}
          onBlur={e   => { e.currentTarget.style.borderColor = 'var(--ember-dim)' }}
        >
          <option value="">Which show calls to you?</option>
          <option value="charmed">Charmed</option>
          <option value="buffy">Buffy the Vampire Slayer</option>
          <option value="angel">Angel</option>
          <option value="secret_circle">The Secret Circle</option>
          <option value="the_craft">The Craft</option>
          <option value="witches_of_east_end">Witches of East End</option>
          <option value="practical_magic">Practical Magic</option>
        </select>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: 'var(--ember)',
            color: 'var(--roseash)',
            fontFamily: 'Cinzel, serif',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            padding: '0.75rem 2rem',
            borderRadius: 2,
            width: '100%',
            cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Joining…' : 'Join the Waitlist'}
        </button>

        {error && (
          <p style={{
            fontFamily: 'EB Garamond, Georgia, serif',
            fontStyle: 'italic',
            color: 'var(--ember)',
            fontSize: '0.9rem',
            textAlign: 'center',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            {error}
          </p>
        )}
      </div>

      <p style={{
        fontFamily: 'EB Garamond, Georgia, serif',
        fontStyle: 'italic',
        color: 'var(--faded)',
        fontSize: '0.8rem',
        textAlign: 'center',
        marginTop: '0.75rem',
      }}>
        The circle opens soon.
      </p>
    </div>
  )
}
