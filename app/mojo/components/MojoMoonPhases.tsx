'use client'

function getLunarPhaseIndex(): number {
  // Returns 0–7 representing the 8 named phases.
  // 0 = New Moon, 4 = Full Moon.
  // Based on a known new moon reference date.
  const knownNewMoon = new Date('2000-01-06T18:14:00Z')
  const synodicMonth = 29.53058770576 // days
  const now = new Date()
  const daysSince =
    (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const cyclePosition = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth
  // Map 0–29.53 days to 0–7 phases
  return Math.round((cyclePosition / synodicMonth) * 8) % 8
}

const PHASES = [
  { name: 'New' },
  { name: 'Wax. Crescent' },
  { name: 'First Quarter' },
  { name: 'Wax. Gibbous' },
  { name: 'Full' },
  { name: 'Wan. Gibbous' },
  { name: 'Last Quarter' },
  { name: 'Wan. Crescent' },
]

export default function MojoMoonPhases() {
  const currentPhase = getLunarPhaseIndex()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '16px',
      padding: '12px 0 4px',
    }}>
      {PHASES.map((phase, i) => {
        const isActive = i === currentPhase
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              opacity: isActive ? 1 : 0.35,
              transition: 'opacity 0.3s',
            }}
          >
            {/* Moon phase SVG icon */}
            <svg
              width={isActive ? 34 : 26}
              height={isActive ? 34 : 26}
              viewBox="0 0 28 28"
              fill="none"
              style={{
                animationName: isActive ? 'mojo-moon-breathe' : undefined,
                animationDuration: '3s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                filter: isActive
                  ? 'drop-shadow(0 0 6px currentColor)'
                  : undefined,
                transition: 'width 0.3s, height 0.3s',
              }}
            >
              <defs>
                <clipPath id={`phase-clip-${i}`}>
                  {/* Each phase clips differently */}
                  {i === 0 && <circle cx="14" cy="14" r="10" />}
                  {i === 1 && <ellipse cx="19" cy="14" rx="10" ry="10" />}
                  {i === 2 && <rect x="14" y="4" width="10" height="20" />}
                  {i === 3 && <ellipse cx="17" cy="14" rx="13" ry="10" />}
                  {i === 4 && <circle cx="14" cy="14" r="10" />}
                  {i === 5 && <ellipse cx="11" cy="14" rx="13" ry="10" />}
                  {i === 6 && <rect x="4" y="4" width="10" height="20" />}
                  {i === 7 && <ellipse cx="9" cy="14" rx="10" ry="10" />}
                </clipPath>
              </defs>
              {/* Dark base circle */}
              <circle cx="14" cy="14" r="11"
                fill={i === 4 ? '#f0f0f8' : 'currentColor'}
                opacity={i === 4 ? 0.9 : 0.08}
              />
              {/* Ring */}
              <circle cx="14" cy="14" r="11"
                stroke="currentColor" strokeWidth="0.7"
                opacity={isActive ? 0.6 : 0.3}
                fill="none"
              />
              {/* Lit portion — varies by phase */}
              {i !== 0 && (
                <circle
                  cx="14" cy="14" r="11"
                  fill={i === 4 ? '#f0f0f8' : 'currentColor'}
                  opacity={i === 4 ? 0.9 : 0.75}
                  clipPath={`url(#phase-clip-${i})`}
                />
              )}
            </svg>
            {/* Phase name */}
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '7px',
              letterSpacing: '0.05em',
              color: 'var(--faded)',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '40px',
              ...(isActive && { color: 'var(--mist)' }),
            }}>
              {phase.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
