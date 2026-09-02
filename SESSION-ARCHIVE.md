# HM Visuals — Session Archive

Completed sessions, moved here from SESSION-QUEUE.md at Gate 3 (the move is part of the
protocol — see the queue's "How to use"). Specs and build-outcome notes are preserved
verbatim: this file is the project's history and the reference for "why is it built that
way."

**Do not load this file by default.** Read it only when a pending session, CLAUDE.md, or
a planning question explicitly references it.

---

## Phase 3 — Content & analytics

### Session C3 — Analytics — `done`

**Original spec:**
Add Plausible Analytics to all public pages.
- Install @vercel/analytics or the Plausible Next.js package (propose which and why).
- Script only on public pages (not admin).
- No cookie banner required for Plausible.
- Verify it does not appear in admin routes.
Read AppShell.tsx and layout.tsx before writing.

**Build outcome (2026-08-30) — rescoped by Hussain to GoatCounter + an in-admin dashboard.**
The Plausible build was completed first, then reverted on Hussain's call: Plausible is paid
SaaS with no pre-launch value, and its external-only dashboard didn't answer his "why is there
nothing in admin?" GoatCounter (free, hosted, cookieless, open JSON API) replaced it, and an
in-admin stats page was added on top of the original one-tag scope.

- **Tracking (public, one tag):** `components/site/Analytics.tsx` (`SiteAnalytics`) renders a
  single `next/script` `https://gc.zgo.at/count.js` with
  `data-goatcounter="https://{NEXT_PUBLIC_GOATCOUNTER_CODE}.goatcounter.com/count"`,
  `async`/`afterInteractive`. Mounted in `AppShell`'s public branch (below the
  `if (isAdmin) return` short-circuit) so it never loads on `/admin/*` — structural, not a
  runtime check. Unset code → returns `null`. `count.js` auto-tracks SPA route changes via the
  History API; cookieless, no banner. No package (no `@vercel/analytics` — Vercel's product,
  and the site is on Netlify; no `next-plausible`).
- **In-admin dashboard (new):** `app/admin/(protected)/analytics/page.tsx` (sidebar → Overview →
  Analytics, added to `AdminSidebarNav`) is an auth-gated server component reading GoatCounter's
  API server-side via `getGoatCounterStats(30)` (`lib/server/analytics.ts`) — total pageviews +
  top pages + referrers, last 30 days, in the admin card language with a horizontal-bar list.
  `/api/v0/stats/{total,hits,toprefs}` with a Bearer token, `next:{revalidate:300}`. **Fail-safe**
  (try/catch → empty; the server-module smoke test imports it, and a network blip must not 500),
  env read lazily. Shows a "not configured" panel when either env var is missing, "No data yet."
  when empty. `/stats/total` is pageviews (not unique visitors), so the headline is pageviews
  only — no fabricated visitor count. Pure `goatCounterPeriod(now, days)` unit-tested
  (`test/analytics.test.ts`).
- **Env:** `NEXT_PUBLIC_GOATCOUNTER_CODE` (public site code) + `GOATCOUNTER_API_TOKEN` (secret,
  server-only, never `NEXT_PUBLIC_` — admin fetches server-side, only numbers reach the client).
  Both added to the L1 deploy checklist.
- **CSP:** `gc.zgo.at` on `script-src`; `https://*.goatcounter.com` on `img-src` (beacon pixel) +
  `connect-src` (sendBeacon fallback). Admin→API reads are server-side, not a CSP surface.
- **Security surface:** outbound only (script host + beacon + server API); no new inbound public
  route; the admin page is auth-gated with no user input; the API token stays server-side.
- Verified locally: tag present on public pages, absent on `/admin`; admin dashboard renders the
  configured empty state (GoatCounter ignores localhost, so no data pre-launch). tsc + eslint
  (0 warnings) + 177 tests green.

---

## Phase 2 — Preloader & core experience

### Session D11 — Web development page — `done`

**Original spec (superseded live by Hussain — kept for history):**
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

**Build outcome (2026-08-29) — rescoped on sight to a dancing-style link list.** Hussain
rejected the `web_projects`-collection plan mid-Gate-1 ("it will be cards .. similar to the
dancing page .. i will add a link to show what i did only for now"), then chose **link-only**
cards and **dropped** the interim capabilities cards. During Gate 2 he added two hard steers:
(1) the earlier build silently dropped his saved bare-domain link — `toProjectUrl` now accepts a
scheme-less domain by assuming https; (2) "i didn't ask for an option to upload a photo .. the
website itself render a photo" — an image-picker per project was built and **reverted**, replaced
by an auto-screenshot. Final shape:

- **No `web_projects` collection, no `/admin/web-projects` route, no CSP change, no sidebar entry.**
  Editing is entirely through the existing `/admin/pages/web-development` + the existing
  page-sections PATCH route.
- **Data:** `WebDevSections` = `{ projects: { heading, urls: string[] }, stickyCta }`
  (`lib/server/page-sections.ts`); old `capabilities: TextCard[]` removed, no migration
  (shallow-merge ignores the stale key; its images cleaned by the section-image diff on next save).
  Admin form `WebDevSectionsForm` (heading + `RepeatingListEditor<string>` + `CtaFields`), wired in
  `SectionsGroup.tsx`, mirrors `DancingSectionsForm`.
- **Public page** `app/web-development/page.tsx` = `PageHeader` → `border-t` Projects section
  (`grid sm:grid-cols-2 lg:grid-cols-3` of `WebProjectCard`) → `StickyCta`; keeps the `isActive`
  redirect. Empty/all-invalid → no Projects section.
- **`WebProjectCard`** = external link-out card (16:10 screenshot + hostname + "Visit site ↗").
  The screenshot is fetched through a same-origin proxy `app/api/web-projects/preview/route.ts`
  (public, rate-limited 60/60s, `toProjectUrl`-validated) that calls **thum.io** server-side and
  streams the bytes back (`Cache-Control max-age=3600, s-maxage=86400`) — so `img-src 'self'`
  covers it, **no CSP edit**, and only `image.thum.io` is ever fetched (no SSRF). The `<img>` URL
  carries `&v=N` to force-refresh cached screenshots. thum.io is a free third-party dependency; the
  unbuilt robust follow-up is to screenshot once → store in Cloudinary.
- **`lib/web-projects.ts`** (`toProjectUrl`, `projectUrlLabel`) unit-tested in
  `test/web-projects.test.ts`. Verified live on Hussain's dev server (real screenshot of
  hussain-marzooq.com rendering in the card); `tsc` + `eslint --max-warnings 0` + 164 tests green.
  See CLAUDE.md → "Web development page (D11, shipped 2026-08-29)".

---

## Phase 2 — People page

### Session D12 — People page — `done`
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

**Build outcome (2026-08-28):** Full CLAUDE.md spec lives under "People page — privacy system
(D12, shipped)". Summary of what shipped and the decisions taken with Hussain:
- **Three visibility states** (Public / Password-protected / Hidden), set by a Visibility control
  replacing the old "Public profile" checkbox. Hussain's Gate-1 calls: private people are **hidden
  from the index** (reachable only by direct URL + password), and removal-approval **removes the
  profile from all public surfaces but keeps content reachable through the password**.
- **Password gate** extracted to `lib/password-gate.ts` (scrypt + HMAC signed `hm_person_<id>`
  cookie), unit-tested (`test/password-gate.test.ts`). Public unlock `POST /api/people/access`,
  rate-limited. The private-gallery gate stays a separate copy (rewriting it would invalidate live
  gallery cookies).
- **Removal flow:** public request (`RemovalRequestButton` → `/api/people/removal-request`) with
  **required email + message**, rejected for already-gated profiles; admin `/admin/removal-requests`
  (rebuilt + relinked in the nav) with **inline password-set on approve**, Dismiss, and a **read-only
  History**. Every request + decision logged in the new **`removal_requests`** collection.
- Follow-up hardening added during review: **token rotation on password change** (invalidates old
  sessions), **linked media hidden on approval and re-published when the profile goes public again**
  (marker-independent, respects other still-gated people), a **media↔gated-person rule** forcing any
  media linked to a hidden/private person private (`resolvePeopleSelection.gatedPersonName`), a
  top-of-form **status banner** in the people editor, a red **total-pending badge** on the Dashboard
  nav link + a "Removal requests" row in Needs-attention.
