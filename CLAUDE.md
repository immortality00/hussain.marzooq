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

**Deployment status — NOT DEPLOYED (confirmed L1, 2026-08-20).** There is *no Netlify env
and no deployed build of this rebuild*; hussain-marzooq.com still serves the previous
landing page. This is unchanged from S1 (2026-08-01, archive §S1). Do not read this as
"live" — the earlier unqualified "Live on Netlify" wording was read both ways by different
sessions and is deleted for good. **Re-confirm this at Gate 1 of any launch-prep session
and, the moment the rebuild is actually deployed, flip this line in the same commit.**

At first deploy, run the L1 deploy-time checklist (queue §L1), which is not code and cannot
be done from a session: (1) set `ADMIN_PASSWORD_HASH` + `ADMIN_COOKIE_SECRET` (+ Mongo/
Cloudinary/Resend) in the Netlify env, rotating `ADMIN_COOKIE_SECRET` — rotation invalidates
every existing session token by design; (2) verify hash login against the deployed build
(no plaintext `ADMIN_PASSWORD` — the fallback was deleted in S1 and stays deleted); (3)
re-verify the full CSP in a browser on the live origin (Cloudinary images/video, upload
widget, the `/testimonials` OpenStreetMap embed, the globe texture from `/public/globe/`);
(4) confirm `/admin/*` returns `no-store` + `noindex`; (5) set `NEXT_PUBLIC_SITE_URL` to the
live origin so OG/share-preview image URLs resolve absolute (feeds `metadataBase` — C2; unset,
they point at localhost); (6) set `NEXT_PUBLIC_GOATCOUNTER_CODE` (the GoatCounter
site code) and `GOATCOUNTER_API_TOKEN` (a read-statistics API key) so the tracking tag renders
and the `/admin/analytics` dashboard populates (C3; unset, no analytics load + admin shows a
"not configured" panel). The code side of L1 (README rewrite, admin config-error copy, this
section) shipped 2026-08-20.

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
MongoDB Atlas, Cloudinary, Resend
Deployed on **Netlify** — not Vercel.
shadcn/ui new-york at components/ui/ · Three.js · react-globe.gl · GSAP + @gsap/react +
ScrollTrigger · Framer Motion · Lenis · react-markdown + remark-gfm (blog content, C1 —
renders to React elements, no dangerouslySetInnerHTML)

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
unchanged. Cormorant Garamond stays preloader-only, and since L6 it is loaded via
`next/font/local` from a self-hosted woff2 in `app/fonts/` — **not** `next/font/google`,
which fetched the face from Google Fonts at build time and made CI's `npm run build` fail
intermittently. Do not reintroduce `next/font/google`, and do not add a webfont.

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

**Homepage sticky CTA reveals on scroll (D8).** `StickyCta` takes `revealOnScroll` — the
homepage passes it so the bar stays parked off-screen (below the bottom edge, opacity 0,
`pointer-events:none`) while the hero is in view and **slides up** once `window.scrollY > 40`,
re-hiding at the top. Every other page leaves it default (always visible, no slide). This is the
only page where the CTA must not cover the full-bleed hero.
**Tailwind v4 gotcha (do not regress):** the slide MUST be `transition-[translate,opacity]`, not
`transition-[transform,...]`. In Tailwind v4 `translate-y-*` sets the **independent `translate`
CSS property**, not `transform` — so a `transform` transition leaves the position un-animated and
the bar *pops* instead of sliding (the D8 bug). The magnetic hook (`useMagneticHover`) drives the
same `translate` property for the same reason.

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
  mockup: *"remove these and stop adding these stupid comments."* **D13 removed the last two
  offenders — `SiteFooter`'s `.eyebrow` lockup and WorkOverlay's `text-[9px]` discipline
  sublabel — and deleted the now-unused `.eyebrow` class from `globals.css`.** There is no
  `.eyebrow` class any more; do not reintroduce it.
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
  **Overlay motion (D13, `WorkOverlay.tsx`): a symmetric front-facing ARC + gentle sine
  SWAY, matching the photography cylinder's `isFew` (≤5) branch — NOT a full-spin cylinder.**
  The overlay never holds more than 5 cards, so it is always in the "few" regime: cards fan
  around the front (`θ = (i-(count-1)/2)·ARC_SPACING`, edges touching via the apothem
  radius), the container sways within `±((count-1)/2)·ARC_SPACING` so each end card rocks to
  front and **nothing ever rotates into empty space** (this fixed the deactivated-card gap),
  drag is clamped to the same arc, and a responsive `scale()` keeps the fan on-screen at any
  width. Do not revert to the arc-length `getCylinderRadius`/full-360°-spin — few cards on a
  full circle is exactly what left the empty gaps. Tunables: `ARC_SPACING`, `SWAY_DURATION`,
  `CARD_W`/`CARD_H`.
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

## Page transitions — one site-wide gallery move (D4, complete 2026-08-27)
**There is ONE transition and it plays on every internal navigation, site-wide** — a
contact-sheet gallery: an 8×5 grid of real photos that staggers in, holds covering the
screen until the destination commits, then staggers out. **The six bespoke per-route
transitions were built, rejected by Hussain on sight, and reverted** — each sliced a single
image, which is the approach he had already rejected (see the `ContactSheetTransition` note).
Do **not** revive per-route transitions; there is no registry, no variant system, no
`three`-in-transitions. D4 is complete.

**The engine** lives in `components/transitions/`:
- `TransitionContext.tsx` — `TransitionProvider` (mounted in `AppShell`, public branch only,
  wrapping `children` + the footer; takes an `images` prop) exposes `usePageTransition()` →
  `navigate(href, imageUrl?)`. It plays on **every page** now (the old `pathname === "/"`
  gate is gone). Under `prefers-reduced-motion` it's a quick fade. Honors reduced-motion.
- **Site-wide trigger:** the provider installs a **document capture-phase click interceptor**
  that catches every same-origin internal `<a>` click and routes it through `navigate()`.
  It skips modifier/middle clicks, `target="_blank"`, `download`, external `rel`, `/admin/*`,
  same-path links, and anything marked `data-no-transition`. This is why `PortfolioCard` no
  longer needs its own click handler — it's a plain presentational card again.
- **Image source is a single consistent server pool, NOT the current page's DOM.**
  `getTransitionImages()` (`lib/server/public-media.ts`, `unstable_cache` 300s, **fail-safe →
  `[]`**) returns 24 recent public photos sized down through the Cloudinary loader; the root
  `layout.tsx` fetches it and passes it `AppShell → TransitionProvider images`. Using one pool
  everywhere is what makes the transition read identically on every page — the earlier
  per-page `main img` collection gave sparse pages a same-image grid or no animation (the bug
  Hussain reported). `collectImagePool(main img)` remains only as a fallback when the server
  pool is empty. **Because the pool is fetched in the root layout, `getTransitionImages` must
  never throw — keep the try/catch that returns `[]`, or a failed query breaks every page.**
  **The pool is deduped and, when it holds fewer than 2 distinct photos, `navigate()` plays
  the quick fade instead of the contact sheet (P1)** — a 1-image pool would fill all 40 cells
  with the same photo, which reads as broken. The server pool only draws `type:"image"` media,
  so a library that is still mostly video/NFT (or mid-hand-entry) yields a sparse pool; the
  fade guard keeps that from ever rendering an all-identical grid. Do not remove the `< 2` guard.
