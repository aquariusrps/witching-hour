# The Witching Hour — Process & Build Governance
### TWH_PROCESS_v1.md
### Created: June 2026

This document governs how every build session is run. It exists alongside the Brief as a required read at the start of every Claude Code session. These rules are not suggestions — they are the standards that keep builds clean, efficient, and error-free.

They are inherited and refined from Wizard Mansion's build experience (13 build parts, 100+ migrations). Every rule here was either learned the hard way on WM or is a direct preventive measure against a WM failure mode.

---

## 1. Session Starter Block

Every Claude Code prompt must open with this block verbatim.
No exceptions. Do not begin any build work until this is confirmed.

```
Before writing any code or SQL, read these two files in full
and confirm you have read them before proceeding:
1. TWH_BRIEF_v1.md — the complete authoritative record of the
   tech stack, design system, all database schemas, and all
   confirmed design decisions.
2. TWH_PROCESS_v1.md — the build governance rules you must
   follow throughout this session.
Once you have read both, confirm you are ready and I will
provide the build instructions.
```

**CRITICAL:** Always use the exact versioned filenames. If you cannot find the versioned file, stop and flag it — never fall back to an unversioned or prior-version file.

This single step prevents the majority of "built something that doesn't match the spec" errors.

---

## 2. Schema Verification Rule

Before writing any SQL or any server action that touches a database table, verify the actual schema first. **Never assume column names from memory or from a previous session.**

**Required query before touching any table:**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```

Run this for every table a prompt will touch. Paste results back before writing any code that references those columns.

**This rule is non-negotiable.** Two confirmed WM failures caused by schema assumptions:
- WM Phase 12: SQL errors from assumed column names
- WM Migration 068: `hasPermission()` used `is_granted` (does not exist) instead of `is_enabled` — silently broke Staff Lounge nav for all users

**The TWH equivalent:** permission column is `is_enabled`. NEVER `is_granted`. If you write `is_granted` anywhere in this codebase it is a bug.

---

## 3. Scope Lock

Every prompt has a defined scope. Do not build anything outside that scope, even if it seems obviously related or helpful.

If during a build you notice something adjacent that needs doing, record it as a follow-up question (Q-item) in the post-build summary. Do not build it. Do not "just fix it while you're here."

**Why:** Scope creep is the primary source of unexpected breakage. WM had multiple incidents where "just fixing it while here" introduced regressions in untouched features.

**Follow-up Q pattern:** At the end of every build, list outstanding questions as:
```
Q1. [Question about something noticed but not acted on]
Q2. [Another question]
```
These carry forward to the next prompt.

---

## 4. Migration Discipline

### Naming Convention
Migrations are numbered sequentially: `001`, `002`, `003`, etc.
Filename format: `{number}_{descriptive_snake_case}.sql`
Example: `001_core_tables.sql`, `002_roles_permissions.sql`

### Migration Rules
- One migration per logical unit of change
- Migrations are applied via Supabase MCP directly — this is the canonical workflow
- Every migration that creates a table with FK columns MUST add explicit indexes on those FK columns
- PostgreSQL does NOT automatically index FK columns
- Composite index column order: most selective / most-filtered column first

### REPLICA IDENTITY FULL
Tables that use Supabase Realtime UPDATE events MUST have:
1. `ALTER TABLE table_name REPLICA IDENTITY FULL;` in the migration
2. The table added to the `supabase_realtime` publication: `ALTER PUBLICATION supabase_realtime ADD TABLE table_name;`

**Both are required. Neither alone is sufficient.** WM discovered this mid-build after UPDATE events silently failed.

Required for TWH at launch: `chat_messages`, `mail_messages`

---

## 5. The Phase A / Phase B Structure

Any prompt that involves debugging, investigating an unexpected behavior, or fixing something that "should work but doesn't" MUST use Phase A / Phase B structure.

**Phase A (Investigation — read-only):**
- Verify live state, not intended state
- Run actual queries against the live database
- Check pg_policies, information_schema, actual row counts
- Check deployed code behavior (Vercel deploy may lag commits)
- Do NOT write any fixes in Phase A
- Report findings and wait for authorization to proceed

**Phase B (Targeted fix):**
- Only after Phase A findings are confirmed
- Addresses the root cause identified in Phase A
- Does not address anything else

**Why:** WM DELETE-CASCADE-MAIL-GIFTS Phase A initially assumed 1:1 cardinality from reading the schema. Live query revealed 1:many — some mail_messages had 3+ gift rows. The Phase A fix based on assumed cardinality would have destroyed sibling gifts. Phase B was correct only because Phase A ran live queries.

**The rule:** Phase A must verify against live state, not against what the code intends.

---

## 6. RLS Pre-Prompt Verification

Before writing any prompt that touches Row Level Security (RLS) policies, query `pg_policies` first:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'your_table_name';
```

