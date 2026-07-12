import { getMojoImageStacks, getMojoRpsWithCharacters, getMojoFaceclaims, getMojoStackMembers } from '@/lib/db/mojo'
import MojoCreateStack from '@/app/mojo/components/MojoCreateStack'
import MojoStackCard from '@/app/mojo/components/MojoStackCard'

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

export default async function MojoStacksPage() {
  const [stacks, rps, faceclaims] = await Promise.all([
    getMojoImageStacks(),
    getMojoRpsWithCharacters(),
    getMojoFaceclaims(),
  ])

  const characters = rps.flatMap((rp) =>
    rp.characters.map((c) => ({ id: c.id, name: c.name, rp_name: rp.name }))
  )
  const characterById = new Map(characters.map((c) => [c.id, c]))
  const faceclaimNameById = new Map(faceclaims.map((fc) => [fc.id, fc.name]))

  const membersByStack = new Map(
    await Promise.all(
      stacks.map(async (s) => [s.id, await getMojoStackMembers(s.id)] as const)
    )
  )

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          Image Stacks
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Rotating image pools — one URL, infinite variation
        </p>
      </div>

      <FiligreeDivider />

      <MojoCreateStack
        characters={characters}
        faceclaims={faceclaims.map((fc) => ({ id: fc.id, name: fc.name }))}
      />

      {stacks.length === 0 ? (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
          No image stacks yet. Create your first one above.
        </p>
      ) : (
        stacks.map((stack) => {
          const character = stack.character_id ? characterById.get(stack.character_id) : undefined
          const faceclaimName = stack.faceclaim_id ? faceclaimNameById.get(stack.faceclaim_id) ?? null : null
          return (
            <MojoStackCard
              key={stack.id}
              stack={stack}
              characterName={character?.name ?? null}
              rpName={character?.rp_name ?? null}
              faceclaimName={faceclaimName}
              members={membersByStack.get(stack.id) ?? []}
            />
          )
        })
      )}
    </div>
  )
}
