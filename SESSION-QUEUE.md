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

### Session F1 — Remove violations + initialize Lenis — `in-progress`
Remove all design violations before any design work begins.

Tasks in this session (all in one commit):
1. `app/globals.css`: Remove the two `radial-gradient` calls on the `body` rule. Remove the `page-vignette` class entirely. Remove the `site-grid-bg` class entirely.
2. `components/site/AppShell.tsx`: Remove the `<div className="page-vignette" />` line. Remove the `<div className="site-grid-bg absolute inset-0" />` line. Add Lenis initialization using useEffect — smooth scroll on all public pages only (not admin).
3. `components/home/HomeFeaturedWork.tsx`, `components/home/HomeCreativeSystem.tsx`, `components/home/HomeTrustAndShowreel.tsx`: Remove any `bg-[radial-gradient(...)]` fallback divs. Replace with flat `bg-muted`.
4. `cities1000.txt` and `cities1000.zip`: Delete from repo. Add to `.gitignore`.

Read all listed files before making any change. Report every connected file before writing code.

---

### Session F2 — Code refactoring: extract reusable components — `pending`
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

---

### Session F3 — Split large admin files — `pending`
Admin files are too large. Split without breaking any admin functionality.

Target files:
- `TestimonialsAdminClient.tsx` (~21KB): extract the form into `TestimonialForm.tsx`, the list into `TestimonialList.tsx`
- `app/admin/(protected)/media/list/page.tsx` (~16KB): extract the bulk action panel and the filter bar into separate components
- `AdminServicesClient.tsx` (~12KB): extract the service form

Read each file completely before splitting. Verify imports after each split. Admin must work identically after — no functional changes, only structural.

---

## Phase 1 — Navigation & global systems

### Session N1 — Minimal nav + Work overlay — `pending`
Replace the current 11-item Navbar with the new 3-item minimal nav.

New nav structure: **Work · About · Book**
- "Work" triggers a full-screen overlay showing discipline cards.
- Discipline cards are pulled from Cloudinary (one representative image per discipline from existing media).
- Cards scroll horizontally in the aikawakenichi cylinder style using Three.js or GSAP 3D transforms.
- Inactive discipline pages (controlled by page activity toggle — built in Session N3) are excluded from the overlay.
- "About" is a standard link to /about.
- "Book" is a standard link to /contact.

Mobile: cards stack in a scrollable vertical list with the same visual treatment, adjusted for mobile viewport.

Read: components/site/Navbar.tsx, components/site/AppShell.tsx, globals.css, every public page.tsx that references nav items. Plan the Three.js approach and wait for confirmation before writing code.

---

### Session N2 — Page activity toggle system — `pending`
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

---

### Session N3 — SEO + page metadata admin control — `pending`
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

---

## Phase 2 — Preloader & core experience

### Session D1 — Preloader — `pending`
Full-screen preloader that runs once per session (sessionStorage flag).

GSAP timeline animation sequence:
1. Photos appear sequentially — fast, rhythmic, like emoji reactions replacing each other. Each photo represents a discipline (photography portrait, videography still, NFT artwork, dance performance, web screenshot). Images pulled from Cloudinary via a lightweight API call or statically selected featured images.
2. The sequence repeats exactly twice.
3. A visual effect fires (blur, scale, or particle burst — propose the specific GSAP approach with timing before writing code).
4. A horizontal light burst expands from the center of the screen.
5. From the burst, the word **"Art"** appears and slides to the right side of the screen.
6. Letter-by-letter animations begin building the full name **"Hussain.Art"** with effects (propose the specific letter animation approach and wait for approval).
7. Brief hold. Preloader unmounts, site is fully visible.

Component: `components/site/Preloader.tsx`
Added to: AppShell.tsx (public pages only, not admin)

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
- Page title + description (admin-controlled via Session N3).
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