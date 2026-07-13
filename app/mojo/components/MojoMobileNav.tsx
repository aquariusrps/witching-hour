'use client'

import { useState } from 'react'

export default function MojoMobileNav({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* ── HAMBURGER BUTTON (mobile only) ── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 200,
          width: '36px',
          height: '36px',
          background: 'var(--raised)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          cursor: 'pointer',
          padding: '6px',
        }}
        className="mojo-hamburger"
      >
        <span style={{ display: 'block', width: '18px', height: '1.5px',
          background: 'var(--mist)', borderRadius: '1px' }} />
        <span style={{ display: 'block', width: '18px', height: '1.5px',
          background: 'var(--mist)', borderRadius: '1px' }} />
        <span style={{ display: 'block', width: '18px', height: '1.5px',
          background: 'var(--mist)', borderRadius: '1px' }} />
      </button>

      {/* ── OVERLAY BACKDROP ── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 149,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── SIDEBAR DRAWER ── */}
      <div
        className={`mojo-sidebar-drawer${isOpen ? ' mojo-sidebar-open' : ''}`}
        style={{ zIndex: 150 }}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--faded)',
            fontSize: '18px',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '4px 8px',
          }}
          className="mojo-drawer-close"
        >
          ×
        </button>

        {children}
      </div>
    </>
  )
}
