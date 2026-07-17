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

// ─── MOJO-7C: The Sanctum additions ─────────────────────────

export function SvgMoon({
  size = 320,
  idSuffix = 'main',
  className = '',
}: {
  size?: number
  idSuffix?: string
  className?: string
}) {
  // The Sanctum centrepiece — a large luminous moon.
  const r = size / 2
  const gradId = `moon-radial-${idSuffix}`
  const glowId = `moon-glow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        {/* Radial gradient: bright centre fading to silver-grey edge */}
        <radialGradient id={gradId} cx="38%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#f0f0f8" stopOpacity="0.95" />
          <stop offset="40%"  stopColor="#d0d0e0" stopOpacity="0.90" />
          <stop offset="75%"  stopColor="#a8a8c0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#808098" stopOpacity="0.75" />
        </radialGradient>
        {/* Outer glow filter */}
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Atmosphere halo — outermost ring, very faint violet */}
      <circle
        cx={r} cy={r} r={r - 4}
        stroke="currentColor" strokeWidth="28"
        strokeOpacity="0.06"
        fill="none"
        filter={`url(#${glowId})`}
      />
      {/* Secondary halo — tighter, slightly stronger */}
      <circle
        cx={r} cy={r} r={r - 20}
        stroke="currentColor" strokeWidth="16"
        strokeOpacity="0.10"
        fill="none"
      />
      {/* Moon body */}
      <circle
        cx={r} cy={r} r={r - 36}
        fill={`url(#${gradId})`}
      />
      {/* Surface texture — subtle darker patches suggesting craters */}
      <circle cx={r * 0.6} cy={r * 0.55} r={r * 0.08}
        fill="#808098" opacity="0.10" />
      <circle cx={r * 0.75} cy={r * 0.72} r={r * 0.05}
        fill="#808098" opacity="0.08" />
      <circle cx={r * 0.45} cy={r * 0.70} r={r * 0.06}
        fill="#808098" opacity="0.07" />
      <circle cx={r * 0.80} cy={r * 0.42} r={r * 0.04}
        fill="#808098" opacity="0.09" />
      <circle cx={r * 0.55} cy={r * 0.38} r={r * 0.035}
        fill="#808098" opacity="0.06" />
      {/* Highlight catch-light — upper left quadrant */}
      <ellipse
        cx={r * 0.68} cy={r * 0.50}
        rx={r * 0.22} ry={r * 0.14}
        fill="white" opacity="0.18"
        transform={`rotate(-20 ${r * 0.68} ${r * 0.50})`}
      />
    </svg>
  )
}

export function SvgCandle({
  height = 90,
  idSuffix = 'left',
  flameDelay = '0s',
}: {
  height?: number
  idSuffix?: string
  flameDelay?: string
}) {
  // A tall ornate candle with animated flame. Used in pairs.
  const baseH = height * 0.12   // holder/base
  const waxH  = height * 0.65   // wax column
  const waxW  = height * 0.14   // wax column width
  const flameH = height * 0.20  // flame area
  const totalW = height * 0.28  // total SVG width including holder
  const cx = totalW / 2         // center x

  return (
    <svg
      width={totalW}
      height={height}
      viewBox={`0 0 ${totalW} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Candle holder / base */}
      <ellipse
        cx={cx} cy={height - baseH * 0.3}
        rx={totalW * 0.45} ry={baseH * 0.35}
        fill="currentColor" opacity="0.4"
      />
      <rect
        x={cx - totalW * 0.22}
        y={height - baseH}
        width={totalW * 0.44}
        height={baseH * 0.7}
        rx="1"
        fill="currentColor" opacity="0.3"
      />
      {/* Wax column */}
      <rect
        x={cx - waxW / 2}
        y={height - baseH - waxH}
        width={waxW}
        height={waxH}
        rx="1.5"
        fill="currentColor" opacity="0.20"
      />
      {/* Wax left edge highlight */}
      <rect
        x={cx - waxW / 2}
        y={height - baseH - waxH}
        width={waxW * 0.15}
        height={waxH}
        rx="1"
        fill="white" opacity="0.07"
      />
      {/* Wax drip 1 */}
      <path
        d={`M ${cx - waxW * 0.3} ${height - baseH - waxH + waxH * 0.2}
            Q ${cx - waxW * 0.55} ${height - baseH - waxH + waxH * 0.35}
              ${cx - waxW * 0.5} ${height - baseH - waxH + waxH * 0.5}`}
        stroke="currentColor" strokeWidth={waxW * 0.25}
        strokeLinecap="round" opacity="0.15"
      />
      {/* Wax drip 2 */}
      <path
        d={`M ${cx + waxW * 0.15} ${height - baseH - waxH + waxH * 0.1}
            Q ${cx + waxW * 0.55} ${height - baseH - waxH + waxH * 0.28}
              ${cx + waxW * 0.45} ${height - baseH - waxH + waxH * 0.42}`}
        stroke="currentColor" strokeWidth={waxW * 0.2}
        strokeLinecap="round" opacity="0.12"
      />
      {/* Wick */}
      <line
        x1={cx} y1={height - baseH - waxH}
        x2={cx} y2={height - baseH - waxH - flameH * 0.22}
        stroke="currentColor" strokeWidth="1.2"
        opacity="0.6"
        strokeLinecap="round"
      />
      {/* Flame — outer layer */}
      <ellipse
        cx={cx}
        cy={height - baseH - waxH - flameH * 0.55}
        rx={waxW * 0.6}
        ry={flameH * 0.5}
        fill="currentColor" opacity="0.35"
        style={{
          transformOrigin: `${cx}px ${height - baseH - waxH - flameH * 0.1}px`,
          animationName: 'mojo-flame-main',
          animationDuration: '1.8s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: flameDelay,
        }}
      />
      {/* Flame — inner brighter layer */}
      <ellipse
        cx={cx}
        cy={height - baseH - waxH - flameH * 0.45}
        rx={waxW * 0.35}
        ry={flameH * 0.35}
        fill="white" opacity="0.45"
        style={{
          transformOrigin: `${cx}px ${height - baseH - waxH - flameH * 0.1}px`,
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: flameDelay,
        }}
      />
      {/* Flame — smoke wisp above */}
      <ellipse
        cx={cx}
        cy={height - baseH - waxH - flameH * 1.05}
        rx={waxW * 0.15}
        ry={flameH * 0.18}
        fill="currentColor" opacity="0.08"
        style={{
          transformOrigin: `${cx}px ${height - baseH - waxH - flameH * 0.8}px`,
          animationName: 'mojo-flame-smoke',
          animationDuration: '2.5s',
          animationTimingFunction: 'ease-out',
          animationIterationCount: 'infinite',
          animationDelay: flameDelay,
        }}
      />
    </svg>
  )
}

export function SvgCornerBracket({
  size = 16,
  color = 'currentColor',
  rotation = 0,
  style,
}: {
  size?: number
  color?: string
  rotation?: 0 | 90 | 180 | 270
  style?: React.CSSProperties
}) {
  // An L-shaped corner accent. Render four times per RP panel, rotated.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{
        transform: `rotate(${rotation}deg)`,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {/* Top-left L bracket */}
      <path
        d="M 1 8 L 1 1 L 8 1"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="square"
        opacity="0.65"
      />
      {/* Inner pip at corner */}
      <rect x="3" y="3" width="2" height="2"
        fill={color} opacity="0.4" />
    </svg>
  )
}

export function SvgPageHeaderRule() {
  // An elaborate decorative rule for page headings — wider and more
  // ornate than SvgFiligreeRule.
  return (
    <svg
      width="100%"
      height="20"
      viewBox="0 0 400 20"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left line */}
      <line x1="0" y1="10" x2="155" y2="10"
        stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      {/* Left diamond */}
      <rect x="158" y="7" width="6" height="6"
        transform="rotate(45 161 10)"
        fill="currentColor" opacity="0.3" />
      {/* Left thin line */}
      <line x1="166" y1="10" x2="176" y2="10"
        stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
      {/* Centre crescent */}
      <text x="183" y="14" fontSize="11"
        fill="currentColor" opacity="0.55"
        fontFamily="serif" textAnchor="middle">
        ☽
      </text>
      {/* Right thin line */}
      <line x1="192" y1="10" x2="234" y2="10"
        stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
      {/* Right diamond */}
      <rect x="236" y="7" width="6" height="6"
        transform="rotate(45 239 10)"
        fill="currentColor" opacity="0.3" />
      {/* Right line */}
      <line x1="245" y1="10" x2="400" y2="10"
        stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
    </svg>
  )
}

// ─── MOJO-7D: The Dossier additions ─────────────────────────

export function SvgIvyTrail({
  width = 140,
  height = 80,
  flip = false,
}: {
  width?: number
  height?: number
  flip?: boolean   // true = mirror horizontally (right side)
}) {
  // A trailing ivy-and-vine design for the character banner margins.
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 140 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        pointerEvents: 'none',
      }}
    >
      {/* Main vine stem — a gently curving path from bottom-left upward */}
      <path
        d="M 8 72 C 20 60, 15 45, 28 38 C 40 31, 35 18, 52 12"
        stroke="currentColor" strokeWidth="1.2"
        strokeLinecap="round" opacity="0.35"
        fill="none"
      />
      {/* Secondary vine branch */}
      <path
        d="M 28 38 C 45 35, 55 42, 70 36"
        stroke="currentColor" strokeWidth="0.8"
        strokeLinecap="round" opacity="0.25"
        fill="none"
      />
      {/* Tertiary tendril */}
      <path
        d="M 52 12 C 65 8, 80 14, 90 8"
        stroke="currentColor" strokeWidth="0.6"
        strokeLinecap="round" opacity="0.20"
        fill="none"
      />

      {/* Leaf 1 — lower, large */}
      <ellipse cx="18" cy="58" rx="9" ry="5"
        fill="currentColor" opacity="0.18"
        transform="rotate(-30 18 58)" />
      {/* Leaf 1 vein */}
      <line x1="12" y1="61" x2="24" y2="55"
        stroke="currentColor" strokeWidth="0.4" opacity="0.15" />

      {/* Leaf 2 — mid-stem */}
      <ellipse cx="36" cy="32" rx="8" ry="4.5"
        fill="currentColor" opacity="0.20"
        transform="rotate(20 36 32)" />
      <line x1="30" y1="35" x2="42" y2="29"
        stroke="currentColor" strokeWidth="0.4" opacity="0.15" />

      {/* Leaf 3 — branch leaf */}
      <ellipse cx="58" cy="40" rx="7" ry="4"
        fill="currentColor" opacity="0.16"
        transform="rotate(-15 58 40)" />

      {/* Leaf 4 — upper */}
      <ellipse cx="62" cy="14" rx="8" ry="4"
        fill="currentColor" opacity="0.19"
        transform="rotate(25 62 14)" />
      <line x1="56" y1="17" x2="68" y2="11"
        stroke="currentColor" strokeWidth="0.4" opacity="0.14" />

      {/* Leaf 5 — top tendril */}
      <ellipse cx="88" cy="10" rx="6" ry="3"
        fill="currentColor" opacity="0.14"
        transform="rotate(-10 88 10)" />

      {/* Small curl tendrils */}
      <path
        d="M 40 26 C 44 20, 48 22, 46 26"
        stroke="currentColor" strokeWidth="0.5"
        strokeLinecap="round" opacity="0.15" fill="none"
      />
      <path
        d="M 70 30 C 75 25, 80 27, 78 31"
        stroke="currentColor" strokeWidth="0.5"
        strokeLinecap="round" opacity="0.12" fill="none"
      />
      <path
        d="M 55 8 C 58 3, 62 5, 60 9"
        stroke="currentColor" strokeWidth="0.4"
        strokeLinecap="round" opacity="0.12" fill="none"
      />

      {/* Scattered small dots — berries or buds */}
      <circle cx="24" cy="42" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="46" cy="22" r="1.2" fill="currentColor" opacity="0.12" />
      <circle cx="78" cy="38" r="1" fill="currentColor" opacity="0.10" />
    </svg>
  )
}

export function SvgMedallion({
  size = 160,
  idSuffix = 'char',
}: {
  size?: number
  idSuffix?: string
}) {
  // An ornate circular frame for the character avatar portrait.
  // Pure SVG overlay — the parent renders the avatar clip circle
  // behind this component and positions this on top.
  const r = size / 2
  const outerR = r - 2
  const innerR = r - 22

  // Tick marks around the outer ring — 24 evenly spaced
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24
    const rad = (angle * Math.PI) / 180
    const isMajor = i % 6 === 0  // major at N/E/S/W
    const tickLen = isMajor ? 6 : 3
    const x1 = r + (outerR - 3) * Math.cos(rad)
    const y1 = r + (outerR - 3) * Math.sin(rad)
    const x2 = r + (outerR - 3 - tickLen) * Math.cos(rad)
    const y2 = r + (outerR - 3 - tickLen) * Math.sin(rad)
    return { x1, y1, x2, y2, isMajor }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Outer decorative ring */}
      <circle cx={r} cy={r} r={outerR}
        stroke="currentColor" strokeWidth="0.8" opacity="0.30" />

      {/* Tick marks */}
      {ticks.map((tick, i) => (
        <line
          key={i}
          x1={tick.x1} y1={tick.y1}
          x2={tick.x2} y2={tick.y2}
          stroke="currentColor"
          strokeWidth={tick.isMajor ? 1.2 : 0.6}
          opacity={tick.isMajor ? 0.45 : 0.20}
        />
      ))}

      {/* Diamond pips at N/E/S/W */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = ((angle - 90) * Math.PI) / 180
        const px = r + (outerR - 14) * Math.cos(rad)
        const py = r + (outerR - 14) * Math.sin(rad)
        return (
          <rect
            key={i}
            x={px - 3} y={py - 3}
            width="6" height="6"
            transform={`rotate(45 ${px} ${py})`}
            fill="currentColor" opacity="0.40"
          />
        )
      })}

      {/* Inner ring — the portrait boundary */}
      <circle cx={r} cy={r} r={innerR}
        stroke="currentColor" strokeWidth="1.2" opacity="0.45" />

      {/* Very subtle inner glow ring */}
      <circle cx={r} cy={r} r={innerR - 3}
        stroke="currentColor" strokeWidth="0.4" opacity="0.15" />
    </svg>
  )
}

// ── Portrait Gallery SVGs (MOJO-7E) ──────────────────────

export function SvgPortraitFrame({
  width = 180,
  height = 300,
  idSuffix = 'frame',
}: {
  width?: number
  height?: number
  color?: string    // kept for API compatibility — not used; frame uses
                     // its own metallic palette (see MOJO-FIX-016)
  idSuffix?: string
}) {
  // Confirmed Silver & Onyx hex values — grep -A 80
  // 'data-theme="silver-onyx"' app/globals.css. Literal hex, not
  // currentColor, so the frame reads as aged metal against any image.
  const MIST = '#9c9ab8'    // --mist — brushed silver
  const GOLD = '#a02840'    // --gold — dark garnet (not literal gold)
  const ROSEASH = '#eae8f4' // --roseash — specular highlight
  const FADED = '#5a5878'   // --faded — shadow falloff on the metal

  const gId = `pf-glow-${idSuffix}`
  const mId = `pf-metal-${idSuffix}`
  const iId = `pf-inner-${idSuffix}`

  // Corner arm lengths — proportional to frame size
  const arm  = Math.min(width, height) * 0.18  // outer arm length
  const arm2 = arm * 0.72                       // middle arm
  const arm3 = arm * 0.48                       // inner arm
  const gem  = Math.min(width, height) * 0.028  // gem half-size

  // Corner positions + direction multipliers
  const corners = [
    { x: 0,     y: 0,      rx: 1,  ry: 1  },  // top-left
    { x: width, y: 0,      rx: -1, ry: 1  },  // top-right
    { x: 0,     y: height, rx: 1,  ry: -1 },  // bottom-left
    { x: width, y: height, rx: -1, ry: -1 },  // bottom-right
  ]

  // Mid-point gem positions — top, bottom, left, right
  const gems = [
    { tx: width / 2, ty: 3,          opDeep: 0.75, opLight: 0.85, highlight: true },
    { tx: width / 2, ty: height - 3, opDeep: 0.65, opLight: 0.75, highlight: false },
    { tx: 3,          ty: height / 2, opDeep: 0.65, opLight: 0.75, highlight: false },
    { tx: width - 3,  ty: height / 2, opDeep: 0.65, opLight: 0.75, highlight: false },
  ]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* Outer glow — warm silver haze behind the frame */}
        <filter id={gId} x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Brushed-metal gradient — specular highlight top, deep
            shadow falloff toward the bottom, like real cast silver */}
        <linearGradient id={mId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={ROSEASH} stopOpacity="0.85" />
          <stop offset="18%"  stopColor={MIST}    stopOpacity="0.90" />
          <stop offset="55%"  stopColor={MIST}    stopOpacity="0.65" />
          <stop offset="100%" stopColor={FADED}   stopOpacity="0.55" />
        </linearGradient>
        {/* Inner bevel gradient */}
        <linearGradient id={iId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={MIST}  stopOpacity="0.32" />
          <stop offset="100%" stopColor={FADED} stopOpacity="0.18" />
        </linearGradient>
      </defs>

      {/* ── OUTER FRAME EDGE ── */}
      {/* Glow layer behind main frame */}
      <rect
        x="1" y="1" width={width - 2} height={height - 2}
        stroke={MIST} strokeWidth="3" strokeOpacity="0.16"
        fill="none" rx="1"
        filter={`url(#${gId})`}
      />
      {/* Main outer frame line — brushed-metal gradient */}
      <rect
        x="1.5" y="1.5" width={width - 3} height={height - 3}
        stroke={`url(#${mId})`} strokeWidth="1.3"
        fill="none" rx="1"
      />

      {/* ── INNER BEVEL LINE ── */}
      <rect
        x="6" y="6" width={width - 12} height={height - 12}
        stroke={`url(#${iId})`} strokeWidth="0.7"
        fill="none" rx="0.5"
      />

      {/* ── CORNER FLOURISHES — three nested L-shapes per corner ── */}
      {corners.map((c, ci) => (
        <g key={ci}>
          {/* Outermost L — brightest, brushed silver */}
          <path
            d={`
              M ${c.x + c.rx * 2} ${c.y + c.ry * (2 + arm)}
              L ${c.x + c.rx * 2} ${c.y + c.ry * 2}
              L ${c.x + c.rx * (2 + arm)} ${c.y + c.ry * 2}
            `}
            stroke={MIST} strokeWidth="1.4" strokeLinecap="round"
            opacity="0.88"
          />
          {/* Second L — garnet accent */}
          <path
            d={`
              M ${c.x + c.rx * 5} ${c.y + c.ry * (5 + arm2)}
              L ${c.x + c.rx * 5} ${c.y + c.ry * 5}
              L ${c.x + c.rx * (5 + arm2)} ${c.y + c.ry * 5}
            `}
            stroke={GOLD} strokeWidth="0.9" strokeLinecap="round"
            opacity="0.72"
          />
          {/* Third L — innermost, thin garnet */}
          <path
            d={`
              M ${c.x + c.rx * 8} ${c.y + c.ry * (8 + arm3)}
              L ${c.x + c.rx * 8} ${c.y + c.ry * 8}
              L ${c.x + c.rx * (8 + arm3)} ${c.y + c.ry * 8}
            `}
            stroke={GOLD} strokeWidth="0.6" strokeLinecap="round"
            opacity="0.50"
          />
          {/* Corner tip curl — small garnet bead at the outermost L's end */}
          <circle
            cx={c.x + c.rx * (2 + arm)}
            cy={c.y + c.ry * 2}
            r="1.8"
            fill={GOLD} opacity="0.65"
          />
          {/* Inner corner dot */}
          <circle
            cx={c.x + c.rx * 8}
            cy={c.y + c.ry * 8}
            r="1.0"
            fill={GOLD} opacity="0.45"
          />
        </g>
      ))}

      {/* ── MID-POINT GEMS — garnet diamond set in silver ── */}
      {gems.map((g, gi) => (
        <g key={gi} transform={`translate(${g.tx} ${g.ty})`}>
          <path
            d={`M 0 ${-gem} L ${gem} 0 L 0 ${gem} L ${-gem} 0 Z`}
            fill={GOLD} opacity={g.opDeep}
          />
          <path
            d={`M 0 ${-gem * 0.5} L ${gem * 0.5} 0 L 0 ${gem * 0.5} L ${-gem * 0.5} 0 Z`}
            fill={MIST} opacity={g.opLight}
          />
          {g.highlight && (
            <circle cx={-gem * 0.2} cy={-gem * 0.3} r={gem * 0.2}
              fill={ROSEASH} opacity="0.55" />
          )}
        </g>
      ))}
    </svg>
  )
}

export function SvgFlourishUnderline({
  width = 300,
}: { width?: number }) {
  return (
    <svg
      width={width}
      height="16"
      viewBox="0 0 300 16"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      {/* Main flourish stroke — starts thin, swells, tapers */}
      <path
        d="M 0 10 C 30 8, 60 12, 100 9 C 130 7, 145 11, 150 8
           C 155 5, 170 9, 200 8 C 230 7, 260 11, 290 9 L 300 10"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.40"
      />
      {/* Swelled center — thicker stroke in the middle section */}
      <path
        d="M 100 9 C 120 7, 135 11, 150 8 C 165 5, 180 9, 200 8"
        stroke="currentColor"
        strokeWidth="2.0"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Decorative tail at right end */}
      <path
        d="M 285 9 C 292 6, 298 12, 300 8 C 302 4, 308 10, 305 14"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.25"
      />
      {/* Small diamond at the swell peak */}
      <rect x="147" y="4" width="6" height="6"
        transform="rotate(45 150 7)"
        fill="currentColor" opacity="0.30" />
    </svg>
  )
}

export function SvgCandleFlame({
  size = 16,
  delay = '0s',
  className = '',
}: {
  size?: number
  delay?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 16 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Outer flame */}
      <ellipse cx="8" cy="14" rx="5" ry="9"
        fill="currentColor" opacity="0.35"
        style={{
          transformOrigin: '8px 22px',
          animationName: 'mojo-flame-main',
          animationDuration: '1.8s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: delay,
        }}
      />
      {/* Inner flame */}
      <ellipse cx="8" cy="16" rx="3" ry="6"
        fill="white" opacity="0.50"
        style={{
          transformOrigin: '8px 22px',
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: delay,
        }}
      />
      {/* Wick dot */}
      <circle cx="8" cy="22" r="1.5"
        fill="currentColor" opacity="0.6" />
    </svg>
  )
}

export function SvgGalleryCorridor({
  width = 800,
  height = 200,
}: { width?: number; height?: number }) {
  const cx = width / 2  // vanishing point x
  const vy = height * 0.45  // vanishing point y

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      {/* Ceiling line */}
      <line x1="0" y1="0" x2={width} y2="0"
        stroke="currentColor" strokeWidth="0.5" opacity="0.12" />

      {/* Floor line */}
      <line x1="0" y1={height} x2={width} y2={height}
        stroke="currentColor" strokeWidth="0.5" opacity="0.12" />

      {/* Left wall perspective lines — converging to vanishing point */}
      {[0, 0.15, 0.3, 0.45, 0.6].map((frac, i) => (
        <line key={`l${i}`}
          x1={width * frac} y1="0"
          x2={cx} y2={vy}
          stroke="currentColor"
          strokeWidth={i === 0 ? 0.8 : 0.4}
          opacity={0.08 - i * 0.012}
        />
      ))}

      {/* Right wall perspective lines */}
      {[1, 0.85, 0.70, 0.55, 0.40].map((frac, i) => (
        <line key={`r${i}`}
          x1={width * frac} y1="0"
          x2={cx} y2={vy}
          stroke="currentColor"
          strokeWidth={i === 0 ? 0.8 : 0.4}
          opacity={0.08 - i * 0.012}
        />
      ))}

      {/* Floor perspective lines */}
      {[0, 0.15, 0.3, 0.45, 0.55, 0.70, 0.85, 1].map((frac, i) => (
        <line key={`f${i}`}
          x1={width * frac} y1={height}
          x2={cx} y2={vy}
          stroke="currentColor" strokeWidth="0.4"
          opacity={0.05}
        />
      ))}

      {/* Vanishing point — very faint circle */}
      <circle cx={cx} cy={vy} r="4"
        stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
      <circle cx={cx} cy={vy} r="1"
        fill="currentColor" opacity="0.10" />

      {/* Wall panel suggestions — vertical lines at diminishing widths */}
      {[-280, -180, -100, -40, 40, 100, 180, 280].map((offset, i) => {
        const x = cx + offset
        if (x < 0 || x > width) return null
        return (
          <line key={`p${i}`}
            x1={x} y1="0"
            x2={x} y2={height}
            stroke="currentColor" strokeWidth="0.3"
            opacity={0.04}
          />
        )
      })}
    </svg>
  )
}

// ── Library SVGs (MOJO-7F) ────────────────────────────────

export function SvgBookshelf({ className = '' }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="90"
      viewBox="0 0 800 90"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* ── Upper shelf board ── */}
      <rect x="0" y="0" width="800" height="4"
        fill="currentColor" opacity="0.20" />
      {/* Shelf shadow */}
      <rect x="0" y="4" width="800" height="2"
        fill="currentColor" opacity="0.08" />

      {/* ── Books on upper shelf (y from 4 to ~44) ── */}
      {/* Each book: x, width, height (from shelf top), color-opacity */}
      {[
        { x: 8,   w: 18, h: 36, o: 0.20 },
        { x: 26,  w: 12, h: 30, o: 0.14 },
        { x: 38,  w: 22, h: 38, o: 0.18 },
        { x: 60,  w: 14, h: 28, o: 0.16 },
        { x: 74,  w: 10, h: 34, o: 0.12 },
        { x: 84,  w: 20, h: 40, o: 0.22 },
        { x: 104, w: 8,  h: 26, o: 0.10 },
        { x: 112, w: 16, h: 36, o: 0.18 },
        { x: 128, w: 24, h: 38, o: 0.16 },
        { x: 152, w: 12, h: 30, o: 0.14 },
        { x: 164, w: 18, h: 40, o: 0.20 },
        { x: 182, w: 10, h: 28, o: 0.12 },
        { x: 192, w: 14, h: 36, o: 0.16 },
        { x: 206, w: 22, h: 34, o: 0.18 },
        { x: 228, w: 16, h: 38, o: 0.14 },
        { x: 244, w: 10, h: 26, o: 0.10 },
        { x: 254, w: 20, h: 40, o: 0.22 },
        { x: 274, w: 14, h: 30, o: 0.16 },
        { x: 288, w: 18, h: 36, o: 0.18 },
        { x: 306, w: 8,  h: 24, o: 0.10 },
        { x: 314, w: 22, h: 38, o: 0.20 },
        { x: 336, w: 12, h: 28, o: 0.14 },
        { x: 348, w: 16, h: 34, o: 0.16 },
        { x: 364, w: 20, h: 40, o: 0.18 },
        { x: 384, w: 10, h: 26, o: 0.12 },
        { x: 394, w: 18, h: 36, o: 0.20 },
        { x: 412, w: 14, h: 38, o: 0.16 },
        { x: 426, w: 22, h: 30, o: 0.18 },
        { x: 448, w: 8,  h: 36, o: 0.12 },
        { x: 456, w: 20, h: 40, o: 0.22 },
        { x: 476, w: 12, h: 28, o: 0.14 },
        { x: 488, w: 18, h: 34, o: 0.16 },
        { x: 506, w: 16, h: 38, o: 0.18 },
        { x: 522, w: 10, h: 26, o: 0.10 },
        { x: 532, w: 24, h: 40, o: 0.20 },
        { x: 556, w: 14, h: 30, o: 0.14 },
        { x: 570, w: 18, h: 36, o: 0.18 },
        { x: 588, w: 8,  h: 24, o: 0.10 },
        { x: 596, w: 20, h: 38, o: 0.16 },
        { x: 616, w: 12, h: 34, o: 0.14 },
        { x: 628, w: 22, h: 40, o: 0.22 },
        { x: 650, w: 10, h: 28, o: 0.12 },
        { x: 660, w: 18, h: 36, o: 0.18 },
        { x: 678, w: 14, h: 30, o: 0.16 },
        { x: 692, w: 20, h: 38, o: 0.20 },
        { x: 712, w: 8,  h: 26, o: 0.10 },
        { x: 720, w: 24, h: 40, o: 0.18 },
        { x: 744, w: 16, h: 34, o: 0.16 },
        { x: 760, w: 12, h: 28, o: 0.14 },
        { x: 772, w: 20, h: 36, o: 0.20 },
      ].map((book, i) => (
        <rect
          key={i}
          x={book.x}
          y={44 - book.h}
          width={book.w}
          height={book.h}
          fill="currentColor"
          opacity={book.o}
          rx="0.5"
        />
      ))}

      {/* Small scroll between books around x=102 */}
      <ellipse cx="110" cy="24" rx="4" ry="7"
        fill="currentColor" opacity="0.12" />
      <line x1="110" y1="17" x2="110" y2="31"
        stroke="currentColor" strokeWidth="0.5" opacity="0.10" />

      {/* Small hourglass silhouette around x=320 */}
      <path d="M 316 18 L 326 18 L 321 26 L 326 34 L 316 34 L 321 26 Z"
        fill="currentColor" opacity="0.08" />

      {/* ── Lower shelf board ── */}
      <rect x="0" y="44" width="800" height="4"
        fill="currentColor" opacity="0.20" />
      <rect x="0" y="48" width="800" height="2"
        fill="currentColor" opacity="0.08" />

      {/* ── Books on lower shelf (y from 48 to ~86) ── */}
      {[
        { x: 4,   w: 20, h: 32, o: 0.16 },
        { x: 24,  w: 14, h: 26, o: 0.12 },
        { x: 38,  w: 18, h: 34, o: 0.18 },
        { x: 56,  w: 10, h: 28, o: 0.14 },
        { x: 66,  w: 24, h: 36, o: 0.20 },
        { x: 90,  w: 12, h: 24, o: 0.10 },
        { x: 102, w: 20, h: 32, o: 0.16 },
        { x: 122, w: 16, h: 36, o: 0.18 },
        { x: 138, w: 10, h: 26, o: 0.12 },
        { x: 148, w: 22, h: 34, o: 0.20 },
        { x: 170, w: 14, h: 30, o: 0.14 },
        { x: 184, w: 18, h: 36, o: 0.18 },
        { x: 202, w: 8,  h: 22, o: 0.10 },
        { x: 210, w: 20, h: 34, o: 0.16 },
        { x: 230, w: 16, h: 28, o: 0.14 },
        { x: 246, w: 22, h: 36, o: 0.20 },
        { x: 268, w: 12, h: 24, o: 0.12 },
        { x: 280, w: 18, h: 32, o: 0.18 },
        { x: 298, w: 10, h: 28, o: 0.12 },
        { x: 308, w: 24, h: 36, o: 0.22 },
        { x: 332, w: 14, h: 26, o: 0.14 },
        { x: 346, w: 20, h: 34, o: 0.18 },
        { x: 366, w: 8,  h: 22, o: 0.10 },
        { x: 374, w: 18, h: 30, o: 0.16 },
        { x: 392, w: 14, h: 36, o: 0.18 },
        { x: 406, w: 22, h: 32, o: 0.20 },
        { x: 428, w: 10, h: 26, o: 0.12 },
        { x: 438, w: 18, h: 34, o: 0.16 },
        { x: 456, w: 16, h: 28, o: 0.14 },
        { x: 472, w: 20, h: 36, o: 0.20 },
        { x: 492, w: 8,  h: 24, o: 0.10 },
        { x: 500, w: 22, h: 32, o: 0.18 },
        { x: 522, w: 14, h: 36, o: 0.16 },
        { x: 536, w: 18, h: 28, o: 0.18 },
        { x: 554, w: 10, h: 34, o: 0.12 },
        { x: 564, w: 24, h: 36, o: 0.22 },
        { x: 588, w: 12, h: 24, o: 0.12 },
        { x: 600, w: 20, h: 32, o: 0.18 },
        { x: 620, w: 16, h: 36, o: 0.16 },
        { x: 636, w: 10, h: 26, o: 0.12 },
        { x: 646, w: 22, h: 34, o: 0.20 },
        { x: 668, w: 14, h: 28, o: 0.14 },
        { x: 682, w: 18, h: 36, o: 0.18 },
        { x: 700, w: 8,  h: 22, o: 0.10 },
        { x: 708, w: 20, h: 34, o: 0.16 },
        { x: 728, w: 16, h: 30, o: 0.14 },
        { x: 744, w: 22, h: 36, o: 0.20 },
        { x: 766, w: 12, h: 26, o: 0.12 },
        { x: 778, w: 18, h: 32, o: 0.16 },
      ].map((book, i) => (
        <rect
          key={i}
          x={book.x}
          y={86 - book.h}
          width={book.w}
          height={book.h}
          fill="currentColor"
          opacity={book.o}
          rx="0.5"
        />
      ))}

      {/* Small magnifying glass between lower books around x=556 */}
      <circle cx="557" cy="62" r="5"
        stroke="currentColor" strokeWidth="1" opacity="0.10" fill="none" />
      <line x1="561" y1="66" x2="565" y2="70"
        stroke="currentColor" strokeWidth="1.2" opacity="0.10"
        strokeLinecap="round" />
    </svg>
  )
}

export function SvgScrollEnd({
  flip = false,
}: { flip?: boolean }) {
  return (
    <svg
      width="100%"
      height="12"
      viewBox="0 0 400 12"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        transform: flip ? 'scaleY(-1)' : undefined,
        pointerEvents: 'none',
      }}
    >
      {/* The rolled edge — a gentle arc suggesting curled paper */}
      <path
        d="M 0 2 Q 100 0, 200 2 Q 300 4, 400 2"
        stroke="currentColor" strokeWidth="1.0" opacity="0.25"
        fill="none"
      />
      {/* Shadow of the curl */}
      <path
        d="M 0 4 Q 100 2, 200 4 Q 300 6, 400 4"
        stroke="currentColor" strokeWidth="0.5" opacity="0.10"
        fill="none"
      />
      {/* Very faint filled area suggesting shadow beneath the curl */}
      <path
        d="M 0 2 Q 100 0, 200 2 Q 300 4, 400 2 L 400 12 L 0 12 Z"
        fill="currentColor" opacity="0.04"
      />
    </svg>
  )
}

export function SvgTelegraphDots() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      {/* 3×3 grid of small dots */}
      {[4, 10, 16, 20].flatMap(x =>
        [4, 10, 16].map(y => (
          <circle
            key={`${x}-${y}`}
            cx={x} cy={y} r="1.2"
            fill="currentColor" opacity="0.15"
          />
        ))
      )}
    </svg>
  )
}

// ── Desires SVGs (MOJO-7G) ────────────────────────────────

export function SvgStarfield({
  width = 800,
  height = 400,
  className = '',
}: {
  width?: number
  height?: number
  className?: string
}) {
  // Predetermined star positions for a natural scattered look.
  // Three types: tiny dots, small circles, large crosshair stars.
  const tinyStars: [number, number][] = [
    [42,28],[118,67],[203,15],[287,44],[356,89],[421,23],[503,56],
    [578,81],[642,19],[714,72],[771,38],[89,112],[167,98],[248,133],
    [334,107],[412,141],[487,118],[561,96],[636,127],[708,103],
    [44,168],[122,154],[199,182],[276,159],[351,194],[426,170],
    [501,147],[573,178],[648,162],[722,185],[54,220],[131,208],
    [208,234],[285,217],[360,242],[435,226],[510,210],[582,238],
    [657,222],[731,246],[762,196],[38,272],[115,258],[190,284],
    [267,269],[342,293],[417,278],[492,261],[564,288],[639,274],
    [713,298],[68,320],[145,308],[220,334],[297,319],[372,343],
    [447,328],[522,312],[594,338],[669,324],[743,348],[82,372],
    [159,358],[234,382],[311,367],[386,391],[461,376],[536,360],
    [608,386],[683,372],[757,395],
  ]

  const smallStars: [number, number][] = [
    [74,42],[198,88],[322,31],[446,74],[570,51],[694,83],[99,140],
    [223,163],[347,128],[471,152],[595,139],[719,165],[124,218],
    [248,241],[372,206],[496,230],[620,217],[744,243],[149,296],
    [273,319],[397,284],[521,308],[645,295],[769,321],[174,374],
    [298,397],[422,362],[546,386],[670,373],[794,399],
  ]

  const bigStars: [number, number][] = [
    [156,54],[436,97],[712,42],[244,195],[578,188],[86,335],[468,318],
    [736,362],[312,421],[624,408],
  ]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* Tiny dots */}
      {tinyStars.map(([x, y], i) => (
        <circle key={`t${i}`} cx={x} cy={y} r="0.8"
          fill="currentColor"
          opacity={0.04 + (i % 5) * 0.015}
        />
      ))}

      {/* Small circles */}
      {smallStars.map(([x, y], i) => (
        <circle key={`s${i}`} cx={x} cy={y} r="1.3"
          fill="currentColor"
          opacity={0.06 + (i % 4) * 0.02}
        />
      ))}

      {/* Large crosshair stars */}
      {bigStars.map(([x, y], i) => (
        <g key={`b${i}`} opacity={0.08 + (i % 3) * 0.02}>
          <circle cx={x} cy={y} r="1.8" fill="currentColor" />
          <line x1={x - 5} y1={y} x2={x + 5} y2={y}
            stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
          <line x1={x} y1={y - 5} x2={x} y2={y + 5}
            stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        </g>
      ))}
    </svg>
  )
}

