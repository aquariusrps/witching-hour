'use client'

import { useState } from 'react'
import { updateMultipleSiteSettings } from '@/lib/actions/admin-settings'

interface SettingsFormProps {
  settings: Record<string, string>
}

type SaveStatus = { type: 'success' | 'error'; message: string } | null

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      cursor: 'pointer',
      marginBottom: 16,
    }}>
      <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, width: 36, height: 20, position: 'absolute', cursor: 'pointer', margin: 0, zIndex: 1 }}
        />
        <div style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked ? 'var(--ember)' : 'var(--raised)',
          border: '1px solid var(--ember-dim)',
          transition: 'background 0.2s',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: checked ? 'var(--roseash)' : 'var(--mist)',
            transition: 'left 0.2s',
          }} />
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--f-body)', fontSize: '0.9rem', color: 'var(--roseash)' }}>
          {label}
        </div>
        {description && (
          <div style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--mist)', marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
    </label>
  )
}

function FieldLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontFamily: 'var(--f-ui)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faded)' }}>
        {label}
      </div>
      {description && (
        <div style={{ fontFamily: 'var(--f-body)', fontSize: '0.78rem', color: 'var(--mist)', marginTop: 2 }}>
          {description}
        </div>
      )}
    </div>
  )
}

const INPUT_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  background: 'var(--raised)',
  border: '1px solid var(--ember-dim)',
  borderRadius: 'var(--r-sm)',
  fontFamily: 'var(--f-body)',
  fontSize: '0.9rem',
  color: 'var(--roseash)',
  outline: 'none',
  boxSizing: 'border-box',
}

const SECTION_STYLE: React.CSSProperties = {
  background: 'var(--claret)',
  border: '1px solid var(--ember-dim)',
  borderRadius: 'var(--r-md)',
  padding: 24,
  marginBottom: 24,
}

const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--f-ui)',
  fontSize: '0.65rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  marginBottom: 20,
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      style={{
        padding: '8px 20px',
        background: saving ? 'var(--raised)' : 'var(--ember)',
        color: 'var(--roseash)',
        border: 'none',
        borderRadius: 'var(--r-sm)',
        fontFamily: 'var(--f-ui)',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        cursor: saving ? 'not-allowed' : 'pointer',
        opacity: saving ? 0.6 : 1,
        transition: 'background 0.15s',
      }}
    >
      {saving ? 'Saving…' : 'Save'}
    </button>
  )
}

