# The Witching Hour — Master Project Brief
### Comprehensive Build Document v1.7 — Complete & Authoritative
### Created: June 2026 | Last Updated: June 2026

---

## 1. What This Is

**The Witching Hour** is a fan community and roleplay hub for the tradition of late-90s and early-2000s supernatural television — built with Charmed as its soul and heart, extending to Buffy the Vampire Slayer, Angel, and supporting canons including The Secret Circle, The Craft, Witches of East End, and Practical Magic.

The site recreates and modernises the early-2000s fansite experience of communities like Charmed Boards and Charmed: The Prophecy — specifically their deeply customised forum + roleplay hybrid format — rebuilt from scratch on a modern stack.

**Primary pillars:**
- Community forums with multi-show discussion, organised by canon
- Post-by-post collaborative roleplay with in-character (IC) posting
- Character sub-profiles linked to user accounts, with faction affiliation, powers, XP, and levelling
- Sub-RP spaces called Chronicles — discrete collaborative stories with their own character rosters, Keeper leadership, membership approval, and private boards
- A rewatch club with live watch party events
- A lore compendium (The Grimoire) covering powers, demons, locations, and mythology

This is a fully custom build. No CMS. No game engine. Built from scratch.

**Domain:** `atwitchinghour.com` (primary) +
`atwitchinghour.net` (redirect to .com)
Domain purchased and connected via Vercel. Live and
verified.
Vercel preview URL: `https://the-witching-hour.vercel.app`
(still active for preview deploys)

**Landing page copy (confirmed):**
- Hero line: *"The Witching Hour is upon us."* — "The Witching Hour" in Cormorant Upright weight 600 gold, "is upon us." in weight 300 roseash — one continuous line
- Tagline: *"For those who never stopped believing in magic."* — EB Garamond italic
- Primary CTA: "Enter the Circle" → /register
- Secondary CTA: "I already belong" → /login

---

## 2. Tech Stack

- **Framework:** Next.js 16.2.9 (App Router, TypeScript throughout)
  Installed via `create-next-app@latest` — v16 not v14. All App Router patterns
  in this Brief (`unstable_cache`, `cookies()`, Server Actions, Realtime) work
  identically on v16. Do not pin to 14.
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password, sessions, email confirmation required)
  Confirmation email sent via Resend. User lands on "Check your email" page after
  registration. Welcome Council Notice fires after confirmation, not on sign-up.
- **Realtime:** Supabase Realtime (live chat, notifications, online presence)
- **File Storage:** Supabase Storage (avatars, character-portraits, theme assets)
- **Image Processing:** sharp (server-side, lossless PNG processing for all image uploads)
- **Styling:** Tailwind CSS v4 (CSS-first configuration — no tailwind.config.ts)
  Tailwind v4 uses `postcss.config.mjs` with `@tailwindcss/postcss`. There is no
  `tailwind.config.ts` in this project — do not create one.
  The `@theme` block in `globals.css` MUST use static hex values only.
  `var()` references inside `@theme` are NOT supported and cause runtime 404s
  even when the build succeeds. This is a confirmed critical failure mode.
  See §4 for the correct globals.css structure.
- **Rich Text Editor:** Tiptap (@tiptap/react, @tiptap/starter-kit, extensions)
  Used in: forum posts, Grimoire entries, character bios, Whispers composition
  Custom extension: spoiler tags (click-to-reveal)
  Output: HTML stored in database, rendered via DOMPurify-sanitized display
- **HTML Sanitization:** DOMPurify — sanitizes all HTML before rendering to users
- **Email:** Resend (transactional email, welcome emails)
  **Rate limit (free tier): 5 req/s** — bulk sends MUST use `resend.batch.send([...])`, never individual `resend.emails.send()` in a loop
- **Deployment:** Vercel (free Hobby tier, auto-deploys on GitHub push)
  **Critical Vercel constraint:** 4.5MB Serverless Function body limit on Hobby plan.
  Admin image uploads MUST use the P-DC (direct browser upload) pattern — see §19.
  Never route large file uploads through Server Actions on Hobby plan.

### Required Environment Variables
All six must be present in `.env.local` locally AND in Vercel Environment Variables
for production. The site will fail silently or 404 if any are missing.

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL

NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key

SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (never expose client-side)

RESEND_API_KEY=                  # Resend API key for transactional email

RESEND_AUDIENCE_ID=              # Resend audience ID for waitlist contacts

NEXT_PUBLIC_SITE_URL=            # Full site URL (https://atwitchinghour.com in production)
```

**Pre-deploy checklist:** Before any Vercel deployment, confirm all five variables
are set in Vercel → Settings → Environment Variables. A missing env var will not
cause a build failure but WILL cause runtime 404s or auth failures.

### Supabase Configuration (Dashboard)
Authentication → URL Configuration:
- Site URL: `https://atwitchinghour.com` (live and configured)
- Redirect URLs: `https://atwitchinghour.com/auth/callback`
  Also add: `http://localhost:3000/auth/callback` for local dev
  Also add: `https://the-witching-hour.vercel.app/auth/callback` for Vercel preview

### Supabase Storage Buckets (all public)
- `avatars` — user account profile images
  (uploaded via P-DC pattern, public read)
- `character-portraits` — RP character portrait images
  (uploaded via P-DC, public read)
- `rich-text-images` — admin-uploaded assets including
  board icons and future rich text editor images (public read)

Note: board icons use path pattern:
  `board-icons/{boardId}-{timestamp}.{ext}`
---

## 3. Canons & Show Hierarchy

TWH is a comprehensive hub for witch-focused media.
Charmed is the soul and RP anchor; all other canons
extend from it. Two tiers — primary canons receive full
forum wings and RP support; secondary canons have
subforum presence and character support.

Canon data is centralised in `lib/canons.ts` — a single
source of truth for all UI canon lists, ribbons, and
dropdowns. Do not hardcode canon lists in components.

### Primary Canons (7)
Full forum wings, RP support, show ribbon colour-coded.
Always listed in this order.

| Show | Display Label | Ribbon Hex | db value |
|---|---|---|---|
| Charmed | Charmed | `#e0b028` | `charmed` |
| Buffy the Vampire Slayer + Angel | Buffy & Angel | `#3878a8` | `buffy` / `angel` |
| The Craft | The Craft | `#4a7c59` | `the_craft` |
| Practical Magic | Practical Magic | `#9a7090` | `practical_magic` |
| AHS: Coven | AHS: Coven | `#a8a0b8` | `ahs_coven` |
| Chilling Adventures of Sabrina | Chilling Adventures | `#6030a0` | `chilling_adventures` |
| The Secret Circle | The Secret Circle | `#7a6080` | `secret_circle` |

**Buffy & Angel display note:** Buffy the Vampire Slayer
and Angel are displayed as a single combined entry
"Buffy & Angel" in all UI ribbons and dropdowns. The
database keeps `buffy` and `angel` as separate values —
threads, posts, and characters can be tagged with either.
Where a single value is required (e.g. waitlist canon
preference), `buffy` is used for the combined entry.

### Secondary Canons (4)
Subforum presence, character support, lighter ribbon
treatment.

| Show | Display Label | Ribbon Hex | db value |
|---|---|---|---|
| Witches of East End | Witches of East End | `#806040` | `witches_of_east_end` |
| Motherland: Fort Salem | Motherland: Fort Salem | `#706880` | `motherland_fort_salem` |
| A Discovery of Witches | A Discovery of Witches | `#507060` | `discovery_of_witches` |
| Sabrina the Teenage Witch (90s) | Sabrina (90s) | `#806870` | `sabrina_90s` |

### Canon source field values (used throughout the database)
All valid `canon_source` strings — exact, case-sensitive,
no spaces:

**Primary:** `'charmed'` `'buffy'` `'angel'` `'the_craft'`
`'practical_magic'` `'ahs_coven'` `'chilling_adventures'`
`'secret_circle'`

**Secondary:** `'witches_of_east_end'`
`'motherland_fort_salem'` `'discovery_of_witches'`
`'sabrina_90s'`

**System:** `'original'` `'all'`

The value `'original'` is used for characters and content
not tied to any specific show. The value `'all'` is used
for cross-canon content (events, site-wide threads).

CHECK constraints on all `canon_source` columns must
include all 14 show values plus `'original'` and `'all'`.

---

## 4. Design System — Blood Moon (Default Theme)

The default theme is **Blood Moon**. All UI is built to this palette first. Other themes are applied as CSS variable overrides (see §8 Multi-Theme Engine).

### The Six Hero Colors

| Name | Hex | Role |
|---|---|---|
| Char (base) | `#100808` | Page background — near-black with red undertone |
| Deep Claret (surface) | `#301010` | Cards, panels, nav surfaces |
| Rose Ash (light) | `#f0d4c0` | Primary text — warm, not pure white |
| Ember (primary accent) | `#c83818` | Links, The Underworld faction, CTA buttons, unread indicators |
| Harvest Gold (secondary) | `#e0b028` | Covenant faction, active states, XP bars, gold trim |
| Moonstone (tertiary) | `#3878a8` | The Wayward faction, success states, Buffy canon tag, cool contrast |

### Extended / Derived Tones

| Name | Hex | Role |
|---|---|---|
| Raised | `#1e0c0c` | Between char and claret — hover states, inset boxes |
| Elevated | `#3e1818` | Dropdowns, modals, active surfaces |
| Mist | `#b89080` | Secondary text — warm sepia |
| Faded | `#6a4838` | Muted text, timestamps, placeholders |
| Ember light | `#e06030` | Hover on ember |
| Ember dim | `#7a2010` | Borders using ember colour at low opacity |
| Gold light | `#f0c840` | Hover on gold |
| Gold dim | `#8a6818` | Borders using gold colour |
| Moon light | `#58a8d0` | Hover on moonstone |
| Moon dim | `#1a4870` | Borders using moonstone colour |

### Faction Color Mapping

| Faction | Color | Hex | Light variant | Fill |
|---|---|---|---|---|
| The Covenant | Harvest Gold | `#e0b028` | `#f0c840` | `rgba(224,176,40,0.12)` |
| The Underworld | Ember | `#c83818` | `#e06030` | `rgba(200,56,24,0.12)` |
| The Wayward | Moonstone | `#3878a8` | `#58a8d0` | `rgba(56,120,168,0.12)` |

Members of The Wayward are called Wanderers. CSS internal variable names (--cab-fill, --unb-fill, etc.) are implementation artifacts only and do not reflect the current faction names.

**Faction diamond pip:** A small square rotated 45° in the faction color. Used in post headers, online lists, character badges, nav indicators throughout.

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | Cormorant Upright (wght 300–600) | Site logo, page headings, character names, hero text |
| Heading | Playfair Display (ital + wght 400–700) | Card titles, section headings, thread titles |
| UI Labels | Cinzel (wght 400–600) | Nav links, category labels, panel headers, ALL CAPS UI elements |
| Body | EB Garamond (ital + wght 400–600) | All body text, post content, descriptions, metadata |

