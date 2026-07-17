'use client'

import {
  SvgPhaseNewMoon,
  SvgPhaseWaxingCrescent,
  SvgPhaseFirstQuarter,
  SvgPhaseWaxingGibbous,
  SvgPhaseFullMoon,
  SvgPhaseWaningGibbous,
  SvgPhaseLastQuarter,
  SvgPhaseWaningCrescent,
} from './MojoSvgAssets'

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

const PHASE_SVGS = [
  SvgPhaseNewMoon,
  SvgPhaseWaxingCrescent,
  SvgPhaseFirstQuarter,
  SvgPhaseWaxingGibbous,
  SvgPhaseFullMoon,
  SvgPhaseWaningGibbous,
  SvgPhaseLastQuarter,
  SvgPhaseWaningCrescent,
]

const PHASE_LABELS = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
]

export default function MojoMoonPhases() {
  const currentPhaseIndex = getLunarPhaseIndex()

  // Current phase always at display position 3 (center of 8).
  // Phases wrap cyclically before and after.
  const displayOrder = Array.from({ length: 8 }, (_, i) =>
    (currentPhaseIndex - 3 + i + 8) % 8
  )

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 40%, #0e0e20 0%, #080810 70%, #050508 100%)',
      border: '1px solid rgba(160,160,200,0.09)',
      borderRadius: '6px',
      padding: '20px 24px 16px',
    }}>
      {/* Star background — fixed coordinates, no Math.random */}
      <svg
        width="100%" height="100%"
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
        aria-hidden="true"
      >
        <circle cx="45"  cy="18" r="0.8" fill="#d0d0f0" />
        <circle cx="180" cy="72" r="0.6" fill="#c0c0e8" />
        <circle cx="320" cy="12" r="1.0" fill="#e0e0ff" />
        <circle cx="560" cy="80" r="0.7" fill="#d0d0f0" />
        <circle cx="680" cy="25" r="0.9" fill="#c8c8f0" />
        <circle cx="750" cy="65" r="0.5" fill="#d8d8ff" />
      </svg>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {displayOrder.map((phaseIndex, displayPosition) => {
          const isActive = phaseIndex === currentPhaseIndex
          const PhaseComponent = PHASE_SVGS[phaseIndex]
          const label = PHASE_LABELS[phaseIndex]

          return (
            <div
              key={phaseIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flex: 1,
                opacity: isActive ? 1.0 : 0.45,
                transition: 'opacity 0.3s ease',
              }}
            >
              <PhaseComponent
                size={isActive ? 56 : 40}
                active={isActive}
                idSuffix={`mp-${displayPosition}`}
              />
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '7px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: isActive ? 'var(--gold)' : 'var(--faded)',
                opacity: isActive ? 1 : 0.65,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
