import { getMojoImageStacks, getMojoRpsWithCharacters, getMojoFaceclaims, getMojoStackMembers } from '@/lib/db/mojo'
import { getAdminClient } from '@/lib/supabase/adminClient'
import MojoCreateStack from '@/app/mojo/components/MojoCreateStack'
import MojoStackCard from '@/app/mojo/components/MojoStackCard'
import {
  SvgHallOfMirrors, SvgPageHeaderRule
} from '@/app/mojo/components/MojoSvgAssets'

export default async function MojoStacksPage({
  searchParams,
}: {
  searchParams: Promise<{ character_id?: string }>
}) {
  const { character_id } = await searchParams

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

  let characterName: string | null = null
  let characterFaceclaimId: string | null = null
  if (character_id) {
    const admin = getAdminClient()
    const { data: char } = await admin
      .from('mojo_characters')
      .select('name, faceclaim_id')
      .eq('id', character_id)
      .single()
    characterName = char?.name ?? null
    characterFaceclaimId = char?.faceclaim_id ?? null
  }

  const filteredStacks = character_id
    ? stacks.filter((s) =>
        s.character_id === character_id ||
        (characterFaceclaimId && s.faceclaim_id === characterFaceclaimId)
      )
    : stacks

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

      {/* ── THE HALL OF MIRRORS HEADER ── */}
      <div style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}>

        {/* Corridor illustration — full width */}
        <div style={{ marginBottom: '0', overflow: 'hidden', borderRadius: '3px' }}>
          <SvgHallOfMirrors idSuffix="stacks-header" />
        </div>

        {/* Page title */}
        <div style={{ marginTop: '20px', marginBottom: '6px' }}>
          <h1 style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: '38px',
            fontWeight: 600,
            color: 'var(--roseash)',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
            The Hall of Mirrors
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 16px',
        }}>
          One token. Many reflections.
        </p>

        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>

      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MojoCreateStack
          characters={characters}
          faceclaims={faceclaims.map((fc) => ({ id: fc.id, name: fc.name }))}
        />

        {character_id && characterName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            padding: '8px 12px',
            background: 'var(--raised)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '2px',
          }}>
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
            }}>
              Filtered by character:
            </span>
            <span style={{
              fontFamily: 'EB Garamond, serif',
              fontSize: '14px',
              color: 'var(--roseash)',
            }}>
              {characterName}
            </span>
            <a
              href="/mojo/stacks"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'var(--faded)',
                textDecoration: 'none',
                marginLeft: 'auto',
                opacity: 0.7,
              }}
            >
              ← Show all
            </a>
          </div>
        )}

        {stacks.length === 0 ? (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
            No image stacks yet. Create your first one above.
          </p>
        ) : filteredStacks.length === 0 && character_id ? (
          <p style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '14px',
            fontStyle: 'italic',
            color: 'var(--faded)',
          }}>
            No stacks assigned to {characterName ?? 'this character'}.
            <a href="/mojo/stacks" style={{ color: 'var(--gold)',
              marginLeft: 8, textDecoration: 'none' }}>
              View all stacks →
            </a>
          </p>
        ) : (
          filteredStacks.map((stack) => {
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
