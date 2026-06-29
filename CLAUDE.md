# HM Visuals — Claude Working Document

## Who this is for
Hussain Marzooq — internationally exhibited photographer and videographer (primary
identity), active NFT artist, working dance teacher, web developer. Dubai-based,
international market: galleries, collectors, luxury brands, agencies, global booking.

## The site
Full rebrand replacing a landing page. Admin works. Content ready to upload.
Every week without it is a missed booking. Design must match igloo.inc,
aikawakenichi.com, and ten.375.studio in creative ambition and execution level.

## Domain
hussain-marzooq.com (live on Netlify). Target: hussain.art when ready.
Launch does not wait for hussain.art.

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
MongoDB Atlas, Cloudinary, Resend
Deployed on **Netlify** — not Vercel. CLAUDE.md previously incorrect.
shadcn/ui new-york installed at components/ui/
Three.js + react-globe.gl installed
GSAP + @gsap/react + ScrollTrigger installed
Framer Motion installed
Lenis installed

## Animation stack status
- Lenis: installed, **not yet initialized** — must be done in Session F1
- GSAP ScrollTrigger: installed, underused — core of scroll design
- Three.js: used only in HeroBokeh — must expand to full homepage WebGL
- react-globe.gl: installed, not yet built
- Framer Motion: installed, used minimally

## Design direction — the standard
The site must match the creative and technical level of:
- **aikawakenichi.com** — Three.js 3D cylinder, glass shard transitions, photography as the primary visual element, massive content-backed composition
- **ten.375.studio** — creative panel-based transitions using content, click-driven experiences, content IS the animation material
- **igloo.inc** — full 3D WebGL environment as the primary layer, scroll moves through the scene

This means:
- The homepage is a WebGL-first experience. Three.js canvas is the primary layer.
- Page transitions use the actual photos/videos on each page as the animation material.
- Every page has a unique transition in and out. No generic overlays.
- Three.js, GSAP ScrollTrigger, and Lenis are all active on every public page.
- Photography and videography are the primary visual identity — the work IS the design.

## What is NOT in the design
- No viewport-scale decorative typography (existing title animations are kept)
- No sound
- No generic overlay transitions (white flash, curtain wipe, fade)
- No gradients (decorative). Body had two radial-gradients — removed in Session F1.
- No page-vignette. Removed in Session F1.
- No site-grid-bg. Removed in Session F1.
- No gradient fallback divs — replace with flat bg-muted.
- Grain texture: active, uniform CSS noise only, fixed position, 3–5% opacity, above backgrounds, below all content. No oval. No vignette. Does not bleed into cards.

## Navigation — 3-item minimal nav
**Visible nav: Work · About · Book**
- "Work" opens a full-screen immersive overlay showing all 5 discipline cards (Photography, Videography, NFT, Dancing, Web Development) with content pulled from Cloudinary. Cards scroll horizontally in the cylinder style used by aikawakenichi. Inactive discipline pages are excluded from the overlay automatically.
- "About" navigates to /about.
- "Book" navigates to /contact.

## Page activity toggle
Every public discipline page has an `isActive` field in the database.
- When inactive: excluded from the Work overlay and all homepage sections referencing it.
- Direct URL still works but redirects to homepage.
- Admin toggle control for each page.

## Homepage architecture
The homepage is a WebGL-first experience:
1. **Full-viewport Three.js scene** — the primary layer. Camera moves through it on scroll.
2. HTML content sections exist below the WebGL zone and scroll normally with GSAP ScrollTrigger animation.
3. Sections below the hero: Featured Work, Stats, About snippet, Globe, Press/Publications, Services.
All are animated on scroll with GSAP ScrollTrigger.

## Preloader
Runs once per session (sessionStorage flag). Full-screen.
**Animation sequence:**
1. Multiple photos appear sequentially — like emoji reactions replacing one another — each representing a discipline (photography, videography, NFT, art, web, dancing). Fast, rhythmic.
2. The sequence repeats twice.
3. A visual effect fires. A light burst expands horizontally from the center of the screen.
4. From the burst, the word **"Art"** appears and moves to the right side of the screen.
5. Letter animations with effects begin — building out to reveal the full name **"Hussain.Art"**
6. Hold. Site loads beneath.
Built with GSAP timeline. Images pulled from Cloudinary (featured/hero photos across all disciplines).

## Photography viewer — 3 modes
The photography page offers users 3 modes:
1. **3D Cylinder** — photos mapped as textures on a rotating Three.js cylinder (aikawakenichi-level). Click a photo opens the existing media detail popup.
2. **Horizontal scroll** — cinematic flat track, GSAP ScrollTrigger driven.
3. **Category filter** — filters all content by discipline tag.
User switches between modes via a minimal UI control. All modes use the existing search/filter logic.

