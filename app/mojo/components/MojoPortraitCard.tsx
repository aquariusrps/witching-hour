import { SvgPortraitFrame } from './MojoSvgAssets'

const MIST_HEX = '#9c9ab8' // Silver & Onyx --mist

export default function MojoPortraitCard({
  token,
  alt,
  size = 'md',
  idSuffix = 'portrait',
  showFrame = true,
  className = '',
}: {
  token?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg'
  idSuffix?: string
  showFrame?: boolean
  className?: string
}) {
  const sizeClass = `mojo-portrait-${size}`

  return (
    <div className={`mojo-portrait-card-wrap ${sizeClass} ${className}`}>
      <div className="mojo-portrait-frame">

        {/* Image or placeholder */}
        {token ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${process.env.NEXT_PUBLIC_SITE_URL}/i/${token}.png`}
            alt={alt}
          />
        ) : (
          <div className="mojo-portrait-placeholder">
            {/* Silhouette SVG */}
            <svg
              viewBox="0 0 60 90"
              style={{ width: '45%', opacity: 0.15 }}
              fill="currentColor"
            >
              <circle cx="30" cy="26" r="16" />
              <ellipse cx="30" cy="72" rx="24" ry="20" />
            </svg>
          </div>
        )}

        {/* SVG portrait frame overlay */}
        {showFrame && (
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}>
            <SvgPortraitFrame
              width={size === 'sm' ? 110 : size === 'lg' ? 280 : 180}
              height={size === 'sm' ? 183 : size === 'lg' ? 467 : 300}
              color={MIST_HEX}
              idSuffix={idSuffix}
            />
          </div>
        )}
      </div>
    </div>
  )
}
