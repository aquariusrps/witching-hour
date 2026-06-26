'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/lib/actions/auth'

const DISPLAY_NAME_RE = /^[a-zA-Z0-9_ -]{3,30}$/

const ANIMATIONS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reg-fade { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
`

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  background: 'rgba(16,8,8,0.7)',
  border: '1px solid rgba(122,32,16,0.5)',
  borderRadius: '2px',
  color: 'var(--roseash)',
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Cinzel, serif',
  fontSize: '0.6rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--mist)',
  marginBottom: '0.375rem',
}

const FIELD_ERROR_STYLE: React.CSSProperties = {
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: '0.85rem',
  color: 'var(--ember)',
  marginTop: '0.25rem',
}

export default function RegisterForm() {
  const router = useRouter()

  const [email, setEmail]               = useState('')
  const [displayName, setDisplayName]   = useState('')
  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [loading, setLoading]           = useState(false)
  const [formError, setFormError]       = useState('')

  const [emailErr, setEmailErr]         = useState('')
  const [nameErr, setNameErr]           = useState('')
  const [passErr, setPassErr]           = useState('')
  const [confirmErr, setConfirmErr]     = useState('')

  function validate(): boolean {
    let ok = true
    setEmailErr(''); setNameErr(''); setPassErr(''); setConfirmErr(''); setFormError('')

    if (!email.trim()) { setEmailErr('Email is required.'); ok = false }
    if (!displayName.trim()) { setNameErr('Display name is required.'); ok = false }
    else if (!DISPLAY_NAME_RE.test(displayName)) {
      setNameErr('3–30 characters. Letters, numbers, spaces, hyphens, and underscores only.')
      ok = false
    }
    if (!password) { setPassErr('Password is required.'); ok = false }
    else if (password.length < 8) { setPassErr('Password must be at least 8 characters.'); ok = false }
    if (!confirm) { setConfirmErr('Please confirm your password.'); ok = false }
    else if (password && confirm && password !== confirm) {
      setConfirmErr('Passwords do not match.')
      ok = false
    }
    return ok
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const fd = new FormData()
      fd.set('email', email)
      fd.set('display_name', displayName)
      fd.set('password', password)
      fd.set('confirm_password', confirm)

      const result = await registerUser(fd)
      if ('error' in result) {
        setFormError(result.error)
      } else {
        router.push('/register/confirm')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{ANIMATIONS}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: [
          'radial-gradient(ellipse 65% 55% at top left,    rgba(200,56,24,0.12) 0%, transparent 60%)',
          'radial-gradient(ellipse 55% 60% at right center, rgba(224,176,40,0.09) 0%, transparent 60%)',
          'radial-gradient(ellipse 65% 50% at bottom center,rgba(56,120,168,0.07) 0%, transparent 60%)',
          'var(--char)',
        ].join(', '),
      }}>
        {/* Header — logo + site name */}
        <div className="reg-fade" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <svg
            aria-hidden="true"
            viewBox="0 0 38 38"
            fill="none"
            style={{
              width: 48, height: 48,
              display: 'block',
              margin: '0 auto 0.75rem',
              filter: 'drop-shadow(0 0 10px rgba(200,56,24,0.4))',
            }}
          >
            <circle cx="19" cy="19" r="17" stroke="#c83818" strokeWidth="0.5" opacity="0.4" />
            <circle cx="19" cy="19" r="13" fill="rgba(200,56,24,0.12)" stroke="#c83818" strokeWidth="0.8" opacity="0.7" />
            <circle cx="23" cy="17" r="10" fill="rgba(16,8,8,0.75)" />
            <polygon points="14,6 24,28 4,15 24,15 4,28" fill="none" stroke="#e0b028" strokeWidth="0.7" strokeLinejoin="round" opacity="0.8" />
            <circle cx="14" cy="19" r="1.5" fill="#c83818" opacity="0.8" />
            <circle cx="19" cy="2"  r="1" fill="#e0b028" opacity="0.45" />
            <circle cx="36" cy="19" r="1" fill="#e0b028" opacity="0.45" />
            <circle cx="19" cy="36" r="1" fill="#e0b028" opacity="0.45" />
            <circle cx="2"  cy="19" r="1" fill="#e0b028" opacity="0.45" />
          </svg>
          <span style={{
            fontFamily: 'Cormorant Upright, serif',
            fontWeight: 600,
            fontSize: '1.25rem',
            color: 'var(--gold)',
            letterSpacing: '0.02em',
          }}>
            The Witching Hour
          </span>
        </div>

        {/* Form card */}
        <div
          className="reg-fade"
          style={{
            width: '100%',
            maxWidth: 440,
            background: 'var(--claret)',
            border: '1px solid rgba(122,32,16,0.6)',
            borderRadius: '4px',
            padding: '2rem',
          }}
        >
          <h1 style={{
            fontFamily: 'Cormorant Upright, serif',
            fontWeight: 400,
            fontSize: '1.6rem',
            color: 'var(--roseash)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            Enter the Circle
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label htmlFor="email" style={LABEL_STYLE}>Email</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ ...INPUT_STYLE, borderColor: emailErr ? 'var(--ember)' : 'rgba(122,32,16,0.5)' }}
              />
              {emailErr && <p style={FIELD_ERROR_STYLE}>{emailErr}</p>}
            </div>

            {/* Display name */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label htmlFor="display_name" style={LABEL_STYLE}>Display Name</label>
              <input
                id="display_name"
                type="text"
                name="display_name"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={{ ...INPUT_STYLE, borderColor: nameErr ? 'var(--ember)' : 'rgba(122,32,16,0.5)' }}
              />
              <p style={{
                fontFamily: 'EB Garamond, Georgia, serif',
                fontSize: '0.8rem',
                color: 'var(--faded)',
                marginTop: '0.25rem',
              }}>
                3–30 characters. Letters, numbers, spaces, hyphens, and underscores only.
              </p>
              {nameErr && <p style={FIELD_ERROR_STYLE}>{nameErr}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label htmlFor="password" style={LABEL_STYLE}>Password</label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...INPUT_STYLE, borderColor: passErr ? 'var(--ember)' : 'rgba(122,32,16,0.5)' }}
              />
              {passErr && <p style={FIELD_ERROR_STYLE}>{passErr}</p>}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirm_password" style={LABEL_STYLE}>Confirm Password</label>
              <input
                id="confirm_password"
                type="password"
                name="confirm_password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                style={{ ...INPUT_STYLE, borderColor: confirmErr ? 'var(--ember)' : 'rgba(122,32,16,0.5)' }}
              />
              {confirmErr && <p style={FIELD_ERROR_STYLE}>{confirmErr}</p>}
            </div>

            {/* Form-level error */}
            {formError && (
              <p style={{
                fontFamily: 'EB Garamond, Georgia, serif',
                fontSize: '0.9rem',
                color: 'var(--ember)',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                {formError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? 'rgba(200,56,24,0.5)' : 'var(--ember)',
                color: 'var(--roseash)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                border: 'none',
                borderRadius: '2px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Entering…' : 'Enter the Circle'}
            </button>
          </form>

          {/* Login link */}
          <p style={{
            fontFamily: 'EB Garamond, Georgia, serif',
            fontSize: '0.9rem',
            color: 'var(--faded)',
            textAlign: 'center',
            marginTop: '1.25rem',
          }}>
            Already belong?{' '}
            <Link href="/login" style={{ color: 'var(--mist)', textDecoration: 'underline' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
