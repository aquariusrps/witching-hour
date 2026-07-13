import { getMojoPartners } from '@/lib/db/mojo'
import MojoAddPartner from '@/app/mojo/components/MojoAddPartner'
import MojoPartnerList from '@/app/mojo/components/MojoPartnerList'
import {
  SvgLeatherTexture, SvgBookSeal, SvgSilkRibbon,
  SvgPageCornerFold, SvgFiligreeRule
} from '@/app/mojo/components/MojoSvgAssets'

export default async function MojoPartnersPage() {
  const partners = await getMojoPartners()

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 28px 64px', position: 'relative', paddingRight: '28px' }}>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '20px',
          color: 'var(--claret)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        className="mojo-silk-ribbon"
      >
        <SvgSilkRibbon width={20} height={2000} />
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          right: 20,
          color: 'var(--mist)',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.5,
        }}
      >
        <SvgPageCornerFold size={28} />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        marginBottom: '20px',
        padding: '20px 24px 16px',
        background: `
          linear-gradient(180deg,
            rgba(12,12,20,0.0) 0%,
            rgba(12,12,20,0.6) 100%
          ),
          var(--char)
        `,
        borderRadius: '4px 4px 0 0',
        overflow: 'hidden',
      }}>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            color: 'var(--mist)',
            pointerEvents: 'none',
          }}
        >
          <SvgLeatherTexture />
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '12px',
            right: '36px',
            color: 'var(--mist)',
            opacity: 0.22,
            pointerEvents: 'none',
          }}
        >
          <SvgBookSeal size={64} idSuffix="partners" />
        </div>

        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '38px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 4px',
          letterSpacing: '0.02em',
          position: 'relative',
          zIndex: 1,
        }}>
          The Black Book
        </h1>

        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 14px',
          position: 'relative',
          zIndex: 1,
        }}>
          The ones you write with.
        </p>

        <div style={{
          position: 'relative',
          zIndex: 1,
          color: 'var(--elevated)',
        }}>
          <SvgFiligreeRule />
        </div>
      </div>

      <MojoAddPartner />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MojoPartnerList partners={partners} />
      </div>
    </div>
  )
}
