import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/adminClient'
import {
  SvgScryingBowl, SvgStarfield, SvgPageHeaderRule, SvgDiviningChamber,
  SvgNavDashboard, SvgNavFaceclaims, SvgNavSearch,
  SvgNavStacks, SvgNavLibrary, SvgNavPartners, SvgNavImages,
} from '@/app/mojo/components/MojoSvgAssets'

const ROW_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'EB Garamond, serif',
  fontSize: '15px',
  color: 'var(--roseash)',
  textDecoration: 'none',
  padding: '4px 0',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
}

const SUBTEXT_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'EB Garamond, serif',
  fontSize: '12px',
  fontStyle: 'italic',
  color: 'var(--faded)',
  marginTop: 1,
}

const BADGE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--f-ui)',
  fontSize: '0.625rem',
  textTransform: 'uppercase',
  color: 'var(--faded)',
}

function GroupHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mojo-oracle-group-heading">
      {icon}
      <span>{label}</span>
      <div className="mojo-oracle-group-line" />
    </div>
  )
}

export default async function MojoSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          color: 'var(--mist)',
          opacity: 0.55,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <SvgStarfield width={900} height={700} />
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '680px',
        margin: '0 auto',
        padding: '24px 16px 48px',
      }}>
        {/* ── THE DIVINING CHAMBER HEADER ── */}
        <div style={{ marginBottom: '24px', width: '100%' }}>

          {/* Divining Chamber illustration */}
          <div style={{ marginBottom: '0', overflow: 'hidden', borderRadius: '3px' }}>
            <SvgDiviningChamber idSuffix="search-header" />
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
              The Divining Chamber
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
            Ask. The chamber answers.
          </p>

          <div style={{ color: 'var(--elevated)' }}>
            <SvgPageHeaderRule />
          </div>

        </div>

        <form action="/mojo/search" method="GET" style={{
          width: '100%',
          maxWidth: '560px',
          display: 'flex',
          alignItems: 'stretch',
          marginBottom: '20px',
        }}>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Ask the oracle..."
            className="mojo-oracle-input"
            style={{ padding: '10px 14px', flexGrow: 1 }}
            autoComplete="off"
          />
          <button type="submit" className="mojo-oracle-submit">
            <SvgNavSearch active={false} />
          </button>
        </form>

        {!query ? (
          <p style={{
            fontFamily: 'EB Garamond, serif',
            fontSize: '16px',
            fontStyle: 'italic',
            color: 'var(--faded)',
            textAlign: 'center',
            marginTop: '20px',
          }}>
            Ask your question above.
          </p>
        ) : (
          <SearchResults query={query} />
        )}
      </div>
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
      <div style={{ textAlign: 'center', marginTop: '16px', width: '100%' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--mist)',
          opacity: 0.7,
          animation: 'mojo-moon-breathe 5s ease-in-out infinite',
        }} aria-hidden="true">
          <SvgScryingBowl size={120} idSuffix="empty" />
        </div>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '18px',
          fontStyle: 'italic',
          color: 'var(--mist)',
          margin: '0 0 6px',
        }}>
          The waters are still.
        </p>
        <p style={{
          fontFamily: 'EB Garamond, serif',
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'var(--faded)',
          margin: 0,
        }}>
          No visions for &ldquo;{query}&rdquo;.
        </p>
      </div>
    )
  }

  const rpIds = characterRows.map((c) => c.rp_id).filter(Boolean)
  const { data: charRps } = rpIds.length
    ? await admin.from('mojo_rps').select('id, name').in('id', rpIds)
    : { data: [] as Array<{ id: string; name: string }> }
  const rpMap = new Map((charRps ?? []).map((r) => [r.id, r.name]))

  return (
    <div style={{ width: '100%' }}>
      <p style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '11px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--faded)',
        textAlign: 'center',
        marginBottom: '8px',
        width: '100%',
      }}>
        {total} vision{total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>

      {rpRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <GroupHeading icon={<SvgNavDashboard active={false} />} label="Roleplays" />
          {rpRows.map((rp, i) => (
            <Link
              key={rp.id}
              href={`/mojo/rps/${rp.id}`}
              className="mojo-oracle-result"
              style={{ ...ROW_STYLE, animationDelay: `${i * 0.05}s` }}
            >
              {rp.name}
              <span style={SUBTEXT_STYLE}>{rp.site_name} · {rp.status}</span>
            </Link>
          ))}
        </div>
      )}

      {characterRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <GroupHeading icon={<SvgNavFaceclaims active={false} />} label="Characters" />
          {characterRows.map((c, i) => (
            <Link
              key={c.id}
              href={`/mojo/characters/${c.id}`}
              className="mojo-oracle-result"
              style={{ ...ROW_STYLE, animationDelay: `${i * 0.05}s` }}
            >
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
          <GroupHeading icon={<SvgNavFaceclaims active={false} />} label="Faceclaims" />
          {faceclaimRows.map((fc, i) => (
            <Link
              key={fc.id}
              href={`/mojo/faceclaims/${fc.id}`}
              className="mojo-oracle-result"
              style={{ ...ROW_STYLE, animationDelay: `${i * 0.05}s` }}
            >
              {fc.name}
            </Link>
          ))}
        </div>
      )}

      {threadRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <GroupHeading icon={<SvgNavSearch active={false} />} label="Threads" />
          {threadRows.map((t, i) => (
            <Link
              key={t.id}
              href={`/mojo/characters/${t.character_id}?tab=threads`}
              className="mojo-oracle-result"
              style={{ ...ROW_STYLE, animationDelay: `${i * 0.05}s` }}
            >
              {t.title}
              {t.status === 'archived' && <span style={SUBTEXT_STYLE}>archived</span>}
            </Link>
          ))}
        </div>
      )}

      {resourceRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <GroupHeading icon={<SvgNavStacks active={false} />} label="Resources" />
          {resourceRows.map((r, i) => {
            const href = r.character_id
              ? `/mojo/characters/${r.character_id}?tab=resources`
              : r.faceclaim_id
                ? `/mojo/faceclaims/${r.faceclaim_id}`
                : '/mojo/library'
            return (
              <Link
                key={r.id}
                href={href}
                className="mojo-oracle-result"
                style={{ ...ROW_STYLE, animationDelay: `${i * 0.05}s` }}
              >
                {r.title}
                <span style={{ ...SUBTEXT_STYLE, ...BADGE_STYLE }}>{r.type}</span>
              </Link>
            )
          })}
        </div>
      )}

      {snippetRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <GroupHeading icon={<SvgNavLibrary active={false} />} label="Snippets" />
          {snippetRows.map((s, i) => (
            <Link
              key={s.id}
              href="/mojo/library"
              className="mojo-oracle-result"
              style={{ ...ROW_STYLE, animationDelay: `${i * 0.05}s` }}
            >
              {s.title}
              <span style={{ ...SUBTEXT_STYLE, ...BADGE_STYLE }}>{s.type}</span>
            </Link>
          ))}
        </div>
      )}

      {partnerRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <GroupHeading icon={<SvgNavPartners active={false} />} label="Partners" />
          {partnerRows.map((p, i) => (
            <Link
              key={p.id}
              href="/mojo/partners"
              className="mojo-oracle-result"
              style={{ ...ROW_STYLE, animationDelay: `${i * 0.05}s` }}
            >
              {p.handle}
            </Link>
          ))}
        </div>
      )}

      {imageRows.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <GroupHeading icon={<SvgNavImages active={false} />} label="Images" />
          {imageRows.map((img, i) => (
            <Link
              key={img.id}
              href="/mojo/images"
              className="mojo-oracle-result"
              style={{ ...ROW_STYLE, display: 'flex', alignItems: 'center', gap: 10, animationDelay: `${i * 0.05}s` }}
            >
              {img.token && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${process.env.NEXT_PUBLIC_SITE_URL}/i/${img.token}.png`}
                  alt={img.title}
                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 0, border: '2px solid rgba(255,255,255,0.15)', outline: 'none', flexShrink: 0 }}
                />
              )}
              {img.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
