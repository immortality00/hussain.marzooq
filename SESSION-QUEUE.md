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

## Phase 2 — Preloader & core experience

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