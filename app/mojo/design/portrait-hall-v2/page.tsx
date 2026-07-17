import {
  SvgPortraitHallV2,
} from '@/app/mojo/components/MojoSvgAssets'

export default function PortraitHallV2PreviewPage() {
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
        Faceclaims — Option B: The Masked Coven
      </div>

      <div style={{
        background: 'var(--char)',
        borderRadius: '4px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SvgPortraitHallV2 idSuffix="preview-v2" />
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'var(--faded)',
        marginTop: '16px',
        lineHeight: 1.6,
      }}>
        Seven hooded warlocks — a coven&apos;s hall of record.
        Each figure wears the same ornate occult mask but
        a different colored robe, each commanding a different
        element: Shadow, Lightning, Water, Earth, Fire, Air,
        and Light. The same face, hidden. The same power,
        different in every portrait. A second option for The
        Hall of Legends (Faceclaims) page.
      </div>
    </div>
  )
}
