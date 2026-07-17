import {
  SvgGrimoire,
} from '@/app/mojo/components/MojoSvgAssets'

export default function GrimoirePreviewPage() {
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
        Chronicle — Option A: The Grimoire
      </div>

      <div style={{
        background: 'var(--char)',
        borderRadius: '4px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SvgGrimoire idSuffix="preview" />
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'var(--faded)',
        marginTop: '16px',
        lineHeight: 1.6,
      }}>
        An ancient open grimoire — the accumulated knowledge of
        a witch&apos;s practice. Left page: occult wheel diagram,
        dense handwritten text, botanical illustration, ink blot,
        broken wax seal. Right page: a large moon phase circle
        with a dark quill resting diagonally, wet ink at its nib.
        Three silk ribbon bookmarks hang below the spine.
        Proposed header for The Grimoire (Chronicle) page.
      </div>
    </div>
  )
}
