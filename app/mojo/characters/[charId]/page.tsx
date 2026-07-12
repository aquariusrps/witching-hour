import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMojoCharacter, getMojoCharacterThreads } from '@/lib/db/mojo'
import MojoCharacterArchiveToggle from '@/app/mojo/components/MojoCharacterArchiveToggle'
import MojoCharacterTabs from '@/app/mojo/components/MojoCharacterTabs'

export default async function MojoCharacterPage({
  params,
}: {
  params: Promise<{ charId: string }>
}) {
  const { charId } = await params
  const character = await getMojoCharacter(charId)
  if (!character) notFound()

  const threads = await getMojoCharacterThreads(charId)
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
          {character.faceclaim_name && (
            <Link
              href={`/mojo/faceclaims/${character.faceclaim_id}`}
              style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--mist)', textDecoration: 'none' }}
            >
              played by {character.faceclaim_name}
            </Link>
          )}
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
      />
    </div>
  )
}