**Import via Google Fonts:**
```
https://fonts.googleapis.com/css2?family=Cormorant+Upright:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cinzel:wght@400;500;600&display=swap
```

### CSS Variable Naming Convention & globals.css Structure

All design tokens are declared as CSS custom properties on `:root`. Theme switching
works by applying a `data-theme` attribute to `<body>` which overrides these variables
via `[data-theme="name"]` blocks in `globals.css`.

**CRITICAL — `@theme` block rules:**
The `@theme` block in `globals.css` is used to generate Tailwind utility classes
(`text-ember`, `bg-claret`, etc.). It MUST use static hex values — never `var()`
references. Using `var()` inside `@theme` causes runtime 404s even though the
build succeeds. This is a confirmed production failure mode.

```css
/* CORRECT — static hex values in @theme */
@theme {
  --color-ember: #c83818;
  --color-gold:  #e0b028;
  --font-cormorant: 'Cormorant Upright', serif;
}

/* WRONG — var() references in @theme cause runtime 404s */
@theme {
  --color-ember: var(--ember); /* DO NOT DO THIS */
}
```

**Consequence of this rule:** Tailwind utility classes (`text-ember`, `bg-claret`)
will always reflect Blood Moon colors regardless of active theme. They are static.
Theme switching works correctly via CSS variables and inline `style` props using
`var(--token)` — not via Tailwind utility classes. All components use inline styles
for theme-sensitive colors.

**Opacity modifier limitation:** Tailwind v4 opacity modifiers (`text-ember/50`)
do NOT work with CSS variable-backed colors. Use inline styles for alpha variants.

```css
:root {
  /* Six hero colors */
  --char:        #100808;
  --claret:      #301010;
  --roseash:     #f0d4c0;
  --ember:       #c83818;
  --gold:        #e0b028;
  --moonstone:   #3878a8;
  /* Extended tones */
  --raised:      #1e0c0c;
  --elevated:    #3e1818;
  --mist:        #b89080;
  --faded:       #6a4838;
  --ember-light: #e06030;
  --ember-dim:   #7a2010;
  --gold-light:  #f0c840;
  --gold-dim:    #8a6818;
  --moon-light:  #58a8d0;
  --moon-dim:    #1a4870;
  /* Faction fills */
  --cov-fill:    rgba(224,176,40,0.12);
  --cab-fill:    rgba(200,56,24,0.12);
  --unb-fill:    rgba(56,120,168,0.12);
  --cov-border:  rgba(224,176,40,0.35);
  --cab-border:  rgba(200,56,24,0.35);
  --unb-border:  rgba(56,120,168,0.35);
  /* Alpha / glow tokens */
  --ember-glow:  rgba(200,56,24,0.15);
  --gold-glow:   rgba(224,176,40,0.12);
  --moon-glow:   rgba(56,120,168,0.10);
  --masthead-bg: rgba(48,16,16,0.92);
}
```

### Signature Visual Elements

- **Blood moon logo mark:** Crescent formed by two overlapping circles, pentacle inscribed in the visible sliver, cardinal tick marks in gold at compass points
- **Body ambient glow:** Three radial gradients — ember bleeding from top-left, gold from mid-right, moonstone rising from bottom-center
- **Faction diamond pips:** 6×6px squares rotated 45°, glowing box-shadow in faction color at 50% opacity
- **Filigree dividers:** `ember → gold` gradient lines with diamond pips and ✦ star glyphs at center
- **Corner accent treatment:** L-shaped brackets (2px in faction/accent color) on event banners and featured panels
- **Pentacle watermark:** SVG pentacle at 4–8% opacity behind hero sections
- **Avatar rings:** Two concentric dashed rings rotating in opposite directions (ember inner, gold outer) around character/user avatars

---

## 5. Site Structure & Navigation

### Masthead (sticky, two elements)
1. **Top bar:** Logo mark + site title + nav links + user chip + action buttons
2. **Show ribbon:** Canon source strip below masthead — Charmed (gold), Buffy (moonstone), Angel (ember), supporting shows (muted), tagline right-aligned

### Primary Navigation Links
- Home (dashboard)
- Forums
- The Circle (RP hub)
- Grimoire (lore wiki)
- Rewatch
- Members

### Sidebar Personal Links
- Whispers (private messages — with unread badge)
- My Characters
- The Apothecary (Essence store)
- Bookmarks
- Edit Profile
- Settings

### Admin/Mod Links (conditional on role)
- Admin Panel (Admin only)
- Mod Panel (Moderator + Faction Leader)

---

## 6. Factions

Three factions. Characters choose a faction on creation. Factions are not strictly good/evil — moral complexity is intentional. Users can have characters in different factions.

Factions are fully admin-editable — name, slug, color_hex, description, lore, leader_title, and display_order are all configurable via the faction manager in the admin panel. The seed data in Migration 010 is a starting placeholder.

Each faction supports multiple leaders simultaneously. Leaders are assigned via user_roles with scope_id = faction_id and the faction_leader role. The display name for a faction's leadership tier is stored in factions.leader_title (default: 'Keeper') and is faction-configurable — examples: 'Elders' for a light-aligned faction, 'The Triad' for a dark-aligned faction. This title appears wherever faction leadership is displayed in the UI.

### The Covenant
- **Alignment:** Light-leaning, protective, structured
- **Color:** Harvest Gold (`#e0b028`)
- **Lore:** Practitioners of ancient protective magic and Wiccan tradition. Not purely good — bound by agreements, sometimes constrained by their own rules. Draw from: the Halliwells, Willow (reformed), white lighters.
- **Faction page accent:** Gold borders, warm candlelight atmosphere

### The Underworld
- **Alignment:** Dark-leaning, power-seeking, pragmatic
- **Color:** Ember (`#c83818`) — `var(--ember)`
- **Lore:** The dark faction. Power-seekers, demonologists, and those who reject the Covenant's restrictions.
- **Faction page accent:** Ember borders, deep claret atmosphere

### The Wayward
- **Alignment:** Neutral, chaotic, independent
- **Color:** Moonstone (`#3878a8`) — `var(--moonstone)`
- **Lore:** The neutral faction. Unaffiliated witches, rogues, and those who walk between worlds beholden to none. Members are called Wanderers.
- **Faction page accent:** Moonstone borders, cool midnight atmosphere

---

## 7. Character System

Characters are sub-profiles of user accounts. The maximum number of characters per user is admin-configurable via `site_settings` key `max_characters_per_user` (default value: `'5'`). Nothing in the application hardcodes a character limit — always read from site_settings.

### Character Fields
- `name` — character display name (shown in IC posts instead of username)
- `avatar_url` — character portrait (separate from user avatar)
- `bio` — Tiptap HTML, max ~1000 characters rendered
- `faction_id` — FK to factions (nullable — unaffiliated characters allowed)
- `canon_source` — which show this character is from, or 'original'
- `xp` — integer, accumulates from RP posts and admin awards
- `level` — integer 1–N, derived from xp vs character_level_thresholds
- `status` — `'pending'` (submitted, awaiting first review) | `'needs_revision'` (reviewer has requested changes) | `'active'` (approved) | `'suspended'` (removed from play)
- `is_npc` — boolean, admin-only set. NPC characters controlled by staff.

### Approval Flow
The character approval flow supports multiple rounds of feedback. This lifecycle applies to both site-wide characters and Chronicle characters.

1. User submits character (multi-step form: name → faction → bio → review). Status = 'pending'.
2. Notification fires to admin/Keeper approval queue.
3. Reviewer can: Approve, Reject, or Request Revision.
   - Approve: status → 'active'. Notification to user. Link: /characters/[id]
   - Reject: reason required. Status → 'suspended'. Notification to user with reason. Link: /my-characters. Character is not deleted — user can appeal via Whisper.
   - Request Revision: reviewer writes feedback. Status → 'needs_revision'. Notification to user with feedback text. Link: /my-characters
4. User receives feedback, edits the character, and resubmits. Status returns to 'pending'.
5. Steps 3–4 repeat as many times as needed.
6. On approval, status → 'active'. Character appears in user's IC character selector.

Each round of feedback and resubmission is recorded in character_revisions (reviewer_id, feedback, status_before, status_after, created_at).

Admin actions: approveCharacter(), rejectCharacter(), requestRevision() in lib/actions/admin-characters.ts. All use getAdminClient() and write a character_revisions row on every outcome.

### XP & Levelling
- XP accumulates per character (not per user)
- Sources: RP post submission (auto, admin-configurable amount), admin manual award, event multiplier bonus
- Level thresholds: stored in `character_level_thresholds` table (admin-adjustable)
- Level labels: Novice → Apprentice → Adept → Practitioner → Elder (admin-configurable)
- Level-up fires notification to user
- Each level unlocks powers (admin-configures what unlocks at each level)
- XP logged in `character_xp_log` (character_id, amount, reason, created_at)

### IC Posting Mode
- Designated RP boards have `is_rp_board = true`
- In RP boards, the post composer shows an IC/OOC toggle
- IC mode: user selects which of their active characters is posting
- Post renders with: character avatar, character name (large), faction diamond pip, canon source badge, "played by [username]" link in muted text
- OOC mode: normal post with user identity
- Toggle state persists in sessionStorage per board

---

## 8. Multi-Theme Engine

Six themes available. Blood Moon is the default. Theme
preference stored on the user's `users` row
(`theme_preference` text, default `'blood-moon'`).

Theme is applied via `data-theme` attribute on the
authenticated layout wrapper div. Each theme is a
CSS variable override block in `globals.css`. All
[data-theme] blocks are implemented and functional.
The theme switcher in the dashboard right sidebar
updates the DB via `updateTheme()` server action in
`lib/actions/settings.ts` and applies optimistically
to the DOM.

| Theme key | Name | Base feeling |
|---|---|---|
| `blood-moon` | Blood Moon | Char black, ember, harvest gold, moonstone — default |
| `silver-onyx` | Silver & Onyx | Pure onyx, graphite, moonlight, iris violet, dark garnet, tourmaline |
| `midnight-garden` | Midnight Garden | Teal-black, cold frost, true copper, damask rose, amethyst |
| `crimson-athenaeum` | Crimson Athenaeum | Void black, bordeaux, blush vellum, true crimson, antique gold, smoke blue |
| `blackthorn-parchment` | Blackthorn & Parchment | Mahogany, burnished brown, candlelit cream, aged claret, brass, muted sage |
| `the-craft-1996` | The Craft 1996 | Blue-black, deep iris, cool bone, electric violet, acid candle, true scarlet |

**Hero color sources:** All theme palettes are drawn
from `charmed-reborn-palette-sampler-v3.html` (stored
in repo root). Do not invent theme colors — always
reference the sampler.

**Admin theme lock:** A `forced_theme` column on the
`boards` table allows admin to override user preference
for specific boards/sections. Communicated to user:
"This area has its own atmosphere." User theme restores
on exit.

