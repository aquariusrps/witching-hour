'use client'

import { deleteMojoAvatar } from '@/lib/actions/mojo'
import MojoAvatarUpload from './MojoAvatarUpload'
import MojoAvatarGrid from './MojoAvatarGrid'
import type { Tables } from '@/types/database'

type MojoAvatar = Tables<'mojo_avatars'>

function navigateToFaceclaim(fcId: string) {
  window.location.href = '/mojo/faceclaims/' + fcId
}

export default function MojoFaceclaimAvatars({
  fcId,
  avatars,
}: {
  fcId: string
  avatars: MojoAvatar[]
}) {
  async function handleDelete(avatarId: string) {
    const result = await deleteMojoAvatar(avatarId)
    if ('error' in result) return
    navigateToFaceclaim(fcId)
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <MojoAvatarUpload
          characterId={null}
          faceclaimId={fcId}
          onUploadComplete={() => navigateToFaceclaim(fcId)}
        />
      </div>
      <MojoAvatarGrid avatars={avatars} onDelete={handleDelete} showDragHandle={false} />
    </div>
  )
}
