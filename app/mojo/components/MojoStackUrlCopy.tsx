'use client'

import { useState } from 'react'

async function copyStackUrl(url: string): Promise<void> {
  await navigator.clipboard.writeText(url)
}

export default function MojoStackUrlCopy({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await copyStackUrl(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard failures
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '0.7rem',
          color: 'var(--faded)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {url}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--f-ui)',
          fontSize: '0.72rem',
          color: 'var(--moonstone)',
          flexShrink: 0,
        }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}