**Important:** The `data-theme` attribute is applied to
the layout wrapper div, NOT to `<body>`. All components
use `var(--token)` inline styles — Tailwind color
utilities are static (Blood Moon only) and do not
theme-switch.

---

## 9. Roles & Permissions

### Role Hierarchy (highest to lowest)
Super Admin (your account — full control, cannot be removed by regular Admins)
Admin (cosmetic badge — shows "Administrator" on profile, grants no permissions on its own)
── Functional Admin Roles (invisible — grant specific admin panel sections when combined with Admin badge):
   character_manager, faction_manager, board_manager, events_manager, apothecary_manager, settings_manager, player_manager, ban_manager
Moderator
Lore Keeper    (manages Grimoire wiki)
Faction Leader (scoped to faction_id)
Keeper         (leads a Chronicle, scoped to chronicle_id)
Founding Member (display/prestige — no mod permissions)
[Regular User]

### How Admin Appointments Work
Super Admin grants two things to an appointed admin:
1. The 'admin' badge role — cosmetic, shows "Administrator" on their profile
2. One or more invisible functional roles — each unlocks a specific admin panel section

Only Super Admin can grant or revoke admin-tier roles (admin, super_admin, or any functional admin role). This is enforced server-side in grantRole() via the ADMIN_TIER_ROLES constant in lib/actions/admin-roles.ts.

### Additive Permission Model
All permissions are additive across roles. System checks: does this user have ANY role granting permission X? The is_admin() Postgres function checks for EITHER 'admin' OR 'super_admin' role name.

### Full Permission List (18 permissions)
- `manage_site` — full site control (settings_manager)
- `manage_users` — view and modify user accounts (player_manager)
- `manage_roles` — view role matrix (super_admin only in practice via manage_admins gate)
- `manage_admins` — appoint/revoke admin badge and functional admin roles. Super Admin only.
- `manage_factions` — create/edit/delete factions (faction_manager)
- `moderate_boards` — delete/pin/lock posts across all boards (moderator)
- `moderate_own_board` — moderate a specific board (faction_leader scoped)
- `manage_lore` — create/edit/publish Grimoire entries (lore_keeper)
- `approve_characters` — review and approve character submissions (character_manager)
- `award_xp` — manually award XP to characters (character_manager, player_manager)
- `post_announcement` — post faction/site-wide announcements (moderator, faction_leader)
- `manage_faction` — manage a specific faction as faction leader (faction_leader scoped)
- `manage_boards` — create/configure forum boards (board_manager)
- `manage_events` — create/manage site events and rewatch events (events_manager)
- `manage_apothecary` — manage Apothecary listings and power catalog (apothecary_manager)
- `manage_waitlist` — view/export waitlist signups (settings_manager)
- `ban_users` — issue and remove IP bans (ban_manager)
- `manage_chronicle` — manage a Chronicle as Keeper, scoped to chronicle_id (Phase 14)

**Critical:** Permission column is `is_enabled` (boolean). NEVER `is_granted`. Hard rule.

---

## 10. Boards (Forum) System

### Board Scopes
- `public` — all logged-in users
- `faction` — characters with an active character in that faction (scope_id = faction_id)
- `rp` — RP boards (IC posting enabled, XP + Essence awarded on post)
- `staff` — admin/mod only
- `admin` — admin only
- `chronicle` — Chronicle members only (scope_id = chronicle_id). Forward-declared in CHECK constraint in Migration 017 — Chronicle boards built in Phase 14.

### Canon Source Tagging
Every thread has an optional `canon_source` field. Displayed as a colored badge matching the show ribbon. Used for filtering.

### Spoiler System
- Threads can be marked `is_spoiler = true` (creator or mod)
- Tiptap custom extension: `[spoiler]content[/spoiler]` renders as click-to-reveal
- Users with shows set to incomplete in their `watching_status` field see a spoiler warning

### RP-Specific Boards
- `is_rp_board = true` on the boards table enables IC mode
- XP auto-award fires on post submission in RP boards
- OOC sidebar available on all RP threads
- Admin can force a theme override per board via `forced_theme`

### Location Gating
The boards table includes min_level_required (integer nullable). Boards with a minimum level set are accessible only to characters meeting or exceeding that level. Enforced at the application layer (not RLS) — the board shows in the list with a "your character hasn't unlocked this location yet" message rather than being invisible.

### Board Display Order
The boards table includes display_order (integer default 0) for admin-controlled ordering within categories. Used by getCachedPublicBoards().

---

## 11. Whispers (Private Messaging)

Direct port of Wizard Mansion's Wizard Mail system. UI labels changed:
- "Wizard Mail" → "Whispers"
- "Mansion Notice" → "Council Notice"

Supports: player-to-player messages, system messages (admin-broadcast), gift attachments (not used at launch — infrastructure present), Realtime delivery.

System messages trigger the "Council Notice" sidebar indicator (glowing/pulsing).

---

## 12. The Apothecary (Essence Store)

The Apothecary is the site's reward store. Users spend Essence — the site's account-level spendable currency — to acquire items for their characters.

### Essence
Essence is an account-level currency (stored on the users table as essence integer default 0). It is distinct from XP:
- XP is character-level, earned only, permanent. It drives levelling and represents a character's growth.
- Essence is account-level, earned and spent. It pools across all of a user's characters, allowing faster accumulation for higher-priced items. The user then chooses which character receives the purchased boon.

Essence sources (admin-configurable amounts via site_settings):
- RP post submission (auto-award, same trigger as XP)
- Admin manual grant
- Event bonus multiplier
- Partial refund from The Offering (see below)

Essence is tracked in the essence_log table (user_id, amount, reason, awarded_by nullable, created_at). Deduction is atomic:
```sql
UPDATE users SET essence = essence - cost
WHERE id = $1 AND essence >= cost
RETURNING id
```
If no row returned: insufficient Essence — reject with error.

### Apothecary Listings
Three item types:
- Powers — added to a chosen character's power list; some require minimum character level (min_level_required)
- Cosmetics — avatar frames, title badges, profile accents applied to the user account or a chosen character
- Artifacts — RP-usable flavour items; no mechanical effect at launch

### The Offering
A ritual mechanic where users sacrifice a fixed amount of Essence (admin-configurable via site_settings key offering_cost, default '50') to "call the spirits" and receive a randomized Blessing — one item drawn from the eligible pool of Apothecary listings.

Offering behavior:
- Only listings with blessing_eligible = true enter the pool
- Draw is weighted by blessing_weight (integer, default 10; lower = rarer). Common cosmetics might be weight 50, rare powers weight 2.
- If the drawn item is already owned by the user (exists in apothecary_purchases for any of their characters), the spirits return a partial Essence refund (amount admin-configurable via offering_refund_amount site_setting, default '25'). The refund behavior is admin-configurable.
- Per-user cooldown: admin-configurable via offering_cooldown_hours site_setting (default '24'). Tracked via last_offering_at timestamptz on the users table.
- The Offering has its own page or prominent section within the Apothecary — it is a ritual moment, not a button.

---

## 13. The Grimoire (Lore Wiki)

Community-editable lore compendium. Categories: Powers, Demons, Locations, Spells, Creatures, Lore. Every entry tagged with `canon_source`. Revision history stored. Lore Keeper and Admin can publish/unpublish.

Full-text search indexed on title + body.

---

## 14. Rewatch Club

Scheduled episodes with RSVP. On event time: status transitions to 'live', a dedicated chat channel opens. After event: status = 'archived', discussion thread linked. Each event tied to a specific canon, season, and episode.

---

## 15. The Séance (Live Chat)

Direct port of Wizard Mansion's Whispering Chamber — all CHAT-1 through CHAT-3c features included:
- Message grouping (by author + time proximity)
- Typing indicator
- @-autocomplete (online-first, substring match, 8 results)
- Mention click (links to user profile)
- Block filter (bidirectional)
- Idle drop (5 min inactivity, scoped to chat container)
- Soft-delete (mod-only, renders placeholder)
- STRUCTURED MENTIONS DATA FLOW (enriched on insert + realtime, no runtime name-to-id lookup)

TWH additions:
- IC mode toggle (post as active character)
- Multiple channels: General, Covenant (faction-gated), Underworld (faction-gated), Wayward (faction-gated), Watch Party (temporary, per-event)

**Critical Realtime requirements (WM hard lessons):**
1. `REPLICA IDENTITY FULL` required on `chat_messages` for UPDATE events
2. Table must be in `supabase_realtime` publication
3. Both are required — neither alone is sufficient

---

## 16. Achievement Badges

Trigger types:
- `post_count` — fires on RP post count milestones (25, 100, 500, etc.)
- `event_participation` — fires on first event RSVP or participation
- `character_level` — fires on character level milestones
- `admin_grant` — manual staff award
- `founding_member` — granted to all characters created before `launch_date` site setting

Displayed as badge grid on character profiles.

---

## 17. Performance Architecture

**Caching system — `lib/cached-settings.ts`**
All globally-static server data is cached using Next.js `unstable_cache` with tag-based invalidation. Every cached function returns a plain array or object directly (NOT `{ data: [...] }`).

Cached functions and tags (to be extended as features are built):

| Function | Tag | TTL |
|---|---|---|
| `getCachedSiteSettings()` | `site-settings` | 5 min |
| `getCachedFactions()` | `factions` | 1 hr |
| `getCachedCharacterLevelThresholds()` | `level-thresholds` | 1 hr |
| `getCachedPublicBoards()` | `boards` | 5 min |
| `getActiveEvent()` | `active-event` | 5 min |
| `getCachedBoardTree()` | `board-tree` | 5 min |
| `getCachedFullBoardTree()` | `board-tree-admin` | 5 min |

**Critical integration rules:**
1. Before writing any new query against a cached table, check `lib/cached-settings.ts` first. If a cached version exists, use it.
2. Every admin mutation that modifies cached data MUST call `revalidateTag(tag)` alongside any `revalidatePath` calls.
3. Cached functions return plain arrays/objects. Switching from direct Supabase query to cached function requires removing `.data` access.
4. New globally-static admin data should be cached with tag-based invalidation.

### revalidateTag Call Signature (Next.js 16)
Next.js 16.2.9 requires two arguments:
  revalidateTag(tag, {})
The second argument (empty CacheLifeConfig object) is non-optional. Single-argument calls cause a TypeScript error. All revalidateTag calls in this codebase use the two-argument form. This is a confirmed Next.js 16 API change.

**Layout.tsx query structure:**
- 6-item parallel `Promise.all` — getCachedSiteSettings(), getUser(), getUserRow(), getUserPermissions(), getUnreadWhisperCount(), isSuperAdmin(). Never add sequential awaits outside this block.
- `browserSupabase` singleton — `lib/supabase/browserClient.ts` — all client Realtime subscriptions use this, never `createClient()` in a component
- getUserPermissions() and isSuperAdmin() are wrapped with React.cache() — duplicate calls within the same request tree are deduplicated automatically

**New cached functions (Phase 3+):**