This is mandatory because:
- Missing UPDATE policies cause 503 errors in Server Actions that write then read (WM CHAT-3b root cause)
- Missing INSERT policies cause silent failures
- RLS must cover all operations your code performs (SELECT, INSERT, UPDATE, DELETE)

---

## 7. Authentication & Permissions Rules

### The Two-Cookie-Aware-Client Rule
**A Server Action MUST NOT contain two cookie-aware Supabase clients.** This causes a `setAll()` conflict that results in a 503 error during response finalization.

A cookie-aware client is created by `createServerClient(url, key, { cookies: { ... } })`.

**The conflict pattern (WM CHAT-3b root cause):**
```ts
// WRONG — two cookie-aware clients in one Server Action
export async function myAction() {
  const supabase = createServerClient(...) // client 1, cookie-aware
  const user = await supabase.auth.getUser()
  const hasPerm = await hasPermission(userId, 'delete_posts') // creates client 2 inside
  // 503 on response finalization
}
```

**The fix — inline permission checks using the admin client:**
```ts
// CORRECT
export async function myAction() {
  const supabase = createServerClient(...) // one cookie-aware client
  const admin = createAdminClient()        // admin client, no cookies
  const { data: perm } = await admin
    .from('role_permissions')
    .select('is_enabled')
    .eq('role_id', roleId)
    .eq('permission_id', permId)
    .single()
  // proceed with supabase for user operations
}
```

### Admin Client Write Pattern
When a Server Action needs to write data that a user's RLS policies would block (e.g. soft-deleting another user's message as a moderator), use the admin client for that specific write. Do NOT use the admin client for reads that should be RLS-filtered.

### Pre-Prompt RLS UPDATE Verification
Before writing any prompt that involves a Server Action which performs an UPDATE on a table, verify that an UPDATE RLS policy exists for that table. Missing UPDATE policies cause 503s even when the DB write succeeds.

```sql
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'your_table' AND cmd = 'UPDATE';
```

---

## 8. Supabase & Database Rules

### Realtime Requirements (Two-Layer)
For Realtime UPDATE events to work, BOTH of these must be true:
1. `ALTER TABLE t REPLICA IDENTITY FULL;`
2. `ALTER PUBLICATION supabase_realtime ADD TABLE t;`

Check both before assuming Realtime is configured. WM confirmed this the hard way with chat_messages.

### The browserSupabase Singleton
All client-side Realtime subscriptions use the singleton in `lib/supabase/browserClient.ts`. Never call `createClient()` directly in a component. Multiple `createClient()` calls create duplicate connections.

### Cached Settings — Never Bypass
Before writing any new query against a cached table (see §17 of the Brief), check `lib/cached-settings.ts`. If a cached version exists, use it. Admin mutations that modify cached data MUST call `revalidateTag(tag)`.

### jsonb Columns
When querying a jsonb column with PostgREST, note: a many-to-one FK relationship returns an object, not an array. Verify the actual shape of returned data before accessing it in code.

### mail_gifts Constraint Pattern (inherited from WM)
If the database has a CHECK constraint requiring at least one content column to be non-null on a row (like WM's mail_gifts_has_content), deleting a referenced item requires application-level cleanup of those rows BEFORE the parent DELETE. Verify this pattern applies to any similar table.

---

## 9. Vercel Platform Constraints

### 4.5MB Serverless Function Body Limit (Hobby Plan)
This limit applies to the entire request body of a Serverless Function. It is enforced at the platform layer before application code runs.

**Consequence:** File uploads larger than ~4.5MB CANNOT go through Server Actions on Vercel Hobby.

**The P-DC Pattern (Direct Browser Upload):**
- Client uploads directly to Supabase Storage via the browser Supabase client
- Storage bucket requires appropriate RLS policies on `storage.objects`
- Server Action only receives the resulting URL, not the file data
- Use `lib/uploadAdminImage.ts` as the shared helper for admin uploads

**Pre-build check:** Any prompt involving file uploads must confirm the upload path. If the file could exceed 4.5MB, P-DC is required.

---

## 10. Verification Discipline

### Hard Refresh After Deploy
After pushing a fix and waiting for Vercel to deploy, always do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) before testing. Cached browser state is a common source of "my fix didn't work" false negatives.

### Source-Level Grep Verification
When verifying that a function, import, or pattern is used correctly throughout the codebase, use grep:
```bash
grep -r "functionName" --include="*.ts" --include="*.tsx" .
```
Do not rely on "the code looks right" — verify with evidence.

### No Self-Audit Reformulation
When asked to audit whether something works, do not reformulate the question to answer a version that's easier to confirm. If the question is "does delete-with-pending-gifts work end-to-end?", the answer requires live execution evidence, not "the code calls the cleanup function."

