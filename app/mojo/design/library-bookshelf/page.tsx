import {
  SvgLibraryBookshelf,
} from '@/app/mojo/components/MojoSvgAssets'

export default function LibraryBookshelfPreviewPage() {
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
        Library — Option A: Illustrated Bookshelf
      </div>

      {/* SVG preview — full width, on near-black background */}
      <div style={{
        background: 'var(--char)',
        borderRadius: '4px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SvgLibraryBookshelf idSuffix="preview-a" />
      </div>

      <div style={{
        fontFamily: 'EB Garamond, serif',
        fontSize: '14px',
        fontStyle: 'italic',
        color: 'var(--faded)',
        marginTop: '16px',
        lineHeight: 1.6,
      }}>
        Leather-bound tomes on aged wood shelves. Brass candlestick
        with animated flame, cobwebs in the upper corners, ivy
        threading through the books from the left. Warm amber
        candlelight washes the scene.
      </div>
    </div>
  )
}
