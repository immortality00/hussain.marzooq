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
- Lenis: **initialized** in components/site/AppShell.tsx (Session F1, done) — active on all public pages, skipped on admin routes
- GSAP ScrollTrigger: installed, used in components/shared/AnimatedText.tsx for scroll-triggered word reveals — still underused elsewhere, core of scroll design
- Three.js: currently only in `HeroBokeh.tsx` (raw Three.js, a self-contained 180-point shader system).
- react-globe.gl: installed, not yet built (Session D6)
- Framer Motion: installed, used minimally

## Design direction — the standard
The site must match the creative and technical level of:
- **aikawakenichi.com** — Three.js 3D cylinder, glass shard transitions, photography as the primary visual element, massive content-backed composition
- **ten.375.studio** — creative panel-based transitions using content, click-driven experiences, content IS the animation material
- **igloo.inc** — full 3D WebGL environment as the primary layer, scroll moves through the scene

This means:
- Page transitions use the actual photos/videos on each page as the animation material.
- Every page has a unique transition in and out. No generic overlays.
- Photography and videography are the primary visual identity — the work IS the design.

## What is NOT in the design
- No viewport-scale decorative typography (existing title animations are kept)
- No sound
- No generic overlay transitions (white flash, curtain wipe, fade)
- No gradients (decorative). Body had two radial-gradients — removed in Session F1.
- No page-vignette. Removed in Session F1.
- No site-grid-bg. Removed in Session F1.
- No gradient fallback divs — replace with flat bg-muted. **Re-audit (post-F1) found 6 more
  instances added since F1 in components/media/SmartMediaPreview.tsx,
  components/site/PortfolioFallbackPanel.tsx, components/site/WorkOverlay.tsx,
  app/services/page.tsx, app/services/[slug]/page.tsx, app/people/[slug]/page.tsx —
  scheduled as Session F4. This rule applies sitewide, not just to the original 3 files,
  and needs to be checked on every session that touches a missing-image fallback state
  going forward.**
- Grain texture: active, uniform CSS noise only, fixed position, 3–5% opacity, above backgrounds, below all content. No oval. No vignette. Does not bleed into cards.

## Navigation — 6-item nav (Session N8, pending)
**Visible nav, once N8 ships: Work · About · Services · People · Testimonials · Book**

Corrected from the original 3-item spec ("Work · About · Book"). Session N1 shipped a 4th
item (Services) that wasn't in the original doc — confirmed intentional and kept, since
Services has its own full admin section (service-categories, services) and dropping it
from primary nav would hide a real revenue path. This doc was wrong, not the build.
Session N8 (pending) adds People and Testimonials as two more flat links — both are real,
live pages that were simply never linked from the nav. Confirmed: they're separate
top-level links, not folded into the Work overlay, which stays scoped to the 5
disciplines only.

**A camera-hump visual redesign for the navbar was explored and explicitly dropped.**
Multiple mockup passes did not land — not resolved in this planning context. **The
navbar's visual design stays exactly as N1 shipped it.** Six items at real desktop width
is tight; N8 needs to verify it doesn't crowd the Book CTA before shipping.

- "Work" opens a full-screen immersive overlay showing the 5 discipline cards (Photography, Videography, NFT, Dancing, Web Development) with content pulled from Cloudinary. Cards scroll horizontally in the cylinder style used by aikawakenichi. Inactive discipline pages are excluded from the overlay automatically. Services is **not** part of the Work overlay — it's a standalone top-level nav link, not one of the 5 disciplines.
- "About" navigates to /about.
- "Services" navigates to /services.
- "People" navigates to /people (Session N8).
- "Testimonials" navigates to /testimonials (Session N8).
- "Book" navigates to /contact.

## Page activity toggle
Every public discipline page has an `isActive` field in the database.
- When inactive: excluded from the Work overlay and all homepage sections referencing it.
- Direct URL still works but redirects to homepage.
- Admin toggle control for each page.
- Scope: the 5 discipline pages only (photography, videography, nft, dancing,
  web-development). Services, About, People, Blog, Contact, Testimonials do not have this
  toggle and are not expected to — they aren't "disciplines" in the Work-overlay sense.

## Preloader
**Shipped in Session D1 (2026-07-02) — this section is now a record of what's actually in
the repo, not the pre-build spec.** Three details below differ from earlier drafts of this
doc because Hussain changed them live during Gate 2 review — noted so nothing here reads
as a bug that needs fixing:

- **Runs on every visit to `/`**, not once per session. `AppShell.tsx` mounts
  `<Preloader />` only when `pathname === "/"` and it remounts on every arrival —
  hard refresh and client-side nav back to home both replay it. No `sessionStorage` gate
  exists. Every other public page never shows it.
