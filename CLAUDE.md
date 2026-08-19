# HM Visuals — Claude Working Document

**History policy:** this file holds rules + current state only. Full specs and build
outcomes of finished sessions live in `SESSION-ARCHIVE.md` (referenced below as
"archive §SessionID"). Do not load the archive by default — only when referenced.

## Who this is for
Hussain Marzooq — internationally exhibited photographer and videographer (primary
identity), active NFT artist, working dance teacher, web developer. Dubai-based,
international market: galleries, collectors, luxury brands, agencies, global booking.

## The site
Full rebrand replacing a landing page. Admin works. Content ready to upload.
Every week without it is a missed booking.

## Domain & deployment status
hussain-marzooq.com. Target: hussain.art when ready. Launch does not wait for hussain.art.

**Deployment status — confirm at Gate 1 of any launch-prep session, do not assume.**
Last recorded state (S1, 2026-08-01, archive §S1): *no Netlify env and no deployed build of
this rebuild exist* — the domain serves the previous landing page. "Live on Netlify"
previously appeared here without qualification and was read both ways by different
sessions. If the rebuild has since been deployed, update this line in the same commit and
run the S1 deferred items (queue §L1).

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
MongoDB Atlas, Cloudinary, Resend
Deployed on **Netlify** — not Vercel.
shadcn/ui new-york at components/ui/ · Three.js · react-globe.gl · GSAP + @gsap/react +
ScrollTrigger · Framer Motion · Lenis

## Image pipeline — Next's optimizer is bypassed (2026-07-31)
`next.config.ts` sets `loader: "custom"` → `lib/cloudinary-image-loader.ts`. Every
`next/image` src is rewritten to a Cloudinary delivery URL
(`/upload/w_<width>,c_limit,q_<q>,f_auto/`) and fetched from Cloudinary's CDN. `/_next/image`
is not used.

**Why it must stay this way:** the optimizer downloaded each full-size original from
Cloudinary, re-encoded it with sharp, and blew past its 7s fetch timeout on slow
connections — every image 500'd. Cloudinary already resizes at the edge.

Consequences for any session touching images:
- **Never add `unoptimized`** to a Cloudinary `next/image`. It bypasses the loader and
  pulls the full original (this was the S6 bug — archive §S6).
- Non-Cloudinary srcs pass through untouched — no resizing, but nothing breaks.
- URLs that already carry a transform are left alone (the loader checks).
- WebGL textures use a separate helper, `components/photography/lib.ts`
  (`cloudinaryTextureUrl`), with its own smaller width budget. Two paths, same idea.
- `img-src` in the CSP is `'self' data: blob: https://res.cloudinary.com` —
  `res.cloudinary.com` is the only *remote* host. A new remote image host needs a CSP edit.
  Assets served from `/public` are covered by `'self'` and need **no** CSP change — that is
  how the globe's earth texture ships (queue §D6).