**Audit answer pattern:**
```
Q. Does [feature] work end-to-end?
Evidence:
- Pre-state: [DB query result before action]
- Action: [action performed]
- Post-state: [DB query result after action]
Verdict: YES/NO — [one sentence]
```

### Design Tokens Are Not Suggestions
When a design token (color, font, spacing, border radius) is specified in the Brief, use exactly that value. Do not substitute a "similar" value. The Blood Moon design system has specific hex values — use them precisely.

### STOP and Report
If a build produces an unexpected result (error, wrong behavior, missing element), STOP and report it immediately. Do not attempt a speculative fix. The correct path is Phase A investigation.

### Smoke Test Before Push
The build chat should perform a smoke test of the primary user flow before pushing to Vercel. For Claude Code sessions: explicitly test the feature in the browser, not just verify that the code compiled.

### Grep Evidence, Not YES/NO
When audit questions ask about code presence, provide grep evidence:
```bash
grep -r "revalidateTag" --include="*.ts" . | grep "site-settings"
```
A YES answer without evidence is unacceptable.

### inline-style Overrides Tailwind
When both `className` Tailwind utilities and inline `style` attributes are present on the same element, the inline `style` always wins regardless of specificity. If a Tailwind class isn't applying, check for a conflicting inline style.

### matchMedia Avoidance
Do not use `window.matchMedia` for responsive layout breakpoints. Tailwind responsive utilities (`sm:`, `md:`, `lg:`) are the correct approach. `matchMedia` creates hydration mismatches.

### Server Action 503 Diagnostic Flow
If a Server Action returns 503 but the DB write succeeds:
1. Check for two cookie-aware Supabase clients in the same action (§7)
2. Check for missing RLS UPDATE policy (§6)
3. Check for Vercel body limit exceeded (§9)
Do not attempt other fixes until these three are ruled out in order.

### Investigation-First After a Fix Didn't Land
If a deployed fix doesn't produce the expected result, do NOT write another fix. Run Phase A first: verify that the deployed code matches the local code, verify live DB state, verify the fix addressed the actual root cause.

### Architectural Fix Path
When a fix targets a symptom, ask: is there a structural rewrite that eliminates the entire bug class? WM CHAT-3c-fix → CHAT-3c-fix-2 example: the first fix added a runtime lookup function; the second restructured data flow so the lookup was never needed. The structural fix was the correct answer.

### Realtime Needs Parallel Enrichment
When a Realtime subscription receives an INSERT event, it must apply the same data enrichment as the initial page fetch. If the page fetch enriches rows with related data (author info, character info, etc.), the Realtime handler must do the same enrichment for new rows. WM: the initial fetch and realtime handler for chat_messages both called `resolveChatMentions()`.

### Audit Questions Must Verify Outcome
Audit questions must verify that behavior works, not just that the code calls the right function. Code presence is necessary but not sufficient. Evidence of correct behavior is required.

---

## 11. Quality Gates Before Every Push

Run both commands before pushing any code changes. Do not push if either reports errors.

```bash
tsc --noEmit        # TypeScript type checking
npx eslint .        # Code quality and React rules
```

**Note:** `npx next lint` does not exist in Next.js 16 — it was removed. Use the two commands above instead. Both must pass clean. Warnings are acceptable; errors are not.

ESLint is configured via `eslint.config.mjs` with `eslint-config-next` (core-web-vitals preset). Internal Next.js routes must use `<Link>` not `<a>` tags — ESLint enforces this.

---

## 12. Migration Application Protocol

1. Write migration SQL
2. Apply via Supabase MCP (canonical workflow — confirmed in WM Build Part 11)
3. Run `npx supabase gen types typescript --project-id [id] > types/database.ts` to regenerate types
4. Verify the migration applied by querying `information_schema.columns`
5. Confirm in Brief that the migration is recorded

Never apply migrations by copy-pasting into the Supabase UI SQL editor for anything beyond exploration. The MCP application workflow is the source of truth.

---

## 13. Production Push Protocol

**Every build prompt must end with a git push.** Vercel auto-deploys on push to main. Never end a session without confirming the push succeeded.

**Visual changes (no schema):**
1. `tsc --noEmit` — must pass clean
2. `npx eslint .` — must pass clean
3. `git add -A && git commit -m "TWH-X.X: descriptive message"`
4. `git push origin main`
5. Wait for Vercel deploy (check dashboard)
6. Hard refresh browser
7. Verify manually — do not use Claude in Chrome

**Schema changes:**
1. Apply migration via Supabase MCP
2. Verify migration applied (`information_schema` query)
3. Regenerate TypeScript types
4. `tsc --noEmit` and `npx eslint .` — both must pass clean
5. `git add -A && git commit -m "TWH-X.X: migration NNN: descriptive message"`
6. `git push origin main`
7. Wait for Vercel deploy
8. Hard refresh + verify manually

