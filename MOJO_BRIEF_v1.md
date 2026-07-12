# Mojo — Master Brief, Process & Roadmap
### MOJO_BRIEF_v1.md
### Created: July 2026 | Current version: v1.1
### Last updated: July 2026 — through MOJO-4B (commit 9406cff)

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
  4. Client calls registerUploadedAvatar() with storage path only

Never pass File, Blob, ArrayBuffer, or base64 through a Server Action.

### Crop Tool — Optional by Default (IMPORTANT)
The crop tool (MojoAvatarCrop.tsx) is opt-in, never mandatory.
Files queue and upload immediately by default.
A Crop button on each queued item opens the crop tool for that
specific file before it uploads.
This applies everywhere in the system — avatar upload, image
repository, everywhere.
NOTE: MOJO-4B built crop as mandatory. This is TD-5, fixed in MOJO-6A.

### Rich Text Fields
All user-facing text inputs use MojoRichTextEditor.tsx (built MOJO-6A)
EXCEPT: snippet fields where type = app_code or formatting (stay plain
monospace textarea — raw text preserved).

Rich text output stored as HTML in existing text columns.
Display: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}

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

Pending migrations:
  mojo_005_personal_images — mojo_image_folders, mojo_personal_images (MOJO-6B)
  mojo_006_wanted — mojo_wanted with image_token field (MOJO-7)

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
  last_checked_at timestamptz
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

mojo_image_folders (NOT YET CREATED — mojo_005, MOJO-6B):
  id uuid PK, name text NOT NULL, display_order integer DEFAULT 0,
  created_at timestamptz
  -- Flat folders only, no nesting

mojo_personal_images (NOT YET CREATED — mojo_005, MOJO-6B):
  id uuid PK, folder_id uuid FK mojo_image_folders SET NULL,
  title text NOT NULL, storage_path text NOT NULL,
  token text NOT NULL UNIQUE, mime_type text DEFAULT image/png,
  expires_at timestamptz, tags text, file_size integer,
  created_at timestamptz
  -- Indexes: folder_id, token

mojo_wanted (NOT YET CREATED — mojo_006, MOJO-7):
  id uuid PK, rp_id uuid FK mojo_rps CASCADE,
  character_id uuid FK mojo_characters SET NULL,
  title text NOT NULL, description text,  -- HTML (rich text)
  image_token text,  -- proxy token for optional reference image
  status text CHECK (open/filled) DEFAULT open,
  display_order integer DEFAULT 0, created_at timestamptz
  -- Indexes: rp_id, character_id, status

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

Display: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}

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

## 9. File Structure

app/
  mojo/
    layout.tsx
    page.tsx  (Dashboard / RP Command Center)
    components/
      MojoSidebar.tsx, MojoRpCard.tsx, MojoArchivedRps.tsx
      MojoRpNotes.tsx, MojoRpEditForm.tsx
      MojoAddCharacter.tsx, MojoCharacterStatusToggle.tsx
      MojoCharacterArchiveToggle.tsx, MojoCharacterTabs.tsx
      MojoCharacterNotes.tsx, MojoCharacterAvatarTabs.tsx
      MojoThreadTracker.tsx
      MojoFaceclaimAssign.tsx, MojoCreateFaceclaim.tsx
      MojoFaceclaimRow.tsx, MojoFaceclaimNameEdit.tsx
      MojoFaceclaimAvatars.tsx, MojoQuickCopyPanel.tsx
      MojoAddResource.tsx, MojoResourceList.tsx
      MojoResourcesTab.tsx, MojoLinkToCharacter.tsx
      MojoAddSnippet.tsx, MojoLibraryTabs.tsx, MojoSnippetCard.tsx
      MojoWishlistList.tsx, MojoAddWishlistItem.tsx, MojoWishlistItem.tsx
      MojoAddPartner.tsx, MojoPartnerList.tsx, MojoPartnerCard.tsx
      MojoDashboardStatTile.tsx
      MojoAvatarUpload.tsx, MojoAvatarCrop.tsx, MojoAvatarGrid.tsx
      MojoAvatarFilter.tsx, MojoAvatarManager.tsx
      MojoStackCard.tsx, MojoStackMembers.tsx, MojoStackDropZone.tsx
      MojoStackUrlCopy.tsx, MojoCreateStack.tsx
      MojoRichTextEditor.tsx  (MOJO-6A)
      MojoImageFolderList.tsx, MojoPersonalImageGrid.tsx,
      MojoPersonalImageManager.tsx  (MOJO-6B)
    rps/page.tsx (redirect), rps/[rpId]/page.tsx, rps/[rpId]/edit/page.tsx
    characters/[charId]/page.tsx
    faceclaims/page.tsx, faceclaims/[fcId]/page.tsx
    avatars/page.tsx
    stacks/page.tsx
    library/page.tsx
    wishlist/page.tsx
    partners/page.tsx
    images/page.tsx  (MOJO-6B)
    search/page.tsx  (stub → MOJO-7)
  i/[token]/route.ts  (public, no auth)
  api/mojo/
    fetch-image/route.ts
    process-image/route.ts
    refresh-thread/route.ts  (MOJO-5)

lib/
  mojo/proxy.ts
  actions/mojo.ts  (40 actions as of MOJO-4B)
  db/mojo.ts

---