- **Design fix (in scope by Hussain's request):** `MediaLightbox` now portals to `document.body` at
  `z-[120]` and locks scroll via the new `hooks/useScrollLock.ts` — it was trapped in `AppShell`'s
  `z-10` context so the footer covered it on scroll.
- Verification: `tsc` + `eslint --max-warnings 0` clean, `npm test` green (10 new gate tests + smoke).
  No CSP change. `ensure-indexes.mjs` gained `removal_requests` + `people_profiles.removalRequestedAt`
  indexes (run once on deploy).

---

## Phase 2 — Dancing page

### Session D10 — Dancing page — `done`
Build the dancing page.

Content (as originally queued):
- Page title + description (admin-controlled via Session N4).
- Instagram feed embed (Instagram Basic Display API or oEmbed — propose the approach that works with Next.js App Router).
- Booking CTA.
- Stats (years teaching, students, location).

Navigating into the dancing page uses the site-wide gallery transition (D4, complete) — there
is no per-route dancing transition; the bespoke ones were built, rejected and reverted.

**Build outcome (2026-08-28):**
- **Approach decided with Hussain at Gate 1:** admin-picked Instagram post embeds (not the
  Graph API — Meta killed Basic Display / free oEmbed, and a live feed would need an app
  token + server fetch + rotation). The interim text cards were **dropped**; the page is
  Instagram-centric.
- **Stats were NOT built.** The queue asked for a years/students/location strip, but CLAUDE.md
  bans stat strips; that ban won.
- **Data model:** `DancingSections` → `{ instagram: { heading, urls[] }, stickyCta }`
  (`lib/server/page-sections.ts`), replacing `sections: TextCard[]`. Shallow-merge keeps stored
  docs safe (stale `sections` ignored); no migration. First save from the new form cleans up
  the old card images via the existing replace-diff.
- **Admin:** new `DancingSectionsForm` (heading + "+ Add post" URL list via the generic
  `RepeatingListEditor<string>`, given a new optional `addLabel` prop) wired into
  `SectionsGroup`. Extracted a shared `CtaFields` booking-bar editor now used by `CtaOnlyForm`,
  `CardsCtaForm`, and the dancing form (killed the duplicated CTA block).
- **`lib/instagram.ts`** `toInstagramEmbedUrl()` — the only URL→embed parser: accepts
  `instagram.com/p/…` and `/reel/…` only, rejects lookalike hosts. Unit-tested
  (`test/instagram.test.ts`, 9 cases).
- **Embed rendering — two rejected attempts before the shipped one.** (1) The first build
  tried "media-only, no chrome" by forcing the cross-origin `/embed` iframe into a square box
  with negative offsets + oversized height to clip Instagram's header/footer — it distorted
  every post ("stretched, doesn't look like Instagram"). You cannot reach into a cross-origin
  iframe to isolate the media, and crop offsets differ per aspect ratio. **Do not revive the
  clip hack.** (2) The shipped `components/dancing/InstagramFeed.tsx` renders the **normal**
  embed and auto-sizes each card by listening for Instagram's own `MEASURE` postMessage
  (origin-checked to `https://www.instagram.com`) — no cropping, no fixed height, no embed.js
  script. Invalid URLs dropped; empty list → section renders nothing. Reveal is a
  reduced-motion-safe staggered fade/rise.
- **CSP:** `https://www.instagram.com` added to `frame-src` in `next.config.ts` (the only
  security surface — admin-supplied URLs, no new public route). CLAUDE.md CSP note updated.
- Verified by Hussain in-browser (Atlas unreachable from the sandbox); tsc + eslint (0/0) +
  140 tests green.

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

---

### Session D2c — About page rebuild — `done`
About had never had a rebuild session (flagged twice in N5) — it was still the interim
page (header + generic 4-card glass grid + booking bar).

**Skills:** `redesign-existing-projects` for the Gate 1 audit, then the rebuild grounded in
CLAUDE.md's measured house design language (the D2b section system + card census).

**Original spec (constraints):** `PageHeader` (no `eyebrow`), `.section-shell`, no gradient
fallbacks, `AnimatedText` on the h1, empty means empty. Presentation-only — no admin or
data-model change.

**Build outcome (2026-08-18):**
- **Two files rebuilt, one new.** `app/about/page.tsx` moved to the D2b section system:
  `<main>` (no padding) → intro section (`section-shell pt-12 sm:pt-16`, `PageHeader` on
  `headerTitle`/`headerDescription`, `max-w-3xl`, **`lg:text-6xl` removed** — the D13-flagged
  override) → disciplines section opening with `border-t border-border` and `pb-28 sm:pb-32`
  for the sticky bar. The grid mirrors `HomeFeaturedWork` exactly (`grid gap-5 lg:grid-cols-2`,
  first tile `lg:col-span-2`).
- **New `components/about/AboutDisciplineCard.tsx`** — full-bleed photo + scrim + bottom-
  overlaid title/text in the house card language (`rounded-[2.25rem]`, `text-3xl
  tracking-[-0.045em]`, `text-white/70`); flat `bg-muted` + foreground text when imageless
  (no gradient). Renders a `next/link` root when given `href`, else an `<article>`.
- **Two changes requested by Hussain mid-session (2026-08-18), both approved via
  AskUserQuestion:**
  1. **Copy rewritten as Hussain Marzooq, first person** ("it's not H visual brand, it's
     hussain marzooq as a photographer, videographer, nft artist and dancer") — updated the
     code defaults in `page-seo.ts` (`about.headerTitle`/`headerDescription`) and
     `page-sections.ts` (`about.disciplines` retitled to **Photography / Videography / NFT /
     Dancing**, replacing the old Film / Digital craft / Movement set). No fabricated specifics.
  2. **Tiles are clickable, auto-linked by position** — `DISCIPLINE_HREFS` in `about/page.tsx`
     maps index 0–3 → `/photography`, `/videography`, `/nft`, `/dancing`. Hussain chose
     auto-link over a per-card admin field ("four fixed disciplines, i don't think i will add
     any more"). **Keep the four cards in that order in admin** — reordering reshuffles links.
- **Verification:** `tsc --noEmit` + `eslint --max-warnings 0` clean. In-browser render check
  could not run in the Code sandbox (no network route to MongoDB Atlas — TLS handshake refused,
  unrelated to the change); Hussain verified `/about` on his own machine ("done .. all working").
- **Doc sync:** CLAUDE.md gained an "About page — rebuilt (D2c)" section, the "interim pages"
  line dropped About, and the D13 `lg:text-6xl` note (CLAUDE.md + queue §D13) was cleared.

---

## Phase 3 — Content & analytics

### Session C4 — Media locations: validated city + stored coordinates — `done`
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

**Build outcome (2026-08-18):** All five scope items shipped, plus a date-format addition
Hussain requested during Gate 2. Both location surfaces now use the shared `LocationSearch`
against `/api/testimonials/location-search`. `Appearance` gained `locationId`/`lat`/`lon`,
carried by `sanitizeAppearances`; the four duplicate declarations collapsed to one canonical
type in `_lib/media.ts` (`media-serializers.ts` dropped `PublicAppearance`; the two client
type files and `public-nfts.ts` import it — the last also replacing its weak `isAppearance`).
The media doc's `location` field now stores `location`/`locationId`/`locationLat`/`locationLon`/
`locationCountryCode` via a shared `parseMediaLocation()` used by both `media/create` and
`media/[id]` PATCH, returned by GET for rehydration. Coordinates are **sanitised-and-stored,
not re-geocoded** — the media form is admin-gated (unlike the public testimonials form), so no
new trust boundary and no per-save DB resolve across up to 50 appearances; lat/lon range-checked
via new `asFiniteLatitude`/`asFiniteLongitude` in `_lib/common.ts`. Unresolved exhibited
appearances show an inline amber warning. **Date fields** became month+year pickers
(`<input type="month">`, stored `YYYY-MM`), rendered "Month YYYY" by a new `formatMonthYear`
in `components/media/utils.ts` (used by `formatDates`; `NftModal`'s forked inline date join was
routed through `formatDates` too). New unit test `test/api/sanitize-appearances.test.ts` (6
cases) covers coord validation/carry-through. **No backfill written.** `tsc --noEmit` + `eslint`
(0 warnings) + `npm test` (92 pass) all clean; dev server compiled with no errors. Interactive
form check done by Hussain (admin-gated). The globe itself is D6 — Hussain noted he wants to see
it live, which is exactly D6's job now that C4 unblocked it.

---

### Session D6 — Exhibition globe — `done`
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
list. Hussain rejected both, 2026-08-17.

Data — none of this exists yet, write it:
- `getExhibitionCities()` in `lib/server/public-media.ts`. **There is no `getAllMedia()`** —
  every existing fetcher is category-scoped and capped at 60, so writing this on top of one of
  them will silently under-report. Query `media` directly: public +
  `appearances.kind === "exhibited"`, and aggregate.
- Group by the `locationId` C4 stores (never by the free-text label).
- Cache with the page's existing `revalidate = 300`. No per-request geocoding.

Globe: `react-globe.gl` via `next/dynamic({ ssr:false })` behind an `IntersectionObserver`.
Texture from `/public/globe/`, same-origin, no CSP edit, never a CDN. Markers: white dot +
hairline ring whose radius encodes `workCount`. Auto-rotate, drag, resume 2.5s. Two-way hover
list↔marker. Click a city → that city's exhibited works. Palette: OKLCH tokens only, no accent.

**Build outcome (shipped 2026-08-18):** `getExhibitionCities()` written as a direct, uncapped
`media` query grouped by `locationId` in JS (grouping is inseparable from `toPublicMediaItem`
serialization), returning **full `works: PublicMediaItem[]` per city** rather than the spec's
`{workCount, mediaIds}` — the click flow needs the items client-side and there is no
by-location endpoint. Components: `components/home/HomeExhibitionGlobe.tsx` (client wrapper,
IntersectionObserver gate, returns null when no cities) + `components/home/exhibition/`
(`ExhibitionCityIndex`, `ExhibitionGlobe`, `ExhibitionCityModal`). Clicking a city opens a
**popup grid** of that location's works (reusing `MediaCardGrid`) → clicking a card opens the
existing `MediaLightbox` — `MediaLightbox` left untouched. Homepage passes `cities` from
`app/page.tsx`'s `Promise.all`. **Two deliberate spec overrides at Hussain's request:**
(1) **arcs** from Dubai to each city (spec said "no arcs"); (2) **`earth-day.jpg`** texture
(spec said `earth-dark.jpg` — too dark), with even `AmbientLight` so no hemisphere reads dark.
Globe opens facing **Dubai** (`onGlobeReady` `pointOfView`) and marks it with a distinct
"Home base" beacon (CSS radar-ping `@keyframes hm-globe-ping` in `globals.css` + home glyph),
the origin of all arcs. City names render as labels on the globe. Height cap 640, altitude 2.0
("make it bigger"). No stat line under the list (spec self-contradicted; CLAUDE.md's ban won).
**Also fixed in-session (Hussain-reported, same data path):** the exhibitions form silently
lost entries — `save()` never validated appearances and `sanitizeAppearances` dropped any
nameless entry, so a location-only exhibition reported "saved" but vanished. Added shared
`appearanceError`/`findFirstAppearanceError` (`app/admin/(protected)/media/lib/utils.ts`) used
by both the form (`MediaAppearancesSection.tsx` — required-name label, live red field, globe
hint) and the save-gate (`useMediaEditorController.ts` — blocks + names the entry). New test
`test/admin/appearance-validation.test.ts` (5 cases). `tsc` + `eslint` (0 warnings) + `npm test`
(97 pass) clean. Globe's live WebGL could not be auto-verified (the preview pane runs as a
hidden tab, which freezes rAF/IO/RO); Hussain verified the globe and form visually. Comment
cleanup: all explanatory code comments were stripped at Hussain's insistence — new standing rule
recorded in CLAUDE.md → Code quality rules.

---

## Phase S2 — Defects from the 2026-08-17 full-repo audit

### Session S10 — Two security fixes — `done`
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

**Outcome (2026-08-18).** Both fixes shipped. Fix 1: the shared `getClientAddress`
(`app/api/_lib/public-form-security.ts`) was widened to accept a `Request` **or** any
headers object (`{ get(name): string | null }`) via `"get" in source` narrowing, so the
`next/headers` server action and the four `Request`-based route callers share one helper.
`app/admin/page.tsx` dropped its two local helpers (`getClientAddress`, `getClientKey`) and
now keys the limiter on IP alone (`getClientAddress(headerList)`) — a spoofed User-Agent no
longer resets the lockout. Fix 2: new `lib/server/escape-html.ts` (`escapeHtml`, escapes
`& < > " '`, ampersand first); `lib/server/email.ts` applies it to every interpolated user
field in both notification emails including the `mailto:` value. `stars`/`rating` stay raw
(internally computed); subjects stay raw (mail headers, not HTML). New `test/escape-html.test.ts`
(5 cases). `tsc --noEmit` + `eslint --max-warnings 0` + `npm test` (103 pass) clean. Not
browser-verifiable (email send + IP keying; sandbox can't reach Atlas), so no dev-server check.
No CLAUDE.md impact. Out-of-scope note left un-fixed: the config-error copy at
`app/admin/page.tsx` still mentions the deleted `ADMIN_PASSWORD` fallback (doc drift, not a
security bug).

### Session S8 — Two resource leaks — `done`
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

**Build outcome (2026-08-19):** Fix 1 — `AppShell.tsx` now captures the rAF id into `rafId`
and the cleanup calls `cancelAnimationFrame(rafId)` before `lenis.destroy()`. Fix 2 —
`WorkOverlay.tsx` `onUp` renamed to `end()`, registered for **both** `pointerup` and
`pointercancel`, and it removes all three document listeners; this also restores the missing
`startAutoRotate()` on a cancelled touch drag. **`setPointerCapture` deliberately NOT
adopted** (Hussain's call at Gate 1): the `onPointerDown` comment documents that document
listeners were chosen specifically so pointer capture never steals click-through on the
discipline `<Link>` cards; adding `pointercancel` fixes the actual leak with zero regression
risk. No pure helper extracted → no test. `tsc --noEmit` + `eslint` clean (0/0). Leaks are
not browser-observable and the sandbox can't reach Atlas, so verified on Hussain's machine
(drag/release-outside-window/touch-cancel resumes auto-rotate; cards still navigate). CLAUDE.md
"Known defects" table: the two §S8 rows removed in the same commit. No other CLAUDE.md impact.

### Session S9 — Revalidation coverage — `done`
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

**Build outcome (2026-08-19):** Gate-1 audit found the bug was bigger than the one path: the
hardcoded `AFFECTED_PATHS` also missed the *global* `SiteFooter` (root-layout, async, filters
discipline links by `isActive`), so a toggle left a stale footer on ~9 of ~15 routes, plus the
toggled discipline page's own redirect on `/photography`, `/videography`, `/nft`,
`/web-development`. **Fix (Hussain picked the layout-revalidate option over a corrected list):**
`app/api/admin/page-settings/[slug]/route.ts` now revalidates with a single
`revalidatePath("/", "layout")` — cascades to every route sharing the root layout, covering the
footer everywhere, each toggled page's redirect, and the homepage sections. No path list to
drift (better than the ticket's "derive from a registry" idea — there is no list to derive). The
Work-overlay nav is `force-dynamic` + client-fetched, so it needed nothing. Additionally, the
four directive-less public pages (`about`, `blog`, `dancing`, `web-development`) now carry
`export const revalidate = 300`, matching every other dynamic public route (time-based self-heal
on top of on-demand). **Add-on at Hussain's request in the same session:**
`components/site/WorkOverlay.tsx` cylinder geometry was scaling radius + angular spacing with the
live card count, so deactivating a discipline shrank the cylinder and made the remaining cards
appear bigger / wider-spaced ("the space becomes bigger"). Fixed to a constant 5-slot geometry
(`slots = Math.max(count, 5)` for both `getCylinderRadius` and the per-card angle), so every card
keeps identical size/radius/spacing regardless of count and a deactivated discipline just leaves
an empty slot in the ring. `tsc` + `eslint` clean (0/0), 115 tests pass. Not browser-verifiable
in the sandbox (no Atlas); Hussain confirmed the toggle propagation + overlay flexibility on his
machine. CLAUDE.md: §S9 defect row removed, revalidation rule recorded in the CMS section.

## Phase T — Tag taxonomy & discipline subpages

### Session T1 — Tag taxonomy: `media_tags` + `/admin/tags` — `done`

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

**Build outcome (2026-08-19).** Shipped as specced, with two additions Hussain approved at
Gate 1: (a) the shared sortable primitive was extracted **and** all three existing hand-rolled
dnd-kit copies migrated onto it (not just the new tags page); (b) no `ensureSystemCategories`
equivalent — `media_tags` has no system row (unlike service categories' "others").
- **New:** `lib/server/media-tags.ts` (slug/discipline/reserved validation, `TAG_DISCIPLINES`);
  `app/api/media-tags/route.ts` (public GET rate-limited & active-only; `?scope=admin` gated
  → all + live counts; POST) + `[id]/route.ts` (PATCH with arrayFilters rename cascade; DELETE
  guard `TAG_IN_USE` + `?detach=1` `$pull`); `/admin/tags/*` (page + client + lib + components);
  `components/admin/sortable/SortableList.tsx` (`SortableList` + `useSortableRow`);
  `app/admin/(protected)/media/components/TagMultiSelect.tsx`; `test/media-tags.test.ts`.
- **Changed:** media form (`useBaseMediaEditorState` holds `selectedTagSlugs`, `toList` deleted;
  `MediaDetailsSection` → multi-select); nav (`Tags` item); `ensure-indexes.mjs` (+3 media_tags
  indexes); service-categories/services/page-sections migrated to the primitive (their per-page
  `mounted` hydration guards + `CategoryRowStatic`/`ServiceStaticRow` deleted).
- **Sortable primitive has no mount gate** — the React-Compiler lint (`react-hooks/set-state-in-effect`,
  `react-hooks/refs`) rejected both the effect and a render-prop `handle`; rows call the
  `useSortableRow(id)` hook directly and dnd-kit's `useId` is hydration-safe (as the pre-existing
  gate-less `RepeatingListEditor` already proved).
- **Read-site behaviour:** filtering stays correct end-to-end (slug===slug, exact `?tag=`);
  public chips (`MediaTagChips`, NFT) render the slug as label text — slug→label polish for
  public surfaces is deferred to T2.
- `tsc --noEmit` + `eslint --max-warnings 0` + `npm test` (116 pass, +10 new) clean. Admin
  pages need Atlas (sandbox can't reach it) — Hussain verified rendering, reorder across all
  four surfaces, tag multi-select + inline create, and rename cascade on his machine.
- **CLAUDE.md updated same commit:** rewrote the "Tag taxonomy" section (T1 shipped), added
  `SortableList` to reusable components, marked the §D9b dnd-kit-reimplementation note resolved.

---

### Session T2 — `/photography/[tag]` and `/videography/[tag]` — `done`
**Blocked by T1.**

**Precedent to follow: `/people/[slug]`** (`app/people/[slug]/page.tsx`) — on-demand render,
`export const revalidate = 300`, `notFound()` when the record is missing or not public,
`generateMetadata` reading a `page_seo` slug whose defaults carry a `{name}` token that is
`replaceAll`'d at request time. Mirror all of it.

**Routes:** `app/photography/[tag]/page.tsx`, `app/videography/[tag]/page.tsx`.
No collision under `/photography`. Under `/videography`, the static `videos/` segment wins
over the dynamic one — T1 reserves that slug.

**Data:** `getMediaByTag({ category, mediaMode, tagSlug, limit })` in
`lib/server/public-media.ts`, reusing `buildPublicMediaQuery`. The existing `?tag=` support in
`/api/media/list-public` powers "Load more" — no second endpoint.

**Original spec (see build outcome for the deviations Hussain directed mid-session):**
`notFound()` when the tag is missing/inactive/does-not-list-the-discipline; header via
`PageHeader` from a `{tag}`-token `page_seo` slug; body = the parent's viewer with the tag
pre-applied; back link + sibling chips; empty → `PortfolioFallbackPanel`; `StickyCta` from the
parent's `page_sections`; a minimum-count threshold (default 3) gating chips; revalidation
derived from the saved doc's tags; homepage link-through via `PortfolioCard` tag chips.

**Build outcome (shipped 2026-08-19):**
- Routes + `lib/server/tag-pages.ts` (`getTagPage`/`getTagMeta`/`getDisciplineTagNav`),
  `lib/server/public-media-tags.ts` (`getPublicMediaTag`/`getDisciplineTags`),
  `getMediaByTag` in `public-media.ts`, `page_seo` slugs `photography-tag`/`videography-tag`
  (`{tag}` token), two `seoDetailPage` rows in `/admin/pages`, and
  `app/api/_lib/revalidate.ts` (`revalidateMediaSurfaces`, paths derived from doc tags).
- **`StickyCta` reuses the parent's `page_sections`** — no new `page_sections` slug (the
  spec's "add to `ALL_PAGE_SECTIONS_SLUGS`" was dropped as self-contradictory with "no new
  CTA copy").
- **Hussain-directed deviations from the spec:**
  1. **No discipline gate.** The per-tag `disciplines[]` field was removed entirely (model +
     API + `/admin/tags` picker + `sanitizeDisciplines`). A tag earns a subpage/chip purely
     from **media presence**; the discipline checkboxes were friction that 404'd valid tags.
  2. **No minimum-count threshold** — the default-3 rule was cut; any tag with ≥1 public item
     shows.
  3. **Empty tag ≠ 404.** A known tag with zero items renders the full page with the viewer's
     "No matches." panel, keeping header/nav/search/CTA.
  4. **Tag nav = `components/media/TagChipRow.tsx`** (new shared client component): compact,
     boxed, sideways-scrolling, most-used-first, that **replaces** the in-viewer filter chips
     on the parent Photography/Videography pages and appears on subpages (active highlighted).
     Lives inline in the photography toolbar (mode-switcher · tag box · search, `sm:ml-12`
     gap) and shares the row with search on videography. Carries `data-lenis-prevent` +
     `touch-action: pan-x` + `overscroll-x-contain` + a vertical-wheel→horizontal handler so
     it scrolls under Lenis on wheel/trackpad/touch, desktop and mobile.
  5. **Clickable tags in the `MediaLightbox` detail panel** → each tag with a subpage links to
     it (real label), threaded via a `tagLinks` map through the viewers. `/people` and other
     `MediaGrid` uses keep their normal filter chips (no `navChips`).
- Viewers gained `lockedTag` (scopes search to the tag, hides filter chips) + `navChips` +
  `tagLinks`; `useMediaSearch` gained `lockedTag`.
- Verified live on Hussain's dev server (desktop + mobile). `tsc` + `eslint --max-warnings 0`
  + `npm test` (115 pass; 3 `sanitizeDisciplines` tests removed with the helper) clean.
- **CLAUDE.md updated same commit:** rewrote the "Tag taxonomy & discipline subpages" section
  (T1 + T2 shipped, disciplines field removed, subpage/nav/revalidation facts), added
  `TagChipRow` + the `useMediaSearch` `lockedTag` note to reusable components.

---

## Phase S2 — Defects from the 2026-08-17 full-repo audit

### Session S11 — Admin: stop losing work — `done` (2026-08-19)
1. **No unsaved-work guard existed.** `/admin/pages` held drafts for all 13 rows (~170
   fields) in React state; the sidebar is plain `<Link>`s, so one click discarded every
   unsaved row silently. Added guard covering both browser unload and in-app navigation.
2. **Partial saves reported nothing useful.** `usePagesAdmin.save()` fired up to three
   concurrent PATCHes in one `Promise.all`; each committed its own slice but `discard(row)`
   only ran if all resolved, so a partial failure left saved parts still reading "Unsaved"
   and the banner said only "Failed to save."

**Outcome:**
- New shared hook `hooks/useUnsavedChangesGuard.ts(hasUnsavedChanges)` — `beforeunload`
  prompt + a document capture-phase click interceptor that `confirm()`s before internal-link
  navigation (App-Router `<Link>` renders `<a>`, so one document listener catches the sidebar,
  "View site", "Logout", any in-app nav). Skips modifier/new-tab/external/hash/same-path clicks.
  Wired into `/admin/pages` via a new `admin.hasUnsavedChanges` (true when any of the three
  drafts maps is non-empty). Scope: `/admin/pages` only (Hussain's call); the hook is reusable
  for the lower-severity same-shape gaps later.
- `usePagesAdmin.save()` rewritten to `Promise.allSettled` over up to three labelled parts
  (Visibility & image / Search & social / Sections). **Each part clears its own draft on
  success and keeps it on failure**, so `isDirty(row)` is honest and a re-save re-sends only
  the failed part. Feedback via `useAdminAction`'s exposed `setFeedback` (not `run()`, which is
  all-or-nothing): all-ok names what saved (`"Home saved — …"`), partial names both
  (`"Home: saved Search & social; Sections failed. Try again."`), all-fail (`"Home not
  saved — …"`).
- **Feedback-clarity fixes Hussain requested mid-session ("no wrong/unclear feedback
  anywhere"):** surveyed every admin surface — inquiries, tags, private galleries, media
  editor save, testimonials, media list already report the server's specific error. The two
  genuine gaps fixed: (a) `MediaDetailsSection` `loadPeople()` `catch {}` → `peopleError`
  state on any non-ok/throw + inline note; (b) service-categories `CategoryRow` name/slug
  uncontrolled inputs reset to the last-saved value when `onEdit` returns failure (now
  `Promise<boolean>`), so the field no longer contradicts the banner. Left for D9b: the
  feedback-*architecture* consolidation (many hand-rolled wrappers → one hook).
- `tsc` + `eslint --max-warnings 0` + `npm test` (115 pass) clean. CLAUDE.md updated same
  commit: removed the two S11 defect rows, expanded the `useAdminAction` reusable-components
  entry with the accuracy/multi-part rule, added the `useUnsavedChangesGuard` entry.

---

### Session N9 — Stop public chrome rendering on admin — `done` (2026-08-19)
`app/layout.tsx` mounted `<CustomCursor />` and `<SiteFooter />` as siblings of `<AppShell>`,
outside its `isAdmin` gate, so the custom cursor's `cursor-none` and the full public marketing
footer rendered on every `/admin/*` page including login.

**Outcome:** consolidated both into `AppShell` (restores CLAUDE.md's "all global elements live
in AppShell" invariant). `SiteFooter` (async Server Component) is passed as the `footer` prop
from `layout.tsx` — `<AppShell footer={<SiteFooter />}>` — a server component rendered by a
client parent via props; `CustomCursor` is imported and rendered directly inside AppShell's
public branch (both wrapped in `relative z-10` to sit above the z-2 grain). Admin branch stays
`return <>{children}</>` — no cursor, no footer. `tsc` + `eslint` + `npm test` clean. CLAUDE.md
updated same commit: rewrote the AppShell "Correction" paragraph, removed the defect row.

---

## Phase 4 — People & launch prep

### Session L1 — Launch prep checklist — `done` (2026-08-20)
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

**Outcome (2026-08-20).** Deployment status re-confirmed at Gate 1: **still NOT DEPLOYED** —
no Netlify env, no deployed build; hussain-marzooq.com serves the old landing page (unchanged
from S1). So items 1–3 and the deployed-build half of item 2 stay a **first-deploy checklist**
(not doable from a session) and were recorded as such in CLAUDE.md → "Domain & deployment
status". The code/doc half of L1 shipped:
- **Item 2 (code):** verified the plaintext `ADMIN_PASSWORD` fallback is gone —
  `verifyAdminPassword` reads only `ADMIN_PASSWORD_HASH` (`lib/auth/admin.ts:40,51`). Fixed
  the one stale reference left behind: `app/admin/page.tsx:124` config-error copy said set
  "`ADMIN_PASSWORD_HASH` **or** `ADMIN_PASSWORD`" — now names only `ADMIN_PASSWORD_HASH` +
  `ADMIN_COOKIE_SECRET`.
- **Item 4:** confirmed intact, no change — `next.config.ts:80-87` sets `Cache-Control:
  no-store, max-age=0` + `X-Robots-Tag: noindex, nofollow` on `/admin/:path*`.
- **Item 5:** `README.md` fully rewritten — HM Visuals description, real stack (Next 16 /
  React 19 / TS / Tailwind 4 / MongoDB / Cloudinary / Resend / Three / GSAP / Lenis /
  react-globe.gl), the Cloudinary-loader note, dev/test/lint commands, the "never `next
  build` to verify" rule, and a Netlify deployment section. No Vercel.
- **Item 6:** CLAUDE.md → "Domain & deployment status" reworded to state NOT DEPLOYED plainly
  (the earlier unqualified "Live on Netlify" wording is deleted) with the first-deploy
  checklist inlined.
- `tsc` + `eslint --max-warnings 0` + `npm test` (120 pass) clean. No security surface added
  (docs + one server-rendered error string; no new trust boundary, no secret in client code,
  no new input).

---

### Session D5 — Cursor enhancements — `done` (2026-08-20)
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

**Build outcome (2026-08-20):** All five effects shipped in `components/site/CustomCursor.tsx`,
rewritten as one rAF loop with no React re-renders (unchanged pattern). Each of the dot/ring/2
ghosts is an outer positioned div (JS `translate`) + inner visual div (centering + effects),
fixing a latent miscentring where the old inline `translate` silently overrode the Tailwind
`-translate-1/2`.
- **Spring overshoot** — the ring's old `lerp 0.12` replaced by an underdamped spring integrator
  (`stepSpring`, `SPRING_K=0.2`, `SPRING_DAMP=0.62`); dot keeps its tight `lerp 0.35`.
- **Velocity stretch** — `stretchFor(speedSm)` maps smoothed speed → `scale(sx,sy)` (up to
  1.35 / 0.78), applied with `rotate(atan2)` on the ring inner; circle at rest.
- **Ghost trail** — 2 extra rings trailing via lerp, opacity gated by smoothed speed
  (`GHOST_MIN=6`/`GHOST_MAX=34` → 0.8 / 0.4 ceilings).
- **Zone-reactive size** — one selector split into COLLAPSE (`button, .hm-btn, .hm-chip,
  [role='button'], input, textarea, select, label` → 0.5×) checked first, then EXPAND
  (`img, [data-cursor-expand], figure` → 1.6×); eased toward target each frame.
  `PortfolioCard` root got `data-cursor-expand` so cards read as an expand zone (the cover
  `<a>` over the image otherwise reads neutral).
- **mix-blend-difference** — dot + ring go solid white with `mix-blend-mode: difference` in
  `globals.css` (`.cursor-dot`, `.cursor-ring-inner`); the `dark:` colour variants dropped.
- **Reduced-motion** — effect early-returns under `prefers-reduced-motion: reduce`, leaving
  the native cursor (elements stay `opacity-0`, never revealed). Repo's second reduced-motion
  handling after D4.
- Pure helpers `stretchFor` / `stepSpring` exported + unit-tested (`test/custom-cursor.test.ts`,
  6 tests incl. overshoot-and-settle). `tsc` + `eslint --max-warnings 0` + tests clean.
- **Incidental:** removed the ring's `transition-[width,height]` (sizing now via `transform:
  scale`), which resolved the D13 "animate transform not width/height" finding — noted resolved
  in that D13 list. No CLAUDE.md rule/architecture change; no security surface (no auth/API/
  cookies/env/input).
- **Prototype-skill deviation:** shipped tuned named constants at the top of the file for live
  tuning instead of a baked-in 3-variant switcher (a switcher in a global cursor is awkward);
  Hussain confirmed the feel in-browser.

---

### Session D7 — NFT page redesign — `done` (2026-08-21)
Rebuild NftCard.tsx and NftCollection.tsx for collector-grade presentation.

- Dark card, full bleed image.
- Hover: card flips 180° (CSS 3D perspective) revealing back face with price, edition count, status, marketplace link, inquiry link.
- Status badge: available = white pulse animation, sold = diagonal stamp.
- The transition INTO the NFT page uses the glitch/fragment effect from Session D4.
- Filter bar redesign: horizontal tabs, no search box unless expanded.

Read: components/nft/NftCard.tsx, NftCollection.tsx, NftModal.tsx, lib.ts, app/nft/page.tsx. Propose card flip implementation. Wait for approval.

**Build outcome (2026-08-21):** Card rebuilt as a two-face flip in `components/nft/NftCard.tsx`.
Front is the full-bleed image/video with a legibility scrim, status badge top-left, and a
bottom block carrying title + edition label + a **Price / edition-count row** (`getPriceText`
left, `editionSubline` right). Back is a dark spec sheet (`bg-neutral-950`, white-on-dark like
the hero pills — theme-independent, not tokens, matching the dark-first button rationale) with
Price, Edition and **Buy** (`buttonClasses("solid")`) / **Inquire** (`buttonClasses("ghost")`).
Price + edition count are visible on **both** faces (Hussain's request during Gate 2).
- **Flip mechanics** live in `app/globals.css` (`.hm-nft-card` perspective / `.hm-nft-flip`
  preserve-3d / `.hm-nft-face(--back)` backface-hidden), `rotateY(180deg)` on hover at 520ms
  repo easing `cubic-bezier(0.2,0.7,0.2,1)`. Flip is gated `@media (hover: hover)` so touch
  never sticks flipped; back-face links are `aria-hidden` + `tabIndex={-1}` (pointer sugar —
  the modal is the accessible action path). Whole-card click/Enter/Space still opens `NftModal`
  (unchanged); the `id="nft-{id}"` deep-link anchor is preserved.
- **Status achromatic (Hussain's Gate-1 call):** the old rose/emerald/amber in `lib.ts`
  `statusClasses` is gone — now neutral token-based (used by the modal pill). Available = white
  **pulse** (`hm-nft-pulse` keyframe, a scaling `::after` halo on a white dot); sold = a rotated
  outlined **SOLD stamp** over the art; coming-soon = neutral pill. Added `statusLabel()` helper;
  `NftModal` pill now renders it. This applies the achromatic-palette mandate; it does not
  reverse a decision.
- **Filter bar** (`NftFilters.tsx`) rebuilt: horizontal `.hm-chip` status tabs (active inverts
  to `bg-foreground text-background`) + a search chip that expands the reused `SearchInput`
  (autofocused, X clears+closes). Search-open state moved into `NftFilters` (fewer props);
  `NftCollection.tsx` unchanged.
- **Reduced-motion** disables flip + pulse + image scale; cards stay on the front and the modal
  still gives full detail + actions. All Cloudinary/media paths unchanged.
- The **D4 glitch transition into** the page was left to its own deferred D4 prototype session
  (out of scope, per the queue). No CLAUDE.md rule/architecture change; **no security surface**
  (no auth/API/cookies/env/input). `tsc` + `eslint --max-warnings 0` + 126 tests clean.

---

### Session D4 — Page transition system — `done` (complete 2026-08-27)

**Engine + homepage move shipped 2026-08-20** (see original spec below). The **six bespoke
per-route transitions were then built (2026-08-27), rejected by Hussain on sight, and fully
reverted** — each sliced a single card image, which is exactly the approach he had already
rejected for the homepage move. Replaced with his final direction: **one gallery contact-sheet
transition on every internal navigation, site-wide.**

**Final architecture (this is the live state):**
- `TransitionContext.tsx` no longer gates on `pathname === "/"`. It installs a **document
  capture-phase click interceptor** that routes every same-origin internal `<a>` click through
  `navigate()` (skips modifier/middle clicks, `target="_blank"`, `download`, external `rel`,
  `/admin/*`, same-path, `data-no-transition`). `PortfolioCard` reverted to a plain card (no
  own click handler).
- **Image source is one consistent server pool, not the current page's DOM.**
  `getTransitionImages()` (`lib/server/public-media.ts`, `unstable_cache` 300s, **fail-safe →
  `[]`** so a failed query can't break the root layout) → 24 recent public photos sized via the
  Cloudinary loader → `layout.tsx` → `AppShell` → `TransitionProvider images`. `collectImagePool`
  survives only as a fallback. This fixed the reported bugs: sparse pages (testimonials) showed a
  same-image grid, image-less pages showed no animation.
- `ContactSheetTransition.tsx` + `contactSheet.ts` unchanged (8×5 grid, hold-until-commit).
- `tsc` + `eslint --max-warnings 0` + tests clean. CLAUDE.md "Page transitions" rewritten in the
  same commit. No security surface. **Do not revive per-route transitions — there is no
  registry/variant system by design.**

--- Original D4 spec (verbatim) ---

### Session D4 — Page transition system (engine + homepage shipped 2026-08-20)

**Shipped in D4 (2026-08-20), with Hussain's explicit approval to reduce scope:** the
reusable transition **engine** (`components/transitions/`: `TransitionProvider` +
`usePageTransition`, `ContactSheetTransition`, pure unit-tested `contactSheet.ts`) and the
**homepage transition** — a contact-sheet/**gallery** move: an 8×5 grid whose cells are the
real photos on the page (collected from `main img`, shuffled), staggering in, holding until
the destination route commits (no origin-page flash), then staggering out. Wired via
`PortfolioCard`'s cover link; homepage-only; reduced-motion fallback. Also fixed the showreel
here (CSP `media-src` + YouTube/Vimeo `frame-src`).

Per-route transitions (were deferred, then built + rejected + reverted 2026-08-27):
- **→ Photography:** Hero image expands from small to full viewport, 3D cylinder assembles.
- **→ Videography:** Images scatter as ice shards (Three.js), film strip assembles from right.
- **→ NFT:** Images fragment/glitch, NFT grid assembles.
- **→ Dancing:** Images distort with wave physics (GSAP elastic), dancing page fades in.
- **→ About:** Single portrait expands full-screen, about content fades over it.
- **→ Web Development:** Brief terminal-style effect, page assembles.
- **Homepage → any: the contact-sheet move.** SHIPPED 2026-08-20 — gallery of the page's real
  photos, holds until the destination commits. Now generalised site-wide (see final architecture).

---

### Session D8 — Magnetic button effect — `done` (2026-08-27)
**Spec (as queued):** Add magnetic hover to all primary CTA buttons sitewide. On cursor
proximity (within 60px): button translates toward cursor (max 12px x, 8px y). On leave: spring
back. Implementation: custom hook `useMagneticHover`, applied via `data-magnetic` attribute.
Targets: all primary CTA buttons, StickyCta.tsx, nav Book button. Skills: `find-animation-
opportunities` to confirm magnetic belongs on *every* CTA vs only highest-intent.

**Outcome:**
- **`hooks/useMagneticHover.ts` (new)** — returns a `ref`; window-mousemove proximity (60px
  around the rect), pull clamped to max 12px x / 8px y, self-terminating spring rAF (stops at
  rest — no runaway loop, S8 lesson). Drives the **independent CSS `translate` property** so it
  composes with `.hm-btn:active { transform: scale(.975) }` — press feedback survives. Skips
  entirely under reduced-motion and non-`(pointer: fine)` (touch). Exported pure
  `magneticOffset()` unit-tested in `test/magnetic-hover.test.ts` (4 cases).
- **`components/shared/Button.tsx`** — now forwards optional `ref` (React 19 ref-as-prop, stays
  server-compatible), auto-adds `data-magnetic` when a ref is attached. Ref typed as the
  `HTMLAnchorElement & HTMLButtonElement` intersection so both `<Link>` and `<button>` branches
  accept it; the `StickyCta` caller matches that generic.
- **Scope decided against the literal spec (Hussain approved):** magnetic applied only to the
  **two persistent high-intent CTAs — nav "Book" (desktop) + `StickyCta` Book** — not sitewide.
  Excluded: hero (fixed), HomeCreativeSystem discipline row + NftCard (multiple adjacent),
  PortfolioCard CTA (pointer-events-off span in an animating card), mobile drawer Book (touch),
  homepage section CTAs (lower intent). Architecturally clean too: only Nav and StickyCta are
  already client components.
- **Follow-up in the same session (Hussain):** the homepage sticky CTA was covering the hero and
  "just popped up." Added `revealOnScroll` to `StickyCta` — the homepage passes it; the bar stays
  parked off-screen (`translate-y-[calc(100%+1.5rem)]`, opacity 0, `pointer-events:none`) while
  the hero is in view and **slides up** once `window.scrollY > 40`, re-hiding at the top. Every
  other page keeps the default always-visible behavior; the modal-hide still hard-unmounts.
- **Slide bug found + fixed (Hussain reported it still popped):** the transition was written
  `transition-[transform,opacity]`, but **Tailwind v4 `translate-y-*` animates the independent
  `translate` CSS property, not `transform`** — so only opacity faded and the position jumped
  (pop). Corrected to `transition-[translate,opacity]` + `will-change-[translate]`. Verified a
  hidden→shown flip now spins up two running `CSSTransition`s (opacity **and** translate) where
  before there was only opacity. Recorded as a "do not regress" gotcha in CLAUDE.md.
- **Process note:** first pass over-trusted a DOM reading taken while the preview pane was
  backgrounded (`document.hidden` freezes the CSS-transition clock at `currentTime 0`), and I
  prematurely advanced to Gate 3. Rolled back, fixed the real bug, re-verified, and waited for
  Hussain's confirmation before committing.
- **CLAUDE.md impact:** added `useMagneticHover` + Button `ref`/`data-magnetic` to "Reusable
  components"; added the homepage sticky-CTA reveal-on-scroll note + the Tailwind-v4 translate
  gotcha under "Homepage section order".


### Session D9b — Admin information architecture — `done`
Raised by Hussain 2026-07-31: the admin dashboard is getting messy as features accumulate.
This is about structure and findability, not colours (colours = D9).

**Build outcome (2026-08-27).** Ran as a **focused structural pass** (Hussain's scope choice),
plus two things he added mid-session (a real dashboard, and a reusable bulk-select system).

Shipped:
- **Grouped sidebar + dashboard landing.** `(protected)/layout.tsx` nav is now grouped
  (Overview/Content/People/Services/Private). New `(protected)/dashboard/page.tsx` at
  `/admin/dashboard` (login default redirect changed from `/admin/inquiries`), backed by
  `lib/server/admin-dashboard.ts` (one batched set of count queries): a **Needs attention**
  inbox (pending testimonials, new inquiries, pages missing an image, hidden pages) + Media
  totals/per-category (achromatic distribution bar) + Library counts. Geist-Mono tabular numerics.
- **`/admin/pages` → per-page routes.** The 11 `fixed inset-0` modals are gone. `/admin/pages`
  is a grouped card list (Main/Disciplines/Templates); each page edits at `/admin/pages/[key]`
  (`PageEditorClient` + shared `PageEditorBody`). `PageRowCard` deleted. Discipline cards carry
  an **inline visibility toggle** (immediate optimistic PATCH). `PAGE_ROWS` + pure
  `pageNeedsImage`/`pageGroup` moved to `pages/lib/rows.ts` (plain module — a server route
  importing `PAGE_ROWS` from the `"use client"` hook returned a client-reference proxy and
  `.some` threw; fixed by importing from the plain module).
- **Shared `AdminPageHeader`** adopted across media list/form, people, private galleries, and the
  services/categories/tags/inquiries toolbars. Instructional subtitle blurbs removed sitewide in
  admin (+ the login page's) per Hussain's standing "no instructional UI microcopy" preference.
- **Shared `AdminToggle`** (Pages list + editor `VisibilityGroup`).
- **Feedback consolidation (contained):** `useAdminAction({ autoDismiss: true })` + `notify()`;
  `useServicesAdmin` consumes it, retiring its bespoke timer. The 3 hook-skippers (inquiries,
  media editor, private galleries) deferred — they work.
- **Dead surfaces removed:** `/admin/nfts` route deleted; Removal Requests unlinked from the nav
  (stub file kept for D12).
- **Reusable bulk-select + action bar** (`components/admin/bulk/`: `useBulkSelection`,
  `BulkCheckbox`, `BulkActionBar`, `runBulkAction`) wired into all 8 admin lists + the
  services/inquiries archived sections. Actions loop existing single-item endpoints
  (`Promise.allSettled`); media/people/private-galleries are delete-only (their PATCH needs a
  full body). No bulk API routes, no data-model change.

Deferred (out of the focused scope): unifying the 5 editing patterns, the 3 image pickers, the 6
hand-rolled overlays (all D9/later), and wiring/deleting `POST /api/testimonials/reorder` (bulk
was wired instead — the defect is now unassigned in CLAUDE.md's table). `media.order` dead schema
left as-is (no data-model changes).

--- ORIGINAL SPEC (verbatim) ---

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
  ~~dnd-kit sortable is reimplemented three times~~ **RESOLVED in T1** — extracted to
  `components/admin/sortable/SortableList.tsx` (`SortableList` + `useSortableRow`); service-categories,
  services and page-sections now consume it. Eight files
  hand-roll the same `text-2xl font-semibold tracking-tight` page header — the admin has no
  `PageHeader` equivalent. (The per-page `mounted` hydration guards on service-categories and
  services are also gone — the primitive needs none.)
- **Silent failures — RESOLVED in S11 (2026-08-19).** `MediaDetailsSection` `loadPeople()`
  now sets a `peopleError` state on any non-ok/throw and shows an inline note instead of the
  old `catch {}`. The service-categories name/slug inputs (now `CategoryRow.tsx`, not the
  stale `CategoryRowSortable`/`CategoryRowStatic` names) reset to the last-saved value when
  `onEdit` reports failure, so the field no longer contradicts the banner. Left for D9b: the
  broader feedback-*architecture* consolidation (multiple hand-rolled wrappers onto one hook)
  — the user-facing feedback correctness itself is fixed.
- **Dead surfaces:** `/admin/removal-requests` is a hardcoded stub (owned by D12, but it is
  live in the sidebar today); `/admin/nfts` is three stat tiles and two nav buttons, and is
  the only admin page querying MongoDB directly from a page component.

Constraint: no data-model changes in this session. Presentation only — the three
collections stay as they are (that reasoning is in archive §N5 Part 2). S11 (unsaved-work
guard) is a **separate, earlier** session — do not fold it in here.
If D9 and D9b are both still pending when reached: run **D9b first** (structure), then
D9 (visual polish) — polishing a layout that's about to change is wasted work.

---

### Session D9 — Admin visual redesign — `done`
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

**Outcome (2026-08-28).** The admin already shared the token system (one `globals.css`,
Geist via root layout, `next-themes` dark class) and D9b had already cleaned the structure,
so D9 was pure visual polish. Two shared primitives were added:
- `components/admin/AdminButton.tsx` — `adminButtonClasses(variant, size?, className?)` +
  `<AdminButton>`. Variants `default`/`solid`/`danger`/`warning`/`ghost`, sizes `xs`/`sm`/`md`,
  shared focus ring + disabled state. **Every admin action button was swept onto it** (~40 files):
  Delete/Remove → `danger` (`--destructive`), Unapprove → `warning` (amber), Save/primary →
  `solid` (`bg-foreground`, renders white on the dark theme — Hussain confirmed correct), the rest
  → `default` (bordered). Class-swap approach (kept each `<button>`/`<Link>` element + props),
  so zero behaviour change.
- `components/admin/AdminSidebarNav.tsx` — client nav (`usePathname`) with active-route
  highlighting; replaced the per-item bordered-box sidebar.

The `(protected)/layout.tsx` shell was restyled: quiet ghost nav, reversed "HM Visuals / Admin"
lockup, `ghost` chrome buttons (View site / Logout / theme toggle), and `--shadow-soft` on the
sidebar + content frame. Login button adopted `solid`. **Deliberately left untouched** (distinct
control types, not action buttons): filter pills, drag handles (⠿), the `IconButton` icon-button
primitive, selectable media tiles, card-cover links — and **all admin inputs** (a later pass;
D9's approved scope was buttons + shell, and inputs were not silently widened into). Verified:
`tsc --noEmit` clean, `eslint --max-warnings 0` clean, 131 tests pass. CLAUDE.md updated in the
same commit (Reusable components: `AdminButton` + `AdminSidebarNav`; Admin design: D9 shipped).

---

### Session D13 — Final public consistency pass — `done` — shipped 2026-08-29
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
- **Glass-panel text contrast — RESOLVED in D2b.** `SiteFooter.tsx` and `StickyCta.tsx`
  were swapped from `backdrop-filter` glass (`surface-1`/`surface-3` / `bg-background/70
  backdrop-blur`) to solid `bg-card`, so the 1.1–1.4:1 pixel contrast is gone. No action in
  D13 unless a re-scan flags a regression.
- **Undersized functional text.** Two sources, re-verified 2026-08-17 — the old entry put
  both in one file. `WorkOverlay.tsx:237` discipline sublabels are `text-[9px]`; the 10px
  "HM" logo mark is `Navbar.tsx:69`, **not** WorkOverlay. Both still unfixed. Bump to ≥11px
  (CLAUDE.md's micro-label spec sets 11px as the floor).
- ~~**`transition: width, height`** on a shared element (all pages)~~ **RESOLVED in D5
  (2026-08-20).** This was `CustomCursor.tsx`'s ring-inner (`transition-[width,height,opacity]`);
  the D5 rewrite sizes the ring with `transform: scale()` instead, so the layout-thrashing
  transition is gone. No action left in D13 unless a re-scan flags a new one.
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
  smaller than every other page. (About's old `lg:text-6xl` override was removed in D2c.)
- **Section padding** is `py-12 sm:py-16` on 10 of 15 routes; videography, contact,
  `GalleryPasswordForm`, photography and testimonials each deviate differently.
- **`page_seo.title` / `.headerTitle` cannot be blanked** — `lib/server/page-seo.ts:144,146-149`
  truthy-gate them so an empty string reverts to a hardcoded default, while
  `.description`/`.headerDescription`/`.ogImageUrl` in the same form pass empty through.
  Inconsistent with "empty means empty" and inconsistent within one form.
- **Duplicated types/logic to collapse:** ~~the same appearance shape declared 4×~~ and
  ~~appearances date formatting forked into `NftModal`~~ were **both fixed in C4** (2026-08-18):
  `Appearance` is one shared type in `_lib/media.ts` and `NftModal` now calls `formatDates`.
  Remaining: dead+drifted `toPublicTestimonial` in `testimonial-serializers.ts:3-17,39-57`;
  two independent discipline matchers (`public-services.ts:37-51` vs
  `HomeServicesPreview.tsx:15-23`); IP extraction reimplemented in 5 places instead of
  importing `getClientAddress` (`_lib/public-form-security.ts:1-5`).
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

**D13 build outcome (2026-08-29).** Executed all groups. New shared modules: `lib/disciplines.ts`
(`DISCIPLINES`/`DISCIPLINE_HREF`/`disciplineForCategory` — deduped the classifier from
`HomeServicesPreview` + `public-services.workLinkForCategory`, and the discipline lists from the
work-overlay route + `SiteFooter`) and `components/shared/NoResults.tsx` (replaced 5 hand-rolled
"no results" divs). Gradient fallbacks → flat `bg-muted` (`SmartMediaPreview` base+empty). Banned
eyebrows removed: `SiteFooter` `.eyebrow` lockup + WorkOverlay `text-[9px]` sublabel; the
`.eyebrow` class deleted from `globals.css`. Undersized text: Navbar logo `text-[10px]`→11px.
Photography H1 override removed. Dead code deleted: `toPublicTestimonial`, `app/api/testimonials/
geocode/route.ts`, WorkOverlay `activeSlugs` prop, `components/ui/{dialog,sheet}.tsx`. Dedup: 3
inline `x-forwarded-for` → `getClientAddress`. Radius: all 9 one-offs → the 5-token scale (public
tree now clean). PageHeader adopted in `g/[slug]` + `services/[slug]`; AnimatedText added to the
gallery gate H1; PageHeader description capped `max-w-2xl` (line-length fix at source). 5 modal
scrims unified to `bg-black/70` (WorkOverlay `/92` kept — full-screen takeover). `SmartImage`
adopted in PortfolioCard/PeopleIndex/ServiceCard/PreviewImage (`SmartMediaPreview` left on raw
`next/image` — foundational, manages its own loading). **Kept (evaluated):** PortfolioCard NOT
forced onto NftCard/ServiceCard/HomeCreativeSystem/PrivateGalleryBrowser (genuinely differ);
homepage bespoke discipline labels kept; `page_seo` blank-title fallback kept (blank `<title>` is
bad SEO — reclassified defect→decision); StickyCta defaults kept (live fallbacks). **Two
extras this session:** (1) fixed a pre-existing dnd-kit hydration mismatch by giving admin
`SortableList`'s `DndContext` a stable `id={useId()}`; (2) **rebuilt the WorkOverlay motion** to
the photography cylinder's ≤5 arc+sway model (symmetric front arc, gentle sine sway clamped to the
arc, responsive scale) — the old arc-length full-spin cylinder left an empty gap when disciplines
were deactivated. Verified: `tsc` clean, `eslint --max-warnings 0` clean, 163 tests pass. CLAUDE.md
updated in the same commit.

---

## Phase 3 — Content & analytics

### Session C1 — Blog admin + public pages — `done` (2026-08-29)
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

**Build outcome.** Shipped in full. Two collections — `blog_posts` (added `excerpt`,
`coverImagePublicId`, `categoryId`, `createdAt` beyond the spec) + `blog_categories` (modelled on
`service_categories`, no system "others"; category optional). CRUD API: `api/blog` + `api/blog/[id]`
and `api/blog-categories` + `[id]` (rename cascades category slug to posts; delete blocked while
referenced unless `?detach=1`); admin-gated via the shared `requireAdminOr401`/`requireAdminObjectId`.
**Editor decision: Markdown, approved by Hussain over WYSIWYG** — `react-markdown` + `remark-gfm`
(deps added), rendered to React elements (no `dangerouslySetInnerHTML`), styled by a new `.blog-prose`
block in `globals.css`; editor at `/admin/blog/new` + `/admin/blog/[id]` (`BlogPostEditor` with
auto-slug, `ImageField` cover → new `CLOUDINARY_BLOG_FOLDER`, category select, freeform `TagsInput`,
markdown field with live preview, publish `AdminToggle`; author defaults to "Hussain Marzooq").
`/admin/blog` list with bulk publish/unpublish/delete; `/admin/blog-categories` with `SortableList`
reorder + active toggle; both added to the sidebar "Content" group. Public `lib/server/public-blog.ts`
(fail-safe → `[]`; published = `isPublished` AND `publishedAt<=now`, drafts 404) + `lib/reading-time.ts`
(unit-tested). Public `/blog` (category filter via `?category=`, `BlogCard`, `NoResults`) and
`/blog/[slug]` (reading layout, `generateMetadata` OG=cover, read time). New SEO template `blog-detail`
(`{title}` token); blog `page_sections` reduced to CTA-only (interim `BlogSections.pillars` deleted).
`ImageField` gained an optional `folder` prop. **No CSP change** (covers are Cloudinary images).

### Session C2 — Open Graph images — `done` (2026-08-29)
Each public page needs a proper OG image so link previews on social media show actual photography.

Implementation:
- Next.js App Router `opengraph-image.tsx` per page, using the Vercel/Next.js OG image generation API.
- Each page pulls a representative photo from Cloudinary (the page's primary image).
- Fallback: a branded dark card with "HM Visuals" if no image is available.

Read all public page.tsx files and Next.js OG image docs before writing.

**Build outcome.** Shipped, but **rescoped by decision at Gate 1 (approved by Hussain).** The spec's
"pull a representative photo" per page conflicts with the binding "empty means empty — no auto-pick"
rule (the same rule that removed the hero's auto-pick in S4), and the project already provides the
mechanism: the dormant admin `page_seo.ogImageUrl` field, which nothing consumed. So the shipped model
is **admin-driven, empty means empty**: a page's OG image = its admin-picked `ogImageUrl`; empty → one
site-wide branded fallback card. Not per-page generated cards.

- New `lib/seo/page-metadata.ts` — `buildPublicMetadata({ title, description, image?, type? })`, the
  single builder all 16 public `generateMetadata` blocks route through (home, 5 disciplines,
  about/services/contact/people/blog/testimonials, the two `[tag]` pages, blog-post + person detail).
  Returns `openGraph` + `twitter` (`summary_large_image`). **Omits the `images` key when there is no
  image** — `images: undefined` counts as "specified" to Next and suppresses the file-based fallback
  (this was the bug caught in-browser: og:image absent until the key was omitted).
- New `app/opengraph-image.tsx` — the ONE branded fallback card via `next/og` `ImageResponse` (built
  into Next 16, no dependency added). Dark achromatic 1200×630, "HM Visuals" wordmark + tagline, no
  gradient; inline literal colors (Satori can't resolve CSS tokens — accepted no-hardcoded-hex exception,
  same class as WebGL). Next inherits it site-wide onto any route not setting its own `openGraph.images`.
- `app/layout.tsx` — added `metadataBase` (`NEXT_PUBLIC_SITE_URL` → `https://hussain-marzooq.com`) so
  image URLs resolve absolute, plus site-default `openGraph`/`twitter`. **`NEXT_PUBLIC_SITE_URL` added to
  the L1 deploy checklist** (unset → OG URLs point at localhost).
- Detail pages pass their own image: blog post → cover (`type: "article"`, replacing its hand-rolled
  openGraph); person → `featuredImage ?? avatarUrl` (`type: "profile"`); tag pages → the `{tag}` slug image.
- Admin: the per-page **Share image** control in `SeoPageForm` swapped from a raw URL text box to the
  shared `ImageField` picker/upload (consistency with every other admin image field). `page_seo.ogImageUrl`
  stays a plain URL string (picker reads/writes only `.url`) — no data-model/serializer change, no migration.
- **No CSP change** (Cloudinary already allowed; fallback is same-origin). Verified in-browser: fallback
  card renders 1200×630; homepage `<head>` emits absolute `og:image` + `twitter:image` with type/width/
  height/alt. tsc + eslint clean, 173 tests pass.

**Hussain add-on this session: a blog-page visibility toggle in the Pages tab** (not on `/admin/blog`
— first built there, then moved at his request to match every other page). Implemented as a new
`rows.ts` `toggleOnly` flag: the blog `PAGE_ROW` carries `settingsSlug:"blog"` + `toggleOnly:true`,
so it gets the inline visibility toggle but stays in the **Main** group with no Work-overlay card
image, and `pageGroup`/`pageNeedsImage` (used by both the Pages editor and the dashboard warning)
skip the card machinery for it. `getAllPageSettings()` now includes `"blog"`; the page-settings PATCH
route's `VALID_SLUGS` gained `"blog"`. When inactive, `/blog` + `/blog/[slug]` redirect home (tolerant
`getBlogActive()`) and the footer's Blog link drops. Verified: `tsc` clean, `eslint --max-warnings 0`
clean, 173 tests pass (new `reading-time` suite + smoke). CLAUDE.md updated in the same commit.

---

## Session P1 — Performance audit — `done` (2026-08-31)
Audit the full public site for performance.

- Lighthouse scores on homepage, photography, videography, NFT, dancing pages.
- Identify and fix the largest performance issues.
- Verify Three.js scenes are disposed correctly on unmount.
- Verify GSAP ScrollTrigger instances are killed on unmount.
- Verify Lenis is destroyed and reinitiated correctly on route change.
- Image optimization: verify all Cloudinary images use appropriate quality and format settings.
- Caching strategy — confirm which pages genuinely need per-request freshness.
- N+1 on `/people`: one `media.find()` per person inside `Promise.all(docs.map(...))`.
- Search has no supporting index: unanchored case-insensitive regex over six fields.
- `ensure-indexes.mjs` drift: dead `{status:1}` testimonials index + testimonials index missing `approvedAt`.
- `HeroBokeh` statically imported — measure `three` in the homepage bundle, do not change the hero.

**Outcome (2026-08-31).**
- **N+1 fixed** — `getPublicPeople` (`lib/server/public-people.ts`) now runs exactly 2 queries: the
  people query, then a single `media` query with `$or: [{peopleIds:{$in}}, {people:{$in}}]` over all
  ids/names, grouped in application code (per-person dedupe by media id, newest-first featured image,
  photo/video counts). Was N+1; now O(1) round-trips. Uses the existing `{peopleIds,isPublic,createdAt}` index.
- **Testimonials index fixed** — `ensure-indexes.mjs` now creates
  `{isApproved:1, sortOrder:1, approvedAt:-1, createdAt:-1}` to match `getPublicTestimonials`'s sort
  (no more in-memory sort); the dead `{status:1, createdAt:-1}` index (no code writes `status`) was dropped.
  On an existing DB the old indexes must be `dropIndex`'d manually; on first deploy they are created fresh.
- **Search index — DECISION, not a code change.** Left as-is. A MongoDB `$text` index is word/stem-based
  and would break the as-you-type substring search; the correct scalable fix is Atlas Search (`$search`
  autocomplete), a deploy-time Atlas config. At portfolio scale a bounded scan is fine. Do it only when
  the library grows. Logged in the CLAUDE.md defect table under "at/after deploy".
- **Lifecycle audit — all clean.** Three.js disposal (`HeroBokeh`, `PhotographyCylinder`) disposes
  renderer/geometry/materials/textures, cancels RAF, removes listeners, kills GSAP tweens. `AnimatedText`
  uses `useGSAP({scope})` (auto-reverts tweens + ScrollTriggers). Lenis is a single instance in `AppShell`,
  destroyed on cleanup, keyed `[isAdmin]` so it is not recreated per route.
- **Cloudinary images correct** — loader emits `w_<width>,c_limit,q_auto,f_auto` (per-browser AVIF/WebP,
  no upscale). No change.
- **Caching directives correct** — the queue's "4 pages have no directive" note was stale; S9 already
  added `revalidate = 300` to about/blog/dancing/web-development. All 15 real public routes carry a
  directive; `contact`/`services`/`g/[slug]` `force-dynamic` is justified. No change.
- **HeroBokeh** — statically imported at `HomeHero.tsx:3`, putting ~140–160 KB gzip of `three` in the
  homepage initial bundle while its WebGL siblings are `dynamic({ssr:false})`. Reported only; hero untouched.
- **Lighthouse NOT run** — the sandbox cannot reach Atlas so the dev server 500s. Owner: Hussain, at
  deploy/local — `npx lighthouse http://localhost:3000/ --view` across home/photography/videography/nft/dancing.
- **Transition bug fixed in the same session** (reported by Hussain mid-session): the contact-sheet page
  transition drew only `type:"image"` media into its pool, so a sparse/mostly-video library collapsed to a
  1-image pool and filled all 40 cells with the same photo. `TransitionContext.navigate()` now dedupes the
  pool and, when fewer than 2 distinct photos exist, plays the quick fade instead of the grid. Recorded in
  CLAUDE.md → "Page transitions".
- **Verified:** `tsc --noEmit` clean, `eslint --max-warnings 0` clean, 177 tests pass. `/people` and the
  people-profile transition confirmed working by Hussain. CLAUDE.md updated in the same commit.

---

## Session P2 — Mobile adjustment pass — `done` (2026-08-31)

**Original spec:**
Verify and fix the full mobile experience. The WebGL homepage, 3D cylinder, and all GSAP effects
must work on mobile. Where mobile requires layout adjustment (not feature removal): fix it. Where
performance requires simplification: propose the specific simplification and wait for approval.
Test every public page on mobile viewport. Report all issues before fixing.

**Build outcome:**
Public-tree only (admin deliberately out of scope — CLAUDE.md's "never touch admin unless the
session is for admin"). Verification was code-level: the sandbox can't reach Atlas so the dev
server 500s; Hussain confirmed the fixes on his own machine at mobile widths.

Audit found the grids, nav drawer, footer, testimonials, contact, and `PhotographyCylinder`
(`touch-none` + mobile hint) already responsive. Fixes shipped:
- **Content-modal footer/scroll bug fixed site-wide via a new shared `components/shared/ModalPortal.tsx`**
  (portal to `document.body` + `useScrollLock` + Escape). The D12 portal fix had been applied only to
  `MediaLightbox`; every other modal (NftModal, PrivateGalleryBrowser, ExhibitionCityModal, ReviewModal,
  PublicReviewForm) was footer-covered and scrolled behind. All six now route through `ModalPortal`;
  `MediaLightbox` was refactored onto it too (dedup). `WorkOverlay` stays separate (top-level GSAP
  takeover, not footer-trapped). Hussain's explicit callout: the fix must be consistent across the site,
  not one instance.
- **Media modals stack on mobile:** `grid-rows-[45vh_minmax(0,1fr)] lg:grid-rows-none` so the
  `fill`/`object-contain` media no longer collapses as detail content grows (MediaLightbox, NftModal,
  PrivateGalleryBrowser).
- **`CustomCursor` desktop-only:** effect bails unless `(pointer: fine)` — no rAF loop / `cursor:none`
  on touch.
- **`PhotographyHorizontal`** marquee track got `touch-pan-y` (vertical page scroll passes through,
  horizontal drag captured). **`WorkOverlay`** grab area got `touch-none` (the browser was stealing the
  touch, so the cylinder wouldn't drag on mobile).
- **Cylinder size:** `FIT_MARGIN` 1.12 → 1.28 and mobile floor 440px → 380px; controls→viewer gap
  `mt-10` → `mt-1` (Hussain: "reduce it more").
- **Photography toolbar:** search input now shares the row with the mode buttons on mobile (was its own
  line); tag chips take the line below.
- **People grid:** 2 columns minimum on mobile (`grid-cols-2`, was 1).
- **Verified:** `tsc --noEmit` clean, `eslint --max-warnings 0` clean, 177 tests pass. All surfaces
  confirmed working on mobile by Hussain. CLAUDE.md updated (ModalPortal + mobile facts) in the same commit.

---

## Session A1 — Admin mobile redesign + media/gallery form wizards — `done` (2026-09-01)

**Original spec:** Redesign the admin experience. Half 1 — admin mobile chrome (mobile only, `< md`,
desktop untouched): replace the sidebar with a fixed bottom icon nav (5 groups; tap opens the group's
tabs), reduce edge/dead space. Half 2 — media form → Next/Back step wizard (mobile AND desktop) with a
persistent shrinking upload preview, preserving all `useMediaEditorController` behaviour. Later expanded by
Hussain to: the private-gallery form gets the same wizard; fix every admin page's mobile layout; and fix
the media upload that "opens the Cloudinary popup but can't tap anything" on mobile.

**Build outcome (verified on-device in Hussain's logged-in Chrome at 390–430px, not just compiled):**
- **Bottom icon nav** `components/admin/AdminMobileNav.tsx` + shared `components/admin/nav-groups.ts`
  (`NAV_GROUPS` extracted from `AdminSidebarNav`, + a lucide icon per group). `(protected)/layout.tsx`
  sidebar `hidden md:block`, bottom nav on mobile, tighter padding, **`overflow-x-hidden`** root guard.
  Desktop admin byte-identical.
- **`AdminPageHeader` wraps** (`flex-col sm:flex-row`) — this fixed the services-page **iOS auto-zoom**
  (root cause: the header's wide action buttons overflowed the viewport, inflating the layout viewport).
- **Admin list rows/tables made mobile-safe:** action buttons wrap to their own line (services
  `SortableServiceItem` + name/badges row, `ServiceSimpleSection`, people rows, removal-requests rows);
  the fixed multi-column tables scroll horizontally inside their card (`overflow-x-auto` + `min-w`:
  inquiries `InquirySection`, service-categories `CategoriesTable`). Every admin page was checked at phone
  width; dashboard/analytics/pages/tags/blog/testimonials were already fine.
- **Media + gallery form wizards:** `MediaWizard` (Category → Media → Details → Appearances → Review +
  persistent `MediaWizardPreview`) and `GalleryWizard` (Details → Media → Review), both on the shared
  `components/admin/wizard/WizardTabs.tsx` (active step scrolls into view). Presentation/flow only — no
  controller/validation/data-model change. `page.tsx` slimmed to header + feedback + `<MediaWizard>`.
- **Native upload replaces the Cloudinary widget (the real mobile-upload fix).** Diagnosed on-device: the
  `CldUploadWidget` desktop multi-pane layout collapses to a blank pane on narrow screens. New
  `components/admin/CloudinaryUploadButton.tsx` — hidden `<input type="file">` → sign via
  `/api/sign-cloudinary-params` → direct POST to `api.cloudinary.com/.../auto/upload` (already in
  `connect-src`, **no CSP change**). Adopted by `MediaAssetSection`, people avatar, `ServiceEditorModal`,
  and shared `ImageField` (blog/sections/OG). Verified end-to-end: a real image uploaded at 430px and
  rendered its preview. Public testimonials review form (`ProfilePhotoField`, `ReviewPhotosField`) keeps
  `CldUploadWidget` (unauthenticated visitor path — different signing; a public equivalent is a later task).
- A defensive nav-hide mechanism added mid-session (dispatching `hm_admin_overlay_*`) was **reverted** —
  it was the wrong fix and regressed the navbar; removed entirely.
- **Verified:** `tsc --noEmit` clean, `eslint --max-warnings 0` clean, 177 tests pass; every admin page
  confirmed at phone width in the logged-in Chrome (`pageOverflow: 0`). No security surface (no new routes,
  auth, env, or CSP change). CLAUDE.md updated in the same commit.

---

## §L2 — Trusted client IP + request-guard correctness (2026-09-02) — `done`

**Why.** `app/api/_lib/public-form-security.ts:5-7` read the first entry of the
client-supplied `x-forwarded-for`. Netlify documents that header as spoofable and names
`context.ip` / `x-nf-client-connection-ip` as the trusted value. Every rate limit in the app
keys on this function: admin login lockout, testimonial submit, testimonial upload-signature,
the destructive testimonial cleanup route, the People password gate, the private-gallery
password gate. A random `X-Forwarded-For` per request bypassed all of them — which silently
re-opened the §S10 login-lockout defect (S10 removed the user-agent from the key, but the key
itself was still attacker-controlled).

Files:
- `app/api/_lib/public-form-security.ts` — `getClientAddress` prefers
  `x-nf-client-connection-ip`; `x-forwarded-for` / `x-real-ip` accepted **only** when
  `NODE_ENV !== "production"`. In production, no trusted header → `"anonymous"`, never a
  spoofable fallback.
- `lib/server/request-guards.ts` — `limited: count > limit` in **both** helpers
  (`getFixedWindowRateLimitStatus` + `consumeFixedWindowRateLimit`); the old `count >= limit`
  meant `MAX_LOGIN_ATTEMPTS = 5` actually allowed 4. Both changed so the two helpers share one
  predicate and a `limit` of N allows exactly N.
- `lib/server/request-guards.ts` — `claimDuplicateWindow` was `findOne` then `updateOne`
  (two simultaneous identical requests both passed). Collapsed to one atomic `findOneAndUpdate`
  aggregation-pipeline upsert with `returnDocument: "before"`: a live prior window → duplicate
  (window not slid); missing/expired → claimed. Return shape `{ duplicated, expiresAt }`
  unchanged, so the inquiries caller is untouched.
- `test/client-address.test.ts` (new) + `test/request-guards.test.ts` (new) — getClientAddress
  production lockdown + dev fallback; rate-limit boundary (`> limit`); dedupe atomicity
  (single call, no read-first, live/expired/missing branches).

Gate 1 security: no new trust boundary — this narrows an existing one. No secret crosses to
the client. No new input; it removes trust in attacker-controlled input. No CSP/auth-constant
change.

**Outcome — shipped 2026-09-02.** `tsc --noEmit` clean · `eslint --max-warnings 0` clean ·
`npm test` 188 passed (19 files), incl. the 11 new tests. Server-only logic, no browser
surface — the production IP-trust behavior is re-verified at the L1 deploy-time checklist
against the live Netlify origin. CLAUDE.md security rules updated in the same commit
(trusted-IP source + the two request-guard invariants).