export function SvgBotanicalSpray({
  width = 160,
  height = 220,
  flip = false,
  className = '',
}: {
  width?: number
  height?: number
  flip?: boolean
  className?: string
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        pointerEvents: 'none',
      }}
    >
      {/* Main stem */}
      <path d="M 20 220 C 30 180, 25 150, 40 120 C 55 90, 50 60, 65 30"
        stroke="currentColor" strokeWidth="1.0" strokeLinecap="round"
        opacity="0.18" fill="none" />

      {/* Branch left */}
      <path d="M 40 120 C 55 115, 75 120, 85 108"
        stroke="currentColor" strokeWidth="0.7" strokeLinecap="round"
        opacity="0.14" fill="none" />

      {/* Branch right */}
      <path d="M 52 90 C 65 82, 80 88, 95 80"
        stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"
        opacity="0.12" fill="none" />

      {/* Fern frond 1 — lower left */}
      {[0,1,2,3,4].map(i => {
        const t = i / 4
        const x = 20 + t * 20
        const y = 220 - t * 100
        const lx = x - 12 + i * 2
        const ly = y + 6
        const rx = x + 8
        const ry = y - 4
        return (
          <g key={`f1${i}`} opacity="0.13">
            <ellipse cx={lx} cy={ly} rx="7" ry="3"
              fill="currentColor"
              transform={`rotate(-30 ${lx} ${ly})`} />
            <ellipse cx={rx} cy={ry} rx="6" ry="2.5"
              fill="currentColor"
              transform={`rotate(20 ${rx} ${ry})`} />
          </g>
        )
      })}

      {/* Five-petal flowers */}
      {/* Flower 1 */}
      <g opacity="0.15" transform="translate(82 110)">
        {[0,72,144,216,288].map(angle => (
          <ellipse key={angle}
            cx={Math.cos(angle * Math.PI / 180) * 5}
            cy={Math.sin(angle * Math.PI / 180) * 5}
            rx="3.5" ry="2"
            fill="currentColor"
            transform={`rotate(${angle} ${Math.cos(angle * Math.PI / 180) * 5} ${Math.sin(angle * Math.PI / 180) * 5})`}
          />
        ))}
        <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.8" />
      </g>

      {/* Flower 2 — smaller */}
      <g opacity="0.12" transform="translate(92 82)">
        {[0,72,144,216,288].map(angle => (
          <ellipse key={angle}
            cx={Math.cos(angle * Math.PI / 180) * 4}
            cy={Math.sin(angle * Math.PI / 180) * 4}
            rx="2.8" ry="1.6"
            fill="currentColor"
            transform={`rotate(${angle} ${Math.cos(angle * Math.PI / 180) * 4} ${Math.sin(angle * Math.PI / 180) * 4})`}
          />
        ))}
        <circle cx="0" cy="0" r="1.5" fill="currentColor" opacity="0.8" />
      </g>

      {/* Flower 3 — top */}
      <g opacity="0.14" transform="translate(62 32)">
        {[0,72,144,216,288].map(angle => (
          <ellipse key={angle}
            cx={Math.cos(angle * Math.PI / 180) * 5}
            cy={Math.sin(angle * Math.PI / 180) * 5}
            rx="3.5" ry="2"
            fill="currentColor"
            transform={`rotate(${angle} ${Math.cos(angle * Math.PI / 180) * 5} ${Math.sin(angle * Math.PI / 180) * 5})`}
          />
        ))}
        <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.8" />
      </g>

      {/* Simple leaf shapes along branch */}
      <ellipse cx="88" cy="108" rx="9" ry="4"
        fill="currentColor" opacity="0.12"
        transform="rotate(-20 88 108)" />
      <ellipse cx="96" cy="78" rx="8" ry="3.5"
        fill="currentColor" opacity="0.11"
        transform="rotate(15 96 78)" />

      {/* Small star/dot accents scattered */}
      <circle cx="70" cy="58" r="1.5" fill="currentColor" opacity="0.10" />
      <circle cx="110" cy="95" r="1.2" fill="currentColor" opacity="0.08" />
      <circle cx="45" cy="145" r="1.8" fill="currentColor" opacity="0.10" />

      {/* Tendril curls */}
      <path d="M 62 30 C 68 22, 74 25, 71 30"
        stroke="currentColor" strokeWidth="0.5" strokeLinecap="round"
        opacity="0.12" fill="none" />
      <path d="M 88 106 C 95 100, 100 104, 97 109"
        stroke="currentColor" strokeWidth="0.4" strokeLinecap="round"
        opacity="0.10" fill="none" />
    </svg>
  )
}

export function SvgDreamHeader({
  idSuffix = 'default',
  className = '',
}: {
  idSuffix?: string
  className?: string
}) {
  const clipId = `dream-crescent-clip-${idSuffix}`
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* Crescent — left side */}
      <defs>
        <clipPath id={clipId}>
          <circle cx="22" cy="20" r="14" />
        </clipPath>
      </defs>
      <circle cx="22" cy="20" r="14" fill="currentColor" opacity="0.30" />
      <circle cx="30" cy="17" r="11" fill="#0c0c14"
        clipPath={`url(#${clipId})`} />
      <circle cx="22" cy="20" r="14" stroke="currentColor"
        strokeWidth="0.5" opacity="0.40" fill="none" />

      {/* Stars scattered around the crescent */}
      <circle cx="52" cy="8" r="1.5" fill="currentColor" opacity="0.45" />
      <circle cx="68" cy="20" r="1.0" fill="currentColor" opacity="0.35" />
      <circle cx="85" cy="10" r="1.8" fill="currentColor" opacity="0.40" />
      <circle cx="100" cy="28" r="1.0" fill="currentColor" opacity="0.30" />
      <circle cx="112" cy="12" r="1.3" fill="currentColor" opacity="0.38" />

      {/* Small crosshair on largest star */}
      <line x1="81" y1="10" x2="89" y2="10"
        stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <line x1="85" y1="6" x2="85" y2="14"
        stroke="currentColor" strokeWidth="0.5" opacity="0.25" />

      {/* Trailing dots — like the crescent's wake */}
      <circle cx="44" cy="16" r="0.8" fill="currentColor" opacity="0.25" />
      <circle cx="48" cy="24" r="0.8" fill="currentColor" opacity="0.20" />
    </svg>
  )
}

export function SvgCandleUnlit({
  size = 18,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const totalW = size * 0.55
  const waxH = size * 0.72
  const baseH = size * 0.15
  const cx = totalW / 2
  const waxW = size * 0.22

  return (
    <svg
      width={totalW}
      height={size}
      viewBox={`0 0 ${totalW} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Base */}
      <ellipse cx={cx} cy={size - baseH * 0.3} rx={totalW * 0.44} ry={baseH * 0.3}
        fill="currentColor" opacity="0.25" />
      <rect x={cx - totalW * 0.22} y={size - baseH}
        width={totalW * 0.44} height={baseH * 0.7} rx="1"
        fill="currentColor" opacity="0.20" />

      {/* Wax column */}
      <rect x={cx - waxW / 2} y={size - baseH - waxH}
        width={waxW} height={waxH} rx="1"
        fill="currentColor" opacity="0.15" />

      {/* Wax highlight */}
      <rect x={cx - waxW / 2} y={size - baseH - waxH}
        width={waxW * 0.15} height={waxH} rx="1"
        fill="white" opacity="0.05" />

      {/* Wick */}
      <line x1={cx} y1={size - baseH - waxH}
        x2={cx} y2={size - baseH - waxH - size * 0.08}
        stroke="currentColor" strokeWidth="1"
        opacity="0.50" strokeLinecap="round" />

      {/* Wick tip — slight bend suggesting previously used */}
      <path
        d={`M ${cx} ${size - baseH - waxH - size * 0.08}
            Q ${cx + 1.5} ${size - baseH - waxH - size * 0.12}
              ${cx + 1} ${size - baseH - waxH - size * 0.14}`}
        stroke="currentColor" strokeWidth="0.8"
        opacity="0.35" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function SvgCandleSnuffed({
  size = 18,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const totalW = size * 0.55
  const waxH = size * 0.72
  const baseH = size * 0.15
  const cx = totalW / 2
  const waxW = size * 0.22

  return (
    <svg
      width={totalW}
      height={size * 1.4}
      viewBox={`0 0 ${totalW} ${size * 1.4}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Offset down to leave room for smoke above */}
      <g transform={`translate(0, ${size * 0.3})`}>
        {/* Base */}
        <ellipse cx={cx} cy={size - baseH * 0.3} rx={totalW * 0.44} ry={baseH * 0.3}
          fill="currentColor" opacity="0.20" />
        <rect x={cx - totalW * 0.22} y={size - baseH}
          width={totalW * 0.44} height={baseH * 0.7} rx="1"
          fill="currentColor" opacity="0.15" />

        {/* Wax column — slightly melted look */}
        <rect x={cx - waxW / 2} y={size - baseH - waxH}
          width={waxW} height={waxH} rx="1"
          fill="currentColor" opacity="0.12" />

        {/* Wick */}
        <line x1={cx} y1={size - baseH - waxH}
          x2={cx} y2={size - baseH - waxH - size * 0.06}
          stroke="currentColor" strokeWidth="1"
          opacity="0.35" strokeLinecap="round" />

        {/* Smoke wisps — three curling paths, animated */}
        <path
          d={`M ${cx} ${size - baseH - waxH - size * 0.08}
              C ${cx + 3} ${size - baseH - waxH - size * 0.18}
                ${cx - 4} ${size - baseH - waxH - size * 0.28}
                ${cx + 2} ${size - baseH - waxH - size * 0.40}`}
          stroke="currentColor" strokeWidth="0.8"
          strokeLinecap="round" fill="none"
          opacity="0.18"
          style={{
            animationName: 'mojo-flame-smoke',
            animationDuration: '3s',
            animationTimingFunction: 'ease-out',
            animationIterationCount: 'infinite',
            transformOrigin: `${cx}px ${size - baseH - waxH - size * 0.06}px`,
          }}
        />
        <path
          d={`M ${cx} ${size - baseH - waxH - size * 0.08}
              C ${cx - 2} ${size - baseH - waxH - size * 0.20}
                ${cx + 3} ${size - baseH - waxH - size * 0.32}
                ${cx - 1} ${size - baseH - waxH - size * 0.42}`}
          stroke="currentColor" strokeWidth="0.5"
          strokeLinecap="round" fill="none"
          opacity="0.10"
          style={{
            animationName: 'mojo-flame-smoke',
            animationDuration: '3s',
            animationTimingFunction: 'ease-out',
            animationIterationCount: 'infinite',
            animationDelay: '0.8s',
            transformOrigin: `${cx}px ${size - baseH - waxH - size * 0.06}px`,
          }}
        />
      </g>
    </svg>
  )
}

export function SvgLeatherTexture({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 120"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* Leather grain — irregular horizontal lines */}
      {Array.from({ length: 28 }, (_, i) => {
        const y = 4 + i * 4.2
        const wobble = Math.sin(i * 2.1) * 3
        return (
          <path
            key={i}
            d={`M 0 ${y + wobble}
                C 120 ${y + wobble * 0.7},
                  240 ${y - wobble * 0.5},
                  400 ${y + wobble * 0.3}
                C 560 ${y - wobble * 0.6},
                  680 ${y + wobble * 0.8},
                  800 ${y + wobble * 0.2}`}
            stroke="currentColor"
            strokeWidth={i % 5 === 0 ? 0.8 : 0.4}
            opacity={i % 5 === 0 ? 0.06 : 0.03}
          />
        )
      })}

      {/* Cross-grain pebble texture — scattered short marks */}
      {[
        [80,18],[160,42],[240,8],[320,55],[400,22],[480,48],
        [560,14],[640,38],[720,60],[40,65],[120,82],[200,70],
        [280,90],[360,75],[440,88],[520,72],[600,95],[680,78],
        [100,105],[250,112],[400,108],[550,102],[700,115],
      ].map(([x, y], i) => (
        <ellipse
          key={i}
          cx={x} cy={y}
          rx={3 + (i % 3)} ry={1.2}
          fill="currentColor"
          opacity={0.03 + (i % 4) * 0.01}
          transform={`rotate(${(i * 17) % 30 - 15} ${x} ${y})`}
        />
      ))}
    </svg>
  )
}

export function SvgBookSeal({
  size = 60,
  idSuffix = 'seal',
}: { size?: number; idSuffix?: string }) {
  const r = size / 2
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      {/* Outer ring */}
      <circle cx={r} cy={r} r={r - 2}
        stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      {/* Inner ring */}
      <circle cx={r} cy={r} r={r - 8}
        stroke="currentColor" strokeWidth="0.4" opacity="0.20" />
      {/* Outer ring tick marks — 12 evenly spaced */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const isMajor = i % 3 === 0
        const r1 = r - 3
        const r2 = r - 3 - (isMajor ? 5 : 3)
        return (
          <line key={i}
            x1={r + r1 * Math.cos(angle)}
            y1={r + r1 * Math.sin(angle)}
            x2={r + r2 * Math.cos(angle)}
            y2={r + r2 * Math.sin(angle)}
            stroke="currentColor"
            strokeWidth={isMajor ? 0.8 : 0.4}
            opacity={isMajor ? 0.30 : 0.15}
          />
        )
      })}
      {/* Centre — quill/nib suggestion */}
      {/* Nib body */}
      <path
        d={`M ${r} ${r - 10} L ${r + 6} ${r + 8} L ${r} ${r + 4} L ${r - 6} ${r + 8} Z`}
        fill="currentColor" opacity="0.25"
      />
      {/* Nib slit */}
      <line x1={r} y1={r} x2={r} y2={r + 8}
        stroke="currentColor" strokeWidth="0.5" opacity="0.20" />
      {/* Small dot above — the ink drop */}
      <circle cx={r} cy={r - 12} r="1.5"
        fill="currentColor" opacity="0.20" />
    </svg>
  )
}

export function SvgSilkRibbon({
  width = 20,
  height = 800,
}: { width?: number; height?: number }) {
  const cx = width / 2
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none', display: 'block' }}
    >
      {/* Ribbon body */}
      <rect x="0" y="0" width={width} height={height - 20}
        fill="currentColor" opacity="0.08" />

      {/* Left highlight edge — the silk catching light */}
      <rect x="0" y="0" width="3" height={height - 20}
        fill="white" opacity="0.04" />

      {/* Right shadow edge */}
      <rect x={width - 2} y="0" width="2" height={height - 20}
        fill="black" opacity="0.10" />

      {/* Subtle horizontal sheen line (mid-ribbon highlight) */}
      <rect x="4" y="0" width="2" height={height - 20}
        fill="white" opacity="0.02" />

      {/* Pointed V-cut terminus at the bottom */}
      <path
        d={`M 0 ${height - 20} L ${cx} ${height} L ${width} ${height - 20} Z`}
        fill="currentColor" opacity="0.10"
      />
      {/* V-cut highlight */}
      <path
        d={`M 0 ${height - 20} L ${cx} ${height} L ${width} ${height - 20}`}
        stroke="white" strokeWidth="0.5" opacity="0.06"
        fill="none"
      />
    </svg>
  )
}

export function SvgPageCornerFold({
  size = 24,
}: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      {/* Triangle fold — the folded corner piece */}
      <path d="M 24 0 L 24 24 L 0 0 Z"
        fill="currentColor" opacity="0.12" />
      {/* Shadow line under fold */}
      <path d="M 0 0 L 24 24"
        stroke="currentColor" strokeWidth="0.5" opacity="0.20" />
      {/* Inner fold line */}
      <path d="M 8 0 L 24 16"
        stroke="currentColor" strokeWidth="0.3" opacity="0.10" />
    </svg>
  )
}

export function SvgCabinetOfCuriosities({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="100%"
      height="160"
      viewBox="0 0 900 160"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* ── PEDIMENT (top) ── */}
      {/* Triangular gable above the cabinet */}
      <path d="M 180 20 L 450 2 L 720 20"
        stroke="currentColor" strokeWidth="1.2" opacity="0.30" />
      {/* Finial at apex */}
      <circle cx="450" cy="2" r="3"
        fill="currentColor" opacity="0.25" />
      <line x1="450" y1="5" x2="450" y2="18"
        stroke="currentColor" strokeWidth="0.8" opacity="0.20" />
      {/* Pediment horizontal cornice */}
      <line x1="170" y1="26" x2="730" y2="26"
        stroke="currentColor" strokeWidth="0.8" opacity="0.22" />
      {/* Cornice shadow */}
      <line x1="170" y1="28" x2="730" y2="28"
        stroke="currentColor" strokeWidth="0.3" opacity="0.10" />

      {/* ── CABINET FRAME ── */}
      {/* Outer frame */}
      <rect x="170" y="26" width="560" height="118" rx="1"
        stroke="currentColor" strokeWidth="1.0" opacity="0.22"
        fill="none" />
      {/* Inner shadow line */}
      <rect x="174" y="30" width="552" height="110" rx="0.5"
        stroke="currentColor" strokeWidth="0.4" opacity="0.10"
        fill="none" />

      {/* ── TRIPTYCH DIVIDERS ── */}
      {/* Left pilaster (between left and centre door) */}
      <rect x="356" y="26" width="12" height="118"
        fill="currentColor" opacity="0.12" />
      {/* Pilaster capital top */}
      <rect x="352" y="26" width="20" height="5"
        fill="currentColor" opacity="0.18" />
      <rect x="352" y="139" width="20" height="5"
        fill="currentColor" opacity="0.18" />

      {/* Right pilaster (between centre and right door) */}
      <rect x="532" y="26" width="12" height="118"
        fill="currentColor" opacity="0.12" />
      <rect x="528" y="26" width="20" height="5"
        fill="currentColor" opacity="0.18" />
      <rect x="528" y="139" width="20" height="5"
        fill="currentColor" opacity="0.18" />

      {/* Outer left pilaster */}
      <rect x="170" y="26" width="8" height="118"
        fill="currentColor" opacity="0.10" />
      {/* Outer right pilaster */}
      <rect x="722" y="26" width="8" height="118"
        fill="currentColor" opacity="0.10" />

      {/* ── LEFT DOOR (arched) ── */}
      {/* Arch */}
      <path d="M 178 80 Q 178 36, 263 36 Q 348 36, 348 80"
        stroke="currentColor" strokeWidth="0.8" opacity="0.20"
        fill="none" />
      {/* Left door rectangle below arch */}
      <rect x="178" y="80" width="170" height="64"
        stroke="currentColor" strokeWidth="0.6" opacity="0.16"
        fill="none" />
      {/* Keystone */}
      <path d="M 258 36 L 263 30 L 268 36 Z"
        fill="currentColor" opacity="0.18" />

      {/* ── CENTRE DOOR (wider, arched) ── */}
      <path d="M 368 75 Q 368 30, 450 30 Q 532 30, 532 75"
        stroke="currentColor" strokeWidth="1.0" opacity="0.25"
        fill="none" />
      <rect x="368" y="75" width="164" height="69"
        stroke="currentColor" strokeWidth="0.8" opacity="0.20"
        fill="none" />
      {/* Centre keystone */}
      <path d="M 445 30 L 450 23 L 455 30 Z"
        fill="currentColor" opacity="0.22" />
      {/* Centre door muntin bars (crossbars) */}
      <line x1="368" y1="110" x2="532" y2="110"
        stroke="currentColor" strokeWidth="0.4" opacity="0.12" />
      <line x1="450" y1="75" x2="450" y2="144"
        stroke="currentColor" strokeWidth="0.4" opacity="0.12" />

      {/* ── RIGHT DOOR (arched, mirrors left) ── */}
      <path d="M 544 80 Q 544 36, 629 36 Q 714 36, 714 80"
        stroke="currentColor" strokeWidth="0.8" opacity="0.20"
        fill="none" />
      <rect x="544" y="80" width="170" height="64"
        stroke="currentColor" strokeWidth="0.6" opacity="0.16"
        fill="none" />
      <path d="M 624 36 L 629 30 L 634 36 Z"
        fill="currentColor" opacity="0.18" />

      {/* ── SPECIMENS VISIBLE INSIDE CABINET ── */}
      {/* Left door specimens */}
      {[
        [200,100,12,20],[220,85,10,15],[240,105,8,12],
        [260,90,14,18],[290,100,10,16],[310,88,8,14],
      ].map(([x,y,w,h],i) => (
        <rect key={`ls${i}`} x={x} y={y} width={w} height={h}
          fill="currentColor" opacity={0.06 + (i%3)*0.02} rx="0.5" />
      ))}
      {/* Centre door specimens */}
      {[
        [385,105,16,22],[410,88,12,18],[432,108,10,14],
        [460,92,14,20],[485,106,12,16],[508,90,10,18],
      ].map(([x,y,w,h],i) => (
        <rect key={`cs${i}`} x={x} y={y} width={w} height={h}
          fill="currentColor" opacity={0.08 + (i%3)*0.02} rx="0.5" />
      ))}
      {/* Right door specimens */}
      {[
        [558,100,12,20],[578,85,10,15],[598,105,8,12],
        [620,90,14,18],[648,100,10,16],[670,88,8,14],
      ].map(([x,y,w,h],i) => (
        <rect key={`rs${i}`} x={x} y={y} width={w} height={h}
          fill="currentColor" opacity={0.06 + (i%3)*0.02} rx="0.5" />
      ))}
      {/* Shelf lines inside doors */}
      <line x1="178" y1="118" x2="348" y2="118"
        stroke="currentColor" strokeWidth="0.5" opacity="0.10" />
      <line x1="368" y1="120" x2="532" y2="120"
        stroke="currentColor" strokeWidth="0.5" opacity="0.12" />
      <line x1="544" y1="118" x2="714" y2="118"
        stroke="currentColor" strokeWidth="0.5" opacity="0.10" />

      {/* ── CABINET BASE / LEGS ── */}
      <line x1="170" y1="144" x2="730" y2="144"
        stroke="currentColor" strokeWidth="1.0" opacity="0.20" />
      {/* Left leg */}
      <path d="M 210 144 L 200 158 L 220 158"
        stroke="currentColor" strokeWidth="0.8" opacity="0.16"
        fill="none" />
      {/* Right leg */}
      <path d="M 690 144 L 680 158 L 700 158"
        stroke="currentColor" strokeWidth="0.8" opacity="0.16"
        fill="none" />
      {/* Centre support */}
      <path d="M 445 144 L 440 155 L 450 158 L 460 155 L 455 144"
        stroke="currentColor" strokeWidth="0.6" opacity="0.12"
        fill="none" />
    </svg>
  )
}

export function SvgRotationRandom({
  size = 16,
  active = false,
}: { size?: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {/* Cube — three visible faces */}
      {/* Top face */}
      <path d="M 8 1 L 14 4 L 8 7 L 2 4 Z"
        fill="currentColor"
        opacity={active ? 0.55 : 0.28} />
      {/* Right face */}
      <path d="M 14 4 L 14 11 L 8 14 L 8 7 Z"
        fill="currentColor"
        opacity={active ? 0.35 : 0.18} />
      {/* Left face */}
      <path d="M 2 4 L 8 7 L 8 14 L 2 11 Z"
        fill="currentColor"
        opacity={active ? 0.45 : 0.22} />
      {/* Dots on top face */}
      <circle cx="6" cy="3.5" r="0.8"
        fill="currentColor" opacity={active ? 0.9 : 0.5} />
      <circle cx="10" cy="4.5" r="0.8"
        fill="currentColor" opacity={active ? 0.9 : 0.5} />
      <circle cx="8" cy="5.5" r="0.8"
        fill="currentColor" opacity={active ? 0.9 : 0.5} />
    </svg>
  )
}

export function SvgRotationWeighted({
  size = 16,
  active = false,
}: { size?: number; active?: boolean }) {
  const op = active ? 0.70 : 0.38
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {/* Central beam */}
      <line x1="2" y1="6" x2="14" y2="6"
        stroke="currentColor" strokeWidth="1.0" opacity={op} />
      {/* Central pole */}
      <line x1="8" y1="2" x2="8" y2="14"
        stroke="currentColor" strokeWidth="0.7" opacity={op * 0.7} />
      {/* Pivot */}
      <circle cx="8" cy="6" r="1.2"
        fill="currentColor" opacity={op} />
      {/* Left pan string (beam slightly tilted — left is heavier) */}
      <line x1="3" y1="6" x2="3" y2="10"
        stroke="currentColor" strokeWidth="0.6" opacity={op} />
      {/* Left pan — lower (heavier) */}
      <path d="M 1 10 Q 3 12.5 5 10"
        stroke="currentColor" strokeWidth="0.8" opacity={op}
        fill="none" />
      {/* Right pan string */}
      <line x1="13" y1="6" x2="13" y2="8"
        stroke="currentColor" strokeWidth="0.6" opacity={op} />
      {/* Right pan — higher (lighter) */}
      <path d="M 11 8 Q 13 10.5 15 8"
        stroke="currentColor" strokeWidth="0.8" opacity={op}
        fill="none" />
    </svg>
  )
}

export function SvgRotationSequential({
  size = 16,
  active = false,
}: { size?: number; active?: boolean }) {
  const op = active ? 0.75 : 0.40
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {/* Logarithmic spiral approximated with arc paths */}
      <path
        d={`M 8 8
            C 8 6, 10 5, 11 7
            C 12 9, 10 12, 7 12
            C 4 12, 2 9, 3 6
            C 4 3, 8 2, 11 4`}
        stroke="currentColor"
        strokeWidth="1.0"
        strokeLinecap="round"
        opacity={op}
        fill="none"
      />
      {/* Arrow at the end of the spiral */}
      <path d="M 11 4 L 13 3 L 12 5"
        stroke="currentColor" strokeWidth="0.8"
        strokeLinecap="round" opacity={op}
        fill="none" />
    </svg>
  )
}

export function SvgRotationNoRepeat({
  size = 16,
  active = false,
}: { size?: number; active?: boolean }) {
  const op = active ? 0.75 : 0.40
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {/* Arrow 1: top-left to bottom-right */}
      <path d="M 3 3 L 13 13"
        stroke="currentColor" strokeWidth="1.0"
        strokeLinecap="round" opacity={op} />
      {/* Arrow 1 head (bottom-right) */}
      <path d="M 13 13 L 10 12 L 12 10"
        stroke="currentColor" strokeWidth="0.8"
        strokeLinecap="round" opacity={op} fill="none" />

      {/* Arrow 2: bottom-left to top-right */}
      <path d="M 3 13 L 13 3"
        stroke="currentColor" strokeWidth="1.0"
        strokeLinecap="round" opacity={op} />
      {/* Arrow 2 head (top-right) */}
      <path d="M 13 3 L 10 4 L 12 6"
        stroke="currentColor" strokeWidth="0.8"
        strokeLinecap="round" opacity={op} fill="none" />

      {/* Small gap at crossing point */}
      <circle cx="8" cy="8" r="2"
        fill="var(--raised)" />
    </svg>
  )
}

export function SvgDarkroomHeader({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="100%"
      height="50"
      viewBox="0 0 800 50"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* ── ENLARGER (left third) ── */}
      {/* Column/stand */}
      <rect x="80" y="5" width="3" height="44"
        fill="currentColor" opacity="0.14" />
      {/* Enlarger head */}
      <rect x="60" y="5" width="44" height="16" rx="2"
        fill="currentColor" opacity="0.12" />
      {/* Lens cone below head */}
      <path d="M 68 21 L 74 34 L 90 34 L 96 21 Z"
        fill="currentColor" opacity="0.10" />
      {/* Lens circle */}
      <circle cx="82" cy="28" r="5"
        fill="currentColor" opacity="0.08" />
      {/* Base plate */}
      <rect x="50" y="46" width="64" height="3" rx="1"
        fill="currentColor" opacity="0.12" />

      {/* ── DEVELOPING TRAYS (centre) ── */}
      {/* Tray 1 */}
      <rect x="290" y="34" width="80" height="14" rx="1"
        stroke="currentColor" strokeWidth="0.8" opacity="0.14"
        fill="currentColor" fillOpacity="0.04" />
      {/* Tray 2 (behind/offset) */}
      <rect x="382" y="36" width="75" height="12" rx="1"
        stroke="currentColor" strokeWidth="0.8" opacity="0.10"
        fill="currentColor" fillOpacity="0.03" />
      {/* Tray 3 */}
      <rect x="468" y="34" width="70" height="14" rx="1"
        stroke="currentColor" strokeWidth="0.8" opacity="0.08"
        fill="none" />
      {/* Small labels on trays */}
      <rect x="295" y="38" width="14" height="2"
        fill="currentColor" opacity="0.06" />
      <rect x="387" y="40" width="12" height="2"
        fill="currentColor" opacity="0.05" />

      {/* ── HANGING PHOTOS — thin line + rectangles ── */}
      {/* The clothesline string */}
      <line x1="560" y1="10" x2="790" y2="10"
        stroke="currentColor" strokeWidth="0.6" opacity="0.16" />
      {/* Photo 1 */}
      <rect x="568" y="10" width="28" height="36" rx="0.5"
        fill="currentColor" opacity="0.08"
        stroke="currentColor" strokeWidth="0.5" />
      {/* Photo 1 white border suggestion */}
      <rect x="571" y="13" width="22" height="28"
        fill="white" opacity="0.03" />
      {/* Clothespin 1 */}
      <rect x="578" y="7" width="8" height="5" rx="1"
        fill="currentColor" opacity="0.14" />

      {/* Photo 2 */}
      <rect x="614" y="10" width="34" height="30" rx="0.5"
        fill="currentColor" opacity="0.07"
        stroke="currentColor" strokeWidth="0.5" />
      <rect x="617" y="13" width="28" height="22"
        fill="white" opacity="0.025" />
      {/* Clothespin 2 */}
      <rect x="625" y="7" width="8" height="5" rx="1"
        fill="currentColor" opacity="0.12" />

      {/* Photo 3 */}
      <rect x="660" y="10" width="26" height="38" rx="0.5"
        fill="currentColor" opacity="0.09"
        stroke="currentColor" strokeWidth="0.5" />
      <rect x="663" y="13" width="20" height="30"
        fill="white" opacity="0.03" />
      {/* Clothespin 3 */}
      <rect x="669" y="7" width="8" height="5" rx="1"
        fill="currentColor" opacity="0.13" />

      {/* Photo 4 */}
      <rect x="704" y="10" width="30" height="32" rx="0.5"
        fill="currentColor" opacity="0.07"
        stroke="currentColor" strokeWidth="0.5" />
      {/* Clothespin 4 */}
      <rect x="714" y="7" width="8" height="5" rx="1"
        fill="currentColor" opacity="0.11" />

      {/* Photo 5 — partial, near right edge */}
      <rect x="750" y="10" width="28" height="34" rx="0.5"
        fill="currentColor" opacity="0.06"
        stroke="currentColor" strokeWidth="0.5" />
      {/* Clothespin 5 */}
      <rect x="759" y="7" width="8" height="5" rx="1"
        fill="currentColor" opacity="0.10" />
    </svg>
  )
}

export function SvgFolderTab({
  size = 14,
  active = false,
}: { size?: number; active?: boolean }) {
  const h = size
  const w = size * 1.1
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none', flexShrink: 0 }}
    >
      {/* Folder tab (top-left small rectangle) */}
      <rect x="1" y="3" width="6" height="2.5" rx="0.5"
        fill="currentColor"
        opacity={active ? 0.65 : 0.35}
      />
      {/* Folder body */}
      <path d="M 1 5 L 1 13 L 15 13 L 15 5 L 7 5 L 6 3 Z"
        fill="currentColor"
        opacity={active ? 0.28 : 0.14}
        stroke="currentColor"
        strokeWidth={active ? 0.8 : 0.5}
        strokeOpacity={active ? 0.60 : 0.30}
      />
    </svg>
  )
}

export function SvgDevelopingTray({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="200"
      height="55"
      viewBox="0 0 200 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* Tray outer body — slight perspective */}
      <path d="M 10 8 L 190 8 L 182 46 L 18 46 Z"
        stroke="currentColor" strokeWidth="1.0"
        opacity="0.30" fill="currentColor" fillOpacity="0.04" />

      {/* Tray inner floor */}
      <path d="M 24 14 L 176 14 L 170 40 L 30 40 Z"
        stroke="currentColor" strokeWidth="0.5"
        opacity="0.15" fill="currentColor" fillOpacity="0.03" />

      {/* Liquid surface suggestion — horizontal ripple lines */}
      <line x1="34" y1="22" x2="166" y2="22"
        stroke="currentColor" strokeWidth="0.4" opacity="0.12" />
      <line x1="38" y1="28" x2="162" y2="28"
        stroke="currentColor" strokeWidth="0.4" opacity="0.10" />
      <line x1="42" y1="34" x2="158" y2="34"
        stroke="currentColor" strokeWidth="0.3" opacity="0.08" />

      {/* Tray handles — small rectangles at each short end */}
      <rect x="2" y="12" width="8" height="20" rx="2"
        fill="currentColor" opacity="0.18" />
      <rect x="190" y="12" width="8" height="20" rx="2"
        fill="currentColor" opacity="0.18" />

      {/* Tray top rim */}
      <path d="M 10 8 L 190 8"
        stroke="currentColor" strokeWidth="1.2" opacity="0.25" />

      {/* Corner dots — rivet suggestion */}
      <circle cx="12" cy="10" r="2"
        fill="currentColor" opacity="0.20" />
      <circle cx="188" cy="10" r="2"
        fill="currentColor" opacity="0.20" />
      <circle cx="20" cy="44" r="2"
        fill="currentColor" opacity="0.16" />
      <circle cx="180" cy="44" r="2"
        fill="currentColor" opacity="0.16" />
    </svg>
  )
}

export function SvgHangingPhotographs({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="100%"
      height="60"
      viewBox="0 0 700 60"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* Clothesline string */}
      <path d="M 0 14 Q 175 16, 350 14 Q 525 12, 700 14"
        stroke="currentColor" strokeWidth="0.8" opacity="0.22"
        fill="none" />

      {/* Photo 1 — portrait orientation */}
      <rect x="52" y="14" width="36" height="44" rx="0.5"
        fill="white" fillOpacity="0.06"
        stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      {/* Photo 1 border (inner white mat) */}
      <rect x="56" y="18" width="28" height="35"
        fill="white" fillOpacity="0.04" />
      {/* Clothespin */}
      <rect x="63" y="10" width="10" height="6" rx="1.5"
        fill="currentColor" opacity="0.30" />
      <line x1="68" y1="10" x2="68" y2="14"
        stroke="currentColor" strokeWidth="0.5" opacity="0.20" />

      {/* Photo 2 — landscape orientation */}
      <rect x="128" y="14" width="52" height="38" rx="0.5"
        fill="white" fillOpacity="0.05"
        stroke="currentColor" strokeWidth="0.7" opacity="0.22" />
      <rect x="132" y="18" width="44" height="28"
        fill="white" fillOpacity="0.03" />
      {/* Clothespin */}
      <rect x="148" y="10" width="10" height="6" rx="1.5"
        fill="currentColor" opacity="0.28" />
      <line x1="153" y1="10" x2="153" y2="14"
        stroke="currentColor" strokeWidth="0.5" opacity="0.18" />

      {/* Photo 3 — portrait, slightly tilted via transform */}
      <g transform="rotate(-2 250 36)">
        <rect x="222" y="14" width="32" height="46" rx="0.5"
          fill="white" fillOpacity="0.06"
          stroke="currentColor" strokeWidth="0.7" opacity="0.24" />
        <rect x="226" y="18" width="24" height="37"
          fill="white" fillOpacity="0.04" />
        <rect x="230" y="10" width="10" height="6" rx="1.5"
          fill="currentColor" opacity="0.28" />
      </g>

      {/* Photo 4 — square */}
      <rect x="298" y="14" width="42" height="42" rx="0.5"
        fill="white" fillOpacity="0.05"
        stroke="currentColor" strokeWidth="0.7" opacity="0.20" />
      <rect x="302" y="18" width="34" height="33"
        fill="white" fillOpacity="0.03" />
      <rect x="311" y="10" width="10" height="6" rx="1.5"
        fill="currentColor" opacity="0.26" />

      {/* Photo 5 — portrait */}
      <rect x="388" y="14" width="34" height="44" rx="0.5"
        fill="white" fillOpacity="0.05"
        stroke="currentColor" strokeWidth="0.7" opacity="0.22" />
      <rect x="392" y="18" width="26" height="35"
        fill="white" fillOpacity="0.03" />
      <rect x="397" y="10" width="10" height="6" rx="1.5"
        fill="currentColor" opacity="0.27" />
      <line x1="402" y1="10" x2="402" y2="14"
        stroke="currentColor" strokeWidth="0.5" opacity="0.17" />

      {/* Photo 6 — landscape */}
      <rect x="462" y="14" width="48" height="36" rx="0.5"
        fill="white" fillOpacity="0.04"
        stroke="currentColor" strokeWidth="0.7" opacity="0.19" />
      <rect x="466" y="18" width="40" height="27"
        fill="white" fillOpacity="0.025" />
      <rect x="479" y="10" width="10" height="6" rx="1.5"
        fill="currentColor" opacity="0.25" />

      {/* Photo 7 — portrait, partial */}
      <rect x="558" y="14" width="30" height="44" rx="0.5"
        fill="white" fillOpacity="0.05"
        stroke="currentColor" strokeWidth="0.7" opacity="0.20" />
      <rect x="561" y="18" width="23" height="35"
        fill="white" fillOpacity="0.03" />
      <rect x="564" y="10" width="10" height="6" rx="1.5"
        fill="currentColor" opacity="0.24" />

      {/* Photo 8 — smaller, far right */}
      <rect x="626" y="14" width="28" height="38" rx="0.5"
        fill="white" fillOpacity="0.04"
        stroke="currentColor" strokeWidth="0.7" opacity="0.17" />
      <rect x="630" y="10" width="10" height="6" rx="1.5"
        fill="currentColor" opacity="0.22" />
    </svg>
  )
}

