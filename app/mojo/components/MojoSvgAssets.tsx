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