`getCachedBoardTree()`
- File: `lib/cached-settings.ts` | Tag: `'board-tree'` | TTL: 5 minutes
- Scope: boards WHERE scope IN ('public', 'rp') only
- Returns: `BoardNode[]` — full hierarchy with children nested recursively
- Use for: public forum index, thread list breadcrumbs, thread list board data
- Never use for: admin board manager (use `getCachedFullBoardTree()` instead)

`getCachedFullBoardTree()`
- File: `lib/cached-settings.ts` | Tag: `'board-tree-admin'` | TTL: 5 minutes
- Scope: ALL boards, no scope filter
- Returns: `BoardNode[]`
- Use for: admin board manager ONLY
- CRITICAL: Never expose output to non-admin users. The manage_boards permission gate at the page level is the enforcement point. RLS is the DB backstop.

`invalidateBoards()` helper
- File: `lib/actions/admin-boards.ts`
- Must call ALL THREE tags on every board mutation:
  ```ts
  revalidateTag('board-tree', {})
  revalidateTag('boards', {})
  revalidateTag('board-tree-admin', {})
  ```
- Omitting any tag leaves a stale cache on the board manager or public forum index.

`getUnreadBoardIds(userId: string)`
- File: `lib/forums.ts` | NOT cached — per-user live query
- Returns: `Set<string>` of board_ids containing unread threads for userId
- Used by: forum index unread dots

---

## 18. Database Schema

### Table Naming Convention
**Critical — read before touching any table:**
- `users` — account-level profile. One row per registered user. Maps to `auth.users.id`.
- `characters` — RP character sub-profiles. Multiple per user (limit set in site_settings). FK to `users.id`.

These names are final and intentional. `users` is the person. `characters` are the personas they play. Never reverse this or use `characters` to mean the account profile.

### Core Tables

```sql
-- SITE CONFIGURATION
site_settings    — key (text PK), value (text), updated_at
```

### Site Settings Catalog

All values are stored as text. Numeric values must be `parseInt()`/`parseFloat()`. JSON values must be `JSON.parse()` before use (marked below).

**Core keys (Migrations 001, 020):**
- `site_name` — site display name
- `site_tagline` — tagline text
- `registration_open` — `'true'` = registration + login landing; `'false'` = waitlist + login (TWH-ADMIN.1)
- `max_characters_per_user` = `'5'` — max RP characters per user account
- `xp_per_rp_post` = `'10'` — XP awarded per approved RP post
- `maintenance_mode` — `'true'` redirects all non-admin traffic to /maintenance; 60-second cache in proxy.ts (TWH-ADMIN.2)
- `launch_date` — site launch date
- `offering_cost` = `'50'` — Essence cost for The Offering ritual
- `offering_refund_amount` = `'25'` — partial Essence refund if drawn item already owned
- `offering_cooldown_hours` = `'24'` — hours between Offering attempts per user

**Phase 3 + Combat System Seeds (Migration 025, 026a):**

Stat system:
- `stat_base_value` = `'1'` — base value for each stat at character creation
- `stat_creation_pool` = `'5'` — points available to distribute at character creation
- `stat_creation_cap` = `'3'` — max points from creation pool into any single stat
- `stat_points_per_level` = `'2'` — stat points awarded on level up
- `hp_per_vitality_point` = `'5'` — HP added per point of Vitality above base
- `defense_rating_base` = `'10'` — base Defense Rating before Ward modifier

Combat system:
- `xp_per_combat_win` = `'50'` — base XP awarded to winners
- `combat_turn_timeout_hours` = `'24'` — hours before turn auto-advances
- `combat_invite_expiry_hours` = `'48'` — hours before pending invitation expires
- `max_concurrent_combat_threads` = `'3'` — max active combat threads per user
- `combat_xp_level_scaling_min` = `'0.5'` — minimum XP multiplier (vs lower-level opponent)
- `combat_xp_level_scaling_max` = `'2.0'` — maximum XP multiplier (vs higher-level opponent)
- `combat_defeat_cooldown_hours` = `'24'` — cooldown before defeated character can initiate new combat

Post enchantments:
- `post_enchantment_types` = `'[JSON array]'` — array of `{emoji, label}` objects. **ALWAYS `JSON.parse()` before use.** Default: Enchanted ✨, Fierce 🔥, Dark 💀, Coven 💜, Power ⚡

Ascension system (all admin-configurable):
- `ascension_rite_label` = `'Ascension Rite'`
- `ascension_granted_label` = `'Ascension Granted'`
- `ascension_return_label` = `'Return to Practice'`
- `ascension_request_label` = `'Request Ascension Rite'`
- `ascension_chamber_label` = `'The Ascension Chamber'`
- `ascension_summons_label` = `'The Summoning'`
- `ascension_forfeit_label` = `'Withdrawal — Return to Practice'`

Thread system:
- `max_thread_title_length` = `'200'` — maximum thread title character length

