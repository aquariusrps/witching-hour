'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateMojoRp } from '@/lib/actions/mojo'

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-ui)',
  fontSize: '0.68rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  marginBottom: 4,
}

const INPUT_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  background: 'var(--raised)',
  color: 'var(--roseash)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
}

function navigateToRp(rpId: string) {
  window.location.href = '/mojo/rps/' + rpId
}

export default function MojoRpEditForm({
  rpId,
  name,
  siteName,
  siteUrl,
  colorHex,
  status,
}: {
  rpId: string
  name: string
  siteName: string
  siteUrl: string | null
  colorHex: string
  status: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [color, setColor] = useState(colorHex)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const result = await updateMojoRp(rpId, fd)

    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    navigateToRp(rpId)
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', color: 'var(--gold)', margin: '0 0 8px' }}>
          Edit RP
        </h1>
        <Link
          href={`/mojo/rps/${rpId}`}
          style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--faded)', textDecoration: 'none' }}
        >
          ← Back to RP
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={LABEL_STYLE}>RP Name *</label>
          <input name="name" type="text" defaultValue={name} required style={INPUT_STYLE} />
        </div>

        <div>
          <label style={LABEL_STYLE}>Site Name *</label>
          <input name="site_name" type="text" defaultValue={siteName} required style={INPUT_STYLE} />
        </div>

        <div>
          <label style={LABEL_STYLE}>Site URL</label>
          <input name="site_url" type="text" defaultValue={siteUrl ?? ''} style={INPUT_STYLE} />
        </div>

        <div>
          <label style={LABEL_STYLE}>Color</label>
          <input
            name="color_hex"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ ...INPUT_STYLE, padding: 2, height: 38, cursor: 'pointer' }}
          />
        </div>

        <div>
          <label style={LABEL_STYLE}>Status</label>
          <select name="status" defaultValue={status} style={INPUT_STYLE}>
            <option value="active">Active</option>
            <option value="hiatus">Hiatus</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {error && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--ember)', margin: 0 }}>
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--ember)',
              color: 'var(--roseash)',
              border: 'none',
              borderRadius: 2,
              padding: '8px 20px',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.8rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
