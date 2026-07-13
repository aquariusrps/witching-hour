import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/adminClient'

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

const GROUP_HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--f-ui)',
  fontSize: '0.68rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  margin: '0 0 8px',
}

const ROW_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-body)',
  fontSize: '0.875rem',
  color: 'var(--roseash)',
  textDecoration: 'none',
  padding: '6px 0',
  borderBottom: '1px solid var(--elevated)',
}

const SUBTEXT_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-body)',
  fontSize: '0.75rem',
  color: 'var(--faded)',
  marginTop: 2,
}

const BADGE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--f-ui)',
  fontSize: '0.625rem',
  textTransform: 'uppercase',
  color: 'var(--faded)',
}

export default async function MojoSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 28px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.9rem', color: 'var(--gold)', margin: '0 0 6px' }}>
          Search
        </h1>
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--mist)', margin: 0 }}>
          Search across all your RPs, characters, threads, and resources
        </p>
      </div>

      <FiligreeDivider />

      <form action="/mojo/search" method="GET" style={{ display: 'flex', gap: 8 }}>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search characters, threads, faceclaims..."
          style={{
            flex: 1,
            background: 'var(--raised)',
            color: 'var(--roseash)',
            border: '1px solid var(--elevated)',
            fontFamily: 'var(--f-body)',
            fontSize: '0.875rem',
            padding: '8px 12px',
            borderRadius: 2,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            background: 'var(--ember)',
            color: 'var(--roseash)',
            border: 'none',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.8125rem',
            padding: '8px 20px',
            borderRadius: 2,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

      {!query ? (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)', marginTop: 28 }}>
          Enter a search term above to begin.
        </p>
      ) : (
        <SearchResults query={query} />
      )}
    </div>
  )
}

async function SearchResults({ query }: { query: string }) {
  const admin = getAdminClient()
  const ilike = `%${query}%`

  const [rps, characters, faceclaims, threads, resources, snippets, partners, personalImages] =
    await Promise.all([
      admin.from('mojo_rps').select('id, name, site_name, status').ilike('name', ilike).limit(10),
      admin.from('mojo_characters').select('id, name, rp_id, status').ilike('name', ilike).limit(10),
      admin.from('mojo_faceclaims').select('id, name').ilike('name', ilike).limit(10),
      admin.from('mojo_threads').select('id, title, rp_id, character_id, status').ilike('title', ilike).limit(10),
      admin.from('mojo_resources').select('id, title, type, character_id, faceclaim_id').ilike('title', ilike).limit(10),
      admin.from('mojo_snippets').select('id, title, type').ilike('title', ilike).limit(10),
      admin.from('mojo_partners').select('id, handle').ilike('handle', ilike).limit(10),
      admin.from('mojo_personal_images').select('id, title, token').ilike('title', ilike).limit(10),
    ])

  const rpRows = rps.data ?? []
  const characterRows = characters.data ?? []
  const faceclaimRows = faceclaims.data ?? []
  const threadRows = threads.data ?? []
  const resourceRows = resources.data ?? []
  const snippetRows = snippets.data ?? []
  const partnerRows = partners.data ?? []
  const imageRows = personalImages.data ?? []

  const total =
    rpRows.length +
    characterRows.length +
    faceclaimRows.length +
    threadRows.length +
    resourceRows.length +
    snippetRows.length +
    partnerRows.length +
    imageRows.length

  if (total === 0) {
    return (
      <>
        <FiligreeDivider />
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
          No results for &lsquo;{query}&rsquo;.
        </p>
      </>
    )
  }

  const rpIds = characterRows.map((c) => c.rp_id).filter(Boolean)
  const { data: charRps } = rpIds.length
    ? await admin.from('mojo_rps').select('id, name').in('id', rpIds)
    : { data: [] as Array<{ id: string; name: string }> }
  const rpMap = new Map((charRps ?? []).map((r) => [r.id, r.name]))

  return (
    <>
      <FiligreeDivider />

      <p style={{ fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--faded)', margin: '0 0 20px' }}>
        Found {total} result{total === 1 ? '' : 's'} for &lsquo;{query}&rsquo;
      </p>

      {rpRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={GROUP_HEADING_STYLE}>Roleplays</h2>
          {rpRows.map((rp) => (
            <Link key={rp.id} href={`/mojo/rps/${rp.id}`} style={ROW_STYLE}>
              {rp.name}
              <span style={SUBTEXT_STYLE}>{rp.site_name} · {rp.status}</span>
            </Link>
          ))}
        </div>
      )}

      {characterRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={GROUP_HEADING_STYLE}>Characters</h2>
          {characterRows.map((c) => (
            <Link key={c.id} href={`/mojo/characters/${c.id}`} style={ROW_STYLE}>
              {c.name}
              <span style={SUBTEXT_STYLE}>
                in {rpMap.get(c.rp_id) ?? 'Unknown'}
                {c.status === 'archived' ? ' · archived' : ''}
              </span>
            </Link>
          ))}
        </div>
      )}

      {faceclaimRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={GROUP_HEADING_STYLE}>Faceclaims</h2>
          {faceclaimRows.map((fc) => (
            <Link key={fc.id} href={`/mojo/faceclaims/${fc.id}`} style={ROW_STYLE}>
              {fc.name}
            </Link>
          ))}
        </div>
      )}

      {threadRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={GROUP_HEADING_STYLE}>Threads</h2>
          {threadRows.map((t) => (
            <Link key={t.id} href={`/mojo/characters/${t.character_id}?tab=threads`} style={ROW_STYLE}>
              {t.title}
              {t.status === 'archived' && <span style={SUBTEXT_STYLE}>archived</span>}
            </Link>
          ))}
        </div>
      )}

      {resourceRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={GROUP_HEADING_STYLE}>Resources</h2>
          {resourceRows.map((r) => {
            const href = r.character_id
              ? `/mojo/characters/${r.character_id}?tab=resources`
              : r.faceclaim_id
                ? `/mojo/faceclaims/${r.faceclaim_id}`
                : '/mojo/library'
            return (
              <Link key={r.id} href={href} style={ROW_STYLE}>
                {r.title}
                <span style={{ ...SUBTEXT_STYLE, ...BADGE_STYLE }}>{r.type}</span>
              </Link>
            )
          })}
        </div>
      )}

      {snippetRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={GROUP_HEADING_STYLE}>Snippets</h2>
          {snippetRows.map((s) => (
            <Link key={s.id} href="/mojo/library" style={ROW_STYLE}>
              {s.title}
              <span style={{ ...SUBTEXT_STYLE, ...BADGE_STYLE }}>{s.type}</span>
            </Link>
          ))}
        </div>
      )}

      {partnerRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={GROUP_HEADING_STYLE}>Partners</h2>
          {partnerRows.map((p) => (
            <Link key={p.id} href="/mojo/partners" style={ROW_STYLE}>
              {p.handle}
            </Link>
          ))}
        </div>
      )}

      {imageRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={GROUP_HEADING_STYLE}>Images</h2>
          {imageRows.map((img) => (
            <Link key={img.id} href="/mojo/images" style={{ ...ROW_STYLE, display: 'flex', alignItems: 'center', gap: 10 }}>
              {img.token && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${process.env.NEXT_PUBLIC_SITE_URL}/i/${img.token}`}
                  alt={img.title}
                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                />
              )}
              {img.title}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
