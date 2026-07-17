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

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 0 4px',
    }}>
      {PHASE_SVGS.map((PhaseComponent, i) => {
        const isActive = i === currentPhaseIndex
        return (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            transform: isActive ? 'translateY(-4px)' : 'none',
            transition: 'transform 0.3s ease',
          }}>
            <PhaseComponent
              size={isActive ? 56 : 36}
              active={isActive}
              idSuffix={`mp-${i}`}
            />
            {isActive && (
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                whiteSpace: 'nowrap',
              }}>
                {PHASE_LABELS[i]}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
