'use client'

import { useState } from 'react'
import MojoRichTextEditor from './MojoRichTextEditor'

export default function MojoDashboardNotes({ html }: { html: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const preview = html.replace(/<[^>]+>/g, '').trim()
  const firstLine = preview.split('\n')[0].slice(0, 120)
  const previewText = firstLine + (preview.length > 120 ? '…' : '')

  if (isExpanded) {
    return (
      <div>
        <MojoRichTextEditor content={html} onChange={() => {}} readonly />
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.625rem', color: 'var(--faded)', padding: 0, marginTop: 4 }}
        >
          ▾ Hide notes
        </button>
      </div>
    )
  }

  return (
    <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8125rem', color: 'var(--faded)', margin: 0 }}>
      {previewText}{' '}
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: '0.625rem', color: 'var(--faded)', padding: 0 }}
      >
        ▸ Show notes
      </button>
    </p>
  )
}
