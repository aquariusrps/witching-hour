# Mojo — Master Brief, Process & Roadmap
### MOJO_BRIEF_v1.md
### Created: July 2026 | Current version: v1.3
### Last updated: July 2026 — through MOJO-7D (commit 2c06adf)

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
Every visual pass prompt (7B through 7K) is presentational ONLY.
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

### No New npm Packages in Visual Passes
All visual work in 7B–7K uses: CSS, inline SVG in JSX, canvas.
No additional npm packages in any visual pass prompt.

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
  npx supabase gen types typescript --project-id vkhuttcusqubteseifui > types/database.ts

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

Pending migrations:
  (none — all planned migrations applied through MOJO-7A)

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
  last_poster text,
  fetch_status text CHECK (success/failed/unsupported/pending/uncertain),
  last_checked_at timestamptz,
  -- Manual whose_turn override (added mojo_005a):
  manual_whose_turn text CHECK (mine/theirs)  -- NULL = use auto-detection
  -- Indexes: rp_id, character_id, status

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
  display_order integer DEFAULT 0, created_at timestamptz

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

---

## 7. Image Proxy Architecture

### Single-Image Proxy
Table: mojo_image_tokens
Token → one storage_path in mojo-private
Route: app/i/[token]/route.ts
Helpers: lib/mojo/proxy.ts
  generateProxyToken() → crypto.randomUUID()
  registerImageToken(storagePath, mimeType, expiresAt, label) → token
  getProxyUrl(token) → NEXT_PUBLIC_SITE_URL + '/i/' + token
Response: Content-Type, Cache-Control: public max-age=31536000 immutable,
  X-Robots-Tag: noindex

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
    Manual override takes priority over auto-detection.
    If last_poster equals characterName (case-insensitive): 'theirs'
    (you were last to post → their turn now).
    Else: 'mine'. Unknown if fetch_status is uncertain/failed/unsupported.
    Tumblr limitation: blog name never matches character name → always
    returns 'mine' unless manual override is set.

  detectPlatformClient(url) → 'tumblr' | 'jcink' | 'generic' | 'unknown'
    Client-safe URL-based platform detection. Mirrors the server-side
    detectPlatform() in lib/mojo/thread-fetchers.ts.

  formatRelativeTime(isoString) → string
    Human-readable relative time: "just now", "3m ago", "2h ago", "3d ago".

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
      -- RP management
      MojoRpNotes.tsx, MojoRpEditForm.tsx
      MojoRpCard.tsx [RETIRED], MojoArchivedRps.tsx [RETIRED]
      MojoDashboardRpPanel.tsx, MojoDashboardNotes.tsx
      MojoDashboardCharCard.tsx, MojoCollapsedRps.tsx
      MojoDashboardStatTile.tsx
      -- Character management
      MojoAddCharacter.tsx, MojoCharacterStatusToggle.tsx
      MojoCharacterArchiveToggle.tsx, MojoCharacterTabs.tsx
      MojoCharacterNotes.tsx, MojoCharacterAvatarTabs.tsx
      -- Thread tracker
      MojoThreadTracker.tsx
      -- Faceclaims
      MojoFaceclaimAssign.tsx, MojoCreateFaceclaim.tsx
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
      MojoImageFolderList.tsx, MojoPersonalImageManager.tsx
      -- Rich text
      MojoRichTextEditor.tsx  (outer) + MojoRichTextEditorInner (inner)
      -- Visual design assets (MOJO-7B onward)
      MojoSvgAssets.tsx  (SVG component library — all decorative SVGs)
      MojoMoonPhases.tsx  (MOJO-7C — live lunar phase calculator + display)
    rps/page.tsx (redirect), rps/[rpId]/page.tsx, rps/[rpId]/edit/page.tsx
    characters/[charId]/page.tsx  (has Suspense boundary for useSearchParams)
    faceclaims/page.tsx, faceclaims/[fcId]/page.tsx
    avatars/page.tsx
    stacks/page.tsx
    library/page.tsx
    wishlist/page.tsx
    partners/page.tsx
    images/page.tsx  (built MOJO-6C)
    search/page.tsx  (full global search — built MOJO-7A)
  i/[token]/route.ts  (public, no auth)
  api/mojo/
    fetch-image/route.ts
    process-image/route.ts
    refresh-thread/route.ts  (built MOJO-5)

