'use client'

import { useState } from 'react'
import Link from 'next/link'
import { setCharacterPrimaryStack } from '@/lib/actions/mojo'
import MojoStackUrlCopy from './MojoStackUrlCopy'
import type { Tables } from '@/types/database'

type MojoImageStack = Tables<'mojo_image_stacks'>

const SUB_TABS = [
  { key: 'images', label: 'Images' },
  { key: 'stacks', label: 'Stacks' },
] as const

type SubTabKey = (typeof SUB_TABS)[number]['key']

const ROTATION_BADGE_COLOR: Record<string, string> = {
  truly_random: 'var(--moonstone)',
  weighted: 'var(--gold)',
  sequential: 'var(--ember)',
  no_repeat: 'var(--mist)',
}

const ROTATION_LABEL: Record<string, string> = {
  truly_random: 'Truly Random',
  weighted: 'Weighted',
  sequential: 'Sequential',
  no_repeat: 'No Repeat',
}

function StackRow({
  stack,
  isPrimary,
}: {
  stack: MojoImageStack & { member_count: number }
  isPrimary: boolean
}) {
  const proxyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/i/${stack.token}`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--claret)',
        border: '1px solid var(--elevated)',
        borderRadius: 4,
        padding: '10px 14px',
        marginBottom: 8,
      }}
    >
      {stack.member_count > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxyUrl}
          alt={stack.label}
          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--f-head)', fontSize: '0.875rem', color: 'var(--roseash)' }}>
            {stack.label}
          </span>
          <span
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              color: ROTATION_BADGE_COLOR[stack.rotation_mode] ?? 'var(--faded)',
            }}
          >
            {ROTATION_LABEL[stack.rotation_mode] ?? stack.rotation_mode}
          </span>
          {isPrimary && (
            <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.6rem', color: 'var(--gold)' }}>
              ★ Primary
            </span>
          )}
          <span style={{ fontFamily: 'var(--f-ui)', fontSize: '0.65rem', color: 'var(--faded)' }}>
            {stack.member_count} images
          </span>
        </div>
        <div style={{ marginTop: 4, maxWidth: 320 }}>
          <MojoStackUrlCopy url={proxyUrl} />
        </div>
      </div>

      <Link
        href="/mojo/stacks"
        style={{ fontFamily: 'var(--f-body)', fontSize: '0.8125rem', color: 'var(--faded)', textDecoration: 'none', flexShrink: 0 }}
      >
        Manage →
      </Link>
    </div>
  )
}

export default function MojoCharacterAvatarTabs({
  charId,
  characterStacks,
  primaryStackId,
}: {
  charId: string
  rpId: string
  characterStacks: Array<MojoImageStack & { member_count: number }>
  primaryStackId: string | null
}) {
  const [subTab, setSubTab] = useState<SubTabKey>('stacks')
  const [primary, setPrimary] = useState(primaryStackId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePrimaryChange(value: string) {
    const stackId = value || null
    setLoading(true)
    setError(null)
    const result = await setCharacterPrimaryStack(charId, stackId)
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setPrimary(stackId)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {SUB_TABS.map((tab) => {
          const isActive = tab.key === subTab
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSubTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 14px',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                color: isActive ? 'var(--gold)' : 'var(--faded)',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {subTab === 'images' && (
        <div>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.375rem', color: 'var(--gold)', margin: '0 0 8px' }}>
            Images
          </h2>
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.9375rem', color: 'var(--mist)', margin: 0 }}>
            Avatar image upload with crop, resize, and bulk queue — coming in MOJO-4B.
          </p>
        </div>
      )}

      {subTab === 'stacks' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--f-head)', fontSize: '1rem', color: 'var(--roseash)' }}>
              Image Stacks
            </span>
            <Link
              href={`/mojo/stacks?character_id=${charId}`}
              style={{ fontFamily: 'var(--f-ui)', fontSize: '0.75rem', color: 'var(--gold)', textDecoration: 'none' }}
            >
              + Create Stack
            </Link>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'var(--f-ui)', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faded)', marginBottom: 4 }}>
              Primary Stack
            </label>
            {characterStacks.length === 0 ? (
              <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.8125rem', color: 'var(--faded)', margin: 0 }}>
                No stacks yet.
              </p>
            ) : (
              <>
                {error && (
                  <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 6px' }}>{error}</p>
                )}
                <select
                  value={primary ?? ''}
                  disabled={loading}
                  onChange={(e) => handlePrimaryChange(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    background: 'var(--raised)',
                    color: 'var(--roseash)',
                    border: '1px solid var(--elevated)',
                    borderRadius: 2,
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.8125rem',
                    outline: 'none',
                  }}
                >
                  <option value="">— None —</option>
                  {characterStacks.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--faded)', margin: '6px 0 0' }}>
                  This stack&rsquo;s URL is your primary rotating avatar.
                </p>
              </>
            )}
          </div>

          {characterStacks.length === 0 ? (
            <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', color: 'var(--faded)' }}>
              No image stacks assigned to this character. Create one from the Stacks page or assign an existing stack there.
            </p>
          ) : (
            <div>
              {characterStacks.map((s) => (
                <StackRow key={s.id} stack={s} isPrimary={s.id === primary} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
