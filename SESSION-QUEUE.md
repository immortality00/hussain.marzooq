# HM Visuals — Session Queue

## How to use
Open a new Code tab → open portfolio folder → paste: **Continue queue**

Claude reads this file, finds the next `pending` session, runs the full
3-gate cycle (plan → execute → commit), marks it `done`, then tells you
to open a new session.

---

## Status legend
`done` — complete and committed to GitHub
`in-progress` — current active session (reset to `pending` if interrupted)
`pending` — not yet started

---

## Phase 0 — Foundation (must complete before any design session)

### Session F1 — Remove violations + initialize Lenis — `done`
Remove all design violations before any design work begins.

Tasks in this session (all in one commit):
1. `app/globals.css`: Remove the two `radial-gradient` calls on the `body` rule. Remove the `page-vignette` class entirely. Remove the `site-grid-bg` class entirely.
2. `components/site/AppShell.tsx`: Remove the `<div className="page-vignette" />` line. Remove the `<div className="site-grid-bg absolute inset-0" />` line. Add Lenis initialization using useEffect — smooth scroll on all public pages only (not admin).
3. `components/home/HomeFeaturedWork.tsx`, `components/home/HomeCreativeSystem.tsx`, `components/home/HomeTrustAndShowreel.tsx`: Remove any `bg-[radial-gradient(...)]` fallback divs. Replace with flat `bg-muted`.
4. `cities1000.txt` and `cities1000.zip`: Delete from repo. Add to `.gitignore`.

Read all listed files before making any change. Report every connected file before writing code.

---

### Session F2 — Code refactoring: extract reusable components — `done`
The most important session for long-term code quality. Every session after this will touch smaller files.

Extract these patterns that are currently duplicated across 5+ files:

1. **`components/shared/PageHeader.tsx`**
   Props: `eyebrow?: string`, `title: string`, `description?: string`
   Used by: photography/page.tsx, videography/page.tsx, nft/page.tsx, dancing/page.tsx, about/page.tsx, contact/page.tsx, web-development/page.tsx
   Replace all inline h1+p patterns with this component.

2. **`components/shared/PortfolioCard.tsx`**
   Props: `href: string`, `title: string`, `category?: string`, `imageUrl?: string | null`, `ctaLabel?: string`, `minHeight?: string`
   Used by: HomeFeaturedWork.tsx, HomeCreativeSystem.tsx
   Replace both inline image-overlay card patterns.

Read every file that will be changed before writing any code. List all files affected before writing a single line. This session changes many files — read first, plan completely, then execute.

**Post-hoc audit note:** 6 of the 7 listed pages were migrated correctly. `about/page.tsx`
was listed in scope and never actually migrated — still a hand-rolled h1+p as of this
audit. Fixed in Session N4, since by then it also needs `PageHeader`'s new
`titleClassName` prop to preserve its larger hero-size title. Don't mark a session `done`
without re-checking every file its own task list named.

---

### Session F3 — Split large admin files — `done`
Admin files are too large. Split without breaking any admin functionality.

Target files:
- `TestimonialsAdminClient.tsx` (~21KB): extract the form into `TestimonialForm.tsx`, the list into `TestimonialList.tsx`
- `app/admin/(protected)/media/list/page.tsx` (~16KB): extract the bulk action panel and the filter bar into separate components
- `AdminServicesClient.tsx` (~12KB): extract the service form

Read each file completely before splitting. Verify imports after each split. Admin must work identically after — no functional changes, only structural.

**Post-hoc audit note:** Done correctly for what it scoped — `ServiceEditorModal.tsx`,
`ServiceStaticRow.tsx`, `ServiceSimpleSection.tsx`, `ServicesBanner.tsx`,
`ServicesToolbar.tsx`, and `SortableServiceItem.tsx` are all genuinely split out of
`AdminServicesClient.tsx`. The remaining orchestration logic in the host file is still
427 lines on its own (state, dnd-kit reordering, API calls) — that's a real gap, just a
different one than "F3 didn't run." Addressed in Session F5 by extracting a `useXAdmin`
hook, the same pattern already used in `usePrivateGalleriesAdmin.ts`.

