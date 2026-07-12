'use client'

import { useState } from 'react'
import { linkResourceToCharacter } from '@/lib/actions/mojo'
import MojoAddResource from './MojoAddResource'
import MojoResourceList from './MojoResourceList'
import type { Tables } from '@/types/database'

type MojoResource = Tables<'mojo_resources'>

const TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  link: 'Link',
  snippet: 'Snippet',
  image: 'Image',
  gif: 'GIF',
}

function navigateTo(path: string) {
  window.location.href = path
}

export default function MojoResourcesTab({
  charId,
  faceclaimId,
  faceclaimName,
  resources,
  faceclaimResources,
}: {
  charId: string
  rpId: string
  faceclaimId: string | null
  faceclaimName: string | null
  resources: MojoResource[]
  faceclaimResources: MojoResource[]
}) {
  const [linkLoadingId, setLinkLoadingId] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<{ id: string; message: string } | null>(null)

  const linkedOrOwnedIds = new Set(resources.map((r) => r.id))
  const availableToLink = faceclaimResources.filter((r) => !linkedOrOwnedIds.has(r.id))

  async function handleLink(resourceId: string) {
    setLinkLoadingId(resourceId)
    setLinkError(null)
    const result = await linkResourceToCharacter(resourceId, charId)

    if ('error' in result) {
      setLinkLoadingId(null)
      setLinkError({ id: resourceId, message: result.error })
      return
    }

    navigateTo('/mojo/characters/' + charId)
  }

  return (
    <div>
      <MojoAddResource
        faceclaimId={faceclaimId}
        characterId={charId}
        redirectPath={'/mojo/characters/' + charId}
      />

      {faceclaimId && availableToLink.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
            color: 'var(--gold-dim)',
            margin: '0 0 10px',
          }}>
            Link from {faceclaimName}&rsquo;s library
          </h4>
          {availableToLink.map((r) => {
            const hasError = linkError?.id === r.id
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '6px 0',
                  borderBottom: '1px solid var(--elevated)',
                }}
              >
                <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--roseash)' }}>
                  {r.title}
                  <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6rem', color: 'var(--faded)', marginLeft: 8, textTransform: 'uppercase' }}>
                    {TYPE_LABELS[r.type] ?? r.type}
                  </span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {hasError && (
                    <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.72rem', color: 'var(--ember)' }}>
                      {linkError!.message}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleLink(r.id)}
                    disabled={linkLoadingId === r.id}
                    style={{
                      background: 'none',
                      border: '1px solid var(--gold-dim)',
                      borderRadius: 2,
                      color: 'var(--gold-dim)',
                      padding: '3px 10px',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.66rem',
                      cursor: linkLoadingId === r.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Link to this character
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}

      <h3 style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)', margin: '0 0 12px' }}>
        Resources
      </h3>

      <MojoResourceList
        resources={resources}
        redirectPath={'/mojo/characters/' + charId}
        ownedCharacterId={charId}
        linkedFromFaceclaimName={faceclaimName ?? undefined}
      />
    </div>
  )
}
