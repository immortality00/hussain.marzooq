# HM Visuals — Session Queue

## How to use
Open a new Code tab → open portfolio folder → paste: **Continue queue**

Claude reads this file, finds the next `pending` session, runs the full
3-gate cycle (plan → execute → commit), marks it `done`, then tells you
to open a new session.

**Gate 3 includes the archive move — automatic, no extra step from Hussain:**
in the same edit that marks a session `done`, cut its entire section from this file and
append it verbatim (spec + build-outcome note included) to `SESSION-ARCHIVE.md`. This
keeps the queue permanently lean. Do not load SESSION-ARCHIVE.md by default — read it
only when a pending session or CLAUDE.md references it.

---

## Status legend
`done` — complete, committed to GitHub, and moved to SESSION-ARCHIVE.md
`in-progress` — current active session (reset to `pending` if interrupted)
`pending` — not yet started

---

## Completed so far — full specs + outcomes in SESSION-ARCHIVE.md
Phase 0: F1–F5 (foundation, refactors, cleanup) · Phase 1: N1–N8 (nav, CMS, admin
consolidation, card images) · Phase 2: D1 (preloader), D3 (photography 3-view viewer).
D2 (homepage WebGL scene) was removed from the queue entirely, not completed.

---

## Gaps awaiting a decision from Hussain — not sessions yet, do not invent scope

1. **Homepage design session missing.** D2 was deleted, but D4 still defers the
   homepage's own transition "to the homepage's design pass" — which no longer exists
   anywhere in this queue. Decide: schedule a homepage design session, or declare the
   homepage final as-is and re-scope D4's homepage line.
   → **Candidate answer (updated 2026-08-06):** DS2 step 3 (re-scoped) routes this to the
   DS0 skills — `frontend-design` for direction + `prototype` for 2–3 hero variants behind
   a switcher. Still needs Hussain's call on whether to schedule it as a session.
2. **About rebuild unscheduled.** Flagged twice in N5's notes ("About still has no
   rebuild session in the queue"). Dancing = D10, Web Development = D11, About = nothing.
   → Same candidate answer as (1) — DS2 step 3 (`redesign-existing-projects` then
   `frontend-design`).
3. **Radius scale decision.** 83 arbitrary `rounded-[Xrem]` uses vs the 3-token rule
   (details in CLAUDE.md, Design tokens). (a) codify the de-facto scale as the rule, or
   (b) a deliberate scoped conversion pass. Waiting on the call — do not quietly pick.
4. **Tests / CI — baseline shipped (S3, archive §S3).** Vitest baseline + `npm test`
   (auth unit tests + server-module import smoke) and a GitHub Action running
   typecheck + lint + test now exist. Still deliberately minimal — no component/route
   behaviour coverage. Decide whether deeper coverage warrants its own session before
   launch, or waits until after.

---

## Phase DS — Design system rescue (Impeccable)

**Context, in Hussain's words:** the design target (aikawakenichi.com, igloo.inc,
ten.375.studio) was not reached. What shipped is closer to generic AI-template output —
exactly what Impeccable exists to detect and fix. These two sessions run **before** the
remaining design sessions (D4–D13), because they produce the design context those
sessions should be reading.

Repo: https://github.com/pbakaus/impeccable — Apache 2.0, by Paul Bakaus. 1 skill,
23 commands, 59 deterministic detector rules, standalone CLI that needs no LLM or API key.
Docs: impeccable.style

**The stack, and what each part is for** — these are complementary, not competing:

| Layer | Tool | Session |
|---|---|---|
| **Direction** — what this should look like and why | `frontend-design` (Anthropic) | DS0 |
| **Audit** — what is wrong with what exists | `redesign-existing-projects` (taste-skill) | DS0 |
| **Detection** — deterministic, offline, no LLM | Impeccable CLI (59 rules) | DS1 |
| **Motion** — the whole remaining D-phase | Emil Kowalski's skills | DS0 |
| **Execution** — Impeccable's 23 commands | Impeccable skill | DS2 |