lib/
  mojo/
    proxy.ts          -- token registration + proxy URL helpers
    thread-fetchers.ts -- platform detection + 3 fetch strategies (SERVER ONLY)
    utils.ts          -- client-safe utilities (see §8b below)
  actions/mojo.ts  (52 actions as of MOJO-7A)
  db/mojo.ts

---

## 10. Navigation

Current sidebar nav order (as of MOJO-6C):
  1. Dashboard → /mojo
  2. Images → /mojo/images
  3. Faceclaims → /mojo/faceclaims
  4. Library → /mojo/library
  5. Wishlist → /mojo/wishlist
  6. Partners → /mojo/partners
  7. Stacks → /mojo/stacks
  8. Search → /mojo/search  (global search — complete MOJO-7A)

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

Visual elements added in MOJO-7C (The Sanctum):
- SvgMoon (320px) — position absolute top-right, partially clipped,
  mojo-moon-breathe animation, z-index 0 behind all content
- MojoMoonPhases — live lunar phase calculator, 8-phase SVG row,
  current phase highlighted with mojo-moon-breathe pulse
- SvgCandle (pair) — flanking the "Active Roleplays" heading, left
  candle delay=0s, right candle delay=0.35s (never in perfect sync)
- SvgPageHeaderRule — elaborate decorative hr below page title
- Stat tile watermark symbols: ☽ RPs · ♃ Characters · ∞ Threads
  · ☿ Snippets · ♆ Partners · ⬡ Stacks (via watermark prop, 7% opacity)
- SvgCornerBracket (×4 per RP panel) — L-shaped accents in rp.color_hex
  inset 2px (overflow: hidden preserved for border-radius clipping)
- Circular avatar vignette with silver ring overlay in MojoDashboardCharCard
- Whose-turn badge upgraded to circular wax-seal (22px, border-radius 50%)
- SvgFiligreeRule divider above collapsed RPs section

---

## 12. Personal Image Repository (COMPLETE — MOJO-6C, commit 3ca7020)
Visual pass: MOJO-7J "The Darkroom" (planned)

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

deriveWhoseTurn() — pure function in lib/mojo/utils.ts (NOT thread-fetchers).
Tumblr limitation: last_poster is a blog name, not a character name.
Auto-detection always returns 'mine' for Tumblr threads. Use manual
override. UI shows tooltip explaining this on Tumblr-detected threads.

API route: app/api/mojo/refresh-thread/route.ts — POST, auth required.
  Body: { threadId: string }
  Updates: last_poster, fetch_status, last_checked_at, detected_platform

Refresh all: sequential (not parallel) to avoid Tumblr rate limits.

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

## 16. Known Technical Debt

TD-1: Pre-MOJO-3A inline window.location.href violations (5 components)
  MojoAddCharacter.tsx, MojoCharacterArchiveToggle.tsx,
  MojoCharacterStatusToggle.tsx, MojoRpEditForm.tsx,
  MojoSidebar.tsx (create-RP handler)
  Fix: MOJO-7L (deliberately preserved through visual passes per
  Function Preservation Law — these are logic changes, not visual)

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

TD-10: SvgCandle.tsx has an unused idSuffix prop (ESLint warning, not
  error). Forward-compatible prop per spec. Acceptable per project
  standards (warnings acceptable). No action needed.

TD-11: MojoCharacterNotes.tsx has two structural containers (Biography
  standalone + tabbed Plot/Partner/Misc), not four separate sections as
  originally planned. Journal frames applied to the two real containers
  in MOJO-7D. Documented deviation from original spec — resolved in build.

---

## 17. Server Actions Reference (lib/actions/mojo.ts)

Total as of MOJO-7A: 52 actions (requireSuperAdmin count = 52)

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

To be built:
  (none — all planned actions complete)

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

To be built:
  (none — all planned helpers complete)

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
| MOJO-7E | ⬜ Next     | —       | The Portrait Gallery — faceclaims index + detail visual pass |
| MOJO-7F | ⬜ Planned  | —       | The Library — library page visual pass |
| MOJO-7G | ⬜ Planned  | —       | Desires — wishlist visual pass |
| MOJO-7H | ⬜ Planned  | —       | The Black Book — partners visual pass |
| MOJO-7I | ⬜ Planned  | —       | The Reliquary — stacks visual pass |
| MOJO-7J | ⬜ Planned  | —       | The Darkroom — images visual pass |
| MOJO-7K | ⬜ Planned  | —       | The Oracle — search visual pass |
| MOJO-7L | ⬜ Planned  | —       | TD-1 cleanup, stacks URL filter, loose ends, final coherence pass |

