'use client'

import { useState } from 'react'
import { updateMojoCharacter } from '@/lib/actions/mojo'
import MojoRichTextEditor from './MojoRichTextEditor'

const NOTE_TABS = [
  { key: 'plot', label: 'Plot Threads' },
  { key: 'partners', label: 'Partner Info' },
  { key: 'misc', label: 'Misc Notes' },
] as const

type NoteTabKey = (typeof NOTE_TABS)[number]['key']

function buildNotesPayload(tab: NoteTabKey, value: string) {
  if (tab === 'plot') return { notes_plot: value }
  if (tab === 'partners') return { notes_partners: value }
  return { notes_misc: value }
}

function FiligreeDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--ember), var(--gold))' }} />
      <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, var(--ember), var(--gold))' }} />
    </div>
  )
}

export default function MojoCharacterNotes({
  charId,
  character,
}: {
  charId: string
  rpId: string
  character: {
    bio: string | null
    notes_plot: string | null
    notes_partners: string | null
    notes_misc: string | null
  }
}) {
  const [bio, setBio] = useState(character.bio ?? '')
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [bioLoading, setBioLoading] = useState(false)
  const [bioError, setBioError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<NoteTabKey>('plot')
  const [notes, setNotes] = useState({
    plot: character.notes_plot ?? '',
    partners: character.notes_partners ?? '',
    misc: character.notes_misc ?? '',
  })
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)

  const currentNoteValue = notes[activeTab]

  function startBioEdit() {
    setBioDraft(bio)
    setBioError(null)
    setEditingBio(true)
  }

  async function saveBio() {
    setBioLoading(true)
    setBioError(null)
    const result = await updateMojoCharacter(charId, { bio: bioDraft })
    setBioLoading(false)

    if ('error' in result) {
      setBioError(result.error)
      return
    }

    setBio(bioDraft)
    setEditingBio(false)
  }

  function selectNoteTab(key: NoteTabKey) {
    setActiveTab(key)
    setEditingNotes(false)
    setNotesError(null)
  }

  function startNotesEdit() {
    setNotesDraft(currentNoteValue)
    setNotesError(null)
    setEditingNotes(true)
  }

  async function saveNotes() {
    setNotesLoading(true)
    setNotesError(null)
    const result = await updateMojoCharacter(charId, buildNotesPayload(activeTab, notesDraft))
    setNotesLoading(false)

    if ('error' in result) {
      setNotesError(result.error)
      return
    }

    setNotes((prev) => ({ ...prev, [activeTab]: notesDraft }))
    setEditingNotes(false)
  }

  return (
    <div>
      {/* Biography */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontFamily: 'var(--f-ui)',
            fontSize: '0.68rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--faded)',
          }}>
            Biography
          </span>
          {!editingBio && (
            <button
              type="button"
              onClick={startBioEdit}
              aria-label="Edit biography"
              style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              ✎
            </button>
          )}
        </div>

        {bioError && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 8px' }}>
            {bioError}
          </p>
        )}

        {editingBio ? (
          <div>
            <MojoRichTextEditor
              content={bioDraft}
              onChange={setBioDraft}
              minHeight="120px"
              autoFocus
            />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={saveBio}
                disabled={bioLoading}
                style={{
                  background: 'var(--ember)',
                  color: 'var(--roseash)',
                  border: 'none',
                  borderRadius: 2,
                  padding: '6px 16px',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.75rem',
                  cursor: bioLoading ? 'not-allowed' : 'pointer',
                  opacity: bioLoading ? 0.6 : 1,
                }}
              >
                {bioLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setEditingBio(false); setBioError(null) }}
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
        ) : bio ? (
          <MojoRichTextEditor content={bio} onChange={() => {}} readonly />
        ) : (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.94rem', color: 'var(--faded)', margin: 0 }}>
            No biography yet.
          </p>
        )}
      </div>

      <FiligreeDivider />

      {/* Notes tabs */}
      <div>
        <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid var(--elevated)', marginBottom: 14 }}>
          {NOTE_TABS.map((tab) => {
            const isActive = tab.key === activeTab
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => selectNoteTab(tab.key)}
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

        {!editingNotes && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button
              type="button"
              onClick={startNotesEdit}
              aria-label="Edit notes"
              style={{ background: 'none', border: 'none', color: 'var(--faded)', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              ✎
            </button>
          </div>
        )}

        {notesError && (
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '0.8rem', color: 'var(--ember)', margin: '0 0 8px' }}>
            {notesError}
          </p>
        )}

        {editingNotes ? (
          <div>
            <MojoRichTextEditor
              content={notesDraft}
              onChange={setNotesDraft}
              minHeight="160px"
              autoFocus
            />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={saveNotes}
                disabled={notesLoading}
                style={{
                  background: 'var(--ember)',
                  color: 'var(--roseash)',
                  border: 'none',
                  borderRadius: 2,
                  padding: '6px 16px',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.75rem',
                  cursor: notesLoading ? 'not-allowed' : 'pointer',
                  opacity: notesLoading ? 0.6 : 1,
                }}
              >
                {notesLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setEditingNotes(false); setNotesError(null) }}
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
        ) : currentNoteValue ? (
          <MojoRichTextEditor content={currentNoteValue} onChange={() => {}} readonly />
        ) : (
          <p style={{ fontFamily: 'var(--f-body)', fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--faded)', margin: 0 }}>
            No notes yet.
          </p>
        )}
      </div>
    </div>
  )
}
