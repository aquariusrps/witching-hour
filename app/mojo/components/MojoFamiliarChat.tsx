'use client'

import { useState, useEffect, useRef } from 'react'
import { SvgCandleRealistic, SvgNavFamiliar } from './MojoSvgAssets'

type FamiliarMessage = { role: 'user' | 'assistant'; content: string }
type PendingAction = { tool: string; args: Record<string, unknown>; description: string }

const LOADING_MESSAGES = [
  'The Familiar stirs…',
  'Consulting the records…',
  'Reading the threads…',
  'Searching the memory…',
  'The eye turns inward…',
]

export default function MojoFamiliarChat({
  initialConversationId,
  onConversationCreated,
  onTitleUpdated,
}: {
  initialConversationId?: string | null
  onConversationCreated?: (id: string) => void
  onTitleUpdated?: () => void
}) {
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null)
  const [messages, setMessages] = useState<FamiliarMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  async function loadMessages(convId: string) {
    setLoading(true)
    try {
      const response = await fetch(`/api/mojo/familiar/messages?conversationId=${convId}`)
      const data = await response.json().catch(() => null)
      if (response.ok && data?.messages) {
        setMessages(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.messages.map((m: any) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content as string,
          }))
        )
      }
      setConversationId(convId)
    } finally {
      setLoading(false)
    }
  }

  // Load existing messages for this conversation on mount. Each switch
  // of conversation remounts this component (chatKey pattern in
  // MojoFamiliarWrapper), so a run-once effect is correct here.
  useEffect(() => {
    if (initialConversationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMessages(initialConversationId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const isFirstMessage = messages.length === 0

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

    const currentConversationId = data.conversationId ?? conversationId
    if (data.conversationId) setConversationId(data.conversationId)
    setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
    setPendingAction(data.pendingAction ?? null)

    // First exchange in a new conversation — tell the parent so the
    // Memory sidebar can pick it up, then fire the background auto-title
    // call. Neither blocks the UI.
    if (isFirstMessage && currentConversationId) {
      onConversationCreated?.(currentConversationId)

      fetch('/api/mojo/familiar/autotitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          firstMessage: trimmed,
        }),
      })
        .then(() => onTitleUpdated?.())
        .catch(() => {})
    }
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

  const loadingText = LOADING_MESSAGES[messages.length % LOADING_MESSAGES.length]

  return (
    <div className="mojo-familiar-conversation-wrap" style={{ position: 'relative' }}>

      {/* Ambient candle — bottom right corner of conversation */}
      <div className="mojo-familiar-candle-corner" aria-hidden="true">
        <SvgCandleRealistic height={56} idSuffix="familiar" flameDelay="0.6s" />
      </div>

      {/* ── MESSAGE HISTORY ── */}
      <div className="mojo-familiar-messages">

        {messages.length === 0 && !loading ? (
          <div className="mojo-familiar-empty">
            <div className="mojo-familiar-empty-star">✦</div>
            <div className="mojo-familiar-empty-greeting">
              What troubles you?<br />
              What would you know?<br />
              I am here.
            </div>
            <div className="mojo-familiar-empty-hint">
              Ask about your characters, threads, or anything in your world.
              Or ask me to help you build something new.
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'mojo-familiar-msg-user' : 'mojo-familiar-msg-assistant'}
              >
                {msg.role === 'assistant' && (
                  <span className="mojo-familiar-msg-eye">
                    <SvgNavFamiliar active={false} />
                  </span>
                )}
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="mojo-familiar-loading">
                <span className="mojo-familiar-loading-eye">
                  <SvgNavFamiliar active={true} />
                </span>
                <span>{loadingText}</span>
              </div>
            )}
          </>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── PENDING CONFIRMATION ── */}
      {pendingAction && (
        <div className="mojo-familiar-pending">
          <div className="mojo-familiar-pending-label">
            Awaiting your word
          </div>
          <div className="mojo-familiar-pending-desc">
            I will {pendingAction.description}.
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="mojo-familiar-confirm-btn"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="mojo-familiar-cancel-btn"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── INPUT AREA ── */}
      <div className="mojo-familiar-input-area">
        <textarea
          className="mojo-familiar-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Speak to The Familiar…"
          rows={2}
          disabled={loading || !!pendingAction}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim() || !!pendingAction}
          className="mojo-familiar-send-btn"
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>
      <div className="mojo-familiar-input-hint">
        Ctrl + Enter to send
      </div>
    </div>
  )
}
