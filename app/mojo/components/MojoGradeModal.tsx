'use client'

import { useState } from 'react'
import { submitGrade } from '@/lib/actions/mojo'

// Mirrors the WEEK_WORDS map in lib/actions/mojo.ts submitGrade() —
// client-side preview only, display, not editable (FIX-045-C).
const WEEK_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20,
}

function reloadPage() {
  window.location.href = window.location.href
}

export default function MojoGradeModal({
  submissionId,
  studentName,
  threadTitle,
  className,
  characterName,
}: {
  submissionId: string
  studentName: string
  threadTitle: string
  className: string
  characterName: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [gradePoints, setGradePoints] = useState<number | null>(null)
  const [bonusPoints, setBonusPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetAndClose() {
    setIsOpen(false)
    setGradePoints(null)
    setBonusPoints(0)
    setLoading(false)
    setError(null)
  }

  async function handleSave() {
    if (gradePoints === null) return
    setLoading(true)
    setError(null)
    const result = await submitGrade(submissionId, gradePoints, bonusPoints)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      reloadPage()
    }
  }

  const weekMatch = threadTitle.match(/week\s+(\w+)/i)
  const weekWord = weekMatch?.[1]?.toLowerCase() ?? null
  const weekNumber = weekWord ? (WEEK_WORDS[weekWord] ?? null) : null
  const weekLabel = weekNumber ?? weekWord ?? '?'

  const previewLines =
    gradePoints !== null
      ? [
          `Student Name: ${studentName}`,
          `Student Lesson Grade: ${gradePoints} Points`,
          ...(bonusPoints > 0 ? [`Bonus Point(s): ${bonusPoints}`] : []),
          `Signed, ${characterName} — ${className} Lesson ${weekLabel}`,
        ]
      : []

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          background: 'var(--ember)',
          color: '#ece6f8',
          border: 'none',
          borderRadius: 2,
          padding: '6px 16px',
          fontFamily: 'var(--f-ui)',
          fontSize: '0.75rem',
          cursor: 'pointer',
        }}
      >
        Grade Submission
      </button>
    )
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 499,
        }}
        onClick={resetAndClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Grade Submission"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 500,
          width: '90%',
          maxWidth: '480px',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'var(--raised)',
          border: '1px solid var(--elevated)',
          borderRadius: 4,
          padding: '24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}
      >
        <h2
          style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--roseash)',
            margin: '0 0 16px',
          }}
        >
          Grade Submission
        </h2>

        {/* Read-only info block */}
        <div
          style={{
            background: 'var(--char)',
            border: '1px solid var(--elevated)',
            borderRadius: 2,
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--mist)' }}>
            Student: <span style={{ color: 'var(--roseash)' }}>{studentName}</span>
          </span>
          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--mist)' }}>
            Assignment: <span style={{ color: 'var(--roseash)' }}>{threadTitle}</span>
          </span>
          <span style={{ fontFamily: 'var(--f-body)', fontSize: '0.85rem', color: 'var(--mist)' }}>
            Class: <span style={{ color: 'var(--roseash)' }}>{className}</span>
          </span>
        </div>

        {/* Grade Points selector */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
              marginBottom: '8px',
            }}
          >
            Lesson Grade (Points)
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setGradePoints(n)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.9rem',
                  border: '1px solid',
                  borderColor: gradePoints === n ? 'var(--ember)' : 'var(--elevated)',
                  background: gradePoints === n ? 'rgba(96,64,192,0.25)' : 'transparent',
                  color: gradePoints === n ? '#ece6f8' : 'var(--faded)',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Bonus Points selector */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
              marginBottom: '8px',
            }}
          >
            Bonus Points
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setBonusPoints(n)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  fontFamily: 'var(--f-ui)',
                  fontSize: '0.9rem',
                  border: '1px solid',
                  borderColor: bonusPoints === n ? 'var(--ember)' : 'var(--elevated)',
                  background: bonusPoints === n ? 'rgba(96,64,192,0.25)' : 'transparent',
                  color: bonusPoints === n ? '#ece6f8' : 'var(--faded)',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Grade preview — display only, not editable */}
        {gradePoints !== null && (
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'Cinzel, serif',
                fontSize: '10px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--faded)',
                marginBottom: '8px',
              }}
            >
              Preview
            </label>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'EB Garamond, serif',
                fontSize: '13px',
                color: 'var(--mist)',
                background: 'var(--char)',
                border: '1px solid var(--elevated)',
                borderRadius: 2,
                padding: '10px 14px',
                margin: 0,
              }}
            >
              {previewLines.join('\n')}
            </pre>
          </div>
        )}

        {/* Save / Cancel */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={gradePoints === null || loading}
            style={{
              background: 'var(--ember)',
              color: '#ece6f8',
              border: 'none',
              borderRadius: 2,
              padding: '8px 20px',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.8rem',
              cursor: gradePoints === null || loading ? 'not-allowed' : 'pointer',
              opacity: gradePoints === null || loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Submitting…' : 'Submit Grade'}
          </button>
          <button
            type="button"
            onClick={resetAndClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--faded)',
              fontFamily: 'var(--f-body)',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>

        {error && (
          <p
            style={{
              fontFamily: 'var(--f-body)',
              fontSize: '0.8rem',
              color: 'var(--ember)',
              marginTop: '12px',
            }}
          >
            {error}
          </p>
        )}
      </div>
    </>
  )
}
