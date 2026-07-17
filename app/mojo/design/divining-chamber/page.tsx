import {
  SvgDiviningChamber,
} from '@/app/mojo/components/MojoSvgAssets'

export default function DiviningChamberPreviewPage() {
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
        Search — Option A: The Divining Chamber
      </div>

      <div style={{
        background: 'var(--char)',
        borderRadius: '4px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SvgDiviningChamber idSuffix="preview" />
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'var(--faded)',
        marginTop: '16px',
        lineHeight: 1.6,
      }}>
        A candlelit divination table viewed from above. Seven
        tarot cards fanned across dark velvet — two face up,
        showing the Moon and the Eye. Eight rune stones
        scattered naturally. A crystal pendulum mid-swing,
        casting prismatic light on the cloth. An open grimoire
        partially visible at the edge. Two candles in the rear
        corners, their light the only warmth in the void.
      </div>
    </div>
  )
}