```sql
-- USER ACCOUNTS (Supabase Auth handles auth.users)
users            — id (uuid PK = auth.users.id), display_name (text unique),
                   avatar_url (text nullable), bio (text nullable),
                   theme_preference (text default 'blood-moon'),
                   show_preference (text nullable),
                   watching_status (jsonb default '{}'),
                   active_character_id (uuid nullable FK characters.id),
                   essence (integer default 0),
                   last_offering_at (timestamptz nullable),
                   created_at (timestamptz default now())

-- SESSIONS / SECURITY
session_logs     — id (uuid), user_id (uuid FK auth.users), ip_address (text),
                   user_agent (text nullable), created_at
                   (rate-limited: one log per user+IP per hour)
ip_bans          — id (uuid), ip_address (text unique), reason (text nullable),
                   banned_by (uuid), created_at, expires_at (nullable)

-- ROLES & PERMISSIONS
roles            — id (uuid), name (text unique), display_name (text),
                   is_invisible (boolean default false),
                   is_permanent (boolean default false), created_at
role_permissions — id (uuid), role_id (uuid FK roles), permission_id (uuid FK permissions),
                   is_enabled (boolean default false),
                   UNIQUE (role_id, permission_id)
permissions      — id (uuid), name (text unique), description (text), created_at
user_roles       — id (uuid), user_id (uuid FK auth.users), role_id (uuid FK roles),
                   scope_id (uuid nullable — faction_id or board_id),
                   granted_by (uuid), granted_at (timestamptz)

-- FACTIONS
factions         — id (uuid), name (text unique), slug (text unique),
                   color_hex (text), description (text), lore (text HTML),
                   leader_user_id (uuid nullable FK auth.users),
                   leader_title (text default 'Keeper'),
                   display_order (integer default 0),
                   promotions_board_id (uuid FK boards nullable
                     — the Ascension Chamber board for this faction; set in faction manager),
                   ascension_chamber_label (text nullable
                     — override label for this faction's ascension chamber),
                   created_at

-- RP CHARACTERS
characters       — id (uuid), user_id (uuid FK users.id ON DELETE CASCADE),
                   name (text), avatar_url (text nullable),
                   bio (text nullable HTML),
                   faction_id (uuid nullable FK factions),
                   canon_source (text default 'original'),
                   xp (integer default 0), level (integer default 1),
                   status (text CHECK pending/needs_revision/active/suspended
                     default 'pending'),
                   is_npc (boolean default false),
                   vitality (integer default 1),
                   arcana (integer default 1),
                   intuition (integer default 1),
                   aura (integer default 1),
                   ward (integer default 1),
                   unspent_stat_points (integer default 0
                     — incremented on level up by stat_points_per_level; spent via UI),
                   pending_promotion (boolean default false
                     — true while Ascension Rite is in progress; prevents duplicate requests),
                   last_combat_defeat_at (timestamptz nullable
                     — enforces combat_defeat_cooldown_hours),
                   updated_at (timestamptz default now()
                     — maintained by trg_characters_updated_at trigger, Migration 025.
                     R16 RESOLVED.),
                   created_at (timestamptz)
                   -- Index: (user_id), (faction_id), (status)

character_level_thresholds — level (integer PK), xp_required (integer),
                   label (text), unlocks_description (text nullable),
                   max_hp (integer default 20
                     — base max HP at this level before Vitality modifier),
                   stat_points_awarded (integer default 0
                     — stat points granted on reaching this level),
                   created_at
                   -- IMPORTANT: PK column is `level` (integer), NOT `level_number`.
                   -- All queries use WHERE level = N.

character_powers — id (uuid), character_id (uuid FK characters ON DELETE CASCADE),
                   power_name (text), power_description (text nullable),
                   source (text CHECK 'apothecary'/'level_unlock'/'admin_grant'),
                   acquired_at (timestamptz)
                   -- Index: (character_id)

character_xp_log — id (uuid), character_id (uuid FK characters ON DELETE CASCADE),
                   amount (integer), reason (text), awarded_by (uuid nullable),
                   created_at (timestamptz)
                   -- Index: (character_id)

essence_log      — id (uuid), user_id (uuid FK users.id ON DELETE CASCADE),
                   amount (integer),
                   reason (text),
                   awarded_by (uuid nullable FK auth.users ON DELETE SET NULL),
                   created_at (timestamptz)
                   -- Index: (user_id)
                   -- Tracks all Essence credits and debits at account level.
                   -- Positive amount = credit, negative = debit.

character_relationships — id (uuid),
                   character_id (uuid FK characters ON DELETE CASCADE),
                   related_character_id (uuid FK characters ON DELETE CASCADE),
                   relationship_type (text CHECK ally/rival/family/mentor/apprentice/other),
                   relationship_label (text nullable),
                   is_mutual (boolean default false),
                   created_by (uuid FK auth.users), created_at
                   UNIQUE (character_id, related_character_id)

character_revisions — id (uuid),
                   character_id (uuid FK characters ON DELETE CASCADE),
                   reviewer_id (uuid FK auth.users ON DELETE SET NULL),
                   feedback (text nullable),
                   status_before (text NOT NULL),
                   status_after (text NOT NULL),
                   created_at (timestamptz)
                   -- Index: (character_id)
                   -- Written on every approval action: approve, reject, requestRevision
                   -- Users can read their own character's revision history

-- NOTIFICATIONS
notifications    — id (uuid), user_id (uuid FK auth.users),
                   type (text), title (text), body (text),
                   link (text nullable), is_read (boolean default false),
                   created_at (timestamptz)
                   -- In Realtime publication (INSERT subscription)

-- MESSAGE BOARDS
boards           — id (uuid), name (text), description (text nullable),
                   scope (text CHECK public/faction/rp/staff/admin/chronicle),
                   scope_id (uuid nullable — faction_id or chronicle_id),
                   is_rp_board (boolean default false),
                   forced_theme (text nullable),
                   min_level_required (integer nullable),
                   discord_announce (boolean default false),
                   display_order (integer default 0),
                   parent_id (uuid FK boards ON DELETE CASCADE nullable
                     — hierarchy; null = root),
                   is_category (boolean default false
                     — categories are display groupings only, not postable spaces),
                   thread_count (integer default 0 — denormalized, trigger-maintained),
                   post_count (integer default 0 — denormalized, trigger-maintained),
                   last_post_at (timestamptz nullable),
                   last_post_user_id (uuid FK public.users nullable),
                   icon_url (text nullable),
                   staff_only_threads (boolean default false
                     — when true, only moderate_boards permission can create new threads;
                     replies open to all),
                   created_at
                   -- NOTE: boards.category column DROPPED in Migration 024

board_threads    — id (uuid), board_id (uuid FK boards), author_id (uuid FK auth.users),
                   title (text), canon_source (text nullable),
                   is_spoiler (boolean default false),
                   is_pinned (boolean default false), is_locked (boolean default false),
                   thread_type (text default 'standard'
                     CHECK standard/combat/ascension),
                   is_locked_for_edit (boolean default false
                     — set true on combat posts; prevents editing after dice roll submitted),
                   reply_count (integer default 0
                     — trigger-maintained: trg_thread_reply_count_inc/dec on board_posts),
                   created_at, updated_at
                   -- IMPORTANT: author column is author_id, NOT user_id.
                   -- This applies to both board_threads and board_posts.

board_posts      — id (uuid), thread_id (uuid FK board_threads),
                   author_id (uuid FK auth.users),
                   character_id (uuid nullable FK characters ON DELETE SET NULL),
                   is_ic (boolean default false),
                   content (text HTML), is_flagged (boolean default false),
                   flag_reason (text nullable), flagged_by (uuid nullable),
                   created_at, updated_at

ooc_posts        — id (uuid), thread_id (uuid FK board_threads),
                   user_id (uuid FK auth.users),
                   content (text), created_at

post_enchantments — id (uuid), post_id (uuid FK board_posts ON DELETE CASCADE),
                   user_id (uuid FK auth.users), created_at
                   UNIQUE (post_id, user_id)

post_reports     — id (uuid), post_id (uuid FK board_posts),
                   reported_by (uuid FK auth.users),
                   reason (text), details (text nullable),
                   status (text CHECK new/reviewed/actioned default 'new'),
                   created_at

thread_reads     — id (uuid), user_id (uuid FK auth.users ON DELETE CASCADE),
                   thread_id (uuid FK board_threads ON DELETE CASCADE),
                   last_read_at (timestamptz default now()),
                   UNIQUE (user_id, thread_id)
                   -- Index: (user_id), (thread_id)
                   -- Powers the My Threads tracker.
                   -- Updated via markThreadRead() on every thread open. Enables
                   -- turn-state detection: if board_threads.updated_at >
                   -- thread_reads.last_read_at, there are new posts since last visit.

-- WHISPERS (Private Messaging)
mail_messages    — id (uuid), sender_id (uuid nullable FK auth.users),
                   recipient_id (uuid FK auth.users),
                   subject (text), body (text),
                   read_at (timestamptz nullable),
                   deleted_by_sender (boolean default false),
                   deleted_by_recipient (boolean default false),
                   is_system_message (boolean default false),
                   is_welcome (boolean default false),
                   system_message_audience (text CHECK all/faction/individual nullable),
                   audience_id (uuid nullable), created_at
                   -- REPLICA IDENTITY FULL (required for UPDATE realtime)
                   -- In Realtime publication

-- SOCIAL
friendships      — id (uuid), user_id (uuid FK auth.users),
                   friend_id (uuid FK auth.users),
                   status (text CHECK pending/accepted/declined),
                   created_at
                   UNIQUE (user_id, friend_id)

thread_bookmarks — id (uuid), user_id (uuid FK auth.users),
                   thread_id (uuid FK board_threads ON DELETE CASCADE),
                   created_at
                   UNIQUE (user_id, thread_id)

-- LIVE CHAT
chat_messages    — id (uuid), user_id (uuid FK auth.users),
                   character_id (uuid nullable FK characters ON DELETE SET NULL),
                   is_ic (boolean default false),
                   channel_id (text default 'general'),
                   content (text), mentioned_user_ids (jsonb default '[]'),
                   deleted_at (timestamptz nullable), created_at
                   -- REPLICA IDENTITY FULL (required for UPDATE realtime)
                   -- In Realtime publication
                   -- GIN index on mentioned_user_ids

-- THE APOTHECARY (Essence Store)
apothecary_listings — id (uuid), name (text), description (text),
                   essence_cost (integer),
                   listing_type (text CHECK power/cosmetic/artifact),
                   min_level_required (integer default 1),
                   blessing_eligible (boolean default false),
                   blessing_weight (integer default 10),
                   is_active (boolean default true), created_at

apothecary_purchases — id (uuid), character_id (uuid FK characters ON DELETE CASCADE),
                   listing_id (uuid FK apothecary_listings),
                   purchased_at (timestamptz)
                   UNIQUE (character_id, listing_id)

power_catalog    — id (uuid), name (text), description (text),
                   show_origin (text), effect_description (text nullable),
                   created_at

-- THE GRIMOIRE (Lore Wiki)
grimoire_categories — id (uuid), name (text), display_order (integer), created_at

grimoire_entries — id (uuid), title (text), slug (text unique),
                   category_id (uuid FK grimoire_categories),
                   canon_source (text), body (text HTML),
                   created_by (uuid FK auth.users),
                   status (text CHECK draft/published default 'draft'),
                   is_featured (boolean default false),
                   created_at, updated_at

grimoire_revisions — id (uuid), entry_id (uuid FK grimoire_entries ON DELETE CASCADE),
                   editor_id (uuid FK auth.users),
                   body_before (text), body_after (text), created_at

-- REWATCH CLUB
rewatch_events   — id (uuid), canon_source (text), season (integer nullable),
                   episode_number (integer nullable), episode_title (text),
                   scheduled_at (timestamptz),
                   chat_channel_id (text nullable),
                   discussion_thread_id (uuid nullable FK board_threads),
                   status (text CHECK scheduled/live/archived default 'scheduled'),
                   created_by (uuid FK auth.users), created_at

rewatch_rsvps    — id (uuid), event_id (uuid FK rewatch_events ON DELETE CASCADE),
                   user_id (uuid FK auth.users), created_at
                   UNIQUE (event_id, user_id)

-- SITE EVENTS (The Convergence)
site_events      — id (uuid), name (text), description (text),
                   banner_text (text nullable),
                   starts_at (timestamptz), ends_at (timestamptz),
                   xp_multiplier (numeric default 1.0),
                   is_active (boolean default false), created_at

-- ACHIEVEMENTS
achievement_definitions — id (uuid), name (text), description (text),
                   badge_image_url (text nullable),
                   trigger_type (text CHECK post_count/event_participation/
                     character_level/admin_grant/founding_member),
                   trigger_value (integer nullable), created_at

character_achievements — id (uuid),
                   character_id (uuid FK characters ON DELETE CASCADE),
                   achievement_id (uuid FK achievement_definitions),
                   earned_at (timestamptz)
                   UNIQUE (character_id, achievement_id)

-- WAITLIST (pre-launch)
waitlist_signups — id (uuid PK DEFAULT gen_random_uuid()),
                   email (text NOT NULL UNIQUE),
                   name (text NOT NULL),
                   canon (text NOT NULL CHECK — 11 primary
                     show values, see §3),
                   resend_id (text nullable — Resend
                     contact ID),
                   created_at (timestamptz DEFAULT now())
                   -- Index: (email), (canon), (created_at)
                   -- RLS: enabled, no user-facing policies
                   -- All access via admin client only
```

### Postgres Economy Functions
Two SECURITY DEFINER functions handle atomic economy writes. Both created in Migration 021a. Called via supabase.rpc() from admin Server Actions.

increment_user_essence(p_user_id uuid, p_amount integer)
  → Returns new essence balance (integer)
  → UPDATE users SET essence = essence + p_amount WHERE id = p_user_id RETURNING essence
  → Used by grantEssence() in admin-players.ts

award_character_xp(p_character_id uuid, p_amount integer)
  → Returns new xp total (integer)
  → UPDATE characters SET xp = xp + p_amount WHERE id = p_character_id RETURNING xp
  → Used by awardXp() in admin-players.ts
  → Level-up detection deferred to Phase 4

---

## 19. Key Conventions & Patterns

### P-DC Admin Upload Pattern
Admin image uploads use direct browser upload — NOT Server Action routing.
Files above ~1MB MUST use this pattern due to Vercel Hobby 4.5MB body limit.
- Client calls `lib/uploadAdminImage.ts` helper directly
- Helper uploads to Supabase Storage via browser client
- Signed URL or public URL returned to client, stored in DB via Server Action
Never route large files through Server Actions.

### Admin Record Deletion
Before deleting any record that may be referenced by FK constraints:
1. Check usage count via API route
2. Show warning modal with usage count to admin
3. Handle cascades explicitly (SET NULL where needed, CASCADE where appropriate)
4. Never silently break related data

### Fire-and-Forget Notifications
Notifications to users are always fire-and-forget — never `await` them inside the main action path. Pattern:
```ts
// correct
void createNotification(userId, { type, title, body, link })
// wrong
await createNotification(userId, { type, title, body, link })
```

### Resend Integration Pattern
Resend is used for: transactional email (registration
confirmation, welcome email) and waitlist contact
management.

**Audience ID:** `63f32f0b-5198-4308-a60e-4c07cf5a9989`
(TWH Waitlist audience in Resend — named "TWH Waitlist",
may display as "General" in some UI views)

**Rate limit:** Free tier is 5 req/s. Bulk sends MUST
use `resend.batch.send([...])`, never individual
`resend.emails.send()` in a loop.

**Resend is best-effort for waitlist:** The Supabase
`waitlist_signups` table is the source of truth. Resend
contact creation is fire-and-forget — failures are
logged server-side but do not block the DB insert or
show an error to the user.

### Canon Constant Pattern
All UI canon lists (ribbons, dropdowns, selects) import
from `lib/canons.ts`. This is the single source of truth.
Never hardcode a canon list in a component.

```ts
import { CANONS } from '@/lib/canons'
// CANONS is an as const array with shape:
// { label, color, db, primary }[]
// color is the ribbon hex (fixed brand color, not a
// CSS variable — canon colors do not theme-switch)
```

When adding a new feature that uses canon tagging:
1. Add the canon string to the CHECK constraint in the
   migration
2. Add the entry to lib/canons.ts
3. Import CANONS in the component

### Atomic XP Operations
Always use conditional UPDATE, never read-then-write:
```sql
UPDATE characters SET xp = xp - $cost WHERE id = $id AND xp >= $cost RETURNING id
-- If no row returned: insufficient XP
```

### Server-Side HTML Sanitization
DOMPurify is a browser library and cannot run in Server Actions or Server Components. For server-side HTML sanitization (e.g. faction lore, character bios in admin views), use the sanitize-html package:

