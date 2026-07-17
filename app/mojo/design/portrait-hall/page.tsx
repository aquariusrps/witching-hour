import {
  SvgPortraitHall,
} from '@/app/mojo/components/MojoSvgAssets'

export default function PortraitHallPreviewPage() {
  return (
    <div>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '9px',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'var(--faded)',
        marginBottom: '24px',
      }}>
        Faceclaims — The Hall of Legends
      </div>

      <div style={{
        background: 'var(--char)',
        borderRadius: '4px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SvgPortraitHall idSuffix="preview" />
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'var(--faded)',
        marginTop: '16px',
        lineHeight: 1.6,
      }}>
        Seven oil portraits on dark wood paneling — baroque,
        gothic, neoclassical, rope-twist, and Victorian frames,
        each housing a face painted in a different era&apos;s manner.
        Individual wall sconces cast warm amber light on each
        canvas. Brass nameplates below. A gilt frieze above.
        Proposed header for The Hall of Legends (Faceclaims)
        page.
      </div>
    </div>
  )
}
