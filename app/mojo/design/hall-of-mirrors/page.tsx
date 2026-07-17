import {
  SvgHallOfMirrors,
} from '@/app/mojo/components/MojoSvgAssets'

export default function HallOfMirrorsPreviewPage() {
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
        Stacks — Option A: The Hall of Mirrors
      </div>

      <div style={{
        background: 'var(--char)',
        borderRadius: '4px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SvgHallOfMirrors idSuffix="preview" />
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'var(--faded)',
        marginTop: '16px',
        lineHeight: 1.6,
      }}>
        A candlelit corridor of gothic arched mirrors stretching
        into darkness. Six gilded frames — three per side —
        each showing a different ghostly shape in its glass.
        One face, many possible reflections. A single candle
        burns at the vanishing point, source of all the light.
      </div>
    </div>
  )
}
