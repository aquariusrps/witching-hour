# Mojo — Master Brief, Process & Roadmap
### MOJO_BRIEF_v1.md
### Created: July 2026 | Current version: v1.0

This is the single authoritative document for the Mojo personal RP
dashboard. It combines project brief, build governance, and roadmap.
Read it in full at the start of every Mojo build session.

---

## 1. What Mojo Is

Mojo is a private personal roleplay management dashboard for the site
operator only. It lives at `/mojo` within The Witching Hour codebase
but is completely isolated from the TWH application — no TWH tables are
read or written, no TWH features are modified, no TWH users have access.

It is a one-stop-shop for the operator's personal online roleplaying
life across multiple platforms and sites. Features include:
- RP and character organisation (Site → RP → Character hierarchy)
- Thread tracker with auto-fetch reply detection
- Avatar and image management with a private storage bucket
- Rotating image stacks (one URL, randomised display from a pool)
- Per-character and global resource libraries
- Faceclaim management with cross-character resource aggregation
- A global snippet/template library
- RP wishlist and ideas board
- Writing partner notes book

Mojo is operator-only. No public registration. No other users. Auth is
the existing TWH super admin session — if the operator is logged into
TWH as super admin, they have access. Everyone else is hard-redirected
to `/`.

**URL:** `https://atwitchinghour.com/mojo`
**Theme:** Silver & Onyx (hardcoded — not user-switchable)
**Storage bucket:** `mojo-private` (PRIVATE — not public)
**Image proxy:** `https://atwitchinghour.com/i/[token]`

---

## 2. Relationship to the TWH Codebase

Mojo shares:
- The Next.js 16.2.9 / Supabase / Vercel stack
- The `globals.css` design tokens (Blood Moon `:root`, all theme overrides)
- The Supabase project (`vkhuttcusqubteseifui`)
- The auth system (Supabase Auth, same session)
- `lib/supabase/adminClient.ts` and `lib/supabase/serverClient.ts`
- `lib/permissions.ts` (isSuperAdmin only — no other permission helpers used)
- Google Fonts already loaded in `app/layout.tsx`

Mojo does NOT share:
- Any TWH database table
- Any TWH RLS policy
- Any TWH cached settings
- Any TWH server action or page component
- The (authenticated) route group layout (Masthead, Sidebar, PageLayout)

Mojo has its own:
- Layout: `app/mojo/layout.tsx` (outside the (authenticated) route group)
- All DB tables prefixed `mojo_`
- All migrations prefixed `mojo_NNN_`
- All server actions in `lib/actions/mojo.ts`
- All DB helpers in `lib/db/mojo.ts`
- All client components in `app/mojo/components/`
- Storage bucket: `mojo-private`
- Image proxy infrastructure: `app/i/[token]/route.ts`, `lib/mojo/proxy.ts`
- External image fetch API: `app/api/mojo/fetch-image/route.ts`

---

## 3. Session Starter Block

Every Mojo Claude Code prompt must open with this block verbatim:

```
Before writing any code or SQL, read these three files in full
and confirm you have read them before proceeding:
1. TWH_BRIEF_v1.md — tech stack, design system, database conventions
2. TWH_PROCESS_v1.md — build governance rules
3. MOJO_BRIEF_v1.md — Mojo architecture, schema, patterns, and roadmap
Once you have read all three, confirm you are ready and I will
provide the build instructions.
```

Also required at the start of every Claude Code session:
**Enable live task tracking in Terminal before beginning any build work.**

---

## 4. Tech Stack & Conventions (Mojo-Specific)

### Authentication
- Auth check: `isSuperAdmin(userId: string)` from `lib/permissions.ts`
- This function is already `React.cache()` wrapped
- The shared helper `requireSuperAdmin()` in `lib/actions/mojo.ts`
  wraps the full pattern and returns `Promise<string | null>`
  (returns the userId string on success, null if not super admin)

**Correct pattern in every server action:**
```ts
const userId = await requireSuperAdmin()
if (!userId) return { error: 'Unauthorized' }
```

**Correct pattern in server components:**
```ts
const supabase = await getServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/')
const superAdmin = await isSuperAdmin(user.id)
if (!superAdmin) redirect('/')
```

CRITICAL: `requireSuperAdmin()` returns `string | null`.
It does NOT return a discriminated union `{ error } | { userId }`.
Never check `'error' in result` on this call.

### Database Client
All mojo DB operations use `getAdminClient()` — service role, bypasses
RLS. Mojo tables have no RLS policies. This is correct and intentional.
Never use the cookie-aware server client for mojo DB reads or writes.

### No RLS on Mojo Tables
Mojo tables have no Row Level Security policies. Access is controlled
entirely at the application layer via `requireSuperAdmin()` / `isSuperAdmin()`.
Do not add RLS to mojo tables.