- **Symbols:** Camera (photography), Video (videography), lucide `Bitcoin` (NFT — lucide
  has no ETH glyph), the 🕺💃 emoji pair rendered as text (dancing), Code2 (web
  development). This replaces the "vector icons only, no emoji" direction from earlier —
  Hussain asked for the emoji pair specifically during the build. **Open question, not
  urgent:** this now conflicts with the "no eyebrow, no emoji" reasoning used elsewhere in
  this doc (PageHeader's eyebrow removal, for instance). Not a problem unless the
  inconsistency itself bothers you — flag it if you want Dancing's symbol reconsidered,
  otherwise leave as shipped.
- **"Art" appears centered on screen** (not slid in from the burst edge), holds, then
  glides right while "Hussain." assembles from a per-letter scatter+blur focus-pull,
  right-to-left, growing outward from "Art." Renders in Cormorant Garamond
  (`next/font/google`), preloader-only — not the site's Geist stack.

Beat tightened to 0.22s per symbol per Hussain's direct feedback ("reduce the emojis
time"). Built with `useGSAP` (matches the `AnimatedText.tsx` idiom in this repo) inside
`components/site/Preloader.tsx`. `app/api/preloader-images/route.ts` is deleted — no
Cloudinary fetch, zero remaining callers.

**Required follow-up, not yet built — blocks Session D2d.** `Preloader.tsx` currently
manages its own exit: it holds, fades its own container to `autoAlpha: 0`, and calls
`setDone(true)` to hard-unmount itself. There is no way for a parent to take over that
final frame. The seamless preloader→scene handoff planned in Session D2d needs the
opposite contract: the timeline holds the light burst at full intensity and fires an
`onComplete` prop instead of self-unmounting; whoever mounts `<Preloader />` decides when
and how it leaves. This is a small, contained change to the existing component (add a prop,
remove the self-fade + `setDone` unmount), not a rebuild — scoped as the first task in
Session D2d in SESSION-QUEUE.md.

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

## Page content — header text + SEO metadata
Two different things, both admin-controlled, both stored on the same `page_seo` document
per slug, both edited at `/admin/seo`. They started identical in concept and got
conflated in early planning — they are not the same field.

1. **On-page header** — the visible H1 + description a visitor reads, rendered by
   `components/shared/PageHeader.tsx` for interior pages. Fields: `headerTitle`,
   `headerDescription`. No eyebrow field — see Reusable components above. This was
   hardcoded directly in every page.tsx file with no admin control at all until Session N4.
2. **Search & social metadata** — the `<title>` tag and `<meta name="description">` a
   search engine or shared-link preview sees, passed to Next.js `generateMetadata`.
   Fields: `title`, `description`, `ogImageUrl`. This is what Session N3 actually built.

MongoDB collection: `page_seo` — one document per public page (slug + all 5 fields above).
Admin UI at `/admin/seo` (labeled "Page Content" in the sidebar, route unchanged) edits
both groups, clearly separated. Each page.tsx calls `getPageSeo(slug)` once and uses
`.title`/`.description` for `generateMetadata`, `.headerTitle`/`.headerDescription` for
the visible header.

**The homepage is included** — it was wrongly scoped out of the first draft of this plan
on the assumption that "WebGL hero, no text" applied to the whole page. It doesn't: the
homepage has more hardcoded copy than any other single page. Full inventory, confirmed by
reading every component directly:

- `components/home/HomeHero.tsx` — h1 + p (the largest, most prominent text on the site).
  This is `home`'s `headerTitle`/`headerDescription` in the same `page_seo` system as
  every other page, wired directly into HomeHero's existing h1/p — it doesn't use
  `PageHeader` (the hero has its own full-bleed image + bokeh + gradient-overlay layout)
  but the same CMS fields apply, same pattern as testimonials/page.tsx.
- `components/home/HomeFeaturedWork.tsx` — 2 card titles + descriptions (Photography, Film).
- `components/home/HomeCreativeSystem.tsx` — section h2 + p, plus an NFT card title.
- `components/home/HomeServicesPreview.tsx` — section h2.
- `components/home/HomeTrustAndShowreel.tsx` — 2 section h2s (trust panel, showreel panel) + a fallback paragraph used when no testimonial exists yet.
- `app/page.tsx` — the closing `StickyCta` title/description/buttonLabel. The same
  pattern (custom `StickyCta` copy, hardcoded) also exists on `app/nft/page.tsx`,
  `app/people/page.tsx`, and `app/people/[slug]/page.tsx` — not unique to home.

That's 5 components beyond the hero, each with their own heading (and in 2 cases, card-level
sub-titles) — a genuinely different shape than the one-header-per-page pattern everywhere
else. Session N4 covers the hero only (same field shape as every other page). The rest
shipped in Session N5 as the `page_sections` collection (one document per slug), the
Sections/CTA groups inside the consolidated `/admin/pages` UI, and admin-wired `StickyCta`
copy on every public page that renders one (Services and Contact deliberately have none).
About / Dancing / Web Development / Blog are interim pages awaiting their design-pass
sessions — each currently holds just a header + one `{title, text}` card grid + the
booking bar, and both the pages and their admin forms are expected to change again in
those sessions (see SESSION-QUEUE.md N5 Part 3 for the confirmed per-page group table).

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
components/shared/PageHeader.tsx — all public page headers (h1 + description). Props:
`title`, `description?`, `className?`, `titleClassName?` (added in Session N4 so
about/page.tsx can keep its larger hero-size title without a one-off component). **No
`eyebrow` prop** — removed in N4. It existed on only 4 of 11 pages (dancing, web-development,
plus the hand-rolled chips on about and blog) with no stated reason for which pages got one
and which didn't. That inconsistency was visible in the first audit and should have been
flagged as a decision point instead of silently carried into the new CMS as an "optional"
field — caught when Hussain reviewed the plan directly, not by this audit. Removed sitewide
rather than half-kept.
Confirmed gap as of this audit: about/page.tsx, services/page.tsx, people/page.tsx,
testimonials/page.tsx, and blog/page.tsx were hand-rolling their own h1+p instead of using
this — fixed in Sessions F4 (services, people) and N4 (about, blog). testimonials/page.tsx
keeps its own distinct hero-card layout deliberately — it's a genuinely different design,
not a missed migration.
components/shared/PortfolioCard.tsx — all full-bleed image cards with overlay
components/shared/AnimatedText.tsx — all text reveals. **Word-mode only, scroll-triggered
via ScrollTrigger. Does not currently support char/line modes** — correct this doc if/when
that capability actually gets built, don't assume it exists.
components/admin/action-feedback/AdminActionFeedback.tsx — at least 6 admin clients
duplicate the loading+fetch+try/catch+setFeedback boilerplate around this by hand instead
of sharing a hook. Scheduled for Session F5.
components/search/SearchInput.tsx
components/admin/private-galleries/PrivateGalleryMediaPicker.tsx — 93-line media picker
built for private galleries. Session N7 (pending) adapts this for admin-selectable card
images (Work overlay + Featured Work) rather than building a second picker from scratch —
read it fully first to confirm what's private-gallery-specific versus generic.
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
- **Before marking a session `done`: re-read that session's own task list against the
  files actually changed and confirm each listed item was completed, not just attempted.**
  F2 listed about/page.tsx in scope and marked itself done without migrating it; N1 shipped
  a 4-item nav against a 3-item spec without flagging the deviation. Both were caught by a
  later full-repo audit instead of at commit time — that gap is what this line is for.