**Claude Code commits without pushing:** Claude Code may commit without pushing. Always verify the push happened (`git log --oneline -3` + compare to GitHub) before the session ends. A commit that isn't pushed has not deployed.

---

## 14. Design System Compliance

Every UI element must use the Blood Moon design tokens from §4 of the Brief. When building a new page or component:

1. Check the Brief for the relevant color tokens
2. Use CSS custom properties (`var(--ember)`, `var(--gold)`, etc.) — never hardcode hex values in component code
3. Typography: Cormorant Upright for display, Playfair Display for headings, Cinzel for UI labels, EB Garamond for body — no other fonts
4. Border radius: small and elegant — 2px, 4px, 7px, 11px. No pill shapes unless explicitly specified
5. The faction color system must be consistent throughout: Covenant = gold, Cabal = ember, Unbound = moonstone — everywhere, always

**Filigree vocabulary (canonical):**
- Dividers: gradient lines (ember → gold) with `◆` diamond pips or `✦` star glyphs
- Panel headers: Cinzel font, small uppercase, muted color (`var(--faded)`)
- Corner accents: 2px L-shaped brackets in accent/faction color
- Avatar rings: dashed border circles, rotating, in ember + gold

---

## 15. Canon Source System

The `canon_source` field appears on: `board_threads`,
`board_posts`, `characters`, `grimoire_entries`,
`rewatch_events`, `waitlist_signups`, and potentially
more tables.

**All valid canonical values (exact strings):**
Primary shows:

'charmed' | 'buffy' | 'angel' | 'the_craft' |

'practical_magic' | 'ahs_coven' |

'chilling_adventures' | 'secret_circle'
Secondary shows:

'witches_of_east_end' | 'motherland_fort_salem' |

'discovery_of_witches' | 'sabrina_90s'
System:

'original' | 'all'

These values are exact strings — no variations, no
capitalisation, no spaces. When adding a new feature
that needs canon tagging, use these exact strings as a
CHECK constraint or enum.

**Single source of truth for UI:** `lib/canons.ts`
exports the CANONS array. Always import from there —
never hardcode a canon list in a component.

**Color mapping for canon badges (use hex from
lib/canons.ts — canon colors are fixed, not
theme-sensitive):**
- `charmed` → `#e0b028`
- `buffy` / `angel` / Buffy & Angel → `#3878a8`
- `the_craft` → `#4a7c59`
- `practical_magic` → `#9a7090`
- `ahs_coven` → `#a8a0b8`
- `chilling_adventures` → `#6030a0`
- `secret_circle` → `#7a6080`
- Secondary shows → muted treatment (see lib/canons.ts
  for exact hex values)

---

## 16. Character System Rules

### Two Tables — Never Conflate Them
- `users` — the account-level profile. One row per registered user. Display name, avatar, bio, theme preference, watching status, active_character_id. Maps 1:1 with `auth.users`.
- `characters` — RP character sub-profiles. Multiple per user (limit in site_settings, never hardcoded). Name, faction, powers, XP, level, status. FK to `users.id`.

**`users` = the person. `characters` = the personas they play.**

When a feature refers to "the user's profile", it queries `users`. When it refers to "the user's character", it queries `characters`. Never use `users` to mean an RP character and never use `characters` to mean the account profile.

### Active Character
The currently-selected RP character for IC posting is stored as `active_character_id` on the `users` table. This is a nullable FK to `characters.id`. It is set when the user selects a character from their My Characters page or the character selector.

### Approval Gate
Only characters with `status = 'active'` can be selected for IC posting. Characters in `status = 'pending'`, `status = 'needs_revision'`, or `status = 'suspended'` must not appear in the IC character selector. The full status lifecycle is:
  pending → needs_revision → pending (loop) → active
  pending → suspended (rejected)
See Brief §7 for the complete approval flow.

---

## 17. Faction System Rules

Factions are fully admin-editable via the faction manager in the admin panel (TWH-2.6). Name, slug, color_hex, description, lore, leader_title, and display_order are all configurable. The three factions were seeded in Migration 010 as starting placeholders — they are not hardcoded.

### Multiple Leaders
Each faction supports multiple leaders simultaneously. Leaders are assigned via user_roles with scope_id = faction_id and the faction_leader role. No single-leader constraint — grant to as many users as needed.

### Leader Titles
The display name for a faction's leadership tier is stored in factions.leader_title (text, default 'Keeper'). This is faction-configurable. Always read leader_title from the factions row when displaying leadership in the UI. Never hardcode a leadership title in component code.