Run order matters: **DS0 → DS1 → DS2 → D-sessions.** Skills before diagnosis before
adoption before building, so each step informs the next instead of duplicating it.
Full routing table + conflict rules: CLAUDE.md → "Design & motion skills".

---

### Session DS1 — Evaluate the detector (no install, no hooks) — `done`
Moved to SESSION-ARCHIVE.md (spec + full triage outcome). One-line result: the source
scan Impeccable was told to run is inert on this codebase (regex mode, TSX/CSS → 0
findings); only URL scans surface anything. 259 URL findings triaged → ~5 Real, all in
shared components, folded into D13. Recommendation accepted: **trim DS2** (below).

---

### Session DS2 — Fold Impeccable findings in; skills for the design gaps — `pending`
**Re-scoped 2026-08-06 after DS1.** The original "install + hook + `DESIGN.md`" plan is
**dropped** — DS1 showed it isn't justified: the file-save hook is worthless here (fires
on TSX edits, which are regex-empty; can't scan a URL on save), and generating `DESIGN.md`
risks a second source of truth that conflicts with CLAUDE.md (the exact mechanism behind
the old eyebrow/gradient contradictions). CLAUDE.md stays the single design language; the
DS0 direction skills cover direction. What remains of DS2:

**1. The 5 Real findings are already captured in D13** (see D13's checklist). No separate
workstream — the queue stays the plan of record. Nothing to install to act on them.

**2. Keep the detector install-free.** Use it as an occasional **manual** accessibility
spot-check, run against the **dev-server URLs** (never `detect app/ components/`, which is
inert). Reference invocation, dev server up on :3000:
```
npx impeccable detect http://localhost:3000/<page> --json
```
Do **not** `npx impeccable install`, do **not** add the hook, do **not** generate
`DESIGN.md`. If a future session ever does install it, the DS1 **Intentional** rules go
straight into `detector.ignoreRules` with reasons (`image-hover-transform`,
`gpt-thin-border-wide-shadow`, `extreme-negative-tracking`, `oversized-h1`,
`kicker-above-heading` for the footer brand lockup, and `bounce-easing`/elastic for D4/D5).

**3. The homepage and About design gaps are skill-driven, not detector-driven.** These are
queue Gaps #1 and #2 at the top of this file. The detector cannot judge aesthetic ambition
(igloo/aikawakenichi vs generic template) — that's what the DS0 skills are for:
- **Homepage** (no design session since D2 was deleted): `frontend-design` (DS0) for
  direction + signature element, `prototype` (DS0) to put 2–3 hero directions behind a
  switcher before committing. Sequence this with the homepage design decision in Gap #1 —
  don't start it blind.
- **About** (no rebuild session): `redesign-existing-projects` (DS0) for the audit, then
  `frontend-design` for the rebuild.
- **One direction skill at a time** — running `frontend-design` and
  `redesign-existing-projects` together produces mush. Pick one per pass, name it in the
  Gate 1 report.

**Guardrail unchanged:** any code-moving pass goes through Gate 1 → Hussain approves →
execute. Show the plan before touching a page.

---

## Phase 2 — Preloader & core experience

### Session D4 — Page transition system — `pending`
Build the shared transition context and implement per-route transitions using actual page content as animation material.

Architecture:
- A `TransitionContext` (React context) holds the current and destination page's available images/media.
- A `PageTransition` wrapper component intercepts route changes.
- Each route has a defined transition in and out.

Transitions to implement in this session:
- **→ Photography:** Hero image expands from small to full viewport, 3D cylinder assembles.
- **→ Videography:** Images scatter as ice shards (Three.js), film strip assembles from right.
- **→ NFT:** Images fragment/glitch, NFT grid assembles.
- **→ Dancing:** Images distort with wave physics (GSAP elastic), dancing page fades in.
- **→ About:** Single portrait expands full-screen, about content fades over it.
- **→ Web Development:** Brief terminal-style effect, page assembles.
- **Homepage → any:** deferred. There is no dedicated homepage-scene session in the
  queue, so the homepage's in/out transition is out of scope for D4 and will be defined
  alongside the homepage's own design pass. The six routes above are what D4 builds.

**Before writing any code:**
- Read AppShell.tsx, layout.tsx, every public page.tsx, every public page's primary image source.
- Propose the complete transition architecture and timing for each route.
- Wait for approval before writing any code.

**Skills to use here (installed in DS0):**
- `find-animation-opportunities` **first** — it also says what *not* to animate. Six
  bespoke route transitions is a large motion budget; confirm each one earns its place
  before speccing it.
- `animation-vocabulary` when writing the Gate 1 spec — durations, easings and
  choreography stated precisely, so Gate 2 has an objective target instead of "feels off".
- `prototype` for the two hardest transitions (Videography glass-shard, Dancing wave) —
  variants behind a switcher. D3's cylinder needed four rejected geometries before it
  landed (archive §D3); cheap exploration is how that cost drops.
- `review-animations` at Gate 2, before declaring done.
- **Conflict:** the Dancing transition's elastic wave physics is deliberate and survives
  Impeccable's "no bounce/elastic" rule. See CLAUDE.md → Skill conflicts.

---

### Session D5 — Cursor enhancements — `pending`
Enhance CustomCursor.tsx with the effects from CLAUDE.md direction.

Additions to the existing dot + ring cursor:
1. **Velocity stretch:** When moving fast, the ring distorts into an ellipse in the direction of movement. Calculated from dx/dy velocity each frame. Returns to circle when still.
2. **Ghost trail:** When velocity exceeds threshold, 2 ghost rings appear behind with 80% and 40% opacity. Fades when cursor slows.
3. **Spring overshoot:** When stopping, the ring slightly overshoots the dot position then springs back. Spring physics (k and damping values to be tuned).
4. **Zone-reactive size:** Expands on image/card hover, collapses on button hover. Already partially implemented — refine and verify consistency across all pages.
5. **mix-blend-mode: difference:** Applied to both dot and ring for automatic inversion on any background.

Read CustomCursor.tsx fully before writing. Verify cursor is applied correctly to every public page via AppShell.

**Skills to use here (installed in DS0):**
- `prototype` — spring physics is pure feel. Build 3 variants (stiffness/damping sets)
  behind a switcher and pick by eye rather than guessing constants in the dark.
- `animation-vocabulary` for the Gate 1 spec; `review-animations` at Gate 2.
- **Conflict:** spring overshoot is deliberate here and survives Impeccable's
  "no bounce/elastic easing" rule. Ignore the rule with a reason, don't remove the motion.

---

### Session D6 — Exhibition globe — `pending`
The globe renders as a standalone DOM section on the homepage, so items 2–4 below are a
DOM section as written.

Implement react-globe.gl on the homepage showing exhibition cities.

Data:
- Server function `getExhibitionCities()` in lib/server/public-media.ts
- Queries MongoDB: all public media where `appearances` array contains any item with `kind === "exhibited"`
- Groups by unique `{city, country}` pairs with coordinates via geocodeLocation()
- Returns `Array<{city, country, lat, lng, workCount, works[]}>`

Globe behavior:
- Auto-rotates when idle. User can drag to rotate. Resumes auto-rotate after interaction.
- City markers: white glow dots, size scales by number of exhibited works.
- Hover: city name + work count label appears.
- Click: uses the existing popup/lightbox pattern to show a media card grid of exhibited works from that city. Cards clickable to open the existing media detail popup.
- Color palette: dark charcoal from design tokens. Warm atmospheric glow.

Read: app/page.tsx, lib/server/public-media.ts, lib/server/geocoding.ts, components/media/types.ts. Propose globe layout and data approach. Wait for approval.

**Skills to use here (installed in DS0):** `pick-ui-library` before committing to
react-globe.gl — it is already in package.json but unused, so this is the last cheap
moment to confirm it beats a raw Three.js globe for this use. `animation-vocabulary` to
spec the auto-rotate / drag / resume choreography precisely.

---

### Session D7 — NFT page redesign — `pending`
Rebuild NftCard.tsx and NftCollection.tsx for collector-grade presentation.

- Dark card, full bleed image.
- Hover: card flips 180° (CSS 3D perspective) revealing back face with price, edition count, status, marketplace link, inquiry link.
- Status badge: available = white pulse animation, sold = diagonal stamp.
- The transition INTO the NFT page uses the glitch/fragment effect from Session D4.
- Filter bar redesign: horizontal tabs, no search box unless expanded.

Read: components/nft/NftCard.tsx, NftCollection.tsx, NftModal.tsx, lib.ts, app/nft/page.tsx. Propose card flip implementation. Wait for approval.

---

### Session D8 — Magnetic button effect — `pending`
Add magnetic hover to all primary CTA buttons sitewide.

On cursor proximity (within 60px): button translates toward cursor (max 12px x, 8px y).
On cursor leave: spring back to original position.
Implementation: custom hook `useMagneticHover`, applied via `data-magnetic` attribute.
Targets: all primary CTA buttons, StickyCta.tsx, nav Book button.

Read every file that renders a primary CTA button before writing.

**Skills to use here (installed in DS0):** `find-animation-opportunities` to confirm
magnetic hover belongs on *every* primary CTA rather than only the highest-intent ones
(nav Book, StickyCta) — sitewide magnetism can read as gimmick. `review-animations` at
Gate 2.

---

### Session D9 — Admin visual redesign — `pending`
Apply visual consistency between the admin and the portfolio design language.

Target: same dark theme, same typography scale, same component style as the portfolio.
Not a layout rebuild — visual consistency only.

Scope:
- globals.css: ensure dark admin theme uses the same OKLCH tokens as the public site.
- Admin layout components: typography, spacing, card backgrounds consistent with portfolio tokens.
- Table, form, button styles in admin match shadcn/ui components styled for the dark palette.

Admin functionality: zero changes. Only visual.

Read every admin layout file before writing. Report what will change visually and what will not be touched.

**Note (2026-07-31):** Hussain reports the admin is "getting messy" — that is a
*structural/UX* complaint, which this session does not cover. D9 stays visual-only;
the structural work is Session D9b below. Do not silently widen D9's scope.

---

### Session D9b — Admin information architecture — `pending`
Raised by Hussain 2026-07-31: the admin dashboard is getting messy as features accumulate.
This is about structure and findability, not colours (colours = D9).

N5 Part 2 already consolidated three sidebar entries into the single `/admin/pages`
accordion, which was the right move. The mess is what has grown since: each discipline
row now stacks Visibility + Work layout image + Header + Search & social + Sections
groups behind one accordion, and image controls for the *same* visual surface live in
two different places (Work overlay card image on `page_settings`, Featured Work card
image on `page_sections`).

Gate 1 must start with an inventory, not a redesign: list every admin route, every group
inside `/admin/pages`, and which collection each writes to. Then propose structure.
Specific things to evaluate — propose, do not assume:
- Is one accordion per page still right at 13 pages × up to 5 groups?
- Should "images used on other pages' cards" be grouped by *where they appear* rather
  than by which collection stores them?
- Is there a genuine landing/dashboard need (what's unpublished, what's missing an image,
  what has pending removal requests), versus the current straight-to-lists layout?
- Which admin surfaces are now dead or rarely used and could be removed outright.

Constraint: no data-model changes in this session. Presentation only — the three
collections stay as they are (that reasoning is in archive §N5 Part 2).
If D9 and D9b are both still pending when reached: run **D9b first** (structure), then
D9 (visual polish) — polishing a layout that's about to change is wasted work.

---

### Session D10 — Dancing page — `pending`
Build the dancing page.

Content:
- Page title + description (admin-controlled via Session N4 — corrected; N3 only covers
  SEO metadata, N4 is the session that makes the visible header editable).
- Instagram feed embed (Instagram Basic Display API or oEmbed — propose the approach that works with Next.js App Router).
- Booking CTA.
- Stats (years teaching, students, location).

The transition INTO the dancing page uses the wave/ripple effect from Session D4.

Read app/dancing/page.tsx and all imports before writing.

---

### Session D11 — Web development page — `pending`
Build the web development page with project showcase.

Admin:
- New MongoDB collection: `web_projects` (title, description, url, imageUrl, tags, isPublished, order).
- Admin CRUD at /admin/web-projects.

Public page:
- Project cards displayed in an editorial grid.
- Services section below projects.
- This site as the proof of quality (featured prominently).
- Booking CTA.

Read app/web-development/page.tsx before writing.

---

### Session D12 — People page — `pending`
Build the people page with privacy system.

Public page:
- Lists people (clients) who have been photographed/videographed.
- Each person: name, thumbnail from their session, click to view their media.
- **Private toggle per person:** when private, a password is required to view their content.
- **Removal request:** a person can submit a removal request from their public profile. Hussain approves it in admin. On approval: content is hidden behind a password (not deleted).

Admin:
- People management at /admin/people (likely already exists — read it first).
- Fields: name, isPrivate, password (hashed), removalRequested, removalApproved.
- Removal request queue: lists pending requests, one-click approve.

Public behavior:
- If person is private and viewer has no correct password: show password prompt.
- If person has an approved removal: content hidden, profile shows "Content not available."
- Direct URL to a private person always requires password.

Read all existing people-related files before writing.

**Audit note:** `app/admin/(protected)/removal-requests/page.tsx` is currently a fully
hardcoded stub ("No requests to review.", no data fetching at all). That's expected at
this stage — it's correctly captured by this session's "Removal request queue" task, not
a separate bug.

---

### Session D13 — Final public consistency pass — `pending`
Review every public page for visual and functional consistency.

Check and fix:
- PageHeader component used on all pages (not inline h1+p).
- PortfolioCard component used everywhere appropriate.
- SmartImage used for all public-page images — no raw `next/image` imports outside
  `components/shared/SmartImage.tsx`. Found during N5 Part 3 (2026-07-02): 13 files
  still import `next/image` directly (7 public-side: `PortfolioCard.tsx`,
  `PeopleIndex.tsx`, `SmartMediaPreview.tsx`, `SafeImage.tsx`,
  `review-form/PreviewImage.tsx`, `app/services/page.tsx`, plus 6 admin files —
  admin ones are D9/admin-session territory, not this pass). `WorkOverlay.tsx` was
  the 14th and was fixed in N5 Part 3 after its lazy card image triggered a dev LCP
  warning — the overlay stays mounted with opacity 0, so its images must load eagerly.
  Wrappers like `SafeImage` may legitimately keep an inner `next/image` — evaluate
  each, don't blind-swap.
- section-shell class used for all page containers.
- No gradient fallback divs anywhere.
- AnimatedText applied to all h1 elements.
- Dark background consistent in dark mode.
- Light mode clean and consistent.
- Spacing follows token scale.
- No placeholder or internal copy visible to visitors.
- Mobile layout works on all pages.
- Lenis scroll feels correct on all pages.

**From DS1's Impeccable URL scan (2026-08-06) — 5 Real findings, all in shared components:**
- **Glass-panel text contrast.** `SiteFooter.tsx` + `StickyCta.tsx` render text over
  `backdrop-filter` glass; min pixel contrast falls to 1.1–1.4:1 over bright image regions
  (CTA-subtext medians 2.6–3.4:1). Add a scrim / darken the glass behind the text, or raise
  weight/size — verify against the real imagery, not a flat background.
- **Undersized functional text.** `WorkOverlay.tsx` discipline sublabels are 9px and the
  logo mark is 10px — below the 11px legibility floor. Bump to ≥11px (design call on the
  micro-labels; no CLAUDE.md rule permits <11px).
- **`transition: width, height`** on a shared element (all pages) — animate `transform`
  instead to avoid layout thrash. Find the one component and fix.
- **Nested cards** on home / contact / videography (card-in-card is banned — CLAUDE.md).
  Testimonials' nested card is its deliberate hero-card layout — leave it.
- **Line length** 96–112 ch on body copy across 8 pages — tighten prose measure toward <80ch.
- Re-run the URL scan after fixing and confirm these drop out (invocation in DS2 step 2).

Read all public page components. Report every inconsistency before fixing anything.

**Skills to use here (installed in DS0):** `improve-animations` for a repo-wide motion
audit with prioritised, self-contained fix plans — this is the right session for it,
once all the motion work (D4–D8) has landed. Re-run `npx impeccable detect` too and
compare against DS1's triage table: anything in the "Real" column that is still present
is unfinished work.

---

## Phase 3 — Content & analytics

### Session C1 — Blog admin + public pages — `pending`
Build the blog system.

Admin:
- MongoDB collection: `blog_posts` (title, slug, content, coverImageUrl, category, tags, publishedAt, isPublished, author, updatedAt).
- Categories: admin-defined (same pattern as existing media categories).
- Admin CRUD at /admin/blog with list + create/edit forms.
- Slug auto-generated from title, editable.
- Content editor: rich text or Markdown — propose the best option for Next.js App Router.

Public:
- /blog: post listing with cover images, date, category, tags.
- /blog/[slug]: article page with reading layout, large typography, estimated read time.
- Category filter on listing page.

Read existing admin pattern (services admin is a good reference) before writing.

---

### Session C2 — Open Graph images — `pending`
Each public page needs a proper OG image so link previews on social media show actual photography.

Implementation:
- Next.js App Router `opengraph-image.tsx` per page, using the Vercel/Next.js OG image generation API.
- Each page pulls a representative photo from Cloudinary (the page's primary image).
- Fallback: a branded dark card with "HM Visuals" if no image is available.

Read all public page.tsx files and Next.js OG image docs before writing.

---

### Session C3 — Plausible Analytics — `pending`
Add Plausible Analytics to all public pages.

- Install @vercel/analytics or the Plausible Next.js package (propose which and why).
- Script only on public pages (not admin).
- No cookie banner required for Plausible.
- Verify it does not appear in admin routes.

Read AppShell.tsx and layout.tsx before writing.

---

### Session C4 — Appearances admin update — `pending`
Update the appearances admin to use a validated city selector instead of free text.

The location field currently accepts any text. It must use the same cities list system used in testimonials — a searchable, validated city/country selector backed by the geocoded cities data already in MongoDB.

This is required for the globe to display correct coordinates.

Read all appearances-related admin files and the testimonials location implementation before writing.

---

## Phase 4 — People & launch prep

### Session P1 — Performance audit — `pending`
Audit the full public site for performance.

- Lighthouse scores on homepage, photography, videography, NFT, dancing pages.
- Identify and fix the largest performance issues.
- Verify Three.js scenes are disposed correctly on unmount.
- Verify GSAP ScrollTrigger instances are killed on unmount.
- Verify Lenis is destroyed and reinitiated correctly on route change.
- Image optimization: verify all Cloudinary images use appropriate quality and format settings.
- Caching strategy: 39 pages currently run on `force-dynamic` with no
  `revalidatePath`/`revalidateTag` anywhere. Confirm which genuinely need per-request
  freshness vs which could move to the `revalidate: N` pattern photography/videography/nft
  already use.

Report all findings before fixing anything.

---

### Session P2 — Mobile adjustment pass — `pending`
Verify and fix the full mobile experience.

The WebGL homepage, 3D cylinder, and all GSAP effects must work on mobile.
Where mobile requires layout adjustment (not feature removal): fix it.
Where performance requires simplification: propose the specific simplification and wait for approval.

Test every public page on mobile viewport. Report all issues before fixing.

---

## Phase 5 — NFT smart contract (future)

### Session NFT1 — Smart contract architecture planning — `pending`
Planning session only. No code written until plan is approved.

- Separate git repository: hussain-nft-contracts
- ERC-721 base contract (OpenZeppelin)
- Royalty standard: EIP-2981, percentage set per mint
- Deployment target: Base chain initially (low gas, growing NFT ecosystem)
- Frontend: Wagmi + Viem for wallet connection
- IPFS: Pinata for metadata hosting
- Minting UI: new admin page /admin/mint

Read existing NftCard.tsx and lib/server/public-nfts.ts to understand current NFT data model before planning.

---

### Session NFT2 — Minting UI — `pending`
Build after smart contract is deployed and Session N1 is approved.

- Wallet connect button (RainbowKit or similar — propose)
- Select media from admin library to mint
- Set edition size, royalty %, price
- Mint transaction UI with live status
- Add to admin: app/admin/(protected)/mint/

---
