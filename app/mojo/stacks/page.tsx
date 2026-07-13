import { getMojoImageStacks, getMojoRpsWithCharacters, getMojoFaceclaims, getMojoStackMembers } from '@/lib/db/mojo'
import MojoCreateStack from '@/app/mojo/components/MojoCreateStack'
import MojoStackCard from '@/app/mojo/components/MojoStackCard'
import {
  SvgCabinetOfCuriosities, SvgPageHeaderRule, SvgFiligreeRule
} from '@/app/mojo/components/MojoSvgAssets'

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
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 28px 64px', position: 'relative' }}>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(96,64,192,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, marginBottom: '8px' }}>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '36px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 4px',
          letterSpacing: '0.02em',
        }}>
          The Reliquary
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 14px',
        }}>
          Every token. Every face. Sealed in amber.
        </p>
        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          zIndex: 1,
          color: 'var(--mist)',
          marginBottom: '4px',
        }}
      >
        <SvgCabinetOfCuriosities />
      </div>

      <div style={{
        color: 'var(--elevated)',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 1,
      }}>
        <SvgFiligreeRule />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
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
                characters={characters}
                faceclaims={faceclaims.map((fc) => ({ id: fc.id, name: fc.name }))}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