export function SvgScryingBowl({
  size = 220,
  idSuffix = 'oracle',
  className = '',
}: {
  size?: number
  idSuffix?: string
  className?: string
}) {
  const r = size / 2
  const cx = r
  const cy = r

  // Ring radii — proportional to size
  const rimR    = r - 4          // outer rim
  const innerR  = r - 16         // inner rim edge
  const bowlR   = r - 26         // bowl interior boundary
  const waterR  = r - 30         // water surface

  const gradId  = `bowl-water-${idSuffix}`
  const glowId  = `bowl-glow-${idSuffix}`
  const clipId  = `bowl-clip-${idSuffix}`

  // Cardinal ornament positions
  const cardinals = [0, 90, 180, 270].map(deg => {
    const rad = (deg - 90) * Math.PI / 180
    return {
      x: cx + (rimR - 8) * Math.cos(rad),
      y: cy + (rimR - 8) * Math.sin(rad),
    }
  })

  // Intercardinal tick positions (45-degree offsets)
  const intercardinals = [45, 135, 225, 315].map(deg => {
    const rad = (deg - 90) * Math.PI / 180
    return {
      x1: cx + (rimR - 2) * Math.cos(rad),
      y1: cy + (rimR - 2) * Math.sin(rad),
      x2: cx + (rimR - 7) * Math.cos(rad),
      y2: cy + (rimR - 7) * Math.sin(rad),
    }
  })

  // Water surface highlights — faint ellipses at various angles
  const highlights = [
    { cx: cx - waterR * 0.2, cy: cy - waterR * 0.15, rx: waterR * 0.28, ry: waterR * 0.08, rot: -20, op: 0.10 },
    { cx: cx + waterR * 0.1, cy: cy + waterR * 0.12, rx: waterR * 0.20, ry: waterR * 0.06, rot: 35,  op: 0.07 },
    { cx: cx - waterR * 0.3, cy: cy + waterR * 0.25, rx: waterR * 0.15, ry: waterR * 0.05, rot: -10, op: 0.06 },
    { cx: cx + waterR * 0.25, cy: cy - waterR * 0.30, rx: waterR * 0.18, ry: waterR * 0.05, rot: 15, op: 0.05 },
  ]

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        {/* Dark water radial gradient */}
        <radialGradient id={gradId} cx="45%" cy="40%" r="65%">
          <stop offset="0%"   stopColor="#0a0a12" stopOpacity="0.98" />
          <stop offset="50%"  stopColor="#0c0c18" stopOpacity="0.95" />
          <stop offset="85%"  stopColor="#101018" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#141420" stopOpacity="0.90" />
        </radialGradient>
        {/* Outer atmospheric glow filter */}
        <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Clip path for water surface elements */}
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={waterR} />
        </clipPath>
      </defs>

      {/* ── ATMOSPHERIC HALO (outermost glow) ── */}
      <circle cx={cx} cy={cy} r={rimR + 12}
        stroke="currentColor" strokeWidth="24"
        strokeOpacity="0.04" fill="none"
        filter={`url(#${glowId})`} />
      <circle cx={cx} cy={cy} r={rimR + 6}
        stroke="currentColor" strokeWidth="12"
        strokeOpacity="0.06" fill="none" />

      {/* ── OUTER RIM ── */}
      <circle cx={cx} cy={cy} r={rimR}
        stroke="currentColor" strokeWidth="1.2"
        opacity="0.50" />

      {/* ── CARDINAL ORNAMENTS — four-pointed stars ── */}
      {cardinals.map((pos, i) => (
        <g key={i} transform={`translate(${pos.x} ${pos.y})`}>
          {/* Four-pointed star */}
          <path
            d="M 0 -4 L 0.8 -0.8 L 4 0 L 0.8 0.8 L 0 4 L -0.8 0.8 L -4 0 L -0.8 -0.8 Z"
            fill="currentColor" opacity="0.55"
          />
        </g>
      ))}

      {/* ── INTERCARDINAL TICKS ── */}
      {intercardinals.map((tick, i) => (
        <line key={i}
          x1={tick.x1} y1={tick.y1}
          x2={tick.x2} y2={tick.y2}
          stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
      ))}

      {/* ── INNER RIM RING ── */}
      <circle cx={cx} cy={cy} r={innerR}
        stroke="currentColor" strokeWidth="0.6"
        opacity="0.25" />

      {/* ── BOWL WALL RING ── */}
      <circle cx={cx} cy={cy} r={bowlR}
        stroke="currentColor" strokeWidth="0.4"
        opacity="0.15" />

      {/* ── WATER SURFACE — dark filled circle ── */}
      <circle cx={cx} cy={cy} r={waterR}
        fill={`url(#${gradId})`} />

      {/* ── WATER HIGHLIGHTS — light catching the surface ── */}
      {highlights.map((h, i) => (
        <ellipse
          key={i}
          cx={h.cx} cy={h.cy}
          rx={h.rx} ry={h.ry}
          fill="white" opacity={h.op}
          transform={`rotate(${h.rot} ${h.cx} ${h.cy})`}
          clipPath={`url(#${clipId})`}
        />
      ))}

      {/* ── THE MOON REFLECTION — single bright dot at center ── */}
      {/* Outer glow of the reflection */}
      <circle cx={cx - waterR * 0.06} cy={cy - waterR * 0.10} r={5}
        fill="white" opacity="0.06"
        clipPath={`url(#${clipId})`} />
      {/* The reflection itself */}
      <circle cx={cx - waterR * 0.06} cy={cy - waterR * 0.10} r={2}
        fill="white" opacity="0.55"
        clipPath={`url(#${clipId})`} />

      {/* ── WATER SURFACE RING (slight highlight at edge) ── */}
      <circle cx={cx} cy={cy} r={waterR}
        stroke="white" strokeWidth="0.4"
        opacity="0.08" fill="none" />

      {/* ── BOWL DEPTH SUGGESTION — concentric inner rings ── */}
      <circle cx={cx} cy={cy} r={waterR * 0.72}
        stroke="currentColor" strokeWidth="0.3"
        opacity="0.06" fill="none" />
      <circle cx={cx} cy={cy} r={waterR * 0.44}
        stroke="currentColor" strokeWidth="0.3"
        opacity="0.05" fill="none" />
      <circle cx={cx} cy={cy} r={waterR * 0.20}
        stroke="currentColor" strokeWidth="0.3"
        opacity="0.04" fill="none" />
    </svg>
  )
}

export function SvgLargeCrescent({
  size = 260,
  idSuffix = 'sanctum',
  className = '',
}: {
  size?: number
  idSuffix?: string
  className?: string
}) {
  const r = size / 2
  const cx = r
  const cy = r
  const gradId   = `crescent-grad-${idSuffix}`
  const glowId   = `crescent-glow-${idSuffix}`
  const clipId   = `crescent-clip-${idSuffix}`
  const moonR    = r - 8   // outer radius of the moon disc
  const cutR     = moonR * 0.82  // radius of the cut circle (creates crescent)
  const cutOffset = moonR * 0.38 // how far the cut circle shifts (deeper = thinner crescent)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* Crescent lit-face gradient — bright at inner edge, fading out */}
        <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#f0f0f8" stopOpacity="0.95" />
          <stop offset="45%"  stopColor="#d0d0e0" stopOpacity="0.88" />
          <stop offset="80%"  stopColor="#9898b8" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#606080" stopOpacity="0.55" />
        </radialGradient>

        {/* Glow filter — same pattern as SvgMoon and SvgScryingBowl */}
        <filter id={glowId} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="14" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Clip path — the moon disc, used to contain the crescent fill */}
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={moonR} />
        </clipPath>
      </defs>

      {/* ── ATMOSPHERIC HALOS ── */}
      {/* Outermost halo — very faint violet glow */}
      <circle
        cx={cx} cy={cy} r={r - 2}
        stroke="currentColor" strokeWidth="32"
        strokeOpacity="0.05" fill="none"
        filter={`url(#${glowId})`}
      />
      {/* Second halo */}
      <circle
        cx={cx} cy={cy} r={r - 20}
        stroke="currentColor" strokeWidth="18"
        strokeOpacity="0.08" fill="none"
      />
      {/* Inner halo — tighter glow ring */}
      <circle
        cx={cx} cy={cy} r={moonR + 8}
        stroke="currentColor" strokeWidth="8"
        strokeOpacity="0.12" fill="none"
      />

      {/* ── CRESCENT BODY ── */}
      {/* The moon disc, filled with the lit gradient */}
      <circle
        cx={cx} cy={cy} r={moonR}
        fill={`url(#${gradId})`}
      />

      {/* The dark cut — positioned to the upper-right of centre,
          this removes a circle from the moon disc leaving a crescent.
          The crescent opens to the LEFT (classic waxing crescent facing right) */}
      <circle
        cx={cx + cutOffset} cy={cy - cutOffset * 0.3}
        r={cutR}
        fill="#0c0c14"
        clipPath={`url(#${clipId})`}
      />
      {/* NOTE: #0c0c14 is the confirmed --char value (Silver & Onyx background).
          This "erases" the overlapping area, leaving only the crescent visible.
          The color must match the page background exactly. */}

      {/* ── CRESCENT SURFACE DETAILS ── */}
      {/* Subtle crater marks visible on the lit face */}
      {/* These are positioned on the crescent arc itself */}
      <circle cx={cx - moonR * 0.28} cy={cy - moonR * 0.15} r={moonR * 0.06}
        fill="#9898b8" opacity="0.10"
        clipPath={`url(#${clipId})`} />
      <circle cx={cx - moonR * 0.42} cy={cy + moonR * 0.20} r={moonR * 0.04}
        fill="#9898b8" opacity="0.08"
        clipPath={`url(#${clipId})`} />
      <circle cx={cx - moonR * 0.18} cy={cy + moonR * 0.38} r={moonR * 0.05}
        fill="#9898b8" opacity="0.07"
        clipPath={`url(#${clipId})`} />

      {/* ── CRESCENT EDGE HIGHLIGHT ── */}
      {/* A thin bright arc along the inner (lit) edge of the crescent */}
      <circle
        cx={cx} cy={cy} r={moonR * 0.97}
        stroke="white" strokeWidth="1.2"
        strokeOpacity="0.12" fill="none"
        clipPath={`url(#${clipId})`}
      />

      {/* ── SMALL STARS near the crescent ── */}
      {/* A few scattered stars in the crescent's embrace */}
      <circle cx={cx + moonR * 0.62} cy={cy - moonR * 0.55} r="2"
        fill="currentColor" opacity="0.35" />
      <circle cx={cx + moonR * 0.80} cy={cy - moonR * 0.20} r="1.2"
        fill="currentColor" opacity="0.25" />
      <circle cx={cx + moonR * 0.70} cy={cy + moonR * 0.40} r="1.5"
        fill="currentColor" opacity="0.20" />
      <circle cx={cx + moonR * 0.45} cy={cy - moonR * 0.72} r="1"
        fill="currentColor" opacity="0.28" />
      {/* Crosshair on brightest star */}
      <line x1={cx + moonR*0.60} y1={cy - moonR*0.57} x2={cx + moonR*0.64} y2={cy - moonR*0.53}
        stroke="currentColor" strokeWidth="0.5" opacity="0.20" />
      <line x1={cx + moonR*0.60} y1={cy - moonR*0.53} x2={cx + moonR*0.64} y2={cy - moonR*0.57}
        stroke="currentColor" strokeWidth="0.5" opacity="0.20" />
    </svg>
  )
}

// ── RP Detail Page SVGs (MOJO-FIX-007) ───────────────────

export function SvgCandleRealistic({
  height = 100,
  idSuffix = 'left',
  flameDelay = '0s',
}: {
  height?: number
  idSuffix?: string
  flameDelay?: string
}) {
  // Proportions derived from height
  const totalW  = height * 0.30
  const cx      = totalW / 2
  const baseH   = height * 0.13
  const waxH    = height * 0.62
  const waxW    = height * 0.16
  const flameH  = height * 0.22
  const waxTop  = height - baseH - waxH
  const gradId  = `wax-grad-${idSuffix}`
  const glowId  = `flame-glow-${idSuffix}`
  const baseGId = `base-grad-${idSuffix}`

  return (
    <svg
      width={totalW}
      height={height}
      viewBox={`0 0 ${totalW} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* Wax gradient — warm ivory at top (near flame), cooler at base */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f5f0e8" />
          <stop offset="35%"  stopColor="#ede4d0" />
          <stop offset="100%" stopColor="#e0d4b8" />
        </linearGradient>
        {/* Candleholder base gradient — dark pewter */}
        <linearGradient id={baseGId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#2a2018" />
          <stop offset="40%" stopColor="#4a3a28" />
          <stop offset="100%" stopColor="#2a2018" />
        </linearGradient>
        {/* Flame glow — warm amber light on the air */}
        <radialGradient id={glowId} cx="50%" cy="80%" r="60%">
          <stop offset="0%"   stopColor="#e8820c" stopOpacity="0.35" />
          <stop offset="60%"  stopColor="#e8820c" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#e8820c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── CANDLEHOLDER BASE ── */}
      {/* Base plate */}
      <ellipse
        cx={cx} cy={height - baseH * 0.25}
        rx={totalW * 0.46} ry={baseH * 0.28}
        fill={`url(#${baseGId})`}
      />
      {/* Base rim */}
      <rect
        x={cx - totalW * 0.40}
        y={height - baseH}
        width={totalW * 0.80}
        height={baseH * 0.75}
        rx="1.5"
        fill={`url(#${baseGId})`}
      />
      {/* Base rim highlight */}
      <rect
        x={cx - totalW * 0.40}
        y={height - baseH}
        width={totalW * 0.80}
        height="1.5"
        rx="0.5"
        fill="rgba(255,255,255,0.12)"
      />

      {/* ── WAX COLUMN ── */}
      <rect
        x={cx - waxW / 2}
        y={waxTop}
        width={waxW}
        height={waxH}
        rx="1.5"
        fill={`url(#${gradId})`}
      />
      {/* Left highlight — light catching the candle */}
      <rect
        x={cx - waxW / 2}
        y={waxTop}
        width={waxW * 0.18}
        height={waxH}
        rx="1"
        fill="rgba(255,255,255,0.22)"
      />
      {/* Right shadow — depth */}
      <rect
        x={cx + waxW / 2 - waxW * 0.12}
        y={waxTop}
        width={waxW * 0.12}
        height={waxH}
        rx="0"
        fill="rgba(0,0,0,0.10)"
      />

      {/* ── WAX DRIPS ── */}
      {/* Drip 1 — left side */}
      <path
        d={`M ${cx - waxW * 0.28} ${waxTop + waxH * 0.08}
            C ${cx - waxW * 0.52} ${waxTop + waxH * 0.22}
              ${cx - waxW * 0.48} ${waxTop + waxH * 0.38}
              ${cx - waxW * 0.44} ${waxTop + waxH * 0.48}`}
        stroke="#ddd0a8" strokeWidth={waxW * 0.22}
        strokeLinecap="round" fill="none"
      />
      {/* Drip 2 — right side, shorter */}
      <path
        d={`M ${cx + waxW * 0.20} ${waxTop + waxH * 0.05}
            C ${cx + waxW * 0.48} ${waxTop + waxH * 0.16}
              ${cx + waxW * 0.44} ${waxTop + waxH * 0.28}
              ${cx + waxW * 0.40} ${waxTop + waxH * 0.36}`}
        stroke="#ddd0a8" strokeWidth={waxW * 0.18}
        strokeLinecap="round" fill="none"
      />

      {/* ── WICK ── */}
      {/* Wick body */}
      <path
        d={`M ${cx} ${waxTop}
            Q ${cx + 1.5} ${waxTop - flameH * 0.15}
              ${cx + 1} ${waxTop - flameH * 0.22}`}
        stroke="#1a1008" strokeWidth="1.4"
        strokeLinecap="round" fill="none"
      />
      {/* Wick glow — tiny amber dot at base of flame */}
      <circle
        cx={cx + 1} cy={waxTop - flameH * 0.18}
        r="1.8"
        fill="#e8820c" opacity="0.8"
      />

      {/* ── FLAME AMBIENT GLOW ── */}
      <ellipse
        cx={cx} cy={waxTop - flameH * 0.5}
        rx={totalW * 0.8} ry={flameH * 0.9}
        fill={`url(#${glowId})`}
      />

      {/* ── OUTER FLAME — amber/orange ── */}
      <ellipse
        cx={cx} cy={waxTop - flameH * 0.52}
        rx={waxW * 0.65} ry={flameH * 0.52}
        fill="#e8820c"
        opacity="0.90"
        style={{
          transformOrigin: `${cx}px ${waxTop - flameH * 0.05}px`,
          animationName: 'mojo-flame-main',
          animationDuration: '1.8s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: flameDelay,
        }}
      />

      {/* ── MIDDLE FLAME — bright gold-orange ── */}
      <ellipse
        cx={cx} cy={waxTop - flameH * 0.46}
        rx={waxW * 0.42} ry={flameH * 0.38}
        fill="#f5a623"
        opacity="0.95"
        style={{
          transformOrigin: `${cx}px ${waxTop - flameH * 0.05}px`,
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: flameDelay,
        }}
      />

      {/* ── INNER CORE — near-white hot center ── */}
      <ellipse
        cx={cx} cy={waxTop - flameH * 0.38}
        rx={waxW * 0.20} ry={flameH * 0.22}
        fill="#fff4e0"
        opacity="0.95"
        style={{
          transformOrigin: `${cx}px ${waxTop - flameH * 0.05}px`,
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: flameDelay,
        }}
      />

      {/* ── SMOKE WISP ── */}
      <ellipse
        cx={cx} cy={waxTop - flameH * 1.08}
        rx={waxW * 0.18} ry={flameH * 0.20}
        fill="rgba(200,190,175,0.25)"
        style={{
          transformOrigin: `${cx}px ${waxTop - flameH * 0.85}px`,
          animationName: 'mojo-flame-smoke',
          animationDuration: '2.5s',
          animationTimingFunction: 'ease-out',
          animationIterationCount: 'infinite',
          animationDelay: flameDelay,
        }}
      />
    </svg>
  )
}

export function SvgParchmentEdge({
  width = 400,
}: { width?: number }) {
  // Generate a slightly irregular top edge suggesting torn paper
  // The path creates a gently undulating line across the full width
  const h = 14

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', pointerEvents: 'none' }}
    >
      {/* Main parchment fill — warm cream */}
      <path
        d={`M 0 ${h}
            L 0 5
            C 40 3, 80 6, 120 4
            C 160 2, 200 5, 240 3
            C 280 1, 320 5, 360 3
            C 380 2, 390 4, ${width} 4
            L ${width} ${h}
            Z`}
        fill="#f0e6c8"
        opacity="0.90"
      />
      {/* Slightly darker underside — the paper has thickness */}
      <path
        d={`M 0 5
            C 40 3, 80 6, 120 4
            C 160 2, 200 5, 240 3
            C 280 1, 320 5, 360 3
            C 380 2, 390 4, ${width} 4`}
        stroke="#c8b078"
        strokeWidth="0.8"
        opacity="0.60"
        fill="none"
      />
      {/* Gradient fade — parchment becoming transparent toward content */}
      <defs>
        <linearGradient id={`parch-fade-${width}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#f0e6c8" stopOpacity="0.20" />
          <stop offset="50%" stopColor="#f0e6c8" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#f0e6c8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="5" width={width} height={h - 5}
        fill={`url(#parch-fade-${width})`}
      />
      {/* Foxing/age spot — just one subtle mark */}
      <circle cx={width * 0.72} cy="7" r="2.5"
        fill="#8b6914" opacity="0.06" />
    </svg>
  )
}

export function SvgWaxSeal({
  size = 48,
  idSuffix = 'seal',
}: { size?: number; idSuffix?: string }) {
  const r = size / 2
  const cx = r
  const cy = r
  const radId   = `wax-rad-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        {/* Wax radial — darker at edges (cools first), brighter center */}
        <radialGradient id={radId} cx="42%" cy="38%" r="65%">
          <stop offset="0%"   stopColor="#c42020" />
          <stop offset="50%"  stopColor="#a01818" />
          <stop offset="100%" stopColor="#6b0f0f" />
        </radialGradient>
      </defs>

      {/* Wax blob — slightly irregular outer edge (splattered wax) */}
      <path
        d={`M ${cx} ${cy - r + 3}
            C ${cx + r * 0.6} ${cy - r + 1},
              ${cx + r - 1} ${cy - r * 0.5},
              ${cx + r - 2} ${cy + 2}
            C ${cx + r} ${cy + r * 0.6},
              ${cx + r * 0.5} ${cy + r - 2},
              ${cx + 1} ${cy + r - 2}
            C ${cx - r * 0.5} ${cy + r},
              ${cx - r + 2} ${cy + r * 0.5},
              ${cx - r + 1} ${cy - 1}
            C ${cx - r + 2} ${cy - r * 0.6},
              ${cx - r * 0.5} ${cy - r + 2},
              ${cx} ${cy - r + 3}
            Z`}
        fill={`url(#${radId})`}
      />

      {/* Surface sheen — light catching raised center */}
      <ellipse
        cx={cx - r * 0.15} cy={cy - r * 0.18}
        rx={r * 0.32} ry={r * 0.20}
        fill="rgba(255,255,255,0.10)"
        transform={`rotate(-25 ${cx - r * 0.15} ${cy - r * 0.18})`}
      />

      {/* Wax flow texture marks — subtle streaks */}
      {[30, 90, 160, 220].map((angle, i) => {
        const rad = angle * Math.PI / 180
        const x1 = cx + r * 0.15 * Math.cos(rad)
        const y1 = cy + r * 0.15 * Math.sin(rad)
        const x2 = cx + r * 0.52 * Math.cos(rad)
        const y2 = cy + r * 0.52 * Math.sin(rad)
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.5" strokeLinecap="round" />
        )
      })}

      {/* Star impression — 5 pointed, the stamp in the wax */}
      <path
        d={[
          ...Array.from({ length: 5 }, (_, i) => {
            const outerR = r * 0.48
            const innerR = r * 0.20
            const angle = (i * 72 - 90) * Math.PI / 180
            const nextAngle = (i * 72 - 90 + 36) * Math.PI / 180
            const ox = cx + outerR * Math.cos(angle)
            const oy = cy + outerR * Math.sin(angle)
            const ix = cx + innerR * Math.cos(nextAngle)
            const iy = cy + innerR * Math.sin(nextAngle)
            return `${i === 0 ? 'M' : 'L'} ${ox.toFixed(2)} ${oy.toFixed(2)} L ${ix.toFixed(2)} ${iy.toFixed(2)}`
          })
        ].join(' ') + ' Z'}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.8"
        fill="rgba(0,0,0,0.12)"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

// ── Character Dossier Page SVGs (MOJO-FIX-008) ───────────

export function SvgIvyBorder({
  width = 160,
  height = 100,
  flip = false,
}: {
  width?: number
  height?: number
  flip?: boolean
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        pointerEvents: 'none',
      }}
    >
      {/* ── MAIN VINE STEMS ── */}
      {/* Primary stem — thick, curves upward from bottom-left */}
      <path
        d="M 6 95 C 18 78, 14 58, 28 44 C 42 30, 38 14, 54 6"
        stroke="#2d5a27" strokeWidth="2.2"
        strokeLinecap="round" opacity="0.85" fill="none"
      />
      {/* Secondary branch — splits right mid-way */}
      <path
        d="M 30 46 C 48 40, 65 46, 80 38"
        stroke="#2d5a27" strokeWidth="1.4"
        strokeLinecap="round" opacity="0.75" fill="none"
      />
      {/* Tertiary tendril — upper */}
      <path
        d="M 54 6 C 70 2, 88 8, 102 4"
        stroke="#3a6e32" strokeWidth="1.0"
        strokeLinecap="round" opacity="0.65" fill="none"
      />
      {/* Fourth branch — lower right */}
      <path
        d="M 20 68 C 36 62, 52 66, 66 58"
        stroke="#3a6e32" strokeWidth="0.9"
        strokeLinecap="round" opacity="0.55" fill="none"
      />

      {/* ── LEAVES — each with highlight face ── */}
      {/* Leaf 1 — large, lower-left */}
      <ellipse cx="14" cy="72" rx="11" ry="5.5"
        fill="#2d5a27" opacity="0.80"
        transform="rotate(-35 14 72)" />
      <ellipse cx="14" cy="72" rx="11" ry="5.5"
        fill="rgba(255,255,255,0.10)"
        transform="rotate(-35 14 72) scale(0.7 0.5) translate(2 -1)" />
      {/* Leaf 1 vein */}
      <line x1="6" y1="75" x2="22" y2="69"
        stroke="#4a7a3d" strokeWidth="0.6" opacity="0.50" />

      {/* Leaf 2 — mid-stem */}
      <ellipse cx="34" cy="40" rx="10" ry="5"
        fill="#3a6e32" opacity="0.75"
        transform="rotate(22 34 40)" />
      <line x1="27" y1="43" x2="41" y2="37"
        stroke="#5a8a4a" strokeWidth="0.5" opacity="0.45" />

      {/* Leaf 3 — branch leaf */}
      <ellipse cx="62" cy="44" rx="9" ry="4.5"
        fill="#2d5a27" opacity="0.70"
        transform="rotate(-18 62 44)" />
      {/* Leaf 3 secondary veins */}
      <path d="M 55 46 C 58 44, 62 44, 68 42"
        stroke="#4a7a3d" strokeWidth="0.4" opacity="0.40" fill="none" />

      {/* Leaf 4 — upper left */}
      <ellipse cx="50" cy="8" rx="10" ry="4.8"
        fill="#3a6e32" opacity="0.72"
        transform="rotate(28 50 8)" />
      <line x1="43" y1="11" x2="57" y2="5"
        stroke="#5a8a4a" strokeWidth="0.5" opacity="0.42" />

      {/* Leaf 5 — tendril leaf */}
      <ellipse cx="96" cy="6" rx="8" ry="3.8"
        fill="#2d5a27" opacity="0.65"
        transform="rotate(-12 96 6)" />

      {/* Leaf 6 — lower branch */}
      <ellipse cx="58" cy="62" rx="9" ry="4.2"
        fill="#3a6e32" opacity="0.68"
        transform="rotate(-25 58 62)" />

      {/* Leaf 7 — small, near top */}
      <ellipse cx="78" cy="40" rx="7" ry="3.5"
        fill="#4a7a3d" opacity="0.60"
        transform="rotate(15 78 40)" />

      {/* ── WILDFLOWERS ── */}
      {/* Flower 1 — mid-right on branch */}
      <g transform="translate(76 37)">
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = deg * Math.PI / 180
          return (
            <ellipse key={i}
              cx={Math.cos(rad) * 4.5}
              cy={Math.sin(rad) * 4.5}
              rx="3" ry="1.8"
              fill="#f5f0e0" opacity="0.85"
              transform={`rotate(${deg} ${Math.cos(rad)*4.5} ${Math.sin(rad)*4.5})`}
            />
          )
        })}
        <circle cx="0" cy="0" r="2" fill="#e8c86a" opacity="0.90" />
        {/* Flower center glow */}
        <circle cx="0" cy="0" r="1" fill="#f5d87a" opacity="0.95" />
      </g>

      {/* Flower 2 — upper tendril */}
      <g transform="translate(90 5)">
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = deg * Math.PI / 180
          return (
            <ellipse key={i}
              cx={Math.cos(rad) * 3.5}
              cy={Math.sin(rad) * 3.5}
              rx="2.4" ry="1.4"
              fill="#f0ebe0" opacity="0.80"
              transform={`rotate(${deg} ${Math.cos(rad)*3.5} ${Math.sin(rad)*3.5})`}
            />
          )
        })}
        <circle cx="0" cy="0" r="1.6" fill="#e0b84a" opacity="0.88" />
      </g>

      {/* Flower 3 — lower branch, smaller */}
      <g transform="translate(62 60)">
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = deg * Math.PI / 180
          return (
            <ellipse key={i}
              cx={Math.cos(rad) * 3}
              cy={Math.sin(rad) * 3}
              rx="2" ry="1.2"
              fill="#f5f0e0" opacity="0.75"
              transform={`rotate(${deg} ${Math.cos(rad)*3} ${Math.sin(rad)*3})`}
            />
          )
        })}
        <circle cx="0" cy="0" r="1.4" fill="#e8c86a" opacity="0.88" />
      </g>

      {/* ── TENDRILS ── */}
      <path d="M 56 4 C 60 -2, 66 1, 63 6"
        stroke="#3a6e32" strokeWidth="0.6"
        strokeLinecap="round" opacity="0.55" fill="none" />
      <path d="M 80 36 C 85 30, 90 33, 87 38"
        stroke="#3a6e32" strokeWidth="0.5"
        strokeLinecap="round" opacity="0.45" fill="none" />
      <path d="M 44 14 C 48 8, 53 11, 50 16"
        stroke="#3a6e32" strokeWidth="0.5"
        strokeLinecap="round" opacity="0.45" fill="none" />

      {/* ── BERRIES / BUDS ── */}
      <circle cx="22" cy="50" r="2.2" fill="#1a3e16" opacity="0.65" />
      <circle cx="22" cy="50" r="1" fill="#2d5a27" opacity="0.80" />
      <circle cx="48" cy="22" r="1.8" fill="#1a3e16" opacity="0.55" />
      <circle cx="72" cy="52" r="1.5" fill="#1a3e16" opacity="0.50" />
    </svg>
  )
}

export function SvgDossierQuill({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="32"
      height="56"
      viewBox="0 0 32 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* ── FEATHER BODY ── */}
      {/* Main feather spine */}
      <path
        d="M 16 2 C 15 12, 14 24, 13 36 C 12.5 42, 12 48, 14 52"
        stroke="#c8c0a8" strokeWidth="1.2"
        strokeLinecap="round" fill="none"
      />

      {/* Left barbs — upper (wider, lighter) */}
      {[4, 8, 12, 16, 20, 24].map((y, i) => {
        const x = 16 - i * 0.3
        const len = 8 - i * 0.4
        return (
          <path key={`bl${i}`}
            d={`M ${x} ${y} C ${x - len*0.6} ${y + len*0.3}, ${x - len} ${y + len*0.6}, ${x - len*0.9} ${y + len*0.7}`}
            stroke="#e0d8c0" strokeWidth={1.2 - i * 0.08}
            strokeLinecap="round" opacity={0.80 - i * 0.05} fill="none"
          />
        )
      })}

      {/* Right barbs — upper */}
      {[4, 8, 12, 16, 20, 24].map((y, i) => {
        const x = 16 + i * 0.2
        const len = 6 - i * 0.3
        return (
          <path key={`br${i}`}
            d={`M ${x} ${y} C ${x + len*0.5} ${y + len*0.3}, ${x + len*0.9} ${y + len*0.6}, ${x + len*0.8} ${y + len*0.7}`}
            stroke="#d8d0b8" strokeWidth={1.0 - i * 0.06}
            strokeLinecap="round" opacity={0.70 - i * 0.04} fill="none"
          />
        )
      })}

      {/* Lower barbs — tighter, darker (toward quill) */}
      {[28, 31, 34, 37].map((y, i) => (
        <g key={`ll${i}`}>
          <path
            d={`M ${14 - i*0.2} ${y} C ${10 - i*0.2} ${y + 2}, ${8 - i*0.2} ${y + 4}, ${9} ${y + 5}`}
            stroke="#b0a890" strokeWidth="0.8"
            strokeLinecap="round" opacity="0.55" fill="none"
          />
          <path
            d={`M ${14 + i*0.1} ${y} C ${17 + i*0.1} ${y + 2}, ${19} ${y + 4}, ${18.5} ${y + 5}`}
            stroke="#b0a890" strokeWidth="0.7"
            strokeLinecap="round" opacity="0.45" fill="none"
          />
        </g>
      ))}

      {/* ── QUILL SHAFT ── */}
      {/* Transparent shaft section */}
      <path
        d="M 13.5 36 C 13 42, 13 46, 14 52"
        stroke="#8a7860" strokeWidth="1.8"
        strokeLinecap="round" fill="none" opacity="0.70"
      />

      {/* ── NIB ── */}
      <path
        d="M 14 52 C 13.5 53.5, 13 54.5, 14 56 C 15 54.5, 16 53, 15 52 Z"
        fill="#2a2018"
        opacity="0.90"
      />
      {/* Nib slit */}
      <line x1="14.5" y1="52" x2="14.5" y2="55.5"
        stroke="#1a1008" strokeWidth="0.5" opacity="0.85" />
      {/* Ink bead at nib tip */}
      <circle cx="14" cy="55.8" r="0.9"
        fill="#0a0808" opacity="0.90" />
      {/* Ink drip */}
      <path
        d="M 14 55.8 C 13.8 56.5, 14.2 57, 14 57.5"
        stroke="#0a0808" strokeWidth="0.8"
        strokeLinecap="round" opacity="0.70" fill="none"
      />
    </svg>
  )
}

export function SvgOpenBook({ width = 52, height = 36 }: {
  width?: number
  height?: number
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 52 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      {/* ── LEFT PAGE ── */}
      {/* Page fill — warm cream */}
      <path
        d="M 2 4 C 2 3, 3 2, 14 2 C 22 2, 25 3, 26 4 L 26 34 C 25 33, 22 32, 14 32 C 6 32, 2 33, 2 34 Z"
        fill="#f5f0e2"
        stroke="#c8b888" strokeWidth="0.5"
      />
      {/* Left page shadow at spine */}
      <path
        d="M 26 4 L 26 34 C 24 33, 22 32, 20 32 L 20 4 C 22 4, 24 3, 26 4 Z"
        fill="rgba(0,0,0,0.06)"
      />
      {/* Page curve — subtle */}
      <path
        d="M 2 4 C 8 3.5, 16 3, 26 4"
        stroke="#e8d8b0" strokeWidth="0.4" opacity="0.60" fill="none"
      />

      {/* Text lines on left page */}
      {[8, 12, 16, 20, 24, 28].map((y, i) => (
        <line key={i}
          x1="6" y1={y} x2={i < 4 ? 22 : 18} y2={y}
          stroke="#c8b888" strokeWidth="0.4" opacity="0.35"
        />
      ))}

      {/* ── RIGHT PAGE ── */}
      <path
        d="M 50 4 C 50 3, 49 2, 38 2 C 30 2, 27 3, 26 4 L 26 34 C 27 33, 30 32, 38 32 C 46 32, 50 33, 50 34 Z"
        fill="#f0ebe0"
        stroke="#c8b888" strokeWidth="0.5"
      />
      {/* Right page shadow at spine */}
      <path
        d="M 26 4 L 26 34 C 28 33, 30 32, 32 32 L 32 4 C 30 4, 28 3, 26 4 Z"
        fill="rgba(0,0,0,0.06)"
      />

      {/* Text lines on right page */}
      {[8, 12, 16, 20, 24, 28].map((y, i) => (
        <line key={i}
          x1="30" y1={y} x2={i < 3 ? 46 : 42} y2={y}
          stroke="#c8b888" strokeWidth="0.4" opacity="0.35"
        />
      ))}

      {/* ── SPINE ── */}
      <path
        d="M 26 3 C 26 2, 26 1, 26 0"
        stroke="#3a2a1a" strokeWidth="1.5"
        strokeLinecap="round" opacity="0.80"
      />
      <path
        d="M 26 3 L 26 35"
        stroke="#3a2a1a" strokeWidth="1.0" opacity="0.65"
      />

      {/* ── COVER BINDING (bottom) ── */}
      <path
        d="M 2 34 C 2 35, 3 36, 14 36 C 20 36, 25 35.5, 26 35 C 27 35.5, 32 36, 38 36 C 49 36, 50 35, 50 34"
        fill="#3a2a1a" stroke="#2a1a0a" strokeWidth="0.4"
      />

      {/* ── RIBBON BOOKMARK ── */}
      <path
        d="M 34 35 L 34 40 L 36 42 L 38 40 L 38 35"
        fill="#6b1515"
        stroke="#4a0f0f" strokeWidth="0.3"
      />

      {/* ── PAGE SHADOW (under left page) ── */}
      <path
        d="M 2 34 C 4 35, 14 35.5, 26 35 C 26 35.5, 14 36.5, 2 35.5 Z"
        fill="rgba(0,0,0,0.08)"
      />
    </svg>
  )
}

// ── The Chronicle SVGs (MOJO-FIX-012a) ───────────────────

export function SvgNavChronicle({ active = false }: {
  active?: boolean
}) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Left page */}
      <path
        d="M 1 2 C 1 1.5, 2 1, 6 1 L 7 1 L 7 13 C 5 13, 2 12.5, 1 12 Z"
        fill="currentColor"
        opacity={active ? 0.55 : 0.28}
        stroke="currentColor"
        strokeWidth={active ? 0.6 : 0.4}
        strokeOpacity={active ? 0.8 : 0.5}
      />
      {/* Right page */}
      <path
        d="M 13 2 C 13 1.5, 12 1, 8 1 L 7 1 L 7 13 C 9 13, 12 12.5, 13 12 Z"
        fill="currentColor"
        opacity={active ? 0.40 : 0.18}
        stroke="currentColor"
        strokeWidth={active ? 0.6 : 0.4}
        strokeOpacity={active ? 0.7 : 0.4}
      />
      {/* Spine */}
      <line x1="7" y1="1" x2="7" y2="13"
        stroke="currentColor" strokeWidth="0.8"
        opacity={active ? 0.9 : 0.5} />
      {/* Quill crossing the book */}
      <path d="M 10 1 L 4 12"
        stroke="currentColor" strokeWidth="0.8"
        strokeLinecap="round"
        opacity={active ? 0.85 : 0.45} />
      {/* Quill nib */}
      <path d="M 4 12 L 3.2 13.2 L 5 12.5 Z"
        fill="currentColor"
        opacity={active ? 0.80 : 0.40} />
      {/* Quill feather tip */}
      <path d="M 10 1 C 11 0.5, 12 0.8, 11.5 1.8"
        stroke="currentColor" strokeWidth="0.7"
        strokeLinecap="round" fill="none"
        opacity={active ? 0.65 : 0.32} />
    </svg>
  )
}

