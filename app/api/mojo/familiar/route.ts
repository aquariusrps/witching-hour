import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/serverClient'
import { isSuperAdmin } from '@/lib/permissions'
import {
  getMojoFamiliarMessages,
  createMojoFamiliarConversation,
  saveMojoFamiliarMessage,
  getMojoRpsWithCharacters,
  getMojoAllThreads,
  getMojoFaceclaims,
} from '@/lib/db/mojo'
import {
  createMojoCharacter,
  createMojoRp,
  updateMojoRp,
  createMojoThread,
  createMojoFaceclaim,
  createAndAssignFaceclaim,
  updateMojoThreadStatus,
} from '@/lib/actions/mojo'
import { getThreadDisplayState } from '@/lib/mojo/utils'

// ── CONSTANTS ──

const CLAUDE_MODEL = 'claude-sonnet-4-6'
const MAX_HISTORY  = 20
const MAX_LOOPS    = 6

const WRITE_TOOLS = new Set([
  'create_character',
  'create_rp',
  'create_thread',
  'create_faceclaim',
  'assign_faceclaim',
  'archive_thread',
])
const GENERATE_TOOLS = new Set([
  'generate_biography',
  'generate_wanted_ad',
  'generate_thread_starter',
])

// ── COMPOSED DATA SHAPE ──
// getMojoCharacters()/getMojoRps() do not exist in lib/db/mojo.ts (confirmed
// Part A step 5). Flat characters/rps lists are composed here from
// getMojoRpsWithCharacters() + getMojoFaceclaims() — both existing exports —
// rather than adding near-duplicate DB helpers (Rule 7).

type FamiliarCharacter = {
  id: string
  name: string
  status: string
  rp_id: string
  rp_name: string
  faceclaim_id: string | null
  faceclaim_name: string | null
}

type FamiliarRp = {
  id: string
  name: string
  site_name: string
  site_url: string | null
  status: string
  color_hex: string
}

type FamiliarThread = Awaited<ReturnType<typeof getMojoAllThreads>>[number]
type FamiliarFaceclaims = Awaited<ReturnType<typeof getMojoFaceclaims>>

type FamiliarData = {
  characters: FamiliarCharacter[]
  rps: FamiliarRp[]
  threads: FamiliarThread[]
  faceclaims: FamiliarFaceclaims
}

async function loadAllData(): Promise<FamiliarData> {
  const [rpsWithChars, threads, faceclaims] = await Promise.all([
    getMojoRpsWithCharacters(),
    getMojoAllThreads(),
    getMojoFaceclaims(),
  ])

  const faceclaimNameById = new Map(faceclaims.map((f) => [f.id, f.name]))

  const rps: FamiliarRp[] = rpsWithChars.map((rp) => ({
    id: rp.id,
    name: rp.name,
    site_name: rp.site_name,
    site_url: rp.site_url,
    status: rp.status,
    color_hex: rp.color_hex,
  }))

  const characters: FamiliarCharacter[] = rpsWithChars.flatMap((rp) =>
    rp.characters.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      rp_id: rp.id,
      rp_name: rp.name,
      faceclaim_id: c.faceclaim_id,
      faceclaim_name: c.faceclaim_id ? (faceclaimNameById.get(c.faceclaim_id) ?? null) : null,
    }))
  )

  return { characters, rps, threads, faceclaims }
}

// ── TOOL DEFINITIONS ──

type AnthropicTool =
  | { type: 'web_search_20250305'; name: string }
  | {
      name: string
      description: string
      input_schema: {
        type: 'object'
        properties: Record<string, unknown>
        required: string[]
      }
    }

