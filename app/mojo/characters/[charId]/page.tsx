import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  getMojoCharacter,
  getMojoCharacterThreads,
  getMojoFaceclaims,
  getMojoCharacterResources,
  getMojoFaceclaimResources,
  getMojoImageStacks,
  getMojoAvatars,
} from '@/lib/db/mojo'
import MojoCharacterArchiveToggle from '@/app/mojo/components/MojoCharacterArchiveToggle'
import MojoCharacterTabs from '@/app/mojo/components/MojoCharacterTabs'
import MojoFaceclaimAssign from '@/app/mojo/components/MojoFaceclaimAssign'
import { SvgIvyTrail, SvgMedallion, SvgCrescent, SvgPageHeaderRule } from '@/app/mojo/components/MojoSvgAssets'

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
  const characterStacks = await getMojoImageStacks({ character_id: charId })
  const characterAvatars = await getMojoAvatars({ character_id: charId })
  const isArchived = character.status === 'archived'

  // Medallion avatar: primary stack token → most recent avatar token →
  // placeholder, mirroring the priority established in getMojoDashboardData().
  const primaryStack = character.primary_stack_id
    ? characterStacks.find((s) => s.id === character.primary_stack_id)
    : undefined
  const avatarToken = primaryStack?.token ?? characterAvatars[0]?.token ?? null
  const avatarUrl = avatarToken ? `${process.env.NEXT_PUBLIC_SITE_URL}/i/${avatarToken}` : null

  return (
    <div style={{ padding: '28px 32px 64px', position: 'relative' }}>
      {/* The Dossier stamp */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '40px',
          right: '-10px',
          fontFamily: 'Cinzel, serif',
          fontSize: '64px',
          fontWeight: 700,
          letterSpacing: '0.25em',
          color: 'var(--roseash)',
          opacity: 0.025,
          transform: 'rotate(-8deg)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          whiteSpace: 'nowrap',
        }}
      >
        DOSSIER
      </div>

      {/* Character header banner */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: `
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.008) 0px,
              rgba(255,255,255,0.008) 1px,
              transparent 1px,
              transparent 3px
            ),
            var(--raised)
          `,
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '4px 4px 0 0',
          padding: '20px 24px 16px',
          marginBottom: 0,
          overflow: 'hidden',
        }}
      >
        {/* Ivy decoration — left side */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          color: 'var(--mist)',
          pointerEvents: 'none',
        }} aria-hidden="true">
          <SvgIvyTrail width={140} height={80} flip={false} />
        </div>

        {/* Ivy decoration — right side (mirrored) */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0,
          color: 'var(--mist)',
          pointerEvents: 'none',
        }} aria-hidden="true">
          <SvgIvyTrail width={140} height={80} flip={true} />
        </div>

        {/* Main header content — centred */}
        <div style={{
          position: 'relative',
          textAlign: 'center',
          padding: '0 100px',
        }}>
          {/* Character name */}
          <h1 style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: '38px',
            fontWeight: 600,
            color: 'var(--gold)',
            margin: '0 0 4px',
            letterSpacing: '0.04em',
            textShadow: '0 0 40px rgba(160,40,64,0.25)',
            lineHeight: 1.15,
          }}>
            {character.name}
          </h1>

          {/* Faceclaim name */}
          {character.faceclaim_name && (
            <p style={{
              fontFamily: 'EB Garamond, serif',
              fontSize: '15px',
              fontStyle: 'italic',
              color: 'var(--mist)',
              margin: '0 0 6px',
            }}>
              {character.faceclaim_name}
            </p>
          )}

          {/* RP name + status badge row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '4px',
          }}>
            <Link
              href={`/mojo/rps/${character.rp_id}`}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: 'var(--faded)',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              {character.rp_name}
            </Link>
            {isArchived && (
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '9px',
                letterSpacing: '0.15em',
                color: 'var(--faded)',
                border: '1px solid var(--elevated)',
                padding: '1px 6px',
                transform: 'rotate(2deg)',
                display: 'inline-block',
              }}>
                ARCHIVED
              </span>
            )}
          </div>
        </div>

        {/* Crescent decoration top-right */}
        <div style={{
          position: 'absolute',
          top: '8px', right: '16px',
          color: 'var(--mist)',
          opacity: 0.5,
          pointerEvents: 'none',
        }} aria-hidden="true">
          <SvgCrescent size={36} idSuffix="char-header" />
        </div>

        {/* Header rule at bottom */}
        <div style={{
          marginTop: '14px',
          color: 'var(--elevated)',
        }}>
          <SvgPageHeaderRule />
        </div>
      </div>

      {/* Medallion avatar + metadata strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        padding: '16px 24px',
        background: 'var(--raised)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Medallion avatar */}
        <div style={{
          position: 'relative',
          width: '140px',
          height: '140px',
          flexShrink: 0,
          color: 'var(--mist)',
          animation: 'mojo-float 5s ease-in-out infinite',
        }}>
          {/* Avatar clip circle — sits behind the SVG medallion overlay */}
          <div style={{
            position: 'absolute',
            top: '11px', left: '11px',
            width: '118px', height: '118px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'var(--elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={character.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <svg viewBox="0 0 60 60" style={{
                width: '40px', opacity: 0.25,
                filter: 'drop-shadow(0 0 8px rgba(96,64,192,0.2))',
              }}>
                <circle cx="30" cy="22" r="12" fill="currentColor" />
                <ellipse cx="30" cy="50" rx="18" ry="12" fill="currentColor" />
              </svg>
            )}
          </div>
          {/* SVG medallion frame overlay */}
          <SvgMedallion size={140} idSuffix="char-sheet" />
        </div>

        {/* Character metadata — right of medallion */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MojoFaceclaimAssign
            characterId={character.id}
            currentFaceclaimId={character.faceclaim_id}
            currentFaceclaimName={character.faceclaim_name}
            allFaceclaims={allFaceclaims.map((fc) => ({ id: fc.id, name: fc.name }))}
          />
          <MojoCharacterArchiveToggle
            charId={character.id}
            status={isArchived ? 'archived' : 'active'}
          />
        </div>
      </div>

      <Suspense fallback={null}>
        <MojoCharacterTabs
          character={character}
          threads={threads}
          charId={character.id}
          rpId={character.rp_id}
          resources={characterResources}
          faceclaimResources={faceclaimResources}
          faceclaimName={character.faceclaim_name}
          characterStacks={characterStacks}
          characterAvatars={characterAvatars}
        />
      </Suspense>
    </div>
  )
}
