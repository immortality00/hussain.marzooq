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
   → **Candidate answer:** Session DS2 step 3 proposes filling this with
   `/impeccable shape` + `craft`. If that is accepted, this gap closes there.
2. **About rebuild unscheduled.** Flagged twice in N5's notes ("About still has no
   rebuild session in the queue"). Dancing = D10, Web Development = D11, About = nothing.
   → Same candidate answer as (1) — DS2 step 3.
3. **Radius scale decision.** 83 arbitrary `rounded-[Xrem]` uses vs the 3-token rule
   (details in CLAUDE.md, Design tokens). (a) codify the de-facto scale as the rule, or
   (b) a deliberate scoped conversion pass. Waiting on the call — do not quietly pick.
4. **Tests / CI — baseline shipped (S3, archive §S3).** Vitest baseline + `npm test`
   (auth unit tests + server-module import smoke) and a GitHub Action running
   typecheck + lint + test now exist. Still deliberately minimal — no component/route
   behaviour coverage. Decide whether deeper coverage warrants its own session before
   launch, or waits until after.

---

## Phase S — Security & hardening (do S1 before launch)

### Session S5 — `page-settings` PATCH treats partial updates as full replacement — `pending`
**Latent data-loss bug, not currently firing.** In
`app/api/admin/page-settings/[slug]/route.ts`:

```
line 29:  const cardImage = isSectionImage(body.cardImage) ? body.cardImage : EMPTY_SECTION_IMAGE;
line 36:  await deleteReplacedSectionImages({ cardImage: existing?.cardImage }, { cardImage });
line 38:  updateOne({ slug }, { $set: { ..., cardImage, ... } }, { upsert: true })
```

Any PATCH that omits `cardImage` silently resets it to empty **and** — because
`deleteReplacedSectionImages` runs on the diff — permanently deletes the uploaded
Cloudinary asset. Only uploads are destroyed (non-empty `publicId`); library picks are
dereferenced but survive.

Today's admin client always sends both fields
(`usePagesAdmin.ts:204`), so nothing is losing data right now. The risk is any future
caller — a script, a curl, a second admin surface, a partial-save refactor.

Fix: make `cardImage` genuinely optional — only touch the field when the key is
**present** in the request body; omission means "leave unchanged." Same review pass
should check `app/api/admin/page-sections/[slug]/route.ts` for the identical pattern.
Strictly a safety change, no behaviour change to the current UI.

---

### Session S2 — Reuse audit against the real code rule — `pending`
**Run after S3 — a refactor this wide must be covered by the test baseline first.**

The primary rule is reuse-over-repetition; file length is the symptom, not the rule.
**91 source files currently exceed 100 lines.** Largest: `lib/server/cloudinary-assets.ts`
(382), `components/testimonials/PublicReviewForm.tsx` (367), `app/api/media/[id]/route.ts`
(363), `hooks/useServicesAdmin.ts` (333), `components/contact/useContactFormState.ts` (286),
`components/photography/PhotographyCylinder.tsx` (285), `lib/server/page-sections.ts` (280).

Do NOT blind-split by line count. For each file over ~150 lines, classify it:
- **Extractable duplication** — the same shape appears elsewhere → extract a shared
  component/hook/util. This is the actual work.
- **Cohesive and unavoidable** — e.g. a single Three.js scene, one API route's full
  CRUD surface. Leave it and add a one-line comment stating why.

Report the classification for every file before changing any of them. Expect this to be
several sessions, not one — propose a split at Gate 1.

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

---

### Session DS1 — Evaluate the detector (no install, no hooks) — `pending`
Cheap, reversible, high information. **Do not install into the harness in this session.**
Run the CLI standalone — it writes nothing to the repo:

```
npx impeccable detect app/ components/ --json > /tmp/impeccable-report.json
npx impeccable detect app/ components/
```

Then produce a triage table. Every finding goes in exactly one column:

| Column | Meaning |
|---|---|
| **Real** | Genuine quality problem → becomes work in a design session |
| **Intentional** | Conflicts with a documented decision in CLAUDE.md → goes in `detector.ignoreRules` / `ignoreValues` with a stated reason |
| **Wrong** | Detector misfire on this codebase → ignore and note why |

