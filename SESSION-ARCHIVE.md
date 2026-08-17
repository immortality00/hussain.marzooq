# HM Visuals — Session Archive

Completed sessions, moved here from SESSION-QUEUE.md at Gate 3 (the move is part of the
protocol — see the queue's "How to use"). Specs and build-outcome notes are preserved
verbatim: this file is the project's history and the reference for "why is it built that
way."

**Do not load this file by default.** Read it only when a pending session, CLAUDE.md, or
a planning question explicitly references it.

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

### Session F4 — Design-rule cleanup + dead code removal — `done`
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

### Session F5 — Admin orchestration & data-layer consolidation — `done`
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

### Session N4 — Page header content (extend page_seo) — `done`
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

### Session N5 — Section-level content CMS (homepage + interim pages) — `done`
**Part 1 (content wiring) is done and confirmed working by Hussain.** Full scope was
confirmed as option (b) from the original ambiguity — every panel plus the repeating card
arrays, not just headings. Shipped: `lib/server/page-sections.ts` (`page_sections`
collection, one document per slug, covering home/about/dancing/web-development/blog/nft/
people/people-detail), `app/api/admin/page-sections/[slug]/route.ts`, the admin editor at
`/admin/page-sections` (`PageSectionsAdminClient.tsx` + per-slug Form components +
`RepeatingCardListEditor`/`RepeatingStringListEditor` with dnd-kit drag-reorder), and all
public call sites wired: `components/home/HomeFeaturedWork.tsx`,
`components/home/HomeCreativeSystem.tsx`, `components/home/HomeServicesPreview.tsx`,
`components/home/HomeTrustAndShowreel.tsx`, `about/page.tsx`, `dancing/page.tsx`,
`web-development/page.tsx`, `blog/page.tsx`, and every `StickyCta` call site with custom
copy (`app/page.tsx`, `app/nft/page.tsx`, `app/people/page.tsx`,
`app/people/[slug]/page.tsx`). Verified with `tsc --noEmit` and eslint, both clean.

**Part 2 (admin consolidation) is the remaining work — reset to `pending` for this.**
Post-ship review found the admin side confusing: the same public page now has its data
split across three separate sidebar entries — **Pages** (visibility toggle,
`/admin/pages`, 5 discipline pages), **Page Content** (SEO title/description + on-page
header, `/admin/seo`, 12 pages), and **Page Sections** (panels + repeating cards,
`/admin/page-sections`, 8 pages). Editing one real page means hunting across three
places, and the three slug-sets don't even match, which reads as messy rather than
intentional. Confirmed plan, presented to and approved in scope by Hussain:

1. **Keep the data layer as three separate collections/APIs** — `page_settings`,
   `page_seo`, `page_sections` stay as-is (`getAllPageSettings()`, `getAllPageSeo()`,
   `getAllPageSections()` already exist and cover this). Merging the data model would mean
   rewriting three API routes and touching every public page.tsx for a problem that's
   actually about admin presentation, not data shape — not worth the risk.
2. **One new admin route:** `/admin/pages`, replacing all three sidebar links with a
   single **"Pages"** entry in `app/admin/(protected)/layout.tsx`.
   - `app/admin/(protected)/pages/page.tsx` — fetch all three `getAll*()` functions in
     parallel, merge by slug into one fixed row order: Home, About, Photography,
     Videography, NFT, Dancing, Web Development, Services, People, People — detail page,
     Blog, Contact, Testimonials.
   - `app/admin/(protected)/pages/PagesAdminClient.tsx` — one accordion row per page.
     Each row renders only the groups that actually apply to it (this varies per page —
     e.g. Photography has no Sections group, Contact has neither Visibility nor Sections,
     People — detail page has only Sections):
     - **Visibility** — on/off toggle (5 discipline pages only)
     - **On-page header** — headerTitle/headerDescription
     - **Search & social** — title/description/OG image
     - **Sections** — panels + repeating card lists (reuse the existing
       HomeSectionsForm/AboutSectionsForm/etc. components unchanged)
   - Each group gets its own labeled sub-card with a lucide-react icon (Eye / Type /
     Search / LayoutGrid) and a tinted background so it's visually clear what belongs to
     what.
   - **One "Save changes" button per page row**, not per group — saves whichever groups
     are dirty in parallel (up to 3 PATCH calls via the existing `useAdminAction` hook),
     so a page reads and saves as one coherent unit.
   - Delete the old `app/admin/(protected)/pages/PagesAdminClient.tsx`, the whole
     `app/admin/(protected)/seo/` directory, and the whole
     `app/admin/(protected)/page-sections/` directory — relocate their working parts
     (`SeoPageForm.tsx`, the per-slug section Form components) into a new
     `app/admin/(protected)/pages/components/` folder rather than rewriting them.
   - Delete the old `/admin/seo` and `/admin/page-sections` routes outright (no redirect
     stubs) — internal admin tool, no external links to preserve.
3. **Explicitly out of scope for this pass:** reordering the home cards themselves
   (e.g. Photography/Film card order in Featured Work). Raised during review, deferred —
   revisit as its own follow-up once Hussain decides whether that means reordering the two
   Featured Work cards specifically or the homepage's whole section order.

Read every file listed above before touching anything — this is a UI consolidation across
existing, working systems, so the main risk is regressing a save path, not building new
data logic. Report the complete affected-file list and confirm before writing code, per
standard gate.

**Status note:** Parts 1, 2, and 3 are all built, verified in-browser (save flows tested
on NFT and About rows, reverted cleanly), and committed (`9826804`, `46c69ee`).
Confirmed closed out and marked `done` (2026-07-27) after a full re-verification pass —
`tsc --noEmit` and `next build` both clean.

**Part 3 (confirmed scope, not yet built) — the "more changes" referenced above.** Raised
during a live bug-report + planning conversation, not a fresh planning pass — full
per-page admin group table below is the final confirmed scope, superseding the Part 2
group list where they differ:

1. **CTA group — add where missing:** About, Photography, Videography, Dancing, Web
   Development, Testimonials currently render a hardcoded `<StickyCta />` with no admin
   wiring (confirmed by direct read of each page.tsx). Wire all six to admin-editable CTA
   content (title/description/buttonLabel), same pattern as Home/NFT/People.
   - **Do not add a CTA to Services or Contact.** Services has its own booking flow built
     into the page; Contact is itself the booking destination every other CTA points to —
     confirmed explicitly by Hussain, not an oversight.
   - Dancing and Web Development currently have unused `closingCta` fields in their
     `page_sections` schema (headings/paragraphs, not the title/description/buttonLabel
     shape `StickyCta` actually takes) — verify during Gate 1 whether these are dead
     fields to delete or partially-wired and need reconciling, don't assume either way
     before reading the code.
2. **Relabel, no functional change:** NFT, People, People-detail currently expose a
   "Sections" admin group that is actually just `CtaOnlySections` (stickyCta only, per
   Part 2's own research). Rename this group to "CTA" in the admin UI for these three —
   confirmed this is a labeling fix, not a data change.
3. **Add missing groups:** People-detail currently has no Header or SEO admin group at
   all (only the CTA-only "Sections", per above) — add both, matching every other page.
   Flag before touching: confirm this gap is unintentional and not a deliberate omission
   for per-person detail pages before wiring it.
4. **Delete entirely — component markup, `page_sections` data fields, and admin form
   controls, all three layers, not just the admin UI:**
   - About: `disciplines` + `principles` arrays (about/page.tsx, currently CMS-wired per
     Session N5 Part 1 — read the live file, don't assume this doc's line numbers are
     current).
   - Dancing: `sections` + `workCovered` arrays.
   - Web Development: `capabilities` + `buildPrinciples` arrays.
   - Blog: `pillars` array only — **Blog keeps its Sections admin group otherwise**,
     reserved for future post/category content (Session C1). This is the one page where
     "delete the repeating cards" does not mean "remove the Sections group."
   - These three pages (About, Dancing, Web Development) end this session with just:
     header + description + hero content + the new CTA from item 1 — until each gets a
     real design pass later (Dancing = Session D10, Web Development = Session D11, both
     still `pending`). About has no dedicated rebuild session in the queue yet — flag this
     gap to Hussain rather than silently inventing one.
5. **Final per-page admin group table (confirm against live code before executing, this
   supersedes any earlier draft):**

   | Page | Visibility | Header | SEO | CTA |
   |---|---|---|---|---|
   | Home | — | ✓ | ✓ | ✓ (full Sections — see Session N6) |
   | Blog | — | ✓ | ✓ | ✓ (Sections group kept, `pillars` also kept — see outcome note) |
   | About | — | ✓ | ✓ | ✓ new |
   | Photography | ✓ | ✓ | ✓ | ✓ new |
   | Videography | ✓ | ✓ | ✓ | ✓ new |
   | NFT | ✓ | ✓ | ✓ | ✓ (relabel only) |
   | Dancing | ✓ | ✓ | ✓ | ✓ new |
   | Web Development | ✓ | ✓ | ✓ | ✓ new |
   | People | — | ✓ | ✓ | ✓ (relabel only) |
   | People-detail | — | — (see outcome note) | ✓ new | ✓ (relabel only) |
   | Services | — | ✓ | ✓ | — (has its own booking flow) |
   | Contact | — | ✓ | ✓ | — (is the booking destination) |
   | Testimonials | — | ✓ | ✓ | ✓ new |

**Part 3 Gate-1 outcome (2026-07-02) — corrections found against live code, and
Hussain's confirmed adjustments. This supersedes items 1–4 above where they differ:**

- **`closingCta` was not dead** (item 1's open question): it was fully wired to the dark
  full-width closing panel on About, Dancing, *and* Web Development — those pages had two
  CTAs (dark panel + hardcoded floating bar). Reconciled by deleting the dark panels and
  their `closingCta` fields at all three layers; the admin-wired floating `StickyCta` is
  now the single closing CTA on those pages. The panels' secondary links ("View video
  work", "Start a project", etc.) were removed with them.
- **Card grids kept** (adjusts item 4): Hussain confirmed About / Dancing / Web
  Development / Blog keep their `{title, text}` card grid (`disciplines` / `sections` /
  `capabilities` / `pillars`) plus header and description, so the interim pages stay
  visually consistent with the rest of the site until their design passes (Dancing =
  D10, Web Dev = D11, About/Blog = not yet scheduled — **About still has no rebuild
  session in the queue**). What was deleted: the mid panel-pair grids
  (`approach`+`principles`, `direction`+`workCovered`,
  `technicalDirection`+`buildPrinciples`) and the dark closing panels. At Gate-2 review
  Hussain also had the four hero side panels removed (`creativePosition`,
  `movementLanguage`, `creativeTechnology`, `editorialDirection` — component markup,
  data fields, and admin controls), so each interim page is now header + card grid +
  booking bar. All four pages' admin forms share one `CardsCtaForm` component;
  `RepeatingStringListEditor.tsx` deleted (zero callers).
- **Testimonials had no `StickyCta` at all** (item 1 claimed it rendered a hardcoded
  one) — the admin-wired booking bar there is a *new* visible element, shipped with the
  default "Ready to book?" copy.
- **Blog also rendered a hardcoded `<StickyCta />`** and wasn't in item 1's six-page
  list — wired too, making 7 newly wired pages total.
- **People-detail gets SEO only, no Header group** (adjusts item 3): the on-page H1 is
  the person's own name + bio, already editable per person in the People admin, so a
  page-level header field has nothing to control. The SEO group uses a `{name}`
  placeholder template (`page_seo` slug `people-detail`) substituted into
  `generateMetadata` per person — confirmed by Hussain specifically so famous subjects'
  pages can rank for their own name searches. The detail page previously had no
  `generateMetadata` at all.
- Mongo: no migration — removed keys linger in existing `page_sections` docs, are
  ignored by the new code, and get replaced wholesale on the first admin save per page.
  Cloudinary: untouched by this session.

Part 3 is fully closed out — N5 is `done` (confirmed 2026-07-27).

---

### Session N6 — Homepage section redesign — `done`
Raised in the same bug-report + planning conversation as N5 Part 3 above. Scope confirmed
by Hussain, not yet built.

1. **Featured Work → dynamic cards.** `components/home/HomeFeaturedWork.tsx` currently
   renders exactly 2 hardcoded/conditional cards (Photography, Film) sourced from fixed
   keys in `sections.featuredWork`. Convert to an array-backed structure
   (`cards: [{slug, title, description}]`) with admin add/delete, replacing the
   fixed-key shape in the `page_sections` `home` schema and the corresponding
   `HomeSectionsForm.tsx` fields.
2. **Fold the NFT card into Featured Work.** `components/home/HomeCreativeSystem.tsx`
   currently renders a separate hardcoded NFT `PortfolioCard` alongside its text panel.
   Remove that card from `HomeCreativeSystem` entirely — NFT becomes just another
   addable/removable card in the Featured Work array from item 1, not a special case.
3. **Services Preview — one unified box.** `components/home/HomeServicesPreview.tsx`
   currently splits into a left text panel and a separate right 3-column card grid,
   reading as two disconnected components. Wrap the whole section (heading, intro, and
   grid together) in one outer bounded container so it reads as a single cohesive
   services box. The existing per-service cards inside the grid stay as they are.
4. **Trust panel — full testimonial card.** `components/home/HomeTrustAndShowreel.tsx`
   currently shows one truncated quote (`<p>` of `testimonial.review`, no avatar, no
   stars, no metadata). Replace with the full `SingleReviewCard` component already used
   on `/testimonials` (`app/testimonials/` — reuse the same component, don't rebuild it).
5. **Remove the Showreel panel entirely.** Confirmed structurally independent from the
   trust panel (separate conditional block) — delete it outright, including its
   `page_sections` field and `HomeSectionsForm.tsx` controls.
6. **Keep the closing CTA (`StickyCta`) as-is** — no changes requested there.

Read HomeFeaturedWork.tsx, HomeCreativeSystem.tsx, HomeServicesPreview.tsx,
HomeTrustAndShowreel.tsx, HomeSectionsForm.tsx, page-sections.ts, and app/testimonials/'s
review card component fresh before writing code. Report the complete affected-file list
and confirm the plan before touching anything, per standard gate.

---

### Session N7 — Admin-selectable card images (Work overlay + Featured Work) — `done`
Confirmed gap, verified by reading both sources directly: `app/api/work-overlay/route.ts`
and `components/home/HomeFeaturedWork.tsx`'s `firstImage()` helper both auto-select
whichever media item was uploaded most recently matching the discipline's category
(`sort: { createdAt: -1 }`) — there is no admin control anywhere on the site over which
specific photo represents each discipline card. Also confirmed: `dancing` and
`web-development` currently have `category: null` in the Work overlay route, so those two
cards get no image at all today, not even an auto-picked one — this session decides
whether to fix that as part of the same pass.

1. Extend `page_sections`'s `home.featuredCards` (N6) and the Work overlay's discipline
   list with an admin-picked `mediaId` per card/discipline, defaulting to the current
   auto-pick behavior when nothing has been chosen — ships with zero visible change until
   Hussain actually picks something.
2. Build the picker UI by adapting `components/admin/private-galleries/PrivateGalleryMediaPicker.tsx`
   (93 lines, already built for exactly this "browse existing media, pick one" admin flow)
   rather than building a new picker from scratch. Read it fully first — confirm what's
   private-gallery-specific versus generic before reusing.
3. Wire the picker into both surfaces that need it: the Work overlay's discipline-card
   admin and the Featured Work admin section already built in N6 (`HomeSectionsForm.tsx`).
4. Decide and implement the `dancing`/`web-development` no-image gap — either give them a
   real `category` value so the auto-pick fallback works, or leave them
   image-picker-only with a clear empty state until an admin picks something. Propose
   both at Gate 1, don't assume.

Read `app/api/work-overlay/route.ts`, `components/home/HomeFeaturedWork.tsx`,
`lib/server/page-sections.ts`, `lib/page-sections-shared.ts`, and
`PrivateGalleryMediaPicker.tsx` fresh before writing code. Report the complete
affected-file list before touching anything, per standard gate.

**Build outcome — shipped with a deliberate re-scope from Hussain, well beyond the
original spec above. Recorded so the deviations don't read as bugs:**
- **Not a `mediaId` string, not optional, not pick-only.** Hussain rejected the
  auto-select `mediaId` model. Images are a first-class `SectionImage` object
  (`{ url, publicId }`, in `lib/page-sections-shared.ts`) with **two** ways to set them:
  pick from the existing media library (reuses the `PrivateGalleryMediaPicker` hook/card
  via a new single-select `components/admin/media-picker/MediaPickerModal.tsx`) **or**
  upload a fresh image to Cloudinary (`ImageField.tsx`, `CldUploadWidget` →
  `/api/sign-cloudinary-params`, into the new managed folder `hm_visuals/sections`).
- **Every work-layout page and every section got the field, not just Work overlay +
  Featured Work.** Work overlay cards store `cardImage` on `page_settings` (new
  `CardImageGroup` on the 5 discipline rows in `/admin/pages`); Featured Work cards, the
  hero, the creative panel, and every card-grid section (about/dancing/web-development/blog
  `TextCard`s) all carry an `image`. The three text-only home panels got the field too,
  per Hussain ("depends on the section / future design, but add it for now").
- **Empty means empty** (Hussain's call) — the old newest-by-category auto-pick was
  removed from both Featured Work and the Work overlay. The **hero is the one exception**:
  it keeps a photo/video fallback so it's never a blank full-screen frame.
- **dancing / web-development no-image gap** resolved as picker/upload-only (no category
  auto-pick invented for them).
- **Delete-on-replace** for uploaded assets: `lib/server/section-images.ts`
  (`deleteReplacedSectionImages`) diffs old vs new content on save in both the
  `page-sections` and `page-settings` PATCH routes and deletes orphaned uploaded
  `publicId`s, scoped to `hm_visuals/sections`. Library picks (empty publicId) are never
  deleted.
- **Gate-2 review changes:** removed the panel image from Services Preview and Testimonials
  (Hussain), rendered the creative panel as a Featured-Work-style image card, and
  extracted a shared `components/services/ServiceCard.tsx` used by both the Services page
  and the homepage Services Preview (`preview` variant trims the price chip + button row)
  so all service cards share one design — no duplicated markup.
- Mongo: no migration — missing `image` keys default to empty and merge cleanly, replaced
  wholesale on first admin save per page.

---

### Session N8 — Add People + Testimonials to the navbar — `done`
Confirmed gap, verified by reading `components/site/Navbar.tsx` in full: current nav is
exactly Work (overlay button) · About · Services · Book, in both the desktop bar and the
mobile drawer. `/people` and `/testimonials` are real, live, working pages — they're
simply not linked from the nav anywhere.

Add both as flat links, not inside the Work overlay — confirmed explicitly: Work stays
scoped to the 5 disciplines only; People and Testimonials are separate top-level nav
items alongside About/Services/Book.

**A camera-hump navbar redesign was explored and explicitly dropped.** Several mockup
passes (flat CSS shapes, then real Playwright-rendered HTML/CSS with actual gradients and
shadows) did not land against a reference image Hussain provided — the composition was
eventually confirmed correct on close re-inspection, but the exercise wasn't resolved in
this planning context and Hussain moved on. **The navbar's visual design stays exactly as
N1 shipped it — flat, no shape change.** This session is scope-limited to adding two
links to the existing structure, nothing else.

Desktop: add `<NavLink href="/people">People</NavLink>` and
`<NavLink href="/testimonials">Testimonials</NavLink>` to the existing link row in
`Navbar.tsx`, same pattern as the existing About/Services links. Six items total is tight
at real desktop nav width — check it doesn't wrap or crowd the Book CTA before calling
this done; if it's too tight, propose a fix (reduced letter-spacing, smaller inter-link
gap) rather than silently letting it overflow.

Mobile: add the same two links to the drawer list, matching the existing About/Services/
Contact pattern already there.

Read `Navbar.tsx` in full before writing — both the desktop link row and the mobile
drawer markup need the same two additions.

---

## Phase 2 — Preloader & core experience (completed portion)

### Session D1 — Preloader — `done`
Rebuilt and shipped (`fe97097`), replacing the ambiguous first version (`4ac950a`) that
fetched Cloudinary photos via a dedicated API route. Confirmed `done` (2026-07-27) after a
full re-verification pass — `tsc --noEmit` and `next build` both clean. The pre-rebuild
spec and the "Build outcome" record below are kept as history. One optional future
refactor exists (parent-controlled exit instead of self-unmount) but nothing downstream
depends on it — see the Preloader section in CLAUDE.md.

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

**Build outcome (2026-07-02) — shipped with three Hussain-directed changes from the spec
above, all requested live during Gate 2 review, not build errors:**
1. **No sessionStorage gate.** Spec said once per session; Hussain wants the preloader on
   every homepage visit — every hard refresh *and* every client-side navigation back to
   `/`. AppShell now mounts `<Preloader />` only when `pathname === "/"`, remounting on
   each arrival. Other public pages no longer show it at all.
2. **Symbol swaps:** NFT = lucide `Bitcoin` (not Hexagon; lucide has no ETH icon),
   Dancing = the 🕺💃 emoji pair rendered as text (not Footprints). Camera/Video/Code2 as
   proposed. Flash beat tightened to 0.22s per symbol after review ("reduce the emojis time").
3. **"Art" choreography:** appears centered on screen out of the burst (offset by half of
   "Hussain."'s measured width), holds, then glides right while "Hussain." assembles from
   per-letter random scatter + blur focus-pull (right-to-left, growing out from "Art") —
   replacing the simple slide-in spec'd above. Name renders in Cormorant Garamond via
   `next/font`, preloader-only.
Uses `useGSAP` (repo idiom from AnimatedText.tsx) rather than a raw effect — a raw
`useEffect` version tripped `react-hooks/set-state-in-effect`.

---

### Session D3 — Photography page: 3-mode viewer — `done`
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

**Build outcome (2026-07-30) — shipped with several Hussain-directed deviations from
the spec above, all requested live during the multi-round Gate 2 review. Recorded so they
don't read as bugs:**
- **3 views, not "3 modes over one grid":** switcher is Cylinder · Horizontal · Grid.
  The shared filter (search + tag chips) is the "category filter" and drives all three.
  Grid is the existing `MediaGrid` body verbatim.
- **Shared search extracted:** `components/media/useMediaSearch.ts` (all search/filter/DB
  logic pulled out of `MediaGrid`), `MediaGridResults.tsx` (card grid + load-more), and
  `MediaTagChips.tsx` (split from `MediaFilterBar`). `MediaGrid` now consumes these and is
  behaviour-identical for its other callers (videography, people/[slug]).
- **Cylinder** (`PhotographyCylinder.tsx`, raw Three.js, HeroBokeh idiom, full dispose):
  two geometry cases — a **wide shallow arc** for ≤5 photos (search results: big, all
  visible, gentle sway, no empty) and a **closed prism/cylinder** for 6+ (continuous
  right-to-left spin, camera pulled in so photos stay large). Assemble-scatter on
  (re)build, raycast click → existing `MediaLightbox`, ← / → arrow keys rotate.
  The original flat-plane even-ring / arc-adjacent / prism attempts each failed a specific
  Hussain complaint (2 flat planes → gaps between few → empty back → tiny box for search);
  the shallow-arc-vs-prism split is what finally landed.
- **Horizontal = auto-scroll marquee, NOT a ScrollTrigger pin.** Spec said "GSAP
  ScrollTrigger-driven horizontal track." Hussain rejected the pinned scroll-jack ("the
  lock is ruining the user experience"). Shipped as an rAF marquee
  (`PhotographyHorizontal.tsx`): auto right-to-left drift, **ping-pong around centre**,
  drag, ← / → keys. Full-bleed. Only unique results (no duplication); results that fit are
  centred by the container (the earlier `justify-center`-on-`w-max` was a no-op — the real
  bug behind "search results stuck left").
- **Switcher moved:** inline segmented control top-left, search top-right, tag chips inline
  next to the search (not a fixed corner, not a separate row) — per Hussain.
- **Mobile:** Mode 1 → **Grid** fallback (not Horizontal), switcher hidden — confirmed at
  Gate 1.
- **Shared file touched:** `components/site/AppShell.tsx` gained
  `lenis.on("scroll", ScrollTrigger.update)` (standard Lenis↔ScrollTrigger sync; benefits
  `AnimatedText` scroll reveals). No other page affected.
- Modes 1 & 2 are `next/dynamic({ ssr:false })` so three/gsap code-split out of initial load.
- Verified in-browser across many rounds; `tsc --noEmit` + eslint clean.

---

## Phase S — Security & hardening

### Session S1 — Finish the security migration — `done`
Part of this work already shipped from Cowork (2026-07-31): expiring signed session
tokens (`lib/auth/session-token.ts`), server-enforced expiry in both the Edge proxy and
the Node auth lib, deduplicated cookie constants, and baseline security headers in
`next.config.ts`. **What remains needs a browser and env access, which is why it's a
session and not a docs edit.**

1. **Move off the plaintext admin password.** `ADMIN_PASSWORD_HASH` is currently NOT set
   in `.env.local` — only plaintext `ADMIN_PASSWORD`. Order matters, do not reorder:
   a. Run `node scripts/generate-admin-password-hash.mjs` to produce a scrypt hash.
   b. Set `ADMIN_PASSWORD_HASH` in `.env.local` **and** in Netlify env vars.
   c. Verify login works in both local and deployed environments.
   d. Only then delete the plaintext fallback branch in `verifyAdminPassword()`
      (`lib/auth/admin.ts`, marked with a DEPRECATED comment) and remove `ADMIN_PASSWORD`
      from both environments.
   Deleting the fallback before (b) locks admin out of whichever environment lacks the hash.
2. **Rotate `ADMIN_COOKIE_SECRET`** in both environments. The old scheme signed the
   constant string `"ok"`, so the old signature was a permanent credential — rotating
   guarantees any copy of it is dead.
3. **Add a Content-Security-Policy.** Deliberately omitted from the shipped headers: a
   correct CSP must allow Cloudinary, the upload widget, and Next's inline runtime, and a
   wrong one silently breaks images and admin uploads. Build it, then verify in-browser:
   homepage images, photography viewer (Three.js), admin media upload, testimonial upload.
4. **Clean unused public env vars.** `.env.local` defines `NEXT_PUBLIC_CLOUDINARY_API_KEY`
   and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, neither referenced anywhere in source
   (confirmed by full-text search — only `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and
   `NEXT_PUBLIC_SITE_URL` are used). Any `NEXT_PUBLIC_` var is compiled into the browser
   bundle, so an API key must never carry that prefix. Delete both, and the duplicate
   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` line.
5. **Consider real session revocation.** Current tokens are stateless: expiry is enforced,
   but a stolen token stays valid until it expires (7 days) — logout can't kill it. True
   revocation needs a session collection in Mongo, which the Edge proxy cannot query
   directly. Decide: accept the bounded window, shorten the TTL, or move the admin auth
   check out of Edge middleware. Propose options at Gate 1, don't pick silently.

**Gate 2 must include, at minimum:** log in, confirm admin loads, log out, confirm the
admin redirects to login, and confirm a browser devtools check that `hm_admin` is now a
`v1.<timestamp>.<nonce>` value rather than `ok`.

**Build outcome (2026-08-01):** committed `feaec2a`. No Netlify env / no deployed site
exists yet, so every "both environments" and "deployed" step collapsed to local only.

- **Two blocking bugs found and fixed that would otherwise have locked admin out:**
  1. **Hash format mismatch.** `generate-admin-password-hash.mjs` emitted `scrypt:<hex>:<hex>`
     while `parseScryptHash()` expected `scrypt$<base64>$<base64>` — the migration as
     written would have failed every login. First reconciled to `$`/base64, which exposed:
  2. **`$` is destroyed by Next's env loader.** `@next/env` runs `dotenv-expand`, which
     treats `$` as variable interpolation, so a `$`-delimited hash is silently corrupted at
     load (server saw `scrypt/w2uIPQ==+E5ANa...`). Final format is **colon-delimited hex**
     (`scrypt:<hex>:<hex>`) — hex uses only `[0-9a-f]`, immune to any env parser. Both the
     script and `parseScryptHash` now use it; verified the value survives `@next/env` intact
     and that hash-only login works after the plaintext fallback was removed.
- **Item 1 (plaintext → hash):** DONE. Hash set in `.env.local`, plaintext-fallback branch
  and the now-dead `timingSafeEqualString` removed from `lib/auth/admin.ts`,
  `isAdminPasswordConfigured()` now checks only the hash, `ADMIN_PASSWORD` removed from
  `.env.local`. Verified in-browser: wrong password → `error=wrong`, correct password →
  protected `/admin/inquiries`, admin renders, zero console errors.
- **Item 3 (CSP):** DONE. Full CSP in `next.config.ts` (dev-only `'unsafe-eval'` + HMR
  websockets; prod strict). Allows Cloudinary CDN (`res.cloudinary.com`), the upload-widget
  script + iframe (`upload-widget.cloudinary.com`), and signed-upload POSTs
  (`api.cloudinary.com`). Verified: homepage images load, Three.js photography viewer
  renders, the Cloudinary upload widget script + iframe load, public testimonials page
  clean — zero CSP violations anywhere. `'unsafe-inline'` kept for scripts (nonce-based CSP
  impractical on this Netlify/App-Router setup; documented in-file).
- **Item 4 (env cleanup):** DONE with one correction to the spec — `NEXT_PUBLIC_CLOUDINARY_API_KEY`
  is **NOT** unused: `next-cloudinary` reads it internally to build the signed-upload widget
  config (the original grep missed `node_modules`). Cloudinary's `api_key` is a public
  identifier by design (only `api_secret` is sensitive), so `NEXT_PUBLIC_` is correct — it
  was **kept**. Deleted only `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (all uploads are signed,
  none pass `uploadPreset`) and the duplicate `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` line.
- **Item 5 (revocation):** decided **shorten TTL to 2 days** (`SESSION_TTL_MS` in
  `session-token.ts`; cookie maxAge follows). Full stateful revocation deferred — would
  need a Mongo session store the Edge proxy can't reach.
- **Item 2 (rotate `ADMIN_COOKIE_SECRET`):** DEFERRED, not done. The rationale (kill the old
  `"ok"`-signed credential) is moot locally — the new scheme already rejects any old-format
  cookie via `isSessionValueFresh`, and the secret was never deployed or exposed. **Carry
  to launch prep: rotate it in Netlify env when the site is first deployed**, alongside a
  deploy-time re-verification of the CSP (prod drops the dev `'unsafe-eval'`/`ws:`) and of
  hash login. `.gitignore` covers `.env.local` (never committed).

---

### Session S6 — Remove `unoptimized` from testimonial images — `done`
Found 2026-07-31 after the Cloudinary custom loader shipped.
`components/testimonials/SafeImage.tsx:14` and
`components/testimonials/review-form/PreviewImage.tsx:6` pass `unoptimized`, which
bypasses the image loader entirely — the browser downloads the **full original** from
Cloudinary. Same slowness class as the `/_next/image` timeout bug the loader fixed;
the flag was likely added to dodge exactly those problems, and is now obsolete.

Fix: remove `unoptimized` from both. Caveat to verify at Gate 2: testimonial photos are
user-uploaded — confirm all stored srcs are Cloudinary URLs. Non-Cloudinary srcs pass
through the loader unchanged (no resizing, but nothing breaks). Verify avatars, review
photo strips, and the review-form preview all still render.

**Build outcome (2026-08-03):** committed on `v2-portfolio`. `unoptimized` removed from
both components; confirmed all srcs are Cloudinary URLs — `SafeImage` renders stored
testimonial photos, `PreviewImage` renders the `CldUploadWidget`'s `info.secure_url`
(never blob previews). Verified live: avatars and review photo strips now load through the
Cloudinary loader (`.../upload/w_256,c_limit,q_auto,f_auto/...`) with a responsive srcset;
the custom loader passes any non-Cloudinary src through untouched, so the change is safe
regardless. `tsc` + eslint clean.

**Two adjacent bugs on the same page found and fixed in the same commit (Hussain
reported them at Gate 2, approved fixing both):**
1. **Broken location map — CSP regression from S1.** The `TestimonialMap` OpenStreetMap
   embed iframe (`www.openstreetmap.org/export/embed.html`) was blocked because S1's CSP
   set `frame-src` to the Cloudinary upload widget only. Browser refused the iframe (zero
   network requests). Fix: added `https://www.openstreetmap.org` to `frame-src` in
   `next.config.ts` (+ a comment documenting the surface). Map renders again.
2. **Scroll-jacking on the testimonials page.** Two sources: (a) the map iframe captured
   the wheel — added a transparent `absolute inset-0` shield over it in `TestimonialMap.tsx`
   so the page scrolls instead of the map panning; (b) the real complaint — the review
   carousel's `handleWheel`/`handleTouchStart`/`handleTouchEnd` in `TestimonialsSection.tsx`
   (introduced in commit `c037d85`) called `preventDefault()` and flipped reviews on scroll.
   Removed all three handlers + their refs. Reviews now navigate only via the up/down
   chevrons and dot indicators (both pre-existing). Matches Hussain's standing "no
   scroll-jacking" rule. Verified: wheel over reviews scrolls the page and does not change
   the active review; chevrons + dots still navigate.

---

### Session S2 — Reuse audit against the real code rule — `done` (audit + slice S2a)
**Spec (as queued):** The primary rule is reuse-over-repetition; file length is the
symptom, not the rule. 91 source files exceeded 100 lines. For each file over ~150 lines,
classify: **Extractable duplication** (same shape appears elsewhere → extract a shared
component/hook/util — the actual work) vs **Cohesive and unavoidable** (a single Three.js
scene, one API route's full CRUD surface — leave it). Report the classification for every
file before changing any; expect several sessions; propose a split at Gate 1.

**Audit outcome (2026-08-04):** Classified all 43 source files >150 lines. Key finding:
the reuse infrastructure the rule worries about already exists and is mostly used —
`useAdminAction`/`AdminActionFeedback` (F5), `app/api/_lib/common.ts` parsers,
`requireAdminOr401`, `deleteManagedCloudinaryAsset`, `useMediaSearch`, the media-picker,
`PageHeader`/`PortfolioCard`. Real duplication is **narrow**, not the wide refactor the
"91 files" number implied. Three.js scenes (`PhotographyCylinder`, `PhotographyHorizontal`,
`HeroBokeh`), server data/logic modules (`cloudinary-assets`, `page-sections`, `page-seo`,
`media-serializers`, …), data modules (`testimonial-locations`), and single cohesive
components (`WorkOverlay`, `Navbar`, `NftModal`, `PublicReviewForm`, `useContactFormState`)
were all classified **Cohesive** — left untouched (Hussain requested no explanatory code
comments, so none were added). Split into two slices: S2a (done here), S2b (carved into
the queue).

**S2a — services-admin feedback consolidation (executed):**
- `app/admin/(protected)/services/lib/ui.ts`: the local `Banner` type was byte-identical
  to `AdminActionFeedbackState`; replaced with an alias (one source of truth).
- `hooks/useServicesAdmin.ts`: feedback state now comes from the shared `useAdminAction`
  (matching `usePeopleAdmin`, satisfying F5). The 8 duplicated
  `busy + info + try/catch/finally` handler blocks collapsed into one hook-internal
  `withBusy` runner (auto-dismiss timer + custom `CATEGORY_INACTIVE`/`SERVICE_ARCHIVED`
  messages preserved). `ServiceEditorModal` left as-is — its local `busy` is a Save-button
  guard, not the feedback pattern.
- Removed the redundant `scrollIntoView` from `showBanner` (the banner is `sticky top-3`,
  always visible) — this fixed a page-self-scroll-on-save that predated the session.
- Two pre-existing `ServiceEditorModal` bugs fixed in passing (both surfaced during Gate 2
  verification): guarded `open?.()` on the Cloudinary upload button (undefined until the
  widget script loads), and the Starting Price input now strips non-numeric characters on
  entry (`inputMode="decimal"`) instead of silently discarding typed letters on save.
- Verified: `tsc` 0 errors, `eslint --max-warnings 0` clean, 79/79 tests, live admin CRUD
  confirmed by Hussain. **No CLAUDE.md impact** — S2a brings code into compliance with the
  existing F5 rule rather than changing any rule.

**S2b (remaining):** extract the shared preamble + DELETE pattern across the seven admin
`[id]` routes. Executed — see §S2b below.

---

### Session S2b — API `[id]`-route boilerplate extraction — `done`
**Spec (as queued):** Follow-up slice from the S2 reuse audit. The one remaining
extraction worth doing is the shared boilerplate across the seven admin `[id]` mutation
routes (1537 lines): `media/[id]` (363), `testimonials/[id]` (273), `services/[id]` (273),
`people/[id]` (198), `private-galleries/[id]` (157), `service-categories/[id]` (143),
`inquiries/[id]` (130). Extract (leaving domain field-mapping in place): the
`requireAdminOr401 → validate ObjectId → findOne → 404` preamble, and the DELETE
`soft-archive vs hard-delete` pattern where present. HIGH blast radius — touches every
admin mutation. Gate 1 must confirm each route still enforces auth + input validation +
rate limiting; every route re-verified in the browser. Do NOT collapse routes that only
superficially resemble each other.

**Outcome — shipped 2026-08-06:**
- **New `app/api/_lib/admin-route.ts`** with three helpers:
  - `requireAdminObjectId(ctx)` → `Response | { id, oid }`. Runs `requireAdminOr401`
    **first**, then `parseObjectId` — the auth-before-parse ordering now lives in one
    place. Returns both the raw `id` string and parsed `oid` so routes needing either
    don't re-parse (removes the repeated `new ObjectId(id)` allocations in the
    `ObjectId.isValid`-style routes).
  - `findByIdOr404(db, collection, oid, options?)` → `Response | { doc }`. The
    findOne→404 lookup; `options` forwards projections. Uses `.findOne<WithId<Document>>`
    so the returned doc types correctly.
  - `wantsHardDelete(req)` → the `?hard=1` soft-vs-hard delete flag (services, inquiries).
- **All 7 routes converted.** Call sites use the `if (gate instanceof Response) return gate`
  narrowing idiom (`noStoreJson` returns `NextResponse extends Response`, so the guard
  works). `inquiries/[id]` also had its `{ params }`-destructured handler signatures
  normalized to `ctx`. Every route's domain logic (cloudinary cleanup, count
  increment/decrement, private-gallery + inquiry blockers, `revalidatePath`) left
  untouched.
- **Behavior:** no auth/validation/rate-limiting semantics changed (these routes are
  admin-cookie-gated, not rate-limited by design — that's the public POST routes).
  Only cosmetic change: `testimonials` + `private-galleries` error strings `"Invalid id."`
  / `"Not found."` lost their trailing period (standardized). Verified zero client
  coupling to those strings via grep before changing.
- **Test:** `test/api/admin-route.test.ts` (7 tests) — mocks `requireAdminOr401` to cover
  `requireAdminObjectId`'s deny / bad-id-400 / valid-id branches, `findByIdOr404`
  doc-vs-404 + projection forwarding with a fake db, and `wantsHardDelete` flag parsing.
  The 7 routes stay covered by the existing `app/api/**/route.ts` import-smoke glob.
- **Verification:** `tsc --noEmit` 0, `eslint --max-warnings 0` 0, `npm test` 86 pass.
  All 7 routes probed unauthenticated → PATCH+DELETE 401 "Unauthorized"; malformed-id
  also 401 (confirms auth precedes id-parse). No server errors. Hussain confirmed the full
  authenticated CRUD round-trip (edit/delete/archive across media, testimonials, services,
  service-categories, people, private-galleries, inquiries).
- **CLAUDE.md impact:** added `app/api/_lib/admin-route.ts` to the "Reusable components —
  always use, never reinvent" list so future admin `[id]` routes use the helpers instead
  of re-inlining the preamble. Same commit as the code.

---

### Session S3 — Automated test baseline — `done`
**Spec (as queued):** No test script in `package.json` and no CI; verification was
`tsc --noEmit` + eslint + Gate-2 manual checks, which had already let real gaps ship
(§F2, §N1). Minimum viable baseline: (1) a test runner + `npm test`; (2) auth tests first
(`lib/auth/session-token.ts` round-trip/expiry/malformed/version/`safeEqual`, and
`verifyAdminPassword` correct/incorrect/missing-config); (3) a smoke test that public
route modules import without throwing; (4) optional GitHub Action running
typecheck + lint + test.

**Outcome — shipped 2026-08-03:**
- **Runner: Vitest** (`^3.2`), chosen over `node:test` because the repo's `@/*` alias, TS/ESM,
  env stubbing, and the smoke test's module discovery all work out of the box. Added
  `test` (`vitest run`) + `test:watch` scripts. `vitest.config.ts`: node environment,
  regex alias `/^@\//` → repo root (so scoped npm packages like `@gsap/react` are left
  alone), and dummy `MONGODB_URI`/`MONGODB_DB_NAME`/`RESEND_API_KEY` env so modules that
  read those at import time don't throw or hit the network.
- **`test/auth/session-token.test.ts`** (15 tests): token shape + fresh nonce, `parseIssuedAt`
  valid + all malformed branches, `isWithinTtl` inside/at/past the 2-day boundary + the
  ±60s skew window, `isSessionValueFresh`, `safeEqual` (equal / length-mismatch / same-length-differ).
- **`test/auth/verify-admin-password.test.ts`** (7 tests): builds a real `scrypt:<hex>:<hex>`
  hash in-test and asserts correct→true, wrong→false, missing-config→false, wrong-prefix→false,
  non-hex→false, plus `isAdminPasswordConfigured` true/false. `next/headers` is mocked so the
  test doesn't depend on Next's request runtime.
- **`test/smoke/server-modules.test.ts`** (53 tests): `import.meta.glob` over
  `lib/server/*.ts` + `app/api/**/route.ts` (51 modules) — each must import without throwing.
  RSC `page.tsx` trees excluded (they pull browser-only libs — Lenis, react-globe.gl,
  GSAP/Three — that touch `window` at module scope). Needs `/// <reference types="vite/client" />`
  for `import.meta.glob` typing under `tsc`.
- **CI:** `.github/workflows/ci.yml` on push (`master`, `v2-portfolio`) + PR — Node 22,
  `npm ci`, then `typecheck → lint → test`. **No `next build`** (matches the standing
  verify-without-build rule).
- **Security / supply chain:** Vitest introduced **zero** vulnerable packages — the 5
  pre-existing high-severity advisories (`next`, `sharp`, `postcss`, `js-yaml`,
  `brace-expansion`) predate this session; `npm audit fix` deliberately NOT run (would risk
  breaking `next`/`sharp`, out of scope). Added `esbuild@0.28.1: true` to `allowScripts`
  (its install script is vitest's; reviewed and allowed, matching the existing pinned-entry
  convention).
- **Lint:** the repo's `npm run lint` was already red (7 errors) before this session. Fixed
  all 7 so CI is green: six `react/no-unescaped-entities` (`"` → `&quot;`, renders
  identically — `ReviewModal.tsx`, `SingleReviewCard.tsx`, admin `TestimonialForm.tsx`)
  and one `react-hooks/set-state-in-effect` on `Navbar.tsx`'s next-themes hydration-mount
  flag (suppressed with a justified `eslint-disable-next-line`; the one-shot `setState` is
  the documented pattern). Three `exhaustive-deps` **warnings** left deliberately (don't fail
  lint) and queued as **S7** — fixing them changes effect re-run timing and needs per-surface
  verification.
- **Result:** `npm test` 75/75, `tsc --noEmit` clean, `npm run lint` 0 errors (exit 0).

---

### Session S7 — Resolve remaining eslint `exhaustive-deps` warnings — `done`
S3 cleared all 7 eslint **errors** so `npm run lint` exits 0 and CI is green. Three
`react-hooks/exhaustive-deps` **warnings** remain — deliberately left by S3 because fixing
a dependency array changes *when* an effect/callback re-runs (get it wrong → infinite fetch
loop or re-render storm), which is a real behaviour change, not a lint cosmetic. Each needs
the data-loading path read fully before touching.

The three warnings:
1. `app/admin/(protected)/media/list/page.tsx:98` — `useCallback` missing `setBanner`.
2. `app/admin/(protected)/testimonials/TestimonialsAdminClient.tsx:44` — `useEffect` missing `load`.
3. `hooks/usePeopleAdmin.ts:60` — `useEffect` missing `load`.

Notes:
- Two of the three are **admin files** — this overlaps admin-session territory; treat it as
  a real change with Gate-2 verification of each affected admin surface, not a lint pass.
- The usual correct fix for the `load` cases is to wrap `load` in `useCallback` (stable
  identity) and then list it, **not** to just add the current `load` to the array (which
  would re-run every render). Verify no fetch loop after each change.
- After the fix, consider tightening `npm run lint` to `--max-warnings 0` so warnings can't
  silently accumulate again — propose at Gate 1, don't assume.

**Build outcome (2026-08-03):**
- Root insight: all three `load` paths close over **only stable references** — `useState`
  setters plus `setBanner` (`= setFeedback` from `useAdminAction`, itself a raw `useState`
  setter, so stable identity is React-guaranteed). ESLint flags `setBanner` only because it
  crosses a custom-hook boundary it can't statically prove stable. Fixes therefore add
  identity that never changes → zero behaviour change, no fetch loop.
- **media/list/page.tsx** — `load` was already a `useCallback`; added `setBanner` to its
  deps. The debounced `useEffect(…, [load])` still re-runs only on filter change.
- **TestimonialsAdminClient.tsx** — wrapped `load` in `useCallback([setBanner])`; effect
  now `[load]`. Added `useCallback` to the React import.
- **usePeopleAdmin.ts** — same `useCallback([setBanner])` treatment; `save()` still calls
  `load()` after a successful write. Added `useCallback` to the React import.
- **Guardrail adopted** (Hussain approved): `package.json` lint script → `eslint
  --max-warnings 0`, so any future `exhaustive-deps` warning fails CI. CLAUDE.md's Testing
  & CI section updated to match (removed the now-stale "CI fails on errors, not warnings"
  line and the "tracked in queue S7" pointer).
- **Verification:** `tsc --noEmit` clean · `npm run lint` exits 0 under `--max-warnings 0`
  (all 3 warnings gone) · `npm test` 75/75 · dev server: `/admin/{media/list,testimonials,people}`
  each fetch their list on mount with **no loop**. The double `/api/people` and
  `/api/testimonials` on first mount is React 19 StrictMode dev double-invoke (bounded to 2,
  absent in production, and present before this change); `media/list` collapses it to one
  via its debounce `setTimeout` + cleanup.

---

### Session S4 — Work overlay card images: decide the empty state — `done`
**Symptom:** `/api/work-overlay` returns `imageUrl: null` for all 5 disciplines, so the
Work overlay — the primary navigation surface, opened from the nav on every visit —
renders 5 flat `bg-muted` cards.

**Cause, confirmed by git, not a regression:** commit `1862175` (N7) removed the
auto-pick. Before it, the route ran
`findOne(buildPublicMediaQuery({type:"image", category}), {sort:{createdAt:-1}})` per
discipline, so cards silently showed the newest photo in that category. N7 replaced this
with the admin-picked `page_settings.cardImage` and the rule "empty means empty, hero is
the only exception."

**HARD CONSTRAINT:** `dancing` and `web-development` have `category: null` — no media
category, so no "newest photo in category" fallback is possible for 2 of the 5 cards.

Options presented at Gate 1: (a) leave as-is, (b) one global fallback image, (c)
per-discipline admin warning. (b)/(c) combine.

**Decision (Hussain):** **(a) + (c)** — leave the public behaviour as-is (N7's "empty
means empty" upheld, no auto-pick), add an admin warning so a visible surface can never
*silently* go blank.

**Build outcome (2026-08-03):**
- **Warning system, admin-only, no public behaviour change.** Two new shared components in
  `app/admin/(protected)/pages/components/`: `RowPill.tsx` (the amber collapsed-row pill,
  reused for "Unsaved" and "Needs image") and `CardImageWarning.tsx` (the inline amber
  note, `AlertTriangle` + message).
- `usePagesAdmin.ts` — added `needsImage(row)`: true when a **visible discipline** has no
  Work-overlay `cardImage.url`, **or** the homepage **hero** is imageless, **or** any
  homepage **Featured Work card** is imageless. Row pill ⟺ any inline warning inside the
  row, so the two stay in lockstep. (Started as `needsCardImage`, broadened + renamed after
  Hussain flagged the Home row wasn't flagging its empty hero.)
- Inline `CardImageWarning` wired into `CardImageGroup` (visible discipline, empty),
  `HomeSectionsForm` hero group (empty), and each Featured Work card (empty).
- Fixed stale copy in `HomeSectionsForm` ("pulls that discipline's latest image" →
  "shows the card image you set below — leave it empty for no image").
- **Hero brought onto the same system (reverses N7's "hero is the one exception").**
  `HomeHero.tsx` dropped the `firstImage(photos) || firstImage(videos)` auto-fallback —
  it could resolve to a **video-file URL** rendered through `next/image`, producing the
  broken-image frame Hussain reported. Hero now uses `heroImage.url` only and renders a
  flat `bg-muted` base when empty (never a borrowed photo, never a broken frame).
  `app/page.tsx` no longer fetches `getPhotographyItems()`/`getVideographyItems()` (two
  fewer homepage DB queries; those results fed only the removed fallback).
- CLAUDE.md updated: "empty means empty everywhere, no exceptions"; hero fallback removal
  documented; warning system (pill + hero + featured) recorded.
- **Verification:** `tsc --noEmit` clean · `npm run lint` 0/0 · dev server `/admin/pages`:
  "Needs image" pill live on Home (empty hero) and Photography (empty card image); inline
  warnings fire in the discipline card group, hero group, and featured cards when empty and
  stay silent when an image is present; draft-clear then reload confirmed **no DB write**.
  Public homepage with empty hero renders the clean flat hero (bokeh + title + CTAs), no
  broken image.
- **Flagged, out of scope:** the D1 preloader appeared to replay/loop across rapid dev
  navigations — noted for Hussain, not investigated here.

---

## Phase S — Security & hardening

### Session S5 — `page-settings` PATCH treats partial updates as full replacement — `done`
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

**Build outcome (2026-08-03):**
- New client-safe pure helper `resolveOptionalCardImage(body)` in
  `lib/page-sections-shared.ts`: a **present** `cardImage` key (even null/garbage) is an
  explicit set — garbage/null → `EMPTY_SECTION_IMAGE` (clear); an **absent** key → returns
  `undefined`, meaning "leave unchanged."
- `page-settings` PATCH route now builds `$set` incrementally: `slug`/`isActive`/`updatedAt`
  always; `cardImage` — plus the `findOne` and the `deleteReplacedSectionImages` diff — only
  when `resolveOptionalCardImage` returns a value. Response echoes `cardImage` only when it
  participated. No behaviour change to today's UI (client still sends both fields → identical
  stored result).
- `page-sections` PATCH route: the field-omission bug doesn't exist there (the whole body
  *is* `data`, always sent whole), but it lacked a shape guard — a null/array/primitive body
  would corrupt the stored doc and orphan-delete every uploaded asset via the diff. Added
  `if (!isRecord(data) || Array.isArray(data)) return 400`. Empty `{}` stays valid ("empty
  means empty").
- New unit test `test/section-images.test.ts` (4 cases, no mocks) covers
  `resolveOptionalCardImage`: absent → undefined, valid → echo, null/malformed → empty image.
- **Verification:** `tsc --noEmit` clean · `npm run lint` 0/0 · `vitest` 57 passed (new 4 +
  smoke importing both edited routes). No CLAUDE.md impact (pure safety hardening, no
  rule/constraint/architecture change).
- Gate 1 security line: no new trust boundary (same admin-gated PATCH routes); no secret into
  client; this session *adds* input validation; no rate-limit change (admin-authed, not public).

---

## Phase DS — Design system rescue (Impeccable)

### Session DS0 — Install the design + motion skill stack — `done`
**Do this first.** All three are prompt-only skills (SKILL.md files, no scripts, no
hooks, no runtime) — the lowest-risk item in this phase. They shape how every later
design session thinks, so installing them before DS1/DS2 and D4–D13 is the whole point.

Run from the project root, in a Code tab:

```
# 1. Anthropic's frontend-design — the upstream reference Impeccable was built from.
#    Single SKILL.md, no installer. Copy into .claude/skills/frontend-design/
#    Source: https://github.com/anthropics/skills/tree/main/skills/frontend-design

# 2. taste-skill — ONLY the redesign variant. Do not install the whole set.
npx skills add https://github.com/Leonxlnx/taste-skill --skill "redesign-existing-projects"

# 3. Emil Kowalski's motion skills (Vercel/Linear; author of Sonner + Vaul)
npx skills@latest add emilkowalski/skills
```

**Report before finishing:** every file each installer wrote, and whether any of them
added a hook or a script (they should not — flag it if they do). Add the routing table
from CLAUDE.md ("Design & motion skills — which to load, when") to your Gate 1 report so
Hussain can confirm the mapping is right.

**Do not install `ui-ux-pro-max`** — evaluated and rejected 2026-08-04. It generates a
design system by matching an industry template (161 product types → preset palette,
typography, section pattern). This project already has a design language, OKLCH tokens,
and named references; template selection is the opposite of the target. Reasoning
recorded in CLAUDE.md.

**Verify after install:** the skills appear in the harness (restart the Code tab if not),
and `hm-visuals-voice` still fires for copy — the new skills must not shadow it.

**Build outcome (2026-08-06):**
- All three installed. `frontend-design` fetched manually via curl from anthropics/skills
  → `.claude/skills/frontend-design/` (real dir: `SKILL.md` + `LICENSE.txt`, no scripts,
  no bundled references).
- `npx skills` (CLI v1.5.18) does **not** write into `.claude/skills/` directly — it writes
  real skill files to `.agents/skills/<name>/` and symlinks each into `.claude/skills/`
  (and 16 other agent tools). `skills-lock.json` at repo root is its manifest. All three
  (`.agents/`, the symlinks, `skills-lock.json`) are committed.
- `redesign-existing-projects` installed alone from Leonxlnx/taste-skill (the repo has 13
  skills; only the one variant was selected, per spec).
- Emil's `emilkowalski/skills` installed **9** skills, not the 6 the routing table assumed:
  the core motion set (`review-animations`, `find-animation-opportunities`,
  `improve-animations`, `animation-vocabulary`, `prototype`, `pick-ui-library`) **plus 3
  extras kept**: `animate`, `apple-design`, `emil-design-eng`.
- **Routing-table mapping corrected in CLAUDE.md (same commit):** the Gate-1 "write a
  precise motion spec" step is **`animate`**, not `animation-vocabulary`. The installed
  `animation-vocabulary` is only a reverse-lookup glossary (described effect → term); it
  does not spec durations/easings/choreography. Added `apple-design` (spring/gesture feel,
  materials) and `emil-design-eng` (UI-polish philosophy) rows too.
- **Hook/script audit (DS0's key check):** no installer added a hook or any script.
  `.claude/settings.json` byte-identical to baseline; no `.claude/settings.local.json`
  created; no `.gitignore` block written; every installed skill is `.md`-only.
- Harness picked up all skills live this session (`frontend-design`,
  `redesign-existing-projects`, Emil's set all resolved via the Skill tool). `hm-visuals-voice`
  remains a plugin skill (`anthropic-skills:` namespace) — no name collision, un-shadowed.
- `ui-ux-pro-max` deliberately not installed.
- No source code changed → no graphify update / graph commit. No security surface
  (skills are prompt-only `.md`; no auth/API/cookie/env/input touched).

---

### Session DS1 — Evaluate the detector (no install, no hooks) — `done`
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

**Build outcome (2026-08-06):**
- **Key discovery — the prescribed command is the wrong one for this codebase.**
  `detect app/ components/` returns **zero** findings on real source, because Impeccable
  uses **regex matching on non-HTML files** (a tiny rule subset: it caught a planted
  `cubic-bezier` bounce but ignored a gradient, `#000`, and `9px` font in the same test
  file). The full 59-rule set (contrast, layout, type hierarchy, occlusion) runs **only
  against rendered HTML/URLs (Puppeteer)**. This repo is 100% TSX/CSS with no static HTML,
  so the source scan is inert. The only 3 whole-tree findings were on
  `graphify-out/graph.html` — a generated artifact, not a site surface.
- **Real signal came from URL scans.** Ran `npx impeccable detect <url>` against all **11
  rendered public pages** → **259 findings**. Nothing installed, nothing written to the
  repo; dev server stopped after.
- **Triage of 259 findings:**
  - **Real (thin, concentrated in shared components):** glass-panel low-contrast text over
    backdrop-filter (footer `SiteFooter.tsx` + `StickyCta.tsx`, min pixel contrast 1.1–1.4:1,
    CTA-subtext medians 2.6–3.4:1, ~50 findings); undersized functional text 9–10px
    (`WorkOverlay.tsx` discipline sublabels ×5 + logo mark, 69 findings, really 2 sources);
    `transition: width, height` layout animation (1 shared element, 11); 3 genuine
    nested-cards (home/contact/videography); long line-length 96–112ch on body copy (8).
    → **~5 fixes total**, all in shared global components.
  - **Wrong (misfires):** low-contrast `#ffffff on #ffffff` 1.0:1 (~55) — text over
    full-bleed images / WebGL canvas / video the detector can't sample, resolves both
    layers to white; text-occlusion on contact "Website" (1) — it's an `sr-only`
    `aria-hidden` `tabIndex=-1` **spam honeypot**, deliberately hidden, not a bug.
  - **Intentional (→ `ignoreRules` with reason if DS2 ever installs):** `image-hover-transform`
    (PortfolioCard hover zoom, documented); `gpt-thin-border-wide-shadow` (glass-card
    aesthetic, advisory); `extreme-negative-tracking` -0.06em (display tracking);
    `oversized-h1` 88px homepage hero (title, revisit in homepage design pass);
    `kicker-above-heading` "HM VISUALS" (footer **brand lockup**, not a page eyebrow — N4's
    ban targeted `PageHeader` content eyebrows); plus pre-registered `bounce-easing`/elastic
    for D4/D5.
- **Recommendation (accepted by Hussain 2026-08-06): trimmed DS2, not the full install.**
  The detector earns an install-free keep as an occasional **manual `npx impeccable detect
  <url>`** accessibility spot-check. The auto-hook is worthless here (fires on TSX saves →
  regex-empty; can't scan a URL on save). `DESIGN.md` generation is skipped (second
  source-of-truth conflict risk; CLAUDE.md is the design language, DS0 skills cover
  direction). The 5 Real findings were **folded into D13** as concrete tasks. Detector does
  **not** diagnose the "generic AI-template vs igloo/aikawakenichi ambition" gap DS exists
  for — its rules are accessibility/slop-signature checks, not aesthetic-ambition judgment.
- No source code changed → no graphify update / graph commit. No security surface (ran a
  read-only offline CLI + local dev server; no auth/API/cookie/env/input touched).
  CLAUDE.md updated (impeccable routing note: detector is URL-only on this codebase).
  DS2 re-scoped in the queue accordingly.

---

### Session DS2 — Fold Impeccable findings in; skills for the design gaps — `done`
**Re-scoped 2026-08-06 after DS1.** The original "install + hook + `DESIGN.md`" plan is
**dropped** — DS1 showed it isn't justified: the file-save hook is worthless here (fires
on TSX edits, which are regex-empty; can't scan a URL on save), and generating `DESIGN.md`
risks a second source of truth that conflicts with CLAUDE.md (the exact mechanism behind
the old eyebrow/gradient contradictions). CLAUDE.md stays the single design language; the
DS0 direction skills cover direction. What remained of DS2:

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
queue Gaps #1 and #2. The detector cannot judge aesthetic ambition (igloo/aikawakenichi vs
generic template) — that's what the DS0 skills are for:
- **Homepage** (no design session since D2 was deleted): `frontend-design` (DS0) for
  direction + signature element, `prototype` (DS0) to put 2–3 hero directions behind a
  switcher before committing.
- **About** (no rebuild session): `redesign-existing-projects` (DS0) for the audit, then
  `frontend-design` for the rebuild.
- **One direction skill at a time** — running `frontend-design` and
  `redesign-existing-projects` together produces mush. Pick one per pass, name it in the
  Gate 1 report.

**DS2 outcome (2026-08-08):** confirmed as a **no-code session** — zero source files
touched. Parts 1–2 verified in place: the 5 Real findings are already D13 checklist items,
and the detector is still install-free (not in `package.json`, no config file, no hook in
`.claude/settings*.json`, no `DESIGN.md`). Part 3 resolved at Hussain's direction ("why
would you keep them open if that's what needs to be done") — the two design gaps are now
**scheduled** as Phase 2a sessions in the queue: **D2b — Homepage design pass** (resolves
Gap #1; `frontend-design` + `prototype`; also re-scopes D4's deferred homepage-transition
line) and **D2c — About page rebuild** (resolves Gap #2; `redesign-existing-projects` audit
→ `frontend-design` rebuild). Both run before D4, D2b first. No CLAUDE.md impact (the DS2
re-scope was already recorded there in DS1). No security surface. No source change → the
graph commit carries only the queue/archive doc edits.

---

## Phase 2a — Design direction (ran before D4)

### Session D2b — Homepage section pass — `done`
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

**Build outcome (2026-08-18).** Shipped. Files: new `components/shared/Button.tsx` and
`components/home/HomeExhibitionGlobe.tsx` (returns `null` — the D6 mount point); edits to
`app/globals.css` (`.hm-btn` / `.hm-chip` utilities), `PortfolioCard.tsx` (div + cover-link
restructure, `priority` + `tags` props), `HomeFeaturedWork.tsx`, `HomeServicesPreview.tsx`,
`HomeTrust.tsx`, `HomeCreativeSystem.tsx`, `StickyCta.tsx`, `SiteFooter.tsx`, `HomeHero.tsx`,
`app/page.tsx`.

Delivered as specced, with **two Hussain-driven deviations recorded in CLAUDE.md:**
- **The button system was re-decided mid-session (2026-08-18).** The 2026-08-17 three-variant
  spec (`primary`/`secondary`/`on-image` + sliding `→`) was rejected on sight — the on-page
  primary/secondary split read as mismatched weights and nothing matched the hero. Replaced by
  **two looks lifted from the hero pills, no arrow**: `ghost` (hero "Book" outline,
  `border border-white/30 text-white`, inverts to white on hover) as the default for every
  non-hero button, and `solid` (hero "See the work" white pill, softens to `bg-neutral-200`)
  for the sticky-bar "Book". Full spec rewritten in CLAUDE.md → "The button system".
- **The hero's two button hovers were improved at Hussain's explicit request** ("See the work"
  → `bg-neutral-200`, "Book" → invert). Hero geometry untouched and still inline (not routed
  through `Button`). Recorded as the one sanctioned hero change.

Build gotcha worth keeping: putting the `border` shorthand inside `.hm-btn` via `@apply
border` silently overrode each variant's `border-white/30` to transparent (the ghost outline
vanished). Border width **and** colour must sit together on the variant, mirroring the hero's
inline `border border-white/30`. Verified live on `/` via computed-style inspection (the
browser-pane screenshot compositor was flaky under scroll this session): all 9 non-hero
buttons resolve to the two intended looks, the ghost outline renders at `white/30`, the sticky
Book is a solid white pill, Featured card 0 emits an image-preload link (LCP), the page has 0
`.premium-panel`/`.surface-3`, and each section opens with a `1px border-border` hairline.
`tsc --noEmit` + `eslint` clean. ServiceCard's own buttons (non-preview, `/services` only) and
the tag chips were left for a later pass — no tag data flows until T1/T2.