- `ContactSheetTransition.tsx` + `contactSheet.ts` (pure, unit-tested) — the grid: 8×5 cells
  drawn from the pool (shuffled — NOT one image sliced; **that was rejected, twice**). Cells
  **hold covering the screen until the destination route commits** (watched via `usePathname`,
  2.5s safety cap), then stagger out. Do not clear the cells on a fixed timer.
- Motion tokens: `.hm-cell-in`/`.hm-cell-out` keyframes in `globals.css`, repo easing
  `cubic-bezier(0.2, 0.7, 0.2, 1)`, ~460ms/cell + ~440ms stagger.

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

## People page — privacy system (D12, shipped 2026-08-28)
Three visibility states per person, set in `/admin/people` via a **Visibility control** that
replaced the old lone "Public profile" checkbox, mapping to two booleans on `people_profiles`:
- **Public** (`isPublic:true, isPrivate:false`) — listed on `/people`, content open.
- **Password-protected** (`isPublic:true, isPrivate:true` + `passwordHash`) — **hidden from the
  index and every public surface**; `/people/[slug]` shows a password prompt; the correct password
  sets a signed httpOnly cookie and reveals the media. A gated person with **no** password shows
  **"Content not available."** (a real message, not a 404).
- **Hidden** (`isPublic:false`) — not listed, direct URL 404s (the pre-D12 hard-hide, kept).

`getPersonPageBySlug` (`lib/server/public-people.ts`) is the state machine
(`missing | locked | unavailable | open`); the index query and `getPublicPersonBySlug` both exclude
`isPrivate:true`. The authenticated (unlocked) path shows the person's media **including hidden ones**
(`buildPersonDetail(..., includeHidden=true)`), so a removed person's own page still shows everything
once the password is entered.

**Password gate primitives live in `lib/password-gate.ts`** (generic scrypt `hashPassword`/
`verifyPassword`, `makeAccessToken`, HMAC cookie sign/verify, `getPersonGateSecret` →
`PERSON_GATE_COOKIE_SECRET` else `ADMIN_COOKIE_SECRET`). Cookie name `hm_person_<id>`, value
`v1.<accessToken>.<hmac>`. **Changing the password rotates `accessToken`, which invalidates every
existing access cookie — keep that rotation** (both the edit PATCH and removal-approve do it). Public
unlock: `POST /api/people/access` (rate-limited, `person-access` bucket, constant-time verify). The
private-gallery gate (`lib/private-galleries.ts`) is a **separate, deliberately untouched copy** — do
not fold it onto `password-gate.ts`; its signed payload differs and rewriting it would invalidate live
gallery cookies (a future D13 dedupe at most).

**Removal flow.** A visitor on an open profile submits a request (`components/people/RemovalRequestButton.tsx`
→ `POST /api/people/removal-request`, rate-limited; **email + message are required**). A request for an
already-gated/hidden profile is rejected ("already private or hidden"). Admin reviews at
`/admin/removal-requests` (**relinked** under the People nav group — the D9b stub is fully rebuilt into
`RemovalRequestsClient`). **Approving requires setting a password inline** (`POST /api/people/[id]/removal`,
action `approve`): the profile flips to Password-protected + off the index, its `accessToken` rotates,
and **every currently-public linked media is hidden** (`isPublic:false` + a `removalHiddenBy:[personId]`
marker). **Setting the profile back to Public re-publishes each linked private media unless another
linked person is still gated** — the republish is marker-independent (it re-derives gating from the live
person docs, so it also restores media hidden before the marker existed). Dismiss just clears the request.

**Audit trail.** Every request and decision is logged in the **`removal_requests`** collection
(`{personId, personName, slug, email, reason, status: pending|approved|dismissed, createdAt, decidedAt}`);
`/admin/removal-requests` shows a Pending queue + a read-only History. Reads in
`lib/server/removal-requests.ts`; indexes in `ensure-indexes.mjs` (`removal_requests` +
`people_profiles.removalRequestedAt`).

**Media ↔ gated-person rule.** A media linked to any hidden/private person **cannot be public**:
`resolvePeopleSelection` (`app/api/_lib/media.ts`) now reports a `gatedPersonName`, and both
`media/create` and `media/[id]` **force `isPublic:false`** when one is present (closes the "attach a
hidden profile → media still public" leak). The media editor's People section shows an amber note
naming the gated profile(s).

**Admin notifications.** The dashboard "Needs attention" band gained a **Removal requests** row, and the
sidebar's **Dashboard** link shows a red badge = total pending (testimonials to review + new inquiries +
removal requests), computed by `getAdminNotificationCount()` in the protected layout.

**No CSP change; no new remote host.** New trust boundaries are the two public routes (`access`,
`removal-request`) — both validated + rate-limited; `passwordHash` is never serialized (admin GET returns
only a `hasPassword` boolean).