---

### Session F4 — Design-rule cleanup + dead code removal — `pending`
Small, low-risk fixes found in a full-repo audit after F1–N3. Nothing here requires a
design decision — every item below is enforcing a rule already in this doc.

Tasks:
1. **Gradient violations** — replace each with a flat `bg-muted` (the rule from "What is
   NOT in the design" applies sitewide, these were added after F1 shipped):
   - `app/services/[slug]/page.tsx:103` — missing-image fallback div
   - `app/services/page.tsx:140` — missing-image fallback div (same gradient string,
     copy-pasted)
   - `app/people/[slug]/page.tsx:42` — missing-avatar fallback div (same gradient string
     again, third copy)
   - `components/media/SmartMediaPreview.tsx:33` — the radial-gradient div inside
     `EmbedPlaceholder`. Remove the div; the parent already has a dark background.
   - `components/site/PortfolioFallbackPanel.tsx:29` — the radial-gradient div on the
     hero card. Remove it; the parent already has `bg-foreground`.
   - `components/site/WorkOverlay.tsx` — remove the `FALLBACK_GRADIENTS` constant and the
     inline `style={{ background: \`linear-gradient(...)\` }}` on the card `Link`. Replace
     with a `bg-muted` class so cards with no Cloudinary image fall back flat like
     everywhere else.
2. **Dead route** — delete `app/api/cloudinary/sign/route.ts`. Confirmed zero callers
   anywhere in the repo (full-text search). `app/api/sign-cloudinary-params/route.ts`
   already covers everything it did (same admin auth, same `signCloudinaryParams` helper,
   plus arbitrary params) — nothing needs repointing.
3. **PageHeader swaps** — `app/services/page.tsx` (its `<header><h1>...` block) and
   `app/people/page.tsx` (its `<section><h1>...` block) both hand-roll markup that is
   byte-for-byte what `<PageHeader title=... description=... />` already renders. Swap
   both. Zero visual change, confirmed by comparing the exact Tailwind classes.
4. **Stale migration** — `lib/db/ensureSystemCategories.ts`'s `ensureOthersCategory` runs
   an unconditional `updateMany` across the entire `services` collection every time
   `app/admin/(protected)/services/page.tsx` or `app/admin/(protected)/service-categories/page.tsx`
   loads. Guard it so it only runs once — either a flag doc it checks first, or move it out
   of the request path into a one-time script run via something like `npm run db:migrate`,
   following the existing pattern in `scripts/ensure-indexes.mjs`.
5. **section-shell adoption** — `.section-shell` (`mx-auto max-w-6xl px-4`, defined in
   globals.css) is currently only used by `Navbar.tsx`, `SiteFooter.tsx`, and the 4
   home/* section components. Every public page below writes the byte-for-byte identical
   `mx-auto max-w-6xl px-4` inline instead — swap each to `section-shell`, keeping each
   page's own vertical padding (`py-*`) exactly as it is today:
   `app/photography/page.tsx`, `app/videography/page.tsx`, `app/nft/page.tsx`,
   `app/dancing/page.tsx`, `app/web-development/page.tsx`, `app/about/page.tsx`,
   `app/blog/page.tsx`, `app/services/page.tsx`, `app/services/[slug]/page.tsx`,
   `app/people/page.tsx`, `app/people/[slug]/page.tsx`, `app/g/[slug]/page.tsx`. Do **not**
   touch `app/contact/page.tsx` (max-w-4xl), `app/g/[slug]/GalleryPasswordForm.tsx`
   (max-w-xl), or `app/testimonials/page.tsx` (max-w-7xl) — those three intentionally use a
   different width and forcing them to max-w-6xl would be a real layout change, not a
   no-op cleanup.

Read every listed file before changing it. Report back before writing code, per standard gate.

---

### Session F5 — Admin orchestration & data-layer consolidation — `pending`
Larger, multi-file refactor found in the same audit. More risk than F4 — read everything
fully before touching anything, and expect this to be its own session, not a quick pass.

Tasks:
1. **Admin feedback hook** — at least 6 admin clients (`PagesAdminClient.tsx`,
   `SeoAdminClient.tsx`, `PeopleAdminClient.tsx`, `TestimonialsAdminClient.tsx`,
   `AdminServiceCategoriesClient.tsx`, `app/admin/(protected)/media/list/page.tsx`) each
   hand-roll the identical loading+fetch+try/catch+`setFeedback` pattern around
   `AdminActionFeedback`. Extract a shared hook (e.g. `useAdminAction`) and wire all 6
   through it.
2. **`lib/server/cloudinary-assets.ts` (532 lines, the largest file in the repo)** — four
   pairs of near-duplicate functions: `deleteManagedCloudinaryAsset` /
   `deleteManagedCloudinaryAssetStrict`, `deleteManagedCloudinaryUrls` /
   `deleteManagedCloudinaryUrlsStrict`, `deleteManagedCloudinaryResourcesByPrefix` /
   `deleteManagedCloudinaryResourcesByPrefixStrict`, `deleteManagedEmptyCloudinaryFolders` /
   `deleteManagedEmptyCloudinaryFoldersStrict`. Consolidate each pair into one
   implementation with a `strict: boolean` option.
3. **`components/testimonials/TestimonialsSection.tsx` (466 lines)** — currently 11
   components in one file (`SafeImage`, `Avatar`, `ReviewPhotoStrip`, `TestimonialMap`,
   `ReviewModal`, `SingleReviewCard`, plus helpers). Split into their own files, same
   pattern already used in `components/testimonials/review-form/`.
4. **`AdminServicesClient.tsx` and `app/admin/(protected)/people/PeopleAdminClient.tsx`**
   — confirmed by reading both directly. `AdminServicesClient.tsx` already has 6
   sub-components split out (`ServiceEditorModal`, `ServiceStaticRow`,
   `ServiceSimpleSection`, `ServicesBanner`, `ServicesToolbar`, `SortableServiceItem`) but
   the remaining orchestration (state, API calls, dnd-kit reordering) is still one
   ~420-line function. `PeopleAdminClient.tsx` has had **no extraction at all** — list mode
   and form mode both live inline in one ~420-line function with no sub-components. Extract
   a `useXAdmin` hook for each, matching the existing pattern in
   `components/admin/private-galleries/usePrivateGalleriesAdmin.ts`.
5. **Minor: `components/search/SearchInput.tsx`** has two near-redundant callback props —
   `onValueChange` and `onChange` both do the same thing (`const updateValue = onValueChange ?? onChange`).
   Low priority, but worth picking one and removing the other while this session is already
   touching nearby admin files.
6. **Cloudinary signing unification** — `app/api/testimonials/upload-signature/route.ts`
   is correctly public-facing with its own rate-limiting, timestamp validation, and folder
   allowlist that the admin signing routes don't need — keep all of that. But it
   re-implements `cloudinary.config()` and calls `cloudinary.utils.api_sign_request`
   directly instead of reusing `signCloudinaryParams` from `lib/server/cloudinary.ts`.
   Route the actual signing call through the shared helper.
7. **Type safety** — clean up the 32 `as unknown as` casts repo-wide where the underlying
   type mismatch can be fixed properly instead of cast around. Report the list of all 32
   locations before fixing any of them; some may be load-bearing for reasons that aren't
   obvious from the cast site alone.

Read every listed file before changing it. This touches a lot of files — report the full
affected list and what could break before writing any code.

---

## Phase 1 — Navigation & global systems

### Session N1 — Minimal nav + Work overlay — `done`
Replace the current 11-item Navbar with the new nav.

New nav structure: **Work · About · Services · Book**
- "Work" triggers a full-screen overlay showing discipline cards.
- Discipline cards are pulled from Cloudinary (one representative image per discipline from existing media).
- Cards scroll horizontally in the aikawakenichi cylinder style using Three.js or GSAP 3D transforms.
- Inactive discipline pages (controlled by page activity toggle — built in Session N3) are excluded from the overlay.
- "About" is a standard link to /about.
- "Services" is a standard link to /services.
- "Book" is a standard link to /contact.

Mobile: cards stack in a scrollable vertical list with the same visual treatment, adjusted for mobile viewport.

Read: components/site/Navbar.tsx, components/site/AppShell.tsx, globals.css, every public page.tsx that references nav items. Plan the Three.js approach and wait for confirmation before writing code.

**Post-hoc audit note:** shipped correctly. The original version of this doc said
"3-item minimal nav" and didn't list Services — that was a doc error caught by a later
full-repo audit, not a build error. CLAUDE.md is corrected; the 4-item list above is now
the accurate record of what N1 actually shipped, kept intentionally.

---

### Session N2 — Page activity toggle system — `done`
Build a system to activate/deactivate public discipline pages from the admin.

Backend:
- MongoDB collection: `page_settings` — documents keyed by page slug (photography, videography, nft, dancing, web-development, about, people, blog).
- Fields: `slug`, `isActive` (boolean, default true), `updatedAt`.
- API route: PATCH /api/admin/page-settings/[slug] to toggle isActive.
- Public helper: `getPageSettings(slug)` returns isActive status.

Admin UI:
- New admin section: /admin/pages — lists all public pages with an active/inactive toggle. Reuses existing AdminActionFeedback component.

Public behavior:
- Each public page.tsx calls `getPageSettings(slug)` — if inactive, redirects to homepage (Next.js redirect).
- Work overlay in the nav (Session N1) filters out inactive pages.
- Homepage sections referencing specific pages also check activity status.

Read all admin files, Navbar.tsx, and all public page.tsx files before writing.

**Post-hoc audit note:** shipped scoped to the 5 discipline pages only
(`getAllPageSettings()` returns exactly `["photography", "videography", "nft", "dancing", "web-development"]`).
That's correct and intentional — confirmed in Session N4 planning, since the new page
header CMS needed a wider slug list and reuses `page_seo` (already scoped to all 12 public
pages) rather than widening this collection's scope.

---

### Session N3 — SEO + page metadata admin control — `done`
Build admin control over the title and description shown on every public page, and the OG metadata.

Backend:
- MongoDB collection: `page_seo` — one document per public page.
- Fields: `slug`, `title`, `description`, `ogImageUrl`, `updatedAt`.
- Server function: `getPageSeo(slug)` returns the current values. Falls back to hardcoded defaults if no admin record exists.
- API route: PATCH /api/admin/page-seo/[slug].

Admin UI:
- New section at /admin/seo — lists all public pages, click to edit title, description, and OG image URL. Reuses AdminActionFeedback.

Public pages:
- All public page.tsx files replace hardcoded `metadata` exports with `generateMetadata` functions calling `getPageSeo(slug)`.

Read all public page.tsx files and app/layout.tsx before writing.

**Post-hoc audit note:** shipped exactly as scoped — this session only ever covered
`<title>`/`<meta description>` for `generateMetadata`, never the visible on-page H1 the
person actually reads. A later planning pass (Session D10's task list, and Hussain
directly) referred to this as covering "page title + description" admin control more
broadly, which it doesn't and never was scoped to. That gap is what Session N4 closes —
it's an extension of this session's collection, not a fix to this session's work.

---

### Session N4 — Page header content (extend page_seo) — `pending`
Make the on-page H1 + description editable from admin. Currently hardcoded as literal
JSX props or template strings in 12 page-level files with no CMS control at all.

**Backend:**
- Extend the existing `page_seo` collection (built in N3) with 2 new fields:
  `headerTitle` (string), `headerDescription` (string). These control what a visitor
  reads on the page itself — separate from `title`/`description`, which stay as the
  `<title>`/`<meta description>` search engines see. Same document, same slug, five
  fields total. No eyebrow field — see CLAUDE.md "Reusable components" for why it was
  removed instead of carried forward.
- `lib/server/page-seo.ts`: extend the `PageSeo` type and the `DEFAULTS` map with the 2
  new fields per slug. Seed every default from what's *currently* hardcoded in each page,
  listed below, so shipping this changes zero visible copy on day one.
- `app/api/admin/page-seo/[slug]/route.ts`: extend the PATCH handler to accept the 2 new
  fields the same way it already accepts `title`/`description`/`ogImageUrl`.

Current hardcoded copy to use as defaults (confirmed by reading each file directly —
eyebrow text dropped from this table; see the per-page wiring notes below for what
happens to it):

| slug | heading | description |
|---|---|---|
| home | Cinematic visual direction for people, movement, fashion, weddings, and digital culture. | Photography, film, dance, NFT work, and creative web systems shaped with atmosphere, precision, and a high-end visual language. |
| photography | Photography | Cinematic portraits, fashion, weddings, events, and emotional visual stories. |
| videography | Videography | Cinematic films, dance, events, fashion, weddings, and movement-led visual stories. |
| nft | NFT | Published collectible works, edition structure, and marketplace access — all presented inside one unified collection page. |
| dancing | Dancing | Performance, teaching, and visual work shaped around rhythm, motion, presence, and the way bodies transform space on camera. |
| web-development | Web Development | Design-led front-end work, custom portfolio systems, admin flows, and digital presentation tools connected to the same creative direction as the visual work. |
| contact | Contact / Booking | Tell me what you want to create and I'll reply with the best direction for the project. |
| services | Services | Photography, film, dance, creative direction, web systems, and digital work shaped around the tone of the project. |
| people | People | Portraits, collaborators, artists, dancers, clients, and people connected to the visual work. |
| about | Cinematic visual work across photography, film, movement, and digital experience. | HM Visuals is the creative practice of Hussain Marzooq, built around portraits, fashion, events, dance, web experiences, and Web3-ready artwork. The work connects camera craft, movement, atmosphere, and strong presentation systems into one visual identity. |
| blog | Blog | Visual essays, creative process, and long-form writing around photography, film, movement, and image-making. |
| testimonials | What people say about me | Real feedback from shoots, films, events, classes, and creative collaborations. |

**Admin UI:**
- Extend `SeoAdminClient.tsx`. Rename the on-page heading to "Page Content" (it now
  controls more than SEO). Each page's expanded panel needs two clearly separated field
  groups: "On the page — what visitors see" (heading, description — no eyebrow field) and
  "Search & social — what search engines see" (the existing title, meta description, OG
  image). If adding these fields pushes the file past ~200 lines, split the expanded
  panel into its own component (e.g. `seo/components/SeoPageForm.tsx`) rather than letting
  it grow — don't reintroduce the exact file-size problem this whole audit is about.
- `app/admin/(protected)/layout.tsx`: rename the sidebar nav label from "SEO" to
  "Page Content" (line with `href: "/admin/seo"`). Route itself stays `/admin/seo`.

**Public pages — wire all 12, including home:**
- `components/home/HomeHero.tsx`: replace the hardcoded h1/p with `seo.headerTitle` /
  `seo.headerDescription` (fetched via `getPageSeo("home")` in `app/page.tsx` and passed
  down as props, same as `photos`/`videos`/`activeSet` already are). This is the
  highest-priority page in this session — it's the largest, most prominent text on the
  site, and was wrongly left out of the first draft of this plan. While this file is open:
  line 27's `bg-[#1a1814]` is a raw hex value (the "never hardcode hex" rule, found on
  re-check) — propose a named token for it or confirm an existing dark variable is close
  enough before changing it; this is a one-line, separate fix from the header wiring, not
  a reason to redesign the hero.
- `photography/page.tsx`, `videography/page.tsx`, `nft/page.tsx`, `contact/page.tsx`:
  already call `getPageSeo(slug)` for `generateMetadata` only — extend to also pass
  `seo.headerTitle` / `seo.headerDescription` into the existing `<PageHeader>` call.
- `dancing/page.tsx`, `web-development/page.tsx`: same, **and remove the hardcoded
  `eyebrow="MOVEMENT"` / `eyebrow="DIGITAL BUILDS"` prop from the existing `<PageHeader>`
  call** — the prop no longer exists on the component, this isn't optional.
- `services/page.tsx`, `people/page.tsx`: after Session F4 swaps these to `<PageHeader>`,
  wire the same way. Neither ever had an eyebrow, no change needed there.
- `about/page.tsx`: currently a hand-rolled "HM VISUALS" eyebrow chip + h1 (with extra
  `lg:text-6xl` + `max-w-4xl` sizing `PageHeader` doesn't support today) + p, inside a
  2-column grid with a side panel. Add an optional `titleClassName?: string` prop to
  `PageHeader.tsx` (purely additive, backward compatible) so this page can pass
  `titleClassName="max-w-4xl lg:text-6xl"` and switch to `<PageHeader>`, preserving its
  current larger size. **Drop the "HM VISUALS" eyebrow chip entirely** — it doesn't
  migrate into a prop, it's removed, same as everywhere else. The side panel ("Creative
  position" card) stays page-specific, not shared — only `about` and `blog` have one and
  the content differs between them.
- `blog/page.tsx`: same swap, no `titleClassName` needed — its current h1 classes already
  match `PageHeader`'s default. **Drop the "JOURNAL" eyebrow chip entirely**, same as above.
- `testimonials/page.tsx`: keep its distinct bordered hero-card layout — don't force it
  into `PageHeader`, it's a deliberately different design (stats panel, map column), not
  an accidental duplicate of the others. Just replace the hardcoded title/description
  strings with `seo.headerTitle` / `seo.headerDescription`.

Read every file listed above, plus `PageHeader.tsx` and `HomeHero.tsx`, before writing
code — this touches 12 page-level files, the SEO lib/API/admin files, and the shared
component. Report the complete affected-file list and what could break before writing a
single line.

---

### Session N5 — Section-level content CMS (homepage + interim pages) — `pending`
**Scope not yet confirmed with Hussain — confirm before Gate 1, don't assume either
boundary below.** Surfaced by the same audit that found the N4 gaps: the homepage has 5
more hardcoded text blocks beyond its hero (covered by N4), and `about/page.tsx`,
`dancing/page.tsx`, `web-development/page.tsx`, and `blog/page.tsx` each hardcode several
standalone text panels plus repeating arrays of card content. Full inventory, counted
panel-by-panel against the actual file content, not estimated:

- `components/home/HomeFeaturedWork.tsx` — 2 cards, each title + description (Photography, Film).
- `components/home/HomeCreativeSystem.tsx` — 1 panel (h2 + p), plus an NFT card title (no description on that card).
- `components/home/HomeServicesPreview.tsx` — 1 heading (no separate paragraph — goes straight into a CTA button).
- `components/home/HomeTrustAndShowreel.tsx` — 2 headings (trust panel, showreel panel) + 1 paragraph shown only when no testimonial exists yet.
- `about/page.tsx` — "Creative position" panel (label + p, sits beside the N4 header) + `disciplines` array (4 × {title, text}) + "Approach" panel (label + h2 + p) + "Principles" panel (label + 4-string list) + 1 closing CTA panel (label + h2 + p). 4 standalone panels, 1 array of 4.
- `dancing/page.tsx` — "Movement language" panel (beside the N4 header) + `sections` array (3 × {title, description}) + "Direction" panel (label + h2 + p) + "Work covered" panel (label + 4-string list) + 1 closing CTA panel. 4 standalone panels, 1 array of 3.
- `web-development/page.tsx` — "Creative technology" panel (beside the N4 header) + `capabilities` array (4 × {title, text}) + "Technical direction" panel (label + h2 + p) + "Build principles" panel (label + 4-string list) + 1 closing CTA panel. 4 standalone panels, 1 array of 4.
- `blog/page.tsx` — "Editorial direction" panel (beside the N4 header) + `pillars` array (4 × {title, description}) + an "Explore the work" row of links (mostly structural nav labels, not prose — lower priority than the rest of this list).
- `StickyCta` — used bare (no custom copy) on most pages, but `app/page.tsx`, `app/nft/page.tsx`, `app/people/page.tsx`, and `app/people/[slug]/page.tsx` all pass custom `title`/`description`/`buttonLabel` props. Same hardcoded-copy pattern as everything else above, confirmed by checking every call site rather than just the homepage one.

This is a different data shape than N4 (one heading + one description per page) — it's
multiple named panels per page plus repeating arrays that would need add/remove/reorder
admin UI, not just text inputs. Before Gate 1, ask Hussain directly how far this should
go: every panel's heading + paragraph only (simpler, still a real scope increase over N4),
or full control including the repeating card arrays (bigger admin build — a generic
repeating-group editor, not just more text fields). Don't pick one and build it without
asking — that's the exact mistake N4's eyebrow field and homepage exclusion both were, and
this list itself was undercounted on the first pass (missed the panel sitting beside the
header on about/dancing/web-development/blog) until checked panel-by-panel against the
actual files instead of skimmed.

---

## Phase 2 — Preloader & core experience

### Session D1 — Preloader — `pending`
Reset from `in-progress`. The version currently in the repo was built against an
ambiguous spec (it fetches real Cloudinary photos via a dedicated API route) and needs to
be rebuilt, not patched — see "Materials — corrected" below before starting.

Full-screen preloader that runs once per session (sessionStorage flag).

**Materials — corrected.** No photos. No Cloudinary. No network request of any kind. 5
lucide-react vector icons (already a dependency, already used in `Navbar.tsx` and
`WorkOverlay.tsx`), one per discipline. Recommended mapping — confirm or swap in this
session's Gate-1 proposal:

| Discipline | Icon |
|---|---|
| Photography | Camera |
| Videography | Video |
| NFT | Hexagon |
| Dancing | Footprints |
| Web Development | Code2 |

GSAP timeline animation sequence:
1. The 5 icons flash in sequence — fast, rhythmic, one at a time, full-bleed centered,
   each replacing the last. ("Like emoji reactions replacing each other" in the original
   draft of this session described the *pace* of replacement, not the materials — it got
   built as a literal Cloudinary photo fetch instead. The pace description was right; the
   materials were wrong. Propose the specific GSAP timing before writing code, as below.)
2. The sequence repeats exactly twice.
3. A visual effect fires (blur, scale, or particle burst — propose the specific GSAP approach with timing before writing code).
4. A horizontal light burst expands from the center of the screen.
5. From the burst, the word **"Art"** appears and slides to the right side of the screen.
6. Letter-by-letter animations begin building the full name **"Hussain.Art"** with effects (propose the specific letter animation approach and wait for approval).
7. Brief hold. Preloader unmounts, site is fully visible.

**Do not route the "Hussain." letter reveal through `components/shared/AnimatedText.tsx`.**
That component is scroll-triggered (fires via ScrollTrigger when scrolled into view) and
word-mode only — it does not currently support char/line modes despite CLAUDE.md
describing it that way elsewhere (separate doc gap, not this session's job to fix). The
preloader needs a reveal sequenced at exact offsets inside one master timeline, which is a
different problem than `AnimatedText` solves. A purpose-built letter stagger directly
inside `Preloader.tsx` is correct here — it is not a "should be shared" violation.

Component: `components/site/Preloader.tsx`
Added to: AppShell.tsx (public pages only, not admin) — already wired, no change needed there.

**Also delete `app/api/preloader-images/route.ts`** as part of this session — once there's
no Cloudinary fetch, it has zero callers and does 5 sequential MongoDB queries for nothing.

**Before writing any code:** present the complete GSAP timeline with timing values and easing for each step. Wait for approval before building.

---

### Session D2 — Homepage WebGL rebuild — `pending`
Rebuild the homepage hero as a full-viewport WebGL experience using Three.js.

The Three.js canvas is the primary layer of the homepage first viewport. The camera moves through the 3D scene on scroll (GSAP ScrollTrigger drives camera position). The existing HTML content sections (Featured Work, Stats, About, Globe, Press, Services) exist below the WebGL viewport and scroll normally.

**Before writing any code:**
- Read HomeHero.tsx, HeroBokeh.tsx, app/page.tsx, AppShell.tsx, globals.css.
- Propose the specific Three.js scene composition: what 3D elements exist, what the camera does, how it connects to scroll.
- Wait for approval before building anything.

The bokeh particle system currently in HeroBokeh.tsx should be elevated into the main Three.js scene rather than a separate canvas. The hero image from Cloudinary should be integrated into the 3D scene.

---

### Session D3 — Photography page: 3-mode viewer — `pending`
Rebuild the photography gallery with 3 switchable display modes.

Mode 1: **3D Cylinder** (default)
- Photos mapped as textures on a Three.js cylinder.
- Cylinder rotates to reveal photos. Glass shards scatter on category change (aikawakenichi technique).
- Clicking a photo opens the existing media detail popup.
- Category navigation updates the cylinder's texture set.

Mode 2: **Horizontal scroll**
- GSAP ScrollTrigger-driven horizontal track.
- Photos at varying heights (editorial, not uniform).
- Clicking a photo opens the existing media detail popup.

Mode 3: **Category filter**
- Filters the content driving Mode 1 and Mode 2.
- Existing search/filter logic must be preserved and integrated.

Mode switcher: minimal UI control (3 icon buttons) positioned in a fixed corner.

Mobile: Mode 1 falls back to Mode 2 automatically. Mode switcher is hidden on mobile.

**Before writing any code:**
- Read app/photography/page.tsx and every component it imports.
- Read the existing MediaGrid, MediaFilterBar, MediaLightbox components fully.
- Propose the Three.js cylinder implementation approach.
- Wait for approval.

---

### Session D4 — Page transition system — `pending`
Build the shared transition context and implement per-route transitions using actual page content as animation material.

Architecture:
- A `TransitionContext` (React context) holds the current and destination page's available images/media.
- A `PageTransition` wrapper component intercepts route changes.
- Each route has a defined transition in and out.

Transitions to implement in this session:
- **→ Photography:** Hero image expands from small to full viewport, 3D cylinder assembles.
- **→ Videography:** Images scatter as glass shards (Three.js), film strip assembles from right.
- **→ NFT:** Images fragment/glitch, NFT grid assembles.
- **→ Dancing:** Images distort with wave physics (GSAP elastic), dancing page fades in.
- **→ About:** Single portrait expands full-screen, about content fades over it.
- **→ Web Development:** Brief terminal-style effect, page assembles.
- **Homepage → any:** Origin images scatter, destination assembles.

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

### Session N1 — Smart contract architecture planning — `pending`
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

### Session N2 — Minting UI — `pending`
Build after smart contract is deployed and Session N1 is approved.

- Wallet connect button (RainbowKit or similar — propose)
- Select media from admin library to mint
- Set edition size, royalty %, price
- Mint transaction UI with live status
- Add to admin: app/admin/(protected)/mint/

---