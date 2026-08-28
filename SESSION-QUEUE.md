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
Phase S: S1–S7 (security, tests, reuse audit) · Phase DS: DS0–DS2 (skills, detector eval) ·
Phase 2a: D2b (homepage section pass + the shared `Button` two-look system), D2c (About rebuild) ·
Phase 3: C4 (validated media locations + stored coordinates) ·
Phase 2: D6 (exhibition globe) · Phase S2: S10 (security fixes), S8 (rAF + pointer-listener leaks),
S9 (revalidation coverage: layout-wide invalidation on discipline toggle + revalidate on 4 static pages) ·
Phase T: T1 (tag taxonomy `media_tags` + `/admin/tags` + shared admin `SortableList`),
T2 (`/photography/[tag]` + `/videography/[tag]` subpages, `TagChipRow` nav, per-tag disciplines removed) ·
Phase S2: S11 (unsaved-work guard + honest multi-part save feedback + admin feedback-clarity fixes),
N9 (public cursor/footer consolidated into `AppShell`, off admin) ·
D4 (page transitions — COMPLETE: one site-wide gallery contact-sheet on every internal nav, consistent
server image pool; six per-route transitions built, rejected on sight, reverted; CSP showreel fix) ·
Phase 4: L1 (launch-prep code/docs: README rewrite, admin config-error copy, CLAUDE.md deployment status;
first-deploy operational checklist recorded, not yet run — site not deployed) ·
D5 (cursor: velocity stretch, ghost trail, spring overshoot, zone-reactive size, blend-difference) ·
D7 (NFT page: hover-flip collector card, achromatic status badges, tabs + expandable search) ·
D8 (magnetic-hover CTA hook + Button ref forwarding; nav Book + StickyCta only; homepage sticky
CTA now slides up on scroll instead of covering the hero) ·
D9b (admin IA structural pass: grouped sidebar + `/admin/dashboard` landing, `/admin/pages` →
per-page routes with inline visibility toggle, shared `AdminPageHeader`/`AdminToggle`, reusable
bulk-select across all 8 admin lists, dead `/admin/nfts` removed) ·
D9 (admin visual polish: shared `AdminButton` swept across every admin action button, quiet
active-highlighting `AdminSidebarNav`, restyled protected-layout shell; admin inputs left for a later pass) ·
D12 (people privacy system: 3-state visibility + password gate `lib/password-gate.ts`, removal-request
flow with audit `removal_requests` collection, media↔gated-person rule, `MediaLightbox` portal/scroll-lock,
Dashboard notification badge) ·
D11 (web-development page: rescoped by Hussain to a dancing-style link list — `WebDevSections.projects.urls`,
`WebDevSectionsForm`, edited at `/admin/pages/web-development`; cards auto-render each site's own screenshot
through a same-origin proxy `/api/web-projects/preview` fetching thum.io server-side — NO CSP change, no image
upload, no `web_projects` collection; `lib/web-projects.ts` URL helpers).
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
3. **D6** — exhibition globe. ✓ done
4. **D2c** — About rebuild. ✓ done — Block 1 complete.

**Block 2 — Security.** ✓ complete
5. **S10** — admin login rate-limit bypass + email HTML injection. ✓ done

**Block 3 — Tags and subpages.**
6. **T1** — tag taxonomy + `/admin/tags`. ✓ done
7. **T2** — `/photography/[tag]` and `/videography/[tag]`. ✓ done — Block 3 complete.

**Block 4 — Everything else,** in this order:
8. ~~**S11, N9**~~ ✓ done — admin unsaved-work guard + honest multi-part save feedback (S11),
   and public cursor/footer no longer render on admin (N9). (**S8, S9 done.**)
9. ~~**L1**~~ ✓ done — launch prep code/docs shipped (README, admin config-error copy,
   CLAUDE.md deployment status); the deploy-time checklist (rotate secret, verify hash login,
   re-verify CSP, `/admin` headers) is recorded in CLAUDE.md for first deploy.
10. ~~**D4, D5, D7, D8**~~ ✓ done · ~~**D9b**~~ ✓ done (admin structure pass) · ~~**D9**~~ ✓ done (admin visual polish) · ~~**D10**~~ ✓ done (dancing page — admin Instagram embeds) · ~~**D12**~~ ✓ done (people privacy system) · ~~**D11**~~ ✓ done (web-development page — dancing-style link list, cards auto-render the site's own screenshot via a same-origin proxy)
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
| 4 | ~~**S8, S9**~~ ✓ done | S8 was a runaway rAF loop; S9 meant a deactivated page stayed publicly reachable. Both fixed. |
| 5 | **L1** (code ✓, deploy checklist pending) | Code/docs done. Still owed at first deploy: rotate `ADMIN_COOKIE_SECRET`, verify hash login + CSP against the live origin. Checklist in CLAUDE.md → "Domain & deployment status". |

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

## Phase 2a — Design direction (runs before D4)

These are the two skill-driven design sessions DS2 routed here. They run **before D4–D13**
because they produce the design context those sessions read (same rationale as Phase DS).
**Order: D2b first, then D2c** — D4's homepage transition depends on D2b's output.
Each session loads **one** direction skill at a time (named in its Gate 1), never two at once.

**Both D2b and D2c are done** — full specs + outcomes in SESSION-ARCHIVE.md. This phase is
complete.

---

## Phase 2 — Preloader & core experience

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
