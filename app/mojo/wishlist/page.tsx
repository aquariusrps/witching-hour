import { getMojoWishlist } from '@/lib/db/mojo'
import MojoAddWishlistItem from '@/app/mojo/components/MojoAddWishlistItem'
import MojoWishlistList from '@/app/mojo/components/MojoWishlistList'
import {
  SvgStarfield,
  SvgBotanicalSpray,
  SvgDreamHeader,
  SvgPageHeaderRule,
} from '@/app/mojo/components/MojoSvgAssets'

export default async function MojoWishlistPage() {
  const items = await getMojoWishlist()

  return (
    <div style={{ position: 'relative', overflow: 'hidden', maxWidth: 780, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          color: 'var(--mist)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <SvgStarfield width={900} height={600} />
      </div>

      <div
        aria-hidden="true"
        className="mojo-botanical-corner"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          color: 'var(--mist)',
          pointerEvents: 'none',
          zIndex: 0,
          '--botanical-origin': 'bottom left',
        } as React.CSSProperties}
      >
        <SvgBotanicalSpray width={160} height={220} flip={false} />
      </div>

      <div
        aria-hidden="true"
        className="mojo-botanical-corner"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          color: 'var(--mist)',
          pointerEvents: 'none',
          zIndex: 0,
          transform: 'rotate(180deg)',
          /* Rotating 180deg flips both X and Y — creating a
             downward cascade from top-right corner */
          '--botanical-origin': 'top right',
        } as React.CSSProperties}
      >
        <SvgBotanicalSpray width={130} height={180} flip={true} />
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'radial-gradient(ellipse at 50% -10%, rgba(96,64,192,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px' }}>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '40px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 6px',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
        }}>
          Desires
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '16px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 12px',
        }}>
          What you want before you know how to want it.
        </p>

        {/* Dream header ornament */}
        <div style={{
          color: 'var(--gold)',
          marginBottom: '14px',
        }} aria-hidden="true">
          <SvgDreamHeader idSuffix="wishlist-page" />
        </div>

        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MojoAddWishlistItem />

        <MojoWishlistList items={items} />
      </div>
    </div>
  )
}
