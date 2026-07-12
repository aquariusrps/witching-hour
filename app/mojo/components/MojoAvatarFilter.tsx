'use client'

export type MojoAvatarFilterTab = { key: string; label: string }

export default function MojoAvatarFilter({
  tabs,
  activeKey,
  onChange,
}: {
  tabs: MojoAvatarFilterTab[]
  activeKey: string
  onChange: (key: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.75rem',
              color: isActive ? 'var(--gold)' : 'var(--faded)',
              borderBottom: isActive ? '2px solid var(--ember)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
