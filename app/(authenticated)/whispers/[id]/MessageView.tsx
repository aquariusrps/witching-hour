'use client'

import DOMPurify from 'dompurify'

export function SystemMessageBody({ html }: { html: string }) {
  // DOMPurify requires a DOM — guard for SSR pass.
  // Our system message HTML is controlled content so the
  // raw and sanitized strings are identical; no hydration mismatch.
  const sanitized =
    typeof window !== 'undefined' ? DOMPurify.sanitize(html) : html

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitized }}
      style={{
        fontFamily: 'var(--f-body)',
        fontSize: '1rem',
        lineHeight: 1.75,
        color: 'var(--roseash)',
      }}
    />
  )
}