### Faction Colors
The faction color must appear consistently everywhere:
- Diamond pip in IC post headers and online lists
- Left-border accent on faction-scoped panels
- Fill color on faction badges and character cards
- data-faction CSS attribute for scoped theming

Covenant = var(--gold) / #e0b028
Cabal    = var(--ember) / #c83818
Unbound  = var(--moonstone) / #3878a8

These hex values are fixed brand colors. Do not invent alternatives.

### Faction Boards
Faction boards use scope = 'faction' and scope_id = faction_id. RLS enforces that only users with an active character in that faction can read and write. Each faction has its own set of private boards. The site-wide RP also has common location boards (scope = 'rp', no scope_id) accessible to all authenticated users, and faction-only location boards (scope = 'faction') visible only to that faction's members.

---

## 18. Outstanding Rules Queue

*This section accumulates rules discovered during builds that don't yet fit a category. Promoted to a numbered section on each document update.*

No items currently queued. All prior items have been promoted to numbered sections (see §21 and version history).

---

## 19. Tailwind v4 / Turbopack Platform Rules

These rules apply for the lifetime of this project.

### Google Fonts — Use `<link>` tags, not CSS `@import`

Tailwind v4 + Turbopack inline CSS at build time. A CSS `@import url(...)` for Google Fonts is invalid — it lands after real CSS rules and is silently ignored.

**Correct pattern** (in `app/layout.tsx`):
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Cormorant+Upright:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cinzel:wght@400;500;600&display=swap"
/>
```

### `@theme` block — static values only

The `@theme` block in `globals.css` MUST contain static hex values. `var()` references inside `@theme` cause runtime 404s even when the build succeeds. This is a confirmed production failure mode discovered in TWH-1.4.

### No tailwind.config.ts

This project uses `postcss.config.mjs` with `@tailwindcss/postcss`. There is no `tailwind.config.ts`. Do not create one.

### Next.js version

This project runs **Next.js 16.2.9**. Do not downgrade.

---

## 20. Vercel Platform Rules

### Framework Preset — MUST be set manually

When creating any new Vercel project, **always manually set the Framework Preset to Next.js** in Settings → General → Framework Preset. Vercel does not reliably auto-detect Next.js 16. Failure to set this causes all routes to return 404 regardless of code correctness. This was the root cause of hours of lost time on this project.

**Verification:** After creating a new Vercel project, immediately confirm the framework preset is set before pushing any code.

### proxy.ts — Next.js 16 middleware convention

Next.js 16 uses `proxy.ts` at the project root with `export async function proxy()`.
The build log confirms: *"The middleware file convention is deprecated. Please use proxy instead."*
Do NOT use `middleware.ts` or `export function middleware()` — this causes `MIDDLEWARE_INVOCATION_FAILED` at runtime.

### Environment variables

All six env vars must be set in Vercel → Settings → Environment Variables AND in local `.env.local`. Adding vars to Vercel requires a redeploy to take effect. Use `npx vercel --prod --force` for a guaranteed fresh build with no cache.

### Build cache issues

If a deployment shows `[0ms]` build time, it served from cache and may not have the latest env vars or code. Force a fresh build with `npx vercel --prod --force`.

### Do not use Claude in Chrome for verification

All visual verification is done manually by the operator. Claude Code must not open a browser or use Claude in Chrome for any verification step. This wastes tokens and is explicitly prohibited.

---

## 21. Promoted Rules from Phase 1 and Phase 2 Builds

These rules were discovered during builds and are now standing rules.

### R1 — Discriminated Union Narrowing in Server Actions
When a Server Action returns a discriminated union (e.g. `{ error: string } | { success: true }`), client code must narrow with `'error' in result`, not `result?.error`. TypeScript correctly rejects the latter on the success branch. Confirmed in TWH-1.5 and used throughout all Phase 2 admin actions.

### R2 — next/image Requires remotePatterns Config
`<Image>` from next/image cannot load Supabase Storage URLs without adding `vkhuttcusqubteseifui.supabase.co` to `images.remotePatterns` in next.config. Until that config exists, use `<img>` with the `no-img-element` ESLint disable comment. Applies everywhere avatars and character portraits are displayed. Address when avatar upload is built in Phase 4.

### R3 — Body Gradient Is Blood Moon-Hardcoded
The ambient radial gradients in the body rule in globals.css use hardcoded rgba values rather than CSS variables. They do not shift with theme. Low visual impact. Fix in a future polish pass.

### R4 — --dot-* CSS Variables Are Orphaned
The `--dot-charmed`, `--dot-buffy` etc. variables are defined in `:root` but nothing references them — the Masthead ribbon uses hex from `lib/canons.ts`. They may become useful when forum pages display canon badges. No action needed now.

### R5 — Orphaned --swatch-* Variable in globals.css
One `--swatch-` prefixed CSS variable remains in `:root` from a removed theme. Harmless. Remove in the next globals.css pass (grep `--swatch-` to locate it).

### R6 — Logo PNG Is Oversized
`public/witchinghourlogo.png` is 834KB for a 38–52px display element. Resize to ~76×76px @2x and compress in a future assets pass. Not blocking.

### R7 — Stub Functions for Forward-Referenced RLS Policies
When a migration creates RLS policies that call a Postgres function not yet defined, include a stub `CREATE OR REPLACE FUNCTION` returning a safe default (`SELECT false`) in that same migration. The real implementation replaces it via `CREATE OR REPLACE FUNCTION` in the migration where its dependency tables exist.

Confirmed failure mode: Migration 007 RLS policies referenced `is_admin()` before Migration 010 defined it. Postgres validates function existence at `CREATE POLICY` time — the spec assumption that resolution is deferred was incorrect. The stub pattern prevents `ERROR: 42883: function does not exist` at policy creation time.

### R8 — Notifications and Economy Writes Use Admin Client
`createNotification()` always uses `getAdminClient()`. XP award actions always use `getAdminClient()`. Essence award and deduction actions always use `getAdminClient()`. These are system writes — they bypass user RLS by design. Never route them through the cookie-aware server client. Confirmed in TWH-2.2 Q1 and Q2.

### R9 — Character Relationships Are One-Sided Until Mutual
The `character_relationships` SELECT policy checks only the initiating `character_id`. A relationship is only visible to both sides once `is_mutual = true`. The target character owner receives a notification to acknowledge the relationship, which flips `is_mutual`. This is confirmed intentional design — do not change the policy to expose unacknowledged relationships to the target.

### R10 — revalidateTag Requires Two Arguments in Next.js 16
Next.js 16.2.9 requires:
```ts
revalidateTag(tag, {})
```
The second argument (empty CacheLifeConfig object) is non-optional in this version. Single-argument calls cause a TypeScript error. All revalidateTag calls in this codebase use the two-argument form. Confirmed in TWH-2.6 build.

### R11 — getServerClient() Must Be Awaited
`getServerClient()` calls `await cookies()` internally and is declared async. Calling it without await returns a Promise, not the client. Always:
```ts
const supabase = await getServerClient()
```
Confirmed failure mode: TWH-2.7b spec pseudocode omitted await — Claude Code correctly added it.

### R12 — PostgREST FK Join Boundary at auth.users
PostgREST's embedded select only traverses FKs within the public schema. Any table with a FK to `auth.users` (not `public.users`) cannot use the alias join syntax to retrieve `display_name` or other `public.users` fields. The alias syntax silently returns null.

Correct pattern: two-query approach.
```ts
// Step 1: fetch rows with reviewer_id
const { data: revisions } = await admin
  .from('character_revisions')
  .select('id, reviewer_id, ...')
  .eq('character_id', characterId)