export function SvgOpenLedger({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="100%"
      height="180"
      viewBox="0 0 900 180"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="ledger-left" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#ede4cc" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#f5f0e2" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="ledger-right" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#f5f0e2" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ede4cc" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id="ledger-spine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#2a1a0a" />
          <stop offset="35%"  stopColor="#4a3020" />
          <stop offset="50%"  stopColor="#c8a840" />
          <stop offset="65%"  stopColor="#4a3020" />
          <stop offset="100%" stopColor="#2a1a0a" />
        </linearGradient>
        <linearGradient id="shadow-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a0808" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0a0808" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="shadow-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a0808" stopOpacity="0" />
          <stop offset="100%" stopColor="#0a0808" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Book shadow beneath */}
      <rect x="60" y="170" width="780" height="8" rx="2"
        fill="#0a0808" opacity="0.28" />

      {/* ── LEFT PAGE ── */}
      <path
        d="M 65 10 C 65 8, 100 5, 200 4 C 300 3, 380 4, 440 8
           L 440 170 C 380 168, 300 168, 200 168 C 100 168, 65 168, 65 166 Z"
        fill="url(#ledger-left)"
      />
      {/* Page curl top-left */}
      <path d="M 65 10 C 70 8, 80 6, 75 15"
        stroke="#c8b888" strokeWidth="0.6" opacity="0.40" fill="none" />
      {/* Red margin line */}
      <line x1="82" y1="8" x2="82" y2="168"
        stroke="#8b1a1a" strokeWidth="0.6" opacity="0.20" />
      {/* Ruled lines — left page */}
      {[28,38,48,58,68,78,88,98,110,122,134,146].map((y, i) => (
        <line key={`ll${i}`}
          x1={90} y1={y} x2={420 - (i%4)*3} y2={y}
          stroke="#2a2010" strokeWidth="0.35"
          opacity={0.09 - i*0.004}
        />
      ))}
      {/* Text entry blocks — column 1 */}
      {[30,42,54,66,78,90,102,114,126,138].map((y,i) => (
        <rect key={`lc1${i}`}
          x="90" y={y+2} width={58+(i%5)*8} height="4"
          fill="#2a2010" opacity={0.065+(i%3)*0.008} rx="0.5" />
      ))}
      {/* Text entry blocks — column 2 */}
      {[30,42,54,66,78,90,102,114,126].map((y,i) => (
        <rect key={`lc2${i}`}
          x="200" y={y+2} width={48+(i%4)*6} height="4"
          fill="#2a2010" opacity={0.055+(i%3)*0.008} rx="0.5" />
      ))}
      {/* Text entry blocks — column 3 (dates/numbers) */}
      {[30,42,54,66,78,90,102,114].map((y,i) => (
        <rect key={`lc3${i}`}
          x="330" y={y+2} width={28+(i%3)*4} height="4"
          fill="#2a2010" opacity={0.07} rx="0.5" />
      ))}
      {/* Tiny candle vignette — lower left margin */}
      <g transform="translate(88 148)" opacity="0.22">
        <rect x="0" y="5" width="5" height="12" rx="0.5" fill="#ede4cc" />
        <ellipse cx="2.5" cy="3" rx="2.5" ry="1.4" fill="#e8820c" />
        <ellipse cx="2.5" cy="3" rx="1.4" ry="0.8" fill="#fff4e0" />
        <line x1="2.5" y1="5" x2="2.5" y2="6"
          stroke="#1a1008" strokeWidth="0.8" />
      </g>
      {/* Page shadow at spine */}
      <rect x="392" y="8" width="48" height="162"
        fill="url(#shadow-l)" />

      {/* ── SPINE ── */}
      <rect x="435" y="4" width="30" height="172"
        fill="url(#ledger-spine)" />
      <line x1="435" y1="14" x2="465" y2="14"
        stroke="#c8a840" strokeWidth="1.0" opacity="0.55" />
      <line x1="435" y1="162" x2="465" y2="162"
        stroke="#c8a840" strokeWidth="1.0" opacity="0.55" />
      {/* Spine diamond ornament */}
      <path d="M 450 86 L 456 95 L 450 104 L 444 95 Z"
        fill="#c8a840" opacity="0.50" />

      {/* ── RIGHT PAGE ── */}
      <path
        d="M 835 10 C 835 8, 800 5, 700 4 C 600 3, 520 4, 460 8
           L 460 170 C 520 168, 600 168, 700 168 C 800 168, 835 168, 835 166 Z"
        fill="url(#ledger-right)"
      />
      {/* Page curl top-right */}
      <path d="M 835 10 C 830 8, 820 6, 825 15"
        stroke="#c8b888" strokeWidth="0.6" opacity="0.40" fill="none" />
      {/* Red margin line — right */}
      <line x1="818" y1="8" x2="818" y2="168"
        stroke="#8b1a1a" strokeWidth="0.6" opacity="0.20" />
      {/* Ruled lines — right page */}
      {[28,38,48,58,68,78,88,98,110,122,134,146].map((y,i) => (
        <line key={`rl${i}`}
          x1={480} y1={y} x2={812-(i%3)*4} y2={y}
          stroke="#2a2010" strokeWidth="0.35"
          opacity={0.08-i*0.003}
        />
      ))}
      {/* Text entry blocks — right page */}
      {[30,42,54,66,78,90,102,114,126,138].map((y,i) => (
        <rect key={`rc1${i}`}
          x="480" y={y+2} width={52+(i%4)*9} height="4"
          fill="#2a2010" opacity={0.06+(i%3)*0.008} rx="0.5" />
      ))}
      {[30,42,54,66,78,90,102,114,126].map((y,i) => (
        <rect key={`rc2${i}`}
          x="608" y={y+2} width={44+(i%5)*7} height="4"
          fill="#2a2010" opacity={0.055+(i%3)*0.008} rx="0.5" />
      ))}
      {[30,42,54,66,78,90,102].map((y,i) => (
        <rect key={`rc3${i}`}
          x="728" y={y+2} width={32+(i%3)*5} height="4"
          fill="#2a2010" opacity={0.065} rx="0.5" />
      ))}
      {/* Tiny quill vignette — lower right margin */}
      <g transform="translate(790 150)" opacity="0.22">
        <path d="M 12 2 C 8 4, 4 10, 3 16"
          stroke="#c8c0a8" strokeWidth="1.0"
          strokeLinecap="round" fill="none" />
        <path d="M 12 2 C 16 1, 18 4, 16 6"
          stroke="#d8d0b8" strokeWidth="0.6"
          strokeLinecap="round" fill="none" />
        <path d="M 3 16 L 2 18 L 4 17 Z"
          fill="#2a2018" opacity="0.80" />
      </g>
      {/* Page shadow at spine */}
      <rect x="460" y="8" width="48" height="162"
        fill="url(#shadow-r)" />

      {/* ── RIBBON BOOKMARK ── */}
      <path d="M 446 170 L 446 192 L 450 197 L 454 192 L 454 170"
        fill="#6b1515" stroke="#4a0f0f" strokeWidth="0.4" />

      {/* ── BOOK COVER BOTTOM EDGE ── */}
      <rect x="60" y="168" width="780" height="9" rx="1"
        fill="#3a2a1a" />
      <line x1="60" y1="168" x2="840" y2="168"
        stroke="#c8a840" strokeWidth="0.8" opacity="0.40" />
    </svg>
  )
}

export function SvgChronicleQuill({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="80"
      height="24"
      viewBox="0 0 80 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      {/* Quill spine */}
      <path d="M 4 12 C 20 10, 45 11, 68 12"
        stroke="#b0a890" strokeWidth="0.8"
        strokeLinecap="round" fill="none" opacity="0.75" />
      {/* Upper barbs */}
      {[6,14,22,30,38,46,54,62].map((x,i) => (
        <path key={`u${i}`}
          d={`M ${x} ${12-i*0.08}
              C ${x+2} ${7-i*0.1},
                ${x+5} ${5},
                ${x+4} ${8}`}
          stroke="#d8d0b8"
          strokeWidth={1.0-i*0.04}
          strokeLinecap="round" fill="none"
          opacity={0.65-i*0.03}
        />
      ))}
      {/* Lower barbs */}
      {[6,14,22,30,38,46,54,62].map((x,i) => (
        <path key={`d${i}`}
          d={`M ${x} ${12+i*0.08}
              C ${x+2} ${17+i*0.1},
                ${x+4} ${19},
                ${x+3.5} ${16.5}`}
          stroke="#c8c0a8"
          strokeWidth={0.8-i*0.03}
          strokeLinecap="round" fill="none"
          opacity={0.55-i*0.025}
        />
      ))}
      {/* Nib */}
      <path d="M 68 12 C 72 11.5, 75 11, 76 12
               C 75 13, 72 12.5, 68 12 Z"
        fill="#2a2018" opacity="0.80" />
      <line x1="68" y1="12" x2="76" y2="12"
        stroke="#1a1008" strokeWidth="0.5" opacity="0.60" />
      <circle cx="77" cy="12" r="1.2"
        fill="#0a0808" opacity="0.75" />
      {/* Feather tip */}
      <path d="M 4 12 C 1 8, 0 5, 2 3 C 4 4, 5 7, 4 12"
        fill="#f0ead8" opacity="0.68"
        stroke="#c8c0a8" strokeWidth="0.4" />
    </svg>
  )
}

// ── The Familiar (MOJO-FIX-017a) ──────────────────────────

export function SvgNavFamiliar({ active = false }: {
  active?: boolean
}) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Outer eye oval */}
      <ellipse cx="7" cy="7" rx="6" ry="4"
        stroke="currentColor"
        strokeWidth={active ? 1.0 : 0.7}
        strokeOpacity={active ? 0.90 : 0.45}
        fill="currentColor"
        fillOpacity={active ? 0.12 : 0.06}
      />
      {/* Iris */}
      <ellipse cx="7" cy="7" rx="3.5" ry="2.8"
        fill="currentColor"
        opacity={active ? 0.30 : 0.15}
      />
      {/* Slit pupil — vertical */}
      <ellipse cx="7" cy="7" rx="1.0" ry="2.4"
        fill="currentColor"
        opacity={active ? 0.80 : 0.40}
      />
      {/* Eye corners — tapered ends */}
      <path d="M 1 7 C 2 5.5, 3 5, 7 7 C 3 9, 2 8.5, 1 7 Z"
        fill="currentColor" opacity={active ? 0.15 : 0.08} />
      <path d="M 13 7 C 12 5.5, 11 5, 7 7 C 11 9, 12 8.5, 13 7 Z"
        fill="currentColor" opacity={active ? 0.15 : 0.08} />
      {/* Highlight — small white catch light */}
      <circle cx="5.5" cy="5.8" r="0.8"
        fill="currentColor" opacity={active ? 0.60 : 0.25} />
    </svg>
  )
}

export function SvgFamiliarPresence({ className = '' }: {
  className?: string
}) {
  return (
    <svg
      width="180"
      height="90"
      viewBox="0 0 180 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* Outer ambient glow */}
        <radialGradient id="fp-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="#c87800" stopOpacity="0.18" />
          <stop offset="60%"  stopColor="#c87800" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#c87800" stopOpacity="0" />
        </radialGradient>
        {/* Iris gradient — warm amber layered */}
        <radialGradient id="fp-iris" cx="40%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#f5a623" stopOpacity="0.95" />
          <stop offset="35%"  stopColor="#c87800" stopOpacity="0.90" />
          <stop offset="70%"  stopColor="#8b5000" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#4a2800" stopOpacity="0.80" />
        </radialGradient>
        {/* Pupil gradient — deep dark with slight purple depth */}
        <radialGradient id="fp-pupil" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#1a0820" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0a0510" stopOpacity="1.00" />
        </radialGradient>
        {/* Limbal ring — darker edge of iris */}
        <radialGradient id="fp-limbal" cx="50%" cy="50%" r="50%">
          <stop offset="70%"  stopColor="#3a2000" stopOpacity="0" />
          <stop offset="100%" stopColor="#1a0800" stopOpacity="0.70" />
        </radialGradient>
        {/* Sclera — the whites, slightly warm */}
        <radialGradient id="fp-sclera" cx="35%" cy="35%" r="70%">
          <stop offset="0%"   stopColor="#d4c8b0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8a7860" stopOpacity="0.15" />
        </radialGradient>
        {/* Clip for eye shape */}
        <clipPath id="fp-clip">
          <ellipse cx="90" cy="45" rx="82" ry="36" />
        </clipPath>
      </defs>

      {/* ── AMBIENT GLOW ── */}
      <ellipse cx="90" cy="45" rx="88" ry="44"
        fill="url(#fp-glow)" />

      {/* ── SCLERA (eye whites) ── */}
      <ellipse cx="90" cy="45" rx="82" ry="36"
        fill="url(#fp-sclera)"
        stroke="#6a5840" strokeWidth="0.8" strokeOpacity="0.40"
      />

      {/* ── IRIS ── */}
      <ellipse cx="90" cy="45" rx="34" ry="32"
        fill="url(#fp-iris)"
        clipPath="url(#fp-clip)"
      />
      {/* Limbal ring */}
      <ellipse cx="90" cy="45" rx="34" ry="32"
        fill="url(#fp-limbal)"
        clipPath="url(#fp-clip)"
      />
      {/* Iris texture — subtle radial lines suggesting fibers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30) * Math.PI / 180
        const x1 = 90 + 14 * Math.cos(angle)
        const y1 = 45 + 13 * Math.sin(angle)
        const x2 = 90 + 30 * Math.cos(angle)
        const y2 = 45 + 28 * Math.sin(angle)
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#e8a020" strokeWidth="0.4"
            strokeOpacity="0.18"
            clipPath="url(#fp-clip)"
          />
        )
      })}

      {/* ── PUPIL (vertical slit) ── */}
      <ellipse cx="90" cy="45" rx="7" ry="29"
        fill="url(#fp-pupil)"
        clipPath="url(#fp-clip)"
      />
      {/* Pupil taper — pointed ends */}
      <path
        d="M 90 16 C 92 22, 97 35, 97 45 C 97 55, 92 68, 90 74
           C 88 68, 83 55, 83 45 C 83 35, 88 22, 90 16 Z"
        fill="url(#fp-pupil)"
        clipPath="url(#fp-clip)"
      />

      {/* ── CATCH LIGHTS (reflections) ── */}
      {/* Primary — bright upper-left */}
      <ellipse cx="78" cy="30" rx="5" ry="3.5"
        fill="white" opacity="0.55"
        transform="rotate(-20 78 30)"
        clipPath="url(#fp-clip)"
      />
      {/* Secondary — smaller lower-right */}
      <ellipse cx="100" cy="58" rx="2.5" ry="1.8"
        fill="white" opacity="0.25"
        transform="rotate(-20 100 58)"
        clipPath="url(#fp-clip)"
      />

      {/* ── EYE OUTLINE ── */}
      {/* Outer edge — tapered at corners */}
      <path
        d="M 8 45 C 20 20, 45 10, 90 10 C 135 10, 160 20, 172 45
           C 160 70, 135 80, 90 80 C 45 80, 20 70, 8 45 Z"
        stroke="#8a7060" strokeWidth="0.8" strokeOpacity="0.55"
        fill="none"
      />
      {/* Inner lash line */}
      <path
        d="M 8 45 C 20 22, 45 12, 90 12 C 135 12, 160 22, 172 45"
        stroke="#2a1808" strokeWidth="1.2" strokeOpacity="0.45"
        fill="none"
        clipPath="url(#fp-clip)"
      />
    </svg>
  )
}

// ─── MOJO-FIX-019: Moon Phase SVGs — The Sanctum ──────────────
// Eight unique illustrated lunar phases. Dark portions are deep
// blue-purple (#0a0818), illuminated portions warm silver-white
// with catch-lights. Same quality bar as SvgLargeCrescent.

export function SvgPhaseNewMoon({
  size = 48, active = false, className = '', idSuffix = 'nm'
}: { size?: number; active?: boolean; className?: string; idSuffix?: string }) {
  const gId = `nm-glow-${idSuffix}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className} style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id={gId} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0a0818" />
          <stop offset="85%"  stopColor="#0a0818" />
          <stop offset="100%" stopColor="#1a1830" />
        </radialGradient>
      </defs>
      {/* Outer halos — very faint */}
      <circle cx="24" cy="24" r="22" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.12" fill="none" />
      <circle cx="24" cy="24" r="24" stroke="#9090b0"
        strokeWidth="0.3" opacity="0.06" fill="none" />
      {/* Dark disc */}
      <circle cx="24" cy="24" r="20" fill={`url(#${gId})`} />
      {/* Silver limb ring — barely visible */}
      <circle cx="24" cy="24" r="20" stroke="#8080a0"
        strokeWidth="0.6" opacity="0.22" fill="none" />
      {/* Two faint stars */}
      <circle cx="10" cy="12" r="0.8" fill="#c0c0d8" opacity="0.45" />
      <circle cx="38" cy="36" r="0.6" fill="#c0c0d8" opacity="0.35" />
      {/* Active glow */}
      {active && (
        <circle cx="24" cy="24" r="23" stroke="#a0a0c0"
          strokeWidth="1.5" opacity="0.35" fill="none"
          className="mojo-moon-breathe" />
      )}
    </svg>
  )
}

export function SvgPhaseWaxingCrescent({
  size = 48, active = false, className = '', idSuffix = 'wxc'
}: { size?: number; active?: boolean; className?: string; idSuffix?: string }) {
  const illumId = `wxc-illum-${idSuffix}`
  const glowId  = `wxc-glow-${idSuffix}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className} style={{ pointerEvents: 'none' }}>
      <defs>
        {/* Illuminated crescent gradient */}
        <radialGradient id={illumId} cx="75%" cy="45%" r="40%">
          <stop offset="0%"   stopColor="#e8e8f8" stopOpacity="1" />
          <stop offset="60%"  stopColor="#c8c8e0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#9898c0" stopOpacity="0.80" />
        </radialGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer halo */}
      <circle cx="24" cy="24" r="22" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.10" fill="none" />
      {/* Dark disc base */}
      <circle cx="24" cy="24" r="20" fill="#0a0818" />
      {/* Crescent: clip a circle offset left to create right crescent */}
      <clipPath id={`wxc-clip-${idSuffix}`}>
        <circle cx="24" cy="24" r="20" />
      </clipPath>
      <circle cx="31" cy="24" r="17"
        fill={`url(#${illumId})`}
        clipPath={`url(#wxc-clip-${idSuffix})`}
        filter={`url(#${glowId})`}
      />
      {/* Catch-lights on illuminated limb */}
      <circle cx="40" cy="18" r="0.9" fill="#f0f0ff" opacity="0.70"
        clipPath={`url(#wxc-clip-${idSuffix})`} />
      <circle cx="42" cy="28" r="0.6" fill="#f0f0ff" opacity="0.50"
        clipPath={`url(#wxc-clip-${idSuffix})`} />
      {/* Terminator glow */}
      <circle cx="24" cy="24" r="20" stroke="#8080b0"
        strokeWidth="0.4" opacity="0.18" fill="none" />
      {active && (
        <circle cx="24" cy="24" r="23" stroke="#b0b0d0"
          strokeWidth="1.5" opacity="0.40" fill="none"
          className="mojo-moon-breathe" />
      )}
    </svg>
  )
}

export function SvgPhaseFirstQuarter({
  size = 48, active = false, className = '', idSuffix = 'fq'
}: { size?: number; active?: boolean; className?: string; idSuffix?: string }) {
  const illumId = `fq-illum-${idSuffix}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className} style={{ pointerEvents: 'none' }}>
      <defs>
        <linearGradient id={illumId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#c8c8e0" stopOpacity="0" />
          <stop offset="15%"  stopColor="#c8c8e0" stopOpacity="0.85" />
          <stop offset="50%"  stopColor="#e0e0f0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e8e8f8" stopOpacity="1.00" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.10" fill="none" />
      {/* Dark left half */}
      <circle cx="24" cy="24" r="20" fill="#0a0818" />
      {/* Right half illuminated */}
      <clipPath id={`fq-clip-${idSuffix}`}>
        <rect x="24" y="4" width="20" height="40" />
      </clipPath>
      <circle cx="24" cy="24" r="20"
        fill={`url(#${illumId})`}
        clipPath={`url(#fq-clip-${idSuffix})`}
      />
      {/* Terminator glow */}
      <line x1="24" y1="4" x2="24" y2="44"
        stroke="#b0b0d0" strokeWidth="1.5" opacity="0.15" />
      {/* Catch-lights */}
      <circle cx="38" cy="16" r="0.9" fill="#f0f0ff" opacity="0.65"
        clipPath={`url(#fq-clip-${idSuffix})`} />
      <circle cx="40" cy="30" r="0.6" fill="#f0f0ff" opacity="0.50"
        clipPath={`url(#fq-clip-${idSuffix})`} />
      <circle cx="24" cy="24" r="20" stroke="#8080b0"
        strokeWidth="0.4" opacity="0.18" fill="none" />
      {active && (
        <circle cx="24" cy="24" r="23" stroke="#b0b0d0"
          strokeWidth="1.5" opacity="0.40" fill="none"
          className="mojo-moon-breathe" />
      )}
    </svg>
  )
}

export function SvgPhaseWaxingGibbous({
  size = 48, active = false, className = '', idSuffix = 'wxg'
}: { size?: number; active?: boolean; className?: string; idSuffix?: string }) {
  const illumId = `wxg-illum-${idSuffix}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className} style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id={illumId} cx="55%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#e8e8f8" stopOpacity="1" />
          <stop offset="70%"  stopColor="#d0d0ea" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#a0a0c8" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.12" fill="none" />
      {/* Mostly illuminated disc */}
      <circle cx="24" cy="24" r="20" fill={`url(#${illumId})`} />
      {/* Dark crescent on left: offset circle to mask */}
      <clipPath id={`wxg-clip-${idSuffix}`}>
        <circle cx="24" cy="24" r="20" />
      </clipPath>
      <circle cx="17" cy="24" r="17" fill="#0a0818"
        clipPath={`url(#wxg-clip-${idSuffix})`} />
      {/* Terminator glow */}
      <circle cx="17" cy="24" r="17" stroke="#7070a0"
        strokeWidth="1.0" opacity="0.20" fill="none"
        clipPath={`url(#wxg-clip-${idSuffix})`} />
      {/* Catch-lights */}
      <circle cx="38" cy="14" r="1.0" fill="#f0f0ff" opacity="0.65" />
      <circle cx="40" cy="32" r="0.7" fill="#f0f0ff" opacity="0.50" />
      <circle cx="24" cy="24" r="20" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.20" fill="none" />
      {active && (
        <circle cx="24" cy="24" r="23" stroke="#c0c0e0"
          strokeWidth="1.5" opacity="0.40" fill="none"
          className="mojo-moon-breathe" />
      )}
    </svg>
  )
}

export function SvgPhaseFullMoon({
  size = 48, active = false, className = '', idSuffix = 'fm'
}: { size?: number; active?: boolean; className?: string; idSuffix?: string }) {
  const surfaceId = `fm-surface-${idSuffix}`
  const glowId    = `fm-glow-${idSuffix}`
  const haloId    = `fm-halo-${idSuffix}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className} style={{ pointerEvents: 'none', overflow: 'visible' }}>
      <defs>
        {/* Surface gradient — bright center, warm edges */}
        <radialGradient id={surfaceId} cx="42%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#f0f0ff" stopOpacity="1.00" />
          <stop offset="40%"  stopColor="#e0e0f4" stopOpacity="0.98" />
          <stop offset="75%"  stopColor="#c8c8e8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#a8a8d0" stopOpacity="0.90" />
        </radialGradient>
        {/* Outer glow */}
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="60%"  stopColor="rgba(200,200,230,0)" />
          <stop offset="80%"  stopColor="rgba(200,200,230,0.12)" />
          <stop offset="100%" stopColor="rgba(200,200,230,0)" />
        </radialGradient>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Halo rings — outermost to innermost */}
      <circle cx="24" cy="24" r="26"
        fill="none" stroke="#a0a0c8" strokeWidth="0.3" opacity="0.08" />
      <circle cx="24" cy="24" r="24"
        fill="none" stroke="#b0b0d8" strokeWidth="0.4" opacity="0.12" />
      <circle cx="24" cy="24" r="22"
        fill="none" stroke="#c0c0e0" strokeWidth="0.5" opacity="0.18" />
      {/* Glow layer */}
      <circle cx="24" cy="24" r="22"
        fill={`url(#${haloId})`} />
      {/* Main disc */}
      <circle cx="24" cy="24" r="20"
        fill={`url(#${surfaceId})`}
        filter={`url(#${glowId})`} />
      {/* Limb darkening ring */}
      <circle cx="24" cy="24" r="20"
        fill="none" stroke="#8080b0" strokeWidth="0.5" opacity="0.25" />
      {/* Catch-lights */}
      <circle cx="18" cy="16" r="1.8" fill="white" opacity="0.55" />
      <circle cx="32" cy="19" r="1.0" fill="white" opacity="0.35" />
      <circle cx="15" cy="28" r="0.8" fill="white" opacity="0.25" />
      {/* Active glow — amplified for full moon */}
      {active && (
        <>
          <circle cx="24" cy="24" r="24" stroke="#d0d0f0"
            strokeWidth="2.0" opacity="0.45" fill="none"
            className="mojo-moon-breathe" />
          <circle cx="24" cy="24" r="27" stroke="#c0c0e8"
            strokeWidth="1.0" opacity="0.20" fill="none"
            className="mojo-moon-breathe" />
        </>
      )}
    </svg>
  )
}

export function SvgPhaseWaningGibbous({
  size = 48, active = false, className = '', idSuffix = 'wng'
}: { size?: number; active?: boolean; className?: string; idSuffix?: string }) {
  const illumId = `wng-illum-${idSuffix}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className} style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id={illumId} cx="45%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="#e8e8f8" stopOpacity="1" />
          <stop offset="70%"  stopColor="#d0d0ea" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#a0a0c8" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.12" fill="none" />
      <circle cx="24" cy="24" r="20" fill={`url(#${illumId})`} />
      {/* Dark crescent on right */}
      <clipPath id={`wng-clip-${idSuffix}`}>
        <circle cx="24" cy="24" r="20" />
      </clipPath>
      <circle cx="31" cy="24" r="17" fill="#0a0818"
        clipPath={`url(#wng-clip-${idSuffix})`} />
      <circle cx="31" cy="24" r="17" stroke="#7070a0"
        strokeWidth="1.0" opacity="0.20" fill="none"
        clipPath={`url(#wng-clip-${idSuffix})`} />
      {/* Catch-lights — left side this time */}
      <circle cx="10" cy="14" r="1.0" fill="#f0f0ff" opacity="0.65" />
      <circle cx="8" cy="32" r="0.7" fill="#f0f0ff" opacity="0.50" />
      <circle cx="24" cy="24" r="20" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.20" fill="none" />
      {active && (
        <circle cx="24" cy="24" r="23" stroke="#c0c0e0"
          strokeWidth="1.5" opacity="0.40" fill="none"
          className="mojo-moon-breathe" />
      )}
    </svg>
  )
}

export function SvgPhaseLastQuarter({
  size = 48, active = false, className = '', idSuffix = 'lq'
}: { size?: number; active?: boolean; className?: string; idSuffix?: string }) {
  const illumId = `lq-illum-${idSuffix}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className} style={{ pointerEvents: 'none' }}>
      <defs>
        <linearGradient id={illumId} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%"   stopColor="#c8c8e0" stopOpacity="0" />
          <stop offset="15%"  stopColor="#c8c8e0" stopOpacity="0.85" />
          <stop offset="50%"  stopColor="#e0e0f0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e8e8f8" stopOpacity="1.00" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.10" fill="none" />
      <circle cx="24" cy="24" r="20" fill="#0a0818" />
      {/* Left half illuminated */}
      <clipPath id={`lq-clip-${idSuffix}`}>
        <rect x="4" y="4" width="20" height="40" />
      </clipPath>
      <circle cx="24" cy="24" r="20"
        fill={`url(#${illumId})`}
        clipPath={`url(#lq-clip-${idSuffix})`}
      />
      <line x1="24" y1="4" x2="24" y2="44"
        stroke="#b0b0d0" strokeWidth="1.5" opacity="0.15" />
      {/* Catch-lights — left limb */}
      <circle cx="10" cy="16" r="0.9" fill="#f0f0ff" opacity="0.65"
        clipPath={`url(#lq-clip-${idSuffix})`} />
      <circle cx="8" cy="30" r="0.6" fill="#f0f0ff" opacity="0.50"
        clipPath={`url(#lq-clip-${idSuffix})`} />
      <circle cx="24" cy="24" r="20" stroke="#8080b0"
        strokeWidth="0.4" opacity="0.18" fill="none" />
      {active && (
        <circle cx="24" cy="24" r="23" stroke="#b0b0d0"
          strokeWidth="1.5" opacity="0.40" fill="none"
          className="mojo-moon-breathe" />
      )}
    </svg>
  )
}

export function SvgPhaseWaningCrescent({
  size = 48, active = false, className = '', idSuffix = 'wnc'
}: { size?: number; active?: boolean; className?: string; idSuffix?: string }) {
  const illumId = `wnc-illum-${idSuffix}`
  const glowId  = `wnc-glow-${idSuffix}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className} style={{ pointerEvents: 'none' }}>
      <defs>
        <radialGradient id={illumId} cx="25%" cy="45%" r="40%">
          <stop offset="0%"   stopColor="#e8e8f8" stopOpacity="1" />
          <stop offset="60%"  stopColor="#c8c8e0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#9898c0" stopOpacity="0.80" />
        </radialGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle cx="24" cy="24" r="22" stroke="#9090b0"
        strokeWidth="0.4" opacity="0.10" fill="none" />
      <circle cx="24" cy="24" r="20" fill="#0a0818" />
      {/* Left crescent: offset circle to the right to create left crescent */}
      <clipPath id={`wnc-clip-${idSuffix}`}>
        <circle cx="24" cy="24" r="20" />
      </clipPath>
      <circle cx="17" cy="24" r="17"
        fill={`url(#${illumId})`}
        clipPath={`url(#wnc-clip-${idSuffix})`}
        filter={`url(#${glowId})`}
      />
      {/* Catch-lights on left limb */}
      <circle cx="8" cy="18" r="0.9" fill="#f0f0ff" opacity="0.70"
        clipPath={`url(#wnc-clip-${idSuffix})`} />
      <circle cx="6" cy="28" r="0.6" fill="#f0f0ff" opacity="0.50"
        clipPath={`url(#wnc-clip-${idSuffix})`} />
      <circle cx="24" cy="24" r="20" stroke="#8080b0"
        strokeWidth="0.4" opacity="0.18" fill="none" />
      {active && (
        <circle cx="24" cy="24" r="23" stroke="#b0b0d0"
          strokeWidth="1.5" opacity="0.40" fill="none"
          className="mojo-moon-breathe" />
      )}
    </svg>
  )
}

// ─── MOJO-FIX-021: The Atelier — nav glyph + Library design options ───

export function SvgNavDesign({ active = false }: {
  active?: boolean
}) {
  const op = (v: number) => active ? Math.min(v + 0.3, 1) : v
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {/* Outer circle */}
      <circle cx="7" cy="7" r="6"
        stroke="currentColor" strokeWidth={active ? 0.8 : 0.5}
        strokeOpacity={op(0.45)} fill="none" />
      {/* Cardinal points */}
      <path d="M 7 1 L 7 13" stroke="currentColor"
        strokeWidth="0.5" strokeOpacity={op(0.30)} />
      <path d="M 1 7 L 13 7" stroke="currentColor"
        strokeWidth="0.5" strokeOpacity={op(0.30)} />
      {/* North point — larger, pointing up */}
      <path d="M 7 1.5 L 5.5 5.5 L 7 4.5 L 8.5 5.5 Z"
        fill="currentColor" opacity={op(0.70)} />
      {/* South point */}
      <path d="M 7 12.5 L 5.5 8.5 L 7 9.5 L 8.5 8.5 Z"
        fill="currentColor" opacity={op(0.35)} />
      {/* East point */}
      <path d="M 12.5 7 L 8.5 5.5 L 9.5 7 L 8.5 8.5 Z"
        fill="currentColor" opacity={op(0.35)} />
      {/* West point */}
      <path d="M 1.5 7 L 5.5 5.5 L 4.5 7 L 5.5 8.5 Z"
        fill="currentColor" opacity={op(0.35)} />
      {/* Center dot */}
      <circle cx="7" cy="7" r="1.2"
        fill="currentColor" opacity={op(0.60)} />
    </svg>
  )
}

export function SvgLibraryBookshelf({
  className = '',
  idSuffix = 'lbs',
}: {
  className?: string
  idSuffix?: string
}) {
  // ── BOOK DATA ──
  // Each book: [x, width, height, spineColor, accentColor]
  // Heights vary: 60–95px (taller books = older, more imposing)
  // Colors: deep leather tones — burgundy, forest, navy, brown, black
  const shelf1Books: Array<[number, number, number, string, string]> = [
    [8,   22, 88, '#3a1418', '#8b4020'],   // tall burgundy
    [32,  16, 72, '#1a2a1a', '#4a6a30'],   // forest green
    [50,  20, 80, '#1a1a2a', '#3a3a6a'],   // midnight navy
    [72,  14, 68, '#2a1a0a', '#6a4010'],   // old brown
    [88,  18, 85, '#2a0a0a', '#5a1818'],   // dark crimson
    [108, 12, 62, '#1a2a1a', '#3a5a28'],   // small green
    [122, 24, 90, '#1a1a1a', '#4a3a2a'],   // large black tome
    [148, 16, 70, '#3a1a0a', '#7a3818'],   // rust brown
    [166, 14, 65, '#1a1a2a', '#2a2a5a'],   // thin navy
    [182, 20, 82, '#2a1418', '#6a2830'],   // medium burgundy
    [204, 18, 75, '#1a2a1a', '#3a6a30'],   // medium green
    [224, 10, 58, '#2a2a1a', '#5a5a28'],   // thin olive
    [236, 22, 86, '#1a0a0a', '#3a1a1a'],   // black
    [260, 16, 72, '#3a200a', '#8a4a18'],   // amber brown
    [278, 18, 78, '#1a1a30', '#3a3a7a'],   // deep blue
    [298, 14, 64, '#2a1a0a', '#5a3818'],   // brown
    [314, 20, 84, '#1e0808', '#5a1a1a'],   // dark red
    [336, 12, 60, '#1a2a18', '#3a5a28'],   // small green
    [350, 24, 92, '#120808', '#401010'],   // very large black
    [376, 16, 70, '#2a1a14', '#6a3820'],   // earthy brown
    [394, 18, 76, '#1a1a2a', '#3a3a6a'],   // navy repeat
    [414, 14, 66, '#1e1408', '#4a3410'],   // old gold-brown
    [430, 22, 88, '#1a0e0e', '#4a1e1e'],   // dark maroon
    [454, 16, 72, '#0e1a0e', '#2a4a20'],   // dark forest
    [472, 20, 80, '#1a1a1a', '#3a2a1a'],   // near-black
    [494, 14, 65, '#2a1418', '#6a2830'],   // burgundy
    [510, 18, 78, '#1a2a20', '#3a5a38'],   // muted teal-green
    [530, 16, 72, '#1a1a30', '#303068'],   // deep blue
    [548, 24, 90, '#1a0808', '#4a1010'],   // large crimson
    [574, 14, 62, '#2a200a', '#5a4a18'],   // khaki-brown
  ]

  const shelf2Books: Array<[number, number, number, string, string]> = [
    [8,   20, 80, '#2a1418', '#7a3020'],
    [30,  14, 65, '#1a2a1a', '#3a5a28'],
    [46,  22, 85, '#1a1a2a', '#3a3a6a'],
    [70,  16, 70, '#2a1a0a', '#6a3810'],
    [88,  18, 78, '#1a0a0a', '#4a1818'],
    [108, 12, 60, '#1a2818', '#3a5228'],
    [122, 26, 92, '#100808', '#3a1010'],
    [150, 14, 65, '#2a1a10', '#6a3818'],
    [166, 20, 82, '#1a1a2a', '#2a2a5a'],
    [188, 16, 72, '#2a1014', '#5a2028'],
    [206, 18, 76, '#1a2a1a', '#3a6030'],
    [226, 10, 58, '#2a2a18', '#4a4a28'],
    [238, 22, 86, '#0a0a0a', '#2a1818'],
    [262, 16, 70, '#3a1e08', '#7a3c14'],
    [280, 20, 80, '#1a1828', '#303068'],
    [302, 14, 64, '#2a1808', '#523010'],
    [318, 18, 76, '#1a0808', '#4a1a1a'],
    [338, 12, 62, '#182818', '#2e4a28'],
    [352, 24, 90, '#0e0808', '#380e0e'],
    [378, 16, 70, '#281a12', '#583a1e'],
    [396, 20, 78, '#181828', '#303068'],
    [418, 14, 64, '#1c1208', '#3c2c10'],
    [434, 22, 86, '#180a0a', '#401818'],
    [458, 16, 70, '#0c180c', '#284018'],
    [476, 18, 76, '#181818', '#302818'],
    [496, 14, 63, '#281014', '#582028'],
    [512, 20, 78, '#18281e', '#305038'],
    [532, 16, 70, '#181828', '#282858'],
    [550, 24, 88, '#180808', '#400808'],
    [576, 14, 60, '#201c08', '#484010'],
  ]

  const SHELF_Y1 = 110  // top shelf bottom edge
  const SHELF_Y2 = 210  // bottom shelf bottom edge
  const SHELF_W  = 600  // shelf width
  const gId = (name: string) => `${name}-${idSuffix}`

  return (
    <svg
      width="100%" height="220"
      viewBox="0 0 600 220"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        {/* Wood shelf gradient */}
        <linearGradient id={gId('wood')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#2a1808" />
          <stop offset="40%" stopColor="#1e1008" />
          <stop offset="100%" stopColor="#140c04" />
        </linearGradient>
        {/* Cobweb gradient */}
        <radialGradient id={gId('web')} cx="0%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#b0a890" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#b0a890" stopOpacity="0" />
        </radialGradient>
        {/* Gilt lettering shimmer */}
        <linearGradient id={gId('gilt')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c8a840" stopOpacity="0.85" />
          <stop offset="50%"  stopColor="#f0d060" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#a08020" stopOpacity="0.70" />
        </linearGradient>
      </defs>

      {/* ── BACKGROUND WOOD PANEL ── */}
      <rect x="0" y="0" width="600" height="220"
        fill="#120a04" rx="2" />
      {/* Wood grain lines */}
      {[12, 28, 44, 58, 74, 88, 104, 120, 136, 152, 170, 188, 206].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="600" y2={y + (i%3)*2}
          stroke="#1c1008" strokeWidth="1.5" opacity="0.45" />
      ))}

      {/* ── SHELF 1 — BOOKS ── */}
      {shelf1Books.map(([x, w, h, color, accent], i) => {
        const bookY = SHELF_Y1 - h
        return (
          <g key={`s1-${i}`}>
            {/* Book body */}
            <rect x={x} y={bookY} width={w} height={h}
              fill={color} rx="0.5" />
            {/* Spine highlight — left edge catches light */}
            <rect x={x} y={bookY} width={2} height={h}
              fill={accent} opacity="0.55" />
            {/* Gilt title lines */}
            <rect x={x+3} y={bookY + h*0.25} width={w-6} height={1.5}
              fill={`url(#${gId('gilt')})`} opacity="0.70" />
            <rect x={x+3} y={bookY + h*0.32} width={w-6} height={1.0}
              fill={`url(#${gId('gilt')})`} opacity="0.50" />
            {/* Top edge — slightly lighter */}
            <rect x={x} y={bookY} width={w} height={3}
              fill={accent} opacity="0.30" />
            {/* Shadow beneath book */}
            <rect x={x+2} y={SHELF_Y1 - 2} width={w} height={2}
              fill="#000000" opacity="0.25" />
          </g>
        )
      })}

      {/* ── SHELF 1 — WOOD PLANK ── */}
      <rect x="0" y={SHELF_Y1} width={SHELF_W} height="10"
        fill={`url(#${gId('wood')})`} />
      <line x1="0" y1={SHELF_Y1} x2={SHELF_W} y2={SHELF_Y1}
        stroke="#4a2808" strokeWidth="1.0" opacity="0.65" />

      {/* ── SHELF 2 — BOOKS ── */}
      {shelf2Books.map(([x, w, h, color, accent], i) => {
        const bookY = SHELF_Y2 - h
        return (
          <g key={`s2-${i}`}>
            <rect x={x} y={bookY} width={w} height={h}
              fill={color} rx="0.5" />
            <rect x={x} y={bookY} width={2} height={h}
              fill={accent} opacity="0.50" />
            <rect x={x+3} y={bookY + h*0.28} width={w-6} height={1.5}
              fill={`url(#${gId('gilt')})`} opacity="0.65" />
            <rect x={x+3} y={bookY + h*0.35} width={w-6} height={1.0}
              fill={`url(#${gId('gilt')})`} opacity="0.45" />
            <rect x={x} y={bookY} width={w} height={3}
              fill={accent} opacity="0.25" />
            <rect x={x+2} y={SHELF_Y2 - 2} width={w} height={2}
              fill="#000000" opacity="0.20" />
          </g>
        )
      })}

      {/* ── SHELF 2 — WOOD PLANK ── */}
      <rect x="0" y={SHELF_Y2} width={SHELF_W} height="10"
        fill={`url(#${gId('wood')})`} />
      <line x1="0" y1={SHELF_Y2} x2={SHELF_W} y2={SHELF_Y2}
        stroke="#4a2808" strokeWidth="1.0" opacity="0.60" />

      {/* ── COBWEBS — upper corners ── */}
      {/* Left corner cobweb */}
      <g opacity="0.28">
        <path d="M 0 0 L 50 0 L 0 40 Z"
          fill={`url(#${gId('web')})`} />
        {/* Web threads */}
        {[8, 18, 28, 38, 48].map((x, i) => (
          <line key={i} x1="0" y1={i*8} x2={x} y2="0"
            stroke="#b0a890" strokeWidth="0.5" opacity="0.40" />
        ))}
        {[6, 14, 22, 30].map((y, i) => (
          <path key={i}
            d={`M 0 ${y} C ${y*0.4} ${y-2}, ${y*0.8} ${y*0.4}, ${y} 0`}
            stroke="#b0a890" strokeWidth="0.4" fill="none" opacity="0.30" />
        ))}
      </g>
      {/* Right corner cobweb */}
      <g opacity="0.22" transform="translate(600 0) scale(-1 1)">
        <path d="M 0 0 L 40 0 L 0 30 Z"
          fill={`url(#${gId('web')})`} />
        {[6, 14, 22, 32, 40].map((x, i) => (
          <line key={i} x1="0" y1={i*6} x2={x} y2="0"
            stroke="#b0a890" strokeWidth="0.5" opacity="0.35" />
        ))}
      </g>

      {/* ── BOTTOM EDGE — shelf base ── */}
      <rect x="0" y="210" width="600" height="10"
        fill="#0e0804" opacity="0.80" />
    </svg>
  )
}