---

## 21. Supabase Project Reference

Project ID: vkhuttcusqubteseifui
URL: https://vkhuttcusqubteseifui.supabase.co
Storage bucket: mojo-private (PRIVATE)

Types regeneration:
  npx supabase gen types typescript --project-id vkhuttcusqubteseifui > types/database.ts

---

## 22. Environment Variables (Mojo-Specific)

In addition to the six existing TWH env vars:

  TUMBLR_API_KEY — Tumblr OAuth consumer key for thread auto-fetch
  Status: Set in .env.local and Vercel. Redeployment confirmed.

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
9 @keyframes:
  mojo-moon-breathe — gentle glow pulse, 5s (moon, active phase)
  mojo-flame-main   — candle outer flame flicker, 1.8s
  mojo-flame-inner  — candle inner flame, 1.2s (offset from main)
  mojo-flame-smoke  — wisp above flame, 2.5s
  mojo-ember-pulse  — RP sidebar dot glow, 2.5s
  mojo-float        — slow vertical rise/fall, 4-5s (medallion, crescent)
  mojo-shimmer      — silver shimmer on borders
  mojo-portal-glow  — "back to TWH" link glow, 3s
  mojo-rune-fade    — subtle background rune pulse

6 utility classes:
  .mojo-rp-ember       — sidebar RP color dot
  .mojo-nav-active     — active nav item (gold left border + glow)
  .mojo-nav-item       — nav item hover state
  .mojo-filigree-rule  — decorative hr
  .mojo-bg-tile        — tiled alchemical pattern background
  .mojo-portal-glow    — animated portal icon

### SVG Asset Library (app/mojo/components/MojoSvgAssets.tsx)
All reusable SVG decorative components. 19 exports as of MOJO-7D.

Global chrome SVGs (MOJO-7B):
  SvgCrescent(size, idSuffix) — crescent moon with star
  SvgSidebarOrnamentTop() — large crescent with cardinal ticks
  SvgSidebarOrnamentBottom() — small alchemical triangle
  SvgNavDashboard/Images/Faceclaims/Library/Wishlist/Partners/Stacks/Search
    (active: boolean) — 8 unique nav glyphs
  SvgPortalIcon() — arch/portal for "back to TWH"
  SvgFiligreeRule(width) — decorative hr with diamond pip

Dashboard SVGs (MOJO-7C):
  SvgMoon(size, idSuffix) — layered luminous moon, mojo-moon-breathe
  SvgCandle(height, idSuffix, flameDelay) — animated candle with 3
    flame layers (main 1.8s, inner 1.2s, smoke 2.5s)
  SvgCornerBracket(size, color, rotation, style) — L-shaped panel accent
  SvgPageHeaderRule() — elaborate decorative hr with crescent centre

Character SVGs (MOJO-7D):
  SvgIvyTrail(width, height, flip) — manuscript margin ivy/vine
  SvgMedallion(size, idSuffix) — tick-ring avatar frame overlay

MojoMoonPhases.tsx (MOJO-7C) — Client Component:
  getLunarPhaseIndex() → 0-7 based on real synodic month calculation
  8 SVG phase icons, current phase highlighted with mojo-moon-breathe

### Page Visual Themes
Each page receives a focused visual pass in its own prompt.

| Prompt | Page      | Theme               | Status    |
|--------|-----------|---------------------|-----------|
| MOJO-7C | Dashboard | The Sanctum         | ✅ 1efaabe |
| MOJO-7D | Characters| The Dossier         | ✅ 2c06adf |
| MOJO-7E | Faceclaims| The Portrait Gallery| ⬜ Next   |
| MOJO-7F | Library   | The Library         | ⬜        |
| MOJO-7G | Wishlist  | Desires             | ⬜        |
| MOJO-7H | Partners  | The Black Book      | ⬜        |
| MOJO-7I | Stacks    | The Reliquary       | ⬜        |
| MOJO-7J | Images    | The Darkroom        | ⬜        |
| MOJO-7K | Search    | The Oracle          | ⬜        |

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

Cross-reference: TWH_BRIEF_v1.md | TWH_PROCESS_v1.md
This document must be updated when new decisions are made or patterns confirmed.
