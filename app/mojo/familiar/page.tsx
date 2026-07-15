import MojoFamiliarChat from '@/app/mojo/components/MojoFamiliarChat'
import { SvgFamiliarPresence, SvgPageHeaderRule } from '@/app/mojo/components/MojoSvgAssets'

export default function FamiliarPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
        <div aria-hidden="true" style={{ marginBottom: '12px' }}>
          <SvgFamiliarPresence />
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '40px', fontWeight: 600,
          color: 'var(--gold)', margin: '0 0 6px',
        }}>
          The Familiar
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '16px', fontStyle: 'italic',
          color: 'var(--mist)', margin: '0 0 14px',
        }}>
          I am here.
        </p>
        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      {/* Chat */}
      <MojoFamiliarChat />
    </div>
  )
}
