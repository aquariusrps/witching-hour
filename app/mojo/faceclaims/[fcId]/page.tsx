import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMojoFaceclaimWithCharacters, getMojoFaceclaimResources } from '@/lib/db/mojo'
import MojoFaceclaimNameEdit from '@/app/mojo/components/MojoFaceclaimNameEdit'
import MojoQuickCopyPanel from '@/app/mojo/components/MojoQuickCopyPanel'
import MojoAddResource from '@/app/mojo/components/MojoAddResource'
import MojoResourceList from '@/app/mojo/components/MojoResourceList'

function FiligreeDivider() {
  return (
    <div style={{ height: 1, margin: '24px 0', background: 'linear-gradient(to right, var(--ember), var(--gold))', opacity: 0.4 }} />
  )
}

export default async function MojoFaceclaimDetailPage({
  params,
}: {
  params: Promise<{ fcId: string }>
}) {
  const { fcId } = await params
  const faceclaim = await getMojoFaceclaimWithCharacters(fcId)
  if (!faceclaim) notFound()

  const resources = await getMojoFaceclaimResources(fcId)
  const imageResources = resources.filter((r) => r.type === 'image' || r.type === 'gif')

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 28px 64px' }}>
      <Link
        href="/mojo/faceclaims"
        style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--faded)', textDecoration: 'none' }}
      >
        ← Faceclaims
      </Link>

      <div style={{ margin: '8px 0 4px' }}>
        <MojoFaceclaimNameEdit fcId={faceclaim.id} name={faceclaim.name} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <span style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.62rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--faded)',
        }}>
          Characters
        </span>
        <div style={{ marginTop: 4 }}>
          {faceclaim.characters.length === 0 ? (
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--faded)', margin: 0 }}>
              No characters using this faceclaim.
            </p>
          ) : (
            <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.875rem', color: 'var(--mist)', margin: 0 }}>
              {faceclaim.characters.map((c, i) => (
                <span key={c.id}>
                  {i > 0 && ' · '}
                  <Link href={`/mojo/characters/${c.id}`} style={{ color: 'var(--mist)' }}>
                    {c.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      <FiligreeDivider />

      <MojoQuickCopyPanel resources={imageResources} />

      <h2 style={{ fontFamily: 'var(--f-head)', fontSize: '1.15rem', color: 'var(--roseash)', margin: '0 0 14px' }}>
        Resources
      </h2>

      <MojoAddResource
        faceclaimId={faceclaim.id}
        characterId={null}
        redirectPath={`/mojo/faceclaims/${faceclaim.id}`}
      />

      <MojoResourceList
        resources={resources}
        redirectPath={`/mojo/faceclaims/${faceclaim.id}`}
      />
    </div>
  )
}
