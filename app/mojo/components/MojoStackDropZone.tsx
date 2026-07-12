'use client'

import { useRef, useState } from 'react'

export default function MojoStackDropZone({
  stackLabel,
  onDrop,
}: {
  stackId: string
  stackLabel: string
  memberCount: number
  onDrop: (storagePath: string, mimeType: string) => void
}) {
  const [isOver, setIsOver] = useState(false)
  const dragCounter = useRef(0)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current += 1
    setIsOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsOver(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    dragCounter.current = 0
    setIsOver(false)
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/mojo-avatar'))
      onDrop(data.storage_path, data.mime_type)
    } catch {
      // ignore malformed drop payloads
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: isOver ? 'var(--raised)' : 'var(--char)',
        border: `1px dashed ${isOver ? 'var(--gold)' : 'var(--elevated)'}`,
        borderRadius: 2,
        padding: 12,
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--f-body)',
          fontStyle: 'italic',
          fontSize: '0.75rem',
          color: isOver ? 'var(--gold)' : 'var(--faded)',
        }}
      >
        Drop image here to add to {stackLabel}
      </span>
    </div>
  )
}
