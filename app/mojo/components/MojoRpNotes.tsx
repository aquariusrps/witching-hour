'use client'

import { useState } from 'react'
import { updateMojoRp } from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'

const TABS = [
  { key: 'plot', label: 'Plot Threads', field: 'notes_plot' },
  { key: 'partners', label: 'Partner Info', field: 'notes_partners' },
  { key: 'misc', label: 'Misc Notes', field: 'notes_misc' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function MojoRpNotes({
  rpId,
  initialPlot,
  initialPartners,
  initialMisc,
}: {
  rpId: string
  initialPlot: string | null
  initialPartners: string | null
  initialMisc: string | null
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('plot')
  const [notes, setNotes] = useState({
    plot: initialPlot ?? '',
    partners: initialPartners ?? '',
    misc: initialMisc ?? '',
  })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentTab = TABS.find((t) => t.key === activeTab)!
  const currentValue = notes[activeTab]

  function selectTab(key: TabKey) {
    setActiveTab(key)
    setEditing(false)
    setError(null)
  }

  function startEdit() {
    setDraft(currentValue)
    setError(null)
    setEditing(true)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)

    const fd = new FormData()
    fd.set(currentTab.field, draft)

    const result = await updateMojoRp(rpId, fd)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    setNotes((prev) => ({ ...prev, [activeTab]: draft }))
    setEditing(false)
  }

  return (
    <div style={{ background: 'var(--claret)', border: '1px solid var(--elevated)', borderRadius: 4, padding: 18 }}>
      <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid var(--elevated)', marginBottom: 14 }}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => selectTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 0 10px',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
                color: isActive ? 'var(--gold)' : 'var(--faded)',
                borderBottom: isActive ? '1px solid var(--ember)' : '1px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {!editing && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <button
            type="button"
            onClick={startEdit}
            aria-label="Edit notes"
            style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ✎
          </button>
        </div>
      )}

      {error && (
        <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember-light)', margin: '0 0 8px' }}>
          {error}
        </p>
      )}

      {editing ? (
        <div>
          <MojoRichTextEditor
            content={draft}
            onChange={setDraft}
            minHeight="160px"
            autoFocus
          />
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              style={{
                background: 'var(--ember)',
                color: 'var(--roseash)',
                border: 'none',
                borderRadius: 2,
                padding: '6px 16px',
                fontFamily: 'var(--f-ui)',
                fontSize: '0.75rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null) }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--faded)',
                marginLeft: 12,
                fontFamily: 'var(--f-body)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : currentValue ? (
        <MojoRichTextEditor content={currentValue} onChange={() => {}} readonly />
      ) : (
        <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--faded)', margin: 0 }}>
          No notes yet.
        </p>
      )}
    </div>
  )
}
