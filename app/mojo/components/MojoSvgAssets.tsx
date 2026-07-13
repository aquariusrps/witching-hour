// Pure presentational SVG assets for Mojo chrome and page visual passes
// (MOJO-7B through 7K). No logic, no state, no hooks, no browser APIs —
// safe to import from Server or Client Components.
//
// Silver & Onyx is Mojo's only theme (hardcoded, non-switchable), so a
// handful of fill/stroke "punch-out" circles below use the theme's
// literal hex values rather than var(--token) — confirmed against
// app/globals.css [data-theme="silver-onyx"]:
//   --char (background): #0c0c14

export function SvgCrescent({
  size = 32,
  className = '',
  style,
  idSuffix = 'default',
}: { size?: number; className?: string; style?: React.CSSProperties; idSuffix?: string }) {
  // A crescent moon formed by two overlapping circles (same concept
  // as the TWH logo but smaller and silver). Outer circle minus inner
  // circle = crescent shape.
  const clipId = `crescent-clip-${idSuffix}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="16" cy="16" r="12" />
        </clipPath>
      </defs>
      <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.7" />
      {/* S&O: --char background #0c0c14 */}
      <circle cx="22" cy="14" r="10" fill="#0c0c14" clipPath={`url(#${clipId})`} />
      {/* Small star inside the crescent */}
      <text
        x="10"
        y="21"
        fontSize="6"
        fill="currentColor"
        opacity="0.9"
        fontFamily="serif"
      >
        ✦
      </text>
    </svg>
  )
}

export function SvgSidebarOrnamentTop() {
  // Large decorative crescent with radiating marks — sits at top of sidebar
  return (
    <svg
      width="80"
      height="60"
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="sidebar-crescent">
          <circle cx="40" cy="34" r="20" />
        </clipPath>
      </defs>
      <circle cx="40" cy="34" r="20" fill="currentColor" opacity="0.15" />
      {/* S&O: --char background #0c0c14 */}
      <circle cx="50" cy="30" r="16" fill="#0c0c14" clipPath="url(#sidebar-crescent)" />
      {/* Thin outline */}
      <circle cx="40" cy="34" r="20" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      {/* Cardinal tick marks */}
      <line x1="40" y1="10" x2="40" y2="14" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="64" y1="34" x2="60" y2="34" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="16" y1="34" x2="20" y2="34" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      {/* Star inside */}
      <text x="24" y="40" fontSize="8" fill="currentColor" opacity="0.7" fontFamily="serif">✦</text>
    </svg>
  )
}

export function SvgSidebarOrnamentBottom() {
  // Small alchemical symbol — sits at very bottom of sidebar
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Upward triangle (fire) */}
      <polygon
        points="12,3 21,19 3,19"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.3"
      />
      {/* Horizontal crossbar */}
      <line x1="6" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

export function SvgNavDashboard({ active = false }: { active?: boolean }) {
  // Crescent + dot — sanctum/home
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <defs>
        <clipPath id="nav-dash-clip">
          <circle cx="7" cy="7" r="5" />
        </clipPath>
      </defs>
      <circle cx="7" cy="7" r="5" fill="currentColor" opacity={active ? 0.8 : 0.4} />
      {/* S&O: --char background #0c0c14 */}
      <circle cx="10" cy="6" r="4" fill="#0c0c14" clipPath="url(#nav-dash-clip)" />
      <circle cx="5" cy="9" r="1" fill="currentColor" opacity={active ? 1 : 0.5} />
    </svg>
  )
}

export function SvgNavImages({ active = false }: { active?: boolean }) {
  // Aperture/eye — darkroom
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="0.8"
        opacity={active ? 0.9 : 0.5} />
      <circle cx="7" cy="7" r="2.5" fill="currentColor" opacity={active ? 0.8 : 0.4} />
      {/* S&O: --char background #0c0c14 */}
      <circle cx="7" cy="7" r="1" fill="#0c0c14" />
      <line x1="7" y1="2" x2="7" y2="4" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="12" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="7" y1="12" x2="7" y2="10" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="2" y1="7" x2="4" y2="7" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
    </svg>
  )
}

