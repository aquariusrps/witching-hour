import { getMojoPersonalImages, getMojoImageFolders } from '@/lib/db/mojo'
import MojoPersonalImageManager from '@/app/mojo/components/MojoPersonalImageManager'
import {
  SvgHangingPhotographs, SvgPageHeaderRule, SvgFiligreeRule, SvgDarkroomHeader,
} from '@/app/mojo/components/MojoSvgAssets'

export default async function MojoImagesPage() {
  const [images, folders] = await Promise.all([
    getMojoPersonalImages(),
    getMojoImageFolders(),
  ])

  const totalCount = images.length
  const untaggedCount = images.filter((img) => !img.folder_id).length

  return (
    <div
      style={{
        position: 'relative',
        /* Safelight atmosphere — garnet tint from --gold #a02840 */
        background: `
          radial-gradient(ellipse at 50% 0%,
            rgba(160,40,64,0.09) 0%, transparent 45%),
          radial-gradient(ellipse at 15% 80%,
            rgba(160,40,64,0.05) 0%, transparent 35%),
          transparent
        `,
      }}
    >
      <div style={{ textAlign: 'center', padding: '32px 28px 0', position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '36px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 4px',
          letterSpacing: '0.02em',
        }}>
          The Darkroom
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 12px',
        }}>
          Where light becomes image.
        </p>
        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          zIndex: 1,
          color: 'var(--mist)',
          marginBottom: '12px',
          opacity: 0.75,
          pointerEvents: 'none',
        }}
      >
        <SvgHangingPhotographs />
      </div>

      <div style={{
        color: 'var(--elevated)',
        marginBottom: '16px',
        position: 'relative',
        zIndex: 1,
      }}>
        <SvgFiligreeRule />
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          zIndex: 1,
          color: 'var(--mist)',
          marginBottom: '12px',
          opacity: 0.65,
        }}
      >
        <SvgDarkroomHeader />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MojoPersonalImageManager
          initialImages={images}
          initialFolders={folders}
          totalCount={totalCount}
          untaggedCount={untaggedCount}
        />
      </div>
    </div>
  )
}