// Step 2: batch-fetch display names from public.users
const reviewerIds = revisions.map(r => r.reviewer_id)
  .filter(Boolean)
const { data: reviewers } = await admin
  .from('users')
  .select('id, display_name')
  .in('id', reviewerIds)
```

Applies to: `character_revisions.reviewer_id`, any other table with FK to `auth.users` where display data is needed. Confirmed in TWH-2.7b D1 deviation.

### R13 — ESLint no-page-custom-font Disabled Globally
The `@next/next/no-page-custom-font` ESLint rule is disabled in `eslint.config.mjs`. Google Fonts are loaded via `<link>` tags in `app/layout.tsx` by design (Tailwind v4 + Turbopack constraint — see §19). This is a permanent project-wide decision. Do not re-enable this rule.

### R14 — CSS Variable --f-head, Not --f-heading
The font variable for headings in this codebase is `var(--f-head)`. The name `var(--f-heading)` does not exist and silently falls back to the body font. If `--f-heading` appears anywhere in a code review or build, it is a bug. Use grep to find and replace before any push.

### R15 — window.location.href for Post-Action Navigation in Client Components
In Client Components where a Server Action modifies data that affects the Server Component above it (e.g. the approval queue list), use `window.location.href = '/path'` for post-success navigation rather than `router.push()`. `router.push()` may not trigger a full Server Component re-render in all cases. The hard navigate ensures the page refetches live data. Confirmed pattern: `CharacterReviewPanel.tsx` (TWH-2.7b).

### R16 — characters Table Has No updated_at Column
The `characters` table (Migration 011) does not have an `updated_at` column. Any query or sort that references `characters.updated_at` will produce a PostgREST runtime error. Use `created_at` as the fallback sort column. Add `updated_at` to `characters` in Phase 4 when character creation is built — it is needed for "last updated" display and for the needs_revision queue sort.

---

## 22. Essence and Economy Rules

### Two Currencies — Never Conflate Them
- **XP** — character-level, earned only, permanent. Tracks a character's growth and drives levelling. Never deducted, never spent. Stored on the `characters` table.
- **Essence** — account-level, earned and spent. The site's reward currency. Pools across all of a user's characters. Stored on the `users` table as `essence integer default 0`.

### Essence Deduction Pattern
Always atomic — never read then subtract:

```sql
UPDATE users
SET essence = essence - $cost
WHERE id = $user_id AND essence >= $cost
RETURNING id
```

If no row is returned: insufficient Essence. Reject with a clear error. Never proceed with the purchase.

### Essence Log
Every Essence credit and debit must be recorded in `essence_log` (`user_id`, `amount`, `reason`, `awarded_by` nullable, `created_at`). Amount is positive for credits, negative for debits. Always write the log row alongside any essence UPDATE. Log failures are console.error'd server-side but do not block the action — the Essence change already landed.

### The Offering Cooldown
Per-user Offering cooldown is enforced via `users.last_offering_at` (timestamptz nullable). Before processing an Offering, check:

```sql
last_offering_at IS NULL
OR last_offering_at < now() - (cooldown_hours || ' hours')::interval
```

where `cooldown_hours` comes from the `offering_cooldown_hours` site_setting. Never rely on client-side time for cooldown enforcement.

### Apothecary Purchases Are Character-Assigned
Although Essence is account-level, Apothecary purchases are assigned to a specific character (`character_id` FK on `apothecary_purchases`). When a user makes a purchase, they must select which of their active characters receives the item. The Essence deduction happens at the user level; the item grant happens at the character level.

### Admin Client for All Economy Writes
Essence award, Essence deduction, XP award, Offering resolution, and Apothecary purchase writes all use `getAdminClient()`. These are system-level or game-mechanic writes — they must not be blocked by user RLS.

### Postgres Economy Functions
Two SECURITY DEFINER functions handle atomic economy writes (created in Migration 021a):

`increment_user_essence(p_user_id uuid, p_amount integer)`
→ Returns new essence balance. Used by `grantEssence()` in `lib/actions/admin-players.ts`.

`award_character_xp(p_character_id uuid, p_amount integer)`
→ Returns new xp total. Used by `awardXp()` in `lib/actions/admin-players.ts`.
→ Level-up detection deferred to Phase 4.

---

## 23. Chronicles System Rules

Chronicles are Phase 14+ features. These rules are established now so they are available when building begins. Do not build Chronicles features in earlier phases — flag as out of scope and add as Q-item.

### Keeper Role
The keeper role is scoped to `chronicle_id` via `scope_id` in `user_roles`. Multiple Keepers per Chronicle are supported. Keepers hold the `manage_chronicle` permission scoped to their Chronicle only. Admins hold `manage_chronicle` on all Chronicles.

### Character-Based Membership
Users join Chronicles as specific characters, not as themselves. A user may have characters in multiple Chronicles simultaneously. Chronicle character limits are set per Chronicle (`max_characters_per_user` on the `chronicles` table, nullable — null inherits the site-wide `site_settings` value).

### Approval Gate for Chronicles
The same status lifecycle applies to Chronicle characters as to site-wide characters: pending → needs_revision → pending (loop) → active / suspended. The `character_revisions` table records each round of Keeper feedback. Only characters with `status = 'active'` in a Chronicle appear in that Chronicle's member roster and can post to Chronicle boards.

### Chronicle Boards
When Chronicles are built, `'chronicle'` is added to the `boards.scope` CHECK constraint. Chronicle boards use `scope = 'chronicle'` and `scope_id = chronicle_id`. RLS enforces that only active Chronicle members can read and write Chronicle boards.

Note: `'chronicle'` is already forward-declared in the `boards.scope` CHECK constraint (Migration 017). No migration needed when Chronicle boards are built — just use `scope = 'chronicle'` directly.

### Do Not Build Chronicle Features Early
No Chronicle tables, pages, or actions belong in Phases 1–13. If a build prompt appears to require Chronicle infrastructure, stop and flag it.

---

## 24. Admin Role System Rules

### Two-Tier Admin Model
There are two administrative tiers:

**Super Admin** — full control. `is_permanent = true`. Assigned via `user_roles` with role name `'super_admin'`. Can grant/revoke all roles including other Super Admins and the admin badge. Cannot be banned. `is_admin()` Postgres function returns true.

**Admin (badge)** — cosmetic only. Grants no permissions on its own. Shows "Administrator" on profile. Combined with functional admin roles to unlock specific panel sections.

### Functional Admin Roles (invisible)
Eight invisible roles (`is_invisible = true`) each unlock one admin panel section when granted alongside the admin badge:

```
character_manager → approve_characters, award_xp
faction_manager   → manage_factions
board_manager     → manage_boards
events_manager    → manage_events
apothecary_manager→ manage_apothecary
settings_manager  → manage_site, manage_waitlist
player_manager    → manage_users, award_xp
ban_manager       → ban_users
```

### ADMIN_TIER_ROLES Constant
The constant `ADMIN_TIER_ROLES` in `lib/actions/admin-roles.ts` defines which roles require the `manage_admins` permission to grant or revoke:

```ts
['admin', 'super_admin', 'character_manager',
 'faction_manager', 'board_manager', 'events_manager',
 'apothecary_manager', 'settings_manager',
 'player_manager', 'ban_manager']
