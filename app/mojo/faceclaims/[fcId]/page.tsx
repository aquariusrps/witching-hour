import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMojoFaceclaimWithCharacters, getMojoFaceclaimResources, getMojoAvatars } from '@/lib/db/mojo'
import MojoFaceclaimNameEdit from '@/app/mojo/components/MojoFaceclaimNameEdit'
import MojoQuickCopyPanel from '@/app/mojo/components/MojoQuickCopyPanel'
import MojoAddResource from '@/app/mojo/components/MojoAddResource'
import MojoResourceList from '@/app/mojo/components/MojoResourceList'
import MojoFaceclaimAvatars from '@/app/mojo/components/MojoFaceclaimAvatars'
import {
  SvgGalleryCorridor,
  SvgCrescent,
  SvgFlourishUnderline,
  SvgPageHeaderRule,
  SvgNavFaceclaims,
  SvgNavLibrary,
} from '@/app/mojo/components/MojoSvgAssets'

function FiligreeDivider() {
  return (
    <div style={{ height: 1, margin: '24px 0', background: 'linear-gradient(to right, var(--ember), var(--gold))', opacity: 0.4 }} />
  )
}

function SectionTypeHeader({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '10px',
      color: 'var(--faded)',
    }}>
      {icon}
      <span style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--elevated)', opacity: 0.4 }} />
    </div>
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
  const faceclaimAvatars = await getMojoAvatars({ faceclaim_id: fcId })

  return (
    <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto', padding: '28px 28px 64px' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '180px',
          color: 'var(--mist)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <SvgGalleryCorridor width={900} height={180} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Link
          href="/mojo/faceclaims"
          style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--faded)', textDecoration: 'none' }}
        >
          ← Faceclaims
        </Link>
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginBottom: '20px' }}>
        {/* Floating crescent — top right */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '0', right: '0',
          color: 'var(--mist)',
          opacity: 0.35,
          pointerEvents: 'none',
          animation: 'mojo-float 6s ease-in-out infinite',
        }}>
          <SvgCrescent size={60} idSuffix="fc-detail" />
        </div>

        {/* Existing name edit component — preserved exactly */}
        <div style={{ margin: '8px 0 4px' }}>
          <MojoFaceclaimNameEdit fcId={faceclaim.id} name={faceclaim.name} />
        </div>

        {/* Flourish underline */}
        <div style={{ color: 'var(--gold)', marginBottom: '12px' }}>
          <SvgFlourishUnderline width={Math.min(faceclaim.name.length * 18, 400)} />
        </div>

        {/* Stat line */}
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '11px',
          letterSpacing: '0.15em',
          color: 'var(--faded)',
          margin: '0 0 16px',
        }}>
          {faceclaim.characters.length} CHARACTER{faceclaim.characters.length !== 1 ? 'S' : ''}
          {faceclaimAvatars.length > 0 && ` · ${faceclaimAvatars.length} AVATAR${faceclaimAvatars.length !== 1 ? 'S' : ''}`}
        </p>

        <div style={{ color: 'var(--elevated)' }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginBottom: 8 }}>
        <SectionTypeHeader icon={<SvgNavFaceclaims active={false} />} label="Characters" />
        <div>
          {faceclaim.characters.length === 0 ? (
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--faded)', margin: 0 }}>
              No characters using this faceclaim.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {faceclaim.characters.map((c) => (
                <Link
                  key={c.id}
                  href={`/mojo/characters/${c.id}`}
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '11px',
                    color: 'var(--roseash)',
                    border: '1px solid var(--elevated)',
                    borderRadius: '2px',
                    padding: '2px 10px',
                    textDecoration: 'none',
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
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

      <SectionTypeHeader icon={<SvgNavLibrary active={false} />} label="Resources" />

      <MojoResourceList
        resources={resources}
        redirectPath={`/mojo/faceclaims/${faceclaim.id}`}
      />

      <FiligreeDivider />

      <h2 style={{ fontFamily: 'var(--f-head)', fontSize: '1.125rem', color: 'var(--roseash)', margin: '0 0 14px' }}>
        Avatars
      </h2>

      <MojoFaceclaimAvatars fcId={faceclaim.id} avatars={faceclaimAvatars} />
    </div>
  )
}
