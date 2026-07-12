import { getMojoAvatars, getMojoRpsWithCharacters, getMojoFaceclaims } from '@/lib/db/mojo'
import MojoAvatarManager from '@/app/mojo/components/MojoAvatarManager'

function FiligreeDivider() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: '20px auto 28px',
      maxWidth: 360,
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--ember), var(--gold))' }} />
      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, var(--ember), var(--gold))' }} />
    </div>
  )
}

export default async function MojoAvatarsPage() {
  const [avatars, rps, faceclaims] = await Promise.all([
    getMojoAvatars(),
    getMojoRpsWithCharacters(),
    getMojoFaceclaims(),
  ])

  const characters = rps.flatMap((rp) => rp.characters.map((c) => ({ id: c.id, name: c.name })))

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          Avatars
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          All uploaded images across all characters and faceclaims
        </p>
      </div>

      <FiligreeDivider />

      <MojoAvatarManager
        avatars={avatars}
        characters={characters}
        faceclaims={faceclaims.map((fc) => ({ id: fc.id, name: fc.name }))}
      />
    </div>
  )
}
