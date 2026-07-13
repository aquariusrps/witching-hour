import { getMojoDashboardData } from '@/lib/db/mojo'
import MojoDashboardStatTile from './components/MojoDashboardStatTile'
import MojoDashboardRpPanel from './components/MojoDashboardRpPanel'
import MojoCollapsedRps from './components/MojoCollapsedRps'
import { SvgLargeCrescent, SvgCandle, SvgPageHeaderRule, SvgFiligreeRule } from '@/app/mojo/components/MojoSvgAssets'
import MojoMoonPhases from '@/app/mojo/components/MojoMoonPhases'

export default async function MojoDashboardPage() {
  const { stats, activeRps, inactiveRps } = await getMojoDashboardData()

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 28px 64px', position: 'relative' }}>
      {/* The Moon — The Sanctum centrepiece */}
      <div
        aria-hidden="true"
        className="mojo-moon-wrapper"
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-80px',
          zIndex: 0,
          pointerEvents: 'none',
          color: 'var(--mist)',
          animation: 'mojo-moon-breathe 5s ease-in-out infinite',
        }}
      >
        <SvgLargeCrescent size={260} idSuffix="sanctum" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px' }}>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '38px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 4px 0',
          letterSpacing: '0.02em',
          textShadow: '0 0 40px rgba(160,40,64,0.25)',
        }}>
          The Sanctum
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '16px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 16px 0',
        }}>
          Your altar. Your world.
        </p>
        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      <div className="mojo-stats-strip" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <MojoDashboardStatTile href="/mojo" value={stats.activeRpCount} label="Active RPs" watermark="☽" />
        <MojoDashboardStatTile href="/mojo" value={stats.characterCount} label="Characters" watermark="♃" />
        <MojoDashboardStatTile href="/mojo" value={stats.activeThreadCount} label="Active Threads" watermark="∞" />
        <MojoDashboardStatTile href="/mojo/library" value={stats.snippetCount} label="Snippets" watermark="☿" />
        <MojoDashboardStatTile href="/mojo/partners" value={stats.partnerCount} label="Partners" watermark="♆" />
        <MojoDashboardStatTile href="/mojo/stacks" value={stats.stackCount} label="Stacks" watermark="⬡" />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '8px 0 4px',
        color: 'var(--mist)',
      }}>
        <MojoMoonPhases />
      </div>

      <div style={{
        color: 'var(--elevated)',
        margin: '4px 0 20px',
      }}>
        <SvgFiligreeRule />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '16px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left candle */}
        <div style={{ color: 'var(--mist)', flexShrink: 0 }} aria-hidden="true">
          <SvgCandle height={72} idSuffix="left" flameDelay="0s" />
        </div>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '22px',
            color: 'var(--roseash)',
            margin: 0,
            letterSpacing: '0.03em',
          }}>
            Active Roleplays
          </h2>
        </div>

        {/* Right candle */}
        <div style={{ color: 'var(--mist)', flexShrink: 0 }} aria-hidden="true">
          <SvgCandle height={72} idSuffix="right" flameDelay="0.35s" />
        </div>
      </div>

      <div style={{ color: 'var(--elevated)', marginBottom: '20px' }}>
        <SvgFiligreeRule />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {activeRps.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)', textAlign: 'center' }}>
            No active roleplays yet. Create one using the sidebar.
          </p>
        ) : (
          activeRps.map((rp) => <MojoDashboardRpPanel key={rp.id} rp={rp} />)
        )}

        {inactiveRps.length > 0 && (
          <MojoCollapsedRps rps={inactiveRps} />
        )}
      </div>
    </div>
  )
}
