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
consolidation, card images) · Phase 2: D1 (preloader), D3 (photography 3-view viewer) ·
Phase S: S1–S7 (security, tests, reuse audit) · Phase DS: DS0–DS2 (skills, detector eval).
D2 (homepage WebGL scene) was removed from the queue entirely, not completed.

---

## Run order — set by Hussain 2026-08-17

**The site needs to go live as soon as possible.** Priority, in his words: design first,
then the security vulnerabilities, then the tags and subpages, then the rest. Phases are no
longer top-to-bottom — take sessions in exactly this order.

**Block 1 — Design (homepage is approved and specced).**
1. **D2b** — homepage sections. The globe section is part of this design; D2b builds the
   section shell and it renders nothing until D6 fills it (empty means empty).
2. **C4** — validated location on the media form. Prerequisite for D6, nothing else.
3. **D6** — exhibition globe.
4. **D2c** — About rebuild.

**Block 2 — Security.**
5. **S10** — admin login rate-limit bypass + email HTML injection.

**Block 3 — Tags and subpages.**
6. **T1** — tag taxonomy + `/admin/tags`.
7. **T2** — `/photography/[tag]` and `/videography/[tag]`. Blocked by T1.

**Block 4 — Everything else,** in this order:
8. **S8, S9, S11, N9** — small live bugs and admin work-loss. Each is under an hour; take
   them as a batch whenever there is a gap.
9. **L1** — launch prep. Small, and it is what actually gates going live.
10. **D4, D5, D7, D8** · **D9b before D9** · **D10, D11, D12**
11. **D13 last** — the consistency sweep; it needs everything else landed first.
12. **C1, C2, C3** · **P1, P2** · **NFT1, NFT2**

Hard dependencies, stated once so no session has to re-derive them:
`C4 → D6` · `T1 → T2` · `D9b → D9` · `D2b → D4`'s homepage transition · everything → `D13`.

---

## Minimum to go live

Going live does **not** require the whole queue. The launch-blocking set is:

| # | Session | Why it blocks |
|---|---|---|
| 1 | **D2b** | The approved homepage. |
| 2 | **C4 + D6** | The globe is part of the approved homepage; without C4 it shows wrong or missing cities. |
| 3 | **S10** | A bypassable admin-login lockout and an HTML-injectable notification email are not shippable. |
| 4 | **S8, S9** | S8 is a runaway rAF loop; S9 means a deactivated page stays publicly reachable. Both are visible in production. |
| 5 | **L1** | Rotate `ADMIN_COOKIE_SECRET`, verify hash login and the CSP against the deployed origin, fix `README.md`. |

Everything else — T1/T2, D4, D5, D7–D13, C1–C3, P1/P2, NFT — can ship after launch.
D10/D11/D12 pages stay behind their `isActive` toggle until they are built, which is exactly
what that toggle exists for.

---

## Gaps awaiting a decision from Hussain

Only genuinely-open items live here. Anything already scheduled has been moved out — the
old list mixed "RESOLVED, scheduled as Session X" entries under a header saying "not
sessions yet", which read as still-open to anyone skimming.

1. **Deeper test coverage — still open.** S3 shipped a Vitest baseline (auth unit tests +
   a server-module import smoke test) and CI running typecheck + lint + test (archive §S3).
   It is thin by design: the smoke test only asserts modules import, `admin-route.test.ts`
   mocks the admin guard it is testing around, `lib/private-galleries.ts` has zero coverage,
   and nothing tests rate limiting, query builders or `revalidatePath` wiring. Decide
   whether a real coverage session runs before launch or after.

**Closed since the last revision (do not reopen):**
- Homepage design → scheduled, Phase 2a §D2b. Direction decided 2026-08-17; CLAUDE.md
  "Design direction" is the spec. **The hero is fixed and out of scope.**
- About rebuild → scheduled, Phase 2a §D2c.
- Radius scale → **decided 2026-08-17.** Five-value scale codified in CLAUDE.md → Design
  tokens. Conversion of the nine remaining one-offs is a D13 task.

---

## Phase DS — Design system rescue (Impeccable)

**Context, in Hussain's words:** what shipped is generic AI-template output — exactly what
Impeccable exists to detect and fix.

**The root cause, stated plainly so no session repeats it:** the design was never
specified. It was described by pointing at other studios' websites, which is a vibe
pointer, not a spec — every session had to infer taste from pages it cannot see, so every
session guessed, and the guesses averaged out to template. **Those reference URLs are now
deleted from all project docs. Do not reintroduce them.** The fix is not a better
reference; it is a written specification — type scale, palette roles, layout system,
motion vocabulary, and a signature element per page — concrete enough that two different
sessions building the same page would produce the same thing.

**Producing that spec was the point of this phase, and it is now done.** The spec lives in
**CLAUDE.md → "Design direction"** — a measured census of the style the codebase already
uses, plus the decided typefaces, palette role and radius scale. DS2 deliberately did not
write a separate `DESIGN.md` (a second source of truth is what produced the old
contradictions — archive §DS2). No pending session is blocked on one.

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

## Phase S2 — Defects from the 2026-08-17 full-repo audit

Four sessions, all small, all with proven file:line evidence in CLAUDE.md → "Known
defects". **Run these before the D-phase design work** — S8 and S9 are live bugs, S10 is
security, S11 loses Hussain's work. None of them touches design.

### Session S8 — Two resource leaks — `pending`
1. **`components/site/AppShell.tsx:17-29`** starts a recursive `requestAnimationFrame` loop
   for Lenis but its cleanup only calls `lenis.destroy()`; the rAF id is never captured or
   cancelled. `AppShell` wraps `/admin/**` too (`app/layout.tsx:31`) and
   `app/admin/(protected)/layout.tsx:42-47` links back to the public site, so every
   admin↔public crossing leaves another loop running forever, calling `.raf()` on a
   destroyed instance. Capture the id and `cancelAnimationFrame` it in the cleanup.
2. **`components/site/WorkOverlay.tsx:96-120`** attaches document-level `pointermove` /
   `pointerup` listeners in `onPointerDown` and relies solely on `onUp` to remove them.
   Release the pointer outside the viewport and they persist for the life of the page, and
   `stopAutoRotate()` (line 99) never gets its matching `startAutoRotate()` — the cylinder
   stays permanently paused. Add `pointercancel`, and prefer `setPointerCapture` so the
   element keeps receiving events.

