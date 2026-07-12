import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getMojoCharacter,
  getMojoCharacterThreads,
  getMojoFaceclaims,
  getMojoCharacterResources,
  getMojoFaceclaimResources,
} from '@/lib/db/mojo'
import MojoCharacterArchiveToggle from '@/app/mojo/components/MojoCharacterArchiveToggle'
import MojoCharacterTabs from '@/app/mojo/components/MojoCharacterTabs'
import MojoFaceclaimAssign from '@/app/mojo/components/MojoFaceclaimAssign'

export default async function MojoCharacterPage({
  params,
}: {
  params: Promise<{ charId: string }>
}) {
  const { charId } = await params
  const character = await getMojoCharacter(charId)
  if (!character) notFound()

  const threads = await getMojoCharacterThreads(charId)
  const allFaceclaims = await getMojoFaceclaims()
  const characterResources = await getMojoCharacterResources(charId)
  const faceclaimResources = character.faceclaim_id
    ? await getMojoFaceclaimResources(character.faceclaim_id)
    : []
  const isArchived = character.status === 'archived'

  return (
    <div style={{ padding: '28px 32px 64px' }}>
      {/* Header */}
      <div style={{
        borderLeft: `4px solid ${character.rp_color_hex}`,
        paddingLeft: 16,
        marginBottom: 28,
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <MojoCharacterArchiveToggle
            charId={character.id}
            status={isArchived ? 'archived' : 'active'}
          />
        </div>

        <Link
          href={`/mojo/rps/${character.rp_id}`}
          style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--faded)', textDecoration: 'none' }}
        >
          ← {character.rp_name}
        </Link>

        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: '4px 0 6px' }}>
          {character.name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MojoFaceclaimAssign
            characterId={character.id}
            currentFaceclaimId={character.faceclaim_id}
            currentFaceclaimName={character.faceclaim_name}
            allFaceclaims={allFaceclaims.map((fc) => ({ id: fc.id, name: fc.name }))}
          />
          {isArchived && (
            <span style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.62rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
              background: 'var(--raised)',
              padding: '2px 8px',
              borderRadius: 2,
            }}>
              ARCHIVED
            </span>
          )}
        </div>
      </div>

      <MojoCharacterTabs
        character={character}
        threads={threads}
        charId={character.id}
        rpId={character.rp_id}
        resources={characterResources}
        faceclaimResources={faceclaimResources}
        faceclaimName={character.faceclaim_name}
      />
    </div>
  )
}