const TOOLS: AnthropicTool[] = [
  // ── Web search (Anthropic built-in) ──
  {
    type: 'web_search_20250305',
    name: 'web_search',
  },

  // ── READ TOOLS ──
  {
    name: 'get_characters',
    description: 'Get all characters with their RP, status, and faceclaim',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_rps',
    description: 'Get all roleplays with their status, site name, and color',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_active_threads',
    description: 'Get active threads, optionally filtered by character name',
    input_schema: {
      type: 'object',
      properties: {
        character_name: {
          type: 'string',
          description: 'Filter to threads for this character (optional)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_faceclaims',
    description: 'Get all faceclaims with character and resource counts',
    input_schema: { type: 'object', properties: {}, required: [] },
  },

  // ── GENERATE TOOLS ──
  {
    name: 'generate_biography',
    description: 'Generate a character biography for use in notes',
    input_schema: {
      type: 'object',
      properties: {
        character_name: { type: 'string' },
        rp_context:     { type: 'string',
          description: 'The RP name and setting context' },
        style_notes:    { type: 'string',
          description: 'Tone, length, focus areas (optional)' },
      },
      required: ['character_name', 'rp_context'],
    },
  },
  {
    name: 'generate_wanted_ad',
    description: 'Generate a wanted connections ad for the wanted board',
    input_schema: {
      type: 'object',
      properties: {
        character_name:  { type: 'string' },
        connection_type: { type: 'string',
          description: 'e.g. rival, friend, former lover, sibling' },
        details:         { type: 'string',
          description: 'Additional context or requirements (optional)' },
      },
      required: ['character_name', 'connection_type'],
    },
  },
  {
    name: 'generate_thread_starter',
    description: 'Generate an opening post for a new thread',
    input_schema: {
      type: 'object',
      properties: {
        character_name: { type: 'string' },
        partner_name:   { type: 'string' },
        setting:        { type: 'string',
          description: 'Location, time, scenario context' },
      },
      required: ['character_name', 'partner_name'],
    },
  },

  // ── WRITE TOOLS (require confirmation) ──
  {
    name: 'create_character',
    description: 'Create a new character in an RP. Requires confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        name:           { type: 'string', description: 'Character name' },
        rp_name:        { type: 'string',
          description: 'RP name to assign to (will be looked up)' },
        faceclaim_name: { type: 'string',
          description: 'Actor/faceclaim name (optional)' },
      },
      required: ['name', 'rp_name'],
    },
  },
  {
    name: 'create_rp',
    description: 'Create a new roleplay. Requires confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        name:      { type: 'string' },
        site_name: { type: 'string', description: 'Forum/site name' },
        status:    { type: 'string',
          enum: ['active', 'hiatus', 'ended'],
          description: 'Default: active' },
      },
      // site_name is required — createMojoRp() rejects creation without it
      // (confirmed Part A step 6, deviation from original tool schema).
      required: ['name', 'site_name'],
    },
  },
  {
    name: 'create_thread',
    description: 'Create a new thread for a character. Requires confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        character_name: { type: 'string' },
        title:          { type: 'string' },
        url:            { type: 'string', description: 'Thread URL (optional)' },
        partner_names:  { type: 'string',
          description: 'Comma-separated partner names (optional)' },
        thread_type:    { type: 'string',
          enum: ['rp', 'class'], description: 'Default: rp' },
      },
      required: ['character_name', 'title'],
    },
  },
  {
    name: 'create_faceclaim',
    description: 'Create a new faceclaim entry. Requires confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Actor or model name' },
      },
      required: ['name'],
    },
  },
  {
    name: 'assign_faceclaim',
    description: 'Assign a faceclaim to a character. Requires confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        character_name: { type: 'string' },
        faceclaim_name: { type: 'string' },
      },
      required: ['character_name', 'faceclaim_name'],
    },
  },
  {
    name: 'archive_thread',
    description: 'Close/archive a thread. Requires confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        thread_title: { type: 'string',
          description: 'Thread title to identify which thread to close' },
      },
      required: ['thread_title'],
    },
  },
]

// ── CONTEXT SNAPSHOT ──

function buildContextSnapshot(allData: FamiliarData): string {
  const activeChars = allData.characters.filter((c) => c.status !== 'archived')
  const activeRps   = allData.rps.filter((r) => r.status === 'active')
  const needsAction = allData.threads.filter((t) => {
    if (t.status !== 'active') return false
    const state = getThreadDisplayState(t, t.character_name ?? '')
    return state === 'mine' || state === 'due'
  })

  return [
    '=== CURRENT MOJO DATA ===',
    `Characters: ${activeChars.map((c) =>
      `${c.name} (${c.rp_name}, ${c.status})`
    ).join(' | ') || 'none'}`,
    `Active RPs: ${activeRps.map((r) => r.name).join(', ') || 'none'}`,
    `Threads needing your response: ${
      needsAction.length
        ? needsAction.map((t) => `"${t.title}" (${t.character_name})`).join(', ')
        : 'none'
    }`,
    `Total active threads: ${allData.threads.filter((t) => t.status === 'active').length}`,
  ].join('\n')
}