export function SvgLibraryStudy({
  className = '',
  idSuffix = 'lss',
}: {
  className?: string
  idSuffix?: string
}) {
  const gId = (name: string) => `${name}-${idSuffix}`

  return (
    <svg
      width="100%" height="260"
      viewBox="0 0 800 260"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* Stone gradient — aged grey with warm undertone */}
        <linearGradient id={gId('stone')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#2a2824" />
          <stop offset="50%" stopColor="#1e1c18" />
          <stop offset="100%" stopColor="#141210" />
        </linearGradient>
        {/* Firelight glow — warm amber from hearth */}
        <radialGradient id={gId('fire-glow')} cx="50%" cy="85%" r="55%">
          <stop offset="0%"   stopColor="#c84800" stopOpacity="0.65" />
          <stop offset="30%"  stopColor="#c87800" stopOpacity="0.35" />
          <stop offset="60%"  stopColor="#c86000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#c84000" stopOpacity="0" />
        </radialGradient>
        {/* Outer room glow */}
        <radialGradient id={gId('room-glow')} cx="50%" cy="70%" r="60%">
          <stop offset="0%"   stopColor="#b86000" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#b86000" stopOpacity="0" />
        </radialGradient>
        {/* Fire gradient */}
        <radialGradient id={gId('flames')} cx="50%" cy="90%" r="55%">
          <stop offset="0%"   stopColor="#fff0a0" stopOpacity="1" />
          <stop offset="25%"  stopColor="#f0a020" stopOpacity="0.95" />
          <stop offset="55%"  stopColor="#c05010" stopOpacity="0.85" />
          <stop offset="80%"  stopColor="#801000" stopOpacity="0.60" />
          <stop offset="100%" stopColor="#400000" stopOpacity="0" />
        </radialGradient>
        {/* Ember gradient */}
        <radialGradient id={gId('embers')} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ff8000" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#c04000" stopOpacity="0.20" />
        </radialGradient>
        {/* Gilt gradient for book spines */}
        <linearGradient id={gId('gilt')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#c8a840" stopOpacity="0.80" />
          <stop offset="50%"  stopColor="#f0d060" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#a08020" stopOpacity="0.65" />
        </linearGradient>
        {/* Flame glow filter */}
        <filter id={gId('flame-filter')}
          x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Candle glow filter */}
        <filter id={gId('candle-glow')}
          x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── BACKGROUND — dark study wall ── */}
      <rect x="0" y="0" width="800" height="260" fill="#0a0806" />
      {/* Stone wall texture — faint horizontal blocks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240].map((y, i) => (
        <rect key={i} x="0" y={y} width="800" height="28"
          fill={i%2===0 ? '#0e0c0a' : '#0c0a08'} />
      ))}
      {/* Mortar lines */}
      {[29, 59, 89, 119, 149, 179, 209].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="800" y2={y}
          stroke="#181410" strokeWidth="1.5" opacity="0.60" />
      ))}

      {/* ── ROOM GLOW (from fire) ── */}
      <rect x="0" y="0" width="800" height="260"
        fill={`url(#${gId('room-glow')})`} />

      {/* ── FIREPLACE STRUCTURE ── */}
      {/* Outer mantle — wide stone surround */}
      <path d="M 220 0 L 220 200 L 580 200 L 580 0"
        stroke="#2a2824" strokeWidth="2" fill="none" opacity="0.50" />

      {/* Mantle legs — stone pillars */}
      {/* Left pillar */}
      <rect x="220" y="60" width="50" height="160"
        fill={`url(#${gId('stone')})`} />
      <line x1="220" y1="60" x2="220" y2="220"
        stroke="#3a3830" strokeWidth="1.5" opacity="0.70" />
      <line x1="270" y1="60" x2="270" y2="220"
        stroke="#141210" strokeWidth="1.0" opacity="0.55" />
      {/* Stone block details on left pillar */}
      {[80, 110, 140, 170, 200].map((y, i) => (
        <line key={i} x1="222" y1={y} x2="268" y2={y}
          stroke="#181614" strokeWidth="1.0" opacity="0.50" />
      ))}

      {/* Right pillar */}
      <rect x="530" y="60" width="50" height="160"
        fill={`url(#${gId('stone')})`} />
      <line x1="580" y1="60" x2="580" y2="220"
        stroke="#3a3830" strokeWidth="1.5" opacity="0.70" />
      <line x1="530" y1="60" x2="530" y2="220"
        stroke="#141210" strokeWidth="1.0" opacity="0.55" />
      {[80, 110, 140, 170, 200].map((y, i) => (
        <line key={i} x1="532" y1={y} x2="578" y2={y}
          stroke="#181614" strokeWidth="1.0" opacity="0.50" />
      ))}

      {/* Mantle top — thick stone lintel */}
      <rect x="200" y="50" width="400" height="30"
        fill={`url(#${gId('stone')})`} />
      <line x1="200" y1="50" x2="600" y2="50"
        stroke="#3a3830" strokeWidth="2.0" opacity="0.75" />
      <line x1="200" y1="80" x2="600" y2="80"
        stroke="#141210" strokeWidth="1.5" opacity="0.65" />
      {/* Carved lintel detail — horizontal grooves */}
      <line x1="210" y1="58" x2="590" y2="58"
        stroke="#141210" strokeWidth="0.8" opacity="0.40" />
      <line x1="210" y1="65" x2="590" y2="65"
        stroke="#141210" strokeWidth="0.8" opacity="0.35" />
      <line x1="210" y1="72" x2="590" y2="72"
        stroke="#141210" strokeWidth="0.8" opacity="0.35" />

      {/* ── FIREBOX / HEARTH INTERIOR ── */}
      <rect x="270" y="80" width="260" height="140"
        fill="#0a0604" />
      {/* Firebox walls — sooty brick */}
      <rect x="270" y="80" width="10" height="140"
        fill="#141008" opacity="0.80" />
      <rect x="520" y="80" width="10" height="140"
        fill="#141008" opacity="0.80" />
      {/* Firebox arch — top */}
      <path d="M 270 100 C 270 80, 290 72, 400 70 C 510 72, 530 80, 530 100"
        fill="#0a0604" stroke="#141008" strokeWidth="1.5" />

      {/* ── LOG BASE ── */}
      {/* Log 1 */}
      <ellipse cx="350" cy="216" rx="55" ry="8"
        fill="#1a1008" stroke="#2a1808" strokeWidth="1" />
      <rect x="295" y="208" width="110" height="8"
        fill="#1a1008" />
      {/* Log 2 */}
      <ellipse cx="420" cy="212" rx="50" ry="7"
        fill="#161008" stroke="#261808" strokeWidth="1" />
      <rect x="370" y="205" width="100" height="7"
        fill="#161008" />
      {/* Log end rings */}
      <circle cx="295" cy="212" r="8" fill="#201408"
        stroke="#2a1808" strokeWidth="0.8" />
      <circle cx="295" cy="212" r="4" fill="#1a1008" opacity="0.80" />

      {/* ── FIRE — layered flames ── */}
      {/* Deep ember base */}
      <ellipse cx="400" cy="215" rx="90" ry="12"
        fill={`url(#${gId('embers')})`} opacity="0.80" />
      {/* Large outer flame */}
      <ellipse cx="395" cy="175" rx="85" ry="55"
        fill={`url(#${gId('flames')})`}
        filter={`url(#${gId('flame-filter')})`}
        opacity="0.90"
        style={{
          animationName: 'mojo-flame-main',
          animationDuration: '1.8s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      />
      {/* Center bright flame */}
      <ellipse cx="400" cy="185" rx="50" ry="40"
        fill={`url(#${gId('flames')})`}
        opacity="0.95"
        style={{
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      />
      {/* Inner white-hot core */}
      <ellipse cx="400" cy="200" rx="25" ry="18"
        fill="#fff8e0" opacity="0.70"
        style={{
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      />
      {/* Flame tips — narrow upward tongues */}
      <path d="M 360 170 C 358 140, 362 120, 370 105 C 372 125, 368 148, 372 165"
        fill="#f0a020" opacity="0.65"
        style={{
          animationName: 'mojo-flame-main',
          animationDuration: '1.8s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      />
      <path d="M 400 160 C 398 125, 402 105, 410 90 C 415 110, 410 135, 412 158"
        fill="#fff0a0" opacity="0.75"
        style={{
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      />
      <path d="M 430 168 C 428 140, 435 122, 440 110 C 443 130, 438 150, 442 165"
        fill="#f0a020" opacity="0.60"
        style={{
          animationName: 'mojo-flame-main',
          animationDuration: '1.8s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      />

      {/* ── FIRE GLOW OVERLAY ── */}
      <rect x="0" y="0" width="800" height="260"
        fill={`url(#${gId('fire-glow')})`} />

      {/* ── HEARTH FLOOR ── */}
      <rect x="240" y="220" width="320" height="20"
        fill="#1a1610" />
      <line x1="240" y1="220" x2="560" y2="220"
        stroke="#2a2018" strokeWidth="1.5" opacity="0.70" />
      {/* Hearth stone blocks */}
      {[240, 320, 400, 480].map((x, i) => (
        <line key={i} x1={x} y1="220" x2={x} y2="240"
          stroke="#0e0c08" strokeWidth="1.5" opacity="0.55" />
      ))}

      {/* ── BOOKS — stacked on floor left ── */}
      <g transform="translate(80 180)">
        {/* Stack of 4 books lying flat */}
        <rect x="0" y="0"  width="80" height="14" rx="1" fill="#2a1418" />
        <rect x="0" y="14" width="75" height="13" rx="1" fill="#1a2a1a" />
        <rect x="0" y="27" width="82" height="15" rx="1" fill="#1a1a2a" />
        <rect x="0" y="42" width="78" height="13" rx="1" fill="#2a1a0a" />
        {/* Gilt lines on spines */}
        <line x1="2" y1="7" x2="78" y2="7"
          stroke="#c8a840" strokeWidth="0.8" opacity="0.60" />
        <line x1="2" y1="20" x2="73" y2="20"
          stroke="#c8a840" strokeWidth="0.8" opacity="0.55" />
        <line x1="2" y1="34" x2="80" y2="34"
          stroke="#c8a840" strokeWidth="0.7" opacity="0.50" />
        {/* Leaning book */}
        <rect x="-12" y="-45" width="12" height="52" rx="1"
          fill="#1e0808"
          transform="rotate(-8 -12 -45)"
        />
      </g>

      {/* ── BOOKS — stacked on floor right ── */}
      <g transform="translate(620 185)">
        <rect x="0" y="0"  width="70" height="12" rx="1" fill="#1a2a1a" />
        <rect x="0" y="12" width="75" height="14" rx="1" fill="#2a1418" />
        <rect x="0" y="26" width="68" height="12" rx="1" fill="#1a1a2a" />
        <line x1="2" y1="6" x2="68" y2="6"
          stroke="#c8a840" strokeWidth="0.7" opacity="0.55" />
        <line x1="2" y1="19" x2="73" y2="19"
          stroke="#c8a840" strokeWidth="0.7" opacity="0.50" />
      </g>

      {/* ── BOOKS ON MANTLE ── */}
      {/* Left mantle: small stack */}
      <g transform="translate(215 28)">
        <rect x="0" y="0" width="30" height="22" rx="0.5" fill="#1a1a2a" />
        <rect x="32" y="3" width="25" height="19" rx="0.5" fill="#2a1418" />
        {/* Open book lying flat */}
        <rect x="60" y="8" width="40" height="14" rx="1" fill="#d8c8a0" />
        <line x1="80" y1="8" x2="80" y2="22"
          stroke="#8a7840" strokeWidth="0.8" opacity="0.60" />
      </g>
      {/* Right mantle: one tall book */}
      <g transform="translate(545 22)">
        <rect x="0" y="0" width="18" height="28" rx="0.5" fill="#1e2a1e" />
        <rect x="2" y="8" width="14" height="1.5"
          fill="#c8a840" opacity="0.70" />
      </g>

      {/* ── SMALL CANDLES ON MANTLE ── */}
      {/* Left mantle candle */}
      <g transform="translate(310 12)">
        <ellipse cx="5" cy="3" rx="6" ry="8"
          fill="#f0a020" opacity="0.70"
          filter={`url(#${gId('candle-glow')})`}
          style={{
            animationName: 'mojo-flame-main',
            animationDuration: '1.8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0s',
          }}
        />
        <ellipse cx="5" cy="4" rx="3" ry="5"
          fill="#fff4c0" opacity="0.85"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0s',
          }}
        />
        <rect x="2" y="10" width="6" height="18" rx="0.5" fill="#ede0c4" />
        <rect x="1" y="28" width="8" height="3" rx="0.5" fill="#b88820" />
      </g>
      {/* Right mantle candle */}
      <g transform="translate(478 12)">
        <ellipse cx="5" cy="3" rx="6" ry="8"
          fill="#f0a020" opacity="0.65"
          filter={`url(#${gId('candle-glow')})`}
          style={{
            animationName: 'mojo-flame-main',
            animationDuration: '1.8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0.4s',
          }}
        />
        <ellipse cx="5" cy="4" rx="3" ry="5"
          fill="#fff4c0" opacity="0.80"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0.4s',
          }}
        />
        <rect x="2" y="10" width="6" height="20" rx="0.5" fill="#ede0c4" />
        <rect x="1" y="30" width="8" height="3" rx="0.5" fill="#b88820" />
      </g>

      {/* ── IVY — climbing left pillar ── */}
      {/* Main vine up the left stone pillar */}
      <path
        d="M 220 260 C 225 230, 218 200, 222 170
           C 226 140, 220 110, 225 80 C 228 60, 222 40, 225 15"
        stroke="#2a4a1a" strokeWidth="2.0"
        strokeLinecap="round" fill="none" opacity="0.80"
      />
      {/* Ivy leaves on left pillar */}
      {[
        [228, 240, -15], [218, 215, 20], [225, 188, -10],
        [220, 162, 18], [228, 135, -12], [222, 108, 15],
        [226, 82, -8], [220, 55, 20],
      ].map(([x, y, rot], i) => (
        <ellipse key={i}
          cx={x} cy={y}
          rx={9 + (i%3)*2} ry={5.5 + (i%2)*1.5}
          fill="#2a5a18"
          transform={`rotate(${rot} ${x} ${y})`}
          opacity={0.70 - i*0.03}
        />
      ))}
      {/* A few leaves reaching across the mantle */}
      <path d="M 225 80 C 240 72, 260 68, 275 72"
        stroke="#2a4a1a" strokeWidth="1.5" fill="none" opacity="0.55" />
      <ellipse cx="262" cy="68" rx="8" ry="4.5"
        fill="#2a5818" transform="rotate(-15 262 68)" opacity="0.55" />
      {/* Small white flowers */}
      <circle cx="223" cy="170" r="2.5" fill="#f0ece0" opacity="0.50" />
      <circle cx="223" cy="170" r="1.0" fill="#e8c840" opacity="0.65" />
      <circle cx="226" cy="110" r="2.0" fill="#f0ece0" opacity="0.45" />
    </svg>
  )
}

// ─── MOJO-FIX-022: The Library — candelabra + ivy columns ───

export function SvgCandelabra({
  height = 200,
  idSuffix = 'cdlb',
  flameDelay = '0s',
}: {
  height?: number
  idSuffix?: string
  flameDelay?: string
}) {
  const gId = (name: string) => `${name}-${idSuffix}`
  // Scale factor — all coordinates are in 70×200 space
  const sx = height / 200

  return (
    <svg
      width={Math.round(70 * sx)}
      height={height}
      viewBox="0 0 70 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* Iron gradient — dark with warm highlight */}
        <linearGradient id={gId('iron')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1a1408" />
          <stop offset="40%"  stopColor="#2a2010" />
          <stop offset="60%"  stopColor="#3a2c18" />
          <stop offset="100%" stopColor="#1a1408" />
        </linearGradient>
        {/* Candle wax gradient */}
        <linearGradient id={gId('wax')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f0e8d0" />
          <stop offset="100%" stopColor="#d8c8a8" />
        </linearGradient>
        {/* Flame gradients — three flames, slight color variations */}
        <radialGradient id={gId('flame-c')} cx="50%" cy="80%" r="55%">
          <stop offset="0%"   stopColor="#fff8e0" stopOpacity="1" />
          <stop offset="35%"  stopColor="#f0a020" stopOpacity="0.95" />
          <stop offset="75%"  stopColor="#c06010" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#800800" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={gId('flame-l')} cx="50%" cy="80%" r="55%">
          <stop offset="0%"   stopColor="#fff4d0" stopOpacity="1" />
          <stop offset="35%"  stopColor="#e89818" stopOpacity="0.90" />
          <stop offset="75%"  stopColor="#b05808" stopOpacity="0.70" />
          <stop offset="100%" stopColor="#700800" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={gId('flame-r')} cx="50%" cy="80%" r="55%">
          <stop offset="0%"   stopColor="#fff4c8" stopOpacity="1" />
          <stop offset="35%"  stopColor="#e8a020" stopOpacity="0.92" />
          <stop offset="75%"  stopColor="#b86010" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#780800" stopOpacity="0" />
        </radialGradient>
        {/* Glow filter for flames */}
        <filter id={gId('flame-glow')}
          x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {/* Drip path clip — keep drips within candle body */}
        <clipPath id={gId('drip-c')}>
          <rect x="32" y="60" width="6" height="70" />
        </clipPath>
        <clipPath id={gId('drip-l')}>
          <rect x="8" y="75" width="6" height="60" />
        </clipPath>
        <clipPath id={gId('drip-r')}>
          <rect x="56" y="75" width="6" height="60" />
        </clipPath>
      </defs>

      {/* ═══════════════════════════════
          IRON STRUCTURE
          ═══════════════════════════════ */}

      {/* ── MAIN SHAFT ── */}
      {/* Lower shaft — tapered */}
      <path d="M 32 155 L 30 185 L 40 185 L 38 155"
        fill={`url(#${gId('iron')})`} />
      {/* Shaft ring detail */}
      <ellipse cx="35" cy="155" rx="5" ry="2"
        fill={`url(#${gId('iron')})`}
        stroke="#3a2c18" strokeWidth="0.6" />
      {/* Upper shaft */}
      <rect x="32" y="90" width="6" height="68"
        fill={`url(#${gId('iron')})`} />
      {/* Shaft highlight */}
      <rect x="34" y="90" width="1.5" height="68"
        fill="#4a3820" opacity="0.50" />

      {/* ── DRIP PAN — base disc ── */}
      <ellipse cx="35" cy="185" rx="18" ry="4"
        fill={`url(#${gId('iron')})`}
        stroke="#3a2818" strokeWidth="0.8" />
      {/* Foot */}
      <path d="M 17 185 L 14 193 L 56 193 L 53 185"
        fill={`url(#${gId('iron')})`} />
      <ellipse cx="35" cy="193" rx="21" ry="3.5"
        fill={`url(#${gId('iron')})`}
        stroke="#3a2818" strokeWidth="0.8" />

      {/* ── CRESCENT MOON in base foot ── */}
      {/* Outer circle */}
      <circle cx="35" cy="191" r="5"
        stroke="#5a4028" strokeWidth="0.7"
        fill="none" opacity="0.65" />
      {/* Inner circle offset to create crescent */}
      <circle cx="37" cy="191" r="4"
        fill="#1a1408" opacity="0.80" />

      {/* ── LEFT ARM — S-curve from shaft to left candle ── */}
      {/* The arm curves out and up from the shaft */}
      <path
        d="M 33 110 C 28 108, 20 108, 16 112
           C 12 116, 11 120, 11 128"
        stroke={`url(#${gId('iron')})`}
        strokeWidth="4" strokeLinecap="round" fill="none"
      />
      {/* Arm highlight */}
      <path
        d="M 33 110 C 28 108, 20 108, 16 112
           C 12 116, 11 120, 11 128"
        stroke="#3a2c18"
        strokeWidth="1.5" strokeLinecap="round" fill="none"
        opacity="0.55"
      />
      {/* Decorative flourish at arm bend */}
      <circle cx="16" cy="113" r="2.5"
        fill={`url(#${gId('iron')})`}
        stroke="#4a3820" strokeWidth="0.6" />
      {/* Drip pan for left candle */}
      <ellipse cx="11" cy="128" rx="7" ry="1.8"
        fill={`url(#${gId('iron')})`} />

      {/* ── RIGHT ARM ── (mirror of left) */}
      <path
        d="M 37 110 C 42 108, 50 108, 54 112
           C 58 116, 59 120, 59 128"
        stroke={`url(#${gId('iron')})`}
        strokeWidth="4" strokeLinecap="round" fill="none"
      />
      <path
        d="M 37 110 C 42 108, 50 108, 54 112
           C 58 116, 59 120, 59 128"
        stroke="#3a2c18"
        strokeWidth="1.5" strokeLinecap="round" fill="none"
        opacity="0.55"
      />
      <circle cx="54" cy="113" r="2.5"
        fill={`url(#${gId('iron')})`}
        stroke="#4a3820" strokeWidth="0.6" />
      <ellipse cx="59" cy="128" rx="7" ry="1.8"
        fill={`url(#${gId('iron')})`} />

      {/* ── SOCKET RINGS — where candles meet arms ── */}
      {/* Center socket */}
      <ellipse cx="35" cy="90" rx="5" ry="2"
        fill={`url(#${gId('iron')})`}
        stroke="#4a3820" strokeWidth="0.7" />
      {/* Left socket */}
      <ellipse cx="11" cy="132" rx="4" ry="1.5"
        fill={`url(#${gId('iron')})`}
        stroke="#4a3820" strokeWidth="0.6" />
      {/* Right socket */}
      <ellipse cx="59" cy="132" rx="4" ry="1.5"
        fill={`url(#${gId('iron')})`}
        stroke="#4a3820" strokeWidth="0.6" />

      {/* ═══════════════════════════════
          CANDLES
          ═══════════════════════════════ */}

      {/* ── CENTER CANDLE — tallest ── */}
      <rect x="32" y="60" width="6" height="32"
        fill={`url(#${gId('wax')})`} rx="0.5" />
      {/* Drip down center candle */}
      <path d="M 35 72 C 34 76, 33 80, 33 86"
        stroke="#d8c8a8" strokeWidth="2" fill="none"
        strokeLinecap="round"
        clipPath={`url(#${gId('drip-c')})`} />
      {/* Wick */}
      <line x1="35" y1="60" x2="35" y2="56"
        stroke="#2a1808" strokeWidth="0.8" />

      {/* ── LEFT CANDLE — slightly shorter ── */}
      <rect x="8" y="75" width="6" height="28"
        fill={`url(#${gId('wax')})`} rx="0.5" />
      {/* Drip */}
      <path d="M 11 82 C 10 86, 9 90, 9 96"
        stroke="#d8c8a8" strokeWidth="1.8" fill="none"
        strokeLinecap="round"
        clipPath={`url(#${gId('drip-l')})`} />
      <line x1="11" y1="75" x2="11" y2="71"
        stroke="#2a1808" strokeWidth="0.8" />

      {/* ── RIGHT CANDLE ── */}
      <rect x="56" y="75" width="6" height="28"
        fill={`url(#${gId('wax')})`} rx="0.5" />
      {/* Drip */}
      <path d="M 59 83 C 60 87, 60 91, 59 97"
        stroke="#d8c8a8" strokeWidth="1.8" fill="none"
        strokeLinecap="round"
        clipPath={`url(#${gId('drip-r')})`} />
      <line x1="59" y1="75" x2="59" y2="71"
        stroke="#2a1808" strokeWidth="0.8" />

      {/* ═══════════════════════════════
          FLAMES — three staggered
          ═══════════════════════════════ */}

      {/* ── CENTER FLAME — brightest, tallest ── */}
      <g style={{ animationDelay: flameDelay }}>
        {/* Outer glow */}
        <ellipse cx="35" cy="50" rx="9" ry="13"
          fill={`url(#${gId('flame-c')})`}
          filter={`url(#${gId('flame-glow')})`}
          opacity="0.85"
          style={{
            animationName: 'mojo-flame-main',
            animationDuration: '1.8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: flameDelay,
          }}
        />
        {/* Inner flame */}
        <ellipse cx="35" cy="53" rx="5" ry="8"
          fill={`url(#${gId('flame-c')})`}
          opacity="0.95"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: flameDelay,
          }}
        />
        {/* White hot core */}
        <ellipse cx="35" cy="57" rx="2.5" ry="4"
          fill="#fff8e0" opacity="0.80"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: flameDelay,
          }}
        />
      </g>

      {/* ── LEFT FLAME — slightly cooler color, different delay ── */}
      <g style={{ animationDelay: `calc(${flameDelay} + 0.4s)` }}>
        <ellipse cx="11" cy="65" rx="7" ry="11"
          fill={`url(#${gId('flame-l')})`}
          filter={`url(#${gId('flame-glow')})`}
          opacity="0.80"
          style={{
            animationName: 'mojo-flame-main',
            animationDuration: '1.8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `calc(${flameDelay} + 0.4s)`,
          }}
        />
        <ellipse cx="11" cy="68" rx="4" ry="7"
          fill={`url(#${gId('flame-l')})`}
          opacity="0.90"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `calc(${flameDelay} + 0.4s)`,
          }}
        />
        <ellipse cx="11" cy="71" rx="2" ry="3.5"
          fill="#fff4d0" opacity="0.75"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `calc(${flameDelay} + 0.4s)`,
          }}
        />
      </g>

      {/* ── RIGHT FLAME — slightly warmer, third delay ── */}
      <g style={{ animationDelay: `calc(${flameDelay} + 0.7s)` }}>
        <ellipse cx="59" cy="65" rx="7" ry="11"
          fill={`url(#${gId('flame-r')})`}
          filter={`url(#${gId('flame-glow')})`}
          opacity="0.78"
          style={{
            animationName: 'mojo-flame-main',
            animationDuration: '1.8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `calc(${flameDelay} + 0.7s)`,
          }}
        />
        <ellipse cx="59" cy="68" rx="4" ry="7"
          fill={`url(#${gId('flame-r')})`}
          opacity="0.88"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `calc(${flameDelay} + 0.7s)`,
          }}
        />
        <ellipse cx="59" cy="71" rx="2" ry="3.5"
          fill="#fff4c8" opacity="0.72"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: `calc(${flameDelay} + 0.7s)`,
          }}
        />
      </g>
    </svg>
  )
}