Read both files fully. No security surface. Add a test only if a pure helper is extracted.

---

### Session S9 — Revalidation coverage — `pending`
`app/web-development/page.tsx` exports no `revalidate` and no `dynamic`, so it is fully
static, and `app/api/admin/page-settings/[slug]/route.ts:53` hardcodes
`AFFECTED_PATHS = ["/", "/about", "/blog", "/testimonials", "/people", "/dancing"]` —
`/web-development` is missing while its structurally identical sibling `/dancing` is there.
Repo-wide grep confirms nothing else ever calls `revalidatePath("/web-development")`.

Failure today: deactivate Web Development in `/admin/pages`; the homepage/about/blog update
immediately, but a direct visit to `/web-development` keeps serving the stale active page
instead of its `redirect("/")` (`app/web-development/page.tsx:21`) until a redeploy.

Gate 1 must produce a **table of every public route × its caching directive × every admin
action that should invalidate it**, then fix the gaps — do not just patch the one path.
`about`, `blog` and `dancing` have the same missing-directive shape and must be checked.
Consider deriving `AFFECTED_PATHS` from the page registry instead of hardcoding it, so the
next page added cannot silently repeat this.

---

### Session S10 — Two security fixes — `pending`
1. **Admin login lockout is bypassable.** `app/admin/page.tsx:32-34` keys the rate-limit
   bucket on `${ip}|${userAgent}`. `User-Agent` is attacker-controlled, so varying it resets
   the 5-attempts/15-min lockout on every guess. Every other limiter in the repo keys on IP
   alone (`app/api/_lib/public-form-security.ts:1-5`,
   `app/api/private-galleries/access/route.ts:21-26`). Key on IP, and import the shared
   `getClientAddress` instead of the fifth local copy of that helper.
2. **Email HTML injection.** `lib/server/email.ts:19-29,45-55` interpolate `data.name`,
   `data.email`, `data.serviceName`, `data.category`, `data.about` and the message/review
   body straight into the Resend `html:` template with no entity encoding (the body only
   gets a `<br>` replace). A public submitter can put live markup — a phishing link — into
   the email Hussain reads. Add an `escapeHtml` helper, apply it to every interpolated
   field, and unit-test it in the same session (CLAUDE.md: new pure logic gets a test).

Gate 1 security line: no new trust boundary; no secret crosses to the client; both changes
tighten existing validation.

---

### Session S11 — Admin: stop losing work — `pending`
1. **No unsaved-work guard exists anywhere in the repo** (zero `beforeunload` matches).
   `/admin/pages` holds drafts for all 13 rows in React state (`usePagesAdmin.ts:94-98`) —
   roughly 170 fields — and the sidebar is plain `<Link>`s (`admin/(protected)/layout.tsx:9-20,65-73`).
   One click on any nav item discards every unsaved row with no confirmation. Add a guard
   covering both browser unload and in-app navigation. Lower-severity same-shape gaps:
   `ServiceEditorModal` Close/Cancel, `PeopleAdminClient` and `PrivateGalleriesAdminClient`
   Cancel / "Back to list".
2. **Partial saves report nothing useful.** `usePagesAdmin.ts:207-269` fires up to three
   concurrent PATCHes in one `Promise.all`; each `.then()` commits its own slice of local
   state (lines 220-230, 236-248, 253-260) but `discard(row)` only runs if the whole
   `Promise.all` resolves (line 266). If one of the three fails, two are durably saved
   server-side while the row still reads "Unsaved" and the banner says only "Failed to save.
   Try again." Report per-part success/failure, and only re-send the parts that failed.

Admin-only, no public surface. Read `usePagesAdmin.ts`, `PageRowCard.tsx`,
`admin/(protected)/layout.tsx`, `hooks/useAdminAction.ts` before writing.

---

### Session N9 — Stop public chrome rendering on admin — `pending`
`app/layout.tsx:30,32` mounts `<CustomCursor />` and `<SiteFooter />` as siblings of
`<AppShell>`, outside its `if (isAdmin) return <>{children}</>` gate
(`AppShell.tsx:14-15,31-33`). So `CustomCursor.tsx:10,64-81` sets `cursor-none` on `<html>`
on every route, and `SiteFooter.tsx:25-38` renders the full public marketing footer — every
discipline link plus the "HM VISUALS" brand lockup — at the bottom of every `/admin/*` page
including the login screen. `app/globals.css` has no admin-scoped override.

Decide the shape in Gate 1: move both inside `AppShell`, or give each its own `isAdmin`
check. Moving them in is the smaller change and makes CLAUDE.md's "all global elements live
in AppShell" true again — but `SiteFooter` is an async Server Component and `AppShell` is a
client component, so check that composition carefully before committing to it.

---

## Phase 2a — Design direction (runs before D4)

These are the two skill-driven design sessions DS2 routed here. They run **before D4–D13**
because they produce the design context those sessions read (same rationale as Phase DS).
**Order: D2b first, then D2c** — D4's homepage transition depends on D2b's output.
Each session loads **one** direction skill at a time (named in its Gate 1), never two at once.

### Session D2b — Homepage section pass — `pending`
**Not blocked. The old "blocked by DS2 until `DESIGN.md` exists" line is deleted** — DS2 is
archived `done` and explicitly declined to write `DESIGN.md` (archive §DS2), so that
precondition could never be met and this session sat frozen. CLAUDE.md → "Design direction"
is the spec now.

**THE HERO IS OUT OF SCOPE.** `HomeHero.tsx` and `HeroBokeh.tsx` are not to be redesigned
(Hussain, 2026-08-17). The only permitted hero touch in this session is adding `priority`
to the hero image if it is not already set. No layout, scrim, bokeh or CTA changes. Do not
propose any.

**Skill: `frontend-design` only.** One direction skill per pass (archive §DS2). Do not also
load `redesign-existing-projects`.

**Before writing any code:** read `app/page.tsx`, every `components/home/*` file,
`PortfolioCard.tsx`, `ServiceCard.tsx`, `SingleReviewCard.tsx`, `StickyCta.tsx`,
`SiteFooter.tsx`, and CLAUDE.md → "Design direction" (the style census table). Report the
plan against that table — every new class must already appear in it.

**Homepage section order (approved 2026-08-17) — build in this order:**