// ── SYSTEM PROMPT ──

function buildSystemPrompt(contextSnapshot: string): string {
  return `You are The Familiar — a magical companion and personal assistant for this roleplay dashboard. You are warm, attentive, and precise. You know this operator's characters, stories, and creative world intimately.

${contextSnapshot}

CAPABILITIES:
- Read data: characters, RPs, threads, faceclaims, wishlists, partners
- Generate creative writing: biographies, wanted ads, thread starters
- Search the web: for canon information, faceclaim research, fandom details
- Execute changes: create characters, RPs, threads, assign faceclaims (with confirmation)

RULES:
- For reads and creative generation: respond directly and helpfully
- For any write operation: describe what you plan to do and call the appropriate write tool. Do NOT execute without user confirmation.
- When generating creative content (biographies, wanted ads, thread starters): write with richness and atmosphere appropriate to the fandom. Be evocative.
- When searching for canon information: use web search to ensure accuracy before generating
- Address the operator directly. Be warm but efficient. You know this world well.
- If asked about a character or RP by shorthand (e.g. "Remy"), use the context above to resolve the full name.`
}

// ── EXECUTE READ / GENERATE TOOL ──

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  allData: FamiliarData,
): Promise<string> {
  // READ TOOLS
  if (name === 'get_characters') {
    if (!allData.characters.length) return 'No characters found.'
    return allData.characters.map((c) =>
      `${c.name} | RP: ${c.rp_name} | Status: ${c.status} | Faceclaim: ${c.faceclaim_name ?? 'none'}`
    ).join('\n')
  }

  if (name === 'get_rps') {
    if (!allData.rps.length) return 'No RPs found.'
    return allData.rps.map((r) =>
      `${r.name} | Status: ${r.status} | Site: ${r.site_name ?? 'none'}`
    ).join('\n')
  }

  if (name === 'get_active_threads') {
    const charFilter = args.character_name as string | undefined
    const threads = allData.threads.filter((t) => {
      if (t.status !== 'active') return false
      if (charFilter) {
        return t.character_name?.toLowerCase().includes(charFilter.toLowerCase())
      }
      return true
    })
    if (!threads.length) return 'No active threads found.'
    return threads.map((t) => {
      const state = getThreadDisplayState(t, t.character_name ?? '')
      return `"${t.title}" | Character: ${t.character_name} | Partners: ${t.partner_names ?? 'none'} | Status: ${state}`
    }).join('\n')
  }

  if (name === 'get_faceclaims') {
    if (!allData.faceclaims.length) return 'No faceclaims found.'
    return allData.faceclaims.map((f) =>
      `${f.name} | Characters: ${f.character_count ?? 0}`
    ).join('\n')
  }

  // GENERATE TOOLS — call Claude again with a focused generation prompt
  if (GENERATE_TOOLS.has(name)) {
    const genPrompt = buildGenerationPrompt(name, args)
    const genResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: genPrompt }],
      }),
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genData: any = await genResponse.json()
    return genData.content?.[0]?.text ?? 'Generation failed.'
  }

  return `Tool ${name} result unavailable.`
}

function buildGenerationPrompt(
  toolName: string,
  args: Record<string, unknown>,
): string {
  if (toolName === 'generate_biography') {
    return `Write a character biography for ${args.character_name} in the roleplay "${args.rp_context}".${args.style_notes ? ` Style notes: ${args.style_notes}` : ''} Write in third person, 2-4 paragraphs. Be evocative and specific. Return only the biography text.`
  }
  if (toolName === 'generate_wanted_ad') {
    return `Write a "wanted connections" ad for a roleplay forum. Character: ${args.character_name}. Looking for: ${args.connection_type}.${args.details ? ` Details: ${args.details}` : ''} Keep it to 2-3 short paragraphs. Atmospheric and inviting. Return only the ad text.`
  }
  if (toolName === 'generate_thread_starter') {
    return `Write an opening post for a roleplay thread. Character: ${args.character_name}. Meeting: ${args.partner_name}. Setting: ${args.setting ?? 'unspecified location'}. Write 2-3 paragraphs of in-character prose. Third-person limited perspective. Return only the post text.`
  }
  return `Generate content for ${toolName}.`
}

