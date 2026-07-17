import { getMojoPersonalImages, getMojoImageFolders } from '@/lib/db/mojo'
import MojoPersonalImageManager from '@/app/mojo/components/MojoPersonalImageManager'
import {
  SvgPageHeaderRule, SvgWitchesAttic, SvgIvyColumn,
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
      {/* ── THE WITCH'S ATTIC HEADER ── */}
      <div style={{ marginBottom: '24px' }}>

        {/* Attic illustration — full width */}
        <div style={{ marginBottom: '0' }}>
          <SvgWitchesAttic idSuffix="images-header" />
        </div>

        {/* Page title */}
        <div style={{ marginTop: '20px', marginBottom: '6px' }}>
          <h1 style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: '38px',
            fontWeight: 600,
            color: 'var(--roseash)',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
            The Witch&apos;s Attic
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 16px',
        }}>
          Your private collection.
        </p>

        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>

      </div>

      {/* Content zone with ivy flanking */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Left ivy column */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-28px',
            top: '0',
            bottom: '0',
            width: '24px',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <SvgIvyColumn
            height={9999}
            flip={false}
            idSuffix="img-ivy-l"
          />
        </div>

        <MojoPersonalImageManager
          initialImages={images}
          initialFolders={folders}
          totalCount={totalCount}
          untaggedCount={untaggedCount}
        />

        {/* Right ivy column */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-28px',
            top: '0',
            bottom: '0',
            width: '24px',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <SvgIvyColumn
            height={9999}
            flip={true}
            idSuffix="img-ivy-r"
          />
        </div>

      </div>
    </div>
  )
}
