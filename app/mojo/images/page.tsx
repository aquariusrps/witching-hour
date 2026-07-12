import { getMojoPersonalImages, getMojoImageFolders } from '@/lib/db/mojo'
import MojoPersonalImageManager from '@/app/mojo/components/MojoPersonalImageManager'

function FiligreeDivider() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '20px auto 28px',
      maxWidth: 360,
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--ember), var(--gold))' }} />
      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, var(--ember), var(--gold))' }} />
    </div>
  )
}

export default async function MojoImagesPage() {
  const [images, folders] = await Promise.all([
    getMojoPersonalImages(),
    getMojoImageFolders(),
  ])

  const totalCount = images.length
  const untaggedCount = images.filter((img) => !img.folder_id).length

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '32px 28px 0' }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.875rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          Images
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Your personal image library — folders, tags, and proxy URLs
        </p>
        <FiligreeDivider />
      </div>

      <MojoPersonalImageManager
        initialImages={images}
        initialFolders={folders}
        totalCount={totalCount}
        untaggedCount={untaggedCount}
      />
    </div>
  )
}
