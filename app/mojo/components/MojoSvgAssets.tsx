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

// ── Portrait Gallery SVGs (MOJO-7E) ──────────────────────

export function SvgPortraitFrame({
  width = 200,
  height = 260,
  color = 'currentColor',
  idSuffix = 'fc',
}: {
  width?: number
  height?: number
  color?: string
  idSuffix?: string
}) {
  const strokeW = 1.2
  const inset = 6   // inner rule inset from outer frame
  const rosette = 8  // rosette radius at corners

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ pointerEvents: 'none' }}
    >
      {/* Outer frame rectangle */}
      <rect
        x={2} y={2}
        width={width - 4} height={height - 4}
        stroke={color}
        strokeWidth={strokeW}
        opacity="0.55"
        rx="1"
      />

      {/* Inner ruled line — the classic portrait frame double border */}
      <rect
        x={inset} y={inset}
        width={width - inset * 2} height={height - inset * 2}
        stroke={color}
        strokeWidth={strokeW * 0.6}
        opacity="0.30"
        rx="0.5"
      />

      {/* Corner rosettes — circular flourishes at all four corners */}
      {/* Top-left */}
      <circle cx={inset} cy={inset} r={rosette * 0.5}
        stroke={color} strokeWidth={strokeW * 0.5} opacity="0.45" />
      <circle cx={inset} cy={inset} r={rosette * 0.2}
        fill={color} opacity="0.30" />
      {/* Top-right */}
      <circle cx={width - inset} cy={inset} r={rosette * 0.5}
        stroke={color} strokeWidth={strokeW * 0.5} opacity="0.45" />
      <circle cx={width - inset} cy={inset} r={rosette * 0.2}
        fill={color} opacity="0.30" />
      {/* Bottom-left */}
      <circle cx={inset} cy={height - inset} r={rosette * 0.5}
        stroke={color} strokeWidth={strokeW * 0.5} opacity="0.45" />
      <circle cx={inset} cy={height - inset} r={rosette * 0.2}
        fill={color} opacity="0.30" />
      {/* Bottom-right */}
      <circle cx={width - inset} cy={height - inset} r={rosette * 0.5}
        stroke={color} strokeWidth={strokeW * 0.5} opacity="0.45" />
      <circle cx={width - inset} cy={height - inset} r={rosette * 0.2}
        fill={color} opacity="0.30" />

      {/* Mid-point ornaments on each side — small diamond pips */}
      {/* Top center */}
      <rect x={width/2 - 3} y={0} width={6} height={6}
        transform={`rotate(45 ${width/2} 3)`}
        fill={color} opacity="0.25" />
      {/* Bottom center */}
      <rect x={width/2 - 3} y={height - 6} width={6} height={6}
        transform={`rotate(45 ${width/2} ${height - 3})`}
        fill={color} opacity="0.25" />
      {/* Left center */}
      <rect x={0} y={height/2 - 3} width={6} height={6}
        transform={`rotate(45 3 ${height/2})`}
        fill={color} opacity="0.25" />
      {/* Right center */}
      <rect x={width - 6} y={height/2 - 3} width={6} height={6}
        transform={`rotate(45 ${width - 3} ${height/2})`}
        fill={color} opacity="0.25" />
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
        strokeOpacity="0.04" fill="none" />
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
