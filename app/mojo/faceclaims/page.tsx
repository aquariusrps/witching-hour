import { getMojoFaceclaims } from '@/lib/db/mojo'
import MojoCreateFaceclaim from '@/app/mojo/components/MojoCreateFaceclaim'
import MojoFaceclaimRow from '@/app/mojo/components/MojoFaceclaimRow'
import { SvgGalleryCorridor, SvgPageHeaderRule } from '@/app/mojo/components/MojoSvgAssets'

export default async function MojoFaceclaimsPage() {
  const faceclaims = await getMojoFaceclaims()

  return (
    <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          color: 'var(--mist)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.07), transparent)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.07), transparent)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <SvgGalleryCorridor width={900} height={200} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '36px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 4px',
          letterSpacing: '0.02em',
        }}>
          The Portrait Gallery
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 14px',
        }}>
          Every face that belongs to you.
        </p>
        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MojoCreateFaceclaim />
      </div>

      {faceclaims.length === 0 ? (
        <p style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
          No faceclaims yet. Add one above.
        </p>
      ) : (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '28px',
            padding: '4px 0',
          }}
        >
          {faceclaims.map((fc) => (
            <MojoFaceclaimRow key={fc.id} fc={fc} />
          ))}
        </div>
      )}
    </div>
  )
}