## Design tokens
Colors: OKLCH tokens in globals.css — confirmed in active use (52 references). Use
variables, never hardcode hex. **One unflagged violation found on re-check:**
`components/home/HomeHero.tsx:27` — `bg-[#1a1814]` is a raw hex value, not a token. Fixed
as part of Session N4 (that file is already being touched there for the header copy) —
propose a named CSS variable or confirm an existing dark token is close enough, rather than
guessing which is "correct" without seeing it rendered.

Radius: rounded-xl, rounded-2xl, rounded-3xl only. **This rule does not match the actual
codebase and was never re-checked until now.** 83 instances of arbitrary `rounded-[Xrem]`
values exist across the repo — `rounded-[2rem]` alone appears 47 times, plus
`rounded-[1.25rem]`, `rounded-[2.25rem]`, `rounded-[1.5rem]`, and 8 other distinct values,
consistently, on nearly every card and panel sitewide, including in `PortfolioCard.tsx`
itself (one of the reusable components this same doc tells you to always use). A pattern
that consistent, that widespread, isn't 83 separate mistakes — it's the actual radius
scale the site has been built with, and this line is stale. Two real options, not a third
where I quietly pick one: (a) update this rule to document the scale that's actually in
use, or (b) treat it as a real design-system gap and do a deliberate, scoped pass to
convert everything to the 3-token scale. (b) is a much bigger, visually-risky undertaking
than it sounds — it touches nearly every visual surface on the public site. Not scheduled
in any session until you say which.

Section container: always use .section-shell class — never write mx-auto max-w-6xl px-4
inline. **Also not actually true today.** `.section-shell` (`mx-auto max-w-6xl px-4`,
confirmed in globals.css) is used by exactly 6 files — `Navbar.tsx`, `SiteFooter.tsx`, and
the 4 home/* section components. Every public page.tsx (photography, videography, nft,
dancing, web-development, about, blog, services, services/[slug], people, people/[slug],
g/[slug]/page.tsx — 12 files) writes the identical `mx-auto max-w-6xl px-4` inline instead.
This one's a safe, mechanical fix — the values are byte-for-byte what `.section-shell`
already encodes — scheduled in Session F4. Three files intentionally use a different
width and should stay that way, not get forced in: `contact/page.tsx` (max-w-4xl, a
focused booking form), `g/[slug]/GalleryPasswordForm.tsx` (max-w-xl, a centered password
prompt), `testimonials/page.tsx` (max-w-7xl, its wider stats/map hero layout).

## Claude tooling for this project
- **Claude Code Desktop (Code tab):** all development sessions. Triggered by "Continue queue".
- **Cowork:** all copy writing after design is complete. Always use hm-visuals-voice skill.
- **Claude Design project:** design decisions and mockups before building.
- **This claude.ai interface:** planning, architecture, interview sessions, full-repo audits. Does not write or edit repo code directly — corrections from a planning session land here and in SESSION-QUEUE.md, then get executed via "Continue queue".

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
Good: "feat(preloader): GSAP icon sequence with Hussain.Art reveal"
Bad: "fix bugs" / "update files"

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).