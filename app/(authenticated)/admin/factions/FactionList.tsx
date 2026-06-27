'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteFaction } from '@/lib/actions/admin-factions'

type Faction = {
  id: string
  name: string
  slug: string
  color_hex: string
  description: string
  leader_title: string
  display_order: number
}

interface FactionListProps {
  factions: Faction[]
  characterCounts: Record<string, number>
}

export default function FactionList({ factions, characterCounts }: FactionListProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleteLoading(true)
    setDeleteError(null)
    const result = await deleteFaction(id)
    setDeleteLoading(false)
    if ('error' in result && result.error) {
      setDeleteError(result.error)
    } else {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--f-heading)',
          fontSize: '1.9rem',
          fontWeight: 700,
          color: 'var(--roseash)',
          margin: 0,
        }}>
          Faction Manager
        </h1>
        <Link
          href="/admin/factions?create=true"
          style={{
            padding: '9px 18px',
            background: 'var(--ember)',
            color: 'var(--roseash)',
            borderRadius: 'var(--r-sm)',
            fontFamily: 'var(--f-ui)',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          + Create New Faction
        </Link>
      </div>

      {deleteError && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--raised)',
          border: '1px solid var(--ember)',
          borderRadius: 'var(--r-sm)',
          fontFamily: 'var(--f-body)',
          fontSize: '0.88rem',
          color: 'var(--ember-light)',
          marginBottom: 20,
        }}>
          {deleteError}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {factions.map((faction) => {
          const charCount = characterCounts[faction.id] ?? 0
          const isTargeted = deleteTarget === faction.id

          return (
            <div
              key={faction.id}
              style={{
                background: 'var(--claret)',
                border: `1px solid ${faction.color_hex}44`,
                borderLeft: `4px solid ${faction.color_hex}`,
                borderRadius: 'var(--r-md)',
                padding: 20,
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                {/* Color swatch */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--r-sm)',
                  background: faction.color_hex,
                  flexShrink: 0,
                  boxShadow: `0 0 12px ${faction.color_hex}55`,
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--f-heading)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--roseash)',
                    }}>
                      {faction.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.62rem',
                      letterSpacing: '0.08em',
                      color: faction.color_hex,
                      textTransform: 'uppercase',
                    }}>
                      {faction.leader_title}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.06em',
                    color: 'var(--faded)',
                    marginTop: 2,
                  }}>
                    /{faction.slug} · order {faction.display_order} · {charCount} character{charCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Link
                    href={`/admin/factions?edit=${faction.id}`}
                    style={{
                      padding: '6px 14px',
                      background: 'var(--raised)',
                      color: 'var(--mist)',
                      border: '1px solid var(--ember-dim)',
                      borderRadius: 'var(--r-sm)',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.06em',
                      textDecoration: 'none',
                    }}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null)
                      setDeleteTarget(isTargeted ? null : faction.id)
                    }}
                    style={{
                      padding: '6px 14px',
                      background: isTargeted ? 'var(--ember-dim)' : 'var(--raised)',
                      color: isTargeted ? 'var(--ember-light)' : 'var(--mist)',
                      border: '1px solid var(--ember-dim)',
                      borderRadius: 'var(--r-sm)',
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Description excerpt */}
              {faction.description && (
                <p style={{
                  fontFamily: 'var(--f-body)',
                  fontStyle: 'italic',
                  fontSize: '0.85rem',
                  color: 'var(--mist)',
                  margin: 0,
                  marginBottom: isTargeted ? 14 : 0,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {faction.description}
                </p>
              )}

              {/* Delete confirmation */}
              {isTargeted && (
                <div style={{
                  background: 'var(--raised)',
                  border: '1px solid var(--ember)',
                  borderRadius: 'var(--r-sm)',
                  padding: 14,
                }}>
                  {charCount > 0 ? (
                    <p style={{
                      fontFamily: 'var(--f-body)',
                      fontSize: '0.88rem',
                      color: 'var(--ember-light)',
                      margin: 0,
                    }}>
                      Cannot delete — {charCount} character{charCount !== 1 ? 's are' : ' is'} in this faction. Reassign them first.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <p style={{
                        fontFamily: 'var(--f-body)',
                        fontSize: '0.88rem',
                        color: 'var(--roseash)',
                        margin: 0,
                        flex: 1,
                      }}>
                        Delete <strong>{faction.name}</strong>? This cannot be undone.
                      </p>
                      <button
                        type="button"
                        disabled={deleteLoading}
                        onClick={() => handleDelete(faction.id)}
                        style={{
                          padding: '6px 14px',
                          background: 'var(--ember)',
                          color: 'var(--roseash)',
                          border: 'none',
                          borderRadius: 'var(--r-sm)',
                          fontFamily: 'var(--f-ui)',
                          fontSize: '0.68rem',
                          letterSpacing: '0.06em',
                          cursor: deleteLoading ? 'not-allowed' : 'pointer',
                          opacity: deleteLoading ? 0.6 : 1,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {deleteLoading ? 'Deleting…' : 'Confirm Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(null)}
                        style={{
                          padding: '6px 12px',
                          background: 'transparent',
                          color: 'var(--mist)',
                          border: '1px solid var(--ember-dim)',
                          borderRadius: 'var(--r-sm)',
                          fontFamily: 'var(--f-ui)',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {factions.length === 0 && (
        <p style={{
          fontFamily: 'var(--f-body)',
          fontStyle: 'italic',
          color: 'var(--mist)',
          marginTop: 32,
        }}>
          No factions found. Create the first one above.
        </p>
      )}
    </div>
  )
}