export function SvgIvyColumn({
  height = 600,
  flip = false,
  idSuffix = 'ivy',
  className = '',
}: {
  height?: number
  flip?: boolean
  idSuffix?: string
  className?: string
}) {
  // Leaf data: [yPercent, xOffset, rotation, width, height]
  // yPercent: 0-100 along the height
  // xOffset: how far left (-) or right (+) the leaf extends from vine
  // Pattern: alternating left/right, irregular spacing
  const leaves: Array<[number, number, number, number, number]> = [
    [4,   -14,  20, 18, 11],
    [9,    12, -18, 14,  9],
    [14,  -16,  25, 20, 12],
    [19,   10, -15, 16, 10],
    [24,  -12,  22, 15,  9],
    [29,   14, -20, 19, 11],
    [34,  -15,  18, 17, 10],
    [39,   11, -22, 15,  9],
    [44,  -18,  28, 21, 13],
    [49,   12, -16, 16, 10],
    [54,  -14,  20, 18, 11],
    [59,   15, -24, 20, 12],
    [64,  -12,  18, 15,  9],
    [69,   10, -18, 17, 10],
    [74,  -16,  24, 19, 12],
    [79,   12, -20, 15,  9],
    [84,  -14,  22, 18, 11],
    [89,   11, -15, 16, 10],
    [94,  -16,  26, 20, 12],
    [98,   10, -18, 14,  9],
  ]

  // Wildflower positions: yPercent
  const flowers = [12, 32, 52, 72, 91]

  // Vine x center — always at x=12 in viewBox
  const VINE_X = 12
  const VIEW_W = 28

  return (
    <svg
      width={VIEW_W}
      height={height}
      viewBox={`0 0 ${VIEW_W} 100`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        pointerEvents: 'none',
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
    >
      {/* Main vine — gentle S-curve running full height */}
      <path
        d={`M ${VINE_X} 0
            C ${VINE_X-2} 15, ${VINE_X+2} 30, ${VINE_X} 40
            C ${VINE_X-2} 50, ${VINE_X+2} 65, ${VINE_X} 75
            C ${VINE_X-1} 85, ${VINE_X+1} 92, ${VINE_X} 100`}
        stroke="#2a4a1a"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.80"
      />

      {/* Leaves */}
      {leaves.map(([yp, xOff, rot, lw, lh], i) => {
        const cx = VINE_X + xOff * 0.5
        const cy = yp
        return (
          <g key={i}>
            {/* Small stem to leaf */}
            <path
              d={`M ${VINE_X} ${cy} L ${cx} ${cy}`}
              stroke="#2a4a1a" strokeWidth="0.8"
              opacity="0.55"
            />
            {/* Leaf ellipse */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={lw * 0.4}
              ry={lh * 0.4}
              fill="#2a5a18"
              transform={`rotate(${rot} ${cx} ${cy})`}
              opacity={0.72 - (i % 4) * 0.04}
            />
            {/* Leaf vein */}
            <line
              x1={cx - Math.cos((rot * Math.PI) / 180) * lw * 0.3}
              y1={cy - Math.sin((rot * Math.PI) / 180) * lh * 0.3}
              x2={cx + Math.cos((rot * Math.PI) / 180) * lw * 0.3}
              y2={cy + Math.sin((rot * Math.PI) / 180) * lh * 0.3}
              stroke="#1a4010"
              strokeWidth="0.5"
              opacity="0.40"
            />
          </g>
        )
      })}

      {/* Wildflowers */}
      {flowers.map((yp, i) => {
        const fx = VINE_X + (i % 2 === 0 ? -8 : 9)
        return (
          <g key={i}>
            {/* Stem to flower */}
            <path
              d={`M ${VINE_X} ${yp} L ${fx} ${yp - 2}`}
              stroke="#2a4a1a" strokeWidth="0.7"
              opacity="0.50"
            />
            {/* Petals */}
            <circle cx={fx} cy={yp - 2} r="2.8"
              fill="#f0ece0" opacity="0.55" />
            {/* Center */}
            <circle cx={fx} cy={yp - 2} r="1.1"
              fill="#e8c840" opacity="0.70" />
          </g>
        )
      })}

      {/* Tendrils — small curling vine tips */}
      {[20, 45, 68, 88].map((yp, i) => (
        <path key={i}
          d={`M ${VINE_X} ${yp}
              C ${VINE_X + (i%2===0?4:-4)} ${yp+3},
                ${VINE_X + (i%2===0?6:-6)} ${yp+6},
                ${VINE_X + (i%2===0?5:-5)} ${yp+9}`}
          stroke="#2a4a1a" strokeWidth="0.8"
          strokeLinecap="round" fill="none"
          opacity="0.45"
        />
      ))}
    </svg>
  )
}

// ─── MOJO-FIX-023: SvgHallOfMirrors — The Atelier preview ───

type MirrorGeometry = {
  tl: { x: number; y: number }
  tr: { x: number; y: number }
  bl: { x: number; y: number }
  br: { x: number; y: number }
  apex: { x: number; y: number }
  frameW: number
  mirW: number
  mirH: number
  midX: number
  t: number
}

export function SvgHallOfMirrors({
  className = '',
  idSuffix = 'hom',
}: {
  className?: string
  idSuffix?: string
}) {
  const gId = (name: string) => `${name}-${idSuffix}`
  const VP = { x: 450, y: 95 }

  // ── COMPUTE MIRROR POSITIONS ──
  const depths = [0.15, 0.45, 0.68]

  const leftMirrors: MirrorGeometry[] = depths.map((t) => {
    const wallX = 80 + 370 * t
    const wallTopY = 95 * t
    const wallBotY = 200 - 105 * t
    const wallH = wallBotY - wallTopY
    const mirH = wallH * 0.55
    const mirTopY = wallTopY + wallH * 0.22
    const mirBotY = mirTopY + mirH
    const mirW = mirH * 0.38
    const mirRightX = wallX
    const mirLeftX = mirRightX - mirW
    const archY = mirTopY - mirH * 0.18
    const midX = (mirLeftX + mirRightX) / 2
    const frameW = mirW * 0.12
    return {
      tl: { x: mirLeftX, y: mirTopY },
      tr: { x: mirRightX, y: mirTopY },
      bl: { x: mirLeftX, y: mirBotY },
      br: { x: mirRightX, y: mirBotY },
      apex: { x: midX, y: archY },
      frameW,
      mirW,
      mirH,
      midX,
      t,
    }
  })

  const rightMirrors: MirrorGeometry[] = depths.map((t) => {
    const wallX = 820 - 370 * t
    const wallTopY = 95 * t
    const wallBotY = 200 - 105 * t
    const wallH = wallBotY - wallTopY
    const mirH = wallH * 0.55
    const mirTopY = wallTopY + wallH * 0.22
    const mirBotY = mirTopY + mirH
    const mirW = mirH * 0.38
    const mirLeftX = wallX
    const mirRightX = mirLeftX + mirW
    const archY = mirTopY - mirH * 0.18
    const midX = (mirLeftX + mirRightX) / 2
    const frameW = mirW * 0.12
    return {
      tl: { x: mirLeftX, y: mirTopY },
      tr: { x: mirRightX, y: mirTopY },
      bl: { x: mirLeftX, y: mirBotY },
      br: { x: mirRightX, y: mirBotY },
      apex: { x: midX, y: archY },
      frameW,
      mirW,
      mirH,
      midX,
      t,
    }
  })

  // Ghost shape opacities — near mirrors brighter, far mirrors fainter
  const ghostOpacities = [0.18, 0.10, 0.05]

  // Frame path for a mirror — pointed gothic arch top, flat-ish sides
  function framePath(m: MirrorGeometry, outerL: number, outerR: number) {
    return `M ${m.bl.x - outerL} ${m.bl.y + m.frameW}
            L ${m.br.x + outerR} ${m.br.y + m.frameW}
            L ${m.br.x + outerR} ${m.tr.y}
            Q ${m.apex.x + m.mirW * 0.1} ${m.apex.y - m.frameW}
              ${m.apex.x} ${m.apex.y - m.frameW * 1.5}
            Q ${m.apex.x - m.mirW * 0.1} ${m.apex.y - m.frameW}
              ${m.tl.x - outerL} ${m.tl.y}
            L ${m.tl.x - outerL} ${m.bl.y + m.frameW} Z`
  }

  // Glass clip path — arched top matching the frame's inner edge
  function glassPath(m: MirrorGeometry) {
    return `M ${m.bl.x} ${m.bl.y}
            L ${m.br.x} ${m.br.y}
            L ${m.tr.x} ${m.tr.y}
            Q ${m.apex.x + m.mirW * 0.08} ${m.apex.y}
              ${m.apex.x} ${m.apex.y - m.mirH * 0.05}
            Q ${m.apex.x - m.mirW * 0.08} ${m.apex.y}
              ${m.tl.x} ${m.tl.y}
            Z`
  }

  return (
    <svg
      width="100%"
      height="200"
      viewBox="0 0 900 200"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* Ambient candlelight from VP — warm amber wash */}
        <radialGradient id={gId('vp-glow')} cx="50%" cy="47.5%" r="50%">
          <stop offset="0%"   stopColor="#c87800" stopOpacity="0.40" />
          <stop offset="30%"  stopColor="#c87800" stopOpacity="0.15" />
          <stop offset="65%"  stopColor="#c86000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#c84000" stopOpacity="0" />
        </radialGradient>

        {/* Stone wall gradients */}
        <linearGradient id={gId('wall-l')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1a1614" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0e0c0a" stopOpacity="0.90" />
        </linearGradient>
        <linearGradient id={gId('wall-r')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0e0c0a" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#1a1614" stopOpacity="0.95" />
        </linearGradient>

        {/* Floor gradient — lighter toward VP (lit by candle) */}
        <linearGradient id={gId('floor')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#0e0c10" />
          <stop offset="60%"  stopColor="#141218" />
          <stop offset="100%" stopColor="#1c1820" />
        </linearGradient>

        {/* Ceiling gradient */}
        <linearGradient id={gId('ceil')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#080608" />
          <stop offset="100%" stopColor="#0c0a0e" />
        </linearGradient>

        {/* Mirror glass gradient — dark with shimmer */}
        <linearGradient id={gId('glass')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a0a18" stopOpacity="0.95" />
          <stop offset="35%"  stopColor="#12121e" stopOpacity="0.90" />
          <stop offset="55%"  stopColor="#1a1a2a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0e0e1c" stopOpacity="0.95" />
        </linearGradient>

        {/* Mirror specular highlight — top-left catch-light */}
        <radialGradient id={gId('specular')} cx="25%" cy="15%" r="40%">
          <stop offset="0%"   stopColor="#c0c0e0" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#c0c0e0" stopOpacity="0" />
        </radialGradient>

        {/* Gilt frame gradient — metallic gold */}
        <linearGradient id={gId('gilt')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#6a4010" />
          <stop offset="25%"  stopColor="#c8a840" />
          <stop offset="50%"  stopColor="#f0d060" />
          <stop offset="75%"  stopColor="#c8a840" />
          <stop offset="100%" stopColor="#6a4010" />
        </linearGradient>

        {/* Ghost shape gradient — faint pale figure in glass */}
        <radialGradient id={gId('ghost')} cx="50%" cy="40%" r="50%">
          <stop offset="0%"   stopColor="#c0c8e0" stopOpacity="1" />
          <stop offset="60%"  stopColor="#9098c0" stopOpacity="0.60" />
          <stop offset="100%" stopColor="#6070a0" stopOpacity="0" />
        </radialGradient>

        {/* Archway vignette — dark arch frame around entire scene */}
        <radialGradient id={gId('vignette')} cx="50%" cy="50%" r="55%">
          <stop offset="60%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
        </radialGradient>

        {/* Mist gradient — cool blue-white, floor level */}
        <linearGradient id={gId('mist')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#a8b8d0" stopOpacity="0.12" />
          <stop offset="40%"  stopColor="#a8b8d0" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#a8b8d0" stopOpacity="0" />
        </linearGradient>

        {/* Candle flame at VP */}
        <radialGradient id={gId('vp-flame')} cx="50%" cy="80%" r="55%">
          <stop offset="0%"   stopColor="#fff8e0" stopOpacity="1" />
          <stop offset="40%"  stopColor="#f0a020" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#c06010" stopOpacity="0" />
        </radialGradient>

        <filter id={gId('flame-filter')}
          x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Stone block clip for arch sides */}
        <clipPath id={gId('scene-clip')}>
          <rect x="0" y="0" width="900" height="200" />
        </clipPath>
      </defs>

      {/* ══════════════════════════════════════
          BACKGROUND — deep void
          ══════════════════════════════════════ */}
      <rect x="0" y="0" width="900" height="200" fill="#080608" />

      {/* ══════════════════════════════════════
          CORRIDOR WALLS, FLOOR, CEILING
          ══════════════════════════════════════ */}

      {/* LEFT WALL — triangle from (80,0),(80,200) to VP */}
      <path
        d={`M 80 0 L ${VP.x} ${VP.y} L 80 200 Z`}
        fill={`url(#${gId('wall-l')})`}
      />
      {/* Stone coursing lines — converge to VP, mathematically correct one-point perspective */}
      {[0.15, 0.30, 0.45, 0.60, 0.75, 0.88].map((f, i) => (
        <line key={i}
          x1="80" y1={f * 200}
          x2={VP.x} y2={VP.y}
          stroke="#141210" strokeWidth="0.6" opacity="0.35"
          clipPath={`url(#${gId('scene-clip')})`}
        />
      ))}

      {/* RIGHT WALL */}
      <path
        d={`M 820 0 L ${VP.x} ${VP.y} L 820 200 Z`}
        fill={`url(#${gId('wall-r')})`}
      />
      {[0.15, 0.30, 0.45, 0.60, 0.75, 0.88].map((f, i) => (
        <line key={i}
          x1="820" y1={f * 200}
          x2={VP.x} y2={VP.y}
          stroke="#141210" strokeWidth="0.6" opacity="0.35"
          clipPath={`url(#${gId('scene-clip')})`}
        />
      ))}

      {/* FLOOR — triangle from (80,200),(820,200) to VP */}
      <path
        d={`M 80 200 L 820 200 L ${VP.x} ${VP.y} Z`}
        fill={`url(#${gId('floor')})`}
      />

      {/* Floor tile diamond pattern — four rows, narrower toward VP */}
      {[0.85, 0.65, 0.45, 0.25].map((t, row) => {
        const floorY = 200 - (200 - VP.y) * (1 - t)
        const leftX = 80 + 370 * t
        const rightX = 820 - 370 * t
        const rowW = rightX - leftX
        const tileW = rowW / 6
        const tileH = (200 - floorY) * 0.45
        return Array.from({ length: 6 }, (_, col) => {
          const tx = leftX + col * tileW
          const altFill = (row + col) % 2 === 0 ? '#0e0c10' : '#131018'
          return (
            <path key={`${row}-${col}`}
              d={`M ${tx + tileW / 2} ${floorY}
                  L ${tx + tileW} ${floorY + tileH}
                  L ${tx + tileW / 2} ${floorY + tileH * 2}
                  L ${tx} ${floorY + tileH} Z`}
              fill={altFill}
              stroke="#1a1820" strokeWidth="0.4"
              clipPath={`url(#${gId('scene-clip')})`}
            />
          )
        })
      })}

      {/* CEILING — triangle from (80,0),(820,0) to VP */}
      <path
        d={`M 80 0 L 820 0 L ${VP.x} ${VP.y} Z`}
        fill={`url(#${gId('ceil')})`}
      />
      {/* Ceiling stone blocks */}
      {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
        const leftX = 80 + 370 * t
        const rightX = 820 - 370 * t
        return (
          <line key={i}
            x1={leftX} y1={95 * t}
            x2={rightX} y2={95 * t}
            stroke="#0c0a0e" strokeWidth="0.8" opacity="0.60"
          />
        )
      })}

      {/* ══════════════════════════════════════
          MIRRORS — LEFT SIDE
          ══════════════════════════════════════ */}

      {leftMirrors.map((m, i) => {
        const opacity = 1 - i * 0.15
        const ghostOp = ghostOpacities[i]
        const glassClipId = gId(`lglass-clip-${i}`)

        return (
          <g key={`lm-${i}`} opacity={opacity}>
            {/* Gothic arch frame (gilt) */}
            <path
              d={framePath(m, m.frameW, m.frameW * 0.5)}
              fill={`url(#${gId('gilt')})`}
              opacity="0.90"
            />

            {/* Mirror glass, clipped to the arch shape */}
            <clipPath id={glassClipId}>
              <path d={glassPath(m)} />
            </clipPath>
            <rect
              x={m.tl.x} y={m.apex.y}
              width={m.mirW} height={m.mirH + (m.tl.y - m.apex.y) + m.frameW}
              fill={`url(#${gId('glass')})`}
              clipPath={`url(#${glassClipId})`}
            />

            {/* Ghost shape in glass — different per mirror */}
            {i === 0 && (
              <ellipse
                cx={m.midX - m.mirW * 0.1}
                cy={(m.tl.y + m.bl.y) / 2 - m.mirH * 0.05}
                rx={m.mirW * 0.15}
                ry={m.mirH * 0.32}
                fill={`url(#${gId('ghost')})`}
                opacity={ghostOp}
                clipPath={`url(#${glassClipId})`}
              />
            )}
            {i === 1 && (
              <path
                d={`M ${m.midX} ${m.tl.y + m.mirH * 0.3}
                    C ${m.midX + m.mirW * 0.2} ${m.tl.y + m.mirH * 0.4},
                      ${m.midX - m.mirW * 0.2} ${m.tl.y + m.mirH * 0.5},
                      ${m.midX} ${m.tl.y + m.mirH * 0.6}`}
                stroke="#c0c8e0"
                strokeWidth={m.mirW * 0.12}
                strokeLinecap="round"
                fill="none"
                opacity={ghostOp * 0.8}
                clipPath={`url(#${glassClipId})`}
              />
            )}
            {i === 2 && (
              <ellipse
                cx={m.midX}
                cy={(m.tl.y + m.bl.y) / 2}
                rx={m.mirW * 0.25}
                ry={m.mirH * 0.20}
                fill={`url(#${gId('ghost')})`}
                opacity={ghostOp * 0.6}
                clipPath={`url(#${glassClipId})`}
              />
            )}

            {/* Specular highlight */}
            <rect
              x={m.tl.x} y={m.apex.y}
              width={m.mirW} height={m.mirH * 0.6}
              fill={`url(#${gId('specular')})`}
              clipPath={`url(#${glassClipId})`}
            />

            {/* Frame corner rosettes */}
            {[
              { x: m.tl.x - m.frameW * 0.5, y: m.tl.y },
              { x: m.br.x + m.frameW * 0.3, y: m.br.y },
              { x: m.bl.x - m.frameW * 0.5, y: m.bl.y },
            ].map((pt, ri) => (
              <circle key={ri}
                cx={pt.x} cy={pt.y} r={m.frameW * 0.8}
                fill="#c8a840" opacity="0.75"
              />
            ))}
            {/* Apex ornament */}
            <circle
              cx={m.apex.x} cy={m.apex.y - m.frameW}
              r={m.frameW * 1.0}
              fill="#f0d060" opacity="0.80"
            />
          </g>
        )
      })}

      {/* ══════════════════════════════════════
          MIRRORS — RIGHT SIDE
          ══════════════════════════════════════ */}

      {rightMirrors.map((m, i) => {
        const opacity = 1 - i * 0.15
        const ghostOp = ghostOpacities[i]
        const glassClipId = gId(`rglass-clip-${i}`)

        return (
          <g key={`rm-${i}`} opacity={opacity}>
            <path
              d={framePath(m, m.frameW * 0.5, m.frameW)}
              fill={`url(#${gId('gilt')})`}
              opacity="0.90"
            />

            <clipPath id={glassClipId}>
              <path d={glassPath(m)} />
            </clipPath>
            <rect
              x={m.tl.x} y={m.apex.y}
              width={m.mirW} height={m.mirH + (m.tl.y - m.apex.y) + m.frameW}
              fill={`url(#${gId('glass')})`}
              clipPath={`url(#${glassClipId})`}
            />

            {/* Ghost shapes — different from left side */}
            {i === 0 && (
              /* Right mirror 1: faint center glow — matches set */
              <ellipse
                cx={m.midX}
                cy={(m.tl.y + m.bl.y) / 2}
                rx={m.mirW * 0.22}
                ry={m.mirH * 0.18}
                fill={`url(#${gId('ghost')})`}
                opacity={ghostOp * 0.6}
                clipPath={`url(#${glassClipId})`}
              />
            )}
            {i === 1 && (
              /* Right mirror 2: faint center glow — matches set */
              <ellipse
                cx={m.midX}
                cy={(m.tl.y + m.bl.y) / 2}
                rx={m.mirW * 0.22}
                ry={m.mirH * 0.18}
                fill={`url(#${gId('ghost')})`}
                opacity={ghostOp * 0.6}
                clipPath={`url(#${glassClipId})`}
              />
            )}
            {i === 2 && (
              /* Right mirror 3: crescent moon — moved from Right mirror 1 */
              <>
                <circle
                  cx={m.midX + m.mirW * 0.05}
                  cy={(m.tl.y + m.bl.y) / 2 - m.mirH * 0.05}
                  r={m.mirH * 0.22}
                  fill="#c0c8e0"
                  opacity={ghostOp}
                  clipPath={`url(#${glassClipId})`}
                />
                <circle
                  cx={m.midX + m.mirW * 0.15}
                  cy={(m.tl.y + m.bl.y) / 2 - m.mirH * 0.08}
                  r={m.mirH * 0.20}
                  fill="#0a0a18"
                  opacity={0.90}
                  clipPath={`url(#${glassClipId})`}
                />
              </>
            )}

            <rect
              x={m.tl.x} y={m.apex.y}
              width={m.mirW} height={m.mirH * 0.6}
              fill={`url(#${gId('specular')})`}
              clipPath={`url(#${glassClipId})`}
            />

            {[
              { x: m.tr.x + m.frameW * 0.5, y: m.tr.y },
              { x: m.bl.x - m.frameW * 0.3, y: m.bl.y },
              { x: m.br.x + m.frameW * 0.5, y: m.br.y },
            ].map((pt, ri) => (
              <circle key={ri}
                cx={pt.x} cy={pt.y} r={m.frameW * 0.8}
                fill="#c8a840" opacity="0.75"
              />
            ))}
            <circle
              cx={m.apex.x} cy={m.apex.y - m.frameW}
              r={m.frameW * 1.0}
              fill="#f0d060" opacity="0.80"
            />
          </g>
        )
      })}

      {/* ══════════════════════════════════════
          CANDLE AT VANISHING POINT
          ══════════════════════════════════════ */}

      {/* ── CRESCENT MOON — center top, above candle ── */}
      {/* Outer circle — faint silver */}
      <circle cx="450" cy="72" r="9"
        fill="#c0c8e0" opacity="0.28"
      />
      {/* Inner circle — offset to create crescent */}
      <circle cx="453" cy="70" r="7.5"
        fill="#080608" opacity="0.92"
      />
      {/* Faint silver glow around crescent */}
      <circle cx="450" cy="72" r="13"
        fill="#c0c8e0" opacity="0.06"
      />

      <rect x="448" y="100" width="4" height="18"
        fill="#ede0c4" rx="0.5" />
      <line x1="450" y1="100" x2="450" y2="97"
        stroke="#1a1008" strokeWidth="0.8" />
      <ellipse cx="450" cy="118" rx="6" ry="1.5"
        fill="#b88820" />

      {/* Flame — outer glow, inner, white core (staggered via animation-delay 0 since single instance) */}
      <ellipse cx="450" cy="90" rx="12" ry="16"
        fill={`url(#${gId('vp-flame')})`}
        filter={`url(#${gId('flame-filter')})`}
        opacity="0.90"
        style={{
          animationName: 'mojo-flame-main',
          animationDuration: '1.8s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      />
      <ellipse cx="450" cy="93" rx="6" ry="10"
        fill={`url(#${gId('vp-flame')})`}
        opacity="0.95"
        style={{
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0s',
        }}
      />
      <ellipse cx="450" cy="97" rx="3" ry="5"
        fill="#fff8e0" opacity="0.85"
        style={{
          animationName: 'mojo-flame-inner',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: '0.15s',
        }}
      />

      {/* ══════════════════════════════════════
          ATMOSPHERIC OVERLAYS
          ══════════════════════════════════════ */}

      <rect x="0" y="0" width="900" height="200"
        fill={`url(#${gId('vp-glow')})`} />

      {/* Floor mist — low-lying, near the viewer */}
      <rect x="80" y="140" width="740" height="60"
        fill={`url(#${gId('mist')})`} />

      {/* ══════════════════════════════════════
          ARCHWAY FRAME — stone entrance
          ══════════════════════════════════════ */}

      <rect x="0" y="0" width="82" height="200" fill="#0e0c0a" />
      {[0, 28, 56, 84, 112, 140, 168, 196].map((y, i) => (
        <rect key={i} x="0" y={y} width="82" height="27"
          fill={i % 2 === 0 ? '#0e0c0a' : '#121008'}
          stroke="#1a1612" strokeWidth="0.8"
        />
      ))}
      <rect x="818" y="0" width="82" height="200" fill="#0e0c0a" />
      {[0, 28, 56, 84, 112, 140, 168, 196].map((y, i) => (
        <rect key={i} x="818" y={y} width="82" height="27"
          fill={i % 2 === 0 ? '#0e0c0a' : '#121008'}
          stroke="#1a1612" strokeWidth="0.8"
        />
      ))}

      {/* Archway inner edges — the reveal of the stone */}
      <rect x="78" y="0" width="5" height="200" fill="#1a1614" opacity="0.70" />
      <rect x="817" y="0" width="5" height="200" fill="#1a1614" opacity="0.70" />

      {/* Vignette overlay */}
      <rect x="0" y="0" width="900" height="200"
        fill={`url(#${gId('vignette')})`} />

      {/* Corridor edge shadow lines */}
      <line x1="80" y1="0"   x2={VP.x} y2={VP.y} stroke="#000000" strokeWidth="2" opacity="0.60" />
      <line x1="80" y1="200" x2={VP.x} y2={VP.y} stroke="#000000" strokeWidth="2" opacity="0.60" />
      <line x1="820" y1="0"   x2={VP.x} y2={VP.y} stroke="#000000" strokeWidth="2" opacity="0.60" />
      <line x1="820" y1="200" x2={VP.x} y2={VP.y} stroke="#000000" strokeWidth="2" opacity="0.60" />
    </svg>
  )
}

// ─── MOJO-FIX-024: SvgDiviningChamber — The Atelier preview ───

type TarotCard = [number, number, number, boolean, string | null]
type RuneStone = [number, number, number, number, number, string]
type ScatterLight = [number, number, number, number, string, number]

const CARDS: TarotCard[] = [
  [148, 148, -30, false, null],
  [210, 138, -18, false, null],
  [272, 131,  -7, false, null],
  [335, 128,   3, true, 'moon'],
  [398, 131,  13, false, null],
  [458, 139,  23, true, 'eye'],
  [515, 150,  32, false, null],
]

const STONES: RuneStone[] = [
  [588, 96,  11, 7,  15, 'M'],
  [628, 138, 10, 6,  -8, 'F'],
  [660, 104, 12, 7,  22, 'R'],
  [705, 142, 10, 6, -15, 'T'],
  [735, 112, 11, 7,   5, 'S'],
  [768, 148,  9, 6,  18, 'N'],
  [615, 168, 10, 6, -12, 'E'],
  [685, 172, 11, 7,   8, 'G'],
]

const SCATTER: ScatterLight[] = [
  [508, 132, 6, 3, '#c8a0ff', 0.14],
  [488, 145, 4, 2, '#a0ffb8', 0.11],
  [515, 148, 5, 3, '#ffd8a0', 0.16],
  [478, 128, 3, 2, '#c8a0ff', 0.09],
  [522, 138, 4, 2, '#a0e8ff', 0.10],
]

export function SvgDiviningChamber({
  className = '',
  idSuffix = 'dc',
}: {
  className?: string
  idSuffix?: string
}) {
  const gId = (name: string) => `${name}-${idSuffix}`

  const CARD_W = 52
  const CARD_H = 86
  const CARD_R = 2

  return (
    <svg
      width="100%"
      height="220"
      viewBox="0 0 900 220"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* Velvet cloth */}
        <radialGradient id={gId('cloth')} cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="#12102a" />
          <stop offset="60%"  stopColor="#0e0c20" />
          <stop offset="100%" stopColor="#080614" />
        </radialGradient>

        {/* Candlelight — two sources */}
        <radialGradient id={gId('light-l')} cx="12%" cy="19%" r="55%">
          <stop offset="0%"   stopColor="#c87800" stopOpacity="0.35" />
          <stop offset="40%"  stopColor="#c87000" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#c86000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={gId('light-r')} cx="88%" cy="19%" r="55%">
          <stop offset="0%"   stopColor="#c87800" stopOpacity="0.35" />
          <stop offset="40%"  stopColor="#c87000" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#c86000" stopOpacity="0" />
        </radialGradient>

        {/* Tarot card back — ornate burgundy */}
        <linearGradient id={gId('card-back')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#280818" />
          <stop offset="50%"  stopColor="#1e0612" />
          <stop offset="100%" stopColor="#28081a" />
        </linearGradient>
        {/* Card face — Moon */}
        <radialGradient id={gId('moon-card')} cx="50%" cy="35%" r="50%">
          <stop offset="0%"   stopColor="#1a1830" />
          <stop offset="100%" stopColor="#0e0c1e" />
        </radialGradient>
        {/* Card face — Eye */}
        <radialGradient id={gId('eye-card')} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1e1420" />
          <stop offset="100%" stopColor="#0c080e" />
        </radialGradient>

        {/* Gold gilt */}
        <linearGradient id={gId('gilt')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#8a5810" />
          <stop offset="30%"  stopColor="#c8a840" />
          <stop offset="70%"  stopColor="#f0d060" />
          <stop offset="100%" stopColor="#8a5810" />
        </linearGradient>
        <linearGradient id={gId('gilt-v')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#8a5810" />
          <stop offset="50%"  stopColor="#c8a840" />
          <stop offset="100%" stopColor="#8a5810" />
        </linearGradient>

        {/* Crystal pendulum */}
        <linearGradient id={gId('crystal')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#d0d8f0" stopOpacity="0.95" />
          <stop offset="30%"  stopColor="#9098c0" stopOpacity="0.80" />
          <stop offset="60%"  stopColor="#e8ecff" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#6068a0" stopOpacity="0.70" />
        </linearGradient>
        <radialGradient id={gId('crystal-glow')} cx="35%" cy="25%" r="50%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.60" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id={gId('crystal-filter')}
          x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Rune stone */}
        <linearGradient id={gId('stone')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a2418" />
          <stop offset="100%" stopColor="#141008" />
        </linearGradient>

        {/* Candle wax */}
        <linearGradient id={gId('wax')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ede8d8" />
          <stop offset="100%" stopColor="#d4c8a8" />
        </linearGradient>

        {/* Flame */}
        <radialGradient id={gId('flame')} cx="50%" cy="80%" r="55%">
          <stop offset="0%"   stopColor="#fff8e0" stopOpacity="1" />
          <stop offset="35%"  stopColor="#f0a020" stopOpacity="0.95" />
          <stop offset="80%"  stopColor="#c06010" stopOpacity="0.70" />
          <stop offset="100%" stopColor="#800800" stopOpacity="0" />
        </radialGradient>
        <filter id={gId('flame-glow')}
          x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Vignette */}
        <radialGradient id={gId('vignette')} cx="50%" cy="50%" r="55%">
          <stop offset="50%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.80" />
        </radialGradient>

        {/* Cloth clip */}
        <clipPath id={gId('cloth-clip')}>
          <rect x="60" y="20" width="780" height="190" rx="4" />
        </clipPath>
      </defs>

      {/* ── VOID BACKGROUND ── */}
      <rect x="0" y="0" width="900" height="220" fill="#04030c" />

      {/* ── VELVET CLOTH SURFACE ── */}
      <rect x="60" y="20" width="780" height="190" rx="4"
        fill={`url(#${gId('cloth')})`} />
      {/* Cloth texture — subtle diagonal grain */}
      {Array.from({ length: 30 }, (_, i) => (
        <line key={i}
          x1={60 + i * 28} y1="20"
          x2={60 + i * 28 - 40} y2="210"
          stroke="#1a1830" strokeWidth="0.5"
          opacity="0.18"
          clipPath={`url(#${gId('cloth-clip')})`}
        />
      ))}

      {/* Gold embroidered border — near (bottom) edge */}
      <rect x="68" y="198" width="764" height="8"
        fill={`url(#${gId('gilt')})`} opacity="0.22" rx="1" />
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i}
          d={`M ${100 + i * 28} 202 L ${114 + i * 28} 198
              L ${128 + i * 28} 202 L ${114 + i * 28} 206 Z`}
          fill="#c8a840" opacity="0.18"
        />
      ))}
      <rect x="60" y="20" width="8" height="188"
        fill={`url(#${gId('gilt-v')})`} opacity="0.18" rx="1" />
      <rect x="832" y="20" width="8" height="188"
        fill={`url(#${gId('gilt-v')})`} opacity="0.18" rx="1" />
      <rect x="68" y="20" width="764" height="6"
        fill={`url(#${gId('gilt')})`} opacity="0.16" rx="1" />

      {/* ── CANDLELIGHT WASHES ── */}
      <rect x="60" y="20" width="780" height="190"
        fill={`url(#${gId('light-l')})`}
        clipPath={`url(#${gId('cloth-clip')})`} />
      <rect x="60" y="20" width="780" height="190"
        fill={`url(#${gId('light-r')})`}
        clipPath={`url(#${gId('cloth-clip')})`} />

      {/* ── TAROT CARDS ── */}
      {CARDS.map(([cx, cy, rot, faceUp, faceType], i) => {
        const x = cx - CARD_W / 2
        const y = cy - CARD_H / 2
        const rotate = `rotate(${rot} ${cx} ${cy})`

        return (
          <g key={i} transform={rotate}>
            {/* Drop shadow */}
            <rect x={x + 2} y={y + 3} width={CARD_W} height={CARD_H}
              rx={CARD_R} fill="#000000" opacity="0.35" />

            {faceUp ? (
              <>
                <rect x={x} y={y} width={CARD_W} height={CARD_H}
                  rx={CARD_R}
                  fill={faceType === 'moon'
                    ? `url(#${gId('moon-card')})`
                    : `url(#${gId('eye-card')})`}
                  stroke="#c8a840" strokeWidth="1.0"
                />
                <rect x={x + 3} y={y + 3}
                  width={CARD_W - 6} height={CARD_H - 6}
                  rx={CARD_R - 1} fill="none"
                  stroke="#c8a840" strokeWidth="0.5" opacity="0.50"
                />
                {faceType === 'moon' && (
                  <g>
                    <text x={cx} y={y + 12}
                      textAnchor="middle"
                      fontFamily="Cinzel, serif"
                      fontSize="6" fill="#c8a840" opacity="0.70"
                    >XVIII</text>
                    <circle cx={cx} cy={y + 36} r="13"
                      fill="#d0c8e0" opacity="0.75" />
                    <circle cx={cx + 5} cy={y + 34} r="11"
                      fill={`url(#${gId('moon-card')})`} />
                    {[
                      [cx - 15, y + 27],
                      [cx + 17, y + 25],
                      [cx - 10, y + 59],
                      [cx + 12, y + 57],
                    ].map(([sx, sy], si) => (
                      <circle key={si}
                        cx={sx} cy={sy} r="1.5"
                        fill="#e0d8f0" opacity="0.65" />
                    ))}
                    <text x={cx} y={y + CARD_H - 6}
                      textAnchor="middle"
                      fontFamily="EB Garamond, serif"
                      fontSize="5" fontStyle="italic"
                      fill="#c8a840" opacity="0.60"
                    >The Moon</text>
                  </g>
                )}
                {faceType === 'eye' && (
                  <g>
                    <text x={cx} y={y + 12}
                      textAnchor="middle"
                      fontFamily="Cinzel, serif"
                      fontSize="6" fill="#c8a840" opacity="0.70"
                    >XII</text>
                    <path
                      d={`M ${cx - 17} ${y + 36}
                          Q ${cx} ${y + 22} ${cx + 17} ${y + 36}
                          Q ${cx} ${y + 52} ${cx - 17} ${y + 36} Z`}
                      fill="#c0a8d0" opacity="0.35"
                      stroke="#c8a840" strokeWidth="0.8"
                    />
                    <circle cx={cx} cy={y + 36} r="9"
                      fill="#2a1830" stroke="#c8a840"
                      strokeWidth="0.6" opacity="0.90" />
                    <circle cx={cx} cy={y + 36} r="4" fill="#0a0610" />
                    <circle cx={cx - 2} cy={y + 34} r="1.5"
                      fill="#e0d8f0" opacity="0.70" />
                    {[-12, -7, -2, 2, 7, 12].map((dx, li) => (
                      <line key={li}
                        x1={cx + dx} y1={y + 24}
                        x2={cx + dx * 1.1} y2={y + 20}
                        stroke="#c8a840" strokeWidth="0.7"
                        opacity="0.55"
                      />
                    ))}
                    <text x={cx} y={y + CARD_H - 6}
                      textAnchor="middle"
                      fontFamily="EB Garamond, serif"
                      fontSize="5" fontStyle="italic"
                      fill="#c8a840" opacity="0.60"
                    >The Eye</text>
                  </g>
                )}
              </>
            ) : (
              <>
                <rect x={x} y={y} width={CARD_W} height={CARD_H}
                  rx={CARD_R}
                  fill={`url(#${gId('card-back')})`}
                  stroke="#8a3040" strokeWidth="0.8"
                />
                <rect x={x + 3} y={y + 3}
                  width={CARD_W - 6} height={CARD_H - 6}
                  rx={CARD_R - 1} fill="none"
                  stroke="#c8a840" strokeWidth="0.5" opacity="0.40"
                />
                {[10, 7, 4].map((r, ri) => (
                  <path key={ri}
                    d={`M ${cx} ${cy - r * 2.2}
                        L ${cx + r * 1.4} ${cy}
                        L ${cx} ${cy + r * 2.2}
                        L ${cx - r * 1.4} ${cy} Z`}
                    stroke="#c8a840" strokeWidth="0.5"
                    fill="none" opacity={0.55 - ri * 0.12}
                  />
                ))}
                <line x1={cx} y1={y + 8} x2={cx} y2={y + CARD_H - 8}
                  stroke="#c8a840" strokeWidth="0.4" opacity="0.22" />
                <line x1={x + 6} y1={cy} x2={x + CARD_W - 6} y2={cy}
                  stroke="#c8a840" strokeWidth="0.4" opacity="0.22" />
                {[
                  [x + 7, y + 7], [x + CARD_W - 7, y + 7],
                  [x + 7, y + CARD_H - 7], [x + CARD_W - 7, y + CARD_H - 7],
                ].map(([sx, sy], si) => (
                  <circle key={si} cx={sx} cy={sy} r="2"
                    fill="#c8a840" opacity="0.35" />
                ))}
              </>
            )}
          </g>
        )
      })}

      {/* ── RUNE STONES ── */}
      {STONES.map(([cx, cy, rx, ry, rot, rune], i) => (
        <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
          <ellipse cx={cx + 1} cy={cy + 2} rx={rx} ry={ry}
            fill="#000000" opacity="0.40" />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
            fill={`url(#${gId('stone')})`}
            stroke="#3a2c18" strokeWidth="0.8"
          />
          <ellipse
            cx={cx - rx * 0.25} cy={cy - ry * 0.25}
            rx={rx * 0.45} ry={ry * 0.35}
            fill="#3a2c18" opacity="0.55"
          />
          {rune === 'M' && (
            <g transform={`rotate(${-rot} ${cx} ${cy})`}>
              <path d={`M ${cx - 3} ${cy + 3}
                        L ${cx - 3} ${cy - 3}
                        L ${cx} ${cy}
                        L ${cx + 3} ${cy - 3}
                        L ${cx + 3} ${cy + 3}`}
                stroke="#9090a0" strokeWidth="0.7" fill="none" opacity="0.55" />
            </g>
          )}
          {rune === 'F' && (
            <g transform={`rotate(${-rot} ${cx} ${cy})`}>
              <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
              <line x1={cx} y1={cy - 3} x2={cx + 3} y2={cy - 1}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
              <line x1={cx} y1={cy - 0.5} x2={cx + 3} y2={cy + 1}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.50" />
            </g>
          )}
          {rune === 'R' && (
            <g transform={`rotate(${-rot} ${cx} ${cy})`}>
              <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
              <path d={`M ${cx} ${cy - 4}
                        L ${cx + 3} ${cy - 1}
                        L ${cx} ${cy}
                        L ${cx + 3} ${cy + 4}`}
                stroke="#9090a0" strokeWidth="0.7" fill="none" opacity="0.55" />
            </g>
          )}
          {rune === 'T' && (
            <g transform={`rotate(${-rot} ${cx} ${cy})`}>
              <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
              <line x1={cx - 3} y1={cy - 1} x2={cx + 3} y2={cy - 1}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
            </g>
          )}
          {rune === 'S' && (
            <g transform={`rotate(${-rot} ${cx} ${cy})`}>
              <path d={`M ${cx - 3} ${cy - 4}
                        L ${cx + 3} ${cy - 1}
                        L ${cx - 3} ${cy + 1}
                        L ${cx + 3} ${cy + 4}`}
                stroke="#9090a0" strokeWidth="0.7" fill="none" opacity="0.55" />
            </g>
          )}
          {rune === 'N' && (
            <g transform={`rotate(${-rot} ${cx} ${cy})`}>
              <line x1={cx - 2.5} y1={cy - 4} x2={cx - 2.5} y2={cy + 4}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
              <line x1={cx + 2.5} y1={cy - 4} x2={cx + 2.5} y2={cy + 4}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
              <line x1={cx - 2.5} y1={cy - 3} x2={cx + 2.5} y2={cy + 3}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
            </g>
          )}
          {rune === 'E' && (
            <g transform={`rotate(${-rot} ${cx} ${cy})`}>
              <line x1={cx - 3} y1={cy - 4} x2={cx + 3} y2={cy - 4}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
              <path d={`M ${cx - 3} ${cy - 4}
                        L ${cx - 3} ${cy + 4}
                        L ${cx + 3} ${cy + 4}`}
                stroke="#9090a0" strokeWidth="0.7" fill="none" opacity="0.55" />
            </g>
          )}
          {rune === 'G' && (
            <g transform={`rotate(${-rot} ${cx} ${cy})`}>
              <line x1={cx - 3.5} y1={cy - 3.5} x2={cx + 3.5} y2={cy + 3.5}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
              <line x1={cx + 3.5} y1={cy - 3.5} x2={cx - 3.5} y2={cy + 3.5}
                stroke="#9090a0" strokeWidth="0.7" opacity="0.55" />
            </g>
          )}
        </g>
      ))}

      {/* ── CELESTIAL MAP — gilt star chart on the cloth ── */}
      <g>
        <circle cx="490" cy="152" r="52" stroke="#c8a840" strokeWidth="0.6" fill="none" opacity="0.18" />
        <circle cx="490" cy="152" r="36" stroke="#c8a840" strokeWidth="0.4" fill="none" opacity="0.14" />
        <circle cx="490" cy="152" r="20" stroke="#c8a840" strokeWidth="0.4" fill="none" opacity="0.12" />
        <circle cx="490" cy="152" r="2.5" fill="#c8a840" opacity="0.20" />

        {/* Cardinal cross */}
        <line x1="490" y1="100" x2="490" y2="152" stroke="#c8a840" strokeWidth="0.5" opacity="0.12" />
        <line x1="490" y1="152" x2="490" y2="204" stroke="#c8a840" strokeWidth="0.5" opacity="0.12" />
        <line x1="490" y1="152" x2="542" y2="152" stroke="#c8a840" strokeWidth="0.5" opacity="0.12" />
        <line x1="438" y1="152" x2="490" y2="152" stroke="#c8a840" strokeWidth="0.5" opacity="0.12" />

        {/* 12 zodiac position marks */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180)
          const zx = 490 + 48 * Math.cos(angle)
          const zy = 152 + 48 * Math.sin(angle)
          return (
            <circle key={i} cx={zx} cy={zy} r="1.5" fill="#c8a840" opacity="0.22" />
          )
        })}

        {/* 8 intercardinal compass lines */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45 - 90) * (Math.PI / 180)
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)
          return (
            <line key={i}
              x1={490 + 18 * cos} y1={152 + 18 * sin}
              x2={490 + 52 * cos} y2={152 + 52 * sin}
              stroke="#c8a840" strokeWidth="0.4" opacity="0.10"
            />
          )
        })}

        {/* Constellation dot clusters */}
        {[
          [482, 108], [490, 104], [498, 110],
          [455, 165], [460, 172], [452, 170],
          [524, 168], [530, 162], [528, 172],
        ].map(([sx, sy], si) => (
          <circle key={si} cx={sx} cy={sy} r="1.2" fill="#c8a840" opacity="0.18" />
        ))}
      </g>

      {/* ── CRYSTAL PENDULUM — hangs over the celestial map ── */}
      <path d="M 490 0 C 492 25, 496 48, 498 70"
        stroke="#8090a0" strokeWidth="0.8"
        strokeDasharray="2 2" opacity="0.55"
      />
      <circle cx="490" cy="2" r="3"
        stroke="#7080a0" strokeWidth="0.8" fill="none" opacity="0.45" />

      <path
        d="M 498 70 L 490 80 L 488 96 L 494 120 L 500 96 L 508 80 Z"
        fill={`url(#${gId('crystal')})`}
        filter={`url(#${gId('crystal-filter')})`}
        stroke="#b0b8d8" strokeWidth="0.8"
        opacity="0.90"
      />
      <line x1="498" y1="70" x2="494" y2="120"
        stroke="#d0d8f0" strokeWidth="0.4" opacity="0.50" />
      <line x1="490" y1="80" x2="508" y2="80"
        stroke="#d0d8f0" strokeWidth="0.4" opacity="0.40" />
      <line x1="488" y1="96" x2="500" y2="96"
        stroke="#d0d8f0" strokeWidth="0.4" opacity="0.40" />
      <ellipse cx="498" cy="70" rx="6" ry="3.5"
        fill="#9098c0" opacity="0.70" />
      <path d="M 490 80 L 498 70 L 500 79 Z"
        fill="white" opacity="0.50" />
      <ellipse cx="493" cy="96" rx="7" ry="14"
        fill={`url(#${gId('crystal-glow')})`}
        opacity="0.35"
      />

      {/* Prismatic scatter on cloth below crystal */}
      {SCATTER.map(([px, py, prx, pry, pcolor, pop], pi) => (
        <ellipse key={pi}
          cx={px} cy={py} rx={prx} ry={pry}
          fill={pcolor}
          opacity={pop}
        />
      ))}

      {/* ── CANDLES — rear corners ── */}

      {/* Left candle (x=110) */}
      <g>
        <ellipse cx="110" cy="22" rx="10" ry="14"
          fill={`url(#${gId('flame')})`}
          filter={`url(#${gId('flame-glow')})`}
          opacity="0.85"
          style={{
            animationName: 'mojo-flame-main',
            animationDuration: '1.8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0s',
          }}
        />
        <ellipse cx="110" cy="26" rx="5" ry="8"
          fill={`url(#${gId('flame')})`}
          opacity="0.92"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0s',
          }}
        />
        <ellipse cx="110" cy="30" rx="2.5" ry="4"
          fill="#fff8e0" opacity="0.80"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0.15s',
          }}
        />
        <line x1="110" y1="36" x2="110" y2="32"
          stroke="#1a1008" strokeWidth="0.8" />
        <rect x="106" y="36" width="8" height="28" rx="0.5"
          fill={`url(#${gId('wax')})`} />
        <path d="M 108 42 C 107 46, 106 50, 106 55"
          stroke="#d4c8a8" strokeWidth="1.5"
          strokeLinecap="round" fill="none" opacity="0.65" />
        <ellipse cx="110" cy="64" rx="8" ry="2" fill="#8a5818" />
        <rect x="103" y="64" width="14" height="3" rx="0.5" fill="#6a4010" />
      </g>

      {/* Right candle (x=790) — staggered flame delay */}
      <g>
        <ellipse cx="790" cy="22" rx="10" ry="14"
          fill={`url(#${gId('flame')})`}
          filter={`url(#${gId('flame-glow')})`}
          opacity="0.82"
          style={{
            animationName: 'mojo-flame-main',
            animationDuration: '1.8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0.45s',
          }}
        />
        <ellipse cx="790" cy="26" rx="5" ry="8"
          fill={`url(#${gId('flame')})`}
          opacity="0.90"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0.45s',
          }}
        />
        <ellipse cx="790" cy="30" rx="2.5" ry="4"
          fill="#fff8e0" opacity="0.78"
          style={{
            animationName: 'mojo-flame-inner',
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '0.60s',
          }}
        />
        <line x1="790" y1="36" x2="790" y2="32"
          stroke="#1a1008" strokeWidth="0.8" />
        <rect x="786" y="36" width="8" height="28" rx="0.5"
          fill={`url(#${gId('wax')})`} />
        <path d="M 792 44 C 793 48, 794 52, 793 57"
          stroke="#d4c8a8" strokeWidth="1.5"
          strokeLinecap="round" fill="none" opacity="0.60" />
        <ellipse cx="790" cy="64" rx="8" ry="2" fill="#8a5818" />
        <rect x="783" y="64" width="14" height="3" rx="0.5" fill="#6a4010" />
      </g>

      {/* ── ATMOSPHERIC OVERLAYS ── */}
      <rect x="0" y="0" width="900" height="220"
        fill={`url(#${gId('vignette')})`} />
      <rect x="60" y="170" width="780" height="40" rx="4"
        fill="#000000" opacity="0.20" />
    </svg>
  )
}

