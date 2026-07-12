import { getAdminClient } from '@/lib/supabase/adminClient'
import type { Tables } from '@/types/database'

type MojoRp = Tables<'mojo_rps'>
type MojoCharacter = Tables<'mojo_characters'>
type MojoThread = Tables<'mojo_threads'>
type MojoFaceclaim = Tables<'mojo_faceclaims'>

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

function sortCharactersByOrderThenName(characters: MojoCharacter[]): MojoCharacter[] {
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
      characters: MojoCharacter[]
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

  return {
    ...rp,
    characters: sortCharactersByOrderThenName(characters ?? []),
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