**Known conflicts to expect — do not silently "fix" these:**
- Impeccable bans **bounce/elastic easing** as dated. Session D5 explicitly specs spring
  overshoot on the cursor, and D4 specs GSAP elastic wave physics for the Dancing
  transition. Both are deliberate. Classify as **Intentional** unless Hussain changes his
  mind on seeing the argument.
- Impeccable bans **gray text on colored backgrounds** and **pure black/gray, always
  tint**. Cross-check against the OKLCH tokens in globals.css before treating any of
  these as real.
- CLAUDE.md's own rules (no decorative gradients, flat `bg-muted` fallbacks, no eyebrow
  chips, grain texture at 3–5%) take precedence where they conflict. **CLAUDE.md wins.**

Deliverable: the triage table + a recommendation on whether DS2 is worth doing. If the
"Real" column is thin, say so and stop — that is a valid outcome, not a failed session.

---

### Session DS2 — Adopt Impeccable and rescue the design — `pending`
**Blocked by DS1.** Only run if DS1's "Real" column justifies it.

**1. Install, project-scoped, and understand what it writes.**
`npx impeccable install` writes: `.impeccable/` (working files), a `.gitignore` block
between `# impeccable-ignore-start/end` markers, and — on Claude Code — a design hook in
`.claude/settings.local.json` that runs the detector on UI file edits.
- Report every file it touched before continuing.
- **The hook is opt-in — decide deliberately.** It runs automatically on edits, which is
  useful for catching regressions, but it is a tool that writes during builds. Use
  `--no-hooks` if Hussain prefers manual runs. Ask; do not assume.
- Keep tracked: `.impeccable/config.json`, `.impeccable/design.json`,
  `.impeccable/critique/*.md`. The supplied gitignore block already handles the rest.

**2. Run `/impeccable init` — and protect the existing docs.**
`init` writes `PRODUCT.md` and offers `DESIGN.md` at repo root. It will ask whether the
surface is **brand** (marketing, landing, portfolio) or **product** (app UI, dashboard).
This is a **portfolio → brand**.

**Critical:** the design rules currently live in `CLAUDE.md`. Do not let `DESIGN.md`
become a second, conflicting source of truth — that is how the eyebrow/gradient
contradictions happened before. Resolve explicitly at Gate 1, propose both:
- (a) `DESIGN.md` holds the visual language; CLAUDE.md's design sections shrink to a
  pointer. One source of truth, more churn.
- (b) `DESIGN.md` is generated but explicitly subordinate — CLAUDE.md wins on conflict,
  stated at the top of both files. Less churn, two files to keep in sync.

Input for `init` — do not let it guess:
- Audience: galleries, collectors, luxury brands, agencies, international booking
- Anti-references: generic photographer-portfolio templates, SaaS-template look
- References: aikawakenichi.com, ten.375.studio, igloo.inc
- Voice: the `hm-visuals-voice` skill already defines this — feed it, don't reinvent it

**3. Apply commands where the queue is actually missing design direction.**
The highest-value targets are the two acknowledged gaps at the top of this file, not the
pages that already have sessions:
- **Homepage** — has no design session at all since D2 was deleted. Use
  `/impeccable shape` then `/impeccable craft` to produce a real direction.
- **About** — has no rebuild session. Same treatment.
- Then, per page: `/impeccable critique <page>` → triage → fix. Prefer `critique`
  (diagnosis) over `polish` (auto-changes) so Hussain sees the reasoning before code moves.

**4. Feed the results back into the queue.** Findings become concrete tasks inside the
existing design sessions (D4–D13), not a parallel workstream. Impeccable is the diagnosis
tool; this queue stays the plan of record.

**Guardrail for the whole session:** commands like `polish`, `bolder`, and `overdrive`
change code. This project's standard applies unchanged — Gate 1 report, Hussain approves,
then execute. Do not run a mutating command on a page without showing the plan first.

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

Read all public page components. Report every inconsistency before fixing anything.

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
