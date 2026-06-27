'use client'

import { useState, useRef } from 'react'
import { createBoard, updateBoard } from '@/lib/actions/admin-boards'
import type { BoardNode } from '@/lib/cached-settings'
import getBrowserClient from '@/lib/supabase/browserClient'

type Faction = {
  id: string
  name: string
  color_hex: string
  slug: string
  description: string
  lore: string
  leader_user_id: string | null
  leader_title: string
  display_order: number
}

type ModalContext = {
  parentId: string | null
  isCategory: boolean
  editTarget?: BoardNode
}

type ThemeOption = { value: string; label: string }

const VALID_SCOPES = ['public', 'rp', 'faction', 'staff', 'admin'] as const

export default function BoardFormModal({
  mode,
  context,
  factions,
  themeOptions,
  onClose,
}: {
  mode: 'create' | 'edit'
  context: ModalContext
  factions: Faction[]
  themeOptions: ThemeOption[]
  onClose: () => void
}) {
  const target = context.editTarget

  const [name, setName] = useState(target?.name ?? '')
  const [description, setDescription] = useState(target?.description ?? '')
  const [isCategory, setIsCategory] = useState(
    mode === 'create' ? context.isCategory : (target?.is_category ?? false)
  )
  const [scope, setScope] = useState<string>(target?.scope ?? 'public')
  const [scopeId, setScopeId] = useState<string>(target?.scope_id ?? '')
  const [isRpBoard, setIsRpBoard] = useState(target?.is_rp_board ?? false)
  const [discordAnnounce, setDiscordAnnounce] = useState(target?.discord_announce ?? false)
  const [staffOnlyThreads, setStaffOnlyThreads] = useState(target?.staff_only_threads ?? false)
  const [minLevel, setMinLevel] = useState<string>(
    target?.min_level_required != null ? String(target.min_level_required) : ''
  )
  const [forcedTheme, setForcedTheme] = useState(target?.forced_theme ?? '')
  const [iconPreview, setIconPreview] = useState<string>(target?.icon_url ?? '')
  const [iconUrl, setIconUrl] = useState<string>(target?.icon_url ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop() ?? 'png'
    const tempId = crypto.randomUUID()
    const path = `board-icons/${tempId}-${Date.now()}.${ext}`

    const browserSupabase = getBrowserClient()
    const { data, error: uploadError } = await browserSupabase
      .storage
      .from('rich-text-images')
      .upload(path, file, { upsert: false })

    if (uploadError || !data) {
      setError('Image upload failed: ' + (uploadError?.message ?? 'Unknown error'))
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = browserSupabase
      .storage
      .from('rich-text-images')
      .getPublicUrl(data.path)

    setIconPreview(publicUrl)
    setIconUrl(publicUrl)
    setUploading(false)
  }

  async function handleSubmit() {
    setError(null)
    setSaving(true)

    let result: { error: string } | { success: true; id?: string }

    if (mode === 'create') {
      result = await createBoard({
        name,
        description: description || undefined,
        parent_id: context.parentId,
        is_category: isCategory,
        scope: scope as typeof VALID_SCOPES[number],
        scope_id: scopeId || null,
        is_rp_board: isRpBoard,
        discord_announce: discordAnnounce,
        staff_only_threads: staffOnlyThreads,
        min_level_required: minLevel ? parseInt(minLevel, 10) : null,
        forced_theme: forcedTheme || null,
        icon_url: iconUrl || null,
      })
    } else {
      result = await updateBoard(target!.id, {
        name,
        description: description || null,
        icon_url: iconUrl || null,
        scope: scope as typeof VALID_SCOPES[number],
        scope_id: scopeId || null,
        is_rp_board: isRpBoard,
        discord_announce: discordAnnounce,
        staff_only_threads: staffOnlyThreads,
        min_level_required: minLevel ? parseInt(minLevel, 10) : null,
        forced_theme: forcedTheme || null,
      })
    }

    setSaving(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    onClose()
    window.location.reload()
  }

  const showScopeFields = !isCategory
  const showFactionSelect = scope === 'faction'
  const showRpToggle = scope === 'rp' || scope === 'public'
  const canToggleCategory = mode === 'create' && context.parentId === null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(16,8,8,0.90)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          background: 'var(--elevated)',
          border: '1px solid var(--ember-dim)',
          borderRadius: 4,
          padding: '28px 32px',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{
          fontFamily: 'var(--f-head)',
          fontSize: '1.2rem',
          fontWeight: 600,
          color: 'var(--roseash)',
          marginBottom: 20,
        }}>
          {mode === 'create' ? 'Create Board' : `Edit: ${target?.name}`}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name */}
          <Field label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Board name"
              style={inputStyle}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 56 }}
            />
          </Field>

          {/* is_category toggle — create root only */}
          {canToggleCategory && (
            <Field label="Type">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isCategory}
                  onChange={(e) => {
                    setIsCategory(e.target.checked)
                    if (e.target.checked) {
                      setScope('public')
                      setScopeId('')
                    }
                  }}
                  style={{ accentColor: 'var(--ember)', width: 14, height: 14 }}
                />
                <span style={{ fontFamily: 'var(--f-body)', color: 'var(--roseash)', fontSize: '0.9rem' }}>
                  This is a top-level category (not a forum)
                </span>
              </label>
            </Field>
          )}

          {/* Scope */}
          {showScopeFields && (
            <Field label="Scope">
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value)
                  if (e.target.value !== 'faction') setScopeId('')
                }}
                style={inputStyle}
              >
                {VALID_SCOPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Faction select */}
          {showScopeFields && showFactionSelect && (
            <Field label="Faction">
              <select
                value={scopeId}
                onChange={(e) => setScopeId(e.target.value)}
                style={inputStyle}
              >
                <option value="">— Select faction —</option>
                {factions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* RP board toggle */}
          {showScopeFields && showRpToggle && (
            <Field label="RP Board">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isRpBoard}
                  onChange={(e) => setIsRpBoard(e.target.checked)}
                  style={{ accentColor: 'var(--moonstone)', width: 14, height: 14 }}
                />
                <span style={{ fontFamily: 'var(--f-body)', color: 'var(--roseash)', fontSize: '0.9rem' }}>
                  Enable IC roleplay posting
                </span>
              </label>
            </Field>
          )}

          {/* Discord announce */}
          {showScopeFields && (
            <Field label="Discord">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={discordAnnounce}
                  onChange={(e) => setDiscordAnnounce(e.target.checked)}
                  style={{ accentColor: 'var(--gold)', width: 14, height: 14 }}
                />
                <span style={{ fontFamily: 'var(--f-body)', color: 'var(--roseash)', fontSize: '0.9rem' }}>
                  Announce new threads to Discord
                </span>
              </label>
            </Field>
          )}

          {/* Staff-only thread creation */}
          {showScopeFields && (
            <Field label="Thread Creation">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={staffOnlyThreads}
                  onChange={(e) => setStaffOnlyThreads(e.target.checked)}
                  style={{ accentColor: 'var(--ember)', width: 14, height: 14 }}
                />
                <span style={{ fontFamily: 'var(--f-body)', color: 'var(--roseash)', fontSize: '0.9rem' }}>
                  Staff-only thread creation
                </span>
              </label>
              <p style={{
                fontFamily: 'var(--f-body)',
                fontSize: '0.78rem',
                fontStyle: 'italic',
                color: 'var(--mist)',
                marginTop: 4,
              }}>
                When enabled, only moderators and staff can start new threads in this board. All users can still reply.
              </p>
            </Field>
          )}

          {/* Min level */}
          {showScopeFields && (
            <Field label="Min Level">
              <input
                type="number"
                value={minLevel}
                onChange={(e) => setMinLevel(e.target.value)}
                placeholder="No minimum"
                min={1}
                style={{ ...inputStyle, width: 120 }}
              />
            </Field>
          )}

          {/* Forced theme */}
          {showScopeFields && (
            <Field label="Forced Theme">
              <select
                value={forcedTheme}
                onChange={(e) => setForcedTheme(e.target.value)}
                style={inputStyle}
              >
                {themeOptions.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Icon upload */}
          {showScopeFields && (
            <Field label="Icon">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {iconPreview && (
                  <img
                    src={iconPreview}
                    alt="Board icon preview"
                    width={48}
                    height={48}
                    style={{ borderRadius: 2, objectFit: 'cover', border: '1px solid var(--ember-dim)' }}
                  />
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      fontFamily: 'var(--f-ui)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      background: 'transparent',
                      color: 'var(--mist)',
                      border: '1px solid var(--ember-dim)',
                      borderRadius: 2,
                      padding: '4px 10px',
                      cursor: uploading ? 'wait' : 'pointer',
                    }}
                  >
                    {uploading ? 'Uploading…' : iconPreview ? 'Replace image' : 'Upload image'}
                  </button>
                  <p style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '0.72rem',
                    color: 'var(--faded)',
                    marginTop: 4,
                  }}>
                    48×48 recommended. Stored in Supabase Storage.
                  </p>
                </div>
              </div>
            </Field>
          )}

        </div>

        {/* Error */}
        {error && (
          <p style={{
            fontFamily: 'var(--f-body)',
            color: 'var(--ember)',
            fontSize: '0.85rem',
            marginTop: 16,
            fontStyle: 'italic',
          }}>
            {error}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: 'transparent',
              color: 'var(--mist)',
              border: '1px solid var(--ember-dim)',
              borderRadius: 2,
              padding: '6px 16px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploading}
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: saving || uploading ? 'var(--ember-dim)' : 'var(--ember)',
              color: 'var(--char)',
              border: 'none',
              borderRadius: 2,
              padding: '6px 18px',
              cursor: saving || uploading ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: 'var(--f-ui)',
        fontSize: '0.68rem',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'var(--faded)',
        marginBottom: 5,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--f-body)',
  fontSize: '0.9rem',
  color: 'var(--roseash)',
  background: 'var(--raised)',
  border: '1px solid var(--ember-dim)',
  borderRadius: 2,
  padding: '7px 10px',
  outline: 'none',
  boxSizing: 'border-box',
}