// ─── MOJO-FIX-025: SvgGrimoire — The Atelier preview for Chronicle ───

const GRIMOIRE_PHASE_LABELS = [
  'Full', 'Waning G.', 'Last Q.', 'Waning C.',
  'New', 'Waxing C.', 'First Q.', 'Waxing G.',
]

const GRIMOIRE_WHEEL_SYMBOLS = ['✦', '◈', '⟡', '✧', '◆', '⟢', '✦', '◇']

const GRIMOIRE_CORNERS = [
  { cx: 30, cy: 8, xDir: 1, yDir: 1 },
  { cx: 862, cy: 8, xDir: -1, yDir: 1 },
  { cx: 30, cy: 194, xDir: 1, yDir: -1 },
  { cx: 862, cy: 194, xDir: -1, yDir: -1 },
]

const GRIMOIRE_RIBBONS = [
  { x: 380, color: '#8a1020', opacity: 0.80 },
  { x: 450, color: '#c8a020', opacity: 0.70 },
  { x: 520, color: '#1a4020', opacity: 0.65 },
]

const GRIMOIRE_FLOURISH_CORNERS = [
  { x: 472, y: 28, rx: 1, ry: -1 },
  { x: 846, y: 28, rx: -1, ry: -1 },
  { x: 472, y: 176, rx: 1, ry: 1 },
  { x: 846, y: 176, rx: -1, ry: 1 },
]

export function SvgGrimoire({
  className = '',
  idSuffix = 'gr',
}: {
  className?: string
  idSuffix?: string
}) {
  const gId = (name: string) => `${name}-${idSuffix}`

  // ── Moon phase wheel geometry ──
  const WHEEL_CX = 660
  const WHEEL_CY = 100
  const PHASE_R = 52
  const phases = Array.from({ length: 8 }, (_, i) => {
    const angle = ((i * 45 - 90) * Math.PI) / 180
    return {
      x: WHEEL_CX + PHASE_R * Math.cos(angle),
      y: WHEEL_CY + PHASE_R * Math.sin(angle),
      label: GRIMOIRE_PHASE_LABELS[i],
    }
  })
  const STAR_R = 72
  const stars = Array.from({ length: 12 }, (_, i) => ({
    x: WHEEL_CX + STAR_R * Math.cos(((i * 30 - 90) * Math.PI) / 180),
    y: WHEEL_CY + STAR_R * Math.sin(((i * 30 - 90) * Math.PI) / 180),
  }))

  // ── Quill geometry ──
  const SHAFT_START = { x: 800, y: 80 }
  const SHAFT_END = { x: 530, y: 175 }
  const dx = SHAFT_END.x - SHAFT_START.x
  const dy = SHAFT_END.y - SHAFT_START.y
  const shaftLen = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / shaftLen
  const uy = dy / shaftLen
  const px = -uy
  const py = ux
  const shaftAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI

  const BARB_COUNT = 65
  const barbs = Array.from({ length: BARB_COUNT }, (_, i) => {
    const t = i / (BARB_COUNT - 1)
    const bx = SHAFT_START.x + dx * t * 0.88
    const by = SHAFT_START.y + dy * t * 0.88
    const vaneWidth = Math.sin(t * Math.PI) * 20 + 2
    return {
      bx, by,
      lb: {
        x2: bx - px * vaneWidth - ux * 6,
        y2: by - py * vaneWidth - uy * 6,
      },
      rb: {
        x2: bx + px * vaneWidth * 0.6 + ux * 4,
        y2: by + py * vaneWidth * 0.6 + uy * 4,
      },
    }
  })

  // Pre-computed vane path strings — avoids nested template literals in JSX
  const barbSubset = barbs.slice(0, -5)
  const barbSubsetReversed = [...barbSubset].reverse()

  const leftVanePath =
    `M ${SHAFT_START.x} ${SHAFT_START.y} ` +
    barbSubset.map((b) => `L ${b.lb.x2} ${b.lb.y2}`).join(' ') +
    ` L ${SHAFT_END.x + px * 2} ${SHAFT_END.y + py * 2}` +
    ` L ${SHAFT_END.x} ${SHAFT_END.y} ` +
    barbSubsetReversed.map((b) => `L ${b.bx} ${b.by}`).join(' ') +
    ' Z'

  const rightVanePath =
    `M ${SHAFT_START.x} ${SHAFT_START.y} ` +
    barbSubset.map((b) => `L ${b.rb.x2} ${b.rb.y2}`).join(' ') +
    ` L ${SHAFT_END.x - px * 1.5} ${SHAFT_END.y - py * 1.5}` +
    ` L ${SHAFT_END.x} ${SHAFT_END.y} ` +
    barbSubsetReversed.map((b) => `L ${b.bx} ${b.by}`).join(' ') +
    ' Z'

  return (
    <svg
      width="100%"
      height="210"
      viewBox="0 0 900 210"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gId('parch-l')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#d4c4a4" />
          <stop offset="30%"  stopColor="#e0d0b0" />
          <stop offset="80%"  stopColor="#e8dcc0" />
          <stop offset="100%" stopColor="#e4d8bc" />
        </linearGradient>
        <linearGradient id={gId('parch-r')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#eee4c8" />
          <stop offset="60%"  stopColor="#ead8b8" />
          <stop offset="100%" stopColor="#d8c8a8" />
        </linearGradient>

        <linearGradient id={gId('leather')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#241408" />
          <stop offset="50%"  stopColor="#1a0e08" />
          <stop offset="100%" stopColor="#120a04" />
        </linearGradient>

        <linearGradient id={gId('bind')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a0604" stopOpacity="0.70" />
          <stop offset="50%"  stopColor="#060402" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0a0604" stopOpacity="0.70" />
        </linearGradient>

        <radialGradient id={gId('light')} cx="15%" cy="10%" r="70%">
          <stop offset="0%"   stopColor="#c87800" stopOpacity="0.16" />
          <stop offset="50%"  stopColor="#c87000" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#c86000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={gId('brass')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#c8a840" />
          <stop offset="50%"  stopColor="#a07828" />
          <stop offset="100%" stopColor="#7a5818" />
        </linearGradient>

        <radialGradient id={gId('wax')} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#c03028" />
          <stop offset="60%"  stopColor="#8a1018" />
          <stop offset="100%" stopColor="#5a0810" />
        </radialGradient>

        <linearGradient id={gId('vane-l')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0e0c08" />
          <stop offset="50%"  stopColor="#181208" />
          <stop offset="100%" stopColor="#0a0808" />
        </linearGradient>

        <filter id={gId('quill-shadow')}
          x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <radialGradient id={gId('moon-hub')} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#f0ecd8" />
          <stop offset="60%"  stopColor="#d8d0e8" />
          <stop offset="100%" stopColor="#b8b0d0" />
        </radialGradient>

        <filter id={gId('book-shadow')}
          x="-3%" y="-5%" width="106%" height="115%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <clipPath id={gId('page-l-clip')}>
          <rect x="38" y="16" width="404" height="176" />
        </clipPath>
        <clipPath id={gId('page-r-clip')}>
          <rect x="458" y="16" width="404" height="176" />
        </clipPath>
        <clipPath id={gId('book-clip')}>
          <rect x="30" y="8" width="840" height="192" rx="2" />
        </clipPath>
      </defs>

      {/* ── BOOK SHADOW ── */}
      <rect x="34" y="14" width="840" height="196" rx="3"
        fill="#000000" opacity="0.35"
        filter={`url(#${gId('book-shadow')})`} />

      {/* ── COVER ── */}
      <rect x="30" y="8" width="840" height="194" rx="2"
        fill={`url(#${gId('leather')})`} />
      {Array.from({ length: 18 }, (_, i) => (
        <line key={i}
          x1="30" y1={8 + i * 11}
          x2="870" y2={10 + i * 11}
          stroke="#0e0804" strokeWidth="0.8" opacity="0.30"
          clipPath={`url(#${gId('book-clip')})`}
        />
      ))}

      {/* ── LEFT PAGE ── */}
      <rect x="38" y="16" width="404" height="176"
        fill={`url(#${gId('parch-l')})`} />
      <rect x="38" y="16" width="404" height="176"
        fill="#8a6030" opacity="0.04" />

      {/* Margin annotations */}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i}
          x1="42" y1={30 + i * 19}
          x2={50 + (i % 3) * 3} y2={30 + i * 19}
          stroke="#1a1008" strokeWidth="0.7" opacity="0.28"
        />
      ))}

      {/* Astrological wheel */}
      <g clipPath={`url(#${gId('page-l-clip')})`}>
        <circle cx="165" cy="72" r="48"
          stroke="#1a1008" strokeWidth="1.0" opacity="0.55" fill="none" />
        <circle cx="165" cy="72" r="32"
          stroke="#1a1008" strokeWidth="0.6" opacity="0.40" fill="none" />
        <circle cx="165" cy="72" r="8"
          stroke="#1a1008" strokeWidth="0.8" opacity="0.55"
          fill="#e0d4b8" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180
          return (
            <line key={i}
              x1={165 + 8 * Math.cos(a)}
              y1={72 + 8 * Math.sin(a)}
              x2={165 + 48 * Math.cos(a)}
              y2={72 + 48 * Math.sin(a)}
              stroke="#1a1008" strokeWidth="0.6" opacity="0.38"
            />
          )
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const a = ((i * 45 + 22.5) * Math.PI) / 180
          const mx = 165 + 44 * Math.cos(a)
          const my = 72 + 44 * Math.sin(a)
          const perp = a + Math.PI / 2
          return (
            <line key={i}
              x1={mx - 3 * Math.cos(perp)}
              y1={my - 3 * Math.sin(perp)}
              x2={mx + 3 * Math.cos(perp)}
              y2={my + 3 * Math.sin(perp)}
              stroke="#1a1008" strokeWidth="0.8" opacity="0.45"
            />
          )
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const a = ((i * 45 + 22.5) * Math.PI) / 180
          const sx = 165 + 20 * Math.cos(a)
          const sy = 72 + 20 * Math.sin(a)
          return (
            <text key={i}
              x={sx} y={sy + 2.5}
              textAnchor="middle"
              fontFamily="serif"
              fontSize="7"
              fill="#1a1008"
              opacity="0.50"
              transform={`rotate(${i * 45 + 22.5} ${sx} ${sy})`}
            >
              {GRIMOIRE_WHEEL_SYMBOLS[i]}
            </text>
          )
        })}
      </g>

      {/* Text lines — section 1 */}
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i}
          d={`M 245 ${28 + i * 8}
              C 290 ${27 + i * 8 + (i % 2)},
                350 ${29 + i * 8 - (i % 3)},
                ${415 - (i % 3) * 8} ${28 + i * 8}`}
          stroke="#1a1008" strokeWidth="0.9" fill="none" opacity="0.42"
        />
      ))}

      {/* Text lines — section 2 */}
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i}
          d={`M 62 ${132 + i * 7}
              C 130 ${131 + i * 7 + (i % 2)},
                260 ${133 + i * 7 - (i % 3)},
                ${415 - (i % 4) * 6} ${132 + i * 7}`}
          stroke="#1a1008" strokeWidth="0.8" fill="none" opacity="0.38"
        />
      ))}

      {/* Text lines — section 3 (sparser) */}
      {Array.from({ length: 4 }, (_, i) => (
        <path key={i}
          d={`M 245 ${138 + i * 10}
              C 300 ${137 + i * 10},
                360 ${139 + i * 10},
                ${410 - (i % 2) * 10} ${138 + i * 10}`}
          stroke="#1a1008" strokeWidth="0.7" fill="none" opacity="0.30"
        />
      ))}

      {/* Botanical illustration */}
      <g clipPath={`url(#${gId('page-l-clip')})`}>
        <line x1="360" y1="155" x2="360" y2="185"
          stroke="#4a3018" strokeWidth="1.0" opacity="0.55" />
        {[165, 173, 181].map((y, i) => (
          <g key={i}>
            <ellipse cx={352 - i} cy={y} rx={8 - i} ry={3.5 - i * 0.5}
              stroke="#4a3018" strokeWidth="0.7" fill="none"
              opacity="0.50"
              transform={`rotate(-30 ${352 - i} ${y})`}
            />
            <ellipse cx={368 + i} cy={y} rx={8 - i} ry={3.5 - i * 0.5}
              stroke="#4a3018" strokeWidth="0.7" fill="none"
              opacity="0.50"
              transform={`rotate(30 ${368 + i} ${y})`}
            />
          </g>
        ))}
        <circle cx="360" cy="155" r="5"
          stroke="#4a3018" strokeWidth="0.7" fill="none" opacity="0.48" />
        <circle cx="360" cy="155" r="2" fill="#4a3018" opacity="0.40" />
        <text x="360" y="193"
          textAnchor="middle"
          fontFamily="EB Garamond, serif"
          fontSize="7" fontStyle="italic"
          fill="#4a3018" opacity="0.55"
        >
          Verbena off.
        </text>
      </g>

      {/* Ink blot */}
      <g clipPath={`url(#${gId('page-l-clip')})`}>
        <ellipse cx="200" cy="110" rx="10" ry="7"
          fill="#0a0808" opacity="0.45"
          transform="rotate(-15 200 110)"
        />
        <circle cx="194" cy="106" r="5" fill="#0a0808" opacity="0.38" />
        <circle cx="208" cy="114" r="4" fill="#0a0808" opacity="0.35" />
        <circle cx="188" cy="115" r="2" fill="#0a0808" opacity="0.30" />
        <circle cx="214" cy="108" r="1.5" fill="#0a0808" opacity="0.28" />
        <circle cx="198" cy="120" r="1.8" fill="#0a0808" opacity="0.25" />
      </g>

      {/* Broken wax seal */}
      <g clipPath={`url(#${gId('page-l-clip')})`}>
        <path d="M 70 185 L 110 175 L 115 190 L 70 200"
          fill="#ede0c0" opacity="0.65"
          stroke="#c0b090" strokeWidth="0.6"
        />
        <circle cx="90" cy="178" r="14"
          fill={`url(#${gId('wax')})`} opacity="0.75"
        />
        <circle cx="90" cy="178" r="12"
          stroke="#c03028" strokeWidth="0.5"
          fill="none" opacity="0.45"
        />
        {Array.from({ length: 5 }, (_, i) => {
          const a = ((i * 72 - 90) * Math.PI) / 180
          const aNext = (((i + 1) * 72 - 90) * Math.PI) / 180
          const bx = 90 + 8 * Math.cos(a)
          const by = 178 + 8 * Math.sin(a)
          const nx = 90 + 8 * Math.cos(aNext)
          const ny = 178 + 8 * Math.sin(aNext)
          return i < 4 ? (
            <line key={i}
              x1={bx} y1={by} x2={nx} y2={ny}
              stroke="#7a0810" strokeWidth="0.8" opacity="0.55"
            />
          ) : null
        })}
        <path d="M 80 170 C 85 175, 92 180, 100 185"
          stroke="#5a0808" strokeWidth="1.2"
          strokeLinecap="round" fill="none" opacity="0.55"
        />
      </g>

      {/* ── RIGHT PAGE ── */}
      <rect x="458" y="16" width="404" height="176"
        fill={`url(#${gId('parch-r')})`} />
      <rect x="458" y="16" width="404" height="176"
        fill="#8a6030" opacity="0.02" />

      {/* Corner flourishes */}
      {GRIMOIRE_FLOURISH_CORNERS.map((c, i) => (
        <path key={i}
          d={`M ${c.x} ${c.y}
              C ${c.x + c.rx * 12} ${c.y},
                ${c.x + c.rx * 18} ${c.y + c.ry * 8},
                ${c.x + c.rx * 14} ${c.y + c.ry * 14}
              C ${c.x + c.rx * 10} ${c.y + c.ry * 18},
                ${c.x + c.rx * 6} ${c.y + c.ry * 14},
                ${c.x + c.rx * 8} ${c.y + c.ry * 10}`}
          stroke="#1a1008" strokeWidth="0.8"
          fill="none" opacity="0.32"
          strokeLinecap="round"
        />
      ))}

      {/* Moon phase circle diagram */}
      <g clipPath={`url(#${gId('page-r-clip')})`}>
        <circle cx={WHEEL_CX} cy={WHEEL_CY} r="72"
          stroke="#1a1008" strokeWidth="0.8" opacity="0.45" fill="none" />

        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="1.5"
            fill="#1a1008" opacity="0.38" />
        ))}

        {phases.map((_, i) => {
          const a = ((i * 45 - 90) * Math.PI) / 180
          return (
            <line key={i}
              x1={WHEEL_CX + 18 * Math.cos(a)}
              y1={WHEEL_CY + 18 * Math.sin(a)}
              x2={WHEEL_CX + 44 * Math.cos(a)}
              y2={WHEEL_CY + 44 * Math.sin(a)}
              stroke="#1a1008" strokeWidth="0.5" opacity="0.30"
            />
          )
        })}

        {phases.map((p, i) => {
          const r = 9
          const isFull = i === 0
          const isNew = i === 4
          const isQuarter = i === 2 || i === 6
          const isGibbous = i === 1 || i === 7
          const isCrescent = i === 3 || i === 5

          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={r}
                fill={isFull ? '#d8d0e8' : '#e8e0d0'}
                stroke="#1a1008" strokeWidth="0.6" opacity="0.55"
              />
              {isNew && (
                <circle cx={p.x} cy={p.y} r={r - 0.5}
                  fill="#1a1610" opacity="0.65" />
              )}
              {isQuarter && (
                <path
                  d={i === 2
                    ? `M ${p.x} ${p.y - r} A ${r} ${r} 0 0 0 ${p.x} ${p.y + r} Z`
                    : `M ${p.x} ${p.y - r} A ${r} ${r} 0 0 1 ${p.x} ${p.y + r} Z`}
                  fill="#1a1610" opacity="0.60"
                />
              )}
              {isCrescent && (
                <circle
                  cx={i === 3 ? p.x - 4 : p.x + 4}
                  cy={p.y} r={r - 2}
                  fill="#1a1610" opacity="0.65"
                />
              )}
              {isGibbous && (
                <circle
                  cx={i === 1 ? p.x + 4 : p.x - 4}
                  cy={p.y} r={r - 4}
                  fill="#1a1610" opacity="0.55"
                />
              )}
              <text
                x={p.x + (p.x - WHEEL_CX) * 0.30}
                y={p.y + (p.y - WHEEL_CY) * 0.30 + 3}
                textAnchor="middle"
                fontFamily="EB Garamond, serif"
                fontSize="4.5" fontStyle="italic"
                fill="#1a1008" opacity="0.45"
              >
                {p.label}
              </text>
            </g>
          )
        })}

        <circle cx={WHEEL_CX} cy={WHEEL_CY} r="16"
          fill={`url(#${gId('moon-hub')})`}
          stroke="#1a1008" strokeWidth="0.8" opacity="0.70"
        />
        <circle cx={WHEEL_CX - 4} cy={WHEEL_CY - 4} r="6"
          fill="white" opacity="0.25"
        />
        <circle cx={WHEEL_CX} cy={WHEEL_CY} r="18"
          stroke="#1a1008" strokeWidth="0.5"
          fill="none" opacity="0.35"
        />
      </g>

      {/* Page number */}
      <text x="848" y="188"
        textAnchor="end"
        fontFamily="Cinzel, serif"
        fontSize="9" fill="#1a1008" opacity="0.42"
      >
        XLVII
      </text>

      {/* ── THE QUILL ── */}

      <ellipse
        cx={(SHAFT_START.x + SHAFT_END.x) / 2 + 3}
        cy={(SHAFT_START.y + SHAFT_END.y) / 2 + 4}
        rx={shaftLen / 2}
        ry={8}
        fill="#000000"
        opacity="0.18"
        transform={`rotate(${shaftAngleDeg}
          ${(SHAFT_START.x + SHAFT_END.x) / 2 + 3}
          ${(SHAFT_START.y + SHAFT_END.y) / 2 + 4})`}
        filter={`url(#${gId('quill-shadow')})`}
      />

      <path
        d={leftVanePath}
        fill={`url(#${gId('vane-l')})`}
        opacity="0.88"
        clipPath={`url(#${gId('page-r-clip')})`}
      />

      <path
        d={rightVanePath}
        fill="#201810"
        opacity="0.72"
        clipPath={`url(#${gId('page-r-clip')})`}
      />

      {barbs.filter((_, i) => i % 2 === 0).map((b, i) => (
        <g key={i}>
          <line x1={b.bx} y1={b.by} x2={b.lb.x2} y2={b.lb.y2}
            stroke="#0a0808" strokeWidth="0.5" opacity="0.20" />
          <line x1={b.bx} y1={b.by} x2={b.rb.x2} y2={b.rb.y2}
            stroke="#0a0808" strokeWidth="0.4" opacity="0.15" />
        </g>
      ))}

      <path
        d={`M ${SHAFT_START.x} ${SHAFT_START.y}
            C ${SHAFT_START.x - 60} ${SHAFT_START.y + 22},
              ${SHAFT_END.x + 60} ${SHAFT_END.y - 22},
              ${SHAFT_END.x} ${SHAFT_END.y}`}
        stroke="#0e0a06"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        clipPath={`url(#${gId('page-r-clip')})`}
      />
      <path
        d={`M ${SHAFT_START.x - 1} ${SHAFT_START.y - 1}
            C ${SHAFT_START.x - 61} ${SHAFT_START.y + 21},
              ${SHAFT_END.x + 59} ${SHAFT_END.y - 23},
              ${SHAFT_END.x - 1} ${SHAFT_END.y - 1}`}
        stroke="#3a2810"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
        clipPath={`url(#${gId('page-r-clip')})`}
      />

      <path
        d={`M ${SHAFT_END.x} ${SHAFT_END.y}
            L ${SHAFT_END.x - ux * 22} ${SHAFT_END.y - uy * 22}`}
        stroke="#4a2c14"
        strokeWidth="2.0"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
        clipPath={`url(#${gId('page-r-clip')})`}
      />

      <path
        d={`M ${SHAFT_END.x} ${SHAFT_END.y}
            L ${SHAFT_END.x - ux * 8 + px * 4} ${SHAFT_END.y - uy * 8 + py * 4}
            L ${SHAFT_END.x - ux * 14} ${SHAFT_END.y - uy * 14}
            L ${SHAFT_END.x - ux * 8 - px * 4} ${SHAFT_END.y - uy * 8 - py * 4}
            Z`}
        fill="#0a0808"
        opacity="0.85"
        clipPath={`url(#${gId('page-r-clip')})`}
      />
      <line
        x1={SHAFT_END.x}
        y1={SHAFT_END.y}
        x2={SHAFT_END.x - ux * 12}
        y2={SHAFT_END.y - uy * 12}
        stroke="#2a1808" strokeWidth="0.5" opacity="0.60"
        clipPath={`url(#${gId('page-r-clip')})`}
      />

      <ellipse
        cx={SHAFT_END.x - ux * 3 + px * 1}
        cy={SHAFT_END.y - uy * 3 + py * 1}
        rx="5" ry="3"
        fill="#050408" opacity="0.70"
        transform={`rotate(${shaftAngleDeg}
          ${SHAFT_END.x - ux * 3}
          ${SHAFT_END.y - uy * 3})`}
        clipPath={`url(#${gId('page-r-clip')})`}
      />
      <path
        d={`M ${SHAFT_END.x} ${SHAFT_END.y}
            C ${SHAFT_END.x - ux * 5 + px * 2} ${SHAFT_END.y - uy * 5 + py * 2},
              ${SHAFT_END.x - ux * 10} ${SHAFT_END.y - uy * 10},
              ${SHAFT_END.x - ux * 14 + px} ${SHAFT_END.y - uy * 14 + py}`}
        stroke="#050408" strokeWidth="0.8"
        strokeLinecap="round" fill="none" opacity="0.55"
        clipPath={`url(#${gId('page-r-clip')})`}
      />
      <circle
        cx={SHAFT_END.x + px * 6 - ux * 2}
        cy={SHAFT_END.y + py * 6 - uy * 2}
        r="1.8" fill="#050408" opacity="0.50"
        clipPath={`url(#${gId('page-r-clip')})`}
      />
      <circle
        cx={SHAFT_END.x + px * 9 - ux * 5}
        cy={SHAFT_END.y + py * 9 - uy * 5}
        r="1.2" fill="#050408" opacity="0.40"
        clipPath={`url(#${gId('page-r-clip')})`}
      />

      {/* ── BINDING AND BOOK STRUCTURE ── */}

      <rect x="442" y="8" width="16" height="194"
        fill={`url(#${gId('bind')})`} />

      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i}
          x={862 + i * 1.2}
          y={18 + i * 0.5}
          width="1.2"
          height={174 - i}
          fill={i % 2 === 0 ? '#e8dcc0' : '#d4c4a4'}
          opacity="0.70"
        />
      ))}

      {GRIMOIRE_CORNERS.map((c, i) => {
        const hx = c.xDir > 0 ? c.cx : c.cx - 16
        const hy = c.yDir > 0 ? c.cy : c.cy - 3
        const vx = c.xDir > 0 ? c.cx : c.cx - 3
        const vy = c.yDir > 0 ? c.cy : c.cy - 16
        return (
          <g key={i}>
            <rect x={hx} y={hy} width="16" height="3"
              fill={`url(#${gId('brass')})`} opacity="0.85" />
            <rect x={vx} y={vy} width="3" height="16"
              fill={`url(#${gId('brass')})`} opacity="0.85" />
            <circle
              cx={c.cx + c.xDir * 1.5}
              cy={c.cy + c.yDir * 1.5}
              r="2"
              fill="#c8a840" opacity="0.80"
            />
          </g>
        )
      })}

      {GRIMOIRE_RIBBONS.map((r, i) => (
        <g key={i}>
          <rect x={r.x - 3} y="196" width="6" height="22"
            fill={r.color} opacity={r.opacity} />
          <path
            d={`M ${r.x - 3} 218 L ${r.x} 214 L ${r.x + 3} 218`}
            fill={r.color} opacity={r.opacity}
          />
        </g>
      ))}

      <g transform="translate(862 100)">
        <path d="M 0 0 C 5 -6, 12 -6, 12 0 C 12 6, 5 6, 0 6"
          stroke="#a07828" strokeWidth="2"
          fill="none" opacity="0.70"
        />
        <rect x="-3" y="1" width="6" height="8" rx="1"
          fill="#a07828" opacity="0.65"
        />
      </g>

      {/* ── LIGHTING OVERLAY ── */}
      <rect x="30" y="8" width="840" height="194"
        fill={`url(#${gId('light')})`}
        clipPath={`url(#${gId('book-clip')})`}
      />
    </svg>
  )
}

// ─── MOJO-FIX-027: SvgWitchesAttic — The Atelier preview for Images ───

type HerbBundle = [number, number, number, number, string, string]
type AtticBottle = [number, number, number, number, string, string]
type DustMote = [number, number, number, number]

const ATTIC_HERBS: HerbBundle[] = [
  [240, 32, 14, 32, '#8a7080', '#6a5060'],
  [310, 32, 18, 42, '#6a7850', '#4a5830'],
  [400, 32, 12, 28, '#7a7040', '#5a5020'],
  [500, 32, 16, 38, '#8a7080', '#6a5060'],
  [590, 32, 14, 30, '#6a7850', '#4a5830'],
  [660, 32, 20, 44, '#7a6840', '#5a4820'],
  [130, 78, 16, 36, '#8a7080', '#6a5060'],
  [290, 78, 14, 30, '#6a6040', '#4a4020'],
  [680, 78, 18, 40, '#7a7050', '#5a5030'],
  [780, 78, 12, 26, '#8a7080', '#6a5060'],
]

const ATTIC_BOTTLES: AtticBottle[] = [
  [62, 120, 8, 38, '#1a3818', '#2a5828'],
  [72, 120, 12, 28, '#8a5010', '#b07020'],
  [86, 120, 9, 34, '#a8b8c0', '#d0e0e8'],
  [97, 120, 7, 22, '#1a1410', '#2a2418'],
  [106, 120, 11, 30, '#2a4820', '#3a6030'],
]

const ATTIC_MOTES: DustMote[] = [
  [438, 118, 1.2, 0.28],
  [462, 125, 0.9, 0.22],
  [445, 138, 1.4, 0.20],
  [470, 132, 0.8, 0.25],
  [432, 148, 1.0, 0.18],
  [458, 155, 1.3, 0.22],
  [442, 162, 0.7, 0.16],
  [465, 144, 0.9, 0.20],
  [448, 172, 1.1, 0.15],
]

const ATTIC_TRUNK_CORNERS = [
  { cx: 0, cy: 0, xDir: 1, yDir: 1 },
  { cx: 84, cy: 0, xDir: -1, yDir: 1 },
  { cx: 0, cy: 34, xDir: 1, yDir: -1 },
  { cx: 84, cy: 34, xDir: -1, yDir: -1 },
]

