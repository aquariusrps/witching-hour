'use client'

import { useState } from 'react'
import MojoFamiliarSidebar from './MojoFamiliarSidebar'
import MojoFamiliarChat from './MojoFamiliarChat'

export default function MojoFamiliarWrapper() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [chatKey, setChatKey] = useState(0)
  // chatKey forces MojoFamiliarChat to remount when conversation changes.
  // This resets its internal message state cleanly.
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)
  // sidebarRefreshKey bumps independently of activeConvId so the Memory
  // sidebar re-fetches when a conversation's title changes in the
  // background (autotitle) without the active id itself changing.

  function handleSelectConversation(id: string) {
    setActiveConvId(id)
    setChatKey((k) => k + 1)
  }

  function handleNewConversation(id: string) {
    setActiveConvId(id || null)
    setChatKey((k) => k + 1)
  }

  function handleConversationCreated(id: string) {
    setActiveConvId(id)
    setSidebarRefreshKey((k) => k + 1)
  }

  function handleTitleUpdated() {
    setSidebarRefreshKey((k) => k + 1)
  }

  return (
    <div className="mojo-familiar-layout">
      <MojoFamiliarSidebar
        activeConversationId={activeConvId}
        refreshKey={sidebarRefreshKey}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
      />
      <div className="mojo-familiar-main">
        <MojoFamiliarChat
          key={chatKey}
          initialConversationId={activeConvId}
          onConversationCreated={handleConversationCreated}
          onTitleUpdated={handleTitleUpdated}
        />
      </div>
    </div>
  )
}
