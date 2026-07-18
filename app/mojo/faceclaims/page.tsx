import { getMojoFaceclaims } from '@/lib/db/mojo'
import MojoCreateFaceclaim from '@/app/mojo/components/MojoCreateFaceclaim'
import MojoFaceclaimRow from '@/app/mojo/components/MojoFaceclaimRow'
import { SvgPortraitHallV2, SvgIvyColumn, SvgPageHeaderRule } from '@/app/mojo/components/MojoSvgAssets'

export default async function MojoFaceclaimsPage() {
  const faceclaims = await getMojoFaceclaims()

  return (
    <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '32px 28px 64px' }}>
      {/* ── THE HALL OF LEGENDS HEADER ── */}
      <div style={{ marginBottom: '24px' }}>

        {/* Masked Coven illustration — full width */}
        <div style={{ marginBottom: '0', overflow: 'hidden', borderRadius: '3px' }}>
          <SvgPortraitHallV2 idSuffix="faceclaims-header" />
        </div>

        {/* Page title — unchanged */}
        <div style={{ marginTop: '20px', marginBottom: '6px' }}>
          <h1 style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: '38px',
            fontWeight: 600,
            color: 'var(--roseash)',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
            The Hall of Legends
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
          Faces held in record. Each one known.
        </p>

        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>

      </div>

      {/* Content zone with ivy flanking */}
      <div style={{ position: 'relative' }}>

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
            idSuffix="fc-ivy-l"
          />
        </div>

        <div>
          <MojoCreateFaceclaim />
        </div>

        {faceclaims.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
            No faceclaims yet. Add one above.
          </p>
        ) : (
          <div
            className="mojo-gallery-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '28px',
              padding: '4px 0',
            }}
          >
            {faceclaims.map((fc) => (
              <MojoFaceclaimRow key={fc.id} fc={fc} avatarToken={fc.avatar_token} />
            ))}
          </div>
        )}

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
            idSuffix="fc-ivy-r"
          />
        </div>

      </div>
    </div>
  )
}