## 10. Navigation

Sidebar nav order (current, after MOJO-4A):
  1. Dashboard → /mojo
  2. Faceclaims → /mojo/faceclaims
  3. Library → /mojo/library
  4. Wishlist → /mojo/wishlist
  5. Partners → /mojo/partners
  6. Stacks → /mojo/stacks
  7. Search → /mojo/search

Sidebar nav order (after MOJO-6B adds Images):
  1. Dashboard → /mojo
  2. Images → /mojo/images  (NEW — second position)
  3. Faceclaims → /mojo/faceclaims
  4. Library → /mojo/library
  5. Wishlist → /mojo/wishlist
  6. Partners → /mojo/partners
  7. Stacks → /mojo/stacks
  8. Search → /mojo/search

---

## 11. Dashboard / RP Command Center (MOJO-6B redesign)

The dashboard (/mojo) is completely redesigned in MOJO-6B to serve as
both the stats overview AND the primary RP management interface.
The current simple dashboard is retired and replaced.

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

---

## 12. Personal Image Repository (MOJO-6B)

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
  Can be dragged into stacks (same drag-to-stack as avatars)

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
  Key must be identical in MojoAvatarGrid.tsx (setData) and
  MojoStackDropZone.tsx (getData). Confirmed consistent in MOJO-4B.

Primary stack: character can have one primary_stack_id FK.
  Additional freestanding stacks also supported.

Known limitation: Stack edit mode does not support character/faceclaim
reassignment. Fix scheduled for MOJO-7 (TD-6).

---

## 15. Wanted / Connections Board (MOJO-7)

Per-RP section on the RP detail page.
Fields: title, rich text description, optional reference image
(P-DC upload, stored as image_token), character assignment (optional),
status (open/filled).

---

## 16. Known Technical Debt

TD-1: Pre-MOJO-3A inline window.location.href violations (5 components)
  MojoAddCharacter.tsx, MojoCharacterArchiveToggle.tsx,
  MojoCharacterStatusToggle.tsx, MojoRpEditForm.tsx,
  MojoSidebar.tsx (create-RP handler)
  Fix: MOJO-7

TD-2: MojoResourceList double-title in library page
  Link affordance renders above list, causing titles to appear twice.
  Fix: MOJO-7 (merge affordance into MojoResourceList rows directly)

TD-3: RESOLVED in MOJO-4B. MojoAvatar type alias now used.

TD-4: Two pre-existing img ESLint warnings unrelated to mojo.
  Not errors. Not blocking.

TD-5: Crop tool is mandatory in MojoAvatarUpload.tsx (MOJO-4B built wrong)
  Must be changed to opt-in. Fix: MOJO-6A.

TD-6: Stack edit mode does not support character/faceclaim reassignment.
  Fix: MOJO-7.

TD-7: MojoResourceList not yet accepting link affordance inline.
  Fix: MOJO-7.

---

## 17. Server Actions Reference (lib/actions/mojo.ts)

Total as of MOJO-4B: 40 actions (requireSuperAdmin count = 40)

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

To be built:
  MOJO-6B (Personal Images): createMojoImageFolder, updateMojoImageFolder,
    deleteMojoImageFolder, registerUploadedPersonalImage,
    updateMojoPersonalImage, deleteMojoPersonalImage
  MOJO-7 (Wanted): createMojoWanted, updateMojoWanted,
    updateMojoWantedStatus, deleteMojoWanted

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
  getMojoAvatars, getMojoAvatar

To be built:
  MOJO-5: (no new helpers — thread refresh is an API route)
  MOJO-6B: getMojoImageFolders, getMojoPersonalImages
  MOJO-7: getMojoWanted

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

Every prompt ends with:
  git add -A
  git commit -m "MOJO-X: descriptive message"
  git push origin main

Build report required with: commit hash, files list, grep results, Q-items.

---

## 20. Build Status

| Prompt  | Status      | Commit  | Key deliverables |
|---------|-------------|---------|-----------------|
| MOJO-1  | Complete    | e618fd9 | Foundation, migration mojo_001, layout, auth gate, dashboard, RP detail |
| MOJO-2  | Complete    | afeeefa | Character sheet, notes, thread tracker CRUD |
| MOJO-3A | Complete    | 56da652 | Migration mojo_002, image proxy, faceclaims, resource system |
| MOJO-3B | Complete    | cd05734 | Silver & Onyx theme, library, wishlist, partners, sidebar, dashboard stats |
| MOJO-4A | Complete    | 2e08a0f | Migration mojo_003, process-image route, proxy stack extension, stacks page |
| MOJO-4B | Complete    | 9406cff | Migration mojo_004 (storage policy), avatar upload, crop, card grid, drag-to-stack |
| MOJO-6A | Next        | —       | Rich text editor + retrofit all text fields + crop UX fix — RUN BEFORE MOJO-5 |
| MOJO-5  | Planned     | —       | Auto reply tracker — TUMBLR_API_KEY now configured |
| MOJO-6B | Planned     | —       | Dashboard redesign (RP command center) + /mojo/images personal repository |
| MOJO-7  | Planned     | —       | Global search + visual polish + wanted board + TD cleanup |

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

Cross-reference: TWH_BRIEF_v1.md | TWH_PROCESS_v1.md
This document must be updated when new decisions are made or patterns confirmed.
