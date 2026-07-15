import MojoFamiliarWrapper from '@/app/mojo/components/MojoFamiliarWrapper'
import { SvgFamiliarPresence, SvgPageHeaderRule } from '@/app/mojo/components/MojoSvgAssets'

export default function FamiliarPage() {
  return (
    <div>
      {/* Header — full width above the split layout */}
      <div style={{
        textAlign: 'center',
        padding: '20px 0 16px',
        maxWidth: '720px',
        margin: '0 auto',
      }}>
        <div aria-hidden="true" style={{ marginBottom: '14px' }}>
          <SvgFamiliarPresence />
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '40px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 6px',
          letterSpacing: '0.02em',
        }}>
          The Familiar
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '16px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 14px',
        }}>
          I am here.
        </p>
        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      {/* Two-column layout */}
      <MojoFamiliarWrapper />
    </div>
  )
}