### No Caching Layer
Mojo does not use `unstable_cache`, `revalidateTag`, or any cached
settings functions. Use `revalidatePath()` only.
`revalidateTag()` is never called in mojo code.

### Server Action Return Types
All server actions must declare explicit return types:
```ts
async function myAction(): Promise<{ error: string } | { success: true }> {
```
For actions returning data:
```ts
async function myAction(): Promise<{ error: string } | { success: true; item: MojoSnippet }> {
```
Use `TablesInsert<'table_name'>` and `TablesUpdate<'table_name'>` from
`@/types/database` for insert/update payload objects.

### Client-Side Result Narrowing
```ts
const result = await myAction()
if ('error' in result) {
  // handle error
  return
}
// result is now the success branch
```

### Navigation After Mutations
All post-action navigation uses `window.location.href` (R15 from
TWH_PROCESS_v1.md). Never use `router.push()` in mojo client components.

CRITICAL: All `window.location.href` assignments must be in functions
defined at MODULE LEVEL — outside any component function body.
```ts
// CORRECT — module level
function navigateToCharacter(charId: string) {
  window.location.href = '/mojo/characters/' + charId
}

// WRONG — inside component or JSX callback (violates react-hooks/immutability)
onClick={() => { window.location.href = '/mojo/characters/' + charId }}
```
This rule was established after MOJO-2 Q1 where the ESLint rule
`react-hooks/immutability` flagged inline assignments inconsistently.
The module-level pattern prevents all such violations.

### No useTransition
Use `useState(false)` + direct `await` for loading states.
Never use `useTransition` or `startTransition` in mojo components.

### CSS Variables & Theme
The `/mojo` layout applies `data-theme="silver-onyx"` to the outermost
wrapper div. All CSS variables (`var(--roseash)`, `var(--claret)`, etc.)
remap automatically to Silver & Onyx values via the existing
`[data-theme="silver-onyx"]` block in `globals.css`.

NEVER hardcode Silver & Onyx hex values in component code.
Always use `var(--token)` — the theme handles the remapping.

`data-theme` goes on the layout wrapper div, NOT on `<html>` or `<body>`.

CSS variable tokens that do NOT exist (never use these):
- `var(--moonstone-dim)` — DOES NOT EXIST. Use `var(--moon-dim)` instead.
- `var(--f-heading)` — DOES NOT EXIST. Use `var(--f-head)` instead.

### Image Display
Use `<img>` (not `<Image>` from next/image) for all mojo storage images.
The mojo-private bucket is not in `next.config` remotePatterns and the
proxy route makes this unnecessary.
```tsx
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={proxyUrl} alt={title} />
```

### Sharp Buffer Pattern
When using `sharp().toBuffer()`, wrap the result in `new Uint8Array()`
before passing to `NextResponse`:
```ts
const pngBuffer = await sharp(buffer).png().toBuffer()
return new NextResponse(new Uint8Array(pngBuffer), { ... })
```
Direct `Buffer` fails TypeScript's `BodyInit` type check in this project.
Confirmed in MOJO-3A Q6.

### Image Upload Pattern (P-DC)
Images MUST NOT pass through Server Actions. Vercel Hobby enforces a
4.5MB body limit at the platform layer.

Correct pattern for all image uploads:
1. Client reads the file
2. Client uploads DIRECTLY to `mojo-private` bucket via browser Supabase client
   (`createClient` from `lib/supabase/browserClient.ts`)
3. Client receives the storage path from Supabase
4. Client calls `registerUploadedImage()` Server Action with the storage
   path string only (never the file data)
5. Server Action generates proxy token, writes to DB, returns proxy URL

Never pass File, Blob, ArrayBuffer, Buffer, or base64 through a Server Action.

---

## 5. Migration Naming Convention

Mojo migrations use their own filename prefix, completely separate from
the TWH numeric migration sequence (001–022+).

Format: `mojo_NNN_descriptive_name.sql`
Examples: `mojo_001_foundation.sql`, `mojo_002_content_system.sql`

Applied via Supabase MCP (same workflow as TWH migrations).
Never copy-paste into the Supabase UI SQL editor.

After every migration:
```bash
npx supabase gen types typescript --project-id vkhuttcusqubteseifui > types/database.ts
```

Applied migrations:
- `mojo_001_foundation` — 5 core tables
- `mojo_002_content_system` — 6 additional tables + thread tracker columns

---

## 6. Complete Database Schema

All tables are in the `public` schema. No RLS on any mojo table.