```

This check is enforced server-side in `grantRole()` and `revokeRole()`. Never gate admin-tier role changes on client-side permission checks alone.

### is_admin() Postgres Function
The `is_admin()` SECURITY DEFINER function checks for EITHER `'admin'` OR `'super_admin'` role name:

```sql
SELECT EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'super_admin')
)
```

Both roles satisfy RLS `is_admin()` checks. Updated in Migration 019.

### Permanent Roles Cannot Be Revoked
Roles with `is_permanent = true` (admin badge, super_admin) cannot be revoked via `revokeRole()`. The action checks `is_permanent` before deleting the `user_roles` row and returns an error if true. This prevents accidental lockout.

### Ban Protections
Super Admin accounts cannot be banned. The `banUser()` action calls `isSuperAdmin(targetUserId)` before proceeding — if true, returns an error. A user also cannot ban themselves.

---

## 25. Forum and Thread System Rules

### board_threads.updated_at Is Trigger-Maintained
The `board_threads.updated_at` column is updated automatically by the `trg_board_posts_update_thread` trigger (created in Migration 017). This trigger fires AFTER INSERT on `board_posts` and sets `updated_at = now()` on the parent thread.

Do not update `board_threads.updated_at` manually in application code — the trigger handles it. Any code path that creates a `board_post` will automatically refresh the parent thread's `updated_at`.

This column is the signal used for:
- Last-activity sorting on thread lists
- Turn-state detection in the My Threads tracker (compare `board_threads.updated_at` to `thread_reads.last_read_at` for the current user)

### thread_reads Upsert Pattern
The `thread_reads` table tracks the last time a user opened a thread. Updated on every thread view via `markThreadRead()` in `lib/actions/forums.ts` (Phase 3 implementation).

`markThreadRead()` must use `getAdminClient()` — the `thread_reads` table has INSERT and UPDATE policies for the owning user, but the upsert pattern (`INSERT ... ON CONFLICT DO UPDATE`) resolves more reliably via the admin client. Confirmed in TWH-2.4b build report.

### getCachedPublicBoards vs Live Board Fetch
`getCachedPublicBoards()` (`lib/cached-settings.ts`, `'boards'` tag, 5-min TTL) returns only public and rp scoped boards. Use it for the forum index and any globally-visible board list.

Faction, staff, admin, and chronicle boards are always fetched live with RLS — their visibility varies per user and cannot safely be cached globally.

Every admin mutation that creates, edits, or deletes a board must call `revalidateTag('boards', {})` alongside any `revalidatePath` calls.

### min_level_required Is Application-Layer Only
The `boards.min_level_required` column is enforced at the application layer, not in RLS. Boards with a minimum level appear in board lists for all users but show a "your character hasn't unlocked this location yet" message to under-level characters. This keeps RLS simple while still communicating the gate clearly.

### Board Scope 'chronicle' Is Forward-Declared
The `'chronicle'` value is already present in the `boards.scope` CHECK constraint (Migration 017). When Chronicle boards are built in Phase 14, no migration is needed to alter the CHECK constraint — just use `scope = 'chronicle'` directly.

---

*Last updated: June 2026 — v1.6 (Phase 2 complete — TWH-2.1 through TWH-2.7b: roles, super admin model, character approval revision loop, Essence economy, forum schema, all Phase 1 and Phase 2 lessons incorporated)*
*Version history: v1 → v1.1 (§19 Google Fonts + Next.js version) → v1.2 (table rename, email confirmation) → v1.3 (clean slate: proxy.ts, @theme, Vercel framework preset, lint commands) → v1.4 (Phase 1 complete: §15 canon expansion, §17 faction migration number, §18 outstanding rules from Phase 1 builds) → v1.5 (planned but never applied to disk — all content incorporated into v1.6) → v1.6 (Phase 2 complete: §16 approval gate + status expansion, §17 faction rewrite, §18 queue cleared, §21 R1–R16 all Phase 1 and Phase 2 rules, §22 Essence economy, §23 Chronicles rules, §24 admin role system, §25 forum and thread rules)*
*This document must be updated whenever a new standing rule is agreed upon.*
*Cross-reference: TWH_BRIEF_v1.md*
