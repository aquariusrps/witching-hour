# Mojo — Master Brief, Process & Roadmap
### MOJO_BRIEF_v1.md
### Created: July 2026 | Current version: v1.6
### Last updated: July 2026 — through MOJO-FIX-028 (commit 1f8a81c)
### BUILD STATUS: ACTIVE MAINTENANCE

This is the single authoritative document for the Mojo personal RP
dashboard. It combines project brief, build governance, and roadmap.
Read it in full at the start of every Mojo build session alongside
TWH_BRIEF_v1.md and TWH_PROCESS_v1.md.

---

## 1. What Mojo Is

Mojo is a private personal roleplay management dashboard for the site
operator only. It lives at `/mojo` within The Witching Hour codebase
but is completely isolated from the TWH application — no TWH tables are
read or written, no TWH features are modified, no TWH users have access.

Features include:
- Dashboard / RP Command Center — home page; stats + full RP world with
  nested character cards and quick actions
- RP and character organisation — Site → RP → Character hierarchy
- Thread tracker with auto-fetch reply detection (Tumblr, JCINK, generic)
- Avatar and image management — private storage, proxy URLs, per-image
  expiry, bulk upload with optional crop
- Rotating image stacks — one URL, randomised display from a pool
  (four rotation modes)
- Per-character and global resource libraries
- Faceclaim management with cross-character resource aggregation
- Global snippet/template library with rich text support
- RP wishlist and ideas board
- Writing partner notes book
- Personal image repository — flat folders + tags, not tied to any
  character or RP
- Rich text editing throughout — Tiptap with full toolbar
- Wanted/connections board per RP — open call ads with rich text,
  optional reference image, character assignment, open/filled status
- Global search across all mojo tables — characters, threads, faceclaims,
  resources, snippets, partners, personal images
- Fully mobile-responsive — functional on iPhone and iPad from anywhere,
  with sidebar drawer navigation and touch-optimised layout
- Wishlist image upload — optional reference image per desire card
- Thread system overhaul — class/assignment threads, awaiting-starter
  state, auto-archive on submission detection, reply order cycling,
  WAITING ON [name] badge, auto-refresh on page load
- The Chronicle (/mojo/threads) — master thread tracker across all
  characters and RPs, grouped by character, sorted by urgency
- The Familiar (/mojo/familiar) — AI companion with conversation memory,
  internal data tools, web search, creative writing generation
- Upcoming thread type ("On Deck") — planned threads held indefinitely,
  excluded from active tracking, auto-activate when URL is added
- The Atelier (/mojo/design) — private SVG design preview system for
  evaluating new illustrated header art before applying to production pages

Mojo is operator-only. No public registration. No other users.
Auth is the existing TWH super admin session.

URL: https://atwitchinghour.com/mojo
Theme: Silver & Onyx (hardcoded — not user-switchable)
Storage bucket: mojo-private (PRIVATE — not public)
Image proxy: https://atwitchinghour.com/i/[token]

---

## 2. Relationship to the TWH Codebase

Mojo shares:
- Next.js 16.2.9 / Supabase / Vercel stack
- globals.css design tokens (all theme overrides including Silver & Onyx)
- Supabase project (vkhuttcusqubteseifui)
- Auth system (Supabase Auth, same session)
- lib/supabase/adminClient.ts, serverClient.ts, browserClient.ts
- lib/permissions.ts (isSuperAdmin only)
- Google Fonts already loaded in app/layout.tsx
- sharp (already installed)
- @tiptap/react, @tiptap/starter-kit (already installed)
- dompurify, @types/dompurify (already installed)

Mojo does NOT share:
- Any TWH database table
- Any TWH RLS policy
- Any TWH cached settings
- Any TWH server action or page component
- The (authenticated) route group layout

Mojo has its own:
- Layout: app/mojo/layout.tsx (outside (authenticated) route group)
- All DB tables prefixed mojo_
- All migrations prefixed mojo_NNN_
- All server actions in lib/actions/mojo.ts
- All DB helpers in lib/db/mojo.ts
- All client components in app/mojo/components/
- Storage bucket: mojo-private
- Image proxy: app/i/[token]/route.ts + lib/mojo/proxy.ts
- External image fetch API: app/api/mojo/fetch-image/route.ts
- Image processing API: app/api/mojo/process-image/route.ts
- Thread refresh API: app/api/mojo/refresh-thread/route.ts (MOJO-5)
- Familiar agent API: app/api/mojo/familiar/route.ts (FIX-017a)
- Familiar autotitle API: app/api/mojo/familiar/autotitle/route.ts
- Familiar messages API: app/api/mojo/familiar/messages/route.ts

Additional packages installed (post-build):
- react-markdown@10.1.0 + remark-gfm@4.0.1 — markdown rendering
  in The Familiar chat (FIX-017c)

---

## 3. Session Starter Block

Every Mojo Claude Code prompt must open with this block verbatim:

  Before writing any code or SQL, read these three files in full
  and confirm you have read them before proceeding:
  1. TWH_BRIEF_v1.md — tech stack, design system, database conventions
  2. TWH_PROCESS_v1.md — build governance rules
  3. MOJO_BRIEF_v1.md — Mojo architecture, schema, patterns, and roadmap
  Once you have read all three, confirm you are ready and I will
  provide the build instructions.

Also required: Enable live task tracking in Terminal before beginning
any build work.

---

## 4. Tech Stack & Conventions (Mojo-Specific)

### Authentication

requireSuperAdmin() in lib/actions/mojo.ts returns Promise<string | null>
— userId string on success, null if not super admin.

Correct pattern in every server action:
  const userId = await requireSuperAdmin()
  if (!userId) return { error: 'Unauthorized' }

Correct pattern in server components and route handlers:
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/') // or return 401 in route handlers
  const superAdmin = await isSuperAdmin(user.id)
  if (!superAdmin) redirect('/') // or return 401

CRITICAL: requireSuperAdmin() returns string | null.
It does NOT return { error } | { userId }.
Never check 'error' in result on this call.

The proxy route at app/i/[token]/route.ts has NO auth check.
The token IS the access control. Never add auth to the proxy route.

### Database Client
All mojo DB operations use getAdminClient(). No RLS on mojo tables.

### Browser Supabase Client — CORRECT IMPORT
  import { createBrowserClient } from '@/lib/supabase/browserClient'
  const supabase = createBrowserClient()

NOT createClient — that export does not exist in this codebase.
Confirmed correction from MOJO-4B Q3. Every client-side Supabase
operation uses createBrowserClient.

### No RLS on Mojo Tables
No Row Level Security on any mojo_ table. Access controlled entirely
at application layer via requireSuperAdmin() / isSuperAdmin().

### No Caching Layer
No unstable_cache, no revalidateTag. Use revalidatePath() only.