function StatusMessage({ status }: { status: SaveStatus }) {
  if (!status) return null
  return (
    <span style={{
      fontFamily: 'var(--f-body)',
      fontSize: '0.85rem',
      color: status.type === 'success' ? 'var(--gold)' : 'var(--ember)',
      marginLeft: 12,
    }}>
      {status.message}
    </span>
  )
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const s = settings

  // General section state
  const [siteName, setSiteName]           = useState(s.site_name ?? '')
  const [siteDesc, setSiteDesc]           = useState(s.site_description ?? '')
  const [regOpen, setRegOpen]             = useState(s.registration_open !== 'false')
  const [maintenance, setMaintenance]     = useState(s.maintenance_mode === 'true')
  const [launchDate, setLaunchDate]       = useState(s.launch_date ?? '')
  const [maxChars, setMaxChars]           = useState(s.max_characters_per_user ?? '5')
  const [rpIdle, setRpIdle]              = useState(s.rp_idle_days ?? '7')
  const [generalSaving, setGeneralSaving] = useState(false)
  const [generalStatus, setGeneralStatus] = useState<SaveStatus>(null)

  // Economy section state
  const [xpPerPost, setXpPerPost]             = useState(s.xp_per_rp_post ?? '10')
  const [essPerPost, setEssPerPost]           = useState(s.essence_per_rp_post ?? '5')
  const [offeringCost, setOfferingCost]       = useState(s.offering_cost ?? '50')
  const [offeringRefund, setOfferingRefund]   = useState(s.offering_refund_amount ?? '25')
  const [offeringCooldown, setOfferingCooldown] = useState(s.offering_cooldown_hours ?? '24')
  const [economySaving, setEconomySaving]     = useState(false)
  const [economyStatus, setEconomyStatus]     = useState<SaveStatus>(null)

  // Integrations section state
  const [discordWebhook, setDiscordWebhook]   = useState(s.discord_webhook_url ?? '')
  const [intSaving, setIntSaving]             = useState(false)
  const [intStatus, setIntStatus]             = useState<SaveStatus>(null)

  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault()
    setGeneralSaving(true)
    setGeneralStatus(null)
    const result = await updateMultipleSiteSettings({
      site_name:               siteName,
      site_description:        siteDesc,
      registration_open:       regOpen ? 'true' : 'false',
      maintenance_mode:        maintenance ? 'true' : 'false',
      launch_date:             launchDate,
      max_characters_per_user: maxChars,
      rp_idle_days:            rpIdle,
    })
    setGeneralSaving(false)
    if ('error' in result && result.error) {
      setGeneralStatus({ type: 'error', message: result.error })
    } else {
      setGeneralStatus({ type: 'success', message: 'Saved.' })
      setTimeout(() => setGeneralStatus(null), 2000)
    }
  }

  async function saveEconomy(e: React.FormEvent) {
    e.preventDefault()
    setEconomySaving(true)
    setEconomyStatus(null)
    const result = await updateMultipleSiteSettings({
      xp_per_rp_post:          xpPerPost,
      essence_per_rp_post:     essPerPost,
      offering_cost:           offeringCost,
      offering_refund_amount:  offeringRefund,
      offering_cooldown_hours: offeringCooldown,
    })
    setEconomySaving(false)
    if ('error' in result && result.error) {
      setEconomyStatus({ type: 'error', message: result.error })
    } else {
      setEconomyStatus({ type: 'success', message: 'Saved.' })
      setTimeout(() => setEconomyStatus(null), 2000)
    }
  }

  async function saveIntegrations(e: React.FormEvent) {
    e.preventDefault()
    setIntSaving(true)
    setIntStatus(null)
    const result = await updateMultipleSiteSettings({
      discord_webhook_url: discordWebhook,
    })
    setIntSaving(false)
    if ('error' in result && result.error) {
      setIntStatus({ type: 'error', message: result.error })
    } else {
      setIntStatus({ type: 'success', message: 'Saved.' })
      setTimeout(() => setIntStatus(null), 2000)
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* General Settings */}
      <form onSubmit={saveGeneral}>
        <div style={SECTION_STYLE}>
          <div style={SECTION_TITLE_STYLE}>General Settings</div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel label="Site Name" />
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              style={INPUT_STYLE}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel label="Site Description" />
            <textarea
              value={siteDesc}
              onChange={(e) => setSiteDesc(e.target.value)}
              rows={3}
              style={{ ...INPUT_STYLE, resize: 'vertical' }}
            />
          </div>

          <ToggleField
            label="Registration Open"
            description="Allow new users to register accounts."
            checked={regOpen}
            onChange={setRegOpen}
          />

          <ToggleField
            label="Maintenance Mode"
            description="Show a maintenance page to all non-admin visitors."
            checked={maintenance}
            onChange={setMaintenance}
          />

          <div style={{ marginBottom: 16 }}>
            <FieldLabel label="Launch Date" description="ISO format (YYYY-MM-DD). Used for founding member badge eligibility." />
            <input
              type="text"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
              placeholder="2026-07-01"
              style={INPUT_STYLE}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <FieldLabel label="Max Characters Per User" />
              <input
                type="number"
                min={1}
                max={20}
                value={maxChars}
                onChange={(e) => setMaxChars(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <FieldLabel label="RP Idle Days" description="Days before a thread is considered idle in My Threads tracker." />
              <input
                type="number"
                min={1}
                max={30}
                value={rpIdle}
                onChange={(e) => setRpIdle(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
            <SaveButton saving={generalSaving} />
            <StatusMessage status={generalStatus} />
          </div>
        </div>
      </form>

      {/* Economy Settings */}
      <form onSubmit={saveEconomy}>
        <div style={SECTION_STYLE}>
          <div style={SECTION_TITLE_STYLE}>Economy Settings</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <FieldLabel label="XP Per RP Post" description="XP awarded per RP post." />
              <input
                type="number"
                min={0}
                value={xpPerPost}
                onChange={(e) => setXpPerPost(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <FieldLabel label="Essence Per RP Post" description="Essence awarded per RP post." />
              <input
                type="number"
                min={0}
                value={essPerPost}
                onChange={(e) => setEssPerPost(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <FieldLabel label="Offering Cost" description="Essence cost of The Offering ritual." />
              <input
                type="number"
                min={0}
                value={offeringCost}
                onChange={(e) => setOfferingCost(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <FieldLabel label="Offering Refund" description="Essence refunded when Offering draws an owned item." />
              <input
                type="number"
                min={0}
                value={offeringRefund}
                onChange={(e) => setOfferingRefund(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
            <div>
              <FieldLabel label="Offering Cooldown (hrs)" description="Hours between Offerings per user." />
              <input
                type="number"
                min={0}
                value={offeringCooldown}
                onChange={(e) => setOfferingCooldown(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
            <SaveButton saving={economySaving} />
            <StatusMessage status={economyStatus} />
          </div>
        </div>
      </form>

      {/* Integrations */}
      <form onSubmit={saveIntegrations}>
        <div style={SECTION_STYLE}>
          <div style={SECTION_TITLE_STYLE}>Integrations</div>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel label="Discord Webhook URL" />
            <input
              type="text"
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              style={INPUT_STYLE}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
            <SaveButton saving={intSaving} />
            <StatusMessage status={intStatus} />
          </div>
        </div>
      </form>
    </div>
  )
}