// ── EXECUTE CONFIRMED WRITE ──

async function executeWrite(
  tool: string,
  args: Record<string, unknown>,
  allData: FamiliarData,
): Promise<string> {
  const findChar = (name: string) =>
    allData.characters.find((c) => c.name.toLowerCase().includes(name.toLowerCase()))
  const findRp = (name: string) =>
    allData.rps.find((r) => r.name.toLowerCase().includes(name.toLowerCase()))
  const findThread = (title: string) =>
    allData.threads.find((t) => t.title.toLowerCase().includes(title.toLowerCase()))

  try {
    if (tool === 'create_character') {
      const rp = findRp(args.rp_name as string)
      if (!rp) return `RP "${args.rp_name}" not found.`

      // createMojoCharacter() takes FormData, not a plain object
      // (confirmed Part A step 6).
      const formData = new FormData()
      formData.set('name', args.name as string)
      formData.set('rp_id', rp.id)
      const result = await createMojoCharacter(formData)
      if ('error' in result) return `Error: ${result.error}`

      if (args.faceclaim_name) {
        await createAndAssignFaceclaim(args.faceclaim_name as string, result.character.id)
      }
      return `Character "${args.name}" created in ${rp.name}${args.faceclaim_name ? ` with faceclaim ${args.faceclaim_name}` : ''}.`
    }

    if (tool === 'create_rp') {
      // createMojoRp() takes FormData and requires site_name; it has no
      // status field at creation (DB defaults to 'active') — a non-default
      // status requires a follow-up updateMojoRp() call (confirmed Part A
      // step 6).
      const formData = new FormData()
      formData.set('name', args.name as string)
      formData.set('site_name', args.site_name as string)
      const result = await createMojoRp(formData)
      if ('error' in result) return `Error: ${result.error}`

      const status = args.status as string | undefined
      if (status && status !== 'active') {
        const statusFormData = new FormData()
        statusFormData.set('status', status)
        await updateMojoRp(result.rp.id, statusFormData)
      }
      return `RP "${args.name}" created${status && status !== 'active' ? ` (status: ${status})` : ''}.`
    }

    if (tool === 'create_thread') {
      const char = findChar(args.character_name as string)
      if (!char) return `Character "${args.character_name}" not found.`
      const result = await createMojoThread({
        character_id: char.id,
        rp_id: char.rp_id,
        title: args.title as string,
        url: (args.url as string) || undefined,
        partner_names: (args.partner_names as string) || undefined,
        thread_type: (args.thread_type as 'rp' | 'class') ?? 'rp',
      })
      if ('error' in result) return `Error: ${result.error}`
      return `Thread "${args.title}" created for ${char.name}.`
    }

    if (tool === 'create_faceclaim') {
      // createMojoFaceclaim() takes an object payload, not a raw string.
      const result = await createMojoFaceclaim({ name: args.name as string })
      if ('error' in result) return `Error: ${result.error}`
      return `Faceclaim "${args.name}" created.`
    }

    if (tool === 'assign_faceclaim') {
      const char = findChar(args.character_name as string)
      if (!char) return `Character "${args.character_name}" not found.`
      const result = await createAndAssignFaceclaim(args.faceclaim_name as string, char.id)
      if ('error' in result) return `Error: ${result.error}`
      return `Faceclaim "${args.faceclaim_name}" assigned to ${char.name}.`
    }

    if (tool === 'archive_thread') {
      const thread = findThread(args.thread_title as string)
      if (!thread) return `Thread "${args.thread_title}" not found.`
      // The archive action is updateMojoThreadStatus(threadId, 'archived') —
      // there is no dedicated archiveMojoThread() (confirmed Part A step 7).
      const result = await updateMojoThreadStatus(thread.id, 'archived')
      if ('error' in result) return `Error: ${result.error}`
      return `Thread "${thread.title}" closed.`
    }

    return `Unknown write tool: ${tool}`
  } catch (e) {
    return `Error executing ${tool}: ${e instanceof Error ? e.message : 'unknown error'}`
  }
}

