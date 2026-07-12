import { getMojoSnippets, getMojoGlobalResources, getMojoRpsWithCharacters } from '@/lib/db/mojo'
import MojoAddSnippet from '@/app/mojo/components/MojoAddSnippet'
import MojoLibraryTabs from '@/app/mojo/components/MojoLibraryTabs'
import MojoAddResource from '@/app/mojo/components/MojoAddResource'
import MojoResourceList from '@/app/mojo/components/MojoResourceList'
import MojoLinkToCharacter from '@/app/mojo/components/MojoLinkToCharacter'

function FiligreeDivider() {
  return (
    <div style={{ height: 1, margin: '28px 0', background: 'linear-gradient(to right, var(--ember), var(--gold))', opacity: 0.4 }} />
  )
}

export default async function MojoLibraryPage() {
  const [snippets, globalResources, rps] = await Promise.all([
    getMojoSnippets(),
    getMojoGlobalResources(),
    getMojoRpsWithCharacters(),
  ])

  const characters = rps.flatMap((rp) =>
    rp.characters.map((c) => ({ id: c.id, name: c.name, rp_name: rp.name }))
  )

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          The Library
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Global snippets, templates &amp; resources
        </p>
      </div>

      <FiligreeDivider />

      <MojoAddSnippet />
      <MojoLibraryTabs snippets={snippets} />

      <FiligreeDivider />

      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: 'var(--f-head)', fontSize: '1.15rem', color: 'var(--roseash)', margin: 0 }}>
          Global Resources
        </h2>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--faded)', margin: '2px 0 0' }}>
          Resources not tied to any character or faceclaim
        </p>
      </div>

      <div style={{ margin: '14px 0 20px' }}>
        <span style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '0.75rem',
          color: 'var(--gold)',
          display: 'block',
          marginBottom: 10,
        }}>
          + Add Resource
        </span>
        <MojoAddResource faceclaimId={null} characterId={null} redirectPath="/mojo/library" />
      </div>

      {globalResources.length === 0 ? (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
          No global resources yet. Add images, links, or notes that aren&rsquo;t tied to a specific character or faceclaim.
        </p>
      ) : (
        <>
          {characters.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{
                fontFamily: 'var(--f-ui)',
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--faded)',
                margin: '0 0 10px',
              }}>
                Link resources to a character
              </h3>
              {globalResources.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '6px 0',
                    borderBottom: '1px solid var(--elevated)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--roseash)' }}>
                    {r.title}
                  </span>
                  <MojoLinkToCharacter resourceId={r.id} characters={characters} />
                </div>
              ))}
            </div>
          )}

          <MojoResourceList resources={globalResources} redirectPath="/mojo/library" />
        </>
      )}
    </div>
  )
}