### mojo_rps
```sql
id            uuid PK DEFAULT gen_random_uuid()
name          text NOT NULL
site_name     text NOT NULL
site_url      text
color_hex     text NOT NULL DEFAULT '#c83818'
status        text NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','hiatus','ended'))
notes_plot    text
notes_partners text
notes_misc    text
display_order integer NOT NULL DEFAULT 0
created_at    timestamptz NOT NULL DEFAULT now()
```

### mojo_faceclaims
```sql
id         uuid PK DEFAULT gen_random_uuid()
name       text NOT NULL UNIQUE
notes      text
created_at timestamptz NOT NULL DEFAULT now()
```

### mojo_characters
```sql
id             uuid PK DEFAULT gen_random_uuid()
rp_id          uuid NOT NULL FK mojo_rps(id) ON DELETE CASCADE
faceclaim_id   uuid FK mojo_faceclaims(id) ON DELETE SET NULL
name           text NOT NULL
status         text NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','archived'))
bio            text
notes_plot     text
notes_partners text
notes_misc     text
display_order  integer NOT NULL DEFAULT 0
created_at     timestamptz NOT NULL DEFAULT now()
-- Indexes: rp_id, faceclaim_id, status
```

NOTE: `characters` table has no `primary_stack_id` column yet.
This FK to `mojo_image_stacks` is added in mojo_003 (MOJO-4).

### mojo_resources
```sql
id            uuid PK DEFAULT gen_random_uuid()
faceclaim_id  uuid FK mojo_faceclaims(id) ON DELETE CASCADE
character_id  uuid FK mojo_characters(id) ON DELETE SET NULL
title         text NOT NULL
type          text NOT NULL
                CHECK (type IN ('text','link','snippet','image','gif'))
content       text
url           text
storage_path  text
public_url    text        -- the proxy URL (atwitchinghour.com/i/[token])
display_order integer NOT NULL DEFAULT 0
created_at    timestamptz NOT NULL DEFAULT now()
-- Indexes: faceclaim_id, character_id, type
-- A resource with both FKs null is a global library resource
```

### mojo_threads
```sql
id                uuid PK DEFAULT gen_random_uuid()
rp_id             uuid NOT NULL FK mojo_rps(id) ON DELETE CASCADE
character_id      uuid NOT NULL FK mojo_characters(id) ON DELETE CASCADE
title             text NOT NULL
url               text
partner_names     text
status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','archived'))
display_order     integer NOT NULL DEFAULT 0
created_at        timestamptz NOT NULL DEFAULT now()
-- Added in mojo_002 (thread auto-fetch columns):
detected_platform text CHECK (detected_platform IN ('tumblr','jcink','generic','unknown'))
last_poster       text
fetch_status      text CHECK (fetch_status IN ('success','failed','unsupported','pending','uncertain'))
last_checked_at   timestamptz
-- Indexes: rp_id, character_id, status
```

### mojo_avatars
```sql
id            uuid PK DEFAULT gen_random_uuid()
character_id  uuid FK mojo_characters(id) ON DELETE SET NULL
faceclaim_id  uuid FK mojo_faceclaims(id) ON DELETE SET NULL
title         text
storage_path  text NOT NULL
token         text NOT NULL UNIQUE
expires_at    timestamptz        -- NULL = indefinite
width         integer
height        integer
file_size     integer
mime_type     text NOT NULL DEFAULT 'image/png'
created_at    timestamptz NOT NULL DEFAULT now()
-- Indexes: character_id, faceclaim_id, token
```

### mojo_image_tokens
```sql
id           uuid PK DEFAULT gen_random_uuid()
token        text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text
storage_path text NOT NULL
mime_type    text NOT NULL DEFAULT 'image/png'
expires_at   timestamptz        -- NULL = indefinite
label        text
created_at   timestamptz NOT NULL DEFAULT now()
-- Index: token
```

### mojo_snippets
```sql
id            uuid PK DEFAULT gen_random_uuid()
title         text NOT NULL
content       text NOT NULL
type          text NOT NULL DEFAULT 'general'
                CHECK (type IN ('general','app_code','template','formatting','other'))
tags          text           -- comma-separated, plain text
display_order integer NOT NULL DEFAULT 0
created_at    timestamptz NOT NULL DEFAULT now()
```

### mojo_wishlist
```sql
id            uuid PK DEFAULT gen_random_uuid()
title         text NOT NULL
notes         text
type          text NOT NULL DEFAULT 'plot_idea'
                CHECK (type IN ('character_concept','plot_idea','fandom','other'))
status        text NOT NULL DEFAULT 'idea'
                CHECK (status IN ('idea','active','shelved'))
display_order integer NOT NULL DEFAULT 0
created_at    timestamptz NOT NULL DEFAULT now()
```

### mojo_partners
```sql
id             uuid PK DEFAULT gen_random_uuid()
handle         text NOT NULL
sites          text           -- comma-separated
pace_notes     text
style_notes    text
history_notes  text
display_order  integer NOT NULL DEFAULT 0
created_at     timestamptz NOT NULL DEFAULT now()
```