export function SvgWitchesAttic({
  className = '',
  idSuffix = 'wa',
}: {
  className?: string
  idSuffix?: string
}) {
  const gId = (name: string) => `${name}-${idSuffix}`

  return (
    <svg
      width="100%"
      height="220"
      viewBox="0 0 900 220"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gId('wall')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0e0c0a" />
          <stop offset="100%" stopColor="#141008" />
        </linearGradient>

        <radialGradient id={gId('moon')} cx="50%" cy="40%" r="55%">
          <stop offset="0%"   stopColor="#b8c8e0" stopOpacity="0.22" />
          <stop offset="40%"  stopColor="#a0b8d8" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#8090b0" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={gId('window')} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#d8e8f8" stopOpacity="0.85" />
          <stop offset="60%"  stopColor="#b0c8e8" stopOpacity="0.60" />
          <stop offset="100%" stopColor="#8090b0" stopOpacity="0.30" />
        </radialGradient>

        <radialGradient id={gId('lantern')} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c87800" stopOpacity="0.70" />
          <stop offset="35%"  stopColor="#c87000" stopOpacity="0.30" />
          <stop offset="70%"  stopColor="#b06000" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#a05000" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={gId('lantern-glass')} cx="40%" cy="35%" r="55%">
          <stop offset="0%"   stopColor="#f8c840" stopOpacity="0.95" />
          <stop offset="50%"  stopColor="#e09020" stopOpacity="0.80" />
          <stop offset="100%" stopColor="#a06000" stopOpacity="0.60" />
        </radialGradient>

        <linearGradient id={gId('beam')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3a2010" />
          <stop offset="50%"  stopColor="#2a1808" />
          <stop offset="100%" stopColor="#1e1004" />
        </linearGradient>

        <linearGradient id={gId('floor')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a1c10" />
          <stop offset="100%" stopColor="#1a1008" />
        </linearGradient>

        <linearGradient id={gId('trunk')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a1c10" />
          <stop offset="100%" stopColor="#180e06" />
        </linearGradient>

        <radialGradient id={gId('spectral')} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c0d8f8" stopOpacity="0.55" />
          <stop offset="60%"  stopColor="#a0c0f0" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#80a0e0" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={gId('vignette')} cx="50%" cy="50%" r="60%">
          <stop offset="45%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.72" />
        </radialGradient>

        <radialGradient id={gId('cobweb-l')} cx="0%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#c0b8a8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#c0b8a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={gId('cobweb-r')} cx="100%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#c0b8a8" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#c0b8a8" stopOpacity="0" />
        </radialGradient>

        <clipPath id={gId('scene-clip')}>
          <rect x="0" y="0" width="900" height="220" />
        </clipPath>
      </defs>

      {/* ── LAYER 1 — BACKGROUND VOID ── */}
      <rect x="0" y="0" width="900" height="220" fill="#080604" />

      {/* ── LAYER 2 — BACK WALL ── */}
      <path
        d="M 180 28 L 720 28 L 820 192 L 80 192 Z"
        fill={`url(#${gId('wall')})`}
      />
      {[50, 80, 110, 140, 165].map((y, i) => (
        <line key={i}
          x1={180 + (820 - 180) * ((y - 28) / (192 - 28)) * 0.1}
          y1={y}
          x2={720 - (720 - 180) * ((y - 28) / (192 - 28)) * 0.1}
          y2={y}
          stroke="#181410" strokeWidth="0.8" opacity="0.35"
        />
      ))}

      {/* ── LAYER 3 — CIRCULAR WINDOW ── */}
      <circle cx="450" cy="88" r="34"
        fill="#1a1610" stroke="#2a2018" strokeWidth="2"
      />
      <circle cx="450" cy="88" r="26"
        fill={`url(#${gId('window')})`}
      />
      <line x1="450" y1="62" x2="450" y2="114"
        stroke="#2a2018" strokeWidth="1.5" opacity="0.70"
      />
      <line x1="424" y1="88" x2="476" y2="88"
        stroke="#2a2018" strokeWidth="1.5" opacity="0.70"
      />
      <circle cx="450" cy="88" r="30"
        stroke="#242018" strokeWidth="1.0"
        fill="none" opacity="0.60"
      />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180
        return (
          <circle key={i}
            cx={450 + 32 * Math.cos(a)}
            cy={88 + 32 * Math.sin(a)}
            r="2"
            fill="#2a2018" opacity="0.65"
          />
        )
      })}

      {/* ── LAYER 4 — MOONLIGHT CONE ── */}
      <path
        d="M 424 114 L 330 192 L 570 192 L 476 114"
        fill="#a0b8d0" opacity="0.05"
      />
      <rect x="0" y="0" width="900" height="220"
        fill={`url(#${gId('moon')})`}
      />

      {/* ── LAYER 5 — ROOF STRUCTURE (BEAMS) ── */}
      <path d="M 0 105 L 450 0"
        stroke={`url(#${gId('beam')})`}
        strokeWidth="9" strokeLinecap="square" />
      <path d="M 900 105 L 450 0"
        stroke={`url(#${gId('beam')})`}
        strokeWidth="9" strokeLinecap="square" />

      <path d="M 100 105 L 350 32"
        stroke="#261a0a" strokeWidth="5"
        strokeLinecap="square" opacity="0.90" />
      <path d="M 800 105 L 550 32"
        stroke="#261a0a" strokeWidth="5"
        strokeLinecap="square" opacity="0.90" />

      <rect x="180" y="28" width="540" height="9"
        fill={`url(#${gId('beam')})`} />
      {[32, 35, 37].map((y, i) => (
        <line key={i} x1="185" y1={y} x2="715" y2={y}
          stroke="#1a1006" strokeWidth="0.6" opacity="0.30" />
      ))}

      <rect x="60" y="76" width="780" height="12"
        fill={`url(#${gId('beam')})`} />
      {[79, 82, 85].map((y, i) => (
        <line key={i} x1="65" y1={y} x2="835" y2={y}
          stroke="#1a1006" strokeWidth="0.6" opacity="0.28" />
      ))}
      <rect x="60" y="88" width="780" height="3"
        fill="#000000" opacity="0.20" />

      <rect x="0" y="104" width="900" height="14"
        fill={`url(#${gId('beam')})`} />
      {[107, 111, 115].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="900" y2={y}
          stroke="#1a1006" strokeWidth="0.7" opacity="0.25" />
      ))}

      {[[100, 105], [350, 32], [550, 32], [800, 105]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5"
          fill="#1e1206" stroke="#2a1a08" strokeWidth="1"
          opacity="0.80"
        />
      ))}

      {/* ── LAYER 6 — HANGING HERB BUNDLES ── */}
      {ATTIC_HERBS.map(([bx, by, w, h, col, stemCol], i) => {
        const cx = bx
        const bundleTop = by + 6
        const bundleBot = by + h
        const halfW = w / 2

        return (
          <g key={i}>
            <line x1={cx} y1={by}
              x2={cx} y2={bundleTop}
              stroke="#8a7050" strokeWidth="0.8" opacity="0.55"
            />
            <path
              d={`M ${cx} ${bundleTop}
                  C ${cx - halfW * 0.6} ${bundleTop + 4},
                    ${cx - halfW} ${bundleTop + h * 0.3},
                    ${cx - halfW * 0.8} ${bundleBot}
                  C ${cx - halfW * 0.3} ${bundleBot + 4},
                    ${cx + halfW * 0.3} ${bundleBot + 4},
                    ${cx + halfW * 0.8} ${bundleBot}
                  C ${cx + halfW} ${bundleTop + h * 0.3},
                    ${cx + halfW * 0.6} ${bundleTop + 4},
                    ${cx} ${bundleTop} Z`}
              fill={col}
              opacity="0.75"
            />
            <ellipse cx={cx} cy={bundleTop + h * 0.25}
              rx={halfW * 0.4} ry={3}
              fill="#8a7050" opacity="0.65"
            />
            {Array.from({ length: 5 }, (_, si) => {
              const sx = cx - halfW * 0.5 + si * (w * 0.22)
              return (
                <line key={si}
                  x1={sx} y1={bundleBot}
                  x2={sx + (si % 2 - 0.5) * 3}
                  y2={bundleBot + 8 + si * 1.5}
                  stroke={stemCol}
                  strokeWidth="0.8"
                  opacity="0.50"
                />
              )
            })}
          </g>
        )
      })}

      {/* ── LAYER 7 — BIRDCAGE ── */}
      <g transform="translate(570 32)">
        <line x1="15" y1="0" x2="15" y2="6"
          stroke="#3a3028" strokeWidth="0.8" opacity="0.60"
        />
        <ellipse cx="15" cy="10" rx="14" ry="4"
          stroke="#2a2418" strokeWidth="1.2"
          fill="#1a1810" opacity="0.85"
        />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180
          const topX = 15 + 14 * Math.cos(a)
          const topY = 10 + 4 * Math.sin(a)
          return (
            <path key={i}
              d={`M ${topX} ${topY} Q 15 ${10 + 22 * (1 + 0.3 * Math.abs(Math.cos(a)))} 15 44`}
              stroke="#2a2418" strokeWidth="0.8"
              fill="none" opacity="0.70"
            />
          )
        })}
        <ellipse cx="15" cy="28" rx="13" ry="3.5"
          stroke="#2a2418" strokeWidth="0.8"
          fill="none" opacity="0.60"
        />
        <ellipse cx="15" cy="44" rx="12" ry="3"
          stroke="#2a2418" strokeWidth="1.0"
          fill="#1a1810" opacity="0.80"
        />
        <ellipse cx="15" cy="28" rx="9" ry="14"
          fill={`url(#${gId('spectral')})`}
        />
        <line x1="6" y1="34" x2="24" y2="34"
          stroke="#2a2418" strokeWidth="1.0" opacity="0.55"
        />
      </g>

      {/* ── LAYER 8 — SHELF + BOTTLES ── */}
      <rect x="55" y="118" width="70" height="5"
        fill="#2a1c0c" stroke="#1a1006" strokeWidth="0.6"
      />
      <path d="M 60 118 L 60 130 L 55 130"
        stroke="#2a1c0c" strokeWidth="3"
        strokeLinecap="round" fill="none" opacity="0.70"
      />

      {ATTIC_BOTTLES.map(([bx, by, bw, bh, col, hi], i) => {
        const cx = bx + bw / 2
        return (
          <g key={i}>
            <rect x={bx} y={by - bh} width={bw} height={bh}
              rx="1.5" fill={col} opacity="0.85"
            />
            <rect x={cx - bw * 0.25} y={by - bh - 6}
              width={bw * 0.5} height="7"
              rx="1" fill={col} opacity="0.85"
            />
            {i % 2 === 0 && (
              <rect x={cx - bw * 0.2} y={by - bh - 9}
                width={bw * 0.4} height="4"
                rx="0.5" fill="#6a4820" opacity="0.80"
              />
            )}
            <line
              x1={bx + bw * 0.25} y1={by - bh + 4}
              x2={bx + bw * 0.25} y2={by - 4}
              stroke={hi} strokeWidth="1.0" opacity="0.45"
            />
            <rect x={bx + 2} y={by - 2} width={bw} height="3"
              fill="#000000" opacity="0.20" rx="1"
            />
          </g>
        )
      })}

      {/* ── LAYER 9 — FLOOR ── */}
      <rect x="0" y="192" width="900" height="28"
        fill={`url(#${gId('floor')})`}
      />
      {[195, 199, 204, 209, 214].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="900" y2={y}
          stroke="#1a1006" strokeWidth="0.8" opacity="0.45"
        />
      ))}
      {[120, 240, 370, 500, 630, 760].map((x, i) => (
        <line key={i} x1={x} y1="192" x2={x + (i % 2) * 8} y2="220"
          stroke="#140c04" strokeWidth="1.0" opacity="0.40"
        />
      ))}

      {/* ── LAYER 10 — LARGE TRUNK ── */}
      <g transform="translate(180 152)">
        <rect x="0" y="0" width="90" height="40" rx="2"
          fill={`url(#${gId('trunk')})`}
          stroke="#3a2010" strokeWidth="1.0"
        />
        <line x1="0" y1="14" x2="90" y2="14"
          stroke="#2a1808" strokeWidth="1.0" opacity="0.70"
        />
        {ATTIC_TRUNK_CORNERS.map((c, i) => {
          const hx = c.xDir > 0 ? c.cx : c.cx - 6
          const vy = c.yDir > 0 ? c.cy : c.cy - 6
          return (
            <g key={i}>
              <rect x={hx} y={c.cy} width="6" height="2"
                fill="#a07828" opacity="0.75" />
              <rect x={c.cx} y={vy} width="2" height="6"
                fill="#a07828" opacity="0.75" />
            </g>
          )
        })}
        <rect x="40" y="10" width="10" height="8" rx="1"
          fill="#8a6018" opacity="0.70"
        />
        <line x1="2" y1="7" x2="88" y2="7"
          stroke="#8a6018" strokeWidth="1.5" opacity="0.45"
        />
        <ellipse cx="45" cy="42" rx="44" ry="3"
          fill="#000000" opacity="0.30"
        />
      </g>

      {/* ── LAYER 11 — SMALL OPEN TRUNK ── */}
      <g transform="translate(640 162)">
        <rect x="0" y="0" width="65" height="30" rx="2"
          fill="#1e1408"
          stroke="#2a1808" strokeWidth="1.0"
        />
        <path d="M 0 0 L 65 0 L 65 -22 L 0 -22 Z"
          fill="#241810"
          stroke="#2a1808" strokeWidth="1.0"
          transform="skewX(-8) translate(0 -2)"
        />
        <rect x="4" y="4" width="57" height="22"
          fill="#6a5840" opacity="0.75" rx="1"
        />
        <path d="M 4 14 C 20 12, 45 16, 61 13"
          stroke="#7a6850" strokeWidth="1.2"
          fill="none" opacity="0.60"
        />
        <ellipse cx="32" cy="32" rx="32" ry="2.5"
          fill="#000000" opacity="0.25"
        />
      </g>

      {/* ── LAYER 12 — SPINNING WHEEL (partially off-canvas right) ── */}
      <g transform="translate(808 115)" opacity="0.80">
        <circle cx="45" cy="45" r="42"
          stroke="#2a1c10" strokeWidth="3"
          fill="none"
        />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 * Math.PI) / 180
          return (
            <line key={i}
              x1="45" y1="45"
              x2={45 + 39 * Math.cos(a)}
              y2={45 + 39 * Math.sin(a)}
              stroke="#2a1c10" strokeWidth="1.5"
              opacity="0.80"
            />
          )
        })}
        <circle cx="45" cy="45" r="5"
          fill="#2a1c10" opacity="0.85"
        />
        <line x1="45" y1="45" x2="0" y2="25"
          stroke="#241808" strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="0" cy="25" r="4"
          fill="#241808" opacity="0.80"
        />
        <ellipse cx="22" cy="52" rx="22" ry="6"
          stroke="#3a2810" strokeWidth="1.0"
          fill="none" opacity="0.55"
        />
        <line x1="22" y1="88" x2="22" y2="25"
          stroke="#2a1c10" strokeWidth="3"
          strokeLinecap="round"
        />
        <line x1="0" y1="88" x2="65" y2="88"
          stroke="#2a1c10" strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* ── LAYER 13 — SCROLLS + BOOKS ── */}
      <g>
        <rect x="55" y="168" width="45" height="24" rx="1"
          fill="#1e1010" stroke="#2a1410" strokeWidth="0.8"
        />
        <rect x="58" y="155" width="40" height="14" rx="1"
          fill="#10181a" stroke="#182028" strokeWidth="0.8"
        />
        <rect x="60" y="145" width="42" height="11" rx="1"
          fill="#1a1810" stroke="#281c08" strokeWidth="0.8"
        />
        <line x1="62" y1="173" x2="90" y2="173"
          stroke="#c8a840" strokeWidth="0.6" opacity="0.45"
        />
        <line x1="61" y1="160" x2="88" y2="160"
          stroke="#c8a840" strokeWidth="0.5" opacity="0.40"
        />
        <rect x="55" y="134" width="35" height="10" rx="4"
          fill="#d8c8a0" stroke="#b8a880" strokeWidth="0.7"
          opacity="0.80"
        />
        <ellipse cx="55" cy="139" rx="5" ry="5"
          fill="#c8b890" opacity="0.85"
        />
        <ellipse cx="90" cy="139" rx="5" ry="5"
          fill="#c8b890" opacity="0.85"
        />
        <line x1="72" y1="134" x2="72" y2="144"
          stroke="#8a7040" strokeWidth="1.5" opacity="0.60"
        />
        <rect x="96" y="148" width="10" height="40" rx="4"
          fill="#d4c498" stroke="#b4a878" strokeWidth="0.7"
          opacity="0.75"
          transform="rotate(12 101 168)"
        />
      </g>

      {/* ── LAYER 14 — BRASS LANTERN ── */}
      <g transform="translate(272 140)">
        <ellipse cx="18" cy="18" rx="55" ry="40"
          fill={`url(#${gId('lantern')})`}
        />
        <rect x="4" y="44" width="28" height="4" rx="1"
          fill="#8a6018" opacity="0.90"
        />
        <path d="M 8 12 L 28 12 L 32 44 L 4 44 Z"
          fill={`url(#${gId('lantern-glass')})`}
          opacity="0.85"
        />
        <line x1="8" y1="12" x2="4" y2="44"
          stroke="#7a5010" strokeWidth="1.5" opacity="0.80"
        />
        <line x1="28" y1="12" x2="32" y2="44"
          stroke="#7a5010" strokeWidth="1.5" opacity="0.80"
        />
        <path d="M 6 12 L 18 2 L 30 12 Z"
          fill="#8a6018" opacity="0.85"
        />
        <ellipse cx="18" cy="2" rx="4" ry="2"
          stroke="#a07828" strokeWidth="1.2"
          fill="none" opacity="0.75"
        />
        <rect x="10" y="15" width="5" height="26" rx="1"
          fill="#f8e080" opacity="0.30"
        />
        <line x1="4" y1="28" x2="32" y2="28"
          stroke="#7a5010" strokeWidth="1.0" opacity="0.65"
        />
        <ellipse cx="18" cy="49" rx="16" ry="3"
          fill="#000000" opacity="0.35"
        />
      </g>

      {/* ── LAYER 15 — COBWEBS ── */}
      <g opacity="0.32">
        <path d="M 0 0 L 70 0 L 0 55 Z"
          fill={`url(#${gId('cobweb-l')})`}
        />
        {[8, 18, 28, 38, 48, 60].map((x, i) => (
          <line key={i}
            x1="0" y1={i * 9} x2={x} y2="0"
            stroke="#c0b8a8" strokeWidth="0.5" opacity="0.40"
          />
        ))}
        {[8, 18, 28, 40, 52].map((y, i) => (
          <path key={i}
            d={`M 0 ${y} C ${y * 0.35} ${y - 2}, ${y * 0.7} ${y * 0.35}, ${y} 0`}
            stroke="#c0b8a8" strokeWidth="0.4"
            fill="none" opacity="0.28"
          />
        ))}
      </g>
      <g opacity="0.26" transform="translate(900 0) scale(-1 1)">
        <path d="M 0 0 L 55 0 L 0 42 Z"
          fill={`url(#${gId('cobweb-r')})`}
        />
        {[6, 14, 22, 32, 42, 52].map((x, i) => (
          <line key={i}
            x1="0" y1={i * 7} x2={x} y2="0"
            stroke="#c0b8a8" strokeWidth="0.5" opacity="0.38"
          />
        ))}
      </g>
      <path
        d="M 350 32 C 370 50, 400 60, 420 55"
        stroke="#c0b8a8" strokeWidth="0.5"
        fill="none" opacity="0.22"
      />

      {/* ── LAYER 16 — DUST MOTES ── */}
      {ATTIC_MOTES.map(([mx, my, r, op], i) => (
        <circle key={i}
          cx={mx} cy={my} r={r}
          fill="#c8d8f0" opacity={op}
        />
      ))}

      {/* ── LAYER 17 — ATMOSPHERIC OVERLAYS (rendered last) ── */}
      <rect x="0" y="0" width="900" height="220"
        fill={`url(#${gId('vignette')})`}
      />
      <path d="M 0 0 L 180 28 L 80 192 L 0 192 Z"
        fill="#000000" opacity="0.45"
      />
      <path d="M 900 0 L 720 28 L 820 192 L 900 192 Z"
        fill="#000000" opacity="0.40"
      />
      <rect x="80" y="188" width="740" height="6"
        fill="#000000" opacity="0.30"
      />
    </svg>
  )
}

export function SvgPortraitHall({
  className = '',
  idSuffix = 'ph',
}: {
  className?: string
  idSuffix?: string
}) {
  const gId = (name: string) => `${name}-${idSuffix}`

  // Portrait data — fully typed
  type Portrait = {
    id: string
    cx: number; cy: number; w: number; h: number
    shape: 'rect' | 'oval'
    fw: number        // frame border width
    bg: string        // canvas background color
    skin: string      // face skin tone
    shadow: string    // shadow side color
    eyeColor: string
    frameStyle: 'baroque'|'gothic'|'neoclassical'|'rope'|'victorian'
  }

  const portraits: Portrait[] = [
    // Top row
    { id:'p1', cx:148, cy:70,  w:88,  h:98,  shape:'oval', fw:9,
      bg:'#1e1018', skin:'#d8b898', shadow:'#8a5838', eyeColor:'#2a1a10',
      frameStyle:'victorian' },
    { id:'p2', cx:450, cy:62,  w:112, h:102, shape:'rect', fw:12,
      bg:'#1a1040', skin:'#e0d0c0', shadow:'#b09880', eyeColor:'#1a1428',
      frameStyle:'gothic' },
    { id:'p3', cx:752, cy:70,  w:88,  h:98,  shape:'oval', fw:9,
      bg:'#0e0c14', skin:'#a87858', shadow:'#502808', eyeColor:'#100808',
      frameStyle:'victorian' },
    // Main row
    { id:'p4', cx:188, cy:152, w:92,  h:116, shape:'rect', fw:10,
      bg:'#181c24', skin:'#c8b8a0', shadow:'#887060', eyeColor:'#1a1818',
      frameStyle:'neoclassical' },
    { id:'p5', cx:360, cy:155, w:108, h:124, shape:'rect', fw:14,
      bg:'#0e0806', skin:'#c8a880', shadow:'#1a0e08', eyeColor:'#0e0808',
      frameStyle:'baroque' },
    { id:'p6', cx:540, cy:155, w:108, h:124, shape:'rect', fw:11,
      bg:'#1a2830', skin:'#d4b090', shadow:'#8a5830', eyeColor:'#1a1010',
      frameStyle:'rope' },
    { id:'p7', cx:712, cy:152, w:92,  h:116, shape:'rect', fw:10,
      bg:'#201818', skin:'#c0a888', shadow:'#785840', eyeColor:'#181410',
      frameStyle:'neoclassical' },
  ]

  // Helper: render a painted face within a canvas area
  // cx/cy = center of canvas, cw/ch = canvas width/height
  // The face is built from layered ellipses suggesting oil paint
  function renderFace(
    p: Portrait,
    cx: number, cy: number, cw: number, ch: number,
    clipId: string
  ) {
    const faceW = cw * 0.55
    const faceH = ch * 0.70
    const isChairo = p.frameStyle === 'baroque' && p.bg === '#0e0806'

    return (
      <g clipPath={`url(#${clipId})`}>
        {/* Face base — warm skin ellipse */}
        <ellipse cx={cx} cy={cy + ch*0.05}
          rx={faceW * 0.5} ry={faceH * 0.5}
          fill={p.skin} opacity="0.82"
        />
        {/* Shadow side — left or right depending on portrait */}
        <ellipse
          cx={cx + (isChairo ? -faceW*0.15 : faceW*0.12)}
          cy={cy + ch*0.05}
          rx={faceW * 0.38}
          ry={faceH * 0.50}
          fill={p.shadow}
          opacity={isChairo ? "0.75" : "0.45"}
        />
        {/* Neck suggestion */}
        <ellipse cx={cx} cy={cy + faceH*0.52}
          rx={faceW * 0.18} ry={ch * 0.12}
          fill={p.skin} opacity="0.55"
        />
        {/* Eyes — two subtle dark ellipses */}
        <ellipse
          cx={cx - faceW*0.14} cy={cy - faceH*0.06}
          rx={faceW * 0.09} ry={faceH * 0.04}
          fill={p.eyeColor} opacity="0.60"
        />
        <ellipse
          cx={cx + faceW*0.14} cy={cy - faceH*0.06}
          rx={faceW * 0.09} ry={faceH * 0.04}
          fill={p.eyeColor} opacity="0.55"
        />
        {/* Brow shadows */}
        <ellipse
          cx={cx - faceW*0.14} cy={cy - faceH*0.12}
          rx={faceW * 0.11} ry={faceH * 0.025}
          fill={p.shadow} opacity="0.30"
        />
        <ellipse
          cx={cx + faceW*0.14} cy={cy - faceH*0.12}
          rx={faceW * 0.10} ry={faceH * 0.025}
          fill={p.shadow} opacity="0.28"
        />
        {/* Nose bridge — subtle vertical shadow */}
        <ellipse cx={cx} cy={cy + faceH*0.06}
          rx={faceW * 0.04} ry={faceH * 0.09}
          fill={p.shadow} opacity="0.18"
        />
        {/* Lips suggestion */}
        <ellipse cx={cx} cy={cy + faceH*0.24}
          rx={faceW * 0.14} ry={faceH * 0.04}
          fill={p.shadow} opacity="0.28"
        />
        {/* Painted canvas texture — varnish crackle suggestion */}
        <line
          x1={cx - cw*0.4} y1={cy - ch*0.4}
          x2={cx + cw*0.3} y2={cy + ch*0.4}
          stroke={p.skin} strokeWidth="0.5" opacity="0.06"
        />
        <line
          x1={cx + cw*0.3} y1={cy - ch*0.4}
          x2={cx - cw*0.2} y2={cy + ch*0.4}
          stroke={p.skin} strokeWidth="0.4" opacity="0.04"
        />
      </g>
    )
  }

  return (
    <svg
      width="100%"
      height="210"
      viewBox="0 0 900 210"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        {/* ── WALL PANELING ── */}
        <linearGradient id={gId('wall')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#141008" />
          <stop offset="100%" stopColor="#0e0c06" />
        </linearGradient>

        {/* ── GILT FRAME GOLD ── */}
        <linearGradient id={gId('gilt')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#7a5010" />
          <stop offset="25%"  stopColor="#c8a840" />
          <stop offset="50%"  stopColor="#f0d060" />
          <stop offset="75%"  stopColor="#c8a840" />
          <stop offset="100%" stopColor="#6a4008" />
        </linearGradient>
        <linearGradient id={gId('gilt-v')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f0d060" />
          <stop offset="50%"  stopColor="#c8a840" />
          <stop offset="100%" stopColor="#7a5010" />
        </linearGradient>
        <linearGradient id={gId('gilt-dark')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#4a2c08" />
          <stop offset="50%"  stopColor="#8a6018" />
          <stop offset="100%" stopColor="#3a2006" />
        </linearGradient>

        {/* ── SCONCE GLOW (warm amber per portrait) ── */}
        <radialGradient id={gId('sconce')} cx="50%" cy="0%" r="80%">
          <stop offset="0%"   stopColor="#c87800" stopOpacity="0.45" />
          <stop offset="40%"  stopColor="#c87000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c86000" stopOpacity="0" />
        </radialGradient>

        {/* ── NAMEPLATE (brass) ── */}
        <linearGradient id={gId('brass')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#6a4808" />
          <stop offset="40%"  stopColor="#a07828" />
          <stop offset="60%"  stopColor="#c8a040" />
          <stop offset="100%" stopColor="#6a4808" />
        </linearGradient>

        {/* ── VIGNETTE ── */}
        <radialGradient id={gId('vignette')} cx="50%" cy="50%" r="60%">
          <stop offset="40%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
        </radialGradient>

        {/* ── CANVAS CLIP PATHS (one per portrait) ── */}
        {portraits.map(p => {
          const left  = p.cx - p.w/2 + p.fw
          const top   = p.cy - p.h/2 + p.fw
          const cw    = p.w - p.fw*2
          const ch    = p.h - p.fw*2
          return p.shape === 'oval' ? (
            <clipPath key={p.id} id={gId(`clip-${p.id}`)}>
              <ellipse cx={p.cx} cy={p.cy} rx={cw/2} ry={ch/2} />
            </clipPath>
          ) : (
            <clipPath key={p.id} id={gId(`clip-${p.id}`)}>
              <rect x={left} y={top} width={cw} height={ch} />
            </clipPath>
          )
        })}
      </defs>

      {/* ══════════════════════════════════════
          LAYER 1 — DARK WOOD WALL
          ══════════════════════════════════════ */}
      <rect x="0" y="0" width="900" height="210"
        fill={`url(#${gId('wall')})`}
      />
      {/* Vertical panel lines — wood paneling */}
      {[90, 180, 270, 360, 450, 540, 630, 720, 810].map((x, i) => (
        <line key={i} x1={x} y1="0" x2={x} y2="210"
          stroke="#1e1a0e" strokeWidth="1.5" opacity="0.40"
        />
      ))}
      {/* Raised molding — horizontal rails */}
      <rect x="0" y="8"   width="900" height="2"
        fill="#1e1a0e" opacity="0.45" />
      <rect x="0" y="200" width="900" height="2"
        fill="#1e1a0e" opacity="0.45" />

      {/* ══════════════════════════════════════
          LAYER 2 — FRIEZE (top decorative band)
          ══════════════════════════════════════ */}
      <rect x="0" y="0" width="900" height="10"
        fill="#181408" />
      <line x1="0" y1="10" x2="900" y2="10"
        stroke="#c8a840" strokeWidth="0.8" opacity="0.30" />
      {/* Egg-and-dart motif — alternating ovals and dashes */}
      {Array.from({ length: 36 }, (_, i) => (
        i % 2 === 0 ? (
          <ellipse key={i}
            cx={12 + i * 25} cy="5" rx="6" ry="3"
            fill="#c8a840" opacity="0.18"
          />
        ) : (
          <line key={i}
            x1={12 + i * 25} y1="3"
            x2={12 + i * 25} y2="7"
            stroke="#c8a840" strokeWidth="1.5" opacity="0.14"
          />
        )
      ))}

      {/* ══════════════════════════════════════
          LAYER 3 — SCONCE GLOWS (behind frames)
          ══════════════════════════════════════ */}
      {portraits.map(p => (
        <ellipse key={p.id}
          cx={p.cx}
          cy={p.cy - p.h/2 - 5}
          rx={p.w * 0.65}
          ry={p.h * 0.60}
          fill={`url(#${gId('sconce')})`}
        />
      ))}

      {/* ══════════════════════════════════════
          LAYER 4 — FRAMES
          Each frame rendered in its own style
          ══════════════════════════════════════ */}
      {portraits.map(p => {
        const left   = p.cx - p.w/2
        const top    = p.cy - p.h/2
        const right  = p.cx + p.w/2
        const bottom = p.cy + p.h/2
        const fw = p.fw

        if (p.frameStyle === 'victorian' && p.shape === 'oval') {
          // Victorian oval frame
          return (
            <g key={p.id}>
              {/* Outer oval — dark base */}
              <ellipse cx={p.cx} cy={p.cy}
                rx={p.w/2} ry={p.h/2}
                fill={`url(#${gId('gilt-dark')})`}
                stroke="#3a2808" strokeWidth="1.0"
              />
              {/* Gilt middle ring */}
              <ellipse cx={p.cx} cy={p.cy}
                rx={p.w/2 - 2} ry={p.h/2 - 2}
                stroke={`url(#${gId('gilt')})`}
                strokeWidth="4" fill="none"
              />
              {/* Inner ring */}
              <ellipse cx={p.cx} cy={p.cy}
                rx={p.w/2 - 7} ry={p.h/2 - 7}
                stroke="#c8a840" strokeWidth="0.8"
                fill="none" opacity="0.50"
              />
              {/* Floral ornament top */}
              <ellipse cx={p.cx} cy={top + 2}
                rx="8" ry="5"
                fill={`url(#${gId('gilt')})`} opacity="0.80"
              />
              <ellipse cx={p.cx} cy={top + 2}
                rx="4" ry="3"
                fill="#f0d060" opacity="0.60"
              />
              {/* Floral ornament bottom */}
              <ellipse cx={p.cx} cy={bottom - 2}
                rx="8" ry="5"
                fill={`url(#${gId('gilt')})`} opacity="0.75"
              />
            </g>
          )
        }

        if (p.frameStyle === 'gothic') {
          // Gothic arch frame — pointed top
          const archH = 22  // how far arch apex extends above frame top
          return (
            <g key={p.id}>
              {/* Frame body — rect */}
              <rect x={left} y={top} width={p.w} height={p.h}
                fill={`url(#${gId('gilt-dark')})`}
                stroke="#3a2808" strokeWidth="1.0"
              />
              {/* Gilt border — inner */}
              <rect x={left+2} y={top+2}
                width={p.w-4} height={p.h-4}
                stroke={`url(#${gId('gilt')})`}
                strokeWidth="5" fill="none"
              />
              {/* Gothic arch apex above frame */}
              <path
                d={`M ${left+4} ${top}
                    Q ${left+4} ${top-archH*0.8}
                      ${p.cx} ${top-archH}
                    Q ${right-4} ${top-archH*0.8}
                      ${right-4} ${top}`}
                stroke={`url(#${gId('gilt')})`}
                strokeWidth="5" fill={`url(#${gId('gilt-dark')})`}
              />
              {/* Tracery in arch */}
              <path
                d={`M ${p.cx - 10} ${top}
                    Q ${p.cx - 10} ${top-archH*0.5}
                      ${p.cx} ${top-archH*0.8}
                    Q ${p.cx + 10} ${top-archH*0.5}
                      ${p.cx + 10} ${top}`}
                stroke="#c8a840" strokeWidth="0.8"
                fill="none" opacity="0.55"
              />
              {/* Keystone at arch apex */}
              <ellipse cx={p.cx} cy={top - archH}
                rx="6" ry="4"
                fill={`url(#${gId('gilt')})`} opacity="0.85"
              />
              {/* Corner column capitals */}
              {[[left, top],[right, top]].map(([cx2, cy2], i) => (
                <ellipse key={i}
                  cx={cx2} cy={cy2}
                  rx="6" ry="4"
                  fill={`url(#${gId('gilt')})`} opacity="0.75"
                />
              ))}
              {/* Base molding */}
              <rect x={left} y={bottom-4}
                width={p.w} height="4"
                fill={`url(#${gId('gilt')})`} opacity="0.65"
              />
            </g>
          )
        }

        if (p.frameStyle === 'baroque') {
          return (
            <g key={p.id}>
              {/* Heavy outer rect — darkest gold */}
              <rect x={left} y={top} width={p.w} height={p.h}
                fill={`url(#${gId('gilt-dark')})`}
                stroke="#3a2808" strokeWidth="1.5"
              />
              {/* Wide gilt border — the heavy baroque bulk */}
              <rect x={left+2} y={top+2}
                width={p.w-4} height={p.h-4}
                stroke={`url(#${gId('gilt')})`}
                strokeWidth="8" fill="none"
              />
              {/* Inner bright line */}
              <rect x={left + fw - 2} y={top + fw - 2}
                width={p.w - (fw-2)*2} height={p.h - (fw-2)*2}
                stroke="#f0d060" strokeWidth="0.8"
                fill="none" opacity="0.55"
              />
              {/* Corner scrollwork — circles at each corner */}
              {[
                [left+fw*0.5, top+fw*0.5],
                [right-fw*0.5, top+fw*0.5],
                [left+fw*0.5, bottom-fw*0.5],
                [right-fw*0.5, bottom-fw*0.5],
              ].map(([scx, scy], i) => (
                <g key={i}>
                  <circle cx={scx} cy={scy} r={fw*0.38}
                    fill={`url(#${gId('gilt')})`} opacity="0.85" />
                  <circle cx={scx} cy={scy} r={fw*0.20}
                    fill="#f0d060" opacity="0.60" />
                </g>
              ))}
              {/* Cartouche — top center ornament */}
              <path
                d={`M ${p.cx-12} ${top+3}
                    C ${p.cx-12} ${top-6},
                      ${p.cx+12} ${top-6},
                      ${p.cx+12} ${top+3}`}
                fill={`url(#${gId('gilt')})`}
                stroke="#c8a840" strokeWidth="0.8"
                opacity="0.80"
              />
              <ellipse cx={p.cx} cy={top-3}
                rx="5" ry="4"
                fill="#f0d060" opacity="0.65"
              />
            </g>
          )
        }

        if (p.frameStyle === 'rope') {
          // Rope-twist frame — diagonal line pattern on border
          return (
            <g key={p.id}>
              <rect x={left} y={top} width={p.w} height={p.h}
                fill={`url(#${gId('gilt-dark')})`}
                stroke="#3a2808" strokeWidth="1.0"
              />
              {/* Rope twist — diagonal lines along each side */}
              {/* Top edge diagonals */}
              {Array.from({ length: Math.floor(p.w / 7) }, (_, i) => (
                <line key={i}
                  x1={left + i * 7} y1={top}
                  x2={left + i * 7 + fw} y2={top + fw}
                  stroke="#c8a840" strokeWidth="1.2" opacity="0.55"
                />
              ))}
              {/* Bottom edge */}
              {Array.from({ length: Math.floor(p.w / 7) }, (_, i) => (
                <line key={i}
                  x1={left + i * 7} y1={bottom}
                  x2={left + i * 7 + fw} y2={bottom - fw}
                  stroke="#c8a840" strokeWidth="1.2" opacity="0.50"
                />
              ))}
              {/* Left edge */}
              {Array.from({ length: Math.floor(p.h / 7) }, (_, i) => (
                <line key={i}
                  x1={left} y1={top + i * 7}
                  x2={left + fw} y2={top + i * 7 + fw}
                  stroke="#c8a840" strokeWidth="1.2" opacity="0.50"
                />
              ))}
              {/* Right edge */}
              {Array.from({ length: Math.floor(p.h / 7) }, (_, i) => (
                <line key={i}
                  x1={right} y1={top + i * 7}
                  x2={right - fw} y2={top + i * 7 + fw}
                  stroke="#c8a840" strokeWidth="1.2" opacity="0.50"
                />
              ))}
              {/* Corner bosses */}
              {[
                [left, top], [right, top],
                [left, bottom], [right, bottom],
              ].map(([bx, by], i) => (
                <circle key={i} cx={bx} cy={by} r="6"
                  fill={`url(#${gId('gilt')})`} opacity="0.80"
                />
              ))}
              {/* Outer bright line */}
              <rect x={left} y={top} width={p.w} height={p.h}
                stroke="#c8a840" strokeWidth="0.8"
                fill="none" opacity="0.45"
              />
              {/* Inner bright line */}
              <rect x={left+fw} y={top+fw}
                width={p.w - fw*2} height={p.h - fw*2}
                stroke="#c8a840" strokeWidth="0.6"
                fill="none" opacity="0.40"
              />
            </g>
          )
        }

        if (p.frameStyle === 'neoclassical') {
          return (
            <g key={p.id}>
              {/* Stepped profile — two concentric rects */}
              <rect x={left} y={top} width={p.w} height={p.h}
                fill={`url(#${gId('gilt-dark')})`}
                stroke="#3a2808" strokeWidth="1.0"
              />
              <rect x={left+3} y={top+3}
                width={p.w-6} height={p.h-6}
                stroke={`url(#${gId('gilt')})`}
                strokeWidth="4" fill="none"
              />
              <rect x={left+7} y={top+7}
                width={p.w-14} height={p.h-14}
                stroke={`url(#${gId('gilt-dark')})`}
                strokeWidth="2" fill="none"
              />
              {/* Laurel wreath at top center */}
              {/* Left leaf cluster */}
              {[-14,-8,-2].map((dx, i) => (
                <ellipse key={i}
                  cx={p.cx + dx} cy={top + fw*0.5}
                  rx={4 - i*0.5} ry={2.5}
                  fill="#c8a840" opacity={0.55 - i*0.08}
                  transform={`rotate(${-30 + i*15} ${p.cx + dx} ${top + fw*0.5})`}
                />
              ))}
              {/* Right leaf cluster */}
              {[2,8,14].map((dx, i) => (
                <ellipse key={i}
                  cx={p.cx + dx} cy={top + fw*0.5}
                  rx={3.5 - i*0.3} ry={2.5}
                  fill="#c8a840" opacity={0.55 - i*0.08}
                  transform={`rotate(${30 - i*15} ${p.cx + dx} ${top + fw*0.5})`}
                />
              ))}
              {/* Center bow */}
              <circle cx={p.cx} cy={top + fw*0.5}
                r="3" fill="#f0d060" opacity="0.65"
              />
            </g>
          )
        }

        return null
      })}

      {/* ══════════════════════════════════════
          LAYER 5 — CANVAS BACKGROUNDS
          (the painted surface, within each frame)
          ══════════════════════════════════════ */}
      {portraits.map(p => {
        const left = p.cx - p.w/2 + p.fw
        const top  = p.cy - p.h/2 + p.fw
        const cw   = p.w - p.fw*2
        const ch   = p.h - p.fw*2
        const clipId = gId(`clip-${p.id}`)

        return p.shape === 'oval' ? (
          <ellipse key={p.id}
            cx={p.cx} cy={p.cy}
            rx={cw/2} ry={ch/2}
            fill={p.bg}
            clipPath={`url(#${clipId})`}
          />
        ) : (
          <rect key={p.id}
            x={left} y={top} width={cw} height={ch}
            fill={p.bg}
            clipPath={`url(#${clipId})`}
          />
        )
      })}

      {/* ══════════════════════════════════════
          LAYER 6 — PAINTED FACES
          ══════════════════════════════════════ */}
      {portraits.map(p => {
        const cw = p.w - p.fw*2
        const ch = p.h - p.fw*2
        return (
          <g key={p.id}>
            {renderFace(p, p.cx, p.cy, cw, ch, gId(`clip-${p.id}`))}
          </g>
        )
      })}

      {/* ══════════════════════════════════════
          LAYER 7 — NAMEPLATES
          ══════════════════════════════════════ */}
      {portraits.map(p => {
        const plateW = p.w * 0.58
        const plateH = 7
        const plateX = p.cx - plateW/2
        const plateY = p.cy + p.h/2 + 5

        return (
          <g key={p.id}>
            <rect x={plateX} y={plateY}
              width={plateW} height={plateH}
              rx="0.5"
              fill={`url(#${gId('brass')})`}
              opacity="0.80"
            />
            {/* Text suggestion lines */}
            <line x1={plateX+5} y1={plateY+2.5}
              x2={plateX+plateW-5} y2={plateY+2.5}
              stroke="#ede0c0" strokeWidth="0.8" opacity="0.20"
            />
            <line x1={plateX+10} y1={plateY+4.5}
              x2={plateX+plateW-10} y2={plateY+4.5}
              stroke="#ede0c0" strokeWidth="0.6" opacity="0.14"
            />
          </g>
        )
      })}

      {/* ══════════════════════════════════════
          LAYER 8 — SCONCE FIXTURES
          (small bracket + glow above each frame)
          ══════════════════════════════════════ */}
      {portraits.map(p => {
        const scX = p.cx
        const scY = p.cy - p.h/2 - 8

        return (
          <g key={p.id}>
            {/* Bracket arm */}
            <path
              d={`M ${scX} ${scY + 6}
                  C ${scX - 4} ${scY + 4},
                    ${scX - 5} ${scY + 1},
                    ${scX} ${scY}`}
              stroke="#8a6018" strokeWidth="1.5"
              fill="none" opacity="0.70"
            />
            {/* Wall mount */}
            <rect x={scX-4} y={scY+4}
              width="8" height="4" rx="1"
              fill="#6a4810" opacity="0.65"
            />
            {/* Flame/bulb glow */}
            <ellipse cx={scX} cy={scY}
              rx="4" ry="5"
              fill="#f0c840" opacity="0.55"
            />
            <ellipse cx={scX} cy={scY}
              rx="2" ry="3"
              fill="#fff8e0" opacity="0.70"
            />
          </g>
        )
      })}

      {/* ══════════════════════════════════════
          LAYER 9 — VIGNETTE
          ══════════════════════════════════════ */}
      <rect x="0" y="0" width="900" height="210"
        fill={`url(#${gId('vignette')})`}
      />
      {/* Floor shadow at bottom */}
      <rect x="0" y="200" width="900" height="10"
        fill="#000000" opacity="0.45"
      />

    </svg>
  )
}
