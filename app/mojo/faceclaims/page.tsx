import { getMojoFaceclaims } from '@/lib/db/mojo'
import MojoCreateFaceclaim from '@/app/mojo/components/MojoCreateFaceclaim'
import MojoFaceclaimRow from '@/app/mojo/components/MojoFaceclaimRow'

function FiligreeDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '14px auto 28px', maxWidth: 360 }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--ember), var(--gold))' }} />
      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, var(--ember), var(--gold))' }} />
    </div>
  )
}

export default async function MojoFaceclaimsPage() {
  const faceclaims = await getMojoFaceclaims()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          Faceclaims
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Your celebrity resource library
        </p>
      </div>
      <FiligreeDivider />

      <MojoCreateFaceclaim />

      {faceclaims.length === 0 ? (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
          No faceclaims yet. Add one above.
        </p>
      ) : (
        <div>
          {faceclaims.map((fc) => (
            <MojoFaceclaimRow key={fc.id} fc={fc} />
          ))}
        </div>
      )}
    </div>
  )
}