### mojo_character_resources (junction)
```sql
id           uuid PK DEFAULT gen_random_uuid()
character_id uuid NOT NULL FK mojo_characters(id) ON DELETE CASCADE
resource_id  uuid NOT NULL FK mojo_resources(id) ON DELETE CASCADE
created_at   timestamptz NOT NULL DEFAULT now()
UNIQUE (character_id, resource_id)
-- Indexes: character_id, resource_id
```

### mojo_image_stacks (NOT YET CREATED — mojo_003, MOJO-4)
```sql
id                    uuid PK DEFAULT gen_random_uuid()
token                 text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text
label                 text NOT NULL
rotation_mode         text NOT NULL DEFAULT 'truly_random'
                        CHECK (rotation_mode IN
                          ('truly_random','weighted','sequential','no_repeat'))
character_id          uuid FK mojo_characters(id) ON DELETE SET NULL
faceclaim_id          uuid FK mojo_faceclaims(id) ON DELETE SET NULL
expires_at            timestamptz        -- NULL = indefinite
last_served_index     integer            -- used by sequential mode
last_served_member_id uuid               -- used by no_repeat mode
created_at            timestamptz NOT NULL DEFAULT now()
-- Index: token
```

### mojo_image_stack_members (NOT YET CREATED — mojo_003, MOJO-4)
```sql
id           uuid PK DEFAULT gen_random_uuid()
stack_id     uuid NOT NULL FK mojo_image_stacks(id) ON DELETE CASCADE
storage_path text NOT NULL
mime_type    text NOT NULL DEFAULT 'image/png'
weight       integer NOT NULL DEFAULT 1   -- used by weighted mode only
display_order integer NOT NULL DEFAULT 0
created_at   timestamptz NOT NULL DEFAULT now()
-- Index: stack_id
```

Addition to mojo_characters in mojo_003:
```sql
ALTER TABLE mojo_characters
  ADD COLUMN primary_stack_id uuid
  REFERENCES mojo_image_stacks(id) ON DELETE SET NULL;
```

---

## 7. Image Proxy Architecture

### Single-Image Proxy
- Table: `mojo_image_tokens`
- One token → one `storage_path` in `mojo-private`
- Route: `app/i/[token]/route.ts`
- Helpers: `lib/mojo/proxy.ts`
  - `generateProxyToken()` → `crypto.randomUUID()`
  - `registerImageToken(storagePath, mimeType, expiresAt, label)` → token string
  - `getProxyUrl(token)` → `process.env.NEXT_PUBLIC_SITE_URL + '/i/' + token`

### Rotating Stack Proxy
- Tables: `mojo_image_stacks` + `mojo_image_stack_members`
- One token → many storage paths → random/sequential selection per request
- Same route: `app/i/[token]/route.ts`
- Lookup order: check `mojo_image_tokens` first; if no match, check `mojo_image_stacks`

**Selection logic by rotation_mode:**

`truly_random`: `Math.random()` picks any member. No state written. Stateless.

`weighted`: Each member has a `weight` integer. Build a weighted array,
pick randomly. No state written. Stateless.

`sequential`: Read `last_served_index`, increment (wrapping at member count),
serve that member, write new index back to DB.

`no_repeat`: Read `last_served_member_id`, exclude it from pool,
pick randomly from remainder, write new `last_served_member_id` to DB.

**Sequential and no_repeat write to DB on every image serve.** This is
acceptable for a personal tool. There is a negligible race window on
concurrent requests — the worst outcome is serving the same image twice.
Not worth engineering around.

### Proxy Route Behaviour
- No auth on the route — the token IS the access control
- If token not found: 404
- If `expires_at` is set and past: 410 Gone
- Response headers: `Content-Type`, `Cache-Control: public, max-age=31536000, immutable`,
  `X-Robots-Tag: noindex`
- Response headers MUST NOT reference 'mojo', 'supabase', 'storage', or 'witching-hour'
- Serves from `mojo-private` bucket via admin client `.storage.from('mojo-private').download(path)`

### Per-Image Expiry
- `expires_at timestamptz` on both `mojo_image_tokens` and `mojo_image_stacks`
- `null` = indefinite (never expires)
- Set at upload time; editable after the fact via the token manager UI
- Options presented to operator: Never / 1 year / Custom date

---

## 8. File Structure

