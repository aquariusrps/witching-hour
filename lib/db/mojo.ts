import { getAdminClient } from '@/lib/supabase/adminClient'
import type { Tables } from '@/types/database'

type MojoRp = Tables<'mojo_rps'>
type MojoCharacter = Tables<'mojo_characters'>
type MojoThread = Tables<'mojo_threads'>
type MojoFaceclaim = Tables<'mojo_faceclaims'>
type MojoResource = Tables<'mojo_resources'>
type MojoAvatar = Tables<'mojo_avatars'>
type MojoSnippet = Tables<'mojo_snippets'>
type MojoWishlist = Tables<'mojo_wishlist'>
type MojoPartner = Tables<'mojo_partners'>
type MojoImageStack = Tables<'mojo_image_stacks'>
type MojoImageStackMember = Tables<'mojo_image_stack_members'>
type MojoImageFolder = Tables<'mojo_image_folders'>
type MojoPersonalImage = Tables<'mojo_personal_images'>
type MojoWanted = Tables<'mojo_wanted'>

function sortResourcesByTypeThenOrder(resources: MojoResource[]): MojoResource[] {
  return [...resources].sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type)
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

function statusRank(status: string): number {
  return status === 'active' ? 0 : status === 'hiatus' ? 1 : 2
}

function sortRps(rps: MojoRp[]): MojoRp[] {
  return [...rps].sort((a, b) => {
    const s = statusRank(a.status) - statusRank(b.status)
    if (s !== 0) return s
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

function sortCharactersByOrderThenName<T extends MojoCharacter>(characters: T[]): T[] {
  return [...characters].sort((a, b) => {
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return a.name.localeCompare(b.name)
  })
}

function sortCharactersActiveFirst(characters: MojoCharacter[]): MojoCharacter[] {
  return [...characters].sort((a, b) => {
    const s = (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1)
    if (s !== 0) return s
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return a.name.localeCompare(b.name)
  })
}

export async function getMojoRpsWithCharacters(): Promise<
  Array<MojoRp & { characters: MojoCharacter[] }>
> {
  const admin = getAdminClient()

  const { data: rps, error } = await admin.from('mojo_rps').select('*')
  if (error || !rps) return []

  const rpIds = rps.map((r) => r.id)
  const { data: characters } = rpIds.length
    ? await admin.from('mojo_characters').select('*').in('rp_id', rpIds)
    : { data: [] as MojoCharacter[] }

  const charsByRp = new Map<string, MojoCharacter[]>()
  for (const c of characters ?? []) {
    const list = charsByRp.get(c.rp_id) ?? []
    list.push(c)
    charsByRp.set(c.rp_id, list)
  }

  return sortRps(rps).map((rp) => ({
    ...rp,
    characters: sortCharactersActiveFirst(charsByRp.get(rp.id) ?? []),
  }))
}

export async function getMojoRp(rpId: string): Promise<MojoRp | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_rps')
    .select('*')
    .eq('id', rpId)
    .single()
  if (error || !data) return null
  return data
}

export async function getMojoRpWithCharactersAndThreads(
  rpId: string
): Promise<
  | (MojoRp & {
      characters: Array<MojoCharacter & { avatar_token: string | null }>
      threads: Array<MojoThread & { character_name: string }>
    })
  | null
> {
  const admin = getAdminClient()

  const { data: rp, error } = await admin
    .from('mojo_rps')
    .select('*')
    .eq('id', rpId)
    .single()
  if (error || !rp) return null

  const { data: characters } = await admin
    .from('mojo_characters')
    .select('*')
    .eq('rp_id', rpId)

  const { data: threads } = await admin
    .from('mojo_threads')
    .select('*')
    .eq('rp_id', rpId)

  const characterIds = Array.from(new Set((threads ?? []).map((t) => t.character_id)))
  const { data: threadCharacters } = characterIds.length
    ? await admin.from('mojo_characters').select('id, name').in('id', characterIds)
    : { data: [] as Array<{ id: string; name: string }> }

  const nameById = new Map<string, string>(
    (threadCharacters ?? []).map((c) => [c.id, c.name])
  )

  const sortedThreads = [...(threads ?? [])].sort((a, b) => {
    const s = (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1)
    if (s !== 0) return s
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Avatar priority: primary_stack token → most recent avatar token → null.
  // Same pattern as getMojoDashboardData().
  const rpCharacterIds = (characters ?? []).map((c) => c.id)
  const primaryStackIds = (characters ?? [])
    .map((c) => c.primary_stack_id)
    .filter((id): id is string => id !== null)

  const [stacksResult, avatarsResult] = await Promise.all([
    primaryStackIds.length
      ? admin.from('mojo_image_stacks').select('id, token').in('id', primaryStackIds)
      : Promise.resolve({ data: [] as Array<{ id: string; token: string }> }),
    rpCharacterIds.length
      ? admin
          .from('mojo_avatars')
          .select('character_id, token')
          .in('character_id', rpCharacterIds)
          .not('character_id', 'is', null)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as Array<{ character_id: string | null; token: string }> }),
  ])

  const stackTokenById = new Map((stacksResult.data ?? []).map((s) => [s.id, s.token]))
  const avatarByCharacter = new Map<string, string>()
  for (const av of avatarsResult.data ?? []) {
    if (av.character_id && !avatarByCharacter.has(av.character_id)) {
      avatarByCharacter.set(av.character_id, av.token)
    }
  }

  const charactersWithAvatars = (characters ?? []).map((c) => ({
    ...c,
    avatar_token:
      (c.primary_stack_id ? stackTokenById.get(c.primary_stack_id) : undefined) ??
      avatarByCharacter.get(c.id) ??
      null,
  }))

  return {
    ...rp,
    characters: sortCharactersByOrderThenName(charactersWithAvatars),
    threads: sortedThreads.map((t) => ({
      ...t,
      character_name: nameById.get(t.character_id) ?? 'Unknown',
    })),
  }
}

export async function getMojoCharacter(
  charId: string
): Promise<
  | (MojoCharacter & {
      rp_name: string
      rp_color_hex: string
      faceclaim_name: string | null
    })
  | null
> {
  const admin = getAdminClient()

  const { data: character, error } = await admin
    .from('mojo_characters')
    .select('*')
    .eq('id', charId)
    .single()
  if (error || !character) return null

  let faceclaimName: string | null = null
  if (character.faceclaim_id) {
    const { data: faceclaim } = await admin
      .from('mojo_faceclaims')
      .select('name')
      .eq('id', character.faceclaim_id)
      .single<Pick<MojoFaceclaim, 'name'>>()
    faceclaimName = faceclaim?.name ?? null
  }

  const { data: rp } = await admin
    .from('mojo_rps')
    .select('name, color_hex')
    .eq('id', character.rp_id)
    .single()

  return {
    ...character,
    rp_name: rp?.name ?? 'Unknown',
    rp_color_hex: rp?.color_hex ?? '#c83818',
    faceclaim_name: faceclaimName,
  }
}

export async function getMojoCharacterThreads(charId: string): Promise<MojoThread[]> {
  const admin = getAdminClient()

  const { data: threads } = await admin
    .from('mojo_threads')
    .select('*')
    .eq('character_id', charId)

  return [...(threads ?? [])].sort((a, b) => {
    const s = (a.status === 'active' ? 0 : 1) - (b.status === 'active' ? 0 : 1)
    if (s !== 0) return s
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export async function getMojoThread(threadId: string): Promise<MojoThread | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_threads')
    .select('*')
    .eq('id', threadId)
    .single()
  if (error || !data) return null
  return data
}

export async function getMojoAllThreads() {
  const admin = getAdminClient()

  // Primary: fetch all threads
  const { data: threads, error } = await admin
    .from('mojo_threads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !threads?.length) return []

  // Secondary: fetch character + RP context for each thread
  // Using two-query pattern (per MOJO_BRIEF §4 FK traversal rule)
  const charIds = [...new Set(threads.map((t) => t.character_id))]

  const { data: chars } = await admin
    .from('mojo_characters')
    .select('id, name, status, rp_id, faceclaim_id')
    .in('id', charIds)

  const rpIds = [...new Set((chars ?? []).map((c) => c.rp_id).filter(Boolean))]

  const { data: rps } = await admin
    .from('mojo_rps')
    .select('id, name, color_hex')
    .in('id', rpIds)

  // Build lookup maps
  const charMap = new Map((chars ?? []).map((c) => [c.id, c]))
  const rpMap = new Map((rps ?? []).map((r) => [r.id, r]))

  // Merge context onto each thread
  return threads.map((t) => {
    const char = charMap.get(t.character_id)
    const rp = char ? rpMap.get(char.rp_id ?? '') : undefined
    return {
      ...t,
      character_name: char?.name ?? null,
      character_status: char?.status ?? null,
      rp_name: rp?.name ?? null,
      rp_color_hex: rp?.color_hex ?? '#a02840',
    }
  })
}

export async function getMojoFaceclaims(): Promise<
  Array<MojoFaceclaim & { resource_count: number; character_count: number; avatar_token: string | null }>
> {
  const admin = getAdminClient()

  const { data: faceclaims, error } = await admin
    .from('mojo_faceclaims')
    .select('*')
    .order('name', { ascending: true })
  if (error || !faceclaims) return []

  const { data: resourceRows } = await admin
    .from('mojo_resources')
    .select('faceclaim_id')
    .not('faceclaim_id', 'is', null)

  const { data: characterRows } = await admin
    .from('mojo_characters')
    .select('faceclaim_id')
    .not('faceclaim_id', 'is', null)

  const resourceCounts = new Map<string, number>()
  for (const row of resourceRows ?? []) {
    if (row.faceclaim_id) {
      resourceCounts.set(row.faceclaim_id, (resourceCounts.get(row.faceclaim_id) ?? 0) + 1)
    }
  }

  const characterCounts = new Map<string, number>()
  for (const row of characterRows ?? []) {
    if (row.faceclaim_id) {
      characterCounts.set(row.faceclaim_id, (characterCounts.get(row.faceclaim_id) ?? 0) + 1)
    }
  }

  const fcIds = faceclaims.map((fc) => fc.id)
  const fcAvatarMap = new Map<string, string>()

  if (fcIds.length > 0) {
    const { data: chars } = await admin
      .from('mojo_characters')
      .select('id, faceclaim_id')
      .in('faceclaim_id', fcIds)

    const charIds = (chars ?? []).map((c) => c.id)
    const charToFc = new Map(
      (chars ?? [])
        .filter((c): c is { id: string; faceclaim_id: string } => c.faceclaim_id !== null)
        .map((c) => [c.id, c.faceclaim_id])
    )

    if (charIds.length > 0) {
      const { data: avatars } = await admin
        .from('mojo_avatars')
        .select('character_id, token, created_at')
        .in('character_id', charIds)
        .order('created_at', { ascending: false })

      for (const avatar of avatars ?? []) {
        if (!avatar.character_id) continue
        const fcId = charToFc.get(avatar.character_id)
        if (fcId && !fcAvatarMap.has(fcId)) {
          fcAvatarMap.set(fcId, avatar.token)
        }
      }
    }
  }

  return faceclaims.map((fc) => ({
    ...fc,
    resource_count: resourceCounts.get(fc.id) ?? 0,
    character_count: characterCounts.get(fc.id) ?? 0,
    avatar_token: fcAvatarMap.get(fc.id) ?? null,
  }))
}

export async function getMojoFaceclaim(fcId: string): Promise<MojoFaceclaim | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_faceclaims')
    .select('*')
    .eq('id', fcId)
    .single()
  if (error || !data) return null
  return data
}

export async function getMojoFaceclaimResources(fcId: string): Promise<MojoResource[]> {
  const admin = getAdminClient()
  const { data } = await admin
    .from('mojo_resources')
    .select('*')
    .eq('faceclaim_id', fcId)

  return sortResourcesByTypeThenOrder(data ?? [])
}

export async function getMojoCharacterResources(charId: string): Promise<MojoResource[]> {
  const admin = getAdminClient()

  const { data: owned } = await admin
    .from('mojo_resources')
    .select('*')
    .eq('character_id', charId)

  const { data: linkRows } = await admin
    .from('mojo_character_resources')
    .select('resource_id')
    .eq('character_id', charId)

  const linkedIds = (linkRows ?? []).map((r) => r.resource_id)
  const { data: linked } = linkedIds.length
    ? await admin.from('mojo_resources').select('*').in('id', linkedIds)
    : { data: [] as MojoResource[] }

  const byId = new Map<string, MojoResource>()
  for (const r of owned ?? []) byId.set(r.id, r)
  for (const r of linked ?? []) byId.set(r.id, r)

  return sortResourcesByTypeThenOrder(Array.from(byId.values()))
}

export async function getMojoFaceclaimWithCharacters(
  fcId: string
): Promise<(MojoFaceclaim & { characters: MojoCharacter[] }) | null> {
  const admin = getAdminClient()

  const { data: faceclaim, error } = await admin
    .from('mojo_faceclaims')
    .select('*')
    .eq('id', fcId)
    .single()
  if (error || !faceclaim) return null

  const { data: characters } = await admin
    .from('mojo_characters')
    .select('*')
    .eq('faceclaim_id', fcId)
    .order('name', { ascending: true })

  return {
    ...faceclaim,
    characters: characters ?? [],
  }
}

function wishlistStatusRank(status: string): number {
  return status === 'idea' ? 0 : status === 'active' ? 1 : 2
}

export async function getMojoSnippets(): Promise<MojoSnippet[]> {
  const admin = getAdminClient()
  const { data } = await admin
    .from('mojo_snippets')
    .select('*')
    .order('type', { ascending: true })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getMojoGlobalResources(): Promise<MojoResource[]> {
  const admin = getAdminClient()
  const { data } = await admin
    .from('mojo_resources')
    .select('*')
    .is('faceclaim_id', null)
    .is('character_id', null)
  return sortResourcesByTypeThenOrder(data ?? [])
}

export async function getMojoWishlist(): Promise<MojoWishlist[]> {
  const admin = getAdminClient()
  const { data } = await admin.from('mojo_wishlist').select('*')
  return [...(data ?? [])].sort((a, b) => {
    const s = wishlistStatusRank(a.status) - wishlistStatusRank(b.status)
    if (s !== 0) return s
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export async function getMojoPartners(): Promise<MojoPartner[]> {
  const admin = getAdminClient()
  const { data } = await admin
    .from('mojo_partners')
    .select('*')
    .order('display_order', { ascending: true })
    .order('handle', { ascending: true })
  return data ?? []
}

export async function getMojoPartner(partnerId: string): Promise<MojoPartner | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_partners')
    .select('*')
    .eq('id', partnerId)
    .single()
  if (error || !data) return null
  return data
}

export async function getMojoDashboardStats(): Promise<{
  activeRpCount: number
  characterCount: number
  activeThreadCount: number
  snippetCount: number
  wishlistCount: number
  partnerCount: number
  stackCount: number
}> {
  const admin = getAdminClient()

  const [
    { count: activeRpCount },
    { count: characterCount },
    { count: activeThreadCount },
    { count: snippetCount },
    { count: wishlistCount },
    { count: partnerCount },
    { count: stackCount },
  ] = await Promise.all([
    admin.from('mojo_rps').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('mojo_characters').select('id', { count: 'exact', head: true }),
    admin.from('mojo_threads').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('mojo_snippets').select('id', { count: 'exact', head: true }),
    admin.from('mojo_wishlist').select('id', { count: 'exact', head: true }),
    admin.from('mojo_partners').select('id', { count: 'exact', head: true }),
    admin.from('mojo_image_stacks').select('id', { count: 'exact', head: true }),
  ])

  return {
    activeRpCount: activeRpCount ?? 0,
    characterCount: characterCount ?? 0,
    activeThreadCount: activeThreadCount ?? 0,
    snippetCount: snippetCount ?? 0,
    wishlistCount: wishlistCount ?? 0,
    partnerCount: partnerCount ?? 0,
    stackCount: stackCount ?? 0,
  }
}

export async function getMojoImageStacks(filter?: {
  character_id?: string
  faceclaim_id?: string
}): Promise<Array<MojoImageStack & { member_count: number }>> {
  const admin = getAdminClient()

  let query = admin.from('mojo_image_stacks').select('*').order('created_at', { ascending: false })
  if (filter?.character_id) {
    query = query.eq('character_id', filter.character_id)
  }
  if (filter?.faceclaim_id) {
    query = query.eq('faceclaim_id', filter.faceclaim_id)
  }

  const { data: stacks, error } = await query
  if (error || !stacks) return []

  const stackIds = stacks.map((s) => s.id)
  const { data: memberRows } = stackIds.length
    ? await admin.from('mojo_image_stack_members').select('stack_id').in('stack_id', stackIds)
    : { data: [] as Array<{ stack_id: string }> }

  const memberCounts = new Map<string, number>()
  for (const row of memberRows ?? []) {
    memberCounts.set(row.stack_id, (memberCounts.get(row.stack_id) ?? 0) + 1)
  }

  return stacks.map((stack) => ({
    ...stack,
    member_count: memberCounts.get(stack.id) ?? 0,
  }))
}

export async function getMojoImageStack(
  stackId: string
): Promise<(MojoImageStack & { members: MojoImageStackMember[] }) | null> {
  const admin = getAdminClient()

  const { data: stack, error } = await admin
    .from('mojo_image_stacks')
    .select('*')
    .eq('id', stackId)
    .single()
  if (error || !stack) return null

  const { data: members } = await admin
    .from('mojo_image_stack_members')
    .select('*')
    .eq('stack_id', stackId)
    .order('display_order', { ascending: true })

  return {
    ...stack,
    members: members ?? [],
  }
}

export async function getMojoStackMembers(stackId: string): Promise<MojoImageStackMember[]> {
  const admin = getAdminClient()
  const { data } = await admin
    .from('mojo_image_stack_members')
    .select('*')
    .eq('stack_id', stackId)
    .order('display_order', { ascending: true })
  return data ?? []
}

export async function getMojoAvatars(filter?: {
  character_id?: string
  faceclaim_id?: string
}): Promise<MojoAvatar[]> {
  const admin = getAdminClient()

  let query = admin.from('mojo_avatars').select('*').order('created_at', { ascending: false })
  if (filter?.character_id) {
    query = query.eq('character_id', filter.character_id)
  }
  if (filter?.faceclaim_id) {
    query = query.eq('faceclaim_id', filter.faceclaim_id)
  }

  const { data } = await query
  return data ?? []
}

export async function getMojoAvatar(avatarId: string): Promise<MojoAvatar | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('mojo_avatars')
    .select('*')
    .eq('id', avatarId)
    .single()
  if (error || !data) return null
  return data
}

// ─── DASHBOARD ─────────────────────────────────────────────

export type DashboardCharacter = {
  id: string
  name: string
  status: string
  faceclaim_name: string | null
  primary_stack_token: string | null // null if no primary stack set
  avatar_token: string | null // fallback: most recent avatar token
  active_threads: Array<{
    id: string
    last_poster: string | null
    fetch_status: string | null
    manual_whose_turn: string | null
  }>
}

export type DashboardRp = {
  id: string
  name: string
  site_name: string
  site_url: string | null
  color_hex: string
  status: string
  notes_plot: string | null
  display_order: number
  total_thread_count: number
  active_thread_count: number
  characters: DashboardCharacter[]
}

type DashboardStats = {
  activeRpCount: number
  characterCount: number
  activeThreadCount: number
  snippetCount: number
  wishlistCount: number
  partnerCount: number
  stackCount: number
}

export async function getMojoDashboardData(): Promise<{
  stats: DashboardStats
  activeRps: DashboardRp[]
  inactiveRps: DashboardRp[]
}> {
  const admin = getAdminClient()

  const [
    stats,
    rpsResult,
    charactersResult,
    faceclaimsResult,
    stacksResult,
    avatarsResult,
    threadsResult,
  ] = await Promise.all([
    getMojoDashboardStats(),

    // All RPs
    admin.from('mojo_rps')
      .select('id, name, site_name, site_url, color_hex, status, notes_plot, display_order')
      .order('display_order', { ascending: true }),

    // All characters (all statuses — dashboard shows archived chars too)
    admin.from('mojo_characters')
      .select('id, rp_id, name, status, faceclaim_id, primary_stack_id')
      .order('display_order', { ascending: true }),

    // All faceclaims (for name lookup)
    admin.from('mojo_faceclaims')
      .select('id, name'),

    // All stacks that could be set as primary stacks — get their tokens
    // Joined in app code via: characters.primary_stack_id → mojo_image_stacks.id → token
    admin.from('mojo_image_stacks')
      .select('id, token'),

    // Most recent avatar per character (fallback if no primary stack)
    // Fetch all avatars ordered by created_at DESC, deduplicated in app code
    admin.from('mojo_avatars')
      .select('id, character_id, token')
      .not('character_id', 'is', null)
      .order('created_at', { ascending: false }),

    // Active threads with whose-turn fields
    admin.from('mojo_threads')
      .select('id, rp_id, character_id, status, last_poster, fetch_status, manual_whose_turn'),
  ])

  const rps = rpsResult.data ?? []
  const characters = charactersResult.data ?? []
  const faceclaims = faceclaimsResult.data ?? []
  const stacks = stacksResult.data ?? []
  const avatars = avatarsResult.data ?? []
  const threads = threadsResult.data ?? []

  // Build lookup maps
  const faceclaimMap = new Map(faceclaims.map((f) => [f.id, f.name]))
  const stackMap = new Map(stacks.map((s) => [s.id, s.token]))

  // Most recent avatar per character (first in the DESC-ordered array)
  const avatarByCharacter = new Map<string, string>()
  for (const av of avatars) {
    if (av.character_id && !avatarByCharacter.has(av.character_id)) {
      avatarByCharacter.set(av.character_id, av.token)
    }
  }

  // Thread counts per RP
  const threadCountByRp = new Map<string, { total: number; active: number }>()
  for (const t of threads) {
    const existing = threadCountByRp.get(t.rp_id) ?? { total: 0, active: 0 }
    existing.total++
    if (t.status === 'active') existing.active++
    threadCountByRp.set(t.rp_id, existing)
  }

  // Active threads per character (for whose-turn computation)
  const activeThreadsByCharacter = new Map<string, typeof threads>()
  for (const t of threads) {
    if (t.status === 'active' && t.character_id) {
      const existing = activeThreadsByCharacter.get(t.character_id) ?? []
      existing.push(t)
      activeThreadsByCharacter.set(t.character_id, existing)
    }
  }

  // Build character data per RP
  const charactersByRp = new Map<string, DashboardCharacter[]>()
  for (const c of characters) {
    const existing = charactersByRp.get(c.rp_id) ?? []
    existing.push({
      id: c.id,
      name: c.name,
      status: c.status,
      faceclaim_name: c.faceclaim_id ? (faceclaimMap.get(c.faceclaim_id) ?? null) : null,
      primary_stack_token: c.primary_stack_id
        ? (stackMap.get(c.primary_stack_id) ?? null)
        : null,
      avatar_token: avatarByCharacter.get(c.id) ?? null,
      active_threads: (activeThreadsByCharacter.get(c.id) ?? []).map((t) => ({
        id: t.id,
        last_poster: t.last_poster,
        fetch_status: t.fetch_status,
        manual_whose_turn: t.manual_whose_turn,
      })),
    })
    charactersByRp.set(c.rp_id, existing)
  }

  // Build final RP data
  const buildRp = (rp: (typeof rps)[0]): DashboardRp => ({
    id: rp.id,
    name: rp.name,
    site_name: rp.site_name,
    site_url: rp.site_url ?? null,
    color_hex: rp.color_hex,
    status: rp.status,
    notes_plot: rp.notes_plot ?? null,
    display_order: rp.display_order,
    total_thread_count: threadCountByRp.get(rp.id)?.total ?? 0,
    active_thread_count: threadCountByRp.get(rp.id)?.active ?? 0,
    characters: charactersByRp.get(rp.id) ?? [],
  })

  const activeRps = rps
    .filter((r) => r.status === 'active')
    .sort((a, b) => a.display_order - b.display_order)
    .map(buildRp)

  const inactiveRps = rps
    .filter((r) => r.status !== 'active')
    .sort((a, b) => {
      // hiatus before ended
      if (a.status === b.status) return a.display_order - b.display_order
      if (a.status === 'hiatus') return -1
      return 1
    })
    .map(buildRp)

  return { stats, activeRps, inactiveRps }
}

// ─── PERSONAL IMAGE REPOSITORY ──────────────────────────────

export async function getMojoImageFolders(): Promise<
  Array<MojoImageFolder & { image_count: number }>
> {
  const admin = getAdminClient()

  const { data: folders, error } = await admin
    .from('mojo_image_folders')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })
  if (error || !folders) return []

  const { data: imageRows } = await admin
    .from('mojo_personal_images')
    .select('folder_id')
    .not('folder_id', 'is', null)

  const counts = new Map<string, number>()
  for (const row of imageRows ?? []) {
    if (row.folder_id) {
      counts.set(row.folder_id, (counts.get(row.folder_id) ?? 0) + 1)
    }
  }

  return folders.map((f) => ({
    ...f,
    image_count: counts.get(f.id) ?? 0,
  }))
}

export async function getMojoPersonalImages(filter?: {
  folder_id?: string | null
  tag?: string
}): Promise<MojoPersonalImage[]> {
  const admin = getAdminClient()

  let query = admin.from('mojo_personal_images').select('*').order('created_at', { ascending: false })

  if (filter && 'folder_id' in filter) {
    if (filter.folder_id === null) {
      query = query.is('folder_id', null)
    } else if (filter.folder_id) {
      query = query.eq('folder_id', filter.folder_id)
    }
  }

  if (filter?.tag) {
    query = query.ilike('tags', `%${filter.tag}%`)
  }

  const { data } = await query
  return data ?? []
}

// ─── WANTED / CONNECTIONS BOARD ─────────────────────────────

export async function getMojoWanted(rpId: string): Promise<
  Array<MojoWanted & { character_name: string | null; proxy_url: string | null }>
> {
  const admin = getAdminClient()

  const { data: items, error } = await admin
    .from('mojo_wanted')
    .select('*')
    .eq('rp_id', rpId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error || !items) return []

  const characterIds = Array.from(
    new Set(items.map((i) => i.character_id).filter((id): id is string => !!id))
  )
  const { data: characters } = characterIds.length
    ? await admin.from('mojo_characters').select('id, name').in('id', characterIds)
    : { data: [] as Array<{ id: string; name: string }> }

  const nameById = new Map((characters ?? []).map((c) => [c.id, c.name]))

  const sorted = [...items].sort((a, b) => {
    const s = (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1)
    if (s !== 0) return s
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return sorted.map((item) => ({
    ...item,
    character_name: item.character_id ? (nameById.get(item.character_id) ?? null) : null,
    proxy_url: item.image_token
      ? process.env.NEXT_PUBLIC_SITE_URL + '/i/' + item.image_token + '.png'
      : null,
  }))
}
