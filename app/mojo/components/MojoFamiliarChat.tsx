'use client'

import { useState } from 'react'

type FamiliarMessage = { role: 'user' | 'assistant'; content: string }
type PendingAction = { tool: string; args: Record<string, unknown>; description: string }

export default function MojoFamiliarChat() {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<FamiliarMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)

    const response = await fetch('/api/mojo/familiar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message: trimmed }),
    })
    const data = await response.json().catch(() => null)
    setLoading(false)

    if (!response.ok || !data) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
      return
    }

    if (data.conversationId) setConversationId(data.conversationId)
    setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
    setPendingAction(data.pendingAction ?? null)
  }

  async function handleConfirm() {
    if (!pendingAction) return
    setLoading(true)

    const response = await fetch('/api/mojo/familiar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, confirm: pendingAction }),
    })
    const data = await response.json().catch(() => null)
    setLoading(false)
    setPendingAction(null)

    if (!response.ok || !data) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong confirming that action.' }])
      return
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
  }

  function handleCancel() {
    setPendingAction(null)
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Action cancelled.' }])
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div>
      <div className="mojo-familiar-messages">
        {messages.length === 0 && !loading && (
          <p style={{
            fontFamily: 'EB Garamond, serif',
            fontStyle: 'italic',
            fontSize: '14px',
            color: 'var(--faded)',
            textAlign: 'center',
            margin: 'auto',
          }}>
            Speak, and I will listen.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'mojo-familiar-msg-user' : 'mojo-familiar-msg-assistant'}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <p style={{
            fontFamily: 'EB Garamond, serif',
            fontStyle: 'italic',
            fontSize: '14px',
            color: 'var(--faded)',
            margin: 0,
          }}>
            The Familiar stirs...
          </p>
        )}
      </div>

      {pendingAction && (
        <div className="mojo-familiar-pending">
          <p style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '14px',
            color: 'var(--roseash)',
            margin: '0 0 10px',
          }}>
            I will {pendingAction.description}. Confirm?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              style={{
                background: 'var(--gold)',
                color: 'var(--roseash)',
                border: 'none',
                borderRadius: 2,
                padding: '6px 16px',
                fontFamily: 'Cinzel, serif',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                background: 'none',
                border: '1px solid var(--elevated)',
                color: 'var(--faded)',
                borderRadius: 2,
                padding: '6px 16px',
                fontFamily: 'Cinzel, serif',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mojo-familiar-input-area">
        <textarea
          className="mojo-familiar-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Speak to the Familiar... (Ctrl+Enter to send)"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            background: 'var(--ember)',
            color: 'var(--roseash)',
            border: 'none',
            borderRadius: 2,
            padding: '10px 20px',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.8rem',
            cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
            opacity: (loading || !input.trim()) ? 0.6 : 1,
            flexShrink: 0,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
