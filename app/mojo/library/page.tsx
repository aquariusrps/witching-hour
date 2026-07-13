import { getMojoSnippets, getMojoGlobalResources, getMojoRpsWithCharacters } from '@/lib/db/mojo'
import MojoAddSnippet from '@/app/mojo/components/MojoAddSnippet'
import MojoLibraryTabs from '@/app/mojo/components/MojoLibraryTabs'
import MojoAddResource from '@/app/mojo/components/MojoAddResource'
import MojoLibraryResources from '@/app/mojo/components/MojoLibraryResources'
import {
  SvgBookshelf,
  SvgFiligreeRule,
  SvgPageHeaderRule,
  SvgCrescent,
  SvgNavImages,
} from '@/app/mojo/components/MojoSvgAssets'

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
    <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '20px',
          right: '0px',
          color: 'var(--mist)',
          opacity: 0.18,
          pointerEvents: 'none',
          animation: 'mojo-float 6s ease-in-out infinite',
        }}
      >
        <SvgCrescent size={70} idSuffix="library" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginBottom: '12px' }}>
        <h1 style={{
          fontFamily: 'Cormorant Upright, serif',
          fontSize: '36px',
          fontWeight: 600,
          color: 'var(--gold)',
          margin: '0 0 4px',
          letterSpacing: '0.02em',
        }}>
          The Library
        </h1>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 14px',
        }}>
          Everything you know. Everything you&rsquo;ve kept.
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
          marginBottom: '8px',
        }}
      >
        <SvgBookshelf />
      </div>

      <div style={{ position: 'relative', zIndex: 1, color: 'var(--elevated)', marginBottom: '16px' }}>
        <SvgFiligreeRule />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MojoAddSnippet />
        <MojoLibraryTabs snippets={snippets} />
      </div>

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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            color: 'var(--faded)',
          }}>
            <SvgNavImages active={false} />
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
            }}>
              Global Resources
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'var(--elevated)',
              opacity: 0.4,
            }} />
          </div>

          <MojoLibraryResources globalResources={globalResources} characters={characters} />
        </>
      )}
    </div>
  )
}
