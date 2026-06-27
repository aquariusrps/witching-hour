import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getUserPermissions, isSuperAdmin } from '@/lib/permissions'
import { getAdminClient } from '@/lib/supabase/adminClient'
import { getCachedFactions } from '@/lib/cached-settings'
import FactionList from './FactionList'
import FactionForm from './FactionForm'

export default async function AdminFactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; create?: string }>
}) {
  const supabase = await getServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const [permissions, superAdmin] = await Promise.all([
    getUserPermissions(userId),
    isSuperAdmin(userId),
  ])

  if (!superAdmin && !permissions.includes('manage_factions')) {
    redirect('/admin')
  }

  const params = await searchParams
  const editId = params.edit
  const isCreating = params.create === 'true'

  const factions = await getCachedFactions()

  // CREATE VIEW
  if (isCreating) {
    return <FactionForm mode="create" />
  }

  // EDIT VIEW
  if (editId) {
    const faction = factions.find((f) => f.id === editId)
    if (!faction) redirect('/admin/factions')
    return (
      <FactionForm
        mode="edit"
        faction={{
          id:            faction.id,
          name:          faction.name,
          slug:          faction.slug,
          color_hex:     faction.color_hex,
          description:   faction.description,
          lore:          faction.lore,
          leader_title:  faction.leader_title,
          display_order: faction.display_order,
        }}
      />
    )
  }

  // LIST VIEW — live character counts (not cached)
  const admin = getAdminClient()
  const { data: charRows } = await admin
    .from('characters')
    .select('faction_id')
    .in('faction_id', factions.map((f) => f.id))

  const characterCounts: Record<string, number> = {}
  for (const row of charRows ?? []) {
    if (row.faction_id) {
      characterCounts[row.faction_id] = (characterCounts[row.faction_id] ?? 0) + 1
    }
  }

  return (
    <FactionList
      factions={factions.map((f) => ({
        id:            f.id,
        name:          f.name,
        slug:          f.slug,
        color_hex:     f.color_hex,
        description:   f.description,
        leader_title:  f.leader_title,
        display_order: f.display_order,
      }))}
      characterCounts={characterCounts}
    />
  )
}
