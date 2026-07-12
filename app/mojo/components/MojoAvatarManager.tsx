'use client'

import { useMemo, useState } from 'react'
import { deleteMojoAvatar } from '@/lib/actions/mojo'
import MojoAvatarUpload from './MojoAvatarUpload'
import MojoAvatarFilter, { type MojoAvatarFilterTab } from './MojoAvatarFilter'
import MojoAvatarGrid from './MojoAvatarGrid'
import type { Tables } from '@/types/database'

type MojoAvatar = Tables<'mojo_avatars'>

function navigateToAvatars() {
  window.location.href = '/mojo/avatars'
}

export default function MojoAvatarManager({
  avatars,
  characters,
  faceclaims,
}: {
  avatars: MojoAvatar[]
  characters: { id: string; name: string }[]
  faceclaims: { id: string; name: string }[]
}) {
  const [activeFilter, setActiveFilter] = useState('all')

  const characterNameById = useMemo(() => new Map(characters.map((c) => [c.id, c.name])), [characters])
  const faceclaimNameById = useMemo(() => new Map(faceclaims.map((fc) => [fc.id, fc.name])), [faceclaims])

  const tabs = useMemo<MojoAvatarFilterTab[]>(() => {
    const result: MojoAvatarFilterTab[] = [
      { key: 'all', label: 'All' },
      { key: 'unassigned', label: 'Unassigned' },
    ]
    const seenChars = new Set<string>()
    const seenFcs = new Set<string>()
    for (const a of avatars) {
      if (a.character_id && !seenChars.has(a.character_id)) {
        seenChars.add(a.character_id)
        result.push({ key: `char:${a.character_id}`, label: characterNameById.get(a.character_id) ?? 'Unknown' })
      }
      if (a.faceclaim_id && !seenFcs.has(a.faceclaim_id)) {
        seenFcs.add(a.faceclaim_id)
        result.push({ key: `fc:${a.faceclaim_id}`, label: faceclaimNameById.get(a.faceclaim_id) ?? 'Unknown' })
      }
    }
    return result
  }, [avatars, characterNameById, faceclaimNameById])

  const filteredAvatars = useMemo(() => {
    if (activeFilter === 'all') return avatars
    if (activeFilter === 'unassigned') {
      return avatars.filter((a) => !a.character_id && !a.faceclaim_id)
    }
    if (activeFilter.startsWith('char:')) {
      const id = activeFilter.slice(5)
      return avatars.filter((a) => a.character_id === id)
    }
    if (activeFilter.startsWith('fc:')) {
      const id = activeFilter.slice(3)
      return avatars.filter((a) => a.faceclaim_id === id)
    }
    return avatars
  }, [avatars, activeFilter])

  async function handleDelete(avatarId: string) {
    const result = await deleteMojoAvatar(avatarId)
    if ('error' in result) return
    navigateToAvatars()
  }

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)' }}>
          Upload Images
        </span>
      </div>
      <div style={{ marginBottom: 28 }}>
        <MojoAvatarUpload characterId={null} faceclaimId={null} onUploadComplete={navigateToAvatars} />
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--faded)', margin: '10px 0 0' }}>
          Avatars uploaded here have no character or faceclaim assignment. Assign them later via Edit on each card.
        </p>
      </div>

      <div style={{ height: 1, margin: '0 0 24px', background: 'linear-gradient(to right, var(--ember), var(--gold))', opacity: 0.4 }} />

      <MojoAvatarFilter tabs={tabs} activeKey={activeFilter} onChange={setActiveFilter} />

      <MojoAvatarGrid avatars={filteredAvatars} onDelete={handleDelete} showDragHandle={false} />
    </div>
  )
}