```
app/
  mojo/
    layout.tsx                ← auth gate + Silver & Onyx theme + sidebar shell
    page.tsx                  ← dashboard
    components/
      MojoSidebar.tsx
      MojoRpCard.tsx
      MojoArchivedRps.tsx
      MojoRpNotes.tsx
      MojoAddCharacter.tsx
      MojoCharacterStatusToggle.tsx
      MojoCharacterArchiveToggle.tsx
      MojoCharacterTabs.tsx
      MojoCharacterNotes.tsx
      MojoThreadTracker.tsx
      MojoCharacterArchiveToggle.tsx
      MojoFaceclaimAssign.tsx
      MojoCreateFaceclaim.tsx
      MojoFaceclaimRow.tsx
      MojoFaceclaimNameEdit.tsx
      MojoQuickCopyPanel.tsx
      MojoAddResource.tsx
      MojoResourceList.tsx
      MojoResourcesTab.tsx
      MojoLinkToCharacter.tsx
      MojoAddSnippet.tsx
      MojoLibraryTabs.tsx
      MojoSnippetCard.tsx
      MojoWishlistList.tsx
      MojoAddWishlistItem.tsx
      MojoWishlistItem.tsx
      MojoAddPartner.tsx
      MojoPartnerList.tsx
      MojoPartnerCard.tsx
      MojoDashboardStatTile.tsx
      MojoRpEditForm.tsx
      -- MOJO-4 additions:
      MojoAvatarUpload.tsx
      MojoAvatarCrop.tsx
      MojoAvatarGrid.tsx
      MojoStackManager.tsx
      MojoStackMemberList.tsx
    rps/
      page.tsx                ← redirect to /mojo
      [rpId]/
        page.tsx
        edit/page.tsx
    characters/
      [charId]/page.tsx
    faceclaims/
      page.tsx
      [fcId]/page.tsx
    avatars/
      page.tsx                ← stub → MOJO-4
    library/
      page.tsx
    wishlist/
      page.tsx
    partners/
      page.tsx
    search/
      page.tsx                ← stub → MOJO-6
  i/
    [token]/route.ts          ← image proxy (public, no auth)
  api/
    mojo/
      fetch-image/route.ts    ← external image fetch + sharp conversion

lib/
  mojo/
    proxy.ts                  ← generateProxyToken, registerImageToken, getProxyUrl
  actions/
    mojo.ts                   ← ALL mojo server actions
  db/
    mojo.ts                   ← ALL mojo DB helpers
```

---

## 9. Server Actions Reference

All in `lib/actions/mojo.ts`. All call `requireSuperAdmin()` first.

### Built (MOJO-1 through MOJO-3B)

**RP actions:**
- `createMojoRp(formData)`
- `updateMojoRp(rpId, formData)`

**Character actions:**
- `createMojoCharacter(formData)`
- `updateMojoCharacter(charId, payload)`
- `updateMojoCharacterStatus(characterId, status)`

**Thread actions:**
- `createMojoThread(payload)`
- `updateMojoThread(threadId, payload)`
- `updateMojoThreadStatus(threadId, status)`
- `deleteMojoThread(threadId)`

**Faceclaim actions:**
- `createMojoFaceclaim(payload)`
- `updateMojoFaceclaim(fcId, payload)`
- `deleteMojoFaceclaim(fcId)`
- `assignFaceclaimToCharacter(characterId, faceclaimId | null)`

**Resource actions:**
- `createMojoResource(payload)`
- `updateMojoResource(resourceId, payload)`
- `deleteMojoResource(resourceId)`
- `registerUploadedImage(payload)` ← P-DC final step
- `linkResourceToCharacter(resourceId, characterId)`
- `unlinkResourceFromCharacter(resourceId, characterId)`

**Snippet actions:**
- `createMojoSnippet(payload)`
- `updateMojoSnippet(snippetId, payload)`
- `deleteMojoSnippet(snippetId)`

**Wishlist actions:**
- `createMojoWishlistItem(payload)`
- `updateMojoWishlistItem(itemId, payload)`
- `updateMojoWishlistStatus(itemId, status)`
- `deleteMojoWishlistItem(itemId)`

**Partner actions:**
- `createMojoPartner(payload)`
- `updateMojoPartner(partnerId, payload)`
- `deleteMojoPartner(partnerId)`

### To Be Built

**MOJO-4 — Avatar & Stack actions:**
- `registerUploadedAvatar(payload)` — P-DC final step for avatars
- `updateMojoAvatar(avatarId, payload)` — title, expiry, character/faceclaim assignment
- `deleteMojoAvatar(avatarId)` — deletes from storage + DB
- `createMojoImageStack(payload)` — label, rotation_mode, character_id, faceclaim_id, expires_at
- `updateMojoImageStack(stackId, payload)` — label, rotation_mode, expires_at
- `deleteMojoImageStack(stackId)` — deletes all members + DB row
- `addMemberToStack(payload)` — storage_path, mime_type, weight, can reference existing library image
- `removeMemberFromStack(memberId)`
- `updateStackMember(memberId, payload)` — weight, display_order
- `setCharacterPrimaryStack(characterId, stackId | null)`