```ts
import sanitizeHtml from 'sanitize-html'
const clean = sanitizeHtml(html, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['u']),
  allowedAttributes: sanitizeHtml.defaults.allowedAttributes
})
```

sanitize-html is installed. DOMPurify remains the correct choice for client-side rendering (via dangerouslySetInnerHTML in Client Components).

### React.cache() for Permission Helpers
getUserPermissions() and isSuperAdmin() in lib/permissions.ts are wrapped with React.cache(). This deduplicates identical calls within the same request render tree — the authenticated layout and admin layout both call these functions, and React.cache() ensures only one DB round-trip occurs per request. Never remove the cache() wrapper from these functions.

### reviewer FK Joins Across Schema Boundaries
character_revisions.reviewer_id has a FK to auth.users, not public.users. PostgREST's embedded select only traverses FKs within the public schema. The alias syntax `reviewer:reviewer_id ( display_name )` silently returns null because display_name lives on public.users. Correct pattern: fetch reviewer_ids from the revisions query, then batch-fetch display_names from public.users in a second query using `.in('id', reviewerIds)`. This pattern applies to any table where a FK points to auth.users but the display data lives on public.users.

### useTransition Anti-Pattern
Do NOT use `useTransition` / `startTransition` for async handlers. Use `useState(false)` + direct `await`:
```ts
// correct
const [loading, setLoading] = useState(false)
const handleSubmit = async () => { setLoading(true); await action(); setLoading(false) }
// wrong
const [isPending, startTransition] = useTransition()
startTransition(async () => { await action() })
```

### Promise.all Layout Pattern (confirmed TWH-1.3)
To achieve parallel queries in layout.tsx without a sequential waterfall:
1. Call `getSession()` first (local cookie read, no network call) to extract the user ID
2. Use that ID to start the users table query simultaneously with `getUser()` and `getCachedSiteSettings()` in a single `Promise.all`
3. Never add sequential `await` calls outside the `Promise.all` block

```ts
// correct
const session = await getServerClient().auth.getSession() // local, no network
const userId = session.data.session?.user.id
const [settings, { data: { user } }, userRow] = await Promise.all([
  getCachedSiteSettings(),
  getServerClient().auth.getUser(),
  getUserRow(userId)
])
```

### getAdminClient() Usage Rules (confirmed TWH-1.3)
Use `getAdminClient()` (service role, bypasses RLS) in these specific cases:
1. `getCachedSiteSettings()` — must work for unauthenticated pages (landing, login)
2. Fire-and-forget operations (e.g. `logSession()`) — run asynchronously after the component returns, where the server client's cookie context may no longer be valid
3. Admin Server Actions that need to write data blocked by user RLS policies

Do NOT use `getAdminClient()` for reads that should be RLS-filtered.

### Authenticated Route Group Pattern (confirmed TWH-1.3)
All authenticated pages live under `app/(authenticated)/`. The route group layout
`app/(authenticated)/layout.tsx` handles the Masthead, Sidebar, and PageLayout
shell once — pages inside the group do not import or render PageLayout themselves.

Public pages (landing, login, register, confirm) live outside the route group.
Auth pages live under `app/(auth)/`.

### Middleware Convention (Next.js 16 confirmed)
Next.js 16 has renamed the middleware file convention from `middleware.ts` to
`proxy.ts`. The exported function must be named `proxy`.

**Confirmed facts from build log:**
```
⚠ The "middleware" file convention is deprecated.
  Please use "proxy" instead.
```
The route table in Vercel build output shows `ƒ Proxy (Middleware)`.

**Correct setup:**
- File: `proxy.ts` at the project root
- Export: `export async function proxy(request: NextRequest)`
- Config: `export const config = { matcher: [...] }`

Do NOT name the file `middleware.ts` or export as `middleware` in Next.js 16.
This was confirmed through painful trial and error — the build succeeds either
way but the wrong name causes `MIDDLEWARE_INVOCATION_FAILED` at runtime.

---

## 20. Build History

### Phase 0 — Project Setup (June 2026)

**TWH-0.1 — Complete**
- Repo scaffolded at `/Users/soundadvice/witching-hour/`
- Next.js 16.2.9 installed via `create-next-app@latest`
- Tailwind v4 + Turbopack + ESLint active
- Dependencies installed: `@supabase/supabase-js
  @supabase/ssr sharp @tiptap/react @tiptap/starter-kit
  @tiptap/extension-image dompurify @types/dompurify resend`
- Supabase client shells created (empty):
  `lib/supabase/browserClient.ts`, `serverClient.ts`,
  `adminClient.ts`, `lib/cached-settings.ts`
- `app/globals.css` — Blood Moon `:root` tokens + body defaults
- `app/layout.tsx` — Google Fonts via `<link>` tags
- Master documents copied to repo root

**TWH-0.2 — Complete**
- `TWH_BRIEF_v1.md` and `TWH_PROCESS_v1.md` written

**TWH-0.3 — Complete**
- GitHub: `aquariusrps/witching-hour`
- Supabase project: `the-witching-hour`
  (ID: vkhuttcusqubteseifui)
  URL: `https://vkhuttcusqubteseifui.supabase.co`
- Storage buckets created (all public):
  `avatars`, `character-portraits`, `rich-text-images`
- `.env.local` created with all 6 required env vars
- Vercel project: `the-witching-hour`
  → `https://the-witching-hour.vercel.app`
- Domain `atwitchinghour.com` purchased via Vercel
  and connected. Live and verified.
- Supabase Auth: email confirmation ON, SMTP via Resend
- Auth redirect URLs configured:
  `https://atwitchinghour.com/auth/callback`
  `http://localhost:3000/auth/callback`
  `https://the-witching-hour.vercel.app/auth/callback`

### Phase 1 — Foundation (June 2026) — COMPLETE

**TWH-1.1 — Complete** (commit: 4c418fc)
- Migration 001: `users`, `site_settings`,
  `session_logs`, `ip_bans` with full RLS
- site_settings seeded: site_name, site_tagline,
  registration_open, max_characters_per_user,
  xp_per_rp_post, maintenance_mode, launch_date
- Supabase client shells implemented:
  `browserClient.ts`, `serverClient.ts`, `adminClient.ts`
- `types/database.ts` generated

**TWH-1.2 — Complete** (commit: 486d01d)
- Migration 002: `handle_new_user()` trigger — creates
  `public.users` row on auth confirmation
- Migration 003: trigger fix — honours user-chosen
  display_name from `raw_user_meta_data` over
  email-prefix fallback
- Migration 004: display name validation updated to
  allow spaces (`[a-zA-Z0-9_ -]`)
- Registration flow: `app/(auth)/register/page.tsx`,
  `RegisterForm.tsx`, `lib/actions/auth.ts`
  (`registerUser`)
- Confirmation page: `app/(auth)/register/confirm/`
- Auth callback: `app/auth/callback/route.ts` with
  PKCE exchange and welcome Council Notice
  (fire-and-forget, fails gracefully — mail_messages
  not yet created)
- Email confirmation template customised in Supabase
  dashboard (Blood Moon branded HTML)

**TWH-1.3 — Complete** (commit: 3319a4f)
- `proxy.ts` at project root — IP ban check,
  maintenance mode, auth guard
- `lib/cached-settings.ts` — `getCachedSiteSettings()`
  implemented with unstable_cache, 5min TTL
- `lib/db/users.ts` — `getUserRow()` helper
- `lib/db/session.ts` — `logSession()` with hourly
  rate limit
- Login flow: `app/(auth)/login/page.tsx`,
  `LoginForm.tsx`, `loginUser()` server action
- `signOut()` server action added to auth.ts
- `app/(authenticated)/layout.tsx` — Promise.all
  pattern, theme attribute, fire-and-forget session log
- `app/components/Masthead.tsx` — two-row sticky header
  (Server Component) with `MastheadNav.tsx` client
  sub-component and `MastheadUser.tsx` dropdown
- `app/components/Footer.tsx` — filigree footer
- `app/(authenticated)/dashboard/page.tsx` — full
  three-column dashboard with real data, graceful
  empty states for missing tables
- `lib/actions/settings.ts` — `updateTheme()` action
- Old `Sidebar.tsx` retired (`_Sidebar.old.tsx`)

**TWH-1.4 — Complete** (commits: 079d8b7, ab873a3,
  176afef, 716279e, 556f281)
- `app/globals.css` — 25 new CSS tokens, body gradient,
  custom scrollbar, 5 `[data-theme]` override blocks
  (all six themes functional)
- Masthead logo: replaced inline SVG with PNG logo mark
  (`public/witchinghourlogo.png`, 52×52px display)
- Favicon: `app/icon.png` (App Router auto-serve)
- Default Next.js scaffold files cleaned up
- Theme switcher: fully functional — writes to DB,
  revalidates path, optimistic DOM update

**TWH-1.5 — Complete** (commit: bcf09be)
- Migration 005: `waitlist_signups` table with 3
  indexes and RLS
- `lib/actions/waitlist.ts` — `joinWaitlist()` server
  action: validates, checks duplicate, adds to Resend
  audience (best-effort), inserts to Supabase
- `app/waitlist/WaitlistForm.tsx` — client form with
  name, email, canon select, success state
- `app/waitlist/page.tsx` — exact duplicate of
  `page.tsx` with waitlist form replacing CTAs
- Resend audience: TWH Waitlist
  (ID: 63f32f0b-5198-4308-a60e-4c07cf5a9989)
- Waitlist verified working end-to-end

**TWH-1.6 — Complete** (commit: fe77bc0)
- `lib/canons.ts` — 11-entry as const array, single
  source of truth for all UI canon data
- Migration 006: `waitlist_signups` canon CHECK
  constraint updated to 11 values
- All UI files updated to import from lib/canons:
  `page.tsx`, `waitlist/page.tsx`, `WaitlistForm.tsx`,
  `Masthead.tsx`
- `lib/actions/waitlist.ts` VALID_CANONS updated to
  match
- Brief §3 updated

### Current repo state (end of Phase 1)

**Migrations applied:** 001–006
**TypeScript types:** current (`types/database.ts`)
**Live URL:** `https://atwitchinghour.com`

**Files of note:**
- `proxy.ts` — auth middleware (project root)
- `lib/canons.ts` — canon data source of truth
- `lib/cached-settings.ts` — site settings cache
- `lib/db/users.ts` — getUserRow()
- `lib/db/session.ts` — logSession()
- `lib/actions/auth.ts` — registerUser, loginUser,
  signOut
- `lib/actions/waitlist.ts` — joinWaitlist
- `lib/actions/settings.ts` — updateTheme
- `lib/supabase/browserClient.ts` — singleton browser
  client
- `lib/supabase/serverClient.ts` — cookie-aware server
  client
- `lib/supabase/adminClient.ts` — service role client
- `app/(auth)/` — register, login, confirm pages
- `app/(authenticated)/` — layout, dashboard
- `app/auth/callback/` — PKCE callback route
- `app/waitlist/` — waitlist landing page
- `app/components/` — Masthead, MastheadNav,
  MastheadUser, Footer, Candles
