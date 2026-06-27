# The Witching Hour — Master Project Brief
### Comprehensive Build Document v1.5 — Complete & Authoritative
### Created: June 2026 | Last Updated: 2026-06-27

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
- `avatars` — user account profile images (one per user;
  shown in masthead chip, profile page, posts, online list)
- `character-portraits` — RP character portrait images
  (one per character; shown on character profiles, IC post
  headers, character selector)
- `rich-text-images` — Tiptap editor image uploads (admin-only)

Note: `avatars` and `character-portraits` mirror the
two-table naming convention (`users` = the person,
`characters` = their RP personas).
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
| Ember (primary accent) | `#c83818` | Links, Cabal faction, CTA buttons, unread indicators |
| Harvest Gold (secondary) | `#e0b028` | Covenant faction, active states, XP bars, gold trim |
| Moonstone (tertiary) | `#3878a8` | Unbound faction, success states, Buffy canon tag, cool contrast |

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
| The Cabal | Ember | `#c83818` | `#e06030` | `rgba(200,56,24,0.12)` |
| The Unbound | Moonstone | `#3878a8` | `#58a8d0` | `rgba(56,120,168,0.12)` |

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

### The Cabal
- **Alignment:** Dark-leaning, power-seeking, pragmatic
- **Color:** Ember (`#c83818`)
- **Lore:** Those who seek power by other means. Not purely evil — includes anti-heroes, grey practitioners, those who rejected the Covenant's constraints. Draw from: Cole Turner (S3–4), dark witches, demon-aligned.
- **Faction page accent:** Ember borders, deep claret atmosphere

### The Unbound
- **Alignment:** Neutral, chaotic, independent
- **Color:** Moonstone (`#3878a8`)
- **Lore:** Rogues, mercenaries, and those who rejected both sides. Wildcards who operate on their own terms. Often the most morally interesting characters.
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
The character approval flow supports multiple rounds of feedback between the reviewer and the submitting user. This applies to both site-wide characters and Chronicle characters.

1. User submits character (multi-step form: name → faction → bio → review). Status set to 'pending'.
2. Notification fires to admin/Keeper approval queue.
3. Reviewer can: Approve, Reject, or Request Revision.
   - Approve: status → 'active'. Notification to user.
   - Reject: reason required. Status → 'suspended'. Notification to user with reason. Character is not deleted — user can appeal via Whisper.
   - Request Revision: reviewer writes feedback. Status → 'needs_revision'. Notification to user with feedback.
4. User receives feedback, edits the character, and resubmits. Status returns to 'pending'.
5. Steps 3–4 repeat as many times as needed.
6. On approval, character status → 'active'. Approved characters appear in the user's character selector for IC posting.

Each round of feedback and resubmission is recorded in the character_revisions table (reviewer_id, feedback text, submitted_at, reviewed_at).

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
```
Admin
Moderator
Lore Keeper      (manages Grimoire wiki)
Faction Leader   (scoped to faction_id)
Keeper           (leads a Chronicle, scoped to chronicle_id)
Founding Member  (display/prestige — no mod permissions)
[Regular User]
```

### Additive Permission Model
All permissions are additive across roles — no role can negate another. System checks: does this user have ANY role granting permission X?

### Key Permissions
- `manage_site` — Admin only, full site control
- `moderate_boards` — delete/pin/lock posts across all boards
- `moderate_own_board` — Moderator scoped to specific board
- `manage_lore` — create/edit/publish Grimoire entries
- `approve_characters` — review and approve character submissions
- `award_xp` — manually award XP to characters
- `post_announcement` — post faction/site-wide system announcements
- `manage_faction` — Faction Leader, scoped to their faction
- `manage_chronicle` — Keeper, scoped to their chronicle_id. Create/edit chronicle details, manage membership, approve characters, moderate chronicle boards.

**Critical:** Permission column is `is_enabled` (boolean). NEVER `is_granted`. This is a hard rule inherited from WM's build experience.

---

## 10. Boards (Forum) System

### Board Scopes
- `public` — all logged-in users
- `faction` — characters in that faction only (scope_id = faction_id)
- `rp` — RP boards (IC posting enabled, XP awarded on post)
- `staff` — admin/mod only
- `admin` — admin only

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
- Multiple channels: General, Covenant (faction-gated), Cabal (faction-gated), Unbound (faction-gated), Watch Party (temporary, per-event)

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
| `getActiveEvent()` | `active-event` | 5 min |

**Critical integration rules:**
1. Before writing any new query against a cached table, check `lib/cached-settings.ts` first. If a cached version exists, use it.
2. Every admin mutation that modifies cached data MUST call `revalidateTag(tag)` alongside any `revalidatePath` calls.
3. Cached functions return plain arrays/objects. Switching from direct Supabase query to cached function requires removing `.data` access.
4. New globally-static admin data should be cached with tag-based invalidation.

**Layout.tsx query structure:**
- 3-tier parallel `Promise.all` — never add sequential awaits outside these blocks
- `browserSupabase` singleton — `lib/supabase/browserClient.ts` — all client Realtime subscriptions use this, never `createClient()` in a component

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
                   created_at (timestamptz)
                   -- Index: (user_id), (faction_id), (status)