**MOJO-5 — Thread auto-fetch actions:**
- `refreshThreadStatus(threadId)` — detects platform, fetches, updates fetch_status/last_poster/last_checked_at
- `refreshAllThreads()` — runs refreshThreadStatus for all active threads

**MOJO-6 — Search:**
- `searchMojo(query)` — searches across characters, faceclaims, thread titles, resource titles, RP names

---

## 10. DB Helpers Reference

All in `lib/db/mojo.ts`.

### Built

- `getMojoRpsWithCharacters()` → sidebar tree data
- `getMojoRp(rpId)` → single RP
- `getMojoRpWithCharactersAndThreads(rpId)` → RP detail page
- `getMojoCharacter(charId)` → character + rp_name + faceclaim_name
- `getMojoCharacterThreads(charId)` → threads for character
- `getMojoThread(threadId)` → single thread
- `getMojoFaceclaims()` → all faceclaims with resource_count + character_count
- `getMojoFaceclaim(fcId)` → single faceclaim
- `getMojoFaceclaimResources(fcId)` → resources for faceclaim
- `getMojoFaceclaimWithCharacters(fcId)` → faceclaim + characters using it
- `getMojoCharacterResources(charId)` → own resources + junction-linked global resources
- `getMojoGlobalResources()` → resources with both FKs null
- `getMojoSnippets()` → all snippets
- `getMojoWishlist()` → all wishlist items
- `getMojoPartners()` → all partners
- `getMojoPartner(partnerId)` → single partner
- `getMojoDashboardStats()` → 6 counts in parallel

### To Be Built

**MOJO-4:**
- `getMojoAvatars(filter?)` → all avatars, optionally filtered by character_id or faceclaim_id
- `getMojoAvatar(avatarId)` → single avatar
- `getMojoImageStacks(filter?)` → all stacks, optionally filtered
- `getMojoImageStack(stackId)` → stack + members
- `getMojoStackMembers(stackId)` → members for a stack

---

## 11. Known Technical Debt & Cleanup Items

These items are confirmed and scheduled for MOJO-6:

**TD-1 — Pre-MOJO-3A inline window.location.href violations**
Five components have `window.location.href` inside component-level
handlers rather than module-level functions (Pattern 3 violation):
- `MojoAddCharacter.tsx`
- `MojoCharacterArchiveToggle.tsx`
- `MojoCharacterStatusToggle.tsx`
- `MojoRpEditForm.tsx`
- `MojoSidebar.tsx` (create-RP handler)
ESLint doesn't flag these as errors currently but they are non-compliant.
Fix in MOJO-6 cleanup pass.

**TD-2 — MojoResourceList link affordance double-title**
In `app/mojo/library/page.tsx`, the "link to character" section renders
above `MojoResourceList.tsx`, causing resource titles to appear twice.
Root cause: couldn't modify `MojoResourceList.tsx` in MOJO-3B scope.
Fix in MOJO-6: merge the link affordance into `MojoResourceList.tsx` rows.

**TD-3 — MojoAvatar unused type alias**
`MojoAvatar` type alias in `lib/db/mojo.ts` is unused until MOJO-4.
Produces an ESLint warning (not error). Resolves naturally in MOJO-4.

**TD-4 — Pre-existing img ESLint warnings**
Two pre-existing `@next/next/no-img-element` warnings not related to
mojo code. Not errors. Not blocking.

---

## 12. The Auto Reply Tracker (MOJO-5)

Thread auto-fetch detects the platform from the thread URL and uses the
appropriate strategy to find the last poster.

**Platform detection (from thread URL):**
- `tumblr.com` → `detected_platform = 'tumblr'` → Tumblr API
- `*.jcink.net` or `*.jcink.com` → `detected_platform = 'jcink'` → JCINK scraper
- Any other URL → `detected_platform = 'generic'` → generic scraper

**Tumblr:** Uses Tumblr API (requires `TUMBLR_API_KEY` env var). Fetches
reblog chain, identifies last poster. Most reliable.

**JCINK:** Scrapes HTML of the thread page. JCINK forum software has
consistent post table structure across sites. May break if a site uses
a heavily custom skin. `fetch_status = 'uncertain'` when structure unrecognised.

**Generic:** Best-effort HTML parse for common forum post patterns.
`fetch_status = 'uncertain'` when unconfident.

**`whose_turn` display:** Derived at render time from `last_poster` vs
the character name attached to the thread. Not a stored column.
- If `last_poster` matches character name (case-insensitive): "Their turn"
- If `last_poster` is different: "Your turn"
- If `fetch_status` is 'uncertain', 'failed', or 'unsupported': "Unknown"