- `public/witchinghourlogo.png` — site logo PNG
- `app/icon.png` — favicon
- `witching_hour_build_roadmap.html` — build planning
  artifact
- `charmed-reborn-palette-sampler-v3.html` — theme
  palette reference

### Phase 2 — Core Data Model (COMPLETE)

**TWH-2.1 — Complete** (commit: 49cb3ca)
Migrations 007–010. permissions (16 seed rows), roles (5 original: admin/moderator/lore_keeper/faction_leader/founding_member), role_permissions matrix, user_roles. is_admin() + is_moderator() SECURITY DEFINER functions. factions table with 3 seed factions. lib/permissions.ts: hasPermission() + getUserPermissions(). Deviation: is_admin() stub added to Migration 007 — Postgres validates function existence at CREATE POLICY time.

**TWH-2.2 — Complete** (commit: 31afe0a)
Migrations 011–014. characters table (status: pending/needs_revision/active/suspended), 4 RLS policies, FK added to users.active_character_id. character_level_thresholds seeded (5 levels). character_xp_log, character_powers, character_relationships. notifications with partial index + Realtime. getCachedFactions() + getCachedCharacterLevelThresholds() added to lib/cached-settings.ts. lib/actions/characters.ts shell created.

**TWH-2.3 — Complete**
Migrations 015–016. mail_messages with REPLICA IDENTITY FULL and Realtime publication. 4 RLS policies. factions.leader_title column (default 'Keeper'). lib/notifications.ts: createNotification() + createCouncilNotice() using admin client. Whispers inbox/compose/thread UI. Unread badge in Masthead. Welcome Council Notice activated in auth callback. Layout Promise.all extended to 5 items.

**TWH-2.4a — Complete** (commit: 298372b)
Migrations 017–018. boards (scope: public/faction/rp/staff/admin/chronicle, is_rp_board, forced_theme, min_level_required, discord_announce, display_order), board_threads (canon_source, is_spoiler, updated_at), board_posts (character_id FK, is_ic, is_flagged), ooc_posts, post_enchantments, post_reports, thread_reads. 22 RLS policies across 7 tables. update_thread_updated_at() trigger on board_posts INSERT — keeps board_threads.updated_at current for My Threads tracker and last-activity sorting. Deviation: motherland_fort_Salem → motherland_fort_salem (all lowercase — canonical value confirmed).

**TWH-2.4b — Complete** (commit: 757694c)
getCachedPublicBoards() added to lib/cached-settings.ts (5-min TTL, 'boards' tag, public + rp scope only). lib/actions/forums.ts shell created with 10 action signatures. types/database.ts regenerated.

**TWH-2.5 — Complete** (commit: 9a5cba2)
Migration 019. manage_admins permission added. is_admin() updated to include 'super_admin'. super_admin role (is_permanent = true) + 8 functional admin roles (is_invisible = true): character_manager, faction_manager, board_manager, events_manager, apothecary_manager, settings_manager, player_manager, ban_manager. admin role permission matrix wiped (cosmetic badge only). isSuperAdmin() + isAdminOrSuperAdmin() added to lib/permissions.ts. Layout Promise.all extended to 6 items + superAdmin prop added to Masthead. Admin panel shell at /admin with 8 section pages. Mod panel shell at /mod. ESLint no-page-custom-font rule disabled globally (Google Fonts loaded via link tags by design).

**TWH-2.6 — Complete**
Migration 020 (site_settings keys seeded: 14 total). React.cache() added to getUserPermissions() and isSuperAdmin(). Admin Panel + Mod Panel links added to Masthead (conditional on permissions/superAdmin). sanitize-html installed for server-side HTML sanitization. Admin sections built: site settings manager (3 sections: General, Economy, Integrations), waitlist manager (read-only, canon breakdown), faction manager (full CRUD with Tiptap lore editor, color picker, revalidateTag('factions')). Stub shells: boards, events, apothecary.

**TWH-2.7a — Complete** (commit: f88370f)
lib/actions/admin-players.ts: searchUsers, banUser, unbanUser, checkIsBanned. lib/actions/admin-roles.ts: getUserRoles, grantRole, revokeRole with ADMIN_TIER_ROLES server-side gate. Player manager page: URL-driven search, user detail panel with roles and ban/unban. Role/admin manager page: admin-tier checkbox grid, other-roles grant/revoke, faction selector for scoped grants.

**TWH-2.7-pre — Complete** (commit: 9b2a02b)
Migration 021a: users.essence (integer default 0), users.last_offering_at (timestamptz nullable), essence_log table with RLS, increment_user_essence() SECURITY DEFINER function, award_character_xp() SECURITY DEFINER function. grantEssence() + awardXp() implemented in admin-players.ts. PlayerActions.tsx updated with Economy section (Grant Essence + Award XP forms with 3-second success toasts). CSS variable fix: var(--f-heading) → var(--f-head) across all admin and mod pages (17 files). types/database.ts regenerated.

**TWH-2.7b — Complete** (commit: d5784d3)
Migration 022: characters_status_check updated to include needs_revision. character_revisions table with 2 RLS policies and btree index on character_id. lib/actions/admin-characters.ts: approveCharacter(), rejectCharacter(), requestRevision() with writeRevision() helper — every action writes a character_revisions row. Character approval queue page: two tabs (Pending / Needs Revision), character cards with canon badges and faction pips, full bio (sanitize-html server-side), revision history timeline. CharacterReviewPanel.tsx: 5 modals (approve, revision, reject, suspend, reactivate). Discriminated union narrowing via 'error' in result pattern throughout. Additional CSS fix: var(--f-heading) found and fixed in whispers/page.tsx and whispers/[id]/page.tsx. Deviation: reviewer_id FK joins resolved via two-query pattern (auth.users boundary — PostgREST cannot traverse FK to auth schema). Deviation: needs_revision queue ordered by created_at (characters table has no updated_at column).

### Current repo state (end of Phase 2)

Migrations applied: 001–022
TypeScript types: current (types/database.ts)
Live URL: https://atwitchinghour.com

### Files of note (Phase 2 additions)
- lib/permissions.ts — hasPermission(), getUserPermissions(), isSuperAdmin(), isAdminOrSuperAdmin()
- lib/notifications.ts — createNotification(), createCouncilNotice()
- lib/cached-settings.ts — getCachedSiteSettings(), getCachedFactions(), getCachedCharacterLevelThresholds(), getCachedPublicBoards()
- lib/actions/auth.ts — registerUser, loginUser, signOut
- lib/actions/characters.ts — shell (Phase 4)
- lib/actions/forums.ts — shell (Phase 3)
- lib/actions/whispers.ts — sendWhisper, markWhisperRead, deleteWhisper
- lib/actions/admin-settings.ts — updateSiteSetting, updateMultipleSiteSettings
- lib/actions/admin-factions.ts — createFaction, updateFaction, deleteFaction, reorderFactions
- lib/actions/admin-players.ts — searchUsers, grantEssence, awardXp, banUser, unbanUser, checkIsBanned
- lib/actions/admin-roles.ts — getUserRoles, grantRole, revokeRole
- lib/actions/admin-characters.ts — approveCharacter, rejectCharacter, requestRevision
- app/(authenticated)/layout.tsx — 6-item Promise.all
- app/(authenticated)/admin/ — full admin panel
- app/(authenticated)/mod/ — mod panel shell
- app/(authenticated)/whispers/ — inbox, compose, thread view

### Phase 3 — Forums (The Boards) — IN PROGRESS

**Completed:**

**TWH-3.1 — Complete** (commit: a00ed94)
Forum index, board hierarchy migration (023), getCachedBoardTree(), unread state, LocalTime component.

**TWH-3.1b — Complete** (commit: 6118ec9)
Board manager admin panel, migration 024 (drop boards.category), admin-boards actions, CRUD + reorder.

**TWH-3.2-pre — Complete** (commit: 6be844d)
Migration 025: combat/stat preflight, getCachedFullBoardTree(), staff_only_threads, thread_type, character stat columns, ascension site_settings seeds.

**TWH-3.2a — Complete** (commit: ab90b9c)
Migration 026a: reply_count, triggers, createThread() implemented.

**TWH-3.2b — Complete** (commit: 5644884)
ThreadRow component, canon validation fix (angel, all).

**TWH-ADMIN.1 — Complete** (commit: 6861041)
Registration toggle, waitlist as default landing, admin settings toggle.

**TWH-ADMIN.2 — Complete** (commit: 0351253)
Maintenance mode wired in proxy.ts, maintenance page built.

**Remaining:**

TWH-3.2c — Canon color admin system
TWH-3.2d — Thread list page + CreateThreadModal
TWH-3.3 — Thread view, Tiptap editor, OOC sidebar, spoiler extension, enchantments
TWH-3.4 — Mod tools, report queue
TWH-3.5 — Thread bookmarks, Discord webhook (Migration 026b)
TWH-3.6a — My Threads tracker (/my-threads, OOC forums only)
TWH-3.6b — Roleplay Tracker (/roleplay-tracker, IC RP boards only)

---

## 21. Chronicles System

Chronicles are discrete sub-RP spaces within The Witching Hour. Each Chronicle is a self-contained collaborative story with its own character roster, Keeper leadership, membership approval flow, and private boards. They sit below the site-wide RP layer and are independent of the faction system.

### What Chronicles Are
A Chronicle might be a closed Charmed-era story set in San Francisco, a Buffy-era mystery at Sunnydale High, or an original setting that draws on multiple canons. Users create characters specifically for each Chronicle they join — these characters are separate from their site-wide RP characters but appear on the user's profile alongside them, labeled with the Chronicle name.

### Keepers
Each Chronicle has one or more Keepers (equivalent to Game Masters). Multiple Keepers per Chronicle are supported. Keepers are assigned via user_roles with scope_id = chronicle_id and the keeper role. Keepers hold the manage_chronicle permission scoped to their chronicle, giving them the ability to:
- Edit the Chronicle name, description, and settings
- Set the character limit per user for their Chronicle (overrides site-wide max_characters_per_user for this Chronicle only, stored on the chronicles table)
- Review, approve, reject, or request revision on character applications
- Send feedback to applicants and request resubmission
- Moderate Chronicle boards
- Manage Chronicle membership

Admins can perform all Keeper actions on any Chronicle.

### Visibility and Membership
Chronicles have three visibility modes:
- open — any user can join with an approved character
- apply — users submit a character for Keeper review
- closed — invitation only, Keeper adds members directly

Membership is character-based: users join a Chronicle as a specific character, not as themselves. A user can have characters in multiple Chronicles simultaneously.

### Character Application Lifecycle
Chronicle character applications use the same revision loop as site-wide characters (§7): pending → needs_revision → pending (loop) → active / suspended. The character_revisions table records each round of feedback.

