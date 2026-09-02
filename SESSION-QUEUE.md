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
upload, no `web_projects` collection; `lib/web-projects.ts` URL helpers) ·
D13 (final public consistency sweep: `lib/disciplines.ts` + `NoResults` shared modules, flat-fallback
+ eyebrow + radius + backdrop cleanup, dead-code/dedup, PageHeader/SmartImage adoption; `SortableList`
dnd-kit hydration fix; WorkOverlay rebuilt to the photography-cylinder arc+sway model).
C1 (blog: `blog_posts` + `blog_categories`, admin CRUD at `/admin/blog` + `/admin/blog-categories`,
Markdown content via react-markdown, public `/blog` + `/blog/[slug]` with category filter + read time,
`blog-detail` SEO template; plus a Pages-tab visibility toggle via a new `toggleOnly` row flag). Archive §C1.
C2 (Open Graph / share-preview images: admin-driven `page_seo.ogImageUrl` wired through a shared
`buildPublicMetadata` across all 16 public pages + one branded `next/og` fallback card, `metadataBase`;
admin Share-image field swapped to the `ImageField` picker). Archive §C2.
P1 (performance audit: `/people` N+1 → 2 queries, testimonials index fixed + dead `{status:1}` dropped,
Three.js/GSAP/Lenis disposal + caching + Cloudinary audit clean, contact-sheet transition fade-guard when
the photo pool has <2 distinct images; search-index → Atlas Search deferred to deploy, Lighthouse owed on
a live machine). Archive §P1.
C3 (analytics: GoatCounter — free/cookieless — one tracking tag on public pages via `SiteAnalytics`,
plus an in-admin `/admin/analytics` dashboard reading GoatCounter's API server-side; chosen over
Plausible on Hussain's call). Archive §C3.
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
11. ~~**D13 last**~~ ✓ done (2026-08-29) — public consistency sweep: shared `lib/disciplines.ts`
    + `NoResults`, gradient/eyebrow/radius/backdrop cleanup, dead-code + dedup, PageHeader/SmartImage
    adoption; plus a dnd-kit `SortableList` hydration fix and the WorkOverlay arc+sway rebuild. Archive §D13.
12. ~~**C1**~~ ✓ done (blog system, archive §C1) · ~~**C2**~~ ✓ done (OG/share images — admin-driven
    `page_seo.ogImageUrl` + one branded `next/og` fallback card, shared `buildPublicMetadata`, archive §C2) ·
    ~~**C3**~~ ✓ done (analytics — GoatCounter tag + in-admin dashboard, archive §C3) ·
    ~~**P1**~~ ✓ done (performance audit — /people N+1 fixed, testimonials index fixed, lifecycle/
    caching/image audit clean, transition fade guard; Lighthouse + Atlas Search deferred to deploy) ·
    ~~**P2**~~ ✓ done · ~~**A1**~~ ✓ done.
13. **Phase L — L2 → L3 → L4 → L5 (Block A), then L6 → L7 → L8 → L10 (Block B), then L9,
    then L11 last.**
    Set 2026-09-01 from an audit cross-checked against the code. **This is the launch path and it
    runs before NFT1/NFT2.** Order is load-bearing: L2 before L3 (L2's fix is L3's only throttle),
    L5 last in Block A so the release gate runs once.
14. **NFT1, NFT2** — after launch.

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

| 6 | **L2, L3, L4, L5** (Block A) | Rate limits are bypassable via a spoofed `x-forwarded-for`; the testimonial cleanup route deletes any Cloudinary folder whose id is printed on `/testimonials`; no error/404 boundaries over read modules that have no try/catch; `next@16.2.6` carries CVE-2026-64641 (Server Action DoS) and the admin login is a Server Action. See Phase L. |
| 7 | **L6, L7, L8** (Block B) | Browsing cannot reach item 61; private-gallery assets are permanent public Cloudinary URLs behind a password-only route; no robots/sitemap/canonical, email sends from Resend's testing domain to a mistyped domain, and there is no privacy policy or publication consent. See Phase L. |

**L9 (Block C) may trail launch by a few days; L10 runs in Block B; L11 runs last, after
every other Phase L session.** Everything else — T1/T2, D4, D5, D7–D13,
C1–C3, P1/P2, NFT — can ship after launch. D10/D11/D12 pages stay behind their `isActive`
toggle until they are built, which is exactly what that toggle exists for.

---

## Gaps awaiting a decision from Hussain

Only genuinely-open items live here. Anything already scheduled has been moved out — the
old list mixed "RESOLVED, scheduled as Session X" entries under a header saying "not
sessions yet", which read as still-open to anyone skimming.

1. **Deeper test coverage — RESOLVED 2026-09-01: it runs before launch, as Session L10
   (Phase L, Block B).** Leave this entry here until L10 is done, then retire it with the
   session. Background: S3 shipped a Vitest baseline (auth unit tests +
   a server-module import smoke test) and CI running typecheck + lint + test (archive §S3).
   It is thin by design: the smoke test only asserts modules import, `admin-route.test.ts`
   mocks the admin guard it is testing around, `lib/private-galleries.ts` has zero coverage,
   and nothing tests rate limiting, query builders or `revalidatePath` wiring. Decide
   what that session covers — now specified in L10.

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

## Phase 3 — Content & analytics

_C3 done — see SESSION-ARCHIVE.md §C3._

---

## Phase 4 — People & launch prep

_P1 done — see SESSION-ARCHIVE.md §P1. `/people` N+1 collapsed to 2 queries; testimonials index
fixed + dead `{status:1}` dropped; lifecycle/caching/image audit clean; search index deferred to
Atlas Search at deploy; Lighthouse still owed on a live/local machine; plus a contact-sheet
transition fix (fade when the photo pool has <2 distinct images)._

_P2 done (2026-08-31) — see SESSION-ARCHIVE.md §P2. Public-tree mobile pass: shared `ModalPortal`
fixes the footer-covering/scroll-behind bug across ALL content modals; media modals stack on mobile;
`CustomCursor` is desktop-only; touch-action fixes on the horizontal marquee + Work overlay; cylinder
size + toolbar + people-grid tuned. Admin was out of scope → now Session A1._

---

_A1 done (2026-09-01) — see SESSION-ARCHIVE.md §A1. Admin mobile redesign: bottom icon nav
(`AdminMobileNav` + shared `nav-groups.ts`), tighter mobile padding + `overflow-x-hidden` guard,
`AdminPageHeader` wraps (killed the services auto-zoom), admin list rows wrap / wide tables
horizontal-scroll; media + private-gallery forms are Next/Back wizards (`MediaWizard`, `GalleryWizard`,
shared `WizardTabs`); and admin uploads moved off the mobile-broken Cloudinary widget to a native file
input (`CloudinaryUploadButton`, no CSP change). Verified on-device in the logged-in Chrome._

---

## Phase L — Launch readiness — set 2026-09-01

Produced from an external audit cross-checked line-by-line against the code. **Nothing in
this phase is optional and the site does not go live before Block A + Block B are done.**

Verified state when this phase was written: `tsc --noEmit` clean · `eslint --max-warnings 0`
clean · tree clean · branch `v2-portfolio` · lockfile `next@16.2.6`.
**`npm test` and `npm run build` were NOT verified** — run both on the Mac.

Order matters: **L2 before L3** (L2's fix is the only throttle L3's endpoint has), and
**L5 last in Block A** so the full release gate runs once, not five times.

---

### Block A — launch blockers

_L2 done (2026-09-02) — see SESSION-ARCHIVE.md §L2. `getClientAddress` trusts only Netlify's
`x-nf-client-connection-ip` in production (spoofable `x-forwarded-for`/`x-real-ip` honored only in
dev); both request-guard helpers use `count > limit` (a `limit` of N allows exactly N — login now
allows 5 attempts, not 4); `claimDuplicateWindow` collapsed to one atomic `findOneAndUpdate` upsert.
New tests: `client-address.test.ts`, `request-guards.test.ts`._

_L3 done (2026-09-02) — see SESSION-ARCHIVE.md §L3. Testimonial uploads are now a server-issued,
cookie-bound capability (`testimonial_upload_sessions` + `lib/server/testimonial-upload-sessions.ts`):
the signature route only signs the cookie session's own `/pfp`+`/photos` folder, submit rejects any
photo URL outside it and atomically flips the session `pending→committed`, and cleanup can only delete
an uncommitted session it owns — closing the public folder-delete and spam-then-delete holes. Format/size
limits are client-side on the widget (signing them breaks `CldUploadWidget`). The widget now mounts only
once its folder is ready (no orphaned root uploads) and the review modal sets `closeOnEscape={false}`._

_L4 done (2026-09-02) — see SESSION-ARCHIVE.md §L4. Three branded boundaries (`app/not-found.tsx`,
`error.tsx`, `global-error.tsx`) in house language; every public server read is fail-safe
(try/catch → `[]`/`null`/defaults) — the six named modules, the five `public-media.ts` reads
(Part C), and `page-settings.ts` (`getAllPageSettings` is a second must-never-throw layout
dependency via `SiteFooter`, surfaced in live testing). Verified DB-down and DB-live. No security
surface._

---

### Session L5 — Dependency upgrade — `pending`

**Why.** Lockfile is `next@16.2.6`. Correct exposure, checked against the advisories — **not**
what the audit claimed: the two August criticals do **not** apply (CVE-2026-75604 is Windows
filesystem only and Netlify Functions run Linux; GHSA-2xp9-vwfh-vxw4 needs Next's Image
Optimization API, which this repo bypasses via `loader: "custom"` and which Netlify rewrites to
its own CDN). What **does** apply is from the July release: **CVE-2026-64641 — DoS in App Router
using Server Actions (High)**; the admin login is a Server Action. Plus CVE-2026-64643
(Server Function endpoint ID disclosure, Medium).

- `next` + `eslint-config-next` → `16.3.3` (Active LTS).
- `react` / `react-dom` → current stable.
- Regenerate `package-lock.json`, rerun the full gate.
- Add a `npm run build` step to `.github/workflows/ci.yml` — permanently. The current file
  explicitly skips it, which is how an unbuildable tree can pass CI.

Gate 1 security: dependency-only; no app trust boundary changes.

---

### Block B — before the domain goes public

### Session L6 — Real pagination on browsing — `pending`

**Why.** `components/media/useMediaSearch.ts:169` — `loadMore()` returns early on
`!hasActiveSearch`; `components/media/MediaGrid.tsx:46` — `showLoadMore` requires
`hasActiveSearch`. So cursor pagination works when searching and **not** when browsing, and
`lib/server/public-media.ts:55,63` caps both disciplines at 60. Photo 61 is unreachable.

- Make `loadMore()` + the Load-more button work without an active search; keep the cursor path
  the single source for both modes.
- Drop the first server batch to 24–30 (also improves LCP / initial payload).
- Same treatment for `lib/server/public-people.ts` `.limit(80)` and
  `lib/server/testimonials.ts:52` `limit = 60`.
- `lib/server/public-media.ts:122` `getExhibitionCities` `.limit(500)` — project only the fields
  the globe needs instead of serializing whole media docs.

Gate 1 security: no security surface (the endpoint is unchanged; see L9 for its rate limit).

---

### Session L7 — Private galleries: authenticated delivery + expiring downloads — `pending`

**Decision, Hussain 2026-09-01: move to authenticated Cloudinary assets with short-lived
download URLs.** Do not ship the current behaviour.

**Constraint established before specifying — verified against Cloudinary's own docs.** Cloudinary's
genuinely-expiring *delivery* URLs come from token/cookie-based authentication, which is
**Advanced plan or higher and requires a Custom Delivery Hostname (CNAME)**. Plain signed URLs
(`sign_url: true`) **never expire** — Cloudinary support: *"Anybody with the URL will be able to
see that asset regardless of location, useragent, etc, and this is done by design."* So the
literal "short-lived Cloudinary delivery URL" is a paid-plan feature. This session implements the
same guarantee on the current plan, and the result is stronger: access is re-checked against the
gallery cookie on **every request**, so changing the gallery password revokes access instantly —
a bearer token cannot do that.

Today: `lib/server/private-galleries.ts:51` ships the raw public `secureUrl` to the browser;
`components/media/download.ts` merely rewrites it to `/upload/fl_attachment/`; and
`app/api/private-galleries/download/[slug]/route.ts:78` 302s straight to a Cloudinary archive
URL. The password protects the route, never the asset — one leaked URL is public forever.

Three parts:

1. **Convert private-gallery media to `type: authenticated`.** Upload API rename with
   `to_type: "authenticated"` and identical public id — **no re-upload needed**. New script
   `scripts/convert-gallery-assets.mjs`, idempotent, run once per gallery. The `/upload/` URL
   stops resolving, which is the entire point. Store `deliveryType` on the media doc so public
   portfolio media keeps the existing fast Cloudinary path untouched.

2. **Viewing → a same-origin authenticated proxy.** New route
   `app/api/private-galleries/asset/[gallerySlug]/[mediaId]/route.ts`: verify the gallery cookie
   with `verifyPrivateGalleryCookieValue` exactly as the download route already does
   (`download/[slug]/route.ts:28-36`), then stream the bytes from Cloudinary using a server-side
   signed URL that never reaches the browser. Accept a `w` param and apply the transform
   server-side, since `lib/cloudinary-image-loader.ts` passes non-Cloudinary srcs through
   untouched and will not size these. Respond `Cache-Control: private, max-age=300`.
   **No CSP change** — `img-src 'self'` already covers it, same pattern as D11's thum.io proxy.
   `lib/server/private-galleries.ts` stops serialising `secureUrl` for gated media and emits the
   proxy path instead.

3. **Downloads → genuinely time-limited.** `cloudinary.utils.private_download_url` /
   `signed_download_url` **is** expiry-capable on any plan (full-resolution, no transformations —
   exactly right for a download). Generate it server-side per click, after the cookie check.
   `components/media/download.ts` is deleted; `PrivateGalleryBrowser.tsx:98,213` call a new
   `POST /api/private-galleries/download-url` that returns a short-lived URL. The ZIP route keeps
   its cookie check and returns a signed, expiring archive URL rather than a plain one.

Trade-off to accept knowingly: gallery bytes flow through Netlify functions instead of
Cloudinary's CDN — slower, and counted against function bandwidth. Confined to private galleries
(a handful of clients at a time); public portfolio media is untouched and still CDN-direct. If
that ever hurts, the paid alternative is Cloudinary Advanced + CNAME + token auth.

Also in this session:
- `app/g/[slug]/page.tsx` has **no `generateMetadata` at all** and renders `result.title` +
  `result.description` in the locked state before authentication. Add `robots: { index: false,
  follow: false, nocache: true }`, and show a generic "Private gallery" title until unlocked.
- `next.config.ts` — add `X-Robots-Tag: noindex, nofollow` on `/g/:path*`, matching the
  `/admin/:path*` block.
- **Password-gated People profiles have the same hole** (same D12 privacy system).
  `lib/server/public-people.ts:229-236` correctly filters `isPrivate`, so
  `app/people/[slug]/page.tsx:18-34` returns `{}` and no name/photo reaches the metadata —
  **but `{}` also means no `robots` directive**, so the locked page stays crawlable while
  `PersonPasswordForm` renders that person's `name`, `bio` and `avatarUrl` in the body
  (`page.tsx:51-58`). Return `robots: { index: false, follow: false }` for the `locked` and
  `unavailable` states and show a generic locked title, exactly as for `/g/[slug]`.

Delete in this session:
```
git rm components/media/download.ts
```

Gate 1 security: **yes, new trust boundary** — two new authenticated routes. Both verify the
existing gallery cookie before any Cloudinary call, both rate-limited, both validate `slug` /
`mediaId` and confirm the media actually belongs to that gallery. No secret crosses to the
client: the Cloudinary signature is generated and consumed server-side. No CSP change.

---

### Session L8 — SEO, email and legal surfaces — `pending`

**Why.** No `app/robots.ts`, no `app/sitemap.ts`, nothing in `public/`.
`lib/seo/page-metadata.ts` emits no canonical. `app/services/[slug]/page.tsx` has no
`generateMetadata` despite being a conversion page. `lib/server/email.ts:6` sends from
`onboarding@resend.dev` (Resend's testing domain — it only delivers to the account owner), and
`:30,:58` link to `https://hussainmarzooq.com/admin/...` — **wrong domain, no hyphen** — while
`lib/server/get-base-url.ts` exists to solve exactly this and is called from **nowhere**.

- `app/robots.ts` + `app/sitemap.ts`, excluding `/admin`, `/g/*` and password-protected People.
- `alternates.canonical` in `buildPublicMetadata` (`lib/seo/page-metadata.ts`).
- `generateMetadata` on `app/services/[slug]/page.tsx`.
- `lib/server/email.ts` — `FROM` from env (verified Resend domain); admin links built with
  `getBaseUrl()`; the two `.catch(() => {})` on `sendInquiryNotification` /
  `sendTestimonialNotification` keep the submit succeeding but must log the failure.
- `app/privacy/page.tsx` — covering the actual processors: MongoDB Atlas, Cloudinary, Netlify,
  Resend, GoatCounter, and the OSM / YouTube / Vimeo / Instagram embeds.
- `components/testimonials/PublicReviewForm.tsx` — an explicit publication-consent checkbox for
  name, review, photos and location, linking to the privacy page. Required to submit; store the
  consent flag and timestamp on the testimonial doc.

Gate 1 security: one new public page, no input. The consent flag is validated server-side in
`submit/route.ts` like every other field.

---

### Session L10 — Release-confidence test layer — `pending`

**Why.** This closes the standing "deeper test coverage" decision in *Gaps awaiting a decision*:
the answer is **after Block A, before the domain is public**. `test/` has 15 entries covering
utilities well — session tokens, password gates, media tags, appearance sanitisation, HTML
escaping, analytics, plus a module-import smoke test. None of the flows that can actually hurt
production are covered, and Block A rewrites two of them.

Add regression coverage for:
- Private gallery access, cookie expiry, and the new authenticated asset proxy from L7 —
  including that a valid cookie for gallery A cannot fetch gallery B's assets.
- Media pagination past 60 in **browse** mode, not just search (the L6 regression).
- API mutation authorization: every `app/api/admin/*` and `app/api/*/[id]` route rejects an
  unauthenticated request. Cheap, table-driven, and it closes a whole class of future mistakes.
- Cloudinary media movement, including the L9 compensating rename when the Mongo write fails.
- Rate-limit boundary + spoofed-`x-forwarded-for` rejection (pairs with L2).

Then a small browser smoke suite — Playwright, no more than eight specs, run against
`npm run build && npm start` locally and in CI: homepage renders · photography loads and
paginates past 60 · videography loads · NFT modal opens · contact form submits · admin login
succeeds · private gallery locks then unlocks · a bad URL renders the L4 branded 404.

Testimonial upload-session ownership tests are **not** here — they ship inside L3, with the fix.

Gate 1 security: test-only. Fixtures must never carry real credentials; the suite reads
`.env.test` with throwaway values.

---

### Block C — hardening; may trail launch by a few days

### Session L9 — Accessibility, API hardening and repo cleanup — `pending`

- **`components/shared/ModalPortal.tsx`** has no `role="dialog"`, no `aria-modal`, no
  labelling, no focus trap and no focus restore — only `WorkOverlay.tsx:188` has dialog
  semantics. Fixing the shared component fixes MediaLightbox, NftModal, PrivateGalleryBrowser,
  ExhibitionCityModal, ReviewModal and PublicReviewForm at once.
- Associate `<label>`/`<input>` with `htmlFor`/`id` across the public forms — start with
  `components/contact/ContactIdentityFields.tsx`.
- Rate-limit the three unlimited public routes: `app/api/media/list-public/route.ts`
  (the search endpoint — `force-dynamic`, `no-store`, unindexed regex over 6 fields on every
  keystroke), `app/api/work-overlay/route.ts`, and
  `app/api/private-galleries/download/[slug]/route.ts`.
- `app/api/blog-categories/route.ts:9` and `app/api/service-categories/route.ts:13` — public
  `GET`s returning inactive rows plus counts. Gate them or split a public active-only endpoint.
- `app/api/web-projects/preview/route.ts` — restrict `?url=` to the URLs actually configured in
  `page_sections["web-development"].projects.urls`, so the domain stops being an open screenshot
  proxy.
- `app/api/_lib/media.ts:68` — validate appearance `link` as `http:`/`https:` only; it is stored
  as an arbitrary 500-char string and rendered as `<a href>` in `MediaDetailsSections.tsx`.
- Reject negative `startingPrice` (`app/api/services/route.ts:74`) and negative NFT price.
- `app/api/media/[id]/route.ts` — compensating rename when the Cloudinary move succeeds and the
  Mongo write then fails.
- `scripts/ensure-indexes.mjs` — unique partial indexes on `media.publicId` / `media.embedUrl`
  after confirming production has no duplicates.
- `netlify.toml` + `.nvmrc` + `engines.node` pinned to Node 22, matching CI.
- **CLAUDE.md doc drift, verified 2026-09-01.** The Known-defects table still lists the admin
  login rate-limiter user-agent bypass and the notification-email HTML injection as open under
  "§S10". Both are fixed in code — `app/admin/page.tsx` keys on `getClientAddress(headerList)`
  alone, and `lib/server/email.ts` runs every interpolated field through `escapeHtml`. Strike
  both rows. The README-boilerplate row is stale too (L1 rewrote it). The
  `POST /api/testimonials/reorder` row is accurate and is closed by the deletion below.

**Deletions (run exactly these — `git rm` for tracked files, plain `rm` for the untracked one):**
```
# create-next-app leftovers — verified: zero references in app/, components/, lib/, hooks/
git rm public/vercel.svg public/next.svg public/file.svg public/window.svg public/globe.svg
# (public/globe/earth-day.jpg + earth-topology.png are the real globe textures — DO NOT touch)

# dead route: POST /api/testimonials/reorder is fully built and called from nowhere
git rm -r app/api/testimonials/reorder

# stop tracking generated graph output (326 tracked files); keep it on disk
git rm -r --cached graphify-out
printf '\ngraphify-out/\n' >> .gitignore

# untracked scratch left by the 2026-09-01 audit
rm -rf _to_delete
```
After the `git rm --cached`, replace the `graphify-out/cost.json` line in `.gitignore` with the
directory rule, and note in Gate 3 that `graphify update .` still runs — only the commit step
in the queue protocol changes (there is no longer a graph commit to make).

Gate 1 security: tightens three public routes and removes two over-sharing GETs. No new trust
boundary.

---

### Final — runs after every other Phase L session

### Session L11 — Full verification gate — `pending`

**Runs last. L2–L10 must all be `done` before this starts.** This is the session that decides
whether the code is shippable; it is not a formality and it is not allowed to "fix things while
it is in there" beyond what is listed below.

**Why it exists as its own session.** `.github/workflows/ci.yml` states outright:
`# No `next build` — the app is verified with typecheck + lint + tests only`. **This project has
never been production-built.** Netlify's first deploy would otherwise be the first time Next's
production compiler, static generation, route compilation, metadata generation and
server/client boundary checks have ever run on this tree. Typecheck, lint and Vitest passing
prove none of that.

Run, in order, from a clean tree:

```
rm -rf node_modules .next
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm audit
```

Every command must exit 0. Treat each of the following as a **stop**, not a warning:

- `npm ci` resolving anything other than the committed lockfile.
- Any `next build` error, including prerender failures on the `revalidate = 300` routes. If the
  build fails while reaching MongoDB, that is the L4 fail-safe work not holding — fix L4, do not
  set `MONGODB_URI` to something that hides it.
- `npm test` failures, including the L10 suite.
- `npm audit` reporting high or critical in a runtime dependency. Dev-only advisories get
  recorded here with a one-line reason and do not block.

Then a local production smoke, because `next dev` and `next build` are different programs:

```
npm run build && npm start
```

Click every public route and every admin route against that server, not the dev server: `/`,
`/about`, `/photography` (paginate past 60 — the L6 fix), `/photography/[tag]`, `/videography`,
`/nft`, `/dancing`, `/web-development`, `/people`, `/people/[slug]` (open and gated),
`/testimonials` (submit a real review through the L3 flow), `/blog`, `/blog/[slug]`,
`/services`, `/services/[slug]`, `/contact` (submit), `/g/[slug]` (locked, unlocked, download —
the L7 flow), a deliberately bad URL (the L4 branded 404), and `/admin` login → dashboard →
one create, one edit, one delete.

Record the outcome in this session's build note: the six command results, the audit summary,
and anything the smoke surfaced. Do **not** mark `done` on a partial pass.

**One thing to do now, ahead of L2, not at L11.** Run `npm run build` once today as a throwaway
check. It has never been run, so if this tree does not build, that fact should shape the order
of Phase L rather than surface after ten sessions of work. It is a two-minute command and it
does not count as starting L11.

Gate 1 security: verification only, no code change. `npm audit` findings that need code are
recorded here and scheduled as their own session, not fixed inline.

---

### After L11 — the release gate and deploy

Not code; cannot be done from a session. Run in this order.

1. **MongoDB Atlas → Network Access → `0.0.0.0/0`.** Netlify build and function IPs are dynamic.
   Until this is done, prerendering `/people`, `/services`, `/nft`, `/testimonials`,
   `/photography`, `/videography`, `/about` and `/` **fails the build** (see L4). Do this first.
2. **Resend: verify the sending domain, add SPF + DKIM.** Start early — DNS is slow.
3. **Netlify env vars** — the full L1 list, plus separate `PERSON_GATE_COOKIE_SECRET` and
   `PRIVATE_GALLERY_COOKIE_SECRET` (both currently fall back to `ADMIN_COOKIE_SECRET` at
   `lib/password-gate.ts:90-91` and `lib/private-galleries.ts:31-32`), plus
   `NEXT_PUBLIC_SITE_URL` at the live origin.
4. **Point Netlify at `v2-portfolio`.** `origin/HEAD` is `master`; a default-branch deploy ships
   the old landing page.
5. Session **L11** — the full verification gate. Do not proceed past a partial pass.
6. `npm run db:indexes` against the production database — confirm the URI before running.
7. Deploy, then run the existing L1 deploy checklist (CLAUDE.md → "Domain & deployment status")
   against the live origin.
8. Lighthouse on mobile against the live origin — owed since P1.

**In parallel, and on the critical path: content entry.** The site is empty until media is
uploaded. The page transition falls back to a plain fade below 2 distinct public photos (P1
guard), the globe needs exhibited appearances carrying C4 coordinates, and every active
discipline needs a Work-overlay card image or `/admin/pages` flags it amber.

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