| # | Section | Component |
|---|---|---|
| 1 | Hero | `HomeHero.tsx` — **untouched** |
| 2 | **Exhibition globe** | new, §D6 — D2b creates the section shell only |
| 3 | Featured Work | `HomeFeaturedWork.tsx` + `PortfolioCard.tsx` |
| 4 | Creative System + Services Preview (side by side) | `HomeCreativeSystem.tsx`, `HomeServicesPreview.tsx` |
| 5 | Trust | `HomeTrust.tsx` |
| 6 | Sticky CTA | `StickyCta.tsx` |

The globe sits **directly under the hero** — Hussain's call — so the exhibition record is
the first thing a visitor meets after the opening frame. Until D6 ships, D2b renders that
section as nothing at all (not a placeholder, not a panel): empty means empty.

**Scope, section by section:**

1. **Featured Work** (`HomeFeaturedWork.tsx`, `PortfolioCard.tsx`)
   - Give the grid a deliberate hierarchy: the first visible card spans both columns.
     Today the *last* card spans both only when the count is odd (`HomeFeaturedWork.tsx:22`)
     — an accident, not a decision.
   - `PortfolioCard` gains a `priority?: boolean` prop; `HomeFeaturedWork` passes
     `priority={index === 0}`. **This is the LCP warning Hussain is seeing** — `PortfolioCard`
     currently never sets priority (`PortfolioCard.tsx:29-35`).
   - `PortfolioCard` gains an optional `tags?: {label, href}[]` row rendered under the
     description, in the chip style from CLAUDE.md's table. Links to the T2 subpages.
     **A card that contains tag links cannot itself be one `<a>`** — nested anchors are
     invalid and the browser un-nests them. Restructure as a `div` + an absolutely
     positioned cover link + the title/chips/CTA as real links above it in z-order.
   - Everything else about the card is unchanged: `rounded-[2.25rem]`, the bottom scrim
     (functional contrast, not decoration — keep it), the hover zoom, the on-image pill.
2. **Creative System** (`HomeCreativeSystem.tsx`) — unchanged shape. Only the nested-anchor
   restructure above, since it also carries links inside the card.
3. **Services Preview** (`HomeServicesPreview.tsx`) — **delete the outer
   `div.premium-panel` wrapper.** That single change removes a card-in-card, which CLAUDE.md
   bans and DS1's Impeccable scan flagged on this exact block. The heading moves onto the
   page; `ServiceCard` is untouched. The "View services" pill stays.
4. **Trust** (`HomeTrust.tsx`) — same: **delete the outer `div.premium-panel`.** Second
   card-in-card. `HomeTestimonialCard` / `SingleReviewCard` untouched.
5. **The button system** — unify all three CTA shapes onto the single geometry, variant set
   and motion signature in CLAUDE.md → "The button system". One shared `Button` component
   (or one `cva` recipe) used by `PortfolioCard`, `HomeServicesPreview`, `HomeTrust`,
   `HomeCreativeSystem`, `StickyCta`, `ServiceCard` and the tag chips. Adds the press state
   (`active:scale-[0.975]`), the focus ring and the sliding `→` that none of them have
   today. **The hero's two pills are excluded** — they keep `px-6`; the hero is fixed.
6. **The section system** — every section opens with a full-width hairline inside its
   `.section-shell`; switch the rhythm from `py-12 sm:py-16` to `pt-12 sm:pt-16` with no
   bottom padding except on the last section. See CLAUDE.md → "The section system" for why.
7. **Sticky CTA** (`StickyCta.tsx`) and **`SiteFooter.tsx`** — swap `surface-3` /
   `surface-1` glass for `bg-card`, drop the `backdrop-filter`. Fixes the 1.1–1.4:1 minimum
   pixel contrast DS1 measured. Same radius, same layout, same copy, same admin fields, same
   modal-hide behaviour.

**Constraints that still bind (do not "fix" these):** hero renders the admin-picked
`hero.image.url` only, flat `bg-muted` when empty (S4). **No eyebrows, kickers or stat
strips** — no small uppercase label above a section heading, no tally blocks (CLAUDE.md →
"What is NOT in the design"). No decorative gradients — the image scrims on work cards are
functional and stay. No scroll-jacking. Grain unchanged.
`.section-shell` for containers. Empty means empty. Every string still comes from
`page_sections` / `page_seo` — no new admin field in this session.

**Gate 2 verification:** open `/` and confirm — the LCP warning for the Featured Work image
is gone; no `premium-panel` wraps another bordered card anywhere on the page; tag chips
navigate to the T2 routes; the page renders correctly with every section image blank.