## Dancing page — shipped (D10, 2026-08-28)
`app/dancing/page.tsx` = `PageHeader` (admin `page_seo` title/description) → an
admin-driven Instagram embed section → `StickyCta`. **The old interim text-card grid is
gone** (Hussain's call — the page is Instagram-centric). **Stats were dropped**, not built:
the queue listed "years teaching / students / location" but CLAUDE.md bans stat strips and
that ban wins.

- **Data:** `DancingSections` is now `{ instagram: { heading, urls[] }, stickyCta }`
  (`lib/server/page-sections.ts`); the old `sections: TextCard[]` is removed. Shallow-merge
  keeps a stored doc safe (a stale `sections` key is ignored) — no migration. On first save
  from the new form the old card images get cleaned up by the existing replace-diff (correct).
- **Admin:** `/admin/pages/dancing` → `DancingSectionsForm` (heading + a "+ Add post" URL
  list via the generic `RepeatingListEditor<string>` + the shared CTA editor). Admin pastes
  Instagram **post or reel** URLs.
- **Embeds render natively — do NOT reintroduce the clip hack.** The build first tried to
  strip Instagram's chrome by forcing the cross-origin `/embed` iframe into a square box with
  negative offsets; it distorted every post (you cannot reach into a cross-origin iframe to
  isolate the media). The shipped `components/dancing/InstagramFeed.tsx` renders the normal
  embed and **auto-sizes each card by listening for Instagram's own `MEASURE` postMessage**
  (origin-checked to `https://www.instagram.com`) — no cropping, no fixed height, no embed.js
  script. Invalid URLs are dropped; empty list → the whole section renders nothing.
- **`lib/instagram.ts`** `toInstagramEmbedUrl()` (unit-tested, `test/instagram.test.ts`) is the
  only URL→embed parser: accepts `instagram.com/p/…` and `/reel/…` only, rejects lookalike
  hosts. No API key, no Graph API, no token.
- Extracted `CtaFields` (the booking-bar editor) — now shared by `CtaOnlyForm`, `CardsCtaForm`,
  and `DancingSectionsForm`; `RepeatingListEditor` gained an optional `addLabel` prop.

## Web development page (D11, shipped 2026-08-29)
**Dancing-style link list, not a project database.** Hussain rescoped the original §D11 spec
on sight (no `web_projects` collection, no `/admin/web-projects` CRUD, no capabilities cards,
no image uploads): `app/web-development/page.tsx` = `PageHeader` → a `border-t` **Projects**
section (heading + a grid of preview cards) → `StickyCta`. Keeps the `isActive` redirect.

- **Data:** `WebDevSections` is now `{ projects: { heading, urls: string[] }, stickyCta }`
  (`lib/server/page-sections.ts`) — the old `capabilities: TextCard[]` is gone. Admin pastes
  **one project URL per row** at `/admin/pages/web-development` via `WebDevSectionsForm`
  (heading + `RepeatingListEditor<string>` + shared `CtaFields`), mirroring `DancingSectionsForm`;
  `SectionsGroup.tsx` routes the `web-development` slug to it. **No migration** — shallow-merge
  ignores a stale `capabilities` key, and its uploaded images are cleaned on the next save by
  the existing section-image diff. Consumers read `projects.urls ?? []` (a stored doc written
  under the pre-D11 shape has no `urls` until re-saved).
- **The card renders the website's own screenshot — admin does NOT upload an image**
  (Hussain: "the website itself render a photo"). `components/web-development/WebProjectCard.tsx`
  is a link-out card (external `<a target="_blank" rel="noopener noreferrer">`, `data-no-transition`)
  showing a 16:10 screenshot + hostname label + "Visit site ↗". **Do not add an image-picker
  here** and do not re-inflate the item shape to `{url, image}` — that was built, rejected, and
  reverted.
- **Screenshots come through a same-origin proxy, so there is NO CSP change.**
  `app/api/web-projects/preview/route.ts` (public, rate-limited `web-project-preview` 60/60s,
  validates `?url=` via `toProjectUrl`) fetches a screenshot **server-side from thum.io**
  (`https://image.thum.io/get/width/1200/crop/900/noanimate/<url>`) and streams the image bytes
  back with `Cache-Control public, max-age=3600, s-maxage=86400`. Because the image is served
  from our own origin, `img-src 'self'` already covers it — **do not add thum.io to the CSP**.
  The only host the route fetches is `image.thum.io` (the target URL is a path segment, never
  fetched directly) so there is **no SSRF to internal hosts**. The card's `<img src>` carries a
  `&v=N` version tag — bump it to force every cached screenshot to refresh (used once to bust a
  stale placeholder). thum.io is a **free third-party dependency** and the only external service
  in this feature; the robust follow-up (not built) is to screenshot once and store it in
  Cloudinary so there is no per-view third-party call.
- **`lib/web-projects.ts`** (unit-tested, `test/web-projects.test.ts`): `toProjectUrl` (accepts a
  scheme-less domain by assuming https — "mysite.com" works; rejects `mailto:`/`javascript:`/`ftp:`
  and hostname-less input) + `projectUrlLabel` (hostname without `www.`). Invalid URLs are dropped;
  an all-invalid/empty list renders no Projects section (empty means empty).

## Blog (C1, shipped 2026-08-29)
Full blog system: two collections, admin CRUD, public `/blog` + `/blog/[slug]`.

- **Collections:** `blog_posts` `{ title, slug, excerpt, content(markdown), coverImageUrl,
  coverImagePublicId, categoryId, category(slug), tags[], author, isPublished, publishedAt,
  createdAt, updatedAt }` and `blog_categories` `{ name, slug, isActive, order, createdAt,
  updatedAt }` (modelled on `service_categories` but **no system "others"** — a post's
  category is optional, `categoryId:null`/`category:""`). Indexes in `ensure-indexes.mjs`
  (`blog_posts.slug` unique + `{isPublished,publishedAt}` + `{category,isPublished,publishedAt}`
  + `{updatedAt}`; `blog_categories.slug` unique + order/active). **No migration** — new feature.
- **Content is Markdown, rendered with `react-markdown` + `remark-gfm`** (deps added C1). It
  renders to **React elements — no `dangerouslySetInnerHTML`** (honors the ban). `components/blog/
  BlogContent.tsx` is the only renderer; styling is the `.blog-prose` block in `globals.css`
  (there is **no `@tailwindcss/typography`** — don't add it, extend `.blog-prose`). Do **not**
  switch to a WYSIWYG/HTML editor — that would reintroduce `dangerouslySetInnerHTML`.
- **API:** `api/blog` + `api/blog/[id]` (posts CRUD) and `api/blog-categories` + `[id]`
  (categories CRUD), all admin-gated via `requireAdminOr401`/`requireAdminObjectId`. Category
  **rename cascades** `category` slug onto linked posts; category **delete is blocked while
  referenced** unless `?detach=1` (nulls the posts' category). Slug helpers are reused from
  `lib/server/media-tags.ts` (`slugifyTag`/`isValidTagSlug` are generic slug utils). Cover image
  cleanup is scoped to `CLOUDINARY_BLOG_FOLDER` so library-picked covers are never deleted.
- **Public reads** `lib/server/public-blog.ts` (`getPublishedPosts(category?)`, `getPostBySlug`,
  `getPublicBlogCategories`) are **fail-safe → `[]`** (a DB blip renders the empty state, never
  throws). Published = `isPublished:true` AND `publishedAt <= now`; drafts 404 on the detail route
  and never list. `lib/reading-time.ts` (`readingMinutes`, unit-tested) drives the read-time label.
- **Public pages:** `app/blog/page.tsx` (listing + category filter via `?category=`, `BlogCard`,
  `NoResults` empty state) and `app/blog/[slug]/page.tsx` (reading layout, `generateMetadata` with
  OG = cover, `notFound()` on missing/unpublished). SEO template slug **`blog-detail`** (`{title}`
  token, like `people-detail`) added to `page-seo` + `PAGE_ROWS`. Blog's own `page_sections` is now
  **CTA-only** — `BlogSections` (the old interim `pillars` TextCards) was **deleted**; the Pages→Blog
  editor is CTA-only.
- **Admin:** sidebar "Content" group gains **Blog** (`/admin/blog` list + bulk publish/unpublish/
  delete) and **Blog Categories** (`/admin/blog-categories`, `SortableList` reorder + active toggle).
  Post editor at `/admin/blog/new` and `/admin/blog/[id]` (`BlogPostEditor`: auto-slug-from-title,
  `ImageField` cover → `CLOUDINARY_BLOG_FOLDER`, category select, freeform `TagsInput`, markdown
  field with live preview, `AdminToggle` publish; `author` defaults to "Hussain Marzooq", no UI).
- **Blog page visibility toggle lives in the Pages tab**, not `/admin/blog`. The blog `PAGE_ROW`
  carries `settingsSlug:"blog"` **plus `toggleOnly:true`** — a new `rows.ts` flag meaning "has a
  visibility toggle but no Work-overlay card image": it keeps blog in the **Main** group (not
  Disciplines), and `pageGroup`/`pageNeedsImage` both skip the card-image machinery for it (so blog
  is never a "needs image" dashboard warning). `getAllPageSettings()` now includes `"blog"` so the
  toggle has state; the page-settings PATCH route's `VALID_SLUGS` gained `"blog"`. When inactive,
  `/blog` + `/blog/[slug]` **redirect home** (via tolerant `getBlogActive()`) and the footer's Blog
  link drops (`SiteFooter` reads it from `getAllPageSettings`). Blog is not in the 6-item nav (footer
  only) — unchanged.
- **`ImageField` gained an optional `folder` prop** (default `CLOUDINARY_SECTIONS_FOLDER`,
  backward-compatible) so blog covers upload to `CLOUDINARY_BLOG_FOLDER`. **No CSP change** — covers
  are Cloudinary images already covered by `img-src`.

## Page content CMS — current system
Three collections, one admin surface at `/admin/pages` (old `/admin/seo` and
`/admin/page-sections` routes are deleted). **Since D9b the surface is per-page routes,
not modals:** `/admin/pages` is a grouped card list (Main / Disciplines / Templates) and
each page edits at its own route `/admin/pages/[key]` (`PageEditorClient` + shared
`PageEditorBody`; the old full-screen-modal `PageRowCard` is deleted). Discipline cards
carry an **inline visibility toggle** on the list that PATCHes `page-settings` immediately
(optimistic, rolls back on failure) — no need to open the page. `PAGE_ROWS` + the pure
`pageNeedsImage`/`pageGroup` helpers live in `pages/lib/rows.ts` (plain module, imported by
both server routes and the client hook — never re-export `PAGE_ROWS` through the `"use client"`
hook, that hands a server component a client-reference proxy and `.some` throws):
1. `page_settings` — visibility toggle (5 disciplines + Work-overlay `cardImage`, **plus Blog
   as a `toggleOnly` Main-group toggle with no card image** — C1, see Blog section).
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

**Revalidation (S9, 2026-08-19).** The `page-settings` discipline toggle revalidates with a
single `revalidatePath("/", "layout")` — the root layout is shared by every route, so this
cascades to all public pages at once, covering the global `SiteFooter` discipline links, each
toggled page's own `isActive` redirect, and the homepage sections. **Do not reintroduce a
hardcoded `AFFECTED_PATHS` list** — the old one drifted and left `/web-development` (and the
other discipline pages) never revalidating on toggle (the §S9 bug). When a globally-shared
layout element changes, revalidate the layout, never enumerate routes. The four previously
directive-less public pages (`about`, `blog`, `dancing`, `web-development`) now carry
`revalidate = 300`, matching every other dynamic public route.
Interim pages (Dancing, Web Development, Blog) = header + card grid + booking bar
until their design passes. **About had its design pass (D2c) and is no longer interim** —
see "About page" below. Full history: archive §N3–§N7.

## Open Graph images — shipped (C2, 2026-08-29)
The image shown when a page's link is shared (WhatsApp, X, iMessage, Slack, etc.) and the
social/search preview. **Admin-driven, empty means empty — no auto-pick.** The queue's
"pull a representative photo" was rescoped to this on the binding "empty means empty"
rule (the same rule that removed the hero's auto-pick in S4): a page's OG image is the
admin-picked `page_seo.ogImageUrl` only; empty → one site-wide branded fallback card.

- **`lib/seo/page-metadata.ts`** — `buildPublicMetadata({ title, description, image?, type? })`
  is the single builder every public `generateMetadata` routes through (all 16 blocks: home,
  the 5 disciplines, about/services/contact/people/blog/testimonials, the two `[tag]` pages,
  and the blog-post/person detail pages). It returns `openGraph` + `twitter`
  (`summary_large_image`). **It OMITS the `images` key when there is no image** — setting
  `images: undefined` counts as "specified" to Next and suppresses the file-based fallback,
  so the key must be absent for the fallback to merge. Do not reintroduce `images: undefined`.
- **`app/opengraph-image.tsx`** — the ONE branded fallback card, generated with `next/og`
  `ImageResponse` (built into Next 16, no dependency). Dark achromatic 1200×630, "HM Visuals"
  wordmark + tagline, no gradient. Next inherits it site-wide onto any route that doesn't set
  its own `openGraph.images`. Colors are inline literals (Satori can't resolve CSS tokens) —
  an accepted exception to the no-hardcoded-hex rule, same class as WebGL shader colors.
- **`app/layout.tsx`** sets `metadataBase` from `NEXT_PUBLIC_SITE_URL` (fallback
  `https://hussain-marzooq.com`) so OG/Twitter image URLs resolve absolute, plus the site
  default `openGraph`/`twitter`. **`NEXT_PUBLIC_SITE_URL` must be set at deploy** or OG URLs
  point at localhost — added to the L1 deploy checklist.
- Detail pages pass their own image: blog post → cover (`type: "article"`); person →
  `featuredImage ?? avatarUrl` (`type: "profile"`); tag pages → the `{tag}` SEO slug's image.
- **Admin:** the per-page **Share image** control in `SeoPageForm` (Search & social group) is
  the shared `ImageField` picker/upload — swapped from the old raw URL box (C2) for consistency
  with every other admin image field. `page_seo.ogImageUrl` stays a **plain URL string** (the
  picker reads/writes only `.url`; no `publicId`, so no data-model/serializer change and no
  delete-on-replace cleanup for OG uploads).
- **No CSP change** — Cloudinary is already an allowed image host and the fallback card is
  same-origin.

## Analytics — shipped (C3, 2026-08-30)
**GoatCounter** — free, hosted, cookieless — chosen over Plausible on Hussain's call
(2026-08-30): Plausible is paid SaaS and pre-launch had no value, and GoatCounter's open
JSON API lets us mirror stats **into admin**. Two halves:

**Tracking (public, one tag).** `components/site/Analytics.tsx` (`SiteAnalytics`) renders a
single `next/script` `https://gc.zgo.at/count.js` with
`data-goatcounter="https://{NEXT_PUBLIC_GOATCOUNTER_CODE}.goatcounter.com/count"`, `async`,
`afterInteractive`. Mounted **inside `AppShell`'s public branch only** — below `AppShell`'s
`if (isAdmin) return <>{children}</>` short-circuit, so it can never load on `/admin/*`
(structural guarantee, not a runtime check). No package (no `@vercel/analytics` — that's
Vercel's product, and this site is on Netlify), just the tag. `count.js` auto-tracks SPA
route changes via the History API. **No cookie banner** (GoatCounter is cookieless).

**In-admin dashboard.** `app/admin/(protected)/analytics/page.tsx` (sidebar → Overview →
Analytics) is an auth-gated server component that reads GoatCounter's API **server-side** via
`getGoatCounterStats(days=30)` (`lib/server/analytics.ts`) — total pageviews + top pages +
referrers over the last 30 days, rendered in the admin card language. Fetches
`/api/v0/stats/{total,hits,toprefs}` with a Bearer token, `next:{revalidate:300}`. The lib is
**fail-safe** (try/catch → empty; the server-module smoke test imports it, and a network blip
must never 500 the page) and reads env lazily. GoatCounter's `/stats/total` returns pageviews,
not unique visitors, so the dashboard shows **pageviews only** — no fabricated visitor count.
Pure `goatCounterPeriod(now, days)` is unit-tested (`test/analytics.test.ts`).

- **Empty means empty:** with `NEXT_PUBLIC_GOATCOUNTER_CODE` unset, `SiteAnalytics` returns
  `null` (no tag loads); with either env var unset, the admin page shows a **"not configured"**
  panel. So both stay dormant on localhost/dev until the env vars are set at deploy.
- **Two env vars:** `NEXT_PUBLIC_GOATCOUNTER_CODE` is a public identifier (the GoatCounter site
  code) — correctly `NEXT_PUBLIC_`. `GOATCOUNTER_API_TOKEN` is a **secret** (read-statistics API
  key), server-only, **never** `NEXT_PUBLIC_` — the admin page fetches server-side, so only
  rendered numbers cross to the client, never the token.
- **CSP:** `gc.zgo.at` on `script-src` (count.js), `https://*.goatcounter.com` on `img-src`
  (beacon pixel) + `connect-src` (sendBeacon fallback), in `next.config.ts`. Do not strip these
  in a security pass — without them the browser silently blocks the tracking beacon. The
  admin→API reads are server-side and **not** a CSP surface.

## Admin design
Visual consistency with the portfolio (dark theme, same typography/tokens/shadcn styling).
**D9 visual polish shipped (2026-08-28):** the protected-layout shell was restyled (quiet
active-highlighting sidebar via `AdminSidebarNav`, reversed "HM Visuals / Admin" lockup,
`--shadow-soft` frame) and every admin action button now routes through the shared
`components/admin/AdminButton.tsx` (see "Reusable components"). Admin **inputs** were left as a
later pass (deliberately out of D9's approved button scope).

**Admin mobile pass (A1, shipped 2026-09-01).** Two halves.
- **Mobile chrome (MOBILE ONLY, `< md`; desktop admin untouched).** The `(protected)/layout.tsx`
  sidebar is `hidden md:block`; below `md` a **fixed bottom icon nav** (`components/admin/AdminMobileNav.tsx`,
  Instagram/Twitter style) shows the 5 groups (Overview · Content · People · Services · Private) — tapping
  one opens a sheet of that group's tabs. **`NAV_GROUPS` now lives in `components/admin/nav-groups.ts`**
  (plain module + a lucide icon per group), shared by `AdminSidebarNav` (desktop) and `AdminMobileNav`.
  Mobile padding was tightened across admin (`layout.tsx` container `px-2`, content card `p-3`, every page
  `main` `px-0` on mobile) and the layout root carries **`overflow-x-hidden`** so no admin content can
  inflate the mobile layout viewport (which would trigger iOS auto-zoom). **`AdminPageHeader` now wraps**
  (`flex-col sm:flex-row`) so wide action-button clusters don't overflow → this alone killed the
  services-page auto-zoom. **Admin list rows/tables were made mobile-safe:** action buttons wrap to their
  own line on narrow screens (services, people, removal-requests rows), and the fixed multi-column tables
  scroll horizontally inside their card via `overflow-x-auto` + a `min-w` (inquiries `InquirySection`,
  service-categories `CategoriesTable`) — never let an admin row/table overflow the page.
- **Media + private-gallery forms are step wizards (MOBILE AND DESKTOP).** The long media editor and the
  gallery form are now Next/Back wizards: `MediaWizard` (Category → Media → Details → Appearances → Review,
  with a persistent shrinking upload preview `MediaWizardPreview` from the Details step on) and
  `GalleryWizard` (Details → Media → Review), both driven by the shared `components/admin/wizard/WizardTabs.tsx`
  (clickable step tabs that scroll the active step into view). **Presentation only** — no change to
  `useMediaEditorController`, the save/validation, the appearance name-required gate, or the gated-person
  rules; the sections are unchanged and just conditionally rendered per step.
- **Uploads use a native file input, NOT the Cloudinary upload widget.** The `CldUploadWidget`'s desktop
  multi-pane layout **collapses to a blank pane on narrow screens** (the "can't tap anything on mobile" bug —
  diagnosed on-device). All **admin** uploaders now use `components/admin/CloudinaryUploadButton.tsx`: a
  hidden `<input type="file">` that signs via `/api/sign-cloudinary-params` and POSTs the file straight to
  `https://api.cloudinary.com/v1_1/<cloud>/auto/upload` (already in `connect-src` — **no CSP change**).
  Adopted by the media form (`MediaAssetSection`), people avatar, service editor, and the shared `ImageField`
  (so blog covers / page sections / OG images). **Do not reintroduce `CldUploadWidget` in admin** — it is
  mobile-broken. The **public testimonials review form** (`ProfilePhotoField`, `ReviewPhotosField`) still uses
  `CldUploadWidget` deliberately — it uploads as an unauthenticated visitor through a different signing path,
  so `CloudinaryUploadButton` (admin-gated endpoint) cannot drop in there; a public equivalent is a later task.

**Admin structure (D9b, structural pass — done).** The sidebar (`(protected)/layout.tsx`) is
**grouped**: Overview (Dashboard) · Content (Media, Tags, Pages) · People (People, Testimonials,
Inquiries, **Removal Requests** [added in D12]) · Services (Services, Service Categories) · Private
(Private Galleries). Login lands
on **`/admin/dashboard`** (a real landing at its own route — `/admin` is the login page, so the
dashboard can't live there; the login default redirect is `/admin/dashboard`). The dashboard
(`lib/server/admin-dashboard.ts` → one batched set of count queries) shows a **Needs attention**
band (pending testimonials, new inquiries, **removal requests** [D12], pages missing an image, hidden
pages — amber when non-zero) plus Media totals/per-category and Library counts; numerics are Geist Mono
tabular. The sidebar **Dashboard** link carries a red total-pending badge (`getAdminNotificationCount`,
D12). **One dead surface was removed in D9b:** the `/admin/nfts` stub route is deleted (NFT media lives in
Media). (Removal Requests was unlinked in D9b and **rebuilt + relinked in D12** — see "People page".)
D9b was a **focused** structural pass — the 5 editing patterns, 3 image pickers, and 6 hand-rolled
overlays were deliberately left for a later pass; only the header (`AdminPageHeader`), feedback
(auto-dismiss fold), and dead-surface cleanup were consolidated here.

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
  are the sole exception and stay inline. **Forwards `ref`** (React 19 ref-as-prop, stays
  server-compatible) so a client caller can attach a magnetic ref (D8); auto-adds
  `data-magnetic` when a ref is present.
- `hooks/useMagneticHover.ts` — the shared magnetic-hover pull for CTAs (D8). Returns a
  `ref`; on cursor proximity (60px around the element) the button leans toward the cursor
  (max 12px x / 8px y) and springs back on leave, via the **independent CSS `translate`
  property** (composes with `.hm-btn:active { transform: scale() }`, so press feedback
  survives). Self-terminating rAF (no runaway loop), skips under reduced-motion and on
  non-`(pointer: fine)` devices. Exported pure `magneticOffset()` is unit-tested
  (`test/magnetic-hover.test.ts`). **Applied only to the two persistent high-intent CTAs —
  nav "Book" (desktop) and `StickyCta` — deliberately not sitewide** (find-animation-
  opportunities: blanket magnetism reads as gimmick). The hero is fixed and excluded.
- `components/shared/PortfolioCard.tsx` — all full-bleed image cards with overlay. Not an
  `<a>` itself: a `div` + absolute cover `<Link>` + `pointer-events` layering, so its tag
  chips and CTA don't nest anchors (D2b). Props include `priority?` (LCP) and `tags?`.
- `components/shared/AnimatedText.tsx` — all text reveals. **Word-mode only,
  scroll-triggered.** No char/line modes — don't assume they exist.
- `components/shared/NoResults.tsx` — the shared empty-state panel (D13): `rounded-2xl
  border p-8 text-sm text-muted-foreground`, default child "No matches.", optional override.
  Replaced five hand-rolled "no results" divs (MediaCardGrid, PhotographyCylinder,
  PhotographyHorizontal, NftCollection, PeopleIndex). Don't hand-roll another empty panel.
- `lib/disciplines.ts` — the single source of the 5 canonical disciplines (D13): `DISCIPLINES`
  (slug/label/href), `DISCIPLINE_HREF`, and `disciplineForCategory(category)` (the classifier
  formerly duplicated in `HomeServicesPreview` and `public-services.workLinkForCategory`).
  Used by the work-overlay route and `SiteFooter`. **The homepage `HomeCreativeSystem`/
  `HomeServicesPreview` keep their own bespoke marketing labels** ("NFT / Web3", "Dance",
  "Creative Direction") — deliberately not sourced from here or from `page_seo.headerTitle`
  (there is no admin "nav label" field; headerTitle is a long H1, wrong for a nav chip).
- `useAdminAction` hook + `AdminActionFeedback` — all admin loading/fetch/feedback
  flows (F5). Never hand-roll the try/catch+setFeedback pattern. Feedback must always be
  **accurate and specific** (S11): report the server's own error, never a vague "Failed to
  save"; on a multi-part save (e.g. `/admin/pages`, up to 3 collections in one row) report
  per-part success/failure with `Promise.allSettled` and clear only the parts that saved, so
  a re-save re-sends only what failed. `run()` is strictly all-or-nothing — for a multi-part
  outcome, drive `setFeedback` directly. No silent `catch {}` and no uncontrolled input left
  showing an unsaved value while the banner reports failure. **D9b added opt-in auto-dismiss:**
  `useAdminAction({ autoDismiss: true })` returns `notify(type, text)` that clears success
  after 4s / errors after 7s (self-cleaning on unmount) — `useServicesAdmin` consumes it
  instead of its old bespoke timer. Deferred: three surfaces still skip the hook (inquiries,
  media editor controller, private galleries) — they work, folding them in is a later refactor.
- `components/admin/AdminButton.tsx` — **the only admin button (D9).** `adminButtonClasses(variant,
  size?, className?)` (exported for className-swaps) + `<AdminButton>` (renders `<Link>` with `href`,
  else `<button>`; forwards `ref`). Variants: `default` (bordered neutral), `solid` (`bg-foreground`
  fill — primary/save; renders white on the dark admin theme, correct), `danger` (`--destructive`
  border+text — every delete/remove), `warning` (amber — testimonials Unapprove), `ghost` (borderless
  — header chrome). Sizes `xs`/`sm`/`md`; base carries the focus ring + `disabled` state. **Adopted
  across every admin action button** — do not hand-roll `rounded-xl border px-4 py-2` buttons again.
  Distinct control types are deliberately NOT this component: filter pills (rounded-full segmented
  toggles), drag handles (⠿), `inquiries/components/IconButton.tsx` (square icon-button primitive),
  selectable media tiles, and card-cover links. Admin **inputs** were left untouched (a later pass).
- `components/admin/AdminSidebarNav.tsx` — **the protected-layout sidebar (D9).** Client component
  (`usePathname`) that owns `NAV_GROUPS` and highlights the active route (`bg-accent`, exact or
  `startsWith(href + "/")`); inactive links are quiet ghost links. The `(protected)/layout.tsx` shell
  renders it inside a `--shadow-soft` card; the old per-item bordered-box nav is gone.
- `components/admin/AdminPageHeader.tsx` — every protected admin surface's page header
  (D9b). `{ title, description?, actions? }`. Don't hand-roll `text-2xl font-semibold` headers.
  Testimonials keeps its own `text-4xl` header deliberately (D9 territory).
- `components/admin/AdminToggle.tsx` — the shared admin switch (D9b). `{ checked, onChange,
  label, disabled?, className? }`. Used by the Pages-list visibility toggle and the editor's
  `VisibilityGroup`; reuse it for any admin on/off control.
- `components/admin/bulk/` — the reusable bulk-select system (D9b). `useBulkSelection(allIds)`
  → `{ selectedIds, count, isSelected, toggle, toggleAll, clear, allSelected }` (selection is
  derived against the live id list, so removed rows drop out with no effect); `BulkCheckbox`
  (row + tri-state select-all); `BulkActionBar` (sticky bar shown when `count>0`, page-specific
  action buttons + clear); `runBulkAction(ids, perItem)` → `{ ok, failed, okIds, failedIds }`
  loops existing single-item endpoints via `Promise.allSettled`. **Wired into all 8 admin
  lists** (testimonials, tags, service-categories, services + its inactive/archived sections,
  inquiries + archived, media, people, private galleries) with each page's available actions
  — no bulk API routes, no data-model change; media/people/private-galleries are delete-only
  because their PATCH needs a full body. Don't hand-roll row selection; reuse these.
- `hooks/useUnsavedChangesGuard.ts(hasUnsavedChanges)` — the shared unsaved-work guard (S11).
  Adds a `beforeunload` prompt **and** a document capture-phase click interceptor that
  `confirm()`s before internal-link navigation while dirty. Wired into `/admin/pages`; reuse
  it on any admin surface holding unsaved drafts rather than hand-rolling another.
- `components/shared/ModalPortal.tsx` — **the shared content-modal shell (P2).** Portals its
  children to `document.body` (escapes `AppShell`'s `z-10` stacking context so the footer can
  never paint over a modal — the D12 bug, previously fixed only on `MediaLightbox`), runs
  `useScrollLock` (stop Lenis + lock scroll), and closes on Escape (`closeOnEscape`, default on).
  Props: `{ onClose, className, closeOnEscape?, children }` — `className` styles the backdrop
  (which carries the `onClick={onClose}`); the caller's inner content stops propagation.
  **Every content modal now routes through it:** MediaLightbox, NftModal, PrivateGalleryBrowser,
  ExhibitionCityModal, ReviewModal, PublicReviewForm — so the overlay-consolidation task from D12
  is done for the card modals. **`WorkOverlay` deliberately stays separate** — it is a
  top-level, GSAP-animated full-screen takeover (not footer-trapped) with `bg-black/92`; do not
  fold it onto `ModalPortal`.
- `hooks/useScrollLock.ts` — the shared overlay scroll-lock (D12). Stops Lenis
  (`window.lenis`, attached in `AppShell`) and sets `documentElement` overflow hidden while
  mounted, restoring on unmount. Consumed by `ModalPortal`; use it directly in any other
  full-screen overlay. **D13 unified the content-modal scrim to `bg-black/70`** (MediaLightbox,
  NftModal, PrivateGalleryBrowser, ReviewModal, PublicReviewForm); **WorkOverlay keeps
  `bg-black/92`** as a full-screen takeover. `components/ui/dialog.tsx` and `sheet.tsx`
  (imported by nothing) were **deleted** in D13; don't re-add an unused primitive.
- **Content modals stack media above details on mobile (P2):** MediaLightbox / NftModal /
  PrivateGalleryBrowser use `grid h-[82vh] grid-rows-[45vh_minmax(0,1fr)] lg:grid-rows-none
  lg:grid-cols-[…]` — a fixed media block + scrollable detail below on small screens, resetting
  to the two-column split at `lg`. Do not drop the mobile row template: a single-column `h-[82vh]`
  grid let the `fill`/`object-contain` media collapse as detail content grew.
- **`CustomCursor` is desktop-only (P2):** its effect bails unless `(pointer: fine)` (as well as
  reduced-motion), so no rAF loop or `cursor:none` runs on touch devices. `PhotographyCylinder`
  and `WorkOverlay`'s grab area carry `touch-none`; `PhotographyHorizontal`'s marquee carries
  `touch-pan-y` (vertical page scroll passes through, horizontal drag is captured).
- `components/admin/CloudinaryUploadButton.tsx` — **the admin uploader (A1).** Hidden
  `<input type="file">` → sign via `/api/sign-cloudinary-params` → direct POST to
  `api.cloudinary.com/.../auto/upload`. Replaced `CldUploadWidget` in every admin upload (it collapses
  on mobile). Props `{ folder, accept?, label?, disabled?, onUploaded, onError? }`. **No CSP change.**
  Do not re-add `CldUploadWidget` to admin.
- `components/admin/nav-groups.ts` — the shared admin `NAV_GROUPS` (A1): group label + lucide icon +
  tabs, consumed by `AdminSidebarNav` (desktop) and `AdminMobileNav` (mobile bottom bar). Edit nav here.
- `components/admin/wizard/WizardTabs.tsx` — the shared admin step-wizard tab strip (A1): clickable
  numbered step tabs that scroll the active step into view. Used by `MediaWizard` and `GalleryWizard`.
- `lib/password-gate.ts` — the shared password-gate primitives (D12): scrypt `hashPassword`/
  `verifyPassword`, `makeAccessToken`, `createPersonGateCookieValue`/`verifyPersonGateCookieValue`
  (HMAC, timing-safe), `personGateCookieName`, `getPersonGateSecret`. Runtime-agnostic
  `node:crypto`, unit-tested (`test/password-gate.test.ts`). Used by the People privacy gate; the
  gallery gate keeps its own copy (see "People page"). **Rotate the access token whenever the
  password changes** — the cookie binds to the token, so rotation is what logs old sessions out.
- `app/api/_lib/admin-route.ts` — every admin `[id]` mutation route's preamble
  (S2b). `requireAdminObjectId(ctx)` runs the admin guard **then** validates the
  `:id` ObjectId (auth-before-parse ordering lives here, don't re-inline it);
  `findByIdOr404(db, collection, oid, options?)` for the findOne→404 lookup;
  `wantsHardDelete(req)` for the `?hard=1` soft-vs-hard delete flag. Domain
  field-mapping and cleanup stay in each route.
- `components/admin/media-picker/MediaPickerModal.tsx` + `ImageField.tsx` — all admin
  image pick/upload flows (N7). Don't build another picker. `ImageField` takes an optional
  `folder` prop (default `CLOUDINARY_SECTIONS_FOLDER`; C1 passes `CLOUDINARY_BLOG_FOLDER`). **Its
  Upload button is `CloudinaryUploadButton` (A1), not `CldUploadWidget`.**
- `components/admin/sortable/SortableList.tsx` — **all** admin drag-to-reorder (T1).
  `<SortableList ids onReorder(activeId,overId) className>` owns the sensors + `DndContext`
  (closestCenter) + vertical `SortableContext`; each row calls the `useSortableRow(id)` hook
  and spreads `{ setNodeRef, style, handleProps }`. Adopted by service-categories, services,
  page-sections `RepeatingListEditor`, and `/admin/tags` — the three hand-rolled dnd-kit
  copies are gone. **Do not re-inline `useSortable`/`DndContext`; reorder via this.** No
  mount gate (React-Compiler lint bans `setState`-in-effect). **`DndContext` is given a
  stable `id={useId()}` (D13)** — without it dnd-kit derives its `DndDescribedBy-N`
  announcement ids from the global `useId` counter, which desyncs between SSR and hydration
  and throws a hydration mismatch on any admin form that renders `useId`-calling components
  upstream. Keep the explicit `id`; the earlier "dnd-kit's useId is hydration-safe" note was
  wrong.
- `components/services/ServiceCard.tsx` — all service cards (`preview` variant for the
  homepage).
- `components/media/useMediaSearch.ts` / `MediaGridResults` / `MediaTagChips` — all
  media search/filter surfaces (D3). `MediaGrid` composes them. `useMediaSearch` takes an
  optional `lockedTag` that scopes every search to one tag (used by the tag subpages).
  **Cursor pagination runs in BOTH modes (L6):** searching paginates the server-filtered
  results; browsing paginates the recent-media pool by building the next cursor client-side
  from the last loaded item via `encodeMediaCursor` (`lib/media-cursor.ts`, the shared,
  runtime-agnostic base64url encoder the `/api/media/list-public` route also uses). The hook
  exposes one `canLoadMore` flag — do not re-gate the Load-more button on `hasActiveSearch`
  (that was the bug that made photo 61 unreachable while browsing). The discipline server
  reads (`getPhotographyItems`/`getVideographyItems`/`getMediaByTag`) seed the first
  `PUBLIC_MEDIA_PAGE_SIZE` (30) items; the Load-more button only renders in the photography
  Grid view (cylinder/horizontal share the same growing pool but have no button).
- `components/media/TagChipRow.tsx` — **all tag-subpage navigation** (T2). Compact, boxed,
  sideways-scrolling chip row of `<Link>`s (`scroll` + `boxed` props), Lenis-safe. Do not
  hand-roll another tag-nav row. It is distinct from `MediaTagChips` (in-place filter).
- `components/search/SearchInput.tsx` · `components/site/PortfolioFallbackPanel.tsx` ·
  `components/site/Navbar.tsx` · `components/site/AppShell.tsx`.
  **AppShell holds every global element (N9).** Lenis, Navbar, Preloader, the grain overlay,
  `CustomCursor` and the `SiteFooter` all live in `AppShell` behind its
  `if (isAdmin) return <>{children}</>` gate, so none of them render on `/admin/*`. `SiteFooter`
  is an async Server Component and `AppShell` is a client component, so the footer is passed in
  as the `footer` prop from `app/layout.tsx` (`<AppShell footer={<SiteFooter />}>`) — a server
  component rendered by a client parent via props. **`SiteFooter` awaits `getAllPageSettings`, so
  that read is a second must-never-throw layout dependency alongside `getTransitionImages` (L4) —
  a throw there 500s every page before any page-level fail-safe runs; `getAllPageSettings`/
  `getPageSettings` are fail-safe (try/catch → all-active defaults), keep them so.** `CustomCursor`
  is imported and rendered directly inside `AppShell`'s public branch. Do not re-mount either as a
  sibling in `layout.tsx`.
  **`TransitionProvider` (D4) also lives here**, wrapping `children` + the footer and taking an
  `images` prop (the server transition pool from `layout.tsx`). The page transition plays on
  **every** public route via a global click interceptor — see "Page transitions" above. Do not
  build a second page-transition mechanism; the interceptor already catches all internal links.

## Error boundaries & fail-safe reads (L4, shipped 2026-09-02)
`app/not-found.tsx`, `app/error.tsx` (client, `{error,reset}`) and `app/global-error.tsx` (client,
renders its own `<html className="dark"><body>` + imports `globals.css`, kept dependency-light so it
can't itself break) render house language — `.section-shell` + `PageHeader` + `Button` back to `/`,
no gradients/eyebrows. A `notFound()` or thrown error now shows a branded page, not Next's default
screen.
**Every public server read module is fail-safe (try/catch → `[]`/`null`/defaults), matching
`getTransitionImages`/`public-blog.ts`,** so a DB blip renders the empty state (and Atlas being
unreachable during the Netlify build no longer fails the deploy). Covered: `public-people.ts`,
`public-services.ts`, `public-nfts.ts`, `testimonials.ts`, `tag-pages.ts`, `public-media-tags.ts`,
`page-settings.ts`, and the `public-media.ts` reads (`getPhotographyItems`/`getVideographyItems`/
`getMediaByTag`/`getExhibitionCities`/`getShowreelItem`). Long functions use the repo's private-impl
+ thin-wrapper idiom (like `listPublicMedia`/`getTransitionImages`) so the wrap adds no body
re-indentation. `db.ts` is deliberately NOT wrapped — it only returns a client; its callers catch.
**Do not remove these catches** — a bare read that can throw in the root layout or a `revalidate`
page breaks the build or 500s the route. Empty results render `NoResults`/the page's fallback panel,
never a thrown page.

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
- **Never run `next build` to verify a code change locally.** Local verification stays
  `tsc --noEmit` + `eslint` + `npm test` + the dev server. **CI now also runs `npm run build`
  (added L5, 2026-09-03)** as a launch-readiness gate: `.github/workflows/ci.yml` (Node 22)
  runs typecheck → lint → test → build on push (`master`, `v2-portfolio`) + PR. **The build
  must stay free of any build-time network fetch** — the Preloader's Cormorant Garamond was
  moved off `next/font/google` (a Google-Fonts fetch at build time) to a self-hosted
  `next/font/local` woff2 in L6 after that fetch failed CI's `npm run build` intermittently.
  The build running in CI does not change the local rule — don't reach for `next build` to check your
  own work; that's what the dev server is for. The dedicated full production build + smoke
  gate is Session L11.
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
  (`'unsafe-eval'` and ws: are dev-only). Allowlist is deliberately narrow: images +
  video from `res.cloudinary.com` (`img-src` + `media-src`), frames from the Cloudinary
  upload widget, `www.openstreetmap.org`, and the video embed hosts
  `www.youtube-nocookie.com` + `player.vimeo.com`, `frame-ancestors 'none'`.

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
- **Testimonial photo uploads are a server-issued capability (L3), not a client-chosen folder.**
  `POST /api/testimonials/upload-session` mints a session (`testimonial_upload_sessions` collection,
  `{_id, tokenHash, status: "pending"|"committed", expiresAt}` + TTL index) and binds it to the
  browser via an **httpOnly cookie** `hm_testimonial_upload = <sessionId>.<token>` (the token is a
  32-byte secret; the DB stores only `sha256(token)`, compared timing-safe). Primitives live in
  `lib/server/testimonial-upload-sessions.ts`. The signature route signs **only** that session's
  `/pfp`+`/photos` folder; submit rejects any photo URL outside it and atomically flips
  `pending→committed`; cleanup deletes only an uncommitted session it owns. **Never revert to a
  client-supplied `uploadSessionId`** — that was the public folder-delete + spam-then-delete hole.
  The cookie is the only mechanism because `CldUploadWidget` gives no way to inject a token into its
  signature request. Format/size limits are **client-side on the widget only** (`clientAllowedFormats`
  + `maxFileSize`) — `next-cloudinary` signs only the params it uploads, so signing `allowed_formats`/
  `max_file_size` breaks every upload. The widget must mount **only once its `folder` is ready** (it
  bakes `options.folder` once, on idle after its `<Script>` loads) or uploads orphan in the Cloudinary
  root; the review modal sets `closeOnEscape={false}` so the widget's Escape can't reset the form.
- **The rate-limit key comes from `getClientAddress` (`app/api/_lib/public-form-security.ts`),
  which in production trusts ONLY `x-nf-client-connection-ip`** — Netlify's trusted client IP.
  `x-forwarded-for` / `x-real-ip` are client-spoofable and are honored **only** when
  `NODE_ENV !== "production"` (local dev); in production, no trusted header → `"anonymous"`,
  never a spoofable fallback (L2). Do not reintroduce reading `x-forwarded-for` in production —
  a per-request spoofed value bypasses every rate limit at once (login lockout, testimonial
  submit/upload, People + private-gallery gates). `count > limit` is the limit boundary in both
  request-guard helpers (a `limit` of N allows exactly N), and `claimDuplicateWindow` is a single
  atomic `findOneAndUpdate` upsert — do not split it back into read-then-write (racy).
- **No `dangerouslySetInnerHTML`, no `eval`, no `new Function`.** Currently zero in the
  repo — keep it that way.
- **Never commit `.env*`.** Verified gitignored. If a secret is ever exposed, rotating it
  is mandatory, not optional — the leaked value stays valid until rotated.
- **CSP `frame-src` in `next.config.ts` legitimately carries `www.openstreetmap.org`**
  (testimonials OSM map — S1 omitted it and silently broke the map, S6, archive §S6) **and,
  since D4 (2026-08-20), `www.youtube-nocookie.com` + `player.vimeo.com`** — the showreel and
  media-lightbox video embeds (`toEmbedUrl`) **and, since D10 (2026-08-28),
  `https://www.instagram.com`** — the dancing-page post embeds (`InstagramFeed`, admin-picked
  URLs via `toInstagramEmbedUrl`). Do not strip any of them in a future security
  pass; any new external iframe/CDN needs its origin added to the right CSP directive **and**
  an in-browser check that the surface still renders.
- **CSP `media-src 'self' blob: https://res.cloudinary.com` was added in D4 (2026-08-20).**
  There was previously **no `media-src`**, so every Cloudinary `<video>` (showreel, videography
  grid, lightbox) fell back to `default-src 'self'` and was silently blocked — the "showreel
  not working" bug. Do not remove it; `<video>`/`<audio>` need `media-src`, not `img-src`.

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

  **The one-off conversion is DONE (D13).** All nine remaining values were converted to the
  five-token scale (`[1.5rem]`→`[2rem]`, `[1.25rem]`/`[1rem]`/`[1.2rem]`/`[0.95rem]`→`2xl`,
  `lg`/`[0.85rem]`→`xl`, `3xl`/`[1.75rem]`→`[2rem]`), mostly across `components/testimonials/`,
  `Navbar.tsx`, `StickyCta.tsx`, `PeopleIndex.tsx` and the modals. The public tree
  (`app/` + `components/`, excluding `admin/` + `ui/`) now carries **only** the five tokens —
  reject any new value in review. `components/ui/` shadcn primitives stay out of scope.
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
| Admin login rate limiter keys on `ip\|userAgent`, so a UA change resets the lockout | `app/admin/page.tsx:32-34` | §S10 |
| Public form fields are interpolated raw into notification email HTML | `lib/server/email.ts:19-29,45-55` | §S10 |
| `POST /api/testimonials/reorder` is fully built and called from nowhere; testimonials cannot be reordered (**deferred out of D9b** — bulk-select was wired instead; wire the reorder or delete it in a later pass) | `app/api/testimonials/reorder/route.ts` | unassigned |
| Public media search has no supporting index (unanchored case-insensitive regex over 6 fields) — **DECISION (P1): left as-is, not `$text`.** A word-based text index would break the as-you-type substring search; the correct scalable fix is Atlas Search (`$search` autocomplete), which is a deploy-time Atlas config, not a `createIndex`. At portfolio scale a bounded scan is fine. Do this only when the library grows enough to feel it. | `list-public/route.ts:69`, `admin-list/route.ts:98` | at/after deploy |
| `README.md` is unedited create-next-app boilerplate telling the reader to deploy on Vercel | `README.md:32-36` | §L1 |

Resolved in P1 (2026-08-31): the `/people` N+1 is gone — `getPublicPeople` now runs 2 queries total (people + one `$in` over media, grouped in app code). The testimonials index was fixed to `{isApproved,sortOrder,approvedAt,createdAt}` (matches the sort, no in-memory sort) and the dead `{status:1}` index dropped. Three.js disposal (HeroBokeh, PhotographyCylinder), GSAP ScrollTrigger (`useGSAP` scope), and Lenis lifecycle were all audited and confirmed clean. Cloudinary images already use `q_auto,f_auto,c_limit` (correct). Caching directives are correct on all 15 real public routes (the old "4 have no directive" note was stale — S9 fixed it). **Lighthouse scores were NOT run** (sandbox can't reach Atlas → dev server 500s) — run them on a live/local machine at deploy. `HeroBokeh` static import puts ~140–160 KB gzip of `three` in the homepage initial bundle (reported, hero untouched by decision).

Resolved in D13: `SmartMediaPreview` empty/embed states are now flat `bg-muted`; dead `toPublicTestimonial` deleted. **`page_seo.title`/`.headerTitle` reverting to defaults when blanked is now a DECISION, not a defect** — a blank `<title>` is bad SEO, so the truthy-gate stays and the default is the safety net (unlike the optional description/OG fields).

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
- **Impeccable bans bounce/elastic easing as dated.** D5's spring overshoot on the cursor is
  deliberate. (D4's Dancing elastic transition no longer exists — the per-route transitions
  were reverted; see "Page transitions".) Add to `detector.ignoreRules` with a reason rather
  than removing the motion.
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