export function SvgNavFaceclaims({ active = false }: { active?: boolean }) {
  // Portrait frame — gallery
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="2" width="10" height="10" rx="0.5"
        stroke="currentColor" strokeWidth="0.8" fill="none"
        opacity={active ? 0.9 : 0.5} />
      <rect x="3.5" y="3.5" width="7" height="7" rx="0.3"
        stroke="currentColor" strokeWidth="0.4" fill="none"
        opacity={active ? 0.5 : 0.25} />
      {/* Head silhouette */}
      <circle cx="7" cy="6.5" r="1.5" fill="currentColor" opacity={active ? 0.6 : 0.3} />
      <path d="M4.5 10 Q7 8 9.5 10" stroke="currentColor" strokeWidth="0.5"
        fill="none" opacity={active ? 0.6 : 0.3} />
    </svg>
  )
}

export function SvgNavLibrary({ active = false }: { active?: boolean }) {
  // Open tome/book
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 3 L7 11" stroke="currentColor" strokeWidth="0.6" opacity={active ? 0.8 : 0.4} />
      <path d="M2.5 3 Q5 2.5 7 3 L7 11 Q5 11.5 2.5 11 Z"
        stroke="currentColor" strokeWidth="0.7" fill="currentColor"
        fillOpacity={active ? 0.15 : 0.07} opacity={active ? 0.9 : 0.5} />
      <path d="M7 3 Q9 2.5 11.5 3 L11.5 11 Q9 11.5 7 11 Z"
        stroke="currentColor" strokeWidth="0.7" fill="currentColor"
        fillOpacity={active ? 0.15 : 0.07} opacity={active ? 0.9 : 0.5} />
    </svg>
  )
}

export function SvgNavWishlist({ active = false }: { active?: boolean }) {
  // Four-point star / desire symbol
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1 L8 6 L13 7 L8 8 L7 13 L6 8 L1 7 L6 6 Z"
        fill="currentColor" opacity={active ? 0.8 : 0.4}
        stroke="currentColor" strokeWidth="0.3" />
    </svg>
  )
}

export function SvgNavPartners({ active = false }: { active?: boolean }) {
  // Wax seal / letter
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="3.5" width="11" height="7" rx="0.5"
        stroke="currentColor" strokeWidth="0.8" fill="none"
        opacity={active ? 0.9 : 0.5} />
      <path d="M1.5 3.5 L7 7.5 L12.5 3.5"
        stroke="currentColor" strokeWidth="0.7" fill="none"
        opacity={active ? 0.9 : 0.5} />
    </svg>
  )
}

export function SvgNavStacks({ active = false }: { active?: boolean }) {
  // Layered diamonds — reliquary
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="8" width="6" height="4" rx="0.3"
        fill="currentColor" opacity={active ? 0.4 : 0.2}
        stroke="currentColor" strokeWidth="0.5" />
      <rect x="3" y="5" width="8" height="4" rx="0.3"
        fill="currentColor" opacity={active ? 0.5 : 0.25}
        stroke="currentColor" strokeWidth="0.6" />
      <rect x="2" y="2" width="10" height="4" rx="0.3"
        fill="currentColor" opacity={active ? 0.15 : 0.08}
        stroke="currentColor" strokeWidth="0.8" />
    </svg>
  )
}

export function SvgNavSearch({ active = false }: { active?: boolean }) {
  // Scrying circle / oracle
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="0.8"
        opacity={active ? 0.9 : 0.5} />
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="0.4"
        opacity={active ? 0.6 : 0.3} />
      <circle cx="7" cy="7" r="1" fill="currentColor" opacity={active ? 0.8 : 0.4} />
      {/* Ripple lines */}
      <line x1="7" y1="1" x2="7" y2="2.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="13" y1="7" x2="11.5" y2="7" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="7" y1="13" x2="7" y2="11.5" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="1" y1="7" x2="2.5" y2="7" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

export function SvgPortalIcon({
  className = '',
  style,
}: { className?: string; style?: React.CSSProperties } = {}) {
  // Small arch/portal — "back to TWH" indicator
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className} style={style}>
      <path d="M2 11 L2 5 Q2 1 6 1 Q10 1 10 5 L10 11"
        stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.6" />
      <line x1="1" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    </svg>
  )
}

export function SvgFiligreeRule({
  width = '100%',
}: { width?: string | number }) {
  // Decorative horizontal rule with diamond pip
  return (
    <svg
      width={width}
      height="12"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="0" y1="6" x2="88" y2="6" stroke="currentColor"
        strokeWidth="0.5" opacity="0.3" />
      <rect x="96" y="3" width="6" height="6" rx="0.5"
        transform="rotate(45 99 6)"
        fill="currentColor" opacity="0.5" />
      <line x1="112" y1="6" x2="200" y2="6" stroke="currentColor"
        strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}
