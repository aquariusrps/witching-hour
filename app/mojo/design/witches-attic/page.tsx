import {
  SvgWitchesAttic,
} from '@/app/mojo/components/MojoSvgAssets'

export default function WitchesAtticPreviewPage() {
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
        Images — Option A: The Witch&apos;s Attic
      </div>

      <div style={{
        background: 'var(--char)',
        borderRadius: '4px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SvgWitchesAttic idSuffix="preview" />
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'var(--faded)',
        marginTop: '16px',
        lineHeight: 1.6,
      }}>
        A witch&apos;s attic at night — peaked beams, a circular
        moonlit window at the back, an empty birdcage with
        a faint spectral glow. Dried herb bundles hang from
        the beams. A brass lantern sits atop an old trunk,
        casting warm amber light. Bottles on a shelf, a
        partially visible spinning wheel in the corner,
        stacked books and scrolls. Dust motes drift in the
        moonlight. Proposed header illustration for the
        Images page, replacing The Darkroom concept.
      </div>
    </div>
  )
}