## Animation stack status
- Lenis: initialized in `AppShell.tsx` (public pages only, not admin). Synced to
  ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)` (added in D3).
- GSAP ScrollTrigger: used in `AnimatedText.tsx` scroll reveals — still underused
  elsewhere, core of scroll design.
- Three.js: `HeroBokeh.tsx` (180-point shader system) and
  `components/photography/PhotographyCylinder.tsx` (D3 viewer). The photography viewers are
  `next/dynamic({ssr:false})`; **`HeroBokeh` is statically imported by `HomeHero.tsx:3`, so
  `three` is in the homepage's initial bundle.** Recorded as a fact, not a change request —
  the hero is not to be modified (see "The hero is fixed").
- react-globe.gl 2.38 + three-globe 2.45: **used by the D6 exhibition globe (shipped).**
  Textures live in `/public/globe/` (`earth-day.jpg` + `earth-topology.png`), copied from
  `node_modules/three-globe/example/img/` and served same-origin (`img-src 'self'` already
  covers them — no CSP edit). **Never point `globeImageUrl` at unpkg or any CDN** — CSP blocks
  it and the globe ships as a black ball.
- Framer Motion: installed, used minimally.

## Design direction — SPECIFIED. This section is the spec.

**There is no `DESIGN.md` and there will not be one.** DS2 decided against generating one
(a second source of truth is what produced the old contradictions — archive §DS2). This
file is the design language. The previous wording here pointed at a `DESIGN.md` that DS2
had already declined to write, which left D2b blocked on a file nobody would ever create
and every design session either frozen at Gate 1 or guessing. That dependency is deleted.

**There is no reference-site list.** Pointing at other studios' sites was never a
specification. Do not reintroduce reference URLs in place of the rules below.

### The style is not invented — it is measured from the code
The site already has a consistent style. It was never written down, so sessions kept
re-inventing it. The table below is a census of what the repo actually does, and it is now
the rule. When adding UI, use one of these; do not introduce a new variant.

| Role | Value | Already lives at |
|---|---|---|
| **Button — one component, two looks** (see below) | `components/shared/Button.tsx` — `.hm-btn` geometry (`rounded-full px-5 py-[0.6875rem] text-sm`), `ghost` \| `solid` variant | unified in D2b; every public button except the hero's two pills |
| Tag / filter chip | `rounded-full border px-3.5 py-1.5 text-xs`, active inverts to `bg-foreground text-background` | `MediaTagChips.tsx` |
| **Section rule** | every section opens with a full-width `border-t border-border` inside its `.section-shell`, then the heading block | **new in D2b** — it is what makes the sections read as one page instead of stacked pieces |
| Full-bleed work card | `rounded-[2.25rem] border bg-muted overflow-hidden`, image `group-hover:scale-[1.04]` 700ms | `PortfolioCard.tsx:26,34` |
| Panel | `.premium-panel` = `rounded-[2rem] border` + `--surface-1` + `--shadow-soft` | `globals.css:223-227` |
| Container | `.section-shell` = `mx-auto max-w-6xl px-4` | `globals.css:209-211` |
| Section rhythm | `py-12 sm:py-16` | 10 of 15 public routes |
| Section h2 | `text-3xl sm:text-4xl font-semibold tracking-tight` | `HomeTrust.tsx:16` |
| Card h2 | `text-3xl font-semibold tracking-[-0.045em] leading-[1.02]` | `PortfolioCard.tsx:43` |
| Body over an image | `text-sm leading-6 text-white/70` | `PortfolioCard.tsx:48` |
| Micro-label | Geist Mono, `text-[11px] tracking-[0.2em]`, muted. **11px is the floor.** Only for functional metadata *inside* a component — a count, a price, a `01 / 03` position. **Never as a kicker above a heading, and never as a stat strip.** | D13 |

### The button system — decided 2026-08-17, re-decided 2026-08-18
The 2026-08-17 draft was a three-variant system (`primary` / `secondary` / `on-image`) with
a sliding `→` arrow. **Hussain rejected it on sight in D2b** — the primary/secondary split
on the page read as two mismatched weights, and nothing matched the hero. His replacement,
2026-08-18: *"all the other buttons follow the hero section book button style"* and *"the
book button in the bar should be white."* **Every public button is now one of the two looks
already living in the hero, and there is no arrow.** Do not reintroduce the three-variant
table or the `→`.

**Component: `components/shared/Button.tsx`** — the only public button. Renders a `<Link>`
when given `href`, else a `<button>`. `variant` is `ghost` (default) or `solid`. Geometry +
motion live in `globals.css` → `.hm-btn`. `buttonClasses(variant, className)` is exported so
a non-interactive styled `<span>` can reuse the look (the `PortfolioCard` CTA is a span
because the card's cover `<Link>` does the navigating — a real button there would nest anchors).

**Geometry (`.hm-btn`, both looks):** `inline-flex items-center gap-2 rounded-full px-5
py-[0.6875rem] text-sm leading-none whitespace-nowrap`. **The `border` shorthand is NOT in
`.hm-btn`** — it lived there once and its `@apply border` silently overrode each variant's
`border-white/30` to transparent (the outline vanished). Border width **and** colour must
sit together on the variant, exactly like the hero's inline `border border-white/30`.

| Variant | Rest | Hover | Used by |
|---|---|---|---|
| `ghost` (default) | `border border-white/30 text-white`, transparent fill | **inverts**: `bg-white text-black border-white` | the hero "Book", every Featured-Work / discipline / section button |
| `solid` | `bg-white text-black`, no border | softens `bg-neutral-200` | the hero "See the work", the sticky-bar "Book" |

Both are hard-coded white (not tokens) because they are lifted from the hero pills and the
whole non-hero surface is dark; this is a dark-first choice. The `PortfolioCard` CTA span
inverts on **card** hover (`group-hover:*`), not its own, since the cover link eats pointer
events.

**Motion (`.hm-btn`):** `220ms cubic-bezier(.2,.7,.2,1)` on background/border/colour;
`:active { scale(.975) }` at `160ms`; `:focus-visible { outline: 2px solid var(--foreground);
outline-offset: 3px }`. No arrow. Chips (`.hm-chip`, T2) reuse the transition + press scale,
one size down.

**The hero is still the exception, but its two hovers were improved in D2b** at Hussain's
explicit request (2026-08-18) — "See the work" now softens to `bg-neutral-200`, "Book"
inverts to white. Geometry (`px-6 py-3`, `HomeHero.tsx:66,73`) is untouched and the hero
stays inline (not routed through `Button`), so it keeps its own padding. No other hero change.

### The section system — decided 2026-08-17
Hussain: *"why sections look like pieces put together? there should be something that show
they are a section"* and *"why is there a huge padding between sections?"*

- **Every section opens with a full-width hairline** (`border-t border-border`) as the first
  child of its `.section-shell`, followed by the heading block. That single repeated device
  is what binds the page together.
- **One rhythm, not two.** Sections carry `pt-12 sm:pt-16` and **no bottom padding** — only
  the last section closes with `pb-12 sm:pb-16`. The old `py-12 sm:py-16` on every section
  doubled at every boundary, which is the "huge padding" (8rem between neighbours instead
  of 4rem).
- Heading-to-content gap is `2rem` everywhere. Section headings sit left, with any
  section-level action right-aligned on the same baseline.

**Typefaces are decided: Geist Sans for everything, Geist Mono for micro-labels and
numerics.** Both are already self-hosted via `next/font`, so `font-src 'self'` stays
unchanged. Cormorant Garamond stays preloader-only. Do not add a webfont.

**The palette is achromatic; all colour comes from the work.** The OKLCH tokens carry
neutral surface/text roles only. Do not add a brand accent colour — the photography is
saturated gel lighting (orange/purple, teal/gold, pink/yellow, red on black) and any UI
accent fights it. The only non-neutral token is `--destructive`, admin-only.

**What IS decided, and is binding:**
- Page transitions use the actual photos/videos on each page as the animation material.
- Every page has a unique transition in and out. No generic overlays.
- The work is the design — photography and film are the primary visual element, not
  decoration around a layout.
- Everything in "What is NOT in the design" below.

### Homepage section order — approved 2026-08-17
1. Hero (`HomeHero.tsx`) — untouched · 2. **Exhibition globe** (D6) · 3. Featured Work ·
4. Creative System + Services Preview side by side · 5. Trust · 6. Sticky CTA.

The globe sits **directly under the hero**, so the exhibition record is the first thing
after the opening frame. Its city index is a compact column (`minmax(170px,208px)`, city
name + bare count, no index number, no "WORKS" suffix, ellipsis on overflow) with the globe
taking the remaining width. **No kicker above the heading and no stat line under the
list** — see "What is NOT in the design". Until D6 ships, that section renders nothing —
not a placeholder. Spec: SESSION-QUEUE.md §D2b, §D6.

### The hero is fixed
`components/home/HomeHero.tsx` and `components/home/HeroBokeh.tsx` are **not to be
redesigned.** Hussain's decision, stated 2026-08-17. Bug fixes only (e.g. adding
`priority` to a genuinely-LCP image). No session proposes hero layout, scrim, bokeh or
CTA changes unless Hussain asks for them by name.

### Still open — a session must ask, not guess
Only one item remains, and it is scoped: **the signature element / motion vocabulary of
each individual page** (D4–D13 own these per page). Everything else above is decided.

## What is NOT in the design
- No viewport-scale decorative typography (existing title animations are kept)
- No sound
- No generic overlay transitions (white flash, curtain wipe, fade)
- **No scroll-jacking anywhere.** Hussain's words: "the lock is ruining the user
  experience." Rejected on the photography Horizontal view (D3) and removed again from
  the testimonials section (S6). Do not pin the scroll, hijack the wheel, or take over
  scroll position on any surface.
- No decorative gradients anywhere, including missing-image fallback divs — always flat
  `bg-muted`. Applies sitewide; re-check on every session that touches a fallback state
  (violations were reintroduced once and cleaned in F4 — archive §F4).
- **No eyebrows, kickers or label-above-heading.** N4 removed the `eyebrow` prop from
  `PageHeader` sitewide; the ban is broader than that prop. Do not put a small
  uppercase/mono word above a section heading ("SERVICES", "TESTIMONIALS", "EXHIBITED") —
  the heading says it already. Hussain, 2026-08-17, on seeing them reintroduced in a
  mockup: *"remove these and stop adding these stupid comments."* The `.eyebrow` class in
  `globals.css:205-207` is a leftover and its one remaining use (`SiteFooter.tsx:42`) is
  removed in D13.
- **No stat strips.** No `12 CITIES / 12 COUNTRIES / 64 WORKS / SINCE 2019` blocks, and no
  equivalent anywhere else. The work and the index carry the credibility; a tally reads as
  marketing. Counts are allowed only as inline metadata on the thing they count (a city row
  showing `14`, a service row showing its price).
- No page-vignette, no site-grid-bg (removed in F1)
- Grain texture: active, uniform CSS noise only, fixed position, 3–5% opacity, above
  backgrounds, below all content. No oval. No vignette. Does not bleed into cards.

## Navigation — 6-item nav (live since N8)
**Work · About · Services · People · Testimonials · Book**
- "Work" opens the full-screen overlay with the 5 discipline cards (Photography,
  Videography, NFT, Dancing, Web Development), images admin-picked per card (N7).
  Inactive disciplines are excluded automatically. Services/People/Testimonials are
  **not** in the overlay — it stays scoped to the 5 disciplines only.
- About → /about · Services → /services · People → /people · Testimonials →
  /testimonials · Book → /contact.
- The navbar's visual design stays exactly as N1 shipped it — a camera-hump redesign was
  explored and explicitly dropped (archive §N8). Nav history: archive §N1, §N8.

## Page activity toggle
The 5 discipline pages (photography, videography, nft, dancing, web-development) have an
admin `isActive` toggle: inactive → excluded from Work overlay + homepage sections, direct
URL redirects home. Other pages deliberately have no toggle. System: archive §N2.

## Preloader — shipped (D1)
Facts that look like bugs but are Hussain's confirmed decisions (full history archive §D1):
- Replays on **every** arrival at `/` (hard refresh and client-side nav). No
  sessionStorage gate. Never shown on other pages.
- Symbols: Camera, Video, lucide `Bitcoin` (no ETH glyph exists), the 🕺💃 emoji pair as
  text (dancing — Hussain's explicit pick), Code2. 0.22s beat per symbol.
- "Art" appears centered, holds, glides right while "Hussain." assembles per-letter
  (scatter + blur focus-pull, right-to-left). Cormorant Garamond, preloader-only.
- Exit is self-managed (fades own container, unmounts itself) — intentional, no parent
  `onComplete` contract needed.
- Open question, not urgent: the emoji pair vs the site's no-emoji reasoning elsewhere —
  flag only if the inconsistency bothers Hussain.

## Photography viewer — shipped (D3)
Three views — **Cylinder · Horizontal · Grid** — driven by one shared filter (search +
tag chips via `useMediaSearch`). Cylinder: shallow arc ≤5 photos, closed prism 6+,
raycast click → `MediaLightbox`, arrow keys rotate. Horizontal: auto-scroll marquee with
drag + ping-pong (Hussain rejected a ScrollTrigger pin — "the lock is ruining the user
experience"; do not reintroduce scroll-jacking). Modes 1–2 are
`next/dynamic({ ssr:false })`. Full deviations: archive §D3.

**All three views run on every breakpoint, cylinder included — switcher always visible
(changed 2026-07-31, reversing D3's "mobile falls back to Grid" decision).** Do not
reintroduce a viewport gate: the old post-mount `matchMedia` check made the first paint
render the Grid and then swap to the Cylinder, which is the flash Hussain reported. The
cylinder adapts instead of falling back — `fitDistance()` pulls the camera back so the
front plane fits narrow viewports (`fov` is vertical, so phones crop horizontally), and
`components/photography/lib.ts` cuts the texture budget to 16 @ 420px under 768px.

## Page transitions — content-as-animation (D4, pending)
Every transition uses the actual photos/videos of origin/destination as material.
Per-route specs live in SESSION-QUEUE.md §D4, including the homepage in/out transition
(the old "deferred to a future session" note is gone — the spec is in §D4 now).

## Globe (D6, shipped 2026-08-18)
`components/home/HomeExhibitionGlobe.tsx` + `components/home/exhibition/*` render react-globe.gl
**directly under the hero** (homepage section 2), in its own `.section-shell`: a ranked city
index (dotted-leader rows) on the left, the globe on the right; below 1024px the globe moves
above the index. Data from `getExhibitionCities()` (`lib/server/public-media.ts`) — a direct,
uncapped `media` query for public docs with an `appearances.kind === "exhibited"` entry carrying
C4 coordinates, grouped by `locationId`, returning full works per city (not just ids). Auto-rotate,
drag, resume 2.5s after release. Two-way hover list↔marker. Click a city → a popup grid of that
location's works → click one → existing `MediaLightbox`. Loaded `dynamic({ssr:false})` behind an
IntersectionObserver so it costs the homepage nothing until scrolled into view.

**Two deliberate overrides of the original §D6 spec, at Hussain's request 2026-08-18 — do not
"revert" them:** (1) **arcs** run from Dubai to each exhibition city (the spec said "no arcs");
(2) the brighter **`earth-day.jpg`** texture is used (the spec said `earth-dark.jpg`, which read
too dark). The globe opens facing **Dubai** (his base) and marks it with a distinct "Home base"
beacon (radar ping + home glyph) that is the origin of every arc. No stat line under the list
(that part of the spec was correctly dropped). See "Media locations" below.

## About page — rebuilt (D2c, shipped 2026-08-18)
`app/about/page.tsx` is no longer the interim card grid. Structure now follows the D2b
section system: an intro section (`PageHeader` on `headerTitle`/`headerDescription`, no size
override — the old `lg:text-6xl` D13 flagged is gone), then a `border-t border-border`
disciplines section whose grid mirrors `HomeFeaturedWork` exactly — `grid gap-5
lg:grid-cols-2`, first tile `lg:col-span-2`. Cards render through the new
`components/about/AboutDisciplineCard.tsx` (full-bleed photo + scrim + bottom-overlaid
title/text in the house card language; flat `bg-muted` + foreground text when imageless —
empty means empty, no gradient). `StickyCta` unchanged.

**Content stays admin-driven** (`page_seo.about` header + `page_sections.about.disciplines`
+ CTA) — D2c changed presentation only, no admin/data-model change. Copy was rewritten to
read as **Hussain Marzooq** first-person across four disciplines (photography, videography,
NFT, dancing), not "HM Visuals the brand" (his steer, 2026-08-18).

**The four tiles are auto-linked by position** — `DISCIPLINE_HREFS` in `about/page.tsx` maps
index 0–3 → `/photography`, `/videography`, `/nft`, `/dancing`. There is **no per-card link
field** (Hussain's call: four fixed disciplines, never more). Keep the four discipline cards
in that order in admin — reordering reshuffles the links. Adding/removing a card is possible
in admin but leaves extra cards unlinked / shifts the mapping; the default set is exactly
these four.

## People page (D12, pending)
Public by default; per-person private toggle (password-gated); removal-request flow
(approve in admin → content hidden behind password, not deleted). Spec: queue §D12.

## Dancing page (D10, pending)
Instagram embed + title + description + booking CTA. No direct media upload for now.

## Web development page (D11, pending)
Completed web projects + related services; admin CRUD (`web_projects`).

## Blog (C1, pending)
Standard blog, admin-defined categories, full CRUD, /blog + /blog/[slug].

## Page content CMS — current system
Three collections, one admin surface (single **Pages** accordion at `/admin/pages`;
old `/admin/seo` and `/admin/page-sections` routes are deleted):
1. `page_settings` — visibility toggle (5 disciplines) + Work-overlay `cardImage`.
2. `page_seo` — per slug, 5 fields: `title`/`description`/`ogImageUrl` (search & social,
   used by `generateMetadata`) + `headerTitle`/`headerDescription` (the visible on-page
   H1/description). Two different things — do not conflate. `people-detail` has an SEO
   template with `{name}` substitution so subjects' pages rank for name searches; it has
   no Header group (the person's own name/bio is the header, edited per person).
3. `page_sections` — per-slug section content: homepage panels + Featured Work card array
   (NFT folded in as a normal card, N6), interim-page `{title, text}` card grids, and
   admin-wired `StickyCta` copy on every public page that renders one. **Services and
   Contact deliberately have no CTA** (own booking flow / is the booking destination).
Images in sections are `SectionImage {url, publicId}` — picked from the media library or
uploaded to `hm_visuals/sections` (delete-on-replace for uploads, never for library
picks). **Empty means empty everywhere — no auto-pick, no exceptions.** The homepage hero
followed this too as of S4: its old "fall back to the newest photo/video" auto-pick was
**removed** (it could resolve to a video-file URL rendered through `next/image` → a broken-image
frame), so `HomeHero` now uses the admin-picked `hero.image.url` only and renders a flat
`bg-muted` base when empty — never a borrowed photo, never a broken frame. `app/page.tsx` no
longer fetches photos/videos for the hero.
N7's "empty means empty" is **upheld, not reversed** (S4) — the safety net is an admin
warning, not an auto-fallback: `/admin/pages` flags any active discipline whose Work-overlay
card image is blank (amber "Needs image" pill on the row + inline note in the group), and the
homepage Featured Work cards **and the hero** warn per-image when imageless. So no visible
surface can *silently* go blank; the public surfaces still render a flat `bg-muted` panel when
empty by design.
Interim pages (Dancing, Web Development, Blog) = header + card grid + booking bar
until their design passes. **About had its design pass (D2c) and is no longer interim** —
see "About page" below. Full history: archive §N3–§N7.

## Open Graph images
Per-page OG images from actual photography (Phase 3, queue §C2).

## Analytics
Plausible, one script tag, public pages only (Phase 3, queue §C3).

## Admin design
Visual consistency with the portfolio (dark theme, same typography/tokens/shadcn styling).
Not a layout rebuild (queue §D9).

## Media locations — validated + coordinate-carrying (C4, shipped 2026-08-18)
The old free-text location inputs are **gone**. Both media location surfaces now use the
same validated selector as testimonials (`components/testimonials/review-form/LocationSearch.tsx`
→ `/api/testimonials/location-search`) and store coordinates at save time, so nothing
geocodes at render time:
- **`appearances[].city`/`.country`** — the globe's source, filtered to `kind === "exhibited"`.
  The `Appearance` type now carries `locationId`, `lat`, `lon`; `sanitizeAppearances`
  (`app/api/_lib/media.ts`) validates and persists them (lat/lon range-checked via
  `asFiniteLatitude`/`asFiniteLongitude` in `_lib/common.ts`). Picking a city fills
  `city`/`country` (split from the selector label) plus the coordinates.
- **the media document's own `location` field** — now stores `location` (canonical label),
  `locationId`, `locationLat`, `locationLon`, `locationCountryCode` via the shared
  `parseMediaLocation()` (`_lib/media.ts`). Parsed identically in `media/create` and
  `media/[id]` PATCH; returned by the GET for rehydration.

**Admin, not public → sanitise-and-store, don't re-geocode.** Unlike the public testimonials
form (which re-resolves by id for authority), the media form is admin-gated, so coordinates
from the validated selector are trusted and stored as-is (no per-save DB round-trip, no
per-item resolve across up to 50 appearances). No new trust boundary.

**`Appearance` is now one shared type** in `app/api/_lib/media.ts`, imported everywhere
(`media-serializers.ts`, `components/media/types.ts`, `admin/media/lib/types.ts` all
`import type`; `public-nfts.ts` uses the shared `sanitizeAppearances`, replacing its old
weak `isAppearance` check). The four separate declarations are collapsed.

**Appearance dates** are month+year only: `<input type="month">` in the form (stored as
`YYYY-MM`), rendered as "Month YYYY" by `formatMonthYear` in `components/media/utils.ts`
(used by `formatDates`, and by `NftModal`). Legacy/non-matching values pass through unchanged.

**Admin warning:** an exhibited appearance with no resolved `lat`/`lon` shows an inline amber
note in `MediaAppearancesSection.tsx` — it will not appear on the globe.

**Appearance requires a name to save (D6, 2026-08-18).** The media editor now blocks save when
any Featured/Exhibition entry has no Title — inline red field + a banner naming the entry.
Previously `sanitizeAppearances` silently dropped a nameless entry, so a location-only
exhibition looked saved but was gone. The rule lives once in
`appearanceError`/`findFirstAppearanceError` (`app/admin/(protected)/media/lib/utils.ts`),
shared by the form and the save-gate (`useMediaEditorController.ts`); the server sanitise
stays as a backstop.

**No backfill** — existing media is being deleted and re-entered by hand; no migration was
written and none should be. The globe (D6) reads `appearances` where `kind === "exhibited"`,
groups by `locationId`. There is still **no `getAllMedia()`** and no collection-wide city
aggregation — D6 must query `media` directly and aggregate in Mongo (see queue §D6).

## Reusable components — always use, never reinvent
- `components/shared/PageHeader.tsx` — all public page headers. Props: `title`,
  `description?`, `className?`, `titleClassName?`. **No `eyebrow` prop — removed
  sitewide in N4, do not reintroduce** (history: archive §N4). Exception:
  `testimonials/page.tsx` keeps its own hero-card layout deliberately.
- `components/shared/Button.tsx` — the only public button (D2b). `variant` `ghost`
  (default) or `solid`; renders `<Link>` with `href`, else `<button>`. `buttonClasses()`
  exported for styled non-interactive spans. See "The button system". The hero's two pills
  are the sole exception and stay inline.
- `components/shared/PortfolioCard.tsx` — all full-bleed image cards with overlay. Not an
  `<a>` itself: a `div` + absolute cover `<Link>` + `pointer-events` layering, so its tag
  chips and CTA don't nest anchors (D2b). Props include `priority?` (LCP) and `tags?`.
- `components/shared/AnimatedText.tsx` — all text reveals. **Word-mode only,
  scroll-triggered.** No char/line modes — don't assume they exist.
- `useAdminAction` hook + `AdminActionFeedback` — all admin loading/fetch/feedback
  flows (F5). Never hand-roll the try/catch+setFeedback pattern.
- `app/api/_lib/admin-route.ts` — every admin `[id]` mutation route's preamble
  (S2b). `requireAdminObjectId(ctx)` runs the admin guard **then** validates the
  `:id` ObjectId (auth-before-parse ordering lives here, don't re-inline it);
  `findByIdOr404(db, collection, oid, options?)` for the findOne→404 lookup;
  `wantsHardDelete(req)` for the `?hard=1` soft-vs-hard delete flag. Domain
  field-mapping and cleanup stay in each route.
- `components/admin/media-picker/MediaPickerModal.tsx` + `ImageField.tsx` — all admin
  image pick/upload flows (N7). Don't build another picker.
- `components/admin/sortable/SortableList.tsx` — **all** admin drag-to-reorder (T1).
  `<SortableList ids onReorder(activeId,overId) className>` owns the sensors + `DndContext`
  (closestCenter) + vertical `SortableContext`; each row calls the `useSortableRow(id)` hook
  and spreads `{ setNodeRef, style, handleProps }`. Adopted by service-categories, services,
  page-sections `RepeatingListEditor`, and `/admin/tags` — the three hand-rolled dnd-kit
  copies are gone. **Do not re-inline `useSortable`/`DndContext`; reorder via this.** No
  mount gate (React-Compiler lint bans `setState`-in-effect; dnd-kit's `useId` is
  hydration-safe, as `RepeatingListEditor` already proved).
- `components/services/ServiceCard.tsx` — all service cards (`preview` variant for the
  homepage).
- `components/media/useMediaSearch.ts` / `MediaGridResults` / `MediaTagChips` — all
  media search/filter surfaces (D3). `MediaGrid` composes them. `useMediaSearch` takes an
  optional `lockedTag` that scopes every search to one tag (used by the tag subpages).
- `components/media/TagChipRow.tsx` — **all tag-subpage navigation** (T2). Compact, boxed,
  sideways-scrolling chip row of `<Link>`s (`scroll` + `boxed` props), Lenis-safe. Do not
  hand-roll another tag-nav row. It is distinct from `MediaTagChips` (in-place filter).
- `components/search/SearchInput.tsx` · `components/site/PortfolioFallbackPanel.tsx` ·
  `components/site/Navbar.tsx` · `components/site/AppShell.tsx`.
  **Correction:** AppShell holds Lenis, Navbar, Preloader and the grain overlay, all behind
  its `if (isAdmin) return <>{children}</>` gate (`AppShell.tsx:14-15,31-33`). It does **not**
  hold every global element: `CustomCursor` and `SiteFooter` are mounted as siblings in
  `app/layout.tsx:30,32`, outside that gate, so they currently render on every `/admin/*`
  page including the login screen. Fixed in queue §N9.

## Code quality rules
- **Any code that can become a reusable component must be refactored into one.** Reuse
  over repetition, always — this is the primary rule, not file length.
- **No big files. Even 100 lines is a lot** — exceed only when genuinely unavoidable
  (a cohesive scene/route that cannot be split without harming clarity), and state why.
- No duplicated patterns — extract to shared components
- No inline styles when a token exists
- No dead code, no duplicated logic
- **No explanatory or narrative code comments.** Hussain's standing rule — keep source clean;
  rationale goes in CLAUDE.md / session docs, never inline. Leave pre-existing comments unless
  asked to change them.
- Before every session: audit connected files, report what changes and what could break
- Never touch admin pages unless the session is specifically for admin
- **Before marking a session `done`: re-read that session's own task list against the
  files actually changed and confirm each listed item was completed, not just attempted.**
  (F2 and N1 both shipped gaps that were only caught by later audits — archive §F2, §N1.)

## Testing & CI (S3, shipped 2026-08-03 — archive §S3)
- **Runner: Vitest.** `npm test` (= `vitest run`), `npm run test:watch` for the loop. Config in
  `vitest.config.ts` (node env, `@/*` alias, dummy `MONGODB_URI`/`RESEND_API_KEY` so
  import-time reads don't throw or hit the network). Tests live in `test/`.
- **Never run `next build` to verify.** The verification chain is `tsc --noEmit` + `eslint`
  + `npm test` + the dev server. CI (`.github/workflows/ci.yml`, Node 22) runs exactly
  those three checks on push (`master`, `v2-portfolio`) + PR — no build step.
- **Coverage today is deliberately minimal:** auth pure functions
  (`lib/auth/session-token.ts`, `verifyAdminPassword`) + a smoke test that every
  `lib/server/*.ts` and `app/api/**/route.ts` module imports without throwing. RSC
  `page.tsx` trees are excluded from the smoke test (browser-only libs touch `window` at
  module scope). Deeper coverage is an open decision (queue "Gaps" item 4).
- **New pure logic — especially anything touching auth — gets a test in the same session.**
- **`npm run lint` must stay at 0 errors *and* 0 warnings.** The script runs
  `eslint --max-warnings 0` (S7), so CI now fails on any warning too — the three residual
  `react-hooks/exhaustive-deps` warnings were resolved in S7 by memoizing each `load`
  path. Don't reintroduce a bare dependency array on a mount effect that calls a
  render-created function.

## Security rules — check at Gate 1 of every session
These exist because a 2026-07-31 audit found a static, non-expiring admin session cookie
that had been live since the auth was written, and a plaintext password fallback silently
in use in production. **Both are now fixed (S1, archive §S1)** — the rules below are what
keeps them fixed.

**Current auth state (S1, shipped 2026-08-01):**
- Login verifies a **scrypt hash** (`ADMIN_PASSWORD_HASH`). The plaintext `ADMIN_PASSWORD`
  fallback is **deleted** — do not reintroduce it as a convenience.
- Session cookie is `v1.<issuedAtMs>.<nonce>`, HMAC-signed, **2-day TTL** enforced
  server-side (`lib/auth/session-token.ts`). Tokens are stateless: logout clears the
  browser copy but cannot revoke a token before it expires — that is why the TTL is short.
- Login is rate-limited via `lib/server/request-guards.ts` (Mongo-backed, collection
  `request_guards`).
- A full **Content-Security-Policy** ships in `next.config.ts`, dev/prod aware
  (`'unsafe-eval'` and ws: are dev-only). Allowlist is deliberately narrow: images from
  `res.cloudinary.com`, frames from the Cloudinary upload widget and
  `www.openstreetmap.org`, `frame-ancestors 'none'`.

**Standing rules:**
- **Never invent auth.** Session tokens carry an issue timestamp inside the signed
  payload and are verified for age server-side. Cookie `maxAge` is a browser hint, not
  enforcement — never rely on it alone.
- **Secrets never get a `NEXT_PUBLIC_` prefix.** That prefix compiles the value into the
  browser bundle. Only genuinely public identifiers (Cloudinary cloud name, site URL).
- **Auth constants live in exactly one place** — `lib/auth/session-token.ts`. It must stay
  runtime-agnostic (no `node:crypto`, no `next/headers`, no DB) because `proxy.ts` runs in
  the Edge runtime and imports it. Adding a Node-only import there breaks admin auth at
  the middleware layer.
- **Compare secrets in constant time** — `safeEqual` (any runtime) or
  `crypto.timingSafeEqual` (Node). Never `===` on a signature or password.
- **Every new public API route needs rate limiting** (`lib/server/request-guards.ts`) and
  input validation before it ships. Follow the existing testimonials/inquiries routes.
- **No `dangerouslySetInnerHTML`, no `eval`, no `new Function`.** Currently zero in the
  repo — keep it that way.
- **Never commit `.env*`.** Verified gitignored. If a secret is ever exposed, rotating it
  is mandatory, not optional — the leaked value stays valid until rotated.
- **CSP `frame-src` in `next.config.ts` legitimately carries `www.openstreetmap.org`** —
  the testimonials location map is an OSM embed iframe. S1's CSP omitted it and silently
  broke the map (found in S6, archive §S6). Do not strip it in a future security pass;
  any new external iframe/CDN needs its origin added to the right CSP directive **and**
  an in-browser check that the surface still renders.

**Gate 1 must explicitly answer, in one line each, whenever a session touches auth,
API routes, cookies, env vars, or user input:** does this add a new trust boundary? does
any secret cross into client code? is any new input validated and rate-limited? If the
session touches none of those, say "no security surface" and move on.

## Design tokens
- Colors: OKLCH tokens in globals.css. Use variables, never hardcode hex. (The old
  HomeHero raw-hex violation is resolved — verified 2026-07-31, zero hardcoded hex in
  app/ and components/ outside components/ui/.)
- Radius: **DECIDED 2026-08-17 — the de-facto scale is codified.** The old wording here
  ("83 arbitrary uses, `rounded-[2rem]` ×47, incl. `PortfolioCard.tsx`") was wrong on all
  three counts. The measured census — **public surfaces only: `app/` + `components/`,
  excluding `app/admin/`, `components/admin/` and `components/ui/`** — is **192 `rounded-*`
  instances over 14 distinct values**, and `PortfolioCard.tsx:26` is `rounded-[2.25rem]`.
  `components/ui/` holds untouched shadcn primitives and is deliberately out of scope; do
  not "fix" radii in there.

  **The scale is five values. Use one of these and nothing else:**

  | Token | Count today | Use for |
  |---|---|---|
  | `rounded-full` | 61 | every action, chip, pill, avatar |
  | `rounded-xl` | 41 | inputs, small controls, thumbnails |
  | `rounded-2xl` | 32 | inner cards, media tiles, modals |
  | `rounded-[2rem]` | 18 | panels (`.premium-panel`), sticky bars, large surfaces |
  | `rounded-[2.25rem]` | 4 | full-bleed work cards only (`PortfolioCard`) |

  Those five already cover **156 of 192** uses. The remaining **36 uses across nine
  values** get converted in D13: `rounded-[1.5rem]` ×9 → `[2rem]`, `rounded-[1.25rem]` ×8 →
  `2xl`, `rounded-lg` ×8 → `xl` (a 4px difference, invisible), `rounded-3xl` ×3 → `[2rem]`,
  `rounded-[1rem]` ×2, `rounded-[0.85rem]` ×2, `rounded-[1.75rem]` ×2, `rounded-[1.2rem]` ×1,
  `rounded-[0.95rem]` ×1 → nearest token. Most sit in `components/testimonials/` and
  `components/site/Navbar.tsx`. Reject any new value in review.
- Section container: use `.section-shell` (`mx-auto max-w-6xl px-4`) — never write it
  inline. Adopted sitewide in F4. Three intentional exceptions keep their own width:
  `contact/page.tsx` (max-w-4xl), `g/[slug]/GalleryPasswordForm.tsx` (max-w-xl),
  `testimonials/page.tsx` (max-w-7xl).

## Tag taxonomy & discipline subpages — T1 + T2 shipped 2026-08-19
`media.tags` is now a validated **slug array** drawn from the `media_tags` taxonomy (T1).
The old comma-separated free-text field and `toList()` are gone; the media form uses a
multi-select (`app/admin/(protected)/media/components/TagMultiSelect.tsx`) that picks slugs
from the taxonomy and can create a tag inline via `POST /api/media-tags`. Server-side
`asStringArray` still stores whatever slug array it's given — validation of the *slugs
themselves* now lives in the taxonomy, not the media route.

**Collection `media_tags`** `{ label, slug, description, isActive, order, createdAt,
updatedAt }`, modelled on `service_categories`:
- `slug` lowercase `[a-z0-9-]`, unique. `label` is what a visitor sees. Validation +
  reserved-slug logic live once in `lib/server/media-tags.ts` (`slugifyTag`,
  `isValidTagSlug`, `isReservedTagSlug`) — shared by the API and the client picker.
  `TAG_DISCIPLINES` / `TagDiscipline` remain there **only as the 5-discipline category
  union type**, not a per-tag field.
- **The per-tag `disciplines[]` field was removed in T2 (2026-08-19).** It used to gate
  which discipline pages got a subpage; that gate is gone — a tag earns a subpage/chip
  purely from **media presence** (any active tag on ≥1 public item in that discipline).
  The `sanitizeDisciplines` helper and the `/admin/tags` disciplines picker are deleted.
  Existing docs may still carry a stale `disciplines` field — ignored, no migration.
- **Reserved slug `videos`** is rejected (collides with the static `/videography/videos`
  segment), same shape as `others` for service categories.

**API** `app/api/media-tags/route.ts` + `[id]/route.ts` (the `[id]` preamble uses
`app/api/_lib/admin-route.ts`):
- `GET` — **public: rate-limited (60/60s), active-only, no counts.** `?scope=admin` is
  admin-gated and returns all tags + live media counts (drives `/admin/tags`).
- `POST`/`PATCH`/`DELETE` — admin-gated. Rename **cascades** to `media.tags` via arrayFilters;
  delete is **blocked while referenced** (`TAG_IN_USE` + count) unless `?detach=1`, which
  `$pull`s the slug from every media doc first.

**Admin `/admin/tags`** (sidebar, between Media and People) — list + create/edit/delete,
per-tag live media count, dnd-kit reorder. No disciplines picker (removed in T2).
Deactivating hides the tag's subpage + chips but leaves it on media.

**Discipline subpages (T2, shipped 2026-08-19):** `app/photography/[tag]/page.tsx` +
`app/videography/[tag]/page.tsx`, mirroring `/people/[slug]` (`revalidate = 300`,
`generateMetadata` + `notFound()`). Assembled by `lib/server/tag-pages.ts`
(`getTagPage`, `getTagMeta`, `getDisciplineTagNav`) over `getMediaByTag`
(`lib/server/public-media.ts`, reuses `buildPublicMediaQuery`) and the taxonomy reads in
`lib/server/public-media-tags.ts` (`getPublicMediaTag`, `getDisciplineTags`).
- **Validity:** `notFound()` only when the tag slug is unknown/inactive. A known tag with
  **zero** public items renders the full page with a "No matches." panel — **not a 404**
  (Hussain's call). There is **no minimum-count threshold** (the §T2 spec's default-3 was
  dropped).
- **Header** from `page_seo` slugs `photography-tag` / `videography-tag` (a `{tag}` token
  replaced with the tag label, like `people-detail`'s `{name}`); description from
  `media_tags.description` else the SEO template. Both slugs are editable in `/admin/pages`
  as `seoDetailPage` rows. **No new `page_sections` slug** — subpages reuse the parent's
  `stickyCta`.
- **Tag navigation** = `components/media/TagChipRow.tsx` (client): a compact, boxed,
  sideways-scrolling chip row, most-used-first, that **replaces** the in-viewer filter
  chips on the parent Photography/Videography pages and appears on the subpages (current
  tag highlighted). It carries `data-lenis-prevent` + `touch-action: pan-x` so it scrolls
  under Lenis on wheel/trackpad/touch. `/people` and other `MediaGrid` uses keep their
  normal filter chips. The viewers take `lockedTag` (scopes search to the tag, hides the
  filter chips) + `tagLinks` (makes tags in the `MediaLightbox` detail panel link to their
  subpage).
- **Revalidation** — `app/api/_lib/revalidate.ts` (`revalidateMediaSurfaces(tagSlugs)`)
  derives the `/photography/[slug]` + `/videography/[slug]` paths from the saved doc's tags
  (old + new on an edit), called by media `create`/`[id]`; the `media-tags` routes
  revalidate `/photography` + `/videography` `"layout"`, which cascades to their `[tag]`
  children. Paths are never hardcoded (avoids the §S9 bug).

**No migration.** Hussain's call, 2026-08-17: existing media is deleted and re-entered
through the new form. A surviving legacy free-text value simply matches nothing — intentional.

Facts a session must not re-derive:
- The compound index `{ tags: 1, isPublic: 1, createdAt: -1 }` on `media`
  (`scripts/ensure-indexes.mjs:65`) already fits the tag-page query. T1 added only the three
  `media_tags` indexes (`{slug:1}` unique, `{order:1,createdAt:-1}`, `{isActive:1,order:1}`).
  **Do not add another `media` index.**
- `/api/media/list-public` supports `?tag=` as an **exact** match, slug===slug — powers the
  subpage "Load more". Public chips still render the **slug** as label text; subpage nav
  chips (`TagChipRow`) render the real **label**.
- `/photography` has no child segments — the only collision under `/videography` is the
  static `videos/` segment, which the reserved `videos` slug protects.

## Known defects — logged, each owns a session
Do not "discover" these again; do not fix them outside their session.

| Defect | Evidence | Session |
|---|---|---|
| `/web-development` is fully static and is missing from `AFFECTED_PATHS`, so deactivating it never revalidates | `app/api/admin/page-settings/[slug]/route.ts:53` | §S9 |
| Admin login rate limiter keys on `ip\|userAgent`, so a UA change resets the lockout | `app/admin/page.tsx:32-34` | §S10 |
| Public form fields are interpolated raw into notification email HTML | `lib/server/email.ts:19-29,45-55` | §S10 |
| `/admin/pages` has no unsaved-work guard anywhere in the repo | zero `beforeunload` matches repo-wide | §S11 |
| A partly-failed `/admin/pages` save commits some PATCHes and reports only "Failed to save" | `usePagesAdmin.ts:207-269` | §S11 |
| `SiteFooter` + `CustomCursor` render on every admin route | `app/layout.tsx:30,32` | §N9 |
| `POST /api/testimonials/reorder` is fully built and called from nowhere; testimonials cannot be reordered | `app/api/testimonials/reorder/route.ts` | §D9b |
| Public media search has no supporting index; `ensure-indexes.mjs` creates a dead `{status:1}` index and misses `approvedAt` | `ensure-indexes.mjs:89,90` | §P1 |
| N+1 query on `/people` (one `media.find()` per person) | `lib/server/public-people.ts:76-114` | §P1 |
| `SmartMediaPreview`'s default empty state is a gradient, violating the no-gradient rule | `SmartMediaPreview.tsx:32,93` | §D13 |
| `page_seo.title` / `.headerTitle` silently revert to defaults when blanked, unlike every other field in the same form | `lib/server/page-seo.ts:144,146-149` | §D13 |
| Dead, drifted `toPublicTestimonial` in `testimonial-serializers.ts` (nothing imports it) | `lib/server/testimonial-serializers.ts:3-17,39-57` | §D13 |
| `README.md` is unedited create-next-app boilerplate telling the reader to deploy on Vercel | `README.md:32-36` | §L1 |

## Design & motion skills — which to load, when
Installed in Session DS0 (install commands: archive §DS0). **Load per task, never all at
once.** Several design skills firing together bloat context and blur each other's
direction. Name the skill explicitly in the session prompt so the right one fires.

| Task | Skill | Source |
|---|---|---|
| Any new UI, or reshaping a page | `frontend-design` | anthropics/skills — the upstream reference |
| Auditing/fixing an existing page's design | `redesign-existing-projects` | Leonxlnx/taste-skill |
| Deterministic anti-pattern scan (no LLM) | `npx impeccable detect` | pbakaus/impeccable — see DS1 |
| **Building a motion spec / animation from decisions at Gate 1** | `animate` | emilkowalski/skills |
| Naming an effect you can describe but not name ("the bouncy popover thing" → term) | `animation-vocabulary` | emilkowalski/skills |
| Reviewing motion that already exists | `review-animations` | emilkowalski/skills |
| Deciding **where** motion belongs (and where not) | `find-animation-opportunities` | emilkowalski/skills |
| Auditing all animations → prioritised fix plans | `improve-animations` | emilkowalski/skills |
| Spring/gesture feel, physical motion, translucent materials | `apple-design` | emilkowalski/skills |
| UI-polish philosophy, component-design decisions | `emil-design-eng` | emilkowalski/skills |
| Exploring several UI variants before committing | `prototype` | emilkowalski/skills |
| Choosing a library instead of hand-rolling | `pick-ui-library` | emilkowalski/skills |

**Mapping correction (DS0, 2026-08-06):** the Gate-1 "write a precise motion spec" step
is **`animate`**, not `animation-vocabulary`. The installed `animation-vocabulary` is only
a reverse-lookup glossary (turns a described effect into its exact term); it does not spec
durations/easings/choreography. D4/D5/D8 Gate-1 specs should load `animate`.

**Impeccable detector — URL-only on this codebase (DS1, 2026-08-06):** `npx impeccable
detect app/ components/` is **inert** here. On non-HTML files (TSX/CSS) the detector falls
back to regex matching — a tiny rule subset — and this repo has no static HTML, so a source
scan returns ~0 real findings. The full 59-rule set (contrast, layout, type hierarchy,
occlusion) runs **only against rendered URLs** via Puppeteer. Correct invocation, dev server
up: `npx impeccable detect http://localhost:3000/<page> --json`. Consequences: **the
edit-time hook DS2 would have installed is worthless** (fires on TSX saves → regex-empty,
can't scan a URL on save) — so DS2 was re-scoped to *not* install it. DS1's 259 URL findings
triaged to ~5 Real (all in shared components: `SiteFooter`/`StickyCta` glass-text contrast,
`WorkOverlay` 9px labels, a `width/height` transition, 3 nested-cards, long line-lengths) →
folded into **D13**. Full triage: archive §DS1.

**Install layout (DS0):** `npx skills` (v1.5.x) writes real skill files to `.agents/skills/`
and symlinks them into `.claude/skills/`; `skills-lock.json` at repo root is its manifest.
`frontend-design` is a manual copy (real dir in `.claude/skills/`, no symlink). No installer
added a hook or any script — every skill is `.md`-only. Emil's set ships 3 skills beyond the
motion core (`animate`, `apple-design`, `emil-design-eng`) — kept, mapped above.

**Why the motion skills matter here:** every remaining design session (D4 transitions,
D5 cursor, D6 globe, D8 magnetic buttons) is motion work. `prototype` exists to make
exploration cheap — the D3 cylinder took four rejected geometries before landing
(archive §D3); variants-behind-a-switcher is how that cost drops.

### Skill conflicts — this project wins, always
Third-party skills encode *their* authors' taste. Where they disagree with a decision
recorded in this file, **CLAUDE.md wins.** Known conflicts, do not silently "fix" these:

- **taste-skill v2 bans em-dashes.** The `hm-visuals-voice` skill *prescribes* them as a
  core rhythm device ("Atmosphere. Precision. — built with restraint"). Brand voice wins
  for all public copy. The ban may apply to UI microcopy only — decide per case, never
  rewrite brand copy to satisfy it.
- **Impeccable bans bounce/elastic easing as dated.** D5 specs spring overshoot on the
  cursor; D4 specs GSAP elastic wave physics for the Dancing transition. Both deliberate.
  Add to `detector.ignoreRules` with a reason rather than removing the motion.
- **Impeccable/taste-skill may suggest gradients, eyebrows, or card-in-card.** All three
  are banned here (see "What is NOT in the design" and "Reusable components").
- **taste-skill v2 is marked experimental.** If it misbehaves, pin
  `design-taste-frontend-v1` instead.
- Deliberately **not installed:** `ui-ux-pro-max`. It generates a design system from
  industry templates (161 product types → preset palette/type). This project already has
  a documented design language and OKLCH tokens; template selection is the opposite of
  the target. Do not add it.

## Claude tooling for this project
- **Claude Code Desktop (Code tab):** all development sessions. Triggered by "Continue queue".
- **Cowork:** copy writing (always hm-visuals-voice skill), docs/queue maintenance,
  audits, research.
- **Claude Design project:** design decisions and mockups before building.
- **claude.ai planning sessions:** planning, architecture, full-repo audits — corrections
  land in this file and SESSION-QUEUE.md, then get executed via "Continue queue".

## Queue protocol — triggered by exactly "Continue queue"
1. Read SESSION-QUEUE.md at project root.
2. Find next session with status `pending`.
3. Set status to `in-progress` in SESSION-QUEUE.md immediately.
4. Run 3-gate cycle:

### Gate 1 — Plan
Read every file connected to the task.
Report every affected file and what could break.
Present complete plan with specific file names and changes.
STOP. Write no code until Hussain confirms yes.

### Gate 2 — Execute
Make all changes per approved plan.
Follow all coding rules and file output rules.
Tell Hussain: which URL to open, what to click, what should appear, what to watch.
STOP. Wait for confirmation everything works.
If errors: diagnose root cause, fix, repeat. Do not proceed to Gate 3 until Hussain explicitly confirms working.

### Gate 3 — Commit
Re-read this session's task list against what was actually changed — confirm every item
was completed, not just attempted, before marking done.

**Doc sync — do this before writing the git commands.** Ask explicitly: did this session
change a rule, a constraint, an architectural fact, or a decision recorded in CLAUDE.md?
If yes, update CLAUDE.md **in the same commit as the code**. Docs that drift from the
code are how the site ended up contradicting its own design rules. If nothing changed,
say "no CLAUDE.md impact" and move on. Things that always require an update: auth or
session behaviour, CSP/allowlist changes, the image pipeline, new or removed shared
components, any reversal of a previous decision.

Provide exact git commands — **two commits, in this order.**

1. Source + docs (one commit):
```
git add [exact files changed]        # include CLAUDE.md / SESSION-QUEUE.md / SESSION-ARCHIVE.md
git commit -m "[type(scope): specific description]"
```

2. Knowledge graph (separate commit, because `graphify update` rewrites `graphify-out/`
   and mixing it with source makes the real diff unreadable):
```
graphify update .
git add graphify-out
git commit -m "chore(graph): update knowledge graph after [session id]"
```

3. Push both:
```
git push
```

**Use a different message for the graph commit** — identical messages on both is why
`git log` currently reads as duplicated commits.

STOP. Wait for Hussain to confirm push is done.
When confirmed: set session status to `done` in SESSION-QUEUE.md **and, in the same
edit, move the session's entire section (spec + outcome notes, verbatim) from
SESSION-QUEUE.md to SESSION-ARCHIVE.md** — this is automatic, not a separate request.
Print exactly this line and stop:
  Session [N] done. Open a new Code tab, open the portfolio folder, and paste: Continue queue

## File output rule
Single file changes: output complete replacement file for manual review.
Multi-file changes (3 or more): edit directly, report what changed.
Never output partial files or snippets.

## Commit message format
feat(scope): what was added
refactor(scope): what was restructured
fix(scope): what was corrected
Good: "feat(preloader): GSAP icon sequence with Hussain.Art reveal"
Bad: "fix bugs" / "update files"

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
