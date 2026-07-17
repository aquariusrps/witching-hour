import Link from 'next/link'
import { SvgPageHeaderRule } from '@/app/mojo/components/MojoSvgAssets'

const DESIGNS = [
  {
    slug: 'library-bookshelf',
    title: 'Library — Illustrated Bookshelf',
    description: 'Leather-bound tomes on aged wood shelves. Brass candlestick, cobwebs, trailing ivy. Option A for The Library page.',
  },
  {
    slug: 'library-study',
    title: 'Library — Old Study / Hearth',
    description: 'Stone fireplace in a forgotten scholar\'s study. Books stacked around the hearth, ivy on stone, mantle candles. Option B for The Library page.',
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