## Page transitions — content-as-animation
Every transition between pages uses the actual photos/videos on each page as the animation material. No generic overlays.

Specifics per route:
- **→ Photography:** Hero image expands from thumbnail scale to full viewport, 3D cylinder assembles from it.
- **→ Videography:** Photos from origin page scatter like glass shards (aikawakenichi technique), film strip assembles from the right.
- **→ NFT:** Origin images fragment/glitch as NFT grid assembles.
- **→ Dancing:** Images distort with wave/ripple physics — motion reference.
- **→ About:** A single portrait from the work expands full-screen, about content fades over it.
- **→ Web Development:** Code-style terminal effect (brief) then page assembles.

Each transition is built in its own session. Implementation: GSAP + Three.js shared transition context that knows the images available on origin and destination.

## Globe
react-globe.gl on the homepage.
- Data: `appearances.kind === "exhibited"` only. Dynamic, no hardcoding.
- Interaction: auto-rotate when idle, drag to rotate manually, resume auto-rotate after.
- Click a city marker: popup appears with media cards of exhibited work in that location. Existing popup/lightbox behavior. Cards are clickable and open the media detail popup (already built).
- Color: dark charcoal palette from design tokens.
- Hover: city name + work count label.

## People page
Primarily clients who have been photographed or videographed.
- **Public by default.** Anyone can browse.
- **Private toggle per person.** When private, a password is required to view their content.
- **Removal request system.** A person can submit a removal request via the public page. Hussain approves it in admin. On approval: content is hidden (not deleted) behind a password. Hidden content is not accessible without the correct password.
- People page is in the Work overlay and the nav system.

## Dancing page
For now: Instagram feed embed + title + description + booking CTA.
No direct media upload for this page. Reviewed after launch for expansion.

## Web development page
Displays completed web projects + related services.
Admin controls: project uploads, descriptions, status.

## Blog
Standard blog with admin-defined categories (like the existing media categories).
- Admin: full CRUD for posts (title, slug, content, cover image, category, tags, published date, published toggle).
- Public: listing page (/blog) + article page (/blog/[slug]).
- Categories: admin-defined, flexible.

## SEO + page titles/descriptions
Admin control over title and description for every public page.
- MongoDB collection: `page_seo` — one document per public page (slug, title, description).
- Admin UI to edit these fields.
- Each page.tsx calls `getPageSeo(slug)` and passes values to Next.js `generateMetadata`.

## Open Graph images
Each public page needs a proper OG image using actual photography from Cloudinary.
Built in Phase 3.

## Analytics
Plausible Analytics. Privacy-first, no cookie banner required, no data sold.
One script tag. Added in Phase 3.

## Admin design
Visual consistency with the portfolio: dark theme, same typography scale, consistent use of shadcn/ui components styled to match the portfolio's design language. Not a full layout rebuild — visual consistency first.

## Appearances admin — update needed
The location field on appearances currently accepts free text.
It must be updated to use the same cities list system used in testimonials — a connected, searchable, validated city selector. This is required for the globe to work correctly.

## Reusable components — always use, never reinvent
components/shared/PageHeader.tsx — all public page headers (h1 + description)
components/shared/PortfolioCard.tsx — all full-bleed image cards with overlay
components/shared/AnimatedText.tsx — all text reveals (word/char/line modes)
components/admin/action-feedback/AdminActionFeedback.tsx
components/search/SearchInput.tsx
components/site/PortfolioFallbackPanel.tsx
components/site/Navbar.tsx
components/site/AppShell.tsx — Lenis initialized here, all global elements live here

## Code quality rules
- Every session produces files under 100 lines where possible
- No file over 200 lines without justification
- No duplicated patterns — extract to shared components
- No inline styles when a token exists
- No dead code, no duplicated logic
- Before every session: audit connected files, report what changes and what could break
- Never touch admin pages unless the session is specifically for admin

## Design tokens
Colors: OKLCH tokens in globals.css — use variables, never hardcode hex
Radius: rounded-xl, rounded-2xl, rounded-3xl only
Section container: always use .section-shell class — never write mx-auto max-w-6xl px-4 inline

## Claude tooling for this project
- **Claude Code Desktop (Code tab):** all development sessions. Triggered by "Continue queue".
- **Cowork:** all copy writing after design is complete. Always use hm-visuals-voice skill.
- **Claude Design project:** design decisions and mockups before building.
- **This claude.ai interface:** planning, architecture, interview sessions.

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
Provide exact git commands:
  git add [exact files changed]
  git commit -m "[type(scope): specific description]"
  git push
STOP. Wait for Hussain to confirm push is done.
When confirmed: set session status to `done` in SESSION-QUEUE.md.
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
Good: "feat(preloader): GSAP photo sequence with Hussain.Art reveal"
Bad: "fix bugs" / "update files"