import {
  SvgLibraryStudy,
} from '@/app/mojo/components/MojoSvgAssets'

export default function LibraryStudyPreviewPage() {
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
        Library — Option B: Old Study / Hearth
      </div>

      <div style={{
        background: 'var(--char)',
        borderRadius: '4px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SvgLibraryStudy idSuffix="preview-b" />
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'var(--faded)',
        marginTop: '16px',
        lineHeight: 1.6,
      }}>
        A stone fireplace in a forgotten scholar&apos;s study. Animated
        fire with layered flames, books stacked on the floor and
        mantle, small candles on the mantle ledge, ivy climbing
        the left stone pillar. Warm firelight washing the scene.
      </div>
    </div>
  )
}