### Server Action Return Types
  async function myAction(): Promise<{ error: string } | { success: true }> {

Use TablesInsert<'table_name'> / TablesUpdate<'table_name'> for payloads.

### Client-Side Result Narrowing
  const result = await myAction()
  if ('error' in result) { /* handle */ return }
  // success branch

### Navigation After Mutations
All post-action navigation uses window.location.href. Never router.push().

CRITICAL: All window.location.href assignments must be in MODULE-LEVEL
functions — outside any component function body:

  // CORRECT — module level
  function navigateToCharacter(charId: string) {
    window.location.href = '/mojo/characters/' + charId
  }
  // WRONG — violates react-hooks/immutability ESLint rule
  onClick={() => { window.location.href = '...' }}

Exception: window.location.reload() in a module-level function is
acceptable in shared components with no fixed path context (confirmed
MOJO-4B Q5 — MojoAvatarGrid uses this pattern).

### No useTransition
Use useState(false) + direct await for all loading states.

### CSS Variables and Theme
data-theme="silver-onyx" on the mojo layout wrapper div.
All var(--*) tokens remap to Silver & Onyx values automatically.
Never hardcode Silver & Onyx hex values in component code.
data-theme on wrapper div — NOT on html or body.

Tokens that DO NOT EXIST (never use):
  var(--moonstone-dim) — use var(--moon-dim) instead
  var(--f-heading) — use var(--f-head) instead

### Image Display
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={proxyUrl} alt={title} />

### Sharp Buffer Pattern
  const pngBuffer = await sharp(buffer).png().toBuffer()
  return new NextResponse(new Uint8Array(pngBuffer), { ... })
Direct Buffer fails BodyInit type check (confirmed MOJO-3A Q6).

### P-DC Upload Pattern
Images MUST NOT pass through Server Actions (4.5MB Vercel limit).

  1. Client processes file (optional crop via MojoAvatarCrop.tsx)
  2. Client sends blob to /api/mojo/process-image → PNG or GIF returned
  3. Client uploads to mojo-private via createBrowserClient()
  4. Client calls the appropriate registration action with storage path only:
       registerUploadedAvatar() for avatar uploads
       registerUploadedPersonalImage() for personal image uploads

Never pass File, Blob, ArrayBuffer, or base64 through a Server Action.

### Crop Tool — Optional by Default (IMPORTANT)
The crop tool (MojoAvatarCrop.tsx) is opt-in, never mandatory.
Files queue and upload immediately by default.
A Crop button on each queued item opens the crop tool for that
specific file before it uploads.
This applies everywhere in the system — avatar upload, image
repository, everywhere.
RESOLVED in MOJO-6A (was TD-5). Crop is now opt-in everywhere.

### Tiptap v3 API Corrections (confirmed MOJO-6A Q3/Q4)
TextStyle has no default export in v3 — use named import:
  import { TextStyle } from '@tiptap/extension-text-style'
StarterKit v3 bundles link and underline internally. Prevent collision:
  StarterKit.configure({ link: false, underline: false })
Rules of Hooks: useEditor cannot be called conditionally. Split into:
  MojoRichTextEditor (outer — handles readonly early-return, no hooks)
  MojoRichTextEditorInner (inner — always calls useEditor, edit mode only)
Placeholder: do NOT install the Tiptap Placeholder extension. Track
  editor.isEmpty in React state and toggle a CSS class instead.

### useSearchParams Requires Suspense (confirmed MOJO-6B)
Any component using useSearchParams() must be wrapped in a Suspense
boundary. Add <Suspense fallback={null}> around the component in its
parent page. Confirmed: MojoCharacterTabs.tsx uses useSearchParams —
Suspense boundary added in app/mojo/characters/[charId]/page.tsx.

### Navigation Alongside State Changes (confirmed MOJO-6C Q2)
When navigation must accompany a state mutation (e.g. setShowUpload(false)
then navigate), keep the state call inline but call a module-level
navigation function from that inline callback:
  // CORRECT — assignment lives at module level
  function navigateToImages() { window.location.href = '/mojo/images' }
  onClick={() => { setShowUpload(false); navigateToImages() }}
The window.location.href assignment itself must always be in the
module-level function. Calling it from an inline callback is fine.

### Rich Text Fields
All user-facing text inputs use MojoRichTextEditor.tsx (built MOJO-6A)
EXCEPT: snippet fields where type = app_code or formatting (stay plain
monospace textarea — raw text preserved).

Rich text output stored as HTML in existing text columns.
Display: use MojoRichTextEditor in readonly mode:
  <MojoRichTextEditor content={content} onChange={() => {}} readonly />
This is the single sanitisation path (MOJO-6A Q1 decision).
Do NOT use dangerouslySetInnerHTML inline — always use readonly mode.

### Visual Pass Law (MOJO-7B onward)
Every visual pass prompt (7B through 7O) is presentational ONLY.
No logic, no state, no action calls, no data fetches change.
Before touching any file: read it in full, identify functional vs
presentational lines, touch only the presentational lines.
Violations discovered during build must be flagged in Q-items.

### Silver & Onyx Actual Hex Values (confirmed MOJO-7B deviation)
The Silver & Onyx theme hex values must ALWAYS be read from
globals.css before writing any SVG fill/stroke or box-shadow values.
Never assume or guess. The actual confirmed values are:
  --char:       #0c0c14   (deep background, near-black cool)
  --ember:      #6040c0   (iris violet — NOT red/orange)
  --gold:       #a02840   (dark garnet — NOT yellow gold)
  --moonstone:  #288890   (teal — NOT silver-blue)
These differ significantly from generic "silver and onyx" assumptions.
Always verify with: grep -A 80 'data-theme="silver-onyx"' app/globals.css

### SVG Visual Asset Patterns (MOJO-7B onward)
All SVG decorative elements are inline JSX — no external SVG files.
All reusable SVG components live in MojoSvgAssets.tsx.
Append new exports only — never modify existing exports.
SVG clipPath ids must be unique per page instance — use idSuffix prop.
  Example: <SvgMoon idSuffix="sanctum" /> and <SvgMoon idSuffix="other" />
  produce different clip ids and do not interfere.
Established idSuffix pattern: SvgCrescent has idSuffix prop (7B).
  SvgSidebarOrnamentTop and SvgNavDashboard use fixed ids — safe only
  because each renders once per page. Apply idSuffix if reused.
pointer-events: none is required on ALL purely decorative elements.
  Set it on the SVG component itself (once) rather than at every call site.
All @keyframes defined in globals.css under the mojo- prefix.
  Never define @keyframes in component inline styles or JSX.
CSS hover effects for purely presentational hover: use globals.css
  classes, not useState. Example: .mojo-portrait-card:hover { ... }

### searchParams is a Promise in Next.js 16 App Router
In Next.js 16, searchParams in Server Components is a
Promise<Record<string, string | string[] | undefined>>.
It must be awaited before accessing any key:
  export default async function MyPage({
    searchParams,
  }: { searchParams: Promise<{ character_id?: string }> }) {
    const { character_id } = await searchParams
  }
Never access searchParams.key directly — always await first.
Confirmed: MOJO-7K Q1 (search page), applied in MOJO-7L (stacks filter).

### Hydration-Safe Randomness
Never use Math.random() in components that render on both server and
client. The server and client will produce different values, causing
a React hydration mismatch error.
Use predetermined arrays indexed by a stable value (e.g. loop index):
  const rotations = [-1.8, 0.9, -0.7, 1.4, -1.2, 0.6]
  const rotation = rotations[index % rotations.length]
Confirmed pattern: MojoPersonalImageCard.tsx getCardRotation() (MOJO-7J).
SvgStarfield uses predetermined coordinate arrays for the same reason.

### Viewport Meta and iOS Behaviour
app/layout.tsx must include:
  <meta name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1" />
maximum-scale=1 prevents iOS Safari from auto-zooming on form field
focus, which causes jarring layout jumps in mobile web apps.
Confirmed missing and added in MOJO-7O.

### next.config.ts (not .js)
This project uses next.config.ts — the TypeScript config convention.
next.config.js does not exist. Always reference next.config.ts when
adding rewrites, redirects, or other Next.js configuration.
Confirmed: MOJO-FIX-001 Q2.

### Route Handler Auth Pattern (NOT requireSuperAdmin)
Route Handlers (app/api/**) cannot use requireSuperAdmin() —
it redirects, which breaks JSON APIs. Use this pattern instead:
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const isAdmin = await isSuperAdmin(user.id)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
Confirmed pattern: used in refresh-thread, familiar, and all
other mojo API routes. Never redirect() from a Route Handler.

### createMojoThread — Required Fields (confirmed FIX-012b Q5)
createMojoThread requires BOTH rp_id AND character_id.
All parameters are snake_case, not camelCase.
Signature: { rp_id, character_id, title, url?, partner_names?,
  reply_order?, thread_type?, assignment_due_at? }
The add forms derive rp_id from the selected character's rp_id —
it is never asked for separately.

### Forms Use Controlled State, Not FormData (confirmed FIX-011 Q4)
Thread add/edit forms and The Familiar add form use React useState
for all fields and pass typed objects to server actions.
NOT FormData. The confirmed pattern:
  const [title, setTitle] = useState('')
  await createMojoThread({ title, url, ... })
Exception: createMojoCharacter and createMojoRp still use FormData
(confirmed FIX-017a Q-items — adapt accordingly).

### eslint-plugin-react-hooks@7.1.1 Rules (confirmed FIX-017b Q4)
This project's bundled react-hooks plugin enforces two new rules:
1. function-declared-before-use in effects — declare functions
   before the useEffect that calls them
2. set-state-in-effect — calling a setState-invoking function
   directly in an effect body requires scoped eslint-disable:
   // eslint-disable-next-line react-hooks/set-state-in-effect
Both MojoFamiliarChat and MojoFamiliarSidebar use this pattern.
Consistent with existing exhaustive-deps disable precedent in
MojoThreadAutoRefresh.tsx.

### No New npm Packages in Visual Passes
All visual work in 7B–7K uses: CSS, inline SVG in JSX, canvas.
No additional npm packages in any visual pass prompt.

### Flame Animation Pattern (FIX-026 — CRITICAL)
className="mojo-flame-main" or className="mojo-flame-inner" on an
SVG element does NOT animate it. No CSS class rule assigns the
animation properties — only @keyframes and a prefers-reduced-motion
selector exist. Elements with className only are silently static.

The ONLY working pattern is inline style props (confirmed in
SvgCandleRealistic, applied as the fix in FIX-026):
  style={{
    animationName: 'mojo-flame-main',
    animationDuration: '1.8s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationDelay: someDelay,
  }}
For inner flame: animationName: 'mojo-flame-inner', duration: '1.2s'.
All SVGs built after FIX-026 use this inline pattern.
SvgCandelabra and SvgLibraryStudy were fixed in FIX-026.

### Deterministic Trig in SVGs (confirmed FIX-023/024/025/027)
Math.cos/Math.sin/Math.atan2/Math.sqrt are acceptable in SVG
component functions when computing fixed geometric positions —
results are deterministic and do NOT cause hydration issues.
(Same precedent as SvgLeatherTexture which uses Math.sin.)
Math.random() remains prohibited everywhere. No exceptions.

### Inner Helper Functions in SVG Components
SVG components may define inner helper functions inside the
component body (e.g. gId(), renderFace(), leftVanePath).
JSX-returning inner functions require explicit return type:
  function renderFace(...): React.ReactElement { ... }
Pre-computing complex path strings as const variables before
the return statement avoids nested template literal issues:
  const leftVanePath = `M ${...} ...`
  return <path d={leftVanePath} />

### Negative Rect Dimensions — Avoid in SVG
SVG <rect> elements with negative width or height render
inconsistently. Use data-driven xDir/yDir approach instead:
  const xDir = i % 2 === 0 ? 1 : -1
  <rect x={cx} y={cy} width={xDir > 0 ? 16 : 0}  // absolute
Established pattern in SvgGrimoire (FIX-025 Q2), confirmed
in SvgWitchesAttic (FIX-027 Q2).

### Canvas Rendering Hex Values
MojoAvatarCrop.tsx uses the HTML Canvas API for the crop overlay.
Canvas strokeStyle/fillStyle must use literal hex values — CSS variables
do not work in canvas context. Use the confirmed Silver & Onyx hex:
  strokeStyle = '#a02840'  (--gold, dark garnet)
Never use Blood Moon hex values (#e0b028 etc.) in mojo canvas code.
Confirmed fix: MOJO-7N WS1.

### Rich Text Swatch Palette
MojoRichTextEditor.tsx text-color swatches use Silver & Onyx hex values.
The 8 token-labeled swatches (Rose Ash, Mist, Gold, Ember, Moonstone,
Moon Light, Gold Light, Faded) map to confirmed S&O token values.
Three non-theme swatches (White, Cream, Soft Pink) are generic and
intentionally unchanged. Confirmed fix: MOJO-7N WS2.

### mojo_image_tokens + mojo_avatars are paired
Registering an avatar creates TWO rows:
  1. mojo_image_tokens row — provides the proxy token
  2. mojo_avatars row — stores metadata + token

Deleting an avatar requires THREE cleanup steps in order:
  1. Storage file deleted from mojo-private
  2. mojo_image_tokens row deleted (by token)
  3. mojo_avatars row deleted
Always in this order. Storage first, then DB rows.

---

## 5. Migration Naming Convention

Format: mojo_NNN_descriptive_name.sql
Never use the TWH numeric sequence (001-022+).
Applied via Supabase MCP.

After every migration:
  npx supabase gen types typescript \
    --project-id vkhuttcusqubteseifui > types/database.ts 2>/dev/null
The 2>/dev/null is REQUIRED — npm warnings on stderr will corrupt
types/database.ts if not suppressed (confirmed MOJO-7A Q2, permanent fix).

Applied migrations:
  mojo_001_foundation — 5 core tables
  mojo_002_content_system — 6 additional tables + thread tracker columns
  mojo_003_image_stacks — mojo_image_stacks, mojo_image_stack_members,
    primary_stack_id on mojo_characters (circular FK resolved in-migration)
  mojo_004_storage_policy — RLS policies on storage.objects for mojo-private
    (INSERT, SELECT, DELETE for authenticated users)
  mojo_005a_thread_manual_override — ALTER TABLE mojo_threads adds
    manual_whose_turn text CHECK (mine/theirs), nullable (MOJO-5)
  mojo_005_personal_images — mojo_image_folders, mojo_personal_images (MOJO-6C)
  mojo_006_wanted — mojo_wanted table (MOJO-7A)
  mojo_007_wishlist_image — adds image_token text to mojo_wishlist (FIX-005)
  mojo_008_thread_reply_order — adds reply_order text to mojo_threads (FIX-011)
  mojo_009_thread_type_and_class — adds thread_type text NOT NULL DEFAULT 'rp'
    CHECK ('rp','class'), assignment_due_at timestamptz, completed_at timestamptz
    to mojo_threads (FIX-013)
  mojo_010_familiar — creates mojo_familiar_conversations and
    mojo_familiar_messages tables (FIX-017a)
  mojo_011_thread_type_upcoming — widens mojo_threads.thread_type
    CHECK constraint to include 'upcoming' (FIX-018).
    Postgres CHECK constraints cannot be modified in place —
    dropped and recreated. New constraint:
    CHECK (thread_type IN ('rp', 'class', 'upcoming'))

Pending migrations:
  (none)

---

## 6. Complete Database Schema

All tables in public schema. No RLS on any mojo_ table.

mojo_rps:
  id uuid PK, name text NOT NULL, site_name text NOT NULL,
  site_url text, color_hex text DEFAULT '#c83818',
  status text CHECK (active/hiatus/ended) DEFAULT active,
  notes_plot text, notes_partners text, notes_misc text,
  -- all notes fields store HTML (rich text) from MOJO-6A
  display_order integer DEFAULT 0, created_at timestamptz

mojo_faceclaims:
  id uuid PK, name text NOT NULL UNIQUE, notes text,
  created_at timestamptz

mojo_characters:
  id uuid PK, rp_id uuid FK mojo_rps CASCADE,
  faceclaim_id uuid FK mojo_faceclaims SET NULL,
  name text NOT NULL, status text CHECK (active/archived) DEFAULT active,
  bio text, notes_plot text, notes_partners text, notes_misc text,
  -- bio and all notes fields store HTML (rich text) from MOJO-6A
  display_order integer DEFAULT 0, created_at timestamptz,
  primary_stack_id uuid FK mojo_image_stacks SET NULL
  -- Indexes: rp_id, faceclaim_id, status, primary_stack_id

mojo_resources:
  id uuid PK, faceclaim_id uuid FK mojo_faceclaims CASCADE,
  character_id uuid FK mojo_characters SET NULL,
  title text NOT NULL, type text CHECK (text/link/snippet/image/gif),
  content text,  -- HTML for text type; raw for snippet/code types
  url text, storage_path text, public_url text,
  display_order integer DEFAULT 0, created_at timestamptz
  -- resource with both FKs null = global library resource
  -- Indexes: faceclaim_id, character_id, type

mojo_threads:
  id uuid PK, rp_id uuid FK mojo_rps CASCADE,
  character_id uuid FK mojo_characters CASCADE,
  title text NOT NULL, url text, partner_names text,
  status text CHECK (active/archived) DEFAULT active,
  display_order integer DEFAULT 0, created_at timestamptz,
  -- Auto-fetch columns (added mojo_002):
  detected_platform text CHECK (tumblr/jcink/generic/unknown),
  last_poster text,  -- NEVER overwritten when scrape returns null (FIX-015)
  fetch_status text CHECK (success/failed/unsupported/pending/uncertain),
  last_checked_at timestamptz,
  -- Manual whose_turn override (added mojo_005a):
  manual_whose_turn text CHECK (mine/theirs)  -- NULL = use auto-detection
  -- Reply order for ordered/combat threads (added mojo_008):
  reply_order text,  -- comma-separated names, NULL = freeform mode
  -- Thread type and class assignment tracking (added mojo_009/mojo_011):
  thread_type text NOT NULL DEFAULT 'rp'
    CHECK (thread_type IN ('rp','class','upcoming')),
  assignment_due_at timestamptz,  -- optional due date for class threads
  completed_at timestamptz,       -- set when class submission detected
  -- NOTE: thread_type='upcoming' = On Deck state (planned, not active).
  --   Auto-transitions to 'rp' when URL is added via updateMojoThread
  --   (app-layer logic in the server action, not a DB trigger).
  --   Upcoming threads: excluded from Zone 2 mini-cards; shown at
  --   bottom of Chronicle groups under "On Deck" divider.
  -- Indexes: rp_id, character_id, status
  -- NOTE: url IS NULL = 'awaiting_start' state (thread not yet begun)
  -- NOTE: fetch_status='unsupported' + detected_platform='jcink' =
  --   JCINK auth wall — board requires login (FIX-009)

mojo_avatars:
  id uuid PK, character_id uuid FK mojo_characters SET NULL,
  faceclaim_id uuid FK mojo_faceclaims SET NULL,
  title text, storage_path text NOT NULL, token text NOT NULL UNIQUE,
  expires_at timestamptz, width integer, height integer,
  file_size integer, mime_type text DEFAULT image/png,
  created_at timestamptz
  -- Indexes: character_id, faceclaim_id, token

mojo_image_tokens:
  id uuid PK, token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  storage_path text NOT NULL, mime_type text DEFAULT image/png,
  expires_at timestamptz, label text, created_at timestamptz
  -- Index: token

mojo_image_stacks:
  id uuid PK, token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  label text NOT NULL,
  rotation_mode text CHECK (truly_random/weighted/sequential/no_repeat)
    DEFAULT truly_random,
  character_id uuid FK mojo_characters SET NULL,
  faceclaim_id uuid FK mojo_faceclaims SET NULL,
  expires_at timestamptz, last_served_index integer,
  last_served_member_id uuid FK mojo_image_stack_members SET NULL,
  created_at timestamptz
  -- Indexes: token, character_id, faceclaim_id
  -- NOTE: circular FK resolved by creating table without
  --   last_served_member_id, then creating members, then ALTER

mojo_image_stack_members:
  id uuid PK, stack_id uuid FK mojo_image_stacks CASCADE,
  storage_path text NOT NULL, mime_type text DEFAULT image/png,
  weight integer DEFAULT 1, display_order integer DEFAULT 0,
  created_at timestamptz
  -- Index: stack_id

mojo_snippets:
  id uuid PK, title text NOT NULL,
  content text NOT NULL,  -- HTML for general/template; raw for app_code/formatting
  type text CHECK (general/app_code/template/formatting/other) DEFAULT general,
  tags text, display_order integer DEFAULT 0, created_at timestamptz

mojo_wishlist:
  id uuid PK, title text NOT NULL,
  notes text,  -- HTML (rich text) from MOJO-6A
  type text CHECK (character_concept/plot_idea/fandom/other) DEFAULT plot_idea,
  status text CHECK (idea/active/shelved) DEFAULT idea,
  image_token text,  -- optional reference image (added mojo_007, FIX-005)
  display_order integer DEFAULT 0, created_at timestamptz
  -- image_token: same cleanup pattern as mojo_wanted.image_token
  -- On delete: clean up mojo_image_tokens + storage, then row

mojo_partners:
  id uuid PK, handle text NOT NULL, sites text,
  pace_notes text, style_notes text, history_notes text,
  -- all notes fields store HTML (rich text) from MOJO-6A
  display_order integer DEFAULT 0, created_at timestamptz

mojo_character_resources (junction):
  id uuid PK, character_id uuid FK mojo_characters CASCADE,
  resource_id uuid FK mojo_resources CASCADE,
  created_at timestamptz, UNIQUE (character_id, resource_id)
  -- Indexes: character_id, resource_id

mojo_image_folders (created mojo_005, MOJO-6C):
  id uuid PK, name text NOT NULL, display_order integer DEFAULT 0,
  created_at timestamptz
  -- Flat folders only, no nesting

mojo_personal_images (created mojo_005, MOJO-6C):
  id uuid PK, folder_id uuid FK mojo_image_folders SET NULL,
  title text NOT NULL, storage_path text NOT NULL,
  token text NOT NULL UNIQUE, mime_type text DEFAULT image/png,
  expires_at timestamptz, tags text, file_size integer,
  created_at timestamptz
  -- Indexes: folder_id, token
  -- Storage path prefix: 'personal/' (avatars use 'avatars/')

Seed data (inserted as one-off SQL, not a migration):
  One mojo_rps row: "Legacy U" (X-Men roleplay, Remy LeBeau)
  One mojo_faceclaims row: (operator's chosen FC for Remy)
  One mojo_characters row: "Remy LeBeau"
  One mojo_resources row: character bible text resource
  Fixed UUIDs used — ON CONFLICT DO NOTHING — safe to re-run.

mojo_wanted (created mojo_006, MOJO-7A, commit 3976a2e):
  id uuid PK, rp_id uuid FK mojo_rps CASCADE,
  character_id uuid FK mojo_characters SET NULL,
  title text NOT NULL, description text,  -- HTML (rich text)
  image_token text,  -- proxy token string for optional ref image
  status text CHECK (open/filled) DEFAULT open,
  display_order integer DEFAULT 0, created_at timestamptz
  -- Indexes: rp_id, character_id, status
  -- image_token is a raw token string, NOT a FK to mojo_image_tokens
  -- Wanted images use registerImageToken() → token stored directly
  -- On delete: clean up mojo_image_tokens row + storage file manually

mojo_familiar_conversations (created mojo_010, FIX-017a):
  id uuid PK, title text NOT NULL DEFAULT 'New Consultation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()

mojo_familiar_messages (created mojo_010, FIX-017a):
  id uuid PK,
  conversation_id uuid NOT NULL FK mojo_familiar_conversations CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  tool_calls jsonb,      -- tools called (for display/audit)
  actions_taken jsonb,   -- write actions executed (for audit)
  created_at timestamptz NOT NULL DEFAULT now()
  -- Index: (conversation_id, created_at)

---

## 7. Image Proxy Architecture

### Single-Image Proxy
Table: mojo_image_tokens
Token → one storage_path in mojo-private
Route: app/i/[token]/route.ts
Helpers: lib/mojo/proxy.ts
  generateProxyToken() → crypto.randomUUID()
  registerImageToken(storagePath, mimeType, expiresAt, label) → token
  getProxyUrl(token) → NEXT_PUBLIC_SITE_URL + '/i/' + token + '.png'
Response: Content-Type, Cache-Control: public max-age=31536000 immutable,
  X-Robots-Tag: noindex

### Proxy URL Extension Convention (MOJO-FIX-001)
All proxy URLs end in .png for third-party site compatibility:
  https://atwitchinghour.com/i/[token].png

Many platforms (JCINK, Tumblr, Discord, forum software) check the URL
string for a recognised image file extension rather than reading the
Content-Type header. A clean token URL with no extension is rejected.

Implementation:
- next.config.ts rewrites() strips the extension before routing:
    source:      '/i/:token.:ext(png|jpg|jpeg|gif|webp)'
    destination: '/i/:token'
  The route handler receives the clean token — it has no extension
  awareness and does not need to change.
- getProxyUrl() appends .png to all generated URLs (confirmed fix).
- The actual Content-Type served is always correct (image/png or
  image/gif) based on the stored mime_type — the .png in the URL
  is a convention only.
- Clean URLs without extension (/i/token) still work — the rewrite
  source requires a literal dot + extension to match, so legacy URLs
  and direct token access are unaffected.

Files updated in MOJO-FIX-001 (commit 9bf30fb):
  next.config.ts — rewrite rule
  lib/mojo/proxy.ts — getProxyUrl() appends .png
  lib/db/mojo.ts — getMojoWanted() proxy_url construction
  app/mojo/search/page.tsx — image thumbnail src
  app/mojo/components/MojoPersonalImageCard.tsx
  app/mojo/components/MojoAvatarGrid.tsx
  app/mojo/components/MojoCharacterAvatarTabs.tsx
  app/mojo/components/MojoStackCard.tsx
  app/mojo/components/MojoDashboardCharCard.tsx
  app/mojo/characters/[charId]/page.tsx

### Rotating Stack Proxy
Tables: mojo_image_stacks + mojo_image_stack_members
Token → many storage paths → selection per rotation_mode
Same route, checked AFTER single-image lookup
Response: Cache-Control: no-store (MUST — caching defeats rotation)

Four rotation modes:
  truly_random — Math.random(), stateless
  weighted — weighted pool, stateless
  sequential — writes last_served_index per request
  no_repeat — writes last_served_member_id per request

Sequential and no_repeat write to DB on every image serve.
Acceptable for personal tool. Race condition possible but inconsequential.

### Per-Image Expiry
expires_at timestamptz on tokens, stacks, avatars, personal images.
null = indefinite. Proxy returns 410 Gone if expired.
Options: Never / 1 year / Custom date.

### Storage Policies (mojo_004)
Three policies on storage.objects for mojo-private bucket:
  mojo_private_insert_authenticated — INSERT for authenticated
  mojo_private_select_authenticated — SELECT for authenticated
  mojo_private_delete_authenticated — DELETE for authenticated
These enable P-DC client-side uploads via createBrowserClient().

---

## 8. Rich Text System (MOJO-6A)

Component: MojoRichTextEditor.tsx — Client Component wrapping Tiptap.

Required Tiptap extensions (install in MOJO-6A):
  @tiptap/extension-underline
  @tiptap/extension-text-style
  @tiptap/extension-color
  @tiptap/extension-link
  StarterKit already installed (bold, italic, headings, lists,
    blockquote, code, codeBlock, history, strike)

Toolbar:
  Bold · Italic · Underline · Strikethrough · H1 · H2 · H3
  · Text color · Bullet list · Numbered list · Blockquote
  · Code block · Inline code · Link · Horizontal rule

Markdown shortcuts work automatically in Tiptap:
  **bold**, _italic_, # heading, - list, `code`, > quote

Output: HTML string stored in existing text columns.
No schema changes needed.

Display: <MojoRichTextEditor content={content} onChange={() => {}} readonly />
(Centralises sanitisation. Do not use dangerouslySetInnerHTML inline.)

MOJO-6A confirmed corrections (Q3/Q4/Q5):
- TextStyle: named import { TextStyle } from '@tiptap/extension-text-style'
- StarterKit.configure({ link: false, underline: false }) prevents collision
- Component split: outer MojoRichTextEditor (readonly gate, no hooks) +
  inner MojoRichTextEditorInner (always calls useEditor)
- Placeholder via editor.isEmpty React state + CSS class, not the extension
- Styles in globals.css under .mojo-rich-text class

Fields becoming rich text in MOJO-6A retrofit:
  MojoRpNotes.tsx — notes_plot, notes_partners, notes_misc
  MojoCharacterNotes.tsx — bio, notes_plot, notes_partners, notes_misc
  MojoWishlistItem.tsx + MojoAddWishlistItem.tsx — notes
  MojoPartnerCard.tsx + MojoAddPartner.tsx — pace/style/history notes
  MojoSnippetCard.tsx + MojoAddSnippet.tsx — content (non-code types)

Fields staying plain text forever:
  Snippet content where type = app_code or formatting
  All URL inputs, title inputs, tag inputs, storage path inputs

---

## 8b. lib/mojo/utils.ts — Client-Safe Utilities

Created in MOJO-6B. Contains pure utility functions with NO Node.js
APIs, NO process.env access, NO server-only imports. Safe to import
in both Server Components and Client Components.

Exports:
  deriveWhoseTurn(thread, characterName) → 'mine' | 'theirs' | 'unknown'
    Two-arg signature confirmed (FIX-010 Q1).
    Manual override takes priority over auto-detection.
    Short-circuits to 'unknown' for fetch_status in
    ['uncertain','failed','unsupported','pending',null,''].
    If last_poster equals characterName (case-insensitive partial): 'theirs'.
    Else: 'mine'. Tumblr: always 'mine' unless manual override set.

  getWaitingOn(thread, characterName) → string | null  (added FIX-011)
    Returns the name of the next person in reply_order after last_poster.
    Null if reply_order not set, last_poster unknown, or it's caller's turn.
    Bidirectional partial match (case-insensitive).
    Cycles via modulo — last person in order wraps back to first.
    Manual override takes priority — returns null if override set.

  getThreadDisplayState(thread, characterName) → ThreadDisplayState  (FIX-013)
    Single source of truth for badge display. Handles all thread types.
    Priority order:
      1. url IS NULL → 'awaiting_start'
      2. thread_type === 'class' + completed_at set → 'submitted'
      3. thread_type === 'class' → 'due'
      4. deriveWhoseTurn → 'mine'
      5. deriveWhoseTurn + getWaitingOn → 'waiting'
      6. deriveWhoseTurn → 'theirs'
      7. 'unknown'

  getDisplayBadge(state, waitingOn?) → { className, label }  (FIX-013)
    Maps ThreadDisplayState to CSS class + display label.
    Badge classes: mojo-turn-mine (garnet gradient), mojo-turn-theirs
    (teal gradient), mojo-turn-waiting (teal, shows waiting-on name),
    mojo-turn-pending (amber — DUE + AWAITING STARTER), mojo-turn-unknown.

  getThreadStatePriority(state) → number  (FIX-016, revised FIX-018)
    Sort helper (lower = more urgent):
    due=0, mine=1, awaiting_start=2, waiting=3, theirs=4,
    unknown=5, upcoming=6, submitted=7

  detectPlatformClient(url) → 'tumblr' | 'jcink' | 'generic' | 'unknown'
  formatRelativeTime(isoString) → string

ThreadDisplayState type (FIX-013, extended FIX-018):
  'mine' | 'theirs' | 'waiting' | 'unknown' |
  'awaiting_start' | 'due' | 'submitted' | 'upcoming'

CRITICAL: In getThreadDisplayState(), 'upcoming' is checked FIRST
before the url-null check. An upcoming thread has url=null AND
thread_type='upcoming' — without this priority order, upcoming
threads would incorrectly return 'awaiting_start'.
Order: upcoming → awaiting_start → submitted → due → mine/waiting/theirs/unknown

Why separate from thread-fetchers.ts:
  lib/mojo/thread-fetchers.ts uses process.env and Node.js APIs —
  it is a server-only module. Client Components cannot import it.
  lib/mojo/utils.ts duplicates the pure functions for client use.
  Both files are independent sources of truth for their contexts.

IMPORTANT: Always import deriveWhoseTurn from lib/mojo/utils
(not thread-fetchers) in Client Components.

---

## 9. File Structure

app/
  mojo/
    layout.tsx
    page.tsx  (Dashboard / RP Command Center — redesigned MOJO-6B)
    components/
      -- Navigation & layout
      MojoSidebar.tsx
      MojoMobileNav.tsx  (MOJO-7O — hamburger button, overlay backdrop,
        sidebar drawer wrapper for mobile; 'use client')
      -- RP management
      MojoRpNotes.tsx, MojoRpEditForm.tsx
      (MojoRpCard.tsx and MojoArchivedRps.tsx deleted MOJO-7L — confirmed
       zero imports, both retired since MOJO-6B redesign)
      MojoDashboardRpPanel.tsx, MojoDashboardNotes.tsx
      MojoDashboardCharCard.tsx, MojoCollapsedRps.tsx
      MojoDashboardStatTile.tsx
      -- Character management
      MojoAddCharacter.tsx, MojoCharacterStatusToggle.tsx
      MojoCharacterArchiveToggle.tsx, MojoCharacterTabs.tsx
      MojoCharacterNotes.tsx, MojoCharacterAvatarTabs.tsx
      -- Thread tracker
      MojoThreadTracker.tsx
      MojoThreadAutoRefresh.tsx  (FIX-010 — 'use client', fires on mount,
        retries failed/uncertain/pending immediately, 15-min threshold
        for 'success' only, skips 'unsupported' and url-null threads,
        calls router.refresh() once after all parallel fetches complete)
      -- Faceclaims
      MojoFaceclaimAssign.tsx  (FIX-003 — now supports inline creation:
        type name → "+ Create '[name]' as new faceclaim" option appears)
      MojoCreateFaceclaim.tsx
      MojoFaceclaimRow.tsx, MojoFaceclaimNameEdit.tsx
      MojoFaceclaimAvatars.tsx, MojoQuickCopyPanel.tsx
      -- Resources
      MojoAddResource.tsx, MojoResourceList.tsx
      MojoResourcesTab.tsx, MojoLinkToCharacter.tsx
      -- Library
      MojoAddSnippet.tsx, MojoLibraryTabs.tsx, MojoSnippetCard.tsx
      MojoLibraryResources.tsx  (MOJO-7A — wraps MojoResourceList with
        inline link-to-character affordance; replaces separate MojoLinkToCharacter usage)
      -- Wishlist
      MojoWishlistList.tsx, MojoAddWishlistItem.tsx, MojoWishlistItem.tsx
      -- Partners
      MojoAddPartner.tsx, MojoPartnerList.tsx, MojoPartnerCard.tsx
      -- Avatars & stacks
      MojoAvatarUpload.tsx, MojoAvatarCrop.tsx, MojoAvatarGrid.tsx
      MojoAvatarFilter.tsx, MojoAvatarManager.tsx, MojoFaceclaimAvatars.tsx
      MojoStackCard.tsx, MojoStackMembers.tsx, MojoStackDropZone.tsx
      MojoStackUrlCopy.tsx, MojoCreateStack.tsx
      -- Wanted / connections board
      MojoWantedBoard.tsx  (MOJO-7A — per-RP wanted ad CRUD, reference image upload)
      -- Personal images
      MojoPersonalImageUpload.tsx, MojoPersonalImageCard.tsx
      MojoImageFolderList.tsx
      MojoPersonalImageManager.tsx  (NOTE: this component contains the
        actual two-column folder+grid layout, not images/page.tsx —
        confirmed MOJO-7O Q1. Responsive layout classes applied here.)
      -- Portrait cards
      MojoPortraitCard.tsx  (FIX-004 — shared tarot-card portrait display,
        props: token, alt, size sm/md/lg, idSuffix, showFrame, className;
        3:5 aspect ratio, max 500px, SvgPortraitFrame overlay)
      -- RP note panels
      MojoRpNotePanel.tsx  (FIX-007b — per-field RP note card, 'use client',
        props: rpId, label, field, initialValue; replaces MojoRpNotes
        on the RP detail page for three separate always-visible panels)
      -- Character avatar strip
      MojoCharacterAvatarStrip.tsx  (FIX-008 — 'use client', secondary
        avatar display + upload button; primary portrait rendered directly
        on page, not in this component — confirmed FIX-008 Q1)
      -- Chronicle
      MojoChronicleAddForm.tsx  (FIX-012b — 'use client', thread add form
        with character selector dropdown; uses controlled useState, NOT
        FormData; derives rp_id from selected character's rp_id)
      -- The Familiar
      MojoFamiliarChat.tsx  (FIX-017a/b — 'use client', full chat UI with
        message bubbles, loading states, pending confirmation card,
        auto-scroll, ReactMarkdown rendering for assistant messages)
      MojoFamiliarSidebar.tsx  (FIX-017b — 'use client', conversation
        history list, new/delete/rename, active highlighting)
      MojoFamiliarWrapper.tsx  (FIX-017b — 'use client', thin coordinator
        managing activeConvId + chatKey between sidebar and chat;
        chatKey increment forces MojoFamiliarChat remount on conv switch)
      -- Rich text
      MojoRichTextEditor.tsx  (outer — readonly gate, no hooks)
      MojoRichTextEditorInner (inner — always calls useEditor, edit only)
      -- Visual design assets (MOJO-7B onward)
      MojoSvgAssets.tsx  (SVG component library — 74 exports as of FIX-027;
        FIX-029 will add SvgPortraitHall → 75)
      MojoMoonPhases.tsx  (MOJO-7C — live lunar phase calculator + display)
    rps/page.tsx (redirect), rps/[rpId]/page.tsx, rps/[rpId]/edit/page.tsx
      (RP detail page: single-page layout, character portrait spread,
       candle-flanked threads, three MojoRpNotePanel cards — FIX-007/007b)
    characters/[charId]/page.tsx
      (single-page dossier: Zone 2 two-column portrait+meta, Zone 3
       three-column Journal/Correspondence/Archive — FIX-008/008b)
    faceclaims/page.tsx, faceclaims/[fcId]/page.tsx
    avatars/page.tsx
    stacks/page.tsx  (accepts ?character_id= filter — MOJO-7L)
    library/page.tsx
    wishlist/page.tsx
    partners/page.tsx
    images/page.tsx  (built MOJO-6C)
    search/page.tsx  (full global search — built MOJO-7A; awaits searchParams)
    threads/page.tsx  (The Chronicle — FIX-012b)
    familiar/page.tsx  (The Familiar — FIX-017a/b; thin shell, uses Wrapper)
    design/page.tsx  (The Atelier index — FIX-021; lists all design candidates)
    design/library-bookshelf/page.tsx  (FIX-021 — chosen, applied to production)
    design/library-study/page.tsx      (FIX-021 — not chosen, reference)
    design/hall-of-mirrors/page.tsx    (FIX-023 — Stacks concept, pending)
    design/divining-chamber/page.tsx   (FIX-024 — Search concept, pending)
    design/grimoire/page.tsx           (FIX-025 — Chronicle concept, pending)
    design/witches-attic/page.tsx      (FIX-027 — Images concept, pending)
    (design/portrait-hall/page.tsx     pending FIX-029 — Faceclaims concept)
  i/[token]/route.ts  (public, no auth)
  api/mojo/
    fetch-image/route.ts
    process-image/route.ts
    refresh-thread/route.ts  (built MOJO-5)

lib/
  mojo/
    proxy.ts           -- token registration + proxy URL helpers
    thread-fetchers.ts -- platform detection + fetch strategies (SERVER ONLY)
                          JCINK: authenticated via JCINK_MEMBER_ID +
                          JCINK_PASS_HASH cookie headers (FIX-009)
                          Class thread mode: scans ALL post authors for
                          characterName, returns my_post_found boolean
    utils.ts           -- client-safe utilities (see §8b)
  actions/mojo.ts  (59 actions as of FIX-017a)
  db/mojo.ts
app/api/mojo/
  fetch-image/route.ts
  process-image/route.ts
  refresh-thread/route.ts
    (FIX-015: last_poster only written when result.last_poster is
     non-null/truthy — preserves last known good value on scrape failure)
  familiar/route.ts        (FIX-017a — The Familiar agent)
  familiar/autotitle/route.ts  (FIX-017a — background title generation)
  familiar/messages/route.ts   (FIX-017b — load conversation history)

---

## 10. Navigation

Sidebar nav order (as of FIX-021, confirmed against live MojoSidebar.tsx):
  1. Dashboard → /mojo
  2. Images → /mojo/images
  3. Faceclaims → /mojo/faceclaims
  4. Library → /mojo/library
  5. Wishlist → /mojo/wishlist
  6. Partners → /mojo/partners
  7. Stacks → /mojo/stacks
  8. Chronicle → /mojo/threads  (label is "Chronicle" in MojoSidebar.tsx —
     NOT "Tracker"; a rename to "Tracker" was discussed but not applied)
  9. Search → /mojo/search
  10. The Familiar → /mojo/familiar
  11. The Atelier → /mojo/design  (FIX-021 — design preview, bottom of nav)
     Active state: pathname.startsWith('/mojo/design')
     Icon: SvgNavDesign (compass rose glyph)
     Position: last item, above version footer

  Note on Chronicle label: the named space is "The Chronicle" (and
  pending rename to "The Grimoire" once approved in Atelier). A sidebar
  label change to "Tracker" was discussed but MojoSidebar.tsx still
  reads label: 'Chronicle' as of FIX-028 — see TD-18.

---

## 11. Dashboard / RP Command Center
Functional: COMPLETE — MOJO-6B (commit c178766)
Visual pass: COMPLETE — MOJO-7C "The Sanctum" (commit 1efaabe)

The dashboard (/mojo) is the RP command center. The old simple dashboard
is retired. MojoRpCard.tsx and MojoArchivedRps.tsx are retained as files
but no longer rendered.

Key implementation details:
- getMojoDashboardData() in lib/db/mojo.ts — single parallel fetch
  (7 queries via Promise.all, merged in application code)
- DashboardRp and DashboardCharacter types exported from lib/db/mojo.ts
- Character ?tab= deep-linking: MojoCharacterTabs.tsx reads useSearchParams
  for initial tab; Suspense boundary in characters/[charId]/page.tsx
- whose_turn count badge: computed client-side via deriveWhoseTurn from
  lib/mojo/utils.ts (NOT thread-fetchers.ts — client-safe version)
- Avatar display priority: primary_stack token → most recent avatar token
  → SVG placeholder silhouette

Structure top to bottom:

Stats strip (compact, one row, 6 small tiles):
  Active RPs · Total Characters · Active Threads · Snippets · Partners · Stacks
  Each tile links to the relevant page.

Active Roleplays (main content area):
  Each RP is a full-width panel with:
  - Left accent bar in RP color_hex
  - RP name + site name (linked to site_url) + status badge
  - Edit / Add Character / Archive buttons inline
  - Notes preview: first line of notes_plot italic, click to expand
  - Character row: horizontal scroll of character cards showing:
    avatar (from primary_stack proxy URL if set, else placeholder),
    character name, faceclaim name, status badge,
    four quick-action icon buttons: View, Threads, Resources, Archive/Restore
  - Thread count + active thread count as panel footer

Hiatus and Ended: collapsed section at bottom, same structure, muted.

No separate /mojo/roleplays route. Dashboard IS the roleplays page.

Visual elements — current state (after FIX-006/019/020):
- SvgLargeCrescent (260px) — top-right, partially clipped, mojo-moon-breathe
  (replaced SvgMoon in FIX-006)
- MojoMoonPhases — redesigned in FIX-019/020:
  * 8 unique illustrated phase SVGs (SvgPhaseNewMoon through SvgPhaseWaningCrescent)
  * Rotating display: current phase always centered (position 3 of 8)
    using displayOrder = Array.from({length:8},(_,i) => (currentIndex-3+i+8)%8)
  * Night-sky card container: radial-gradient(ellipse, #0e0e20, #080810, #050508)
  * Non-active phases: opacity 0.45 on icon, opacity 1.0 on label (FIX-028)
  * Active phase: size=56, others size=40; all vertically centered (no translateY)
  * Card padding: 10px 12px (reduced from 20px 24px in FIX-028)
  * 6 fixed-position star dots in card background (no Math.random)
  * Active Threads stat tile links to /mojo/threads (FIX-020)
- SvgCandleRealistic (pair, idSuffix "sanctum-left"/"sanctum-right") —
  flanking "Active Roleplays" heading; replaced SvgCandle in FIX-019.
  Uses inline animationName props (not className — see flame pattern §4).
- SvgPageHeaderRule — elaborate decorative hr below page title
- Stat tile watermark symbols: ☽ RPs · ♃ Characters · ∞ Threads
  · ☿ Snippets · ♆ Partners · ⬡ Stacks (via watermark prop, 7% opacity)
- MojoPortraitCard size="md" (180×300px) — upgraded from size="sm" (FIX-019)
- RP panels — ornate treatment (FIX-019):
  * Full perimeter border: border: `1px solid ${rp.color_hex}33`
  * Inner glow: box-shadow: `inset 0 0 0 1px ${rp.color_hex}14`
  * Background tint: radial-gradient from rp.color_hex at ~4% opacity
  * Corner brackets: SvgCornerBracket size=24 (was 16)
  * RP name: Cormorant Upright 32px, colored in rp.color_hex
  * Site name: EB Garamond italic 15px var(--mist)
  * Status: MojoRpStatusMenu restyled (Cinzel 9px + pip) — NOT replaced
    with dead span (would have deleted working functionality — FIX-019 Q2)
  * Two SvgFiligreeRule dividers (header→characters, characters→footer)
  * Thread count footer: Cinzel 9px, active count in rp.color_hex
- Whose-turn badge: mojo-turn-upcoming (indigo) added for On Deck state

---

## 12. Personal Image Repository
Functional: COMPLETE — MOJO-6C (commit 3ca7020)
Visual pass: COMPLETE — MOJO-7J "The Darkroom" (commit dd8bdb4)
Replacement concept: SvgWitchesAttic ("The Witch's Attic") in The
Atelier at /mojo/design/witches-attic — pending approval before
applying to production. SvgDarkroomHeader stays in assets.

Route: /mojo/images
Sidebar: Second position (between Dashboard and Faceclaims)

Organisation: Flat folders (one level, no nesting) + tags per image.
Both coexist — image can be in a folder AND have tags.

Page structure:
  Left panel: folder list + All Images + Untagged + New Folder
  Main panel: image card grid filtered by folder or tag
  Upload: same pipeline as avatars, crop optional/skippable by default
  Tag filter chips above grid
  Cards: image, title, folder badge, tag chips, copy URL, edit, delete
  Proxy system: same mojo_image_tokens + /i/[token]
  Can be dragged into stacks using the same dataTransfer key as avatars:
    'application/mojo-avatar' — MojoStackDropZone accepts drops from
    both MojoAvatarGrid and MojoPersonalImageCard with no changes needed.
  Storage path prefix for personal images: 'personal/' (avatars: 'avatars/')

Distinct from:
  mojo_avatars — tied to characters and faceclaims
  mojo_resources of type image/gif — tied to faceclaims/characters
  mojo_personal_images — free-floating, no character/RP context

---

## 13. Auto Reply Tracker (MOJO-5)

Environment Variable:
  TUMBLR_API_KEY — Tumblr OAuth consumer key
  Consumer Secret NOT needed (v2 API accepts key alone for public posts)
  STATUS: Added to .env.local and Vercel. Redeployment confirmed.

Platform detection (automatic from thread URL):
  tumblr.com → detected_platform=tumblr → Tumblr API
  *.jcink.net or *.jcink.com → detected_platform=jcink → JCINK scraper
  anything else → detected_platform=generic → generic scraper

No manual selection ever required.

Tumblr: OAuth 1.0a but v2 read endpoint accepts consumer key as Bearer
  for public posts. Fetches reblog chain, finds last poster. Most reliable.

JCINK: Scrapes HTML. Consistent post table structure across JCINK sites.
  fetch_status=uncertain when structure not recognised.

Generic: Best-effort HTML parse for common forum software.
  fetch_status=uncertain when unconfident.
  fetch_status=unsupported for JS-rendered sites.

whose_turn: Derived at render time, NOT a stored column.
  last_poster matches character name → Their turn
  last_poster differs → Your turn
  fetch_status uncertain/failed/unsupported → Unknown

last_checked_at always shown so operator knows data freshness.

Manual override always available regardless of fetch status.
Stored in mojo_threads.manual_whose_turn (added mojo_005a).
NULL = use auto-detection. 'mine' / 'theirs' = persistent override.
Server action: updateMojoThreadWhoseTurn(threadId, 'mine'|'theirs'|null)

node-html-parser package installed for HTML scraping (v9.0.0+).
react-markdown@10.1.0 + remark-gfm@4.0.1 installed (FIX-017c).

deriveWhoseTurn() — pure function in lib/mojo/utils.ts (NOT thread-fetchers).
Tumblr limitation: last_poster is a blog name, not a character name.
Auto-detection always returns 'mine' for Tumblr threads. Use manual
override. UI shows tooltip explaining this on Tumblr-detected threads.

API route: app/api/mojo/refresh-thread/route.ts — POST, auth required.
  Body: { threadId: string }
  Updates: fetch_status, last_checked_at, detected_platform always.
  last_poster: ONLY updated when result.last_poster is non-null (FIX-015).
  Preserves last known good value on scrape failure — prevents flip-flopping.
  Class thread mode: if thread_type='class', fetches character name,
  passes to scraper, auto-archives if my_post_found=true (FIX-013).

Refresh all: parallel (Promise.allSettled) — FIX-010 changed from
  sequential. Failed individual refreshes don't block others.

Auto-refresh on page load (MojoThreadAutoRefresh — FIX-010/014):
  'use client' component placed on character page, RP page, Chronicle.
  Fires on mount. Retry logic:
    fetch_status in ['failed','uncertain','pending',null,''] → retry immediately
    fetch_status 'success' → retry only if last_checked_at > 15 minutes old
    fetch_status 'unsupported' → never retry (structural failure)
    url IS NULL → never retry (no URL to scrape)
  All retries via parallel fetch() to refresh-thread route.
  Single router.refresh() call after all complete.

JCINK authenticated scraping (FIX-009):
  Cookie header sent: member_id=JCINK_MEMBER_ID; pass_hash=JCINK_PASS_HASH
  Auth-wall detection: fetch_status='unsupported' when "do not have
    permission" page returned (HTTP 200 false positive).
  Selector confirmed for marvellegacyu skin: showuser link regex.
  JCINK_PASS_HASH stored as decoded bcrypt ($2y$11$...) — NOT URL-encoded.

Thread type system (FIX-013):
  thread_type='rp' (default): standard back-and-forth, whose-turn
    detection via scraper last-poster comparison.
  thread_type='class': assignment thread. Scraper scans ALL post
    authors for character name. On detection → auto-archive +
    completed_at = now(). Badge shows 'DUE' (amber) until submitted.
  url IS NULL: 'awaiting_start' state — thread not yet begun.
    Badge shows 'AWAITING STARTER' (amber). Never auto-refreshed.

Reply order cycling (FIX-011):
  reply_order: optional comma-separated list e.g. "Remy, Johnny, Sue".
  getWaitingOn() finds last_poster in list, returns next person's name.
  Cycles: last person wraps to first (modulo).
  Badge shows "WAITING ON [name]" instead of generic "THEIR TURN".
  Freeform (reply_order NULL): existing mine/theirs/unknown logic.

---

## 14. Rotating Image Stacks

One URL → different image each request from a pool.
Proxy lookup order:
  1. Check mojo_image_tokens (single image) → serve if found
  2. Check mojo_image_stacks (rotating stack) → apply rotation if found
  3. Neither found → 404

Stack member drag-drop:
  dataTransfer key: 'application/mojo-avatar'
  Payload: { storage_path, mime_type, avatar_id }
  Key is used by THREE drag sources:
    MojoAvatarGrid.tsx (setData) — avatar cards
    MojoPersonalImageCard.tsx (setData) — personal image cards (MOJO-6C)
    MojoStackDropZone.tsx (getData) — the drop target
  All three confirmed consistent. avatar_id field is reused for image id
  in personal image payloads — MojoStackDropZone ignores it.

Primary stack: character can have one primary_stack_id FK.
  Additional freestanding stacks also supported.

Stack edit mode now supports character/faceclaim reassignment —
TD-6 RESOLVED in MOJO-7A. updateMojoImageStack payload extended
to include character_id and faceclaim_id. MojoStackCard edit form
has grouped character select + alphabetical faceclaim select.

---

## 14b. Thread Display System (FIX-010 through FIX-016)

### Unified Badge System
All thread badges use one CSS class family:
  .mojo-turn-badge (base) + one state class:
  .mojo-turn-mine     — garnet gradient, YOUR TURN
  .mojo-turn-theirs   — teal gradient, THEIR TURN
  .mojo-turn-waiting  — teal gradient, WAITING ON [name]
  .mojo-turn-pending  — amber gradient, DUE or AWAITING STARTER
  .mojo-turn-unknown  — faded, UNKNOWN

Old flat-color family (.mojo-thread-turn-*) still in globals.css
but no longer used anywhere — retired FIX-012a.

### Thread Sort Priority
getThreadStatePriority() values (lower = more urgent):
  due=0, mine=1, waiting=2, theirs=3, unknown=4,
  awaiting_start=5, submitted=6

Active threads sorted by this priority at all four display surfaces:
  MojoThreadTracker (character page Correspondence column)
  Character page Zone 2 mini-cards
  RP page thread list
  The Chronicle (/mojo/threads)

### Manual Override (··· Collapse — FIX-010)
The Auto/Mine/Theirs override buttons are hidden by default.
A ··· trigger in the thread card action row toggles an inline
override row per thread. openOverride state keyed by thread ID.
Clicking an option sets the override and collapses the row.

### Upcoming Thread Type ("On Deck" — FIX-018)
thread_type='upcoming': planned thread held indefinitely.
Badge: "On Deck" (.mojo-turn-upcoming — indigo/blue gradient).
Priority: 6 (always last — below even awaiting_start).
Auto-transition: updateMojoThread pre-reads existing thread_type;
  if 'upcoming' and a URL is provided, silently sets type to 'rp'.
  No user confirmation needed — seamless activation.
Zone 2 exclusion: upcoming threads filtered from character page
  mini-cards (header area only). Zone 3 Correspondence shows them.
Chronicle: upcoming appear at bottom of each character group under
  an "On Deck" divider. Opacity 0.70 to distinguish from active threads.

### The Chronicle (/mojo/threads — FIX-012)
Master thread tracker across all characters and RPs.
Theme: scriptorium — parchment, leather, quill, candlelight.
Header: SvgOpenLedger (grand open ledger illustration, 180px tall).
Pending rename to "The Grimoire" once SvgGrimoire is approved in
The Atelier and applied to production.

getMojoAllThreads(): three-query pattern:
  1. All threads (select *)
  2. Characters by character_id (id, name, status, rp_id)
  3. RPs by rp_id (id, name, color_hex)
  4. Avatars by character_id (most recent token per character)
  Returns merged: character_name, character_status, rp_name,
    rp_color_hex, character_avatar_token on each thread.

Page layout (top to bottom):
  Zone 1: SvgOpenLedger header, "The Chronicle" / subtitle
  Zone 2: MojoChronicleAddForm (character selector + all fields)
  Zone 3: Active Correspondence — grouped by character, candle heading,
    sorted by state priority, YOUR TURN groups first
  Zone 4: Closed Correspondence — archived threads, wax seal heading,
    dimmed 0.65 opacity, SvgChronicleQuill + SvgScrollEnd at bottom

Auto-refresh: MojoThreadAutoRefresh fires on mount.

---

## 15. Wanted / Connections Board (COMPLETE — MOJO-7A, commit 3976a2e)

Per-RP section on the RP detail page (/mojo/rps/[rpId]).
Fields: title, rich text description, optional reference image
(P-DC upload via registerWantedImage(), token stored as image_token),
character assignment (optional), status (open/filled).

Component: MojoWantedBoard.tsx (Client Component)
  Props: rpId, initialItems, characters
  Features: add/edit/delete/status toggle, P-DC image upload inline,
  rich text description via MojoRichTextEditor, open items first then
  collapsed filled items section.
DB helper: getMojoWanted(rpId) — open items first, then filled.
Actions: createMojoWanted, updateMojoWanted, updateMojoWantedStatus,
  deleteMojoWanted, registerWantedImage (5 actions added in MOJO-7A)
Wanted reference images: registerImageToken() stores token in
  mojo_wanted.image_token. NOT a mojo_personal_images entry.
  Storage path prefix: 'wanted/'
  On delete: clean up mojo_image_tokens + storage file, then row.

---

## 15b. The Familiar (/mojo/familiar — FIX-017)

### Identity
The Familiar is an AI companion — devoted, intimate, mystical,
efficient. Keeper of Mojo's characters, stories, and secrets.
Page theme: candlelit, private, amber-warm. SvgFamiliarPresence
(cat's eye illustration) watches over the conversation.

### Architecture
Three layers:
  1. Chat UI — MojoFamiliarChat.tsx ('use client')
  2. Agent route — /api/mojo/familiar/route.ts (Route Handler)
  3. Memory — mojo_familiar_conversations + mojo_familiar_messages

### Agent Route (/api/mojo/familiar/route.ts)
Model: claude-sonnet-4-6 | max_tokens: 8000 (FIX-017c)
Tools (15 total):
  Read (4): get_characters, get_rps, get_active_threads, get_faceclaims
  Generate (3): generate_biography, generate_wanted_ad,
    generate_thread_starter (each triggers a secondary focused
    Claude call at max_tokens: 1000 — not the main 8000 limit)
  Write (6): create_character, create_rp, create_thread,
    create_faceclaim, assign_faceclaim, archive_thread
  Web search (1): web_search_20250305 (Anthropic first-party tool,
    requires 'anthropic-beta': 'web-search-2025-03-05' header)

Write tools require confirmation:
  Route returns pendingAction object, does NOT execute.
  Client shows Confirm/Cancel card.
  On confirm: client sends { confirm: true, pendingAction } back.
  Route executes and reports result.

Read and generate tools execute immediately in a loop (max 6 iterations).

### System Prompt (FIX-017c)
Key directives:
  - Address Mojo as "Mojo" (he/him pronouns)
  - Write in prose, not structured documents
  - No emoji, no ### headers, no --- rules in conversational responses
  - Tables acceptable for data (character rosters, thread lists)
  - Context snapshot injected at end: current characters, RPs,
    threads needing response
  - Write creative content with craft and atmosphere
  - Search before speculating on canon

### Memory
Conversation history: last 20 messages loaded per API call.
Auto-titling: after first exchange, background fetch to
  /api/mojo/familiar/autotitle fires (non-blocking, .catch(()=>{})).
  Claude generates a 3-5 word title at max_tokens: 30.
Conversation switching: chatKey pattern — incrementing integer
  as React key forces MojoFamiliarChat remount on conversation
  change, cleanly resetting all internal state.
sidebarRefreshKey: separate counter bumped by onTitleUpdated
  callback to trigger sidebar reload after auto-title (FIX-017b Q2).

### Environment Variables Required
ANTHROPIC_API_KEY — Anthropic API key, server-side only.
  Set in Vercel environment variables AND .env.local.
  Never hardcoded in any source file.

---

## 16. Known Technical Debt

TD-1: RESOLVED in MOJO-7L. Five module-level navigation functions added:
  MojoAddCharacter.tsx: navigateToRp(rpId)
  MojoCharacterArchiveToggle.tsx: navigateToCharacter(charId)
  MojoCharacterStatusToggle.tsx: navigateToRp(rpId)
  MojoRpEditForm.tsx: navigateToRp(rpId)
  MojoSidebar.tsx: navigateToDashboard()
  All window.location.href assignments now at module level. 32 total
  href assignments confirmed module-level via coherence audit (MOJO-7M).

TD-2: RESOLVED in MOJO-7A. Link affordance moved inline into
  MojoResourceList rows via onLinkToCharacter prop. MojoLibraryResources.tsx
  manages the character selector. MojoLinkToCharacter no longer used
  in library page.

TD-3: RESOLVED in MOJO-4B. MojoAvatar type alias now used.

TD-4: Two pre-existing img ESLint warnings unrelated to mojo.
  Not errors. Not blocking.

TD-5: RESOLVED in MOJO-6A. Crop is now opt-in in MojoAvatarUpload.tsx.
  MojoPersonalImageUpload.tsx (MOJO-6C) built correctly from the start.

TD-6: RESOLVED in MOJO-7A. MojoStackCard edit form now has grouped
  character select + alphabetical faceclaim select. updateMojoImageStack
  payload extended to include character_id and faceclaim_id.

TD-7: RESOLVED in MOJO-7A (same fix as TD-2 — single change resolved both).
  MojoResourceList onLinkToCharacter prop added.

TD-8: RESOLVED in MOJO-6B (Q2). MojoThreadTracker.tsx was importing
  deriveWhoseTurn from lib/mojo/thread-fetchers.ts (server module).
  Switched to lib/mojo/utils.ts (client-safe). No functional impact.

TD-9: Table count expectation in MOJO-6C was off by one (Q3).
  mojo_005a is ALTER TABLE not CREATE TABLE, so it adds a column not
  a table. Post-mojo_005 table count is 15, not 16. Informational only.

TD-10: Four SVG components have unused idSuffix props (ESLint warnings,
  not errors). Forward-compatible props per spec. Acceptable per project
  standards (warnings acceptable). No action needed.
  Affected: SvgCandle, SvgPortraitFrame, SvgSidebarOrnamentTop,
  SvgNavDashboard — all have the idSuffix prop as forward-compatible
  uniqueness mechanism for future multi-instance rendering.

TD-11: MojoCharacterNotes.tsx has two structural containers (Biography
  standalone + tabbed Plot/Partner/Misc), not four separate sections as
  originally planned. Journal frames applied to the two real containers
  in MOJO-7D. Documented deviation from original spec — resolved in build.

TD-12: .mojo-sidebar-width CSS class defined in globals.css (MOJO-7O)
  but not applied to MojoSidebar.tsx — tablet sidebar narrowing rule is
  currently inert. MojoSidebar.tsx was not in the MOJO-7O authorized
  file list (Rule 3). Low priority future enhancement: add
  className="mojo-sidebar-width" to the sidebar wrapper in MojoSidebar.tsx
  to activate the 200px tablet width rule.

TD-13: .mojo-folder-tab CSS class defined in globals.css (MOJO-7O)
  but not applied to folder items in MojoImageFolderList.tsx — mobile
  folder compact chip styling is inert. MojoImageFolderList.tsx was not
  in the MOJO-7O authorized file list. Low priority future enhancement:
  apply mojo-folder-tab className to folder item elements.

TD-14: Avatar "Set Primary" scoped to stacks only (confirmed FIX-008 Q1,
  FIX-017a Q-items). setCharacterPrimaryStack targets mojo_image_stacks,
  not raw mojo_avatars. No per-avatar set-primary action exists. The
  primary portrait display uses primary_stack_id → most recent avatar
  fallback priority. To promote a raw avatar to primary, it must first
  be added to a stack.

TD-15: Primary portrait in Zone 2 (character page) is server-rendered
  from avatarToken but MojoCharacterAvatarStrip's "Set Primary" only
  updates client-side strip state. After clicking Set Primary, the large
  portrait in the left column won't update until page reload. Fix: lift
  primaryToken state into a shared client wrapper around Zone 2.

TD-16: Vestigial <g style={{ animationDelay: ... }}> wrappers remain
  in SvgCandelabra from before FIX-026. The <g> element has no
  animationName so the delay has no effect — harmless dead code.
  FIX-026 added correct inline animationName props on each animated
  ellipse but left the wrapper <g> elements in place per scope rules.
  Low priority cleanup.

TD-17: scene-clip clipPath defined in SvgWitchesAttic <defs> is never
  referenced in the SVG body — inert dead code matching the original
  spec exactly. Harmless. (FIX-027 Q5)

TD-18: Sidebar Chronicle label rename to "Tracker" was discussed but
  NOT applied — confirmed live in MojoSidebar.tsx as of FIX-028, the
  nav item still reads label: 'Chronicle'. If the rename is wanted,
  it requires an explicit follow-up prompt; do not assume it is done.

---

## 17. Server Actions Reference (lib/actions/mojo.ts)

Total as of FIX-017a: 59 actions (requireSuperAdmin count = 59)

Built:
  RP: createMojoRp, updateMojoRp
  Character: createMojoCharacter, updateMojoCharacter, updateMojoCharacterStatus
  Thread: createMojoThread, updateMojoThread, updateMojoThreadStatus, deleteMojoThread
  Faceclaim: createMojoFaceclaim, updateMojoFaceclaim, deleteMojoFaceclaim,
    assignFaceclaimToCharacter
  Resource: createMojoResource, updateMojoResource, deleteMojoResource,
    registerUploadedImage, linkResourceToCharacter, unlinkResourceFromCharacter
  Avatar: registerUploadedAvatar, updateMojoAvatar, deleteMojoAvatar
  Stack: createMojoImageStack, updateMojoImageStack, deleteMojoImageStack,
    addMemberToStack, removeMemberFromStack, updateStackMember,
    setCharacterPrimaryStack
  Snippet: createMojoSnippet, updateMojoSnippet, deleteMojoSnippet
  Wishlist: createMojoWishlistItem, updateMojoWishlistItem,
    updateMojoWishlistStatus, deleteMojoWishlistItem
  Partner: createMojoPartner, updateMojoPartner, deleteMojoPartner
  Thread (MOJO-5): updateMojoThreadWhoseTurn
  Personal Images (MOJO-6C): createMojoImageFolder, updateMojoImageFolder,
    deleteMojoImageFolder, registerUploadedPersonalImage,
    updateMojoPersonalImage, deleteMojoPersonalImage

  Wanted (MOJO-7A): createMojoWanted, updateMojoWanted,
    updateMojoWantedStatus, deleteMojoWanted, registerWantedImage
  updateMojoImageStack extended in MOJO-7A to accept character_id
    and faceclaim_id (payload extension, not a new action)

  FIX-003: createAndAssignFaceclaim(name, characterId) — creates
    faceclaim (or finds existing by case-insensitive name match via
    .maybeSingle()) and immediately assigns to character. Revalidates
    both /mojo/faceclaims and /mojo/characters/[charId].

  FIX-005: registerWishlistImage, removeWishlistImage — P-DC pattern
    for wishlist reference images. Storage prefix: 'wishlist/'.
    deleteMojoWishlistItem extended with cleanup logic.
    createMojoWishlistItem + updateMojoWishlistItem accept image_token.

  FIX-011: createMojoThread + updateMojoThread extended with
    reply_order (text | null).
  FIX-013: createMojoThread + updateMojoThread extended with
    thread_type ('rp'|'class') and assignment_due_at (timestamptz|null).

  FIX-017a (Familiar): listFamiliarConversations,
    createFamiliarConversation, deleteFamiliarConversation,
    renameFamiliarConversation

To be built:
  (none)

---

## 18. DB Helpers Reference (lib/db/mojo.ts)

Built:
  getMojoRpsWithCharacters, getMojoRp, getMojoRpWithCharactersAndThreads,
  getMojoCharacter, getMojoCharacterThreads, getMojoThread,
  getMojoFaceclaims, getMojoFaceclaim, getMojoFaceclaimResources,
  getMojoFaceclaimWithCharacters, getMojoCharacterResources,
  getMojoGlobalResources, getMojoSnippets, getMojoWishlist,
  getMojoPartners, getMojoPartner, getMojoDashboardStats,
  getMojoImageStacks, getMojoImageStack, getMojoStackMembers,
  getMojoAvatars, getMojoAvatar,
  getMojoDashboardData (+ exports: DashboardRp, DashboardCharacter types),
  getMojoImageFolders, getMojoPersonalImages,
  getMojoWanted (MOJO-7A — returns open items first, then filled,
    with character_name and proxy_url merged per row)

  FIX-002: getMojoFaceclaims() extended — third query fetches most
    recent avatar token per faceclaim via characters → avatars join.
    Returns avatar_token: string | null merged per faceclaim.

  FIX-007: getMojoRpCharacters(rpId) — characters for a specific RP
    with avatar_token (most recent avatar per character). Used on RP
    detail page for the character portrait spread.

  FIX-012a: getMojoAllThreads() — cross-character master helper.
    Three-query pattern: threads → characters → RPs + avatar tokens.
    Returns each thread with: character_name, character_status,
    rp_name, rp_color_hex, character_avatar_token merged.
    Used by The Chronicle page and the agent context snapshot.

  FIX-017a (Familiar DB helpers): getMojoFamiliarConversations(),
    getMojoFamiliarMessages(conversationId, limit=20),
    createMojoFamiliarConversation(title?),
    saveMojoFamiliarMessage({ conversationId, role, content,
      toolCalls?, actionsTaken? }),
    updateMojoFamiliarConversationTitle(conversationId, title),
    deleteMojoFamiliarConversation(conversationId)

To be built:
  (none)

---

## 19. Quality Gates (Every Build)

  tsc --noEmit   (0 errors required)
  npx eslint .   (0 errors required; warnings acceptable)

Standard grep verifications:
  grep -rn "isSuperAdmin()" --include="*.ts" --include="*.tsx" .
  # Expected: 0 (all calls are isSuperAdmin(user.id))

  grep -rn "moonstone-dim\|f-heading" --include="*.tsx" --include="*.ts" app/mojo/
  # Expected: 0

  grep -rn "useTransition" --include="*.tsx" app/mojo/
  # Expected: 0

  grep -rn "window.location.href" --include="*.tsx" app/mojo/components/
  # Every result must be inside a module-level function

  grep -rn "createClient\b" --include="*.tsx" --include="*.ts" app/mojo/
  # Expected: 0 — use createBrowserClient, not createClient

Additional grep for visual pass prompts (7B through 7K):
  grep -rn "pointerEvents.*none\|pointer-events.*none" \
    app/mojo/page.tsx app/mojo/components/
  # All purely decorative elements must have pointer-events: none
  # Can be set on the SVG component itself rather than every call site

Additional check for Route Handlers:
  grep -rn "requireSuperAdmin\|redirect" \
    --include="*.ts" app/api/mojo/
  # Expected: 0 — Route Handlers must use isSuperAdmin + 401 JSON,
  # never requireSuperAdmin() (redirects) or redirect()

Additional checks for Next.js 16 patterns:
  # searchParams must be awaited in Server Components
  grep -rn "searchParams\." --include="*.tsx" app/mojo/
  # Any direct .key access without await is a type error in Next.js 16

  # No Math.random() in components (hydration mismatch risk)
  grep -rn "Math\.random" --include="*.tsx" app/mojo/
  # Expected: 0 (use predetermined arrays instead)

Every prompt ends with:
  git add -A
  git commit -m "MOJO-X: descriptive message"
  git push origin main

Build report required with: commit hash, files list, grep results, Q-items.

---

## 20. Build Status

| Prompt  | Status      | Commit  | Key deliverables |
|---------|-------------|---------|-----------------|
| MOJO-1  | ✅ Complete | e618fd9 | Foundation, migration mojo_001, layout, auth gate, dashboard, RP detail |
| MOJO-2  | ✅ Complete | afeeefa | Character sheet, notes, thread tracker CRUD |
| MOJO-3A | ✅ Complete | 56da652 | Migration mojo_002, image proxy, faceclaims, resource system |
| MOJO-3B | ✅ Complete | cd05734 | Silver & Onyx theme, library, wishlist, partners, sidebar, dashboard stats |
| MOJO-4A | ✅ Complete | 2e08a0f | Migration mojo_003, process-image route, proxy stack extension, stacks page |
| MOJO-4B | ✅ Complete | 9406cff | Migration mojo_004, avatar upload, crop tool, card grid, drag-to-stack |
| MOJO-6A | ✅ Complete | d591ebc | Rich text editor, field retrofit (8 components), crop UX fix (TD-5) |
| MOJO-5  | ✅ Complete | 4d329ce | Migration mojo_005a, auto reply tracker, Tumblr API, JCINK scraper, whose_turn |
| MOJO-6B | ✅ Complete | c178766 | Dashboard RP command center, character cards, whose-turn, lib/mojo/utils.ts |
| MOJO-6C | ✅ Complete | 3ca7020 | Seed data, migration mojo_005, personal image repository, sidebar Images nav |
| MOJO-7A | ✅ Complete | 3976a2e | Global search, wanted board (mojo_006), TD-2/TD-6/TD-7 resolved |
| MOJO-7B | ✅ Complete | 7d999a2 | Global chrome — sidebar, top bar, background, animation library, SVG assets |
| MOJO-7C | ✅ Complete | 1efaabe | The Sanctum — moon, moon phases, candles, corner brackets, wax seal badges |
| MOJO-7D | ✅ Complete | 2c06adf | The Dossier — character banner, medallion, manuscript tabs, journal frames |
| MOJO-7E | ✅ Complete | 9c39260 | The Portrait Gallery — corridor, portrait frames, brass plates, contact sheet |
| MOJO-7F | ✅ Complete | 2c100f1 | The Library — bookshelf, scroll cards, telegram code blocks, drawer tabs |
| MOJO-7G | ✅ Complete | f2b860e | Desires — starfield, botanicals, candle status system, watercolor cards |
| MOJO-7H | ✅ Complete | 0f49c5f | The Black Book — leather header, silk ribbon, Rolodex cards, lined notes |
| MOJO-7I | ✅ Complete | 7adfb91 | The Reliquary — cabinet, specimen labels, rotation icons, vitrine previews |
| MOJO-7J | ✅ Complete | dd8bdb4 | The Darkroom — safelight atmosphere, photograph cards, developing tray |
| MOJO-7K | ✅ Complete | ae72b23 | The Oracle — scrying bowl, starfield, result visions, altar search form |
| MOJO-7L | ✅ Complete | e37d457 | TD-1 resolved, stacks URL filter, dead code removal, coherence pass |
| MOJO-7M | ✅ Complete | —       | Comprehensive audit — 54 checks, 48 pass, 6 flags, 0 fails (read-only) |
| MOJO-7N | ✅ Complete | 6146621 | Audit fixes — crop color, swatch palette, darkroom header, dead code |
| MOJO-7O | ✅ Complete | ef2a26c | Mobile optimization — drawer nav, responsive layout, touch targets |
| MOJO-BRIEF v1.3 | ✅ Complete | 9672fa2 | Brief updated through MOJO-7D |
| MOJO-BRIEF v1.4 | ✅ Complete | a694004 | Brief updated through MOJO-7O — BUILD COMPLETE |
| MOJO-FIX-001    | ✅ Complete | 9bf30fb | Proxy URL .png extension — third-party site compatibility |
| MOJO-FIX-002    | ✅ Complete | faa8c60 | Faceclaim gallery pulls avatar from assigned characters |
| MOJO-FIX-003    | ✅ Complete | 76c302d | Inline faceclaim creation on character page |
| MOJO-FIX-004    | ✅ Complete | 437c1b9 | MojoPortraitCard tarot system — site-wide avatar display |
| MOJO-FIX-005    | ✅ Complete | 5cb265d | Wishlist image upload — mojo_007 migration |
| MOJO-FIX-006    | ✅ Complete | ad5681d | SvgLargeCrescent replaces SvgMoon on dashboard |
| MOJO-FIX-007    | ✅ Complete | 8958e12 | RP detail page single-page layout |
| MOJO-FIX-007b/008b | ✅ Complete | 9444681 | RP notes as separate cards; character portrait zone two-column |
| MOJO-FIX-008    | ✅ Complete | fe9fdba | Character page single-page dossier layout |
| MOJO-FIX-009    | ✅ Complete | 28f79d2 | JCINK auth wall detection + session cookie + skin selector |
| MOJO-FIX-010    | ✅ Complete | 1c39d01 | Auto thread refresh on page load, badge redesign, ··· override collapse, Zone 2 thread list |
| MOJO-FIX-011    | ✅ Complete | 7c1e51c | reply_order for ordered threads, WAITING ON badge, mojo_008 migration |
| MOJO-FIX-012a   | ✅ Complete | aa564a3 | Chronicle infrastructure — SVGs, nav, DB helper, Archive→Close, badge unification |
| MOJO-FIX-012b   | ✅ Complete | fbfd872 | The Chronicle page + MojoChronicleAddForm |
| MOJO-FIX-013    | ✅ Complete | 936a76d | Class threads, awaiting starter, auto-archive, unified display state, mojo_009 |
| MOJO-FIX-014    | ✅ Complete | c648ad9 | Failed scrape retry immediately on page load |
| MOJO-FIX-015    | ✅ Complete | aa640a7 | Preserve last_poster on failed scrape |
| MOJO-FIX-016    | ✅ Complete | 48ac136 | Thread sort order, Chronicle avatars, portrait lg, ornate SvgPortraitFrame |
| MOJO-FIX-017a   | ✅ Complete | aedf4a2 | The Familiar — agent route, conversation memory, chat UI, SVGs |
| MOJO-FIX-017b   | ✅ Complete | 6262d27 | The Familiar — full visual treatment, memory sidebar, auto-titling |
| MOJO-FIX-017c   | ✅ Complete | 59439f5 | The Familiar — voice rewrite (he/him), markdown rendering, max_tokens 8000 |
| MOJO-BRIEF v1.5 | ✅ Complete | 6e322ce | Brief updated through FIX-017c |
| MOJO-FIX-018    | ✅ Complete | f63550f | Upcoming thread type, On Deck display, auto-transition to rp on URL add |
| MOJO-FIX-019    | ✅ Complete | a2e9d6a | Dashboard overhaul: char cards md, ornate RP panels, realistic candles, moon phase SVG redesign |
| MOJO-FIX-020    | ✅ Complete | 538a999 | Moon phases card, rotating display order, centered alignment, Chronicle stat link |
| MOJO-FIX-021    | ✅ Complete | 157f15f | The Atelier design preview system, SvgLibraryBookshelf, SvgLibraryStudy, SvgNavDesign |
| MOJO-FIX-022    | ✅ Complete | d7a4f77 | Library page: illustrated bookshelf + candelabra + ivy columns |
| MOJO-FIX-023    | ✅ Complete | e179b77 | SvgHallOfMirrors — gothic perspective corridor, Atelier preview |
| MOJO-FIX-024    | ✅ Complete | 97454d0 | SvgDiviningChamber — divination table, Atelier preview |
| MOJO-FIX-025    | ✅ Complete | f89d4b0 | SvgGrimoire — open spell book, Atelier preview |
| MOJO-FIX-026    | ✅ Complete | c797ccc | Flame animation fix: SvgCandelabra + SvgLibraryStudy inline animationName |
| MOJO-FIX-027    | ✅ Complete | 7ab2feb | SvgWitchesAttic — atmospheric witch's attic, Atelier preview |
| MOJO-FIX-028    | ✅ Complete | 1f8a81c | Moon phases card padding reduction, non-active label opacity to 1.0 |
| MOJO-FIX-029    | ⏳ Pending  | —       | SvgPortraitHall — Hall of Legends, Atelier preview for Faceclaims page |
| MOJO-BRIEF v1.6 | ✅ Complete | [hash]  | Brief updated through FIX-028 |

---

## 21. Supabase Project Reference

Project ID: vkhuttcusqubteseifui
URL: https://vkhuttcusqubteseifui.supabase.co
Storage bucket: mojo-private (PRIVATE)

Types regeneration:
  npx supabase gen types typescript \
    --project-id vkhuttcusqubteseifui > types/database.ts 2>/dev/null
(2>/dev/null required — npm warnings corrupt the output file)

---

## 22. Environment Variables (Mojo-Specific)

In addition to the six existing TWH env vars:

  TUMBLR_API_KEY — Tumblr OAuth consumer key for thread auto-fetch
  Status: Set in .env.local and Vercel. Redeployment confirmed.

  NEXT_PUBLIC_SITE_URL — Used throughout mojo for proxy URL construction:
    getProxyUrl(token) → NEXT_PUBLIC_SITE_URL + '/i/' + token
  Confirmed used in: lib/mojo/proxy.ts, lib/db/mojo.ts (getMojoWanted),
  app/mojo/search/page.tsx (image thumbnails), MojoPersonalImageCard.tsx.
  Must be set in .env.local and Vercel. Value: https://atwitchinghour.com

  JCINK_MEMBER_ID — JCINK numeric member ID for authenticated scraping.
  Value: 37 (operator's account ID on marvellegacyu.jcink.net).
  Set in .env.local and Vercel. Used in Cookie header by thread-fetchers.ts.

  JCINK_PASS_HASH — JCINK bcrypt password hash for session cookie auth.
  Format: decoded bcrypt starting with $2y$11$ (NOT URL-encoded).
  URL-encoded form (%24 = $, %2F = /) will NOT work — must be decoded.
  Set in .env.local and Vercel. Used alongside JCINK_MEMBER_ID.
  Cookie sent: member_id=JCINK_MEMBER_ID; pass_hash=JCINK_PASS_HASH

  ANTHROPIC_API_KEY — Anthropic API key for The Familiar AI companion.
  Server-side only. Never exposed to client or committed to git.
  Set in .env.local and Vercel environment variables.
  Required for: /api/mojo/familiar/route.ts (main agent, max_tokens 8000),
    /api/mojo/familiar/autotitle/route.ts (max_tokens 30),
    generate tool secondary calls inside familiar route (max_tokens 1000).

---

Version history:
  v1.0 — initial, through MOJO-4A
  v1.1 — through MOJO-4B: added rich text system, crop UX decision,
    personal image repository, dashboard redesign plan, Tumblr API
    setup and key configuration, createBrowserClient correction,
    updated TD list through TD-7, wanted board schema, full build
    status table, environment variables section
  v1.2 — through MOJO-6C: added MOJO-5/6A/6B/6C completions, mojo_005a
    and mojo_005 migrations, manual_whose_turn column, §8b utils.ts
    documentation, Tiptap v3 API corrections, useSearchParams Suspense
    rule, navigation-alongside-state pattern, DashboardRp/DashboardCharacter
    types, updated file structure with all new components, personal image
    system complete, drag-to-stack key extended to personal images,
    TD-5 resolved, TD-8/TD-9 added, server actions updated to 47,
    build status table updated through MOJO-6C, seed data documented
  v1.3 — through MOJO-7D: added Phase 7 complete structure (7A-7L),
    visual redesign system (§23), SVG asset library documentation,
    animation library documentation, page theme table, Silver & Onyx
    actual hex values confirmed, visual pass law and patterns, mojo_006
    applied (mojo_wanted created), wanted board complete (§15), global
    search complete, TD-2/TD-6/TD-7 resolved, TD-10/TD-11 added,
    server actions updated to 52, getMojoWanted added, build status
    expanded through MOJO-7L, file structure updated with new components
  v1.6 — through FIX-028: upcoming thread type ("On Deck") with
    auto-transition, indigo badge, Zone 2 exclusion, Chronicle On Deck
    divider; dashboard overhaul (character cards md, ornate RP panels with
    per-color borders/tints, Cormorant Upright 32px names, SvgCandleRealistic
    replacing SvgCandle, 8 illustrated moon phase SVGs, rotating centered
    display, night-sky card, padding/opacity fixes); Active Threads stat
    links to Chronicle; Library page redesign (SvgLibraryBookshelf +
    SvgCandelabra + SvgIvyColumn); The Atelier design preview system
    (6 candidate SVGs: Hall of Mirrors, Divining Chamber, Grimoire,
    Witch's Attic, Portrait Hall pending); flame animation bug fixed
    (SvgCandelabra + SvgLibraryStudy — inline animationName pattern);
    SVG library 57→74; TD-16/17/18 added; navigation updated to 11 items;
    Faceclaims rename to Hall of Legends approved (pending production);
    Chronicle rename to Grimoire approved (pending production); sidebar
    Chronicle label confirmed still "Chronicle" — rename to "Tracker"
    discussed but NOT applied (see TD-18).

v1.5 — through FIX-017c: thread system overhaul (reply order, class
    threads, awaiting starter, auto-archive, auto-refresh, WAITING ON
    badge, badge unification, ··· override collapse), The Chronicle
    master tracker page, The Familiar AI companion (agent route,
    conversation memory, markdown rendering, voice rewrite), RP detail
    and character page single-page layouts, MojoPortraitCard tarot
    system site-wide, JCINK authenticated scraping, SvgLargeCrescent,
    SvgPortraitFrame redesign, 12 new SVGs (57 total), new navigation
    items, mojo_007–mojo_010 migrations, 7 new server actions (59 total),
    new DB helpers (getMojoAllThreads, getMojoRpCharacters, 6 Familiar
    helpers), route Handler auth pattern documented, new env vars
    (JCINK_MEMBER_ID, JCINK_PASS_HASH, ANTHROPIC_API_KEY), TD-14/TD-15
    added, build status table extended through FIX-017c.

  v1.4.1 — patch — MOJO-FIX-001: proxy URL .png extension convention
    documented in §7, next.config.ts filename corrected in §4,
    build status table updated, 10 files confirmed updated.

  v1.4 — FINAL — through MOJO-7O: completed visual redesign system
    (7E-7K all passing), mobile optimization (7O — MojoMobileNav,
    responsive CSS, viewport meta), comprehensive audit (7M — 54 checks,
    0 fails), audit fixes (7N — canvas hex, swatches, darkroom header,
    dead code), TD-1 resolved (all 5 module-level nav functions), TD-1
    confirmed via audit, TD-12/TD-13 added (inert CSS, low priority),
    SVG library catalogued at 45 exports, animation library corrected to
    10 keyframes, full CSS class inventory added, page-specific key notes
    for all 9 visual passes, mobile system documented, audit summary
    added, NEXT_PUBLIC_SITE_URL documented, searchParams async pattern
    added, hydration-safe randomness rule added, types command updated
    with 2>/dev/null, build status table complete through MOJO-7O.
    BUILD OFFICIALLY COMPLETE.

---

## 23. Visual Redesign System (MOJO-7B onward)

### Overview
Each page in Mojo receives a dedicated visual pass (7B through 7K)
that transforms it into a uniquely atmospheric space while maintaining
complete functional integrity. The Silver & Onyx palette is the base;
each page embellishes it with its own signature atmosphere.

### Global Chrome (MOJO-7B — applied to every page)
File: app/mojo/layout.tsx + app/mojo/components/MojoSidebar.tsx

Background: three-layer radial gradient (violet bloom top-right,
  deep cool black centre, subtle glow bottom-left) + .mojo-bg-tile
  class (tiled alchemical symbols ☽ ✦ △ at 3-6% opacity, 60px repeat)

Top bar: "MOJO" wordmark in Cinzel with SvgCrescent (size=16),
  SvgPortalIcon before "← Back to TWH", backdrop-filter blur

Sidebar: vertical repeating-linear-gradient texture (aged wood/velvet
  impression), SvgSidebarOrnamentTop (crescent+star), unique SVG glyphs
  per nav item (replacing ✦ for all), active state: gold left border +
  subtle gold glow (.mojo-nav-active), RP ember dots (6px circle in
  rp.color_hex with mojo-ember-pulse animation), SvgSidebarOrnamentBottom
  (alchemical symbol), "THE CIRCLE" label in Cinzel

### Animation Library (globals.css — defined once, used by all pages)
CRITICAL: @keyframes alone do NOT animate elements. No CSS class rule
(.mojo-flame-main { animation: ... }) exists. Must use inline style
animationName props. See §4 Flame Animation Pattern for full details.

10 @keyframes (mojo-rune-fade removed MOJO-7N; two new added in 7J/7K):
  mojo-moon-breathe  — gentle glow pulse, 5s (moon, active phase)
  mojo-flame-main    — candle outer flame flicker, 1.8s
  mojo-flame-inner   — candle inner flame, 1.2s (offset from main)
  mojo-flame-smoke   — wisp above flame, 2.5s (also: SvgCandleSnuffed)
  mojo-ember-pulse   — RP sidebar dot glow, 2.5s
  mojo-float         — slow vertical rise/fall, 4-5s (medallion, crescent)
  mojo-shimmer       — silver shimmer on borders (silk ribbon)
  mojo-portal-glow   — "back to TWH" link glow, 3s
  mojo-oracle-surface — result row fade-up, 0.35s (search results)
  mojo-tray-ripple   — developing tray ripple, 3.5s (images upload area)

CSS utility classes (globals.css — complete list):
Global chrome (MOJO-7B):
  .mojo-rp-ember, .mojo-nav-active, .mojo-nav-item, .mojo-filigree-rule,
  .mojo-bg-tile, .mojo-portal-glow
Portrait Gallery (MOJO-7E):
  .mojo-portrait-card, .mojo-brass-plate, .mojo-film-strip-edge
Library (MOJO-7F):
  .mojo-snippet-scroll, .mojo-snippet-telegram, .mojo-code-badge
Desires/Wishlist (MOJO-7G):
  .mojo-desire-card, .mojo-desire-idea, .mojo-desire-active,
  .mojo-desire-shelved
Black Book/Partners (MOJO-7H):
  .mojo-partner-card, .mojo-notes-lined, .mojo-silk-ribbon
Reliquary/Stacks (MOJO-7I):
  .mojo-specimen-card, .mojo-vitrine-preview (+ ::after glass reflection)
Darkroom/Images (MOJO-7J):
  .mojo-photograph, .mojo-cabinet-panel, .mojo-folder-tab,
  .mojo-folder-tab-active, .mojo-tag-chip, .mojo-tag-chip-active,
  .mojo-developing-tray, .mojo-tray-ring
Oracle/Search (MOJO-7K):
  .mojo-oracle-result, .mojo-oracle-input, .mojo-oracle-submit,
  .mojo-oracle-group-heading, .mojo-oracle-group-line
Mobile (MOJO-7O):
  .mojo-hamburger, .mojo-drawer-close, .mojo-sidebar-drawer,
  .mojo-sidebar-open, .mojo-content-area, .mojo-stats-strip,
  .mojo-moon-wrapper, .mojo-tab-bar, .mojo-images-layout,
  .mojo-folder-panel, .mojo-gallery-grid, .mojo-botanical-corner,
  .mojo-bowl-wrapper, .mojo-rich-text-toolbar, .mojo-sidebar-width*,
  .mojo-folder-tab* (* = defined but not yet wired — see TD-12, TD-13)
Portrait card system (FIX-004):
  .mojo-portrait-frame, .mojo-portrait-card-wrap, .mojo-portrait-placeholder,
  .mojo-portrait-sm, .mojo-portrait-md, .mojo-portrait-lg
Thread badge system (FIX-010/013/018):
  .mojo-turn-badge, .mojo-turn-mine, .mojo-turn-theirs,
  .mojo-turn-waiting, .mojo-turn-pending, .mojo-turn-unknown,
  .mojo-turn-upcoming (indigo/blue gradient, "On Deck" label — FIX-018)
Thread override (FIX-010):
  .mojo-override-trigger, .mojo-override-row, .mojo-override-btn,
  .mojo-override-btn-active
Thread mini-cards / Zone 2 (FIX-010):
  .mojo-thread-mini-card, .mojo-thread-mini-title, .mojo-thread-mini-partner,
  .mojo-thread-mini-meta
Character page layout (FIX-008b):
  .mojo-char-portrait-zone, .mojo-char-portrait-meta,
  .mojo-char-zone2-three-col, .mojo-char-columns
Avatar strip (FIX-008):
  .mojo-avatar-strip-card, .mojo-avatar-set-primary
RP note panels (FIX-007b):
  .mojo-rp-note-panel, .mojo-rp-note-header, .mojo-rp-note-label,
  .mojo-rp-note-body, .mojo-rp-columns, .mojo-rp-side-panel,
  .mojo-rp-banner, .mojo-rp-banner-bar, .mojo-character-spread,
  .mojo-thread-card, .mojo-candle-heading
The Chronicle (FIX-012b):
  .mojo-chronicle-page, .mojo-chronicle-header, .mojo-thread-group,
  .mojo-thread-group-header, .mojo-thread-group-name,
  .mojo-thread-group-rp, .mojo-thread-group-body,
  .mojo-chronicle-add-form, .mojo-chronicle-add-toggle,
  .mojo-chronicle-archive, .mojo-chronicle-archive-heading,
  .mojo-thread-archived-card, .mojo-thread-archived-title,
  .mojo-thread-archived-meta, .mojo-chronicle-section-heading,
  .mojo-chronicle-section-rule
The Familiar (FIX-017a/b):
  .mojo-familiar-layout, .mojo-familiar-sidebar,
  .mojo-familiar-sidebar-heading, .mojo-familiar-new-btn,
  .mojo-familiar-conv-item, .mojo-familiar-conv-title,
  .mojo-familiar-conv-date, .mojo-familiar-conv-delete,
  .mojo-familiar-conv-rename, .mojo-familiar-main,
  .mojo-familiar-conversation-wrap, .mojo-familiar-messages,
  .mojo-familiar-msg-user, .mojo-familiar-msg-assistant,
  .mojo-familiar-msg-eye, .mojo-familiar-loading,
  .mojo-familiar-loading-eye, .mojo-familiar-pending,
  .mojo-familiar-pending-label, .mojo-familiar-pending-desc,
  .mojo-familiar-confirm-btn, .mojo-familiar-cancel-btn,
  .mojo-familiar-empty, .mojo-familiar-empty-star,
  .mojo-familiar-empty-greeting, .mojo-familiar-empty-hint,
  .mojo-familiar-candle-corner, .mojo-familiar-input-area,
  .mojo-familiar-textarea, .mojo-familiar-send-btn,
  .mojo-familiar-input-hint

### SVG Asset Library (app/mojo/components/MojoSvgAssets.tsx)
All reusable SVG decorative components. 74 exports as of FIX-027.
FIX-029 will add SvgPortraitHall → 75.
All are inline JSX — no external SVG files. Append-only: never
modify existing exports.

Global chrome (MOJO-7B — 13 exports):
  SvgCrescent(size, idSuffix) — crescent moon with star
  SvgSidebarOrnamentTop() — large crescent with cardinal ticks
  SvgSidebarOrnamentBottom() — small alchemical triangle
  SvgNavDashboard/Images/Faceclaims/Library/Wishlist/Partners/Stacks/Search
    (active: boolean) — 8 unique nav glyphs matching each page's theme
  SvgPortalIcon() — arch/portal for "back to TWH"
  SvgFiligreeRule(width) — decorative hr with diamond pip

Dashboard — The Sanctum (MOJO-7C — +4):
  SvgMoon(size, idSuffix) — layered luminous moon with glow filter
  SvgCandle(height, idSuffix, flameDelay) — animated candle, 3 flame
    layers at different durations (never perfectly in sync)
  SvgCornerBracket(size, color, rotation, style) — L-shaped panel accent
  SvgPageHeaderRule() — elaborate decorative hr with crescent centre

Characters — The Dossier (MOJO-7D — +2):
  SvgIvyTrail(width, height, flip) — manuscript margin ivy/vine
  SvgMedallion(size, idSuffix) — tick-ring avatar frame overlay
    (pure SVG overlay — parent renders avatar clip div behind it)

Faceclaims — The Portrait Gallery (MOJO-7E — +4):
  SvgPortraitFrame(width, height, color, idSuffix) — ornate rect frame
    with corner rosettes and mid-point diamond pips
  SvgFlourishUnderline(width) — calligraphic pen-stroke underline
  SvgCandleFlame(size, delay, className) — flame only, no wax/holder
  SvgGalleryCorridor(width, height) — architectural perspective lines

Library — The Library (MOJO-7F — +3):
  SvgBookshelf() — two-shelf illustration, 100 books, data-driven rects
  SvgScrollEnd(flip) — parchment curl end-cap for snippet cards
  SvgTelegraphDots() — 3×4 dot grid for code snippet cards

Desires — Wishlist (MOJO-7G — +5):
  SvgStarfield(width, height) — 100+ predetermined star positions
  SvgBotanicalSpray(width, height, flip) — Victorian botanical corner
  SvgDreamHeader() — crescent with scattered stars, inline ornament
  SvgCandleUnlit(size) — candle body + wick, no flame (idea status)
  SvgCandleSnuffed(size) — candle with smoke curl (shelved status)

Partners — The Black Book (MOJO-7H — +4):
  SvgLeatherTexture() — procedural leather grain via Math.sin waves
  SvgBookSeal(size, idSuffix) — circular embossed colophon with nib
  SvgSilkRibbon(width, height) — vertical bookmark ribbon, V-cut end
  SvgPageCornerFold(size) — dog-eared corner triangle

Stacks — The Reliquary (MOJO-7I — +5):
  SvgCabinetOfCuriosities() — triptych arched display cabinet, 160px
  SvgRotationRandom(size, active) — dice icon for truly_random mode
  SvgRotationWeighted(size, active) — uneven scales for weighted mode
  SvgRotationSequential(size, active) — spiral for sequential mode
  SvgRotationNoRepeat(size, active) — crossing arrows for no_repeat

Images — The Darkroom (MOJO-7J — +4):
  SvgDarkroomHeader() — enlarger + trays + hanging photos silhouette
  SvgFolderTab(size, active) — manila folder shape for panel items
  SvgDevelopingTray() — shallow tray viewed from above, with handles
  SvgHangingPhotographs() — clothesline with 8 photograph silhouettes

Search — The Oracle (MOJO-7K — +1):
  SvgScryingBowl(size, idSuffix) — concentric rings, dark water fill,
    moon reflection dot, glow filter on outermost halo

Dashboard fix (FIX-006 — +1):
  SvgLargeCrescent(size, idSuffix, className) — glowing crescent moon
    with atmospheric halos, star catch-lights, amber glow; replaces
    SvgMoon on dashboard. --char hex (#0c0c14) cut-circle technique.

RP page (FIX-007 — +3 realistic colors):
  SvgCandleRealistic(height, idSuffix, flameDelay) — fully illustrated
    candle with ivory/cream wax, amber/gold/white flame layers, drips,
    pewter holder; replaces SvgCandle for themed page headings
  SvgParchmentEdge(width) — torn deckled paper edge, parchment tones,
    age spot; decorative top of thread cards
  SvgWaxSeal(size, idSuffix) — crimson wax seal with 5-point star
    impression, realistic radial gradient, wax flow marks

Character page (FIX-008 — +3 realistic colors):
  SvgIvyBorder(width, height, flip) — lush illustrated ivy with forest
    green leaves, vein detail, cream wildflowers with gold centers,
    tendrils and berries; replaces SvgIvyTrail on character page header
  SvgDossierQuill(className) — realistic feather quill with barb detail,
    dark nib, ink bead; decorative header accent
  SvgOpenBook(width, height) — illustrated open book, warm parchment
    pages, leather spine, ribbon bookmark; Resources column heading

The Chronicle (FIX-012a — +3):
  SvgNavChronicle(active) — 14px sidebar glyph: open book with
    crossing quill; currentColor
  SvgOpenLedger(className) — grand open ledger 100% width × 180px;
    two parchment pages with ruled lines and entry blocks, leather
    spine with gilt, ribbon bookmark; page header illustration
  SvgChronicleQuill(className) — horizontal decorative quill, 80×24px;
    realistic ivory barbs, dark nib, ink drop; section end ornament

The Familiar (FIX-017a — +2):
  SvgNavFamiliar(active) — 14px sidebar glyph: stylized cat's eye with
    vertical slit pupil and catch-light; currentColor
  SvgFamiliarPresence(className) — cat's eye 180×90px; layered amber
    iris gradient, vertical slit pupil with tapered ends, two catch-
    light reflections, limbal ring, ambient glow filter; page header

Dashboard moon phases (FIX-019 — +8 illustrated phase SVGs):
  All share props: { size?: number; active?: boolean; className?: string; idSuffix?: string }
  Design language: layered gradients, deep blue-purple shadow (#0a0818),
  warm silver-white illuminated portions, catch-lights, active glow ring.
  SvgPhaseNewMoon — dark disc, faint silver limb ring, two star points
  SvgPhaseWaxingCrescent — thin right crescent with glow filter
  SvgPhaseFirstQuarter — right half lit, linear gradient, soft terminator
  SvgPhaseWaxingGibbous — mostly lit, dark crescent on left
  SvgPhaseFullMoon — fully lit showpiece: 3 halo rings, glow filter,
    limb darkening, 3 catch-lights, amplified active glow (2 rings)
  SvgPhaseWaningGibbous — mostly lit, dark crescent on right
  SvgPhaseLastQuarter — left half lit, mirror of FirstQuarter
  SvgPhaseWaningCrescent — thin left crescent, mirror of WaxingCrescent

Library page redesign (FIX-021/022 — +3):
  SvgLibraryBookshelf(className, idSuffix) — illustrated old tomes on
    aged wood shelves. 60 books across two shelves (leather spines, gilt
    lettering), cobwebs in upper corners. No ivy, no candle (removed
    FIX-022). Replaces SvgBookshelf on library/page.tsx.
    SvgBookshelf (original) stays in assets — append-only rule.
  SvgCandelabra(height, idSuffix, flameDelay) — gothic wrought-iron
    three-arm candelabra. Dark iron, S-curve arms, crescent moon in
    base. Three candles (center tallest), three animated flames with
    staggered delays (+0.4s, +0.7s). Wax drips. Flanks SvgLibraryBookshelf
    on Library page (idSuffix "lib-left"/"lib-right", scaleX(-1) mirror).
    Uses inline animationName props — not className (see §4 flame pattern).
  SvgIvyColumn(height, flip, idSuffix, className) — narrow vertical ivy
    vine for page side columns. 20 branching leaves, 5 wildflowers, 4
    tendrils. flip=true mirrors via scaleX(-1). idSuffix prop unused
    (no gradients) — TD-10 category forward-compatible prop.
    Used on Library page absolutely positioned left/right of content.

The Atelier design candidates (FIX-021/023/024/025/027 — +6 pending):
All are Atelier-only previews. Production pages untouched until approved.
  SvgNavDesign(active) — 14px compass-rose glyph for The Atelier sidebar.
    currentColor, 4 cardinal points with north emphasized.
  SvgLibraryStudy(className, idSuffix) — stone fireplace in scholar's
    study. Animated fire (3 flame layers + tongues), books on floor/mantle,
    ivy on left pillar, two mantle candles, fire/room glow.
    Library option B — not chosen (SvgLibraryBookshelf was chosen).
  SvgHallOfMirrors(className, idSuffix) — gothic perspective corridor.
    One-point perspective (VP at 450,95). Six gilt-framed mirrors (3 per
    side, depths t=0.15/0.45/0.68), each with pointed gothic arch frame,
    glass with ghost shape (figure/swirl/crescent/bands), specular highlight.
    Stone arch entrance, diamond tile floor, single VP candle (animated),
    candlelight wash, floor mist, vignette. Proposed: Stacks page.
  SvgDiviningChamber(className, idSuffix) — candlelit divination table
    viewed from above. 7 tarot cards (5 face-down, Moon+Eye face-up),
    8 rune stones with angular symbols, crystal pendulum with dashed chain
    and prismatic scatter, open grimoire corner, 2 candles with animated
    flames, velvet cloth with gold embroidery, vignette.
    Proposed: Search page. (Uses inline animationName — see §4.)
  SvgGrimoire(className, idSuffix) — open ancient spell book. Left page:
    astrological wheel (8 divisions, symbols, hub), 3 text-line sections,
    margin annotations, botanical illustration ("Verbena off."), ink blot,
    broken wax seal. Right page: moon phase circle (8 phases, 12 zodiac
    stars, glowing hub), 4 corner flourishes, "XLVII" page number. Hero
    element: quill (287px shaft, pre-computed vane paths, barbs, calamus,
    nib, ink pool/trail/drops). Static illustration — no animations.
    Proposed: Chronicle/Grimoire page.
  SvgWitchesAttic(className, idSuffix) — witch's attic interior. Peaked
    roof beams (rear/middle/front horizontal + ridge + rafters), circular
    moonlit window with 8 bolts, moonlight cone with 9 dust motes, 10
    hanging herb bundles (lavender/rosemary/tansy/mugwort), empty birdcage
    with spectral glow, 5-bottle shelf, large closed trunk, small open
    trunk with fabric, spinning wheel (partially cropped right), stacked
    books + 2 scrolls, brass lantern with warm glow, 2 corner cobwebs +
    1 beam cobweb. Static — no animations. Proposed: Images page.

Pending (FIX-029):
  SvgPortraitHall(className, idSuffix) — seven oil portraits on dark
    wood paneling. Five frame styles (Victorian oval, Gothic arch,
    Neoclassical laurel, Baroque cartouche, Rope-twist). Painted faces
    as layered ellipses (renderFace() inner function). Seven canvas
    clipPaths. Individual sconce glows + fixtures. Brass nameplates.
    Gilt frieze. Vignette. Proposed: Faceclaims / Hall of Legends page.

MojoMoonPhases.tsx (MOJO-7C) — Client Component:
  getLunarPhaseIndex() → 0-7 based on real synodic month calculation
  8 SVG phase icons, current phase highlighted with mojo-moon-breathe

### Page Visual Themes
Each page receives a focused visual pass in its own prompt.

| Prompt  | Page       | Theme               | Status       |
|---------|------------|---------------------|--------------|
| MOJO-7C | Dashboard  | The Sanctum         | ✅ 1efaabe   |
| MOJO-7D | Characters | The Dossier         | ✅ 2c06adf   |
| MOJO-7E | Faceclaims | The Hall of Legends (renamed from The Portrait Gallery — FIX-029 pending) | ✅ 9c39260 |
| MOJO-7F | Library    | The Library (header replaced: SvgLibraryBookshelf + SvgCandelabra + SvgIvyColumn — FIX-022) | ✅ 2c100f1 |
| MOJO-7G | Wishlist   | Desires             | ✅ f2b860e   |
| MOJO-7H | Partners   | The Black Book      | ✅ 0f49c5f   |
| MOJO-7I | Stacks     | The Reliquary       | ✅ 7adfb91   |
| MOJO-7J | Images     | The Darkroom        | ✅ dd8bdb4   |
| MOJO-7K | Search     | The Oracle          | ✅ ae72b23   |

### The Dossier — Character Sheet (MOJO-7D) Key Notes
- Character header banner: SvgIvyTrail flanking the name (left normal,
  right flip={true}), paper texture background, SvgCrescent top-right
- SvgMedallion: pure SVG overlay (no children prop). Parent renders
  avatar clip div behind it, medallion frame SVG overlaid on top.
  Animated with mojo-float (5s cycle).
- Manuscript tabs: active tab has gold top border + marginBottom: -1px
  (hides tab bar bottom border = connected to content panel below).
  Tab glyphs reuse existing SvgNav* components.
- Journal frames: corner brackets (SvgCornerBracket) + paper texture bg.
  Applied to 2 real containers (Biography + tabbed notes block), not 4
  as originally spec'd — MojoCharacterNotes has 2 structural containers.
- Dossier stamp: "DOSSIER" in Cinzel 64px at 2.5% opacity, rotated -8deg
- Avatar URL computed from characterStacks/characterAvatars already in
  page scope — same priority logic as getMojoDashboardData().

### The Portrait Gallery — Faceclaims (MOJO-7E) Key Notes
- Index redesigned as CSS grid (auto-fill minmax 200px) — was a flat row list
- MojoFaceclaimRow.tsx redesigned as portrait card; MojoFaceclaimNameEdit
  preserved intact (on "Do NOT modify" list) — name renders at ~30px not 48px
- SvgGalleryCorridor on both index and detail pages as faint bg strip
- SvgCandleFlame hover: .mojo-portrait-card:hover .mojo-portrait-flame
  (CSS-only, no useState — established hover pattern)
- SvgPortraitFrame color prop requires literal hex (not CSS var)
- Quick copy panel redesigned as contact sheet with film strip edge
- No faceclaim avatars available at index level — silhouette placeholder only
- MojoLibraryTabs is a 6-way snippet-type filter, NOT a Snippets/Resources
  switcher as originally assumed — archive-drawer style applied to all 6

### The Library (MOJO-7F) Key Notes
- SvgBookshelf: two shelves, 99 books as data-driven rect arrays, 3 objects
- SvgScrollEnd: flows in document (not positioned absolute), scroll ends are
  first/last children inside card — overflow:hidden on card is fine
- Code/telegram snippets distinguished by isMono variable (existing pattern)
- MojoLibraryTabs discovered to be a 6-way type filter — Resources section
  header moved to library/page.tsx above MojoLibraryResources call

### Desires — Wishlist (MOJO-7G) Key Notes
- SvgStarfield uses predetermined coordinates (not Math.random) — hydration
- SvgDreamHeader required idSuffix prop addition — renders twice on same page
  (page header + add form) which would have caused clipPath id collision
- Three candle states: SvgCandleUnlit (idea), SvgCandleFlame (active),
  SvgCandleSnuffed (shelved, uses mojo-flame-smoke animation)
- Status grouping already existed (STATUS_SECTIONS logic) — candle headers
  added to existing groups
- TYPE_BORDER_COLOR constant repurposed to color type icons instead of borders

### The Black Book — Partners (MOJO-7H) Key Notes
- SvgLeatherTexture uses Math.sin for organic grain (server-side math is fine,
  result is deterministic — not a hydration risk)
- .mojo-notes-lined horizontal lines at 24px intervals; readonly editor
  containers get lineHeight: '24px' to align text to ruled lines
- expandedPartnerId lives in MojoPartnerList (not MojoPartnerCard)
- No list heading found in MojoPartnerList — Part E's heading instruction
  did not apply

### The Reliquary — Stacks (MOJO-7I) Key Notes
- getSpecimenNumber(createdAt): uses timestamp % 1000 for stable 3-digit ID
- getModeColor/getModeLabel replaced old ROTATION_BADGE_COLOR/ROTATION_LABEL
  Record constants
- "Stack URL" label was in MojoStackCard.tsx (outside MojoStackUrlCopy) —
  changed to "Catalog Entry" cleanly
- SvgCabinetOfCuriosities: triptych arched doors, specimens visible inside,
  cabinet legs at bottom — most structurally complex SVG in the build

### The Darkroom — Images (MOJO-7J) Key Notes
- MojoPersonalImageManager.tsx contains the two-column layout (not
  images/page.tsx) — responsive classes applied to MojoPersonalImageManager
- Photograph card rotation: getCardRotation(index) uses predetermined array
  [-1.8, 0.9, -0.7, 1.4, -1.2, 0.6] — never Math.random()
- .mojo-photograph:hover uses transform: translateY(-4px) rotate(0deg)
  !important to override the inline rotation via CSS specificity
- SvgDarkroomHeader wired in MOJO-7N (was built in 7J but orphaned)
- Drop zone text: "Drop your negatives here." / "or click to expose"
- Safelight: radial gradient using --gold hex (#a02840) at 8-9% opacity

### The Oracle — Search (MOJO-7K) Key Notes
- Three bowl sizes: 220px (no query) / 140px (has query) / 120px (no results)
- searchParams is awaited Promise in Next.js 16 — existing pattern preserved
- Result rows: className="mojo-oracle-result" + animationDelay per row index
- Submit button: just SvgNavSearch icon — no text, no conventional styling
- SvgScryingBowl glowId filter was dead on creation; activated in MOJO-7N
- All search query logic byte-for-byte identical to pre-visual state

### Mobile Responsive System (MOJO-7O)
Breakpoints: mobile < 768px / tablet 768-1023px / desktop >= 1024px
Desktop layout: completely unchanged. All responsive changes inside @media.

MojoMobileNav.tsx ('use client'):
  Props: children (React.ReactNode — wraps MojoSidebar)
  State: isOpen (boolean)
  Renders: hamburger button (fixed, top-left, mobile only) + overlay
  backdrop + sidebar drawer container
  CSS: .mojo-hamburger (display:none on desktop), .mojo-sidebar-drawer
  (position:fixed translateX(-100%) on mobile, translateX(0) when open)
  The sidebar's content and all its nav/RP-tree logic is completely
  untouched — MojoMobileNav only controls visibility.

Key mobile decisions:
  - Content area gets padding-top:60px on mobile to clear hamburger
  - Stats strip: 6-tile flex → 3×2 grid on mobile
  - SvgMoon: 160px on mobile, repositioned (was 320px at -80px right)
  - Images page: folder panel stacks above grid, max-height 180px
  - Photograph cards: rotation zeroed on mobile (overflow risk)
  - Manuscript tabs: horizontal scroll on mobile (.mojo-tab-bar)
  - prefers-reduced-motion: all mojo animations disabled via @media
  - viewport meta: maximum-scale=1 added to app/layout.tsx (was missing)

### The Atelier (/mojo/design — FIX-021)
Private design preview system for SVG illustration candidates.
Auth: inherited from app/mojo/layout.tsx — superadmin only.
Sidebar: "The Atelier" (item 11, last) with SvgNavDesign compass glyph.
Active state: pathname.startsWith('/mojo/design') (sub-pages stay active).

Each preview page shows: SVG at full width on var(--char) dark background,
Cinzel label above (9px uppercase), EB Garamond italic description below.
Clean, no production mock, SVG speaks for itself.

Current designs index (app/mojo/design/page.tsx):
  slug                  title/purpose                       status
  library-bookshelf     Library header option A             Applied (FIX-022)
  library-study         Library header option B             Not chosen (reference)
  hall-of-mirrors       Stacks page concept                 Pending approval
  divining-chamber      Search page concept                 Pending approval
  grimoire              Chronicle/Grimoire page concept     Pending approval
  witches-attic         Images page concept                 Pending approval
  portrait-hall         Faceclaims/Hall of Legends concept  Pending FIX-029

Rule: Production pages are NEVER modified by adding a design to the
Atelier. Production changes require a separate prompt after explicit
approval. The Atelier is observation only.

Applied from Atelier → production:
  library-bookshelf → app/mojo/library/page.tsx (FIX-022):
    SvgLibraryBookshelf in center flex, SvgCandelabra left+right,
    SvgIvyColumn absolutely positioned left/right of content.
    Old SvgBookshelf stays in MojoSvgAssets.tsx (append-only rule).

### MOJO-7M Audit Summary
54 checks across 8 categories. 48 pass, 6 flags, 0 fails.
All 6 flags were in the visual-polish layer, resolved in MOJO-7N:
  1. MojoAvatarCrop canvas hex (#e0b028 Blood Moon → #a02840 S&O)
  2. Rich text swatches (Blood Moon hex → Silver & Onyx hex)
  3. SvgDarkroomHeader orphaned → wired into images page
  4. mojo-rune-fade keyframe orphaned → removed
  5. SvgMoon glowId dead filter → activated on outermost halo circle
  6. #9c9ab8 in non-SVG style props (all were SVG-bound, no change needed)
Categories 1, 2, 4, 5, 7, 8 all passed outright — the build is
structurally, functionally, and pattern-clean.

Cross-reference: TWH_BRIEF_v1.md | TWH_PROCESS_v1.md
This document must be updated when new decisions are made or patterns confirmed.