character_level_thresholds — level (integer PK), xp_required (integer),
                   label (text), unlocks_description (text nullable), created_at

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
                   feedback (text),
                   status_before (text),
                   status_after (text),
                   created_at (timestamptz)
                   -- Index: (character_id)

-- NOTIFICATIONS
notifications    — id (uuid), user_id (uuid FK auth.users),
                   type (text), title (text), body (text),
                   link (text nullable), is_read (boolean default false),
                   created_at (timestamptz)
                   -- In Realtime publication (INSERT subscription)

-- MESSAGE BOARDS
boards           — id (uuid), name (text), description (text nullable),
                   category (text), scope (text CHECK public/faction/rp/staff/admin),
                   scope_id (uuid nullable — faction_id),
                   is_rp_board (boolean default false),
                   forced_theme (text nullable),
                   discord_announce (boolean default false),
                   created_at

board_threads    — id (uuid), board_id (uuid FK boards), author_id (uuid FK auth.users),
                   title (text), canon_source (text nullable),
                   is_spoiler (boolean default false),
                   is_pinned (boolean default false), is_locked (boolean default false),
                   created_at, updated_at

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

### Phase 2 — Core Data Model (in progress)

**TWH-2.1 — Complete** (commit: 49cb3ca)
- Migration 007: permissions table, 16 seed permissions
- Migration 008: roles + role_permissions tables, 5 seed roles, CROSS JOIN permission matrix seeded
- Migration 009: user_roles table, 2 indexes, RLS
- Migration 010: is_admin() + is_moderator() SECURITY DEFINER functions, factions table, 3 seed factions
- lib/permissions.ts: hasPermission() and getUserPermissions() using getAdminClient()
- app/(authenticated)/layout.tsx: getUserPermissions added to Promise.all as 4th item
- app/components/Masthead.tsx: permissions prop added
- types/database.ts: regenerated
- Deviation: is_admin() stub added to Migration 007 (Postgres validates function existence at CREATE POLICY time — spec note was incorrect). Migration 010 replaces stub with real implementation via CREATE OR REPLACE FUNCTION.

**TWH-2.2 — Complete** (commit: 31afe0a)
- Migration 011: characters table, 3 indexes, 4 RLS policies, FK added to users.active_character_id
- Migration 012: character_level_thresholds (5 levels seeded), character_xp_log, character_powers, 6 RLS policies
- Migration 013: character_relationships, 2 indexes, 2 RLS policies
- Migration 014: notifications, 2 indexes (1 partial), 3 RLS policies, added to Realtime publication
- lib/cached-settings.ts: getCachedFactions() (1hr TTL) and getCachedCharacterLevelThresholds() (1hr TTL) added
- lib/actions/characters.ts: shell file created
- types/database.ts: regenerated
- Deviation: active_character_id already existed on users (bare uuid, no FK). Used ADD CONSTRAINT instead of ADD COLUMN. End state identical to spec intent.
- Standing answers: createNotification() and XP award actions use getAdminClient() (confirmed). character_relationships SELECT policy checks initiating character only until is_mutual = true (confirmed intentional).

**TWH-2.3 — Complete** (commit: eb37698)
- Migration 015: mail_messages, 3 indexes (1 partial), 4 RLS policies, REPLICA IDENTITY FULL, added to Realtime publication
- Migration 016: factions.leader_title column (default 'Keeper')
- lib/notifications.ts: createNotification() and createCouncilNotice() helpers using getAdminClient()
- lib/actions/whispers.ts: sendWhisper(), markWhisperRead(), deleteWhisper() Server Actions
- app/(authenticated)/whispers/: inbox, compose, thread view pages
- app/auth/callback/route.ts: welcome Council Notice activated (was previously swallowed silently)
- app/(authenticated)/layout.tsx: getUnreadWhisperCount added to Promise.all as 5th item
- app/components/Masthead.tsx: unreadWhisperCount prop + badge render added
- types/database.ts: regenerated

### Current repo state (end of TWH-2.3)

Migrations applied: 001–016
TypeScript types: current (types/database.ts)
Live URL: https://atwitchinghour.com

### Phase 2 remaining (TWH-2.4 onward)

**TWH-2.4** — Forums schema (boards, threads, posts)
**TWH-2.5** — Admin panel foundation
**TWH-2.6** — Admin panel: site settings, waitlist manager, faction manager
**TWH-2.7** — Admin panel: users, roles, character approval

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

Board scope: when Chronicles are built, 'chronicle' is added to the boards.scope CHECK constraint and scope_id = chronicle_id. Chronicle boards are private to active members by RLS.

### Boards and Location Gating (site-wide RP)
The boards table includes a min_level_required integer column (nullable, null = no gate). Boards with a minimum level set are accessible only to characters meeting or exceeding that level. This is enforced at the application layer (not RLS) — the board appears in the list with a "your character hasn't unlocked this location yet" message rather than being invisible. Applies to both site-wide RP boards and Chronicle boards.

---

*This document is updated at the completion of each
build phase.*
*Cross-reference: TWH_PROCESS_v1.md (build governance)*
