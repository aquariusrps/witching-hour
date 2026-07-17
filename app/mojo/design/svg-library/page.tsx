import * as SvgAssets from '@/app/mojo/components/MojoSvgAssets'
import Link from 'next/link'
import {
  svgLibraryMeta,
  SVG_GROUPS,
  type SvgGroup,
} from './svgLibraryMeta'

// Grid column counts per group
const GROUP_COLUMNS: Record<SvgGroup, number> = {
  'Wide Panoramic':    1,
  'Square':            4,
  'Tall Vertical':     4,
  'Medium Decorative': 2,
  'Small Navigation':  6,
  'Ungrouped':         2,
}

// Get all exported SVG components.
// Filter to only named exports starting with 'Svg'.
type SvgComponentFn = (props: Record<string, unknown>) => React.ReactNode
const allSvgEntries = Object.entries(SvgAssets).filter(
  ([name]) => name.startsWith('Svg')
) as [string, SvgComponentFn][]

// Group SVGs by their metadata group
function groupSvgs() {
  const groups = new Map<SvgGroup, [string, SvgComponentFn][]>()
  SVG_GROUPS.forEach(g => groups.set(g, []))

  allSvgEntries.forEach(([name, Component]) => {
    const meta = svgLibraryMeta[name]
    const group: SvgGroup = meta?.group ?? 'Ungrouped'
    groups.get(group)!.push([name, Component])
  })

  return groups
}

export default function SvgLibraryPage() {
  const groups = groupSvgs()
  const totalCount = allSvgEntries.length

  return (
    <div style={{ maxWidth: '1200px' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '6px' }}>
          <h1 style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: '38px',
            fontWeight: 600,
            color: 'var(--gold)',
            margin: 0,
          }}>
            SVG Asset Library
          </h1>
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '9px',
            letterSpacing: '0.2em',
            color: 'var(--faded)',
          }}>
            {totalCount} EXPORTS
          </span>
        </div>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 6px',
        }}>
          Every SVG in MojoSvgAssets.tsx. New exports appear in Ungrouped automatically.
        </p>
        <Link href="/mojo/design" style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '8px',
          letterSpacing: '0.2em',
          color: 'var(--faded)',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}>
          ← Back to Atelier
        </Link>
      </div>

      {/* ── GROUPS ── */}
      {SVG_GROUPS.map(group => {
        const svgs = groups.get(group) ?? []
        if (svgs.length === 0) return null

        const cols = GROUP_COLUMNS[group]
        const isNav = group === 'Small Navigation'

        return (
          <div key={group} style={{ marginBottom: '48px' }}>

            {/* Group heading */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h2 style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '10px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--roseash)',
                margin: 0,
                fontWeight: 400,
              }}>
                {group}
              </h2>
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '8px',
                letterSpacing: '0.15em',
                color: 'var(--faded)',
              }}>
                {svgs.length}
              </span>
            </div>

            {/* SVG grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: '12px',
            }}>
              {svgs.map(([name, Component]) => {
                const meta = svgLibraryMeta[name]
                const cardHeight = meta?.cardHeight ?? 160
                const renderProps = meta?.renderProps ?? {}
                const safeIdSuffix = name.toLowerCase().replace(/svg/i, '')

                return (
                  <div key={name} style={{
                    background: 'var(--raised)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    {/* SVG preview area */}
                    <div style={{
                      height: `${cardHeight}px`,
                      background: 'var(--char)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: isNav ? '12px' : '0',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {/* Small nav glyphs (14px native, no size prop on most
                          of them) get a CSS zoom so they're visible at all —
                          see MOJO-FIX-035 Q-items: renderProps size overrides
                          don't work for components that never accept a size
                          prop in the first place (confirmed via Step A.2). */}
                      <div style={isNav ? { transform: 'scale(3)' } : undefined}>
                        <SvgLibraryCard Component={Component} idSuffix={safeIdSuffix} renderProps={renderProps} />
                      </div>
                    </div>

                    {/* Card label */}
                    <div style={{
                      padding: '8px 10px',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div style={{
                        fontFamily: 'Cinzel, serif',
                        fontSize: '7px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--mist)',
                        marginBottom: '2px',
                      }}>
                        {meta?.displayName ?? name}
                      </div>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        color: 'var(--faded)',
                        opacity: 0.60,
                      }}>
                        {name}
                      </div>
                      {meta?.notes && (
                        <div style={{
                          fontFamily: 'EB Garamond, serif',
                          fontSize: '10px',
                          fontStyle: 'italic',
                          color: 'var(--faded)',
                          opacity: 0.55,
                          marginTop: '2px',
                        }}>
                          {meta.notes}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

    </div>
  )
}

// Renders a single SVG asset with safe, universal props.
// Isolated in its own component (rather than an inline IIFE) so
// that a bad render actually gets caught — see MOJO-FIX-035 Q-items:
// an IIFE around <Component/> only wraps createElement(), not the
// later invocation of Component during React's render phase, so it
// would never actually catch a component throwing during its own
// render. A dedicated component only changes what gets caught (still
// not a real error boundary — that requires a Client Component), but
// documents the limitation instead of implying protection that isn't there.
function SvgLibraryCard({
  Component,
  idSuffix,
  renderProps,
}: {
  Component: SvgComponentFn
  idSuffix: string
  renderProps: Record<string, unknown>
}) {
  try {
    // Calling Component(...) directly (not <Component .../>) so the
    // function body actually executes inside this try block. JSX
    // syntax only builds a lazy element descriptor — React invokes
    // the component later, outside this synchronous call stack, so
    // <Component .../> here would never actually be caught below.
    return Component({ idSuffix, ...renderProps })
  } catch {
    return (
      <span style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '8px',
        color: 'var(--faded)',
      }}>
        render error
      </span>
    )
  }
}