### Schema (Phase 14+)
```sql
chronicles       — id (uuid), name (text), slug (text unique),
                   description (text), canon_source (text nullable),
                   visibility (text CHECK open/apply/closed
                     default 'apply'),
                   status (text CHECK active/archived/draft
                     default 'draft'),
                   max_characters_per_user (integer nullable —
                     null inherits site_settings value),
                   created_by (uuid FK auth.users),
                   created_at, updated_at

chronicle_members — id (uuid),
                   chronicle_id (uuid FK chronicles ON DELETE CASCADE),
                   character_id (uuid FK characters ON DELETE CASCADE),
                   status (text CHECK pending/active/removed
                     default 'pending'),
                   joined_at (timestamptz nullable),
                   UNIQUE (chronicle_id, character_id)
```

Board scope: 'chronicle' is already forward-declared in the boards.scope CHECK constraint (Migration 017) with scope_id = chronicle_id. Chronicle boards (RLS policies + full UI) are built in Phase 14.

### Boards and Location Gating (site-wide RP)
The boards table includes a min_level_required integer column (nullable, null = no gate). Boards with a minimum level set are accessible only to characters meeting or exceeding that level. This is enforced at the application layer (not RLS) — the board appears in the list with a "your character hasn't unlocked this location yet" message rather than being invisible. Applies to both site-wide RP boards and Chronicle boards.

---

---

## 22. The Five Stats (Combat System)

Characters have five stats stored as integer columns on the `characters` table. All default to `site_settings.stat_base_value` (default 1). Players distribute additional points from a creation pool at character creation (`stat_creation_pool`, default 5; cap per stat `stat_creation_cap`, default 3). Further points are awarded on level up (`stat_points_per_level` per level). Additional points are purchasable via Essence in the Apothecary (Phase 7.5+).

**Stat definitions:**
- **Vitality** — Max HP and physical resilience. Max HP = `character_level_thresholds.max_hp` + (vitality × `hp_per_vitality_point`).
- **Arcana** — Magical power. Modifier added to spell damage rolls (d20 + Arcana mod vs Defense Rating).
- **Intuition** — Speed and sixth sense. Modifier added to initiative rolls (d20 + Intuition mod). Determines turn order in combat threads.
- **Aura** — Healing and spiritual resistance. Modifier added to healing power rolls and resistance to dark magic effects.
- **Ward** — Magical shielding. Sets Defense Rating = `defense_rating_base` + Ward mod (default: 10 + Ward). Attackers must meet or beat this to land a hit.

**Hit resolution sequence:**
1. Attacker rolls: d20 + Arcana mod
2. Defender's Defense Rating: 10 + Ward mod
3. If attack roll ≥ Defense Rating: hit → apply damage roll
4. If attack roll < Defense Rating: miss → no HP change

All stat mechanics built in Phase 7.5. Stat columns and site_settings seeds are in place from Migration 025.

---

## 23. Combat System (Phase 7.5)

Magical combat is handled through roleplay posts in dedicated combat threads (`thread_type = 'combat'`). 8 prompts, TWH-7C.1 through TWH-7C.8.

**Key mechanics:**
- **Initiative:** d20 + Intuition mod rolled on joining a combat thread. Determines post order.
- **Turn enforcement:** only the character whose turn it is can submit an IC combat post. 24-hour timer (`combat_turn_timeout_hours`) before turn auto-advances. Cron job on Vercel (slot 1 of 2).
- **Power use:** dropdown in combat composer. Confirm modal. Dice roll animation. Roll inserted into post body. Post submits. `is_locked_for_edit = true`. No editing.
- **Targeting:** damage powers target opposing factions. Healing/support powers target same faction. The Wayward (neutral) can be targeted by anyone for damage; can heal themselves and other Wayward.
- **Area effect:** applies to all valid targets simultaneously.
- **HP deduction:** automatic, server-enforced. Stored in `combat_participants.current_hp`. Each combat starts at full HP (isolated).
- **Conclusion:** HP hits 0 (defeated character cannot post further IC, narrated rescue to faction base), withdrawal, or manual close by initiator. Auto-conclude when only allied participants remain.
- **XP scaling:** base `xp_per_combat_win` × clamp(winner_level/defeated_level, scaling_min, scaling_max). Defeated characters earn no combat XP. Defeat cooldown: `combat_defeat_cooldown_hours`.
- **Max concurrent:** `max_concurrent_combat_threads` (default 3) enforced at initiation.
- **Invitation:** 48-hour window. Declined or expired = locked out unless reinvited.
- **Dispute flag:** any participant can request staff assistance. Thread halted. Faction leaders of participating factions notified. First to respond claims. Clears on faction leader action.

**Schema (Phase 7.5 — designed, not yet built):**
`combat_threads`, `combat_participants`, `combat_invitations`, `combat_post_actions`, `combat_turn_log`, `promotion_requests`

---

## 24. Ascension Rite (Promotion System)

When a character's XP reaches the threshold for their current level and `pending_promotion = false`, the XP bar displays the `ascension_request_label` button (default: "Request Ascension Rite").

**Flow:**
1. Character submits request (optional note). `promotion_requests` row created, `pending_promotion = true`. All faction leaders of that faction notified.
2. First faction leader to respond claims it (others notified claim is taken).
3. Claiming leader initiates a special combat thread (`thread_type = 'ascension'`) pre-wired to `factions.promotions_board_id`. The candidate character is pre-selected and non-removable. Leader writes IC summoning post.
4. Combat proceeds via Phase 7.5 mechanics.
5. Faction leader can mark at any time:
   - **Ascension Granted** → level increments, `stat_points_per_level` added to `unspent_stat_points`, `pending_promotion = false`, candidate notified, system post added to thread.
   - **Return to Practice** → feedback sent, `promotion_requests` status → returned, `pending_promotion = false`. Character may re-request after further RP.
6. Faction leader decision is final regardless of HP outcome — assesses writing quality and characterization, not just combat result.
7. Character withdrawal from ascension thread = forfeit → Return to Practice auto-triggered.

All label strings are admin-configurable via `site_settings` ascension_* keys. The promotions board per faction is set via `factions.promotions_board_id` in the faction manager. Default board label: 'The Ascension Chamber'.

---

## 25. Book of Shadows (Phase 4 — TWH-4.6)

A per-character journal. Each character has their own Book of Shadows accessible from their profile.

**Entry types:**
- `private` — visible only to the character's owner. Used for personal notes and plot planning.
- `public` — visible to all authenticated users. Deliberate reveals and one-shot story posts.
- `faction` — visible to characters in the same faction only.

**Schema (to be created in Phase 4):**
```sql
character_journal_entries — id (uuid), character_id (uuid FK characters ON DELETE CASCADE),
                   title (text nullable),
                   body (text HTML — Tiptap output),
                   visibility (text CHECK private/public/faction),
                   created_at, updated_at
```

---

## 26. Contributor System (Phase 10+)

Three donation tiers for users who financially support the site:

**The Vigil (entry tier)**
- Supporter badge on profile
- Bonus monthly Essence stipend
- +1 character slot above site default

**The Initiated (mid tier)**
- Everything in The Vigil
- Exclusive cosmetic avatar frame
- Larger Essence stipend
- +2 character slots above default
- Access to contributor-only forum board

**The Devoted (top tier)**
- Everything above
- The Devoted badge (displayed on profile and post headers)
- Exclusive character portrait frame for all characters
- Priority character approval
- One-time Apothecary credit on signup
- Name in Devoted Hall of Honor

**Schema additions (Phase 10+):**
```sql
users.contributor_tier         — text nullable (vigil/initiated/devoted/null)
users.contributor_since        — timestamptz nullable
users.contributor_expires_at   — timestamptz nullable
```

Payment processor: Ko-fi recommended for launch. Webhooks update `contributor_tier` on successful payment. Stripe migration path available if volume demands.

---

## 27. Staff Lounge

A staff-only forum category. Manual setup via the board manager — no dedicated build prompt required.

**Structure:**
```
Staff Lounge (category, scope: staff)
├── The Council Chamber      (scope: admin — staff and admin discussion)
├── Moderation Desk          (scope: staff — mod coordination, report discussion)
├── Faction Leaders' Circle  (scope: staff — faction leader coordination)
└── Announcements Drafts     (scope: admin — staging area for announcements)
```

All use existing scope values. No migration needed. Create via admin board manager.

---

## 28. Standing Rules

Rules established during Phase 3 builds. Earlier rules (R1–R15) live in TWH_PROCESS_v1.md §21.

### R16 (RESOLVED — Migration 025)
`characters.updated_at` added in Migration 025. Trigger `trg_characters_updated_at` maintains it on every UPDATE. No workaround needed.

### R17 — author_id, Not user_id, on Thread and Post Tables
`board_posts` and `board_threads` use `author_id` for the post author column, NOT `user_id`. Always verify with `information_schema` before writing any INSERT or query on these tables.

### R18 — character_level_thresholds PK Is `level`, Not `level_number`
The PK column is `level` (integer). All queries must use `WHERE level = N`. The name `level_number` does not exist.

### R19 — hasPermission() Is Safe in Server Actions
`hasPermission()` uses `getAdminClient()` internally and creates no cookie-aware client. The two-cookie rule (§7 Process) is not violated by calling `hasPermission()` alongside one `getServerClient()` call.

### R20 — invalidateBoards() Must Call All Three Tags
Every board mutation must call all three revalidateTag calls:
```ts
revalidateTag('board-tree', {})
revalidateTag('boards', {})
revalidateTag('board-tree-admin', {})
```
Omitting any tag leaves stale cache on the board manager or public forum index.

### R21 — getCachedFullBoardTree() Is Admin-Only
Its output must never be exposed to non-admin users. The `manage_boards` permission gate at the page level is the enforcement point. RLS is the DB backstop.

### R22 — post_enchantment_types Is a JSON String
`post_enchantment_types` in `site_settings` is stored as a JSON string. Always `JSON.parse()` before use. Never treat it as a plain string.

### R23 — Prompt Sizing: Split at More Than One Major Deliverable
If a prompt touches more than one of {migration, server action, page, modal/component}, evaluate splitting into sub-prompts (e.g. the 3.2a/b/c/d pattern). One clear deliverable per prompt that can be fully verified before the next begins.

### R24 — window.location.href Over router.push() for Post-Mutation Navigation
`window.location.href` is preferred over `router.push()` for post-action navigation in Client Components that require a full Server Component re-render after a mutation. Confirmed pattern: `CharacterReviewPanel.tsx`.

---

*This document is updated at the completion of each build phase.*
*Version history: v1 → v1.1 → v1.2 → v1.3 → v1.4 → v1.5 (merged into v1.6) → v1.6 (Phase 2 complete) → v1.7 (Phase 3 partial complete: faction renames Underworld/Wayward, combat system design, five stats, ascension rite, book of shadows, contributor system, staff lounge, schema updates Migrations 023–026a, site settings catalog, new cached functions, R16 resolved, R17–R24 added, My Threads/Roleplay Tracker split captured)*
*Cross-reference: TWH_PROCESS_v1.md (build governance)*