**`last_checked_at`** is always displayed on every thread row so the
operator knows how fresh the data is.

**Manual fallback:** A manual toggle is always available regardless of
fetch status. Auto-fetch is additive, not a replacement.

**Env var required:** `TUMBLR_API_KEY` — must be added to `.env.local`
AND Vercel environment variables before MOJO-5 runs.

---

## 13. Rotating Image Stacks (MOJO-4)

**Concept:** One public-facing URL (`atwitchinghour.com/i/[token]`) that
resolves to a different image on each request, randomly selected from a
pool of images (the "stack"). The URL looks identical to a single-image
URL — no external indication that it's a rotating stack.

**Use case:** Avatar rotation — four variants of a character's avatar,
one URL used in all RP posts, each page load may show a different image.

**Four rotation modes (selectable per stack):**
1. `truly_random` — pure `Math.random()`, stateless, any member equally likely
2. `weighted` — members have `weight` integers, higher weight = more frequent, stateless
3. `sequential` — cycles through in order, writes `last_served_index` to DB per request
4. `no_repeat` — random but never the same image twice in a row, writes `last_served_member_id`

**Stack membership:** Members can be:
- Images already in the library (reference their `storage_path`)
- New uploads directly to the stack

**Primary stack:** A character can have one `primary_stack_id` (FK to
`mojo_image_stacks`). This is the "canonical" avatar stack for that
character. Additional stacks can exist as freestanding resources.

**Proxy route lookup order:**
1. Check `mojo_image_tokens` (single image) — if found, serve it
2. Check `mojo_image_stacks` (rotating stack) — if found, apply rotation logic

**Expiry:** Same per-item `expires_at` as single images. Null = indefinite.

---

## 14. MOJO-4 Build Plan: Avatars & Rotating Stacks

**Migration:** `mojo_003_avatars_and_stacks.sql`
Creates: `mojo_image_stacks`, `mojo_image_stack_members`
Alters: `mojo_characters` adds `primary_stack_id`

**Pages built/completed:**
- `app/mojo/avatars/page.tsx` — global avatar manager (replaces stub)
- Avatars tab on character sheet fully wired (replaces MOJO-2 stub)

**Avatar upload features:**
- Drag-and-drop multi-file queue
- Processes files one by one through the queue
- Crop tool: canvas-based, aspect ratio presets (100×100, 150×150, 200×200, freeform)
- Resize: set target dimensions before saving
- Static images → lossless PNG via `sharp` (API route, not Server Action)
- Animated GIFs → kept as `.gif`, no conversion
- P-DC upload pattern: browser → mojo-private → `registerUploadedAvatar()` Server Action
- Per-image expiry selector: Never / 1 year / Custom date
- One-click URL copy (flashes ✓ for 1.5s)

**Sharp usage in API route (not Server Action):**
```ts
// API route at app/api/mojo/process-image/route.ts
const pngBuffer = await sharp(buffer).png().toBuffer()
return new NextResponse(new Uint8Array(pngBuffer), {
  headers: { 'Content-Type': 'image/png' }
})
```
Remember `new Uint8Array()` wrapper (confirmed fix from MOJO-3A Q6).

**Stack UI:**
- Create stack: label, rotation_mode selector, optional character/faceclaim assignment
- Add members: upload new OR select from existing library images
- Weight input per member (shown only when mode = weighted)
- Reorder members (displayed in display_order)
- Preview mode: shows which image would be served (simulates a request)
- Primary stack selector on character sheet header

---

## 15. MOJO-5 Build Plan: Auto Reply Tracker

**Migration:** None (all columns added in mojo_002)

**New env var required:** `TUMBLR_API_KEY`
Add to `.env.local` and Vercel environment variables before this prompt runs.

**New API route:** `app/api/mojo/refresh-thread/route.ts`
POST handler: `{ threadId: string }`
1. Auth check (isSuperAdmin)
2. Fetch thread from DB
3. Detect platform from thread.url
4. Run appropriate fetch strategy
5. Update thread: last_poster, fetch_status, last_checked_at, detected_platform
6. Return updated thread row

**Refresh all:** A "Refresh all active threads" button on the thread
tracker calls individual refresh requests for each active thread in
sequence (not parallel — avoid rate limiting Tumblr API).

**whose_turn badge display:**
- "Your turn" → ember/gold treatment
- "Their turn" → moonstone treatment
- "Unknown" → faded treatment
- Always show last_checked_at timestamp below the badge

---

## 16. MOJO-6 Build Plan: Search, Polish & Cleanup

**Migration:** None

**Global search** (`app/mojo/search/page.tsx` — replaces stub):
- Single query input
- Searches: mojo_characters.name, mojo_faceclaims.name, mojo_threads.title,
  mojo_resources.title, mojo_rps.name