function getWriteDescription(tool: string, args: Record<string, unknown>): string {
  switch (tool) {
    case 'create_character':
      return `create character "${args.name}" in ${args.rp_name}${args.faceclaim_name ? ` with faceclaim ${args.faceclaim_name}` : ''}`
    case 'create_rp':
      return `create roleplay "${args.name}"${args.site_name ? ` on ${args.site_name}` : ''}`
    case 'create_thread':
      return `create thread "${args.title}" for ${args.character_name}`
    case 'create_faceclaim':
      return `create faceclaim "${args.name}"`
    case 'assign_faceclaim':
      return `assign faceclaim "${args.faceclaim_name}" to ${args.character_name}`
    case 'archive_thread':
      return `close thread "${args.thread_title}"`
    default:
      return `execute ${tool}`
  }
}

// ── MAIN ROUTE HANDLER ──

export async function POST(request: Request) {
  // ── AUTH ── (matches the established pattern in every other Mojo Route
  // Handler — process-image, refresh-thread, fetch-image)
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const ok = await isSuperAdmin(user.id)
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    conversationId: incomingConvId,
    message,
    confirm: confirmAction,
  } = body as {
    conversationId?: string
    message?: string
    confirm?: { tool: string; args: Record<string, unknown> }
  }

  try {
    // ── HANDLE CONFIRMED WRITE ──
    if (confirmAction) {
      const allData = await loadAllData()
      const result = await executeWrite(confirmAction.tool, confirmAction.args, allData)

      if (incomingConvId) {
        await saveMojoFamiliarMessage({
          conversationId: incomingConvId,
          role: 'assistant',
          content: result,
          actionsTaken: confirmAction,
        })
      }

      return NextResponse.json({
        conversationId: incomingConvId,
        message: result,
      })
    }

    // ── NEW MESSAGE ──
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    let conversationId = incomingConvId
    if (!conversationId) {
      const conv = await createMojoFamiliarConversation()
      conversationId = conv.id
    }

    const history = await getMojoFamiliarMessages(conversationId, MAX_HISTORY)

    await saveMojoFamiliarMessage({
      conversationId,
      role: 'user',
      content: message,
    })

    const allData         = await loadAllData()
    const contextSnapshot = buildContextSnapshot(allData)
    const systemPrompt    = buildSystemPrompt(contextSnapshot)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentMessages: any[] = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    let responseText = ''
    let pendingAction: { tool: string; args: Record<string, unknown>; description: string } | null = null
    const toolCallsLog: unknown[] = []
    let loopCount = 0

    while (loopCount < MAX_LOOPS) {
      loopCount++

      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 2000,
          system: systemPrompt,
          tools: TOOLS,
          messages: currentMessages,
        }),
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await apiResponse.json()

      if (!apiResponse.ok) {
        responseText = 'I encountered an error reaching my knowledge. Please try again.'
        break
      }

      if (data.stop_reason === 'tool_use') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toolUseBlock = data.content?.find((b: any) => b.type === 'tool_use')
        if (!toolUseBlock) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const textBlock = data.content?.find((b: any) => b.type === 'text')
          responseText = textBlock?.text ?? 'I have no response.'
          break
        }

        const toolName = toolUseBlock.name as string
        const toolArgs = (toolUseBlock.input ?? {}) as Record<string, unknown>

        toolCallsLog.push({ tool: toolName, args: toolArgs })

        // WRITE TOOL — return pending confirmation, stop the loop
        if (WRITE_TOOLS.has(toolName)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const textBlock = data.content?.find((b: any) => b.type === 'text')
          const description = getWriteDescription(toolName, toolArgs)
          responseText = textBlock?.text ?? `I can ${description}. Shall I proceed?`
          pendingAction = { tool: toolName, args: toolArgs, description }
          break
        }

        // READ or GENERATE TOOL — execute and continue the loop
        const toolResult = await executeTool(toolName, toolArgs, allData)

        currentMessages = [
          ...currentMessages,
          { role: 'assistant', content: data.content },
          {
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: toolUseBlock.id,
              content: toolResult,
            }],
          },
        ]
        continue
      }

      // end_turn (or any other stop reason) — extract Claude's text response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textBlock = data.content?.find((b: any) => b.type === 'text')
      responseText = textBlock?.text ?? 'I have no response.'
      break
    }

    await saveMojoFamiliarMessage({
      conversationId,
      role: 'assistant',
      content: responseText,
      toolCalls: toolCallsLog.length ? toolCallsLog : undefined,
    })

    return NextResponse.json({
      conversationId,
      message: responseText,
      pendingAction: pendingAction ?? undefined,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    )
  }
}
