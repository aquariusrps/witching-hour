import Link from 'next/link'
import { SvgPageHeaderRule } from '@/app/mojo/components/MojoSvgAssets'

const DESIGNS = [
  {
    slug: 'svg-library',
    title: '◈ SVG Asset Library',
    description: 'All 76 SVG exports in MojoSvgAssets.tsx rendered as previews. New exports appear automatically. Groups: Wide Panoramic, Square, Tall Vertical, Medium Decorative, Small Navigation, Ungrouped.',
  },
  {
    slug: 'library-study',
    title: 'Library — Old Study / Hearth',
    description: 'Stone fireplace in a forgotten scholar\'s study. Books stacked around the hearth, ivy on stone, mantle candles. Option B for The Library page.',
  },
  {
    slug: 'portrait-hall',
    title: 'Faceclaims — The Hall of Legends',
    description: 'Seven oil portraits on dark paneled walls — five frame styles (baroque, gothic, neoclassical, rope-twist, Victorian oval), painted faces in different eras, individual sconce lighting, brass nameplates. Proposed header for The Hall of Legends (Faceclaims) page.',
  },
  {
    slug: 'portrait-hall-v2',
    title: 'Faceclaims — The Masked Coven',
    description: 'Seven hooded warlocks in element-colored robes, each wearing the same ornate occult mask. Shadow, Lightning, Water, Earth, Fire, Air, Light. A second option for The Hall of Legends page.',
  },
]

export default function DesignIndexPage() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '38px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 6px',
        }}>
          The Atelier
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '16px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 16px',
        }}>
          Design options awaiting decision.
        </p>
        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {DESIGNS.map(design => (
          <Link key={design.slug} href={`/mojo/design/${design.slug}`}
            style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '16px 20px',
              background: 'var(--raised)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '3px',
              transition: 'border-color 0.15s ease',
            }}>
              <div style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '17px',
                color: 'var(--roseash)',
                marginBottom: '4px',
              }}>
                {design.title}
              </div>
              <div style={{
                fontFamily: 'EB Garamond, serif',
                fontSize: '14px',
                fontStyle: 'italic',
                color: 'var(--faded)',
              }}>
                {design.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