- Results grouped by type with type labels
- Each result links to the relevant page

**Wanted/Connections board** (per RP):
- New table: `mojo_wanted` — id, rp_id FK, character_id (nullable FK),
  title, description, status CHECK ('open','filled')
- Migration: `mojo_004_wanted.sql`
- UI: section on RP detail page below thread overview
- Fields: title (required), description (textarea), character (optional dropdown),
  status toggle open/filled
- CRUD inline on RP detail page

**Full visual polish pass:**
- Silver & Onyx specific decorative elements throughout
- Moon phase markers on section headers
- Richer card designs with personality
- Consistent filigree usage across all pages
- Decorative character sheet header
- Dashboard ambient treatment

**Technical debt cleanup (TD-1 through TD-4 from §11):**
- Fix 5 pre-MOJO-3A window.location.href violations
- Fix MojoResourceList double-title
- Any remaining Q-item loose ends

---

## 17. Navigation Structure

```
/mojo                    Dashboard
/mojo/rps/[rpId]         RP detail (notes, characters, threads overview)
/mojo/rps/[rpId]/edit    Edit RP
/mojo/characters/[charId] Character sheet (Notes / Threads / Resources / Avatars tabs)
/mojo/faceclaims         Faceclaim list
/mojo/faceclaims/[fcId]  Faceclaim detail + quick copy panel + resources
/mojo/avatars            Global avatar manager
/mojo/library            Global snippets + global resources
/mojo/wishlist           RP ideas board
/mojo/partners           Writing partner notes
/mojo/search             Global search
/i/[token]               Image proxy (public, no auth)
/api/mojo/fetch-image    External image fetch API
/api/mojo/refresh-thread Thread auto-fetch API (MOJO-5)
```

**Sidebar nav order:**
1. ✦ Dashboard
2. ✦ Faceclaims
3. ✦ Library
4. ✦ Wishlist
5. ✦ Partners
6. ✦ Search
— filigree divider —
YOUR RPs (RP tree, expandable, characters nested)
— bottom —
mojo v1

---

## 18. Quality Gates (Every Build)

Run before every push:
```bash
tsc --noEmit        # must pass clean (0 errors)
npx eslint .        # must pass clean (0 errors; warnings acceptable)
```

Standard grep verifications for every mojo prompt:
```bash
grep -rn "isSuperAdmin()" --include="*.ts" --include="*.tsx" .
# Expected: 0 (all calls are isSuperAdmin(user.id))

grep -rn "moonstone-dim" --include="*.tsx" --include="*.ts" app/mojo/
# Expected: 0

grep -rn "f-heading" --include="*.tsx" --include="*.ts" app/mojo/
# Expected: 0

grep -rn "useTransition" --include="*.tsx" app/mojo/
# Expected: 0

grep -rn "window.location.href" --include="*.tsx" app/mojo/components/
# Every result must be inside a module-level function
```

Every prompt ends with:
```bash
git add -A
git commit -m "MOJO-X: descriptive message"
git push origin main
```

Build report required after every push:
- Commit hash
- All files created/modified
- All grep results
- Q-items (anything noticed but not acted on)

---

## 19. Build Status

| Prompt | Status | Commit | Key deliverables |
|--------|--------|--------|-----------------|
| MOJO-1 | ✅ Complete | e618fd9 | Foundation, migration mojo_001, layout, auth gate, dashboard, RP detail |
| MOJO-2 | ✅ Complete | afeeefa | Character sheet, notes, thread tracker CRUD |
| MOJO-3A | ✅ Complete | 56da652 | Migration mojo_002, image proxy, faceclaims, resource system |
| MOJO-3B | ✅ Complete | cd05734 | Silver & Onyx theme, library, wishlist, partners, sidebar, dashboard stats |
| MOJO-4 | ⬜ Next | — | Migration mojo_003, avatar upload, crop/resize, rotating stacks |
| MOJO-5 | ⬜ Planned | — | Auto reply tracker, Tumblr API, JCINK scraper, whose_turn |
| MOJO-6 | ⬜ Planned | — | Global search, visual polish, wanted board, cleanup |

---

## 20. Supabase Project Reference

Project ID: `vkhuttcusqubteseifui`
Project URL: `https://vkhuttcusqubteseifui.supabase.co`
Storage bucket: `mojo-private` (PRIVATE — files accessed via proxy only)

TypeScript types regeneration command:
```bash
npx supabase gen types typescript --project-id vkhuttcusqubteseifui > types/database.ts
```

Run after every migration. Always verify the new tables appear in
`types/database.ts` before writing any typed DB code.

---

*Cross-reference: TWH_BRIEF_v1.md (main project brief) | TWH_PROCESS_v1.md (build governance)*
*This document must be updated when new decisions are made or new patterns are confirmed.*