**Deliverable:** the five section changes above, plus the globe section shell (empty until
D6). The homepage in/out transition spec is **already written into §D4** ("Homepage → any:
the contact-sheet move") — D2b does not need to produce it and must not re-spec it. If the
build shows the spec is wrong, correct §D4 in the same commit.

### Session D2c — About page rebuild — `pending`
About has never had a rebuild session (flagged twice in N5). It is still
an interim page (header + card grid + booking bar).

**Skills (DS0) — one at a time:**
- `redesign-existing-projects` — audit the current About page **first**. Report findings.
- `frontend-design` — the rebuild pass, after the audit. Do not run both skills in one
  pass (produces mush — CLAUDE.md).

**Before writing any code:** read `app/about/page.tsx` and all its imports, `PageHeader.tsx`,
the About `page_sections` content and the About header/SEO fields. Report the audit before
rebuilding anything.

**Constraints:** `PageHeader` component (no `eyebrow` prop), `.section-shell`, no gradient
fallbacks, `AnimatedText` on the h1, empty means empty.

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
- **Homepage → any: the contact-sheet move.** The photograph currently on screen splits
  into a grid of frames; each frame scales down and clears in a staggered, randomised order
  while the destination page's own first image assembles from the same cells. ~1.0s total.
  Pure CSS transforms on ~40 divs sharing one `background-image` — no Three.js, no new
  dependency, GPU-composited. Reverses on the way back. Falls back to a cross-fade under
  `prefers-reduced-motion`.
  **This is a navigation transition, not a loading screen.** The Preloader (D1) is untouched
  and keeps its logo/name sequence on every arrival at `/`; this fires only on a deliberate
  click, after the page is already loaded. Do not merge or replace the two.
  The destination image must be known before navigation starts — that is what
  `TransitionContext` is for.

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

### Session C4 — Media locations: validated city + stored coordinates — `pending`
**Runs before D6 and directly after D2b. D6 is unbuildable without it** — full evidence in CLAUDE.md →
"Appearances admin". Short version: `city`/`country` are free text, there are no
coordinates stored anywhere, the resolver is an exact match that returns `null` silently,
and the two label formats in the repo (`"Dubai, AE"` vs `"Dubai, United Arab Emirates"`)
do not agree with each other.

**Hussain, 2026-08-17:** *"for the cities in the globe, the source is the media, so the
location in the media form need to follow the same system in the testimonials, so the globe
will fetch correct data."*

The media form has **two** free-text location surfaces, and both are in scope:
- `appearances[].city` / `.country` (`MediaAppearancesSection.tsx:70-81`) — **this is what
  the globe reads**, filtered to `kind === "exhibited"`.
- the media document's own `location` field (`MediaDetailsSection.tsx`) — free text today,
  shown on public media detail and searched by `/api/media/list-public`.

Both move to the validated selector so they cannot disagree with each other. The globe's
source stays `appearances` where `kind === "exhibited"` — unchanged from the original D6
spec and from CLAUDE.md → Globe. **Confirm this one line with Hussain at Gate 1** before
building the aggregation: exhibited appearances only, not every media item's `location`.

Scope:
1. Replace the two free-text inputs in `MediaAppearancesSection.tsx:70-81` **and the
   `location` input in `MediaDetailsSection.tsx`** with the existing validated city selector
   — reuse `components/testimonials/review-form/LocationSearch.tsx` and
   `/api/testimonials/location-search`, do not build a second one.
2. Extend the `Appearance` type with `locationId`, `lat`, `lon` and **persist them at save
   time**, so nothing geocodes at render time. Update `sanitizeAppearances`
   (`app/api/_lib/media.ts:36-63`) to validate and carry them. The type is currently declared
   in four places with no shared import — collapse to one and import it everywhere
   (`_lib/media.ts`, `media-serializers.ts`, `components/media/types.ts`,
   `admin/media/lib/types.ts`).
3. `lib/server/public-nfts.ts:42-44` uses its own weaker `isAppearance` check — replace it
   with the shared sanitiser so NFT appearances get the same validation.
4. **No backfill script.** Hussain is deleting the existing media and re-entering it through
   the new form (2026-08-17). Do not write a migration. Do not attempt to resolve legacy
   free-text values. The new selector is the only path in.
5. Admin warning: flag any saved appearance with no resolved coordinates, using the same
   pattern as the "Needs image" pill (`usePagesAdmin.ts:129-137`).

Read before writing: `MediaAppearancesSection.tsx`, `useMediaAppearancesState.ts`,
`app/api/_lib/media.ts`, `lib/server/location-search.ts`, `lib/locations/testimonial-locations.ts`,
`scripts/import-geonames-cities.mjs`, `components/testimonials/review-form/LocationSearch.tsx`.

---

### Session D6 — Exhibition globe — `pending`
**Blocked by C4.** Do not start until appearances carry stored coordinates.

A standalone `.section-shell` section **directly under the hero** (homepage section 2 — see
the order table in §D2b). Layout: a **compact** ranked city index on the left, the globe
taking the remaining width.

**The globe is the primary element; the index is secondary.** Hussain, 2026-08-17.

Desktop (≥1024px): `grid-template-columns: minmax(150px,180px) 1fr` — a narrow index on the
left, the globe taking the rest and vertically centred against it.

Below 1024px the order **inverts**: the globe comes first at full width, and the index
follows as a **two-column table** (single column under 360px). A twelve-row list stacked
above a globe is the layout Hussain rejected — use `order` on the two grid children, not a
DOM reorder, so the markup stays index-then-globe for screen readers.

Index row: `grid-template-columns: minmax(0,auto) minmax(.75rem,1fr) auto` — city name,
a **dotted leader rule**, then the count. The leader is what makes a bare number read as an
index entry instead of looking orphaned; without it the count needs a "WORKS" suffix, and
that suffix is banned. Name at `0.78rem` with `text-overflow: ellipsis`; count in Geist Mono
at `0.625rem` with `font-variant-numeric: tabular-nums`. Hairline between rows.

**No "Browse the archive" button.** Every city row is already a link into the archive; a
second entry point beside them is noise. Removed 2026-08-17.

**No kicker above the heading and no stat strip.** An earlier draft had an `EXHIBITED`
label above the h2 and a `12 CITIES / 12 COUNTRIES / 64 WORKS / SINCE 2019` block under the
list. Hussain rejected both, 2026-08-17: *"remove these and stop adding these stupid
comments."* See CLAUDE.md → "What is NOT in the design".

Data — none of this exists yet, write it:
- `getExhibitionCities()` in `lib/server/public-media.ts`. **There is no `getAllMedia()`** —
  every existing fetcher is category-scoped and capped at 60 (`public-media.ts:29-45`), so
  writing this on top of one of them will silently under-report. Query `media` directly:
  public + `appearances.kind === "exhibited"`, and aggregate in Mongo, not in JS.
- Group by the `locationId` C4 stores (never by the free-text label). Return
  `Array<{ city, country, lat, lon, workCount, mediaIds }>`.
- Cache with the page's existing `revalidate = 300`. No per-request geocoding — C4 removed
  the need for it.

Globe:
- `react-globe.gl` (already in `package.json`, unused). Load with
  `next/dynamic({ ssr:false })` behind an `IntersectionObserver` so it costs the homepage
  nothing until scrolled into view.
- **Texture: copy `node_modules/three-globe/example/img/earth-dark.jpg` (95 KB) and
  `earth-topology.png` into `/public/globe/` and point `globeImageUrl` / `bumpImageUrl`
  there.** Same-origin, so `img-src 'self'` already covers it — **no CSP edit**. Never
  reference unpkg or any CDN; CSP blocks it and the globe ships as a black ball.
- Markers: white dot + a hairline ring whose radius encodes `workCount`. No arcs — arcs
  imply travel between cities, which is not what happened.
- Auto-rotate 0.35°/s when idle; drag to rotate; resume 2.5s after release. Markers fade by
  distance from the limb.
- Hover a list row → its marker highlights, and vice versa. Click a city → the existing
  `MediaLightbox` with that city's exhibited works.
- Palette: existing OKLCH tokens only, no accent colour (CLAUDE.md → Design direction).
- Under the list: `N cities · M countries · K exhibited works` in the mono micro-label style.

**Do not re-derive:** `three-globe` rotates the globe mesh `rotation.y = -Math.PI/2` and
places markers with `phi=(90-lat)`, `theta=(90-lng)`, `x=r·sinφ·cosθ, y=r·cosφ, z=r·sinφ·sinθ`
(`three-globe/dist/three-globe.mjs:450-460,651`). Use react-globe.gl's own `pointsData`
API and this problem does not arise; only hand-placed meshes need it.

Read: `app/page.tsx`, `lib/server/public-media.ts`, `lib/server/media-serializers.ts`,
`components/media/MediaLightbox.tsx`, `components/media/types.ts`, `next.config.ts` (CSP).
Propose the aggregation query and the section layout. Wait for approval.

**Skills:** `pick-ui-library` to confirm react-globe.gl beats a raw Three.js globe here
(it is already installed, so this is the last cheap moment). `animate` for the
auto-rotate / drag / resume choreography spec.

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

**From the 2026-08-17 audit — verified, use these instead of re-surveying:**
- **`/admin/pages` is not an accordion.** `PageRowCard.tsx:70-71` renders each open row as
  `<div className="fixed inset-0 z-50 …">` — 13 independent full-screen modals behind 13
  toggle buttons. D9b's own framing question ("is one accordion per page still right?")
  has no accordion to evaluate. Field counts per row: Home 27, Web Development 22, About 20,
  Blog 20, Dancing 19, Photography/Videography/NFT 10 each, People 8, Testimonials 8,
  People-detail 6, Services 5, Contact 5 — **≈170 inputs total.**
- **Five different interaction patterns for the same job.** Modal overlay (Services, Pages
  rows) · same-page list⇄form swap with no URL change (People, Private Galleries) · two
  separate routes (Media form vs Media list) · inline expand-in-row, the only real accordion
  (Inquiries, `InquirySection.tsx:56-133`) · always-editable cells with per-field `onBlur`
  autosave and no save/cancel (Service Categories, `CategoryRowSortable.tsx:36-57`).
- **Ordering is split too:** dnd-kit drag on Services, Service Categories and Pages
  repeating cards; **no manual ordering at all** on Media, People, Private Galleries,
  Testimonials.
- **`POST /api/testimonials/reorder` is fully built, admin-gated, validated, and called from
  nowhere.** `sortOrder` drives both the public order (`lib/server/testimonials.ts:59`) and
  the admin list, yet `TestimonialsAdminClient.tsx` has no drag handle and no order field —
  the only thing that ever sets it is the auto-increment on public submission
  (`api/testimonials/submit/route.ts:195-230`). **Hussain cannot reorder testimonials.**
  Either wire the endpoint up or delete it.
- **`media.order` is dead schema** — defaulted to `0` at creation
  (`api/media/create/route.ts:144-147`), never sent by the editor, never read by any query.
- **CLAUDE.md rules the admin does not follow.** Feedback (CLAUDE.md: "never hand-roll the
  try/catch+setFeedback pattern"): only `usePagesAdmin.ts` actually calls `useAdminAction`'s
  `run()`; three surfaces import the hook and still hand-roll
  (`AdminServiceCategoriesClient.tsx`, `media/list/page.tsx`, `TestimonialsAdminClient.tsx`),
  three skip it entirely (`inquiries/page.tsx`, `useMediaEditorController.ts`,
  `usePrivateGalleriesAdmin.ts`), and `useServicesAdmin.ts:64-88` is a **third** generic
  wrapper with its own 4s/7s auto-dismiss that nothing else has. Image picker (CLAUDE.md:
  "don't build another picker"): three exist — `ImageField.tsx`, plus hand-rolled
  `CldUploadWidget` blocks in `ServiceEditorModal.tsx:58-199` and `PeopleAdminClient.tsx:171-216`.
  dnd-kit sortable is reimplemented three times with its own boilerplate each. Eight files
  hand-roll the same `text-2xl font-semibold tracking-tight` page header — the admin has no
  `PageHeader` equivalent. Three separate hydration guards do the same thing.
- **Silent failures.** `MediaDetailsSection.tsx:52-64` `loadPeople()` is `catch {}` with no
  feedback. `CategoryRowSortable.tsx:36-44` / `CategoryRowStatic.tsx:22-32` are uncontrolled
  (`defaultValue`) inputs autosaving on blur — on failure only the page-top banner fires and
  the field keeps showing the unsaved value, because React never re-renders it back.
- **Dead surfaces:** `/admin/removal-requests` is a hardcoded stub (owned by D12, but it is
  live in the sidebar today); `/admin/nfts` is three stat tiles and two nav buttons, and is
  the only admin page querying MongoDB directly from a page component.

Constraint: no data-model changes in this session. Presentation only — the three
collections stay as they are (that reasoning is in archive §N5 Part 2). S11 (unsaved-work
guard) is a **separate, earlier** session — do not fold it in here.
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
  `components/shared/SmartImage.tsx`. **List re-verified 2026-08-17; the old one was
  stale.** Public-side violations are 5 files: `PortfolioCard.tsx:1`, `PeopleIndex.tsx:4`,
  `ServiceCard.tsx:1` (new since the old list was written), `SmartMediaPreview.tsx:1`,
  `review-form/PreviewImage.tsx:3`. `app/services/page.tsx` was named in the old list and
  **no longer imports it** — it delegates to `ServiceCard`. Admin side is 8 files, not 6
  (`MediaAssetSection`, `MediaListItem`, `PeopleAdminClient`, `ServiceEditorModal`,
  `TestimonialForm`, `TestimonialShared`, `ImageField`, `PrivateGalleryMediaCard`) and stays
  D9 territory. `SafeImage.tsx` is a documented wrapper exception — evaluate each, don't
  blind-swap. `WorkOverlay.tsx` was fixed in N5 Part 3; the overlay stays mounted at
  opacity 0, so its images must load eagerly.
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
- **Undersized functional text.** Two sources, re-verified 2026-08-17 — the old entry put
  both in one file. `WorkOverlay.tsx:237` discipline sublabels are `text-[9px]`; the 10px
  "HM" logo mark is `Navbar.tsx:69`, **not** WorkOverlay. Both still unfixed. Bump to ≥11px
  (CLAUDE.md's micro-label spec sets 11px as the floor).
- **`transition: width, height`** on a shared element (all pages) — animate `transform`
  instead to avoid layout thrash. Find the one component and fix.
- **Nested cards** on home / contact / videography (card-in-card is banned — CLAUDE.md).
  Testimonials' nested card is its deliberate hero-card layout — leave it.
- **Line length** 96–112 ch on body copy across 8 pages — tighten prose measure toward <80ch.
- Re-run the URL scan after fixing and confirm these drop out (invocation in DS2 step 2).

**From the 2026-08-17 full audit — verified, each with file:line:**
- **Gradient fallbacks, which CLAUDE.md bans.** `SmartMediaPreview.tsx:93` — the *shared*
  empty-state renderer defaults to `bg-linear-to-br from-muted to-background`, and none of
  its four call sites override it (`PrivateGalleryBrowser.tsx:59-66`, `MediaCardGrid.tsx:39-49`,
  `NftCard.tsx:44-52`, `PhotographyHorizontal.tsx:162-171`). Also `SmartMediaPreview.tsx:32`
  uses `from-zinc-900 via-zinc-800 to-zinc-950` — hardcoded palette outside the tokens. Also
  `PortfolioFallbackPanel.tsx:29`, which renders on 7 pages' empty states.
- **Eyebrow chip, banned in N4, still shipping on every page.** `SiteFooter.tsx:42` uses the
  literal `.eyebrow` class. (The footer brand lockup was classified Intentional in DS1 — the
  *class* is still the banned component; decide once and record it.)
- **`PageHeader` bypassed** in 4 places: `people/[slug]/page.tsx:68-70`,
  `services/[slug]/page.tsx:56-58`, `g/[slug]/page.tsx:36`, `GalleryPasswordForm.tsx:53`.
  Three of them hand-roll markup byte-identical to the component's own default.
- **`AnimatedText` missing on one h1**: `GalleryPasswordForm.tsx:53`.
- **`PortfolioCard` has one call site** (`HomeFeaturedWork.tsx:24`) and four hand-rolled
  near-duplicates: `HomeCreativeSystem.tsx:27-63`, `NftCard.tsx:26-73`, `ServiceCard.tsx:24-60`,
  `PrivateGalleryBrowser.tsx:49-75`. Evaluate each — some genuinely differ.
- **Radius one-offs.** The scale is now decided (CLAUDE.md → Design tokens: `full`, `xl`,
  `2xl`, `[2rem]`, `[2.25rem]`). Convert the nine remaining values — `[1.5rem]` ×9,
  `[1.25rem]` ×8, `3xl` ×3, `xs` ×2, `[1rem]`, `[1.75rem]`, `[0.85rem]`, `[1.2rem]`,
  `[0.95rem]` — almost all in `components/testimonials/`.
- **`components/ui/dialog.tsx` and `sheet.tsx` are installed and imported by nothing.** Six
  hand-rolled overlays instead, with four different backdrop opacities for the same scrim
  role: `MediaLightbox.tsx:70` `bg-black/70`, `NftModal.tsx:25` `/72`, `ReviewModal.tsx:21`
  `/55`, `PublicReviewForm.tsx:224` `/55`, `PrivateGalleryBrowser.tsx:112` `/72`,
  `WorkOverlay.tsx:166` `/92`. Pick one value; adopt the primitive or delete it.
- **Five different "no results" treatments**: `MediaCardGrid.tsx:18`,
  `PhotographyCylinder.tsx:294`, `PhotographyHorizontal.tsx:136`, `NftCollection.tsx:47`,
  `PeopleIndex.tsx:32`. `PortfolioFallbackPanel` covers none of them.
- **H1 has 6 size/weight/tracking combinations across 15 routes**; H2 has 7 across 12 files.
  `photography/page.tsx:36` overrides `PageHeader` to `text-2xl! sm:text-3xl!` — visibly
  smaller than every other page. `about/page.tsx:26` adds a `lg:text-6xl` no other page has.
- **Section padding** is `py-12 sm:py-16` on 10 of 15 routes; videography, contact,
  `GalleryPasswordForm`, photography and testimonials each deviate differently.
- **`page_seo.title` / `.headerTitle` cannot be blanked** — `lib/server/page-seo.ts:144,146-149`
  truthy-gate them so an empty string reverts to a hardcoded default, while
  `.description`/`.headerDescription`/`.ogImageUrl` in the same form pass empty through.
  Inconsistent with "empty means empty" and inconsistent within one form.
- **Duplicated types/logic to collapse:** the same appearance shape declared 4× — three
  named `Appearance` (`_lib/media.ts:4-14`, `components/media/types.ts:1-11`,
  `admin/media/lib/types.ts:11-21`) and one named `PublicAppearance`
  (`media-serializers.ts:4-14`) — note C4 also touches this, coordinate; dead+drifted `toPublicTestimonial` in
  `testimonial-serializers.ts:3-17,39-57`; two independent discipline matchers
  (`public-services.ts:37-51` vs `HomeServicesPreview.tsx:15-23`); appearances formatting
  forked between `media/utils.ts:3-5` and `NftModal.tsx:155-186`; IP extraction reimplemented
  in 5 places instead of importing `getClientAddress` (`_lib/public-form-security.ts:1-5`).
- **Discipline display names hardcoded in 4 places**, none reading the admin-editable
  `page_seo.headerTitle`: `api/work-overlay/route.ts:6-12`, `SiteFooter.tsx:14-23`,
  `HomeCreativeSystem.tsx:5-10`, `HomeServicesPreview.tsx:6-13`. Rename a page in admin and
  the nav overlay, footer and homepage links keep the old name.
- **Dead code to delete:** `WorkOverlay`'s `activeSlugs` prop (never passed by its only
  caller, `Navbar.tsx:209`); `StickyCta`'s default props (all 11 call sites pass explicit
  values); `app/api/testimonials/geocode/route.ts` (no client calls it — but check C4 first,
  it may become useful).

Read all public page components. Report every inconsistency before fixing anything.

**Skills to use here (installed in DS0):** `improve-animations` for a repo-wide motion
audit with prioritised, self-contained fix plans — this is the right session for it,
once all the motion work (D4–D8) has landed. Re-run `npx impeccable detect` too and
compare against DS1's triage table: anything in the "Real" column that is still present
is unfinished work.

---

## Phase T — Tag taxonomy & discipline subpages

Raised by Hussain 2026-08-17: *"i need subpages for the pages i have, specially for
photography and videography, and that will be based on tags of the media, that will be
updated from the media form and there should be a control somehow for the tags, like in a
separate admin page, just like the people. So if a user goes to photography/fashion, all
media with the fashion tag will appear there."*

**T1 before T2.** T2 cannot be built on today's tag data — see T1's first paragraph.

### Session T1 — Tag taxonomy: `media_tags` + `/admin/tags` — `pending`

**Why the data has to change first.** `media.tags` is a comma-separated free-text field
(`MediaDetailsSection.tsx:190-197` → `toList()` in `admin/media/lib/utils.ts:19-25`: split
on comma, trim, drop empties, cap 60). Server-side `asStringArray`
(`app/api/_lib/common.ts:39-46`) does exactly the same and no more. **No lowercasing, no
dedupe, no canonical list** — so `"Fashion"`, `"fashion"` and `"fashion "` are three
different tags today, and `/api/media/list-public?tag=` matches **exactly and
case-sensitively** (`route.ts:83-84`). A subpage built on that would silently show a subset.

**Precedent to follow: `service_categories`.** It is the existing admin-managed taxonomy
with ordering, an `isActive` flag, cascade-on-rename
(`app/api/service-categories/[id]/route.ts:81-90`), a delete guard when still referenced
(`CATEGORY_HAS_SERVICES`, line 98-132), and a reserved system row
(`lib/db/ensureSystemCategories.ts`). Mirror it; do not invent a new pattern.

**1. Collection `media_tags`**
```
{ _id, label, slug, description, disciplines: string[],
  isActive: boolean, order: number, createdAt, updatedAt }
```
- `slug` is lowercase, `[a-z0-9-]`, unique. `label` is what a visitor sees.
- `disciplines` limits which discipline pages may produce a subpage for this tag
  (e.g. `["photography","videography"]` for "fashion", `["photography"]` for "portrait").
  A tag with an empty `disciplines` is still usable as a filter but produces no subpage.
- `description` is optional and feeds the subpage header + SEO in T2.
- **Reserved slugs:** `videos` — `app/videography/videos/page.tsx` is a static child segment
  and Next resolves static before dynamic, so a tag with that slug would be unreachable
  under `/videography/[tag]`. Reject it in validation, the same way `others` is reserved for
  service categories.

**2. `media.tags` stores slugs, not labels.** This keeps the existing compound index
`{ tags: 1, isPublic: 1, createdAt: -1 }` (`scripts/ensure-indexes.mjs:65`) working exactly
as it does now — **do not add another index.** Display labels are resolved from `media_tags`.

**3. No migration script.** Hussain's call, 2026-08-17: *"no migration script for the tags,
i will delete existing media and update them manually."* Do not write one, do not propose
one, and do not add legacy-value handling to the read path. `media.tags` is assumed to
contain slugs from the taxonomy only. If any legacy free-text value survives, it simply
matches nothing — that is acceptable and intentional.

**4. `/admin/tags`** — list + create/edit/delete, matching the service-categories surface:
- Row shows label, slug, disciplines, active state, and **live media count** per tag.
- Reorder via dnd-kit — but extract the shared sortable-list primitive first, because it is
  currently reimplemented three times (see §D9b) and this would be the fourth.
- Rename cascades: `media.updateMany({ tags: oldSlug }, { $set: { "tags.$": newSlug } })`.
- Delete blocked while any media references the tag; offer "detach from N items" explicitly.
- Deactivating a tag hides its subpage and its chips but does not touch media.

**5. Media form** — replace the comma-separated input in `MediaDetailsSection.tsx:190-197`
with a multi-select against `media_tags`. Creating a new tag inline is allowed but must go
through `POST /api/media-tags` so it lands in the taxonomy; never write a raw string.

**6. API** — `app/api/media-tags/route.ts` + `[id]/route.ts`, using
`app/api/_lib/admin-route.ts` for the `[id]` preamble (CLAUDE.md: don't re-inline it).
Public GET must be rate-limited and return active tags only.

Read before writing: `MediaDetailsSection.tsx`, `useBaseMediaEditorState.ts`,
`admin/media/lib/utils.ts`, `app/api/_lib/common.ts`, `app/api/_lib/media.ts`,
the whole `service-categories` admin + API, `lib/db/ensureSystemCategories.ts`,
`scripts/ensure-indexes.mjs`, `components/media/MediaTagChips.tsx`, `useMediaSearch.ts`.

**Gate 1 must include:** confirmation that no migration is being written, and the list of
places that read `media.tags` today (`MediaTagChips`, `useMediaSearch`, `list-public`'s
`?tag=`, `admin-list` search, `MediaDetailsSections` pills, `MediaListItem` pills,
`NftCollection`, `NftModal`) with a one-line statement of how each behaves once tags are
slugs and labels come from the taxonomy.

---

### Session T2 — `/photography/[tag]` and `/videography/[tag]` — `pending`
**Blocked by T1.**

**Precedent to follow: `/people/[slug]`** (`app/people/[slug]/page.tsx`) — on-demand render,
`export const revalidate = 300`, `notFound()` when the record is missing or not public,
`generateMetadata` reading a `page_seo` slug whose defaults carry a `{name}` token that is
`replaceAll`'d at request time (`lib/server/page-seo.ts:96-104`, used at
`people/[slug]/page.tsx:27-28`). Mirror all of it.

**Routes:** `app/photography/[tag]/page.tsx`, `app/videography/[tag]/page.tsx`.
No collision under `/photography` (it has no child segments). Under `/videography`, the
static `videos/` segment wins over the dynamic one — T1 reserves that slug.

**Data:** `getMediaByTag({ category, tagSlug, limit })` in `lib/server/public-media.ts`,
reusing `buildPublicMediaQuery` so the public/`isPublic` rule stays in one place. The
existing `?tag=` support in `/api/media/list-public` (exact match + keyset pagination, 60
cap) powers "Load more" — do not write a second endpoint.

**Behaviour:**
- `notFound()` if the tag does not exist, is inactive, or does not list this discipline in
  its `disciplines` array.
- Header via `PageHeader` (never inline h1 — D13 already logs four violations of this):
  title from a new `page_seo` slug `photography-tag` / `videography-tag` with a `{tag}`
  token, description from `media_tags.description` when set, falling back to the SEO
  template. Add both slugs to `ALL_PAGE_SECTIONS_SLUGS` / the page-seo defaults and to
  `/admin/pages` so they are editable, matching how `people-detail` is handled.
- Body: the same viewer the parent page uses, with the tag pre-applied —
  `PhotographyViewer` for photography, `MediaGrid` for videography. Do **not** fork them.
- A back link to the parent discipline, and the sibling tags as chips so a visitor can move
  between subpages without going back up.
- Empty result: `PortfolioFallbackPanel`, the existing shared empty state. Never a gradient.
- `StickyCta` from the parent page's `page_sections` entry — no new CTA copy.

**Minimum-count rule:** a tag chip should not lead to a near-empty page. Add a threshold
(default 3 public items) below which a tag renders no chip on the parent page and no card
on the homepage. Put the threshold in `media_tags` or a single shared constant — **not
hardcoded in a component**.

**Revalidation — do not repeat §S9's bug.** Saving media or editing a tag must
`revalidatePath` the affected subpages as well as the parent. Since the tag set is dynamic,
derive the paths from the tags on the saved document rather than hardcoding a list.

**Homepage link-through:** D2b adds the tag chips to `PortfolioCard`. If D2b has already
run, wire the real hrefs here; if not, T2 leaves the chips out and D2b picks them up.

Read before writing: `app/people/[slug]/page.tsx`, `lib/server/public-people.ts`,
`lib/server/page-seo.ts`, `lib/server/page-sections.ts`, `app/photography/page.tsx`,
`app/videography/page.tsx`, `components/photography/PhotographyViewer.tsx`,
`components/media/MediaGrid.tsx` + `useMediaSearch.ts`, `app/api/media/list-public/route.ts`,
`app/admin/(protected)/pages/usePagesAdmin.ts`.

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

## Phase 4 — People & launch prep

### Session L1 — Launch prep checklist — `pending`
Created 2026-08-17 because S1 deferred work that no session tracked (archive §S1:
*"Item 2 (rotate `ADMIN_COOKIE_SECRET`): DEFERRED… Carry to launch prep: rotate it in
Netlify env when the site is first deployed, alongside a deploy-time re-verification of the
CSP… and of hash login."*). Phase 4 contained only P1 and P2, so it was never picked up.

1. **Rotate `ADMIN_COOKIE_SECRET`** in the Netlify environment at first deploy. Rotating
   invalidates every existing session token by design.
2. **Verify hash login against the deployed build** — `ADMIN_PASSWORD_HASH` set, no
   plaintext `ADMIN_PASSWORD` anywhere (S1 deleted the fallback; confirm it stayed deleted).
3. **Re-verify the CSP in the browser on the deployed origin**, not locally: Cloudinary
   images load, the upload widget opens, the OpenStreetMap embed on `/testimonials` renders
   (S1's CSP omitted `frame-src www.openstreetmap.org` and silently broke it — archive §S6),
   and the globe texture loads from `/public/globe/` once D6 has shipped.
4. **Confirm `/admin/*` is `no-store` + `noindex`** as `next.config.ts:76-81` intends.
5. **Rewrite `README.md`.** It is still unedited `create-next-app` boilerplate and
   README.md:32-36 tells the reader to deploy on Vercel, contradicting CLAUDE.md:23
   ("Deployed on Netlify — not Vercel"). It names none of the real stack.
6. **Update CLAUDE.md → "Domain & deployment status"** in the same commit, so the ambiguity
   that made two sessions read it two different ways cannot come back.

---

### Session P1 — Performance audit — `pending`
Audit the full public site for performance.

- Lighthouse scores on homepage, photography, videography, NFT, dancing pages.
- Identify and fix the largest performance issues.
- Verify Three.js scenes are disposed correctly on unmount.
- Verify GSAP ScrollTrigger instances are killed on unmount.
- Verify Lenis is destroyed and reinitiated correctly on route change.
- Image optimization: verify all Cloudinary images use appropriate quality and format settings.
- Caching strategy — **the old numbers here were wrong; re-counted 2026-08-17.** There are
  **28 `page.tsx` files in total, not 39 — and only 16 are outside `app/admin/`.** One of
  those 16 is the content-free `app/videography/videos/page.tsx` redirect stub, leaving 15
  real public routes. Across those 15: 3 use `force-dynamic` (`contact`, `services`,
  `g/[slug]` — the last also redundantly sets `revalidate = 0`), 8 use `revalidate = 300`,
  and **4 have no directive at all** (`about`, `blog`, `dancing`, `web-development`) so they
  are fully static and only ever refresh on demand. The `videos` stub has no directive
  either, but it only redirects, so it is harmless. That last
  group is the actual problem — see §S9. `revalidatePath` **is** already used, in 15 files
  (e.g. `app/api/media/[id]/route.ts:310-314,349-353`). Confirm which pages genuinely need
  per-request freshness.
- **N+1 on `/people`:** `lib/server/public-people.ts:76-114` issues one `media.find()` per
  person profile inside `Promise.all(docs.map(...))`. Replace with a single `$in` query
  grouped in application code.
- **Search has no supporting index.** `media/list-public/route.ts:65-88` and
  `media/admin-list/route.ts:97-109` build unanchored case-insensitive regexes over six
  fields per keystroke; nothing in `scripts/ensure-indexes.mjs` can serve them, so every
  search is a collection scan. Decide between a text index and a narrower prefix strategy.
- **`ensure-indexes.mjs` has drifted from the schema.** Line 90 creates
  `{status:1, createdAt:-1}` on `testimonials`, but **no code anywhere writes a `status`
  field** — only `isApproved` exists. Dead index, pure write cost; drop it. And
  `getPublicTestimonials()` sorts `{sortOrder:1, approvedAt:-1, createdAt:-1}`
  (`lib/server/testimonials.ts:59`) while the index (line 89) is
  `{isApproved:1, sortOrder:1, createdAt:-1}` — missing `approvedAt`, forcing an in-memory
  sort. Fix the index to match the sort.
- **`HeroBokeh` is statically imported** (`HomeHero.tsx:3`), so `three` is in the homepage's
  initial bundle while its siblings are `dynamic({ssr:false})`. **Measure it here and report
  the number — do not change the hero without Hussain asking.**

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
Build after the smart contract is deployed and Session NFT1 is approved.

- Wallet connect button (RainbowKit or similar — propose)
- Select media from admin library to mint
- Set edition size, royalty %, price
- Mint transaction UI with live status
- Add to admin: app/admin/(protected)/mint/

---
