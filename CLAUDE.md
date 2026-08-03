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
Every week without it is a missed booking. Design must match igloo.inc,
aikawakenichi.com, and ten.375.studio in creative ambition and execution level.

## Domain
hussain-marzooq.com (live on Netlify). Target: hussain.art when ready.
Launch does not wait for hussain.art.

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
- `img-src` in the CSP allows `res.cloudinary.com` only — a new image host needs a CSP
  edit too.

## Animation stack status
- Lenis: initialized in `AppShell.tsx` (public pages only, not admin). Synced to
  ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)` (added in D3).
- GSAP ScrollTrigger: used in `AnimatedText.tsx` scroll reveals — still underused
  elsewhere, core of scroll design.
- Three.js: `HeroBokeh.tsx` (180-point shader system) and
  `components/photography/PhotographyCylinder.tsx` (D3 viewer).
- react-globe.gl: installed, not yet built (Session D6).
- Framer Motion: installed, used minimally.

## Design direction — the standard
Match the creative and technical level of:
- **aikawakenichi.com** — Three.js 3D cylinder, glass shard transitions, photography as the primary visual element
- **ten.375.studio** — panel-based transitions using content; content IS the animation material
- **igloo.inc** — full 3D WebGL environment as the primary layer

This means: page transitions use the actual photos/videos on each page as the animation
material; every page has a unique transition in and out; no generic overlays; the work IS
the design.

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
Per-route specs live in SESSION-QUEUE.md §D4. Homepage in/out transition is explicitly
deferred — see "Gaps awaiting a decision" in the queue.

## Globe (D6, pending)
react-globe.gl on the homepage. Data: `appearances.kind === "exhibited"` only, dynamic.
Auto-rotate, drag, resume. Click city → existing popup/lightbox with that city's works.
Dark charcoal tokens. Spec: SESSION-QUEUE.md §D6.

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
picks). **Empty means empty** — no auto-pick; the hero is the one exception (never blank).
Interim pages (About, Dancing, Web Development, Blog) = header + card grid + booking bar
until their design passes. Full history: archive §N3–§N7.

## Open Graph images
Per-page OG images from actual photography (Phase 3, queue §C2).

## Analytics
Plausible, one script tag, public pages only (Phase 3, queue §C3).

## Admin design
Visual consistency with the portfolio (dark theme, same typography/tokens/shadcn styling).
Not a layout rebuild (queue §D9).

## Appearances admin — update needed
Location field is free text; must become the validated searchable city selector used in
testimonials. Required for the globe (queue §C4).

## Reusable components — always use, never reinvent
- `components/shared/PageHeader.tsx` — all public page headers. Props: `title`,
  `description?`, `className?`, `titleClassName?`. **No `eyebrow` prop — removed
  sitewide in N4, do not reintroduce** (history: archive §N4). Exception:
  `testimonials/page.tsx` keeps its own hero-card layout deliberately.
- `components/shared/PortfolioCard.tsx` — all full-bleed image cards with overlay.
- `components/shared/AnimatedText.tsx` — all text reveals. **Word-mode only,
  scroll-triggered.** No char/line modes — don't assume they exist.
- `useAdminAction` hook + `AdminActionFeedback` — all admin loading/fetch/feedback
  flows (F5). Never hand-roll the try/catch+setFeedback pattern.
- `components/admin/media-picker/MediaPickerModal.tsx` + `ImageField.tsx` — all admin
  image pick/upload flows (N7). Don't build another picker.
- `components/services/ServiceCard.tsx` — all service cards (`preview` variant for the
  homepage).
- `components/media/useMediaSearch.ts` / `MediaGridResults` / `MediaTagChips` — all
  media search/filter surfaces (D3). `MediaGrid` composes them.
- `components/search/SearchInput.tsx` · `components/site/PortfolioFallbackPanel.tsx` ·
  `components/site/Navbar.tsx` · `components/site/AppShell.tsx` (Lenis + all global
  elements live here).

## Code quality rules
- **Any code that can become a reusable component must be refactored into one.** Reuse
  over repetition, always — this is the primary rule, not file length.
- **No big files. Even 100 lines is a lot** — exceed only when genuinely unavoidable
  (a cohesive scene/route that cannot be split without harming clarity), and state why.
- No duplicated patterns — extract to shared components
- No inline styles when a token exists
- No dead code, no duplicated logic
- Before every session: audit connected files, report what changes and what could break
- Never touch admin pages unless the session is specifically for admin
- **Before marking a session `done`: re-read that session's own task list against the
  files actually changed and confirm each listed item was completed, not just attempted.**
  (F2 and N1 both shipped gaps that were only caught by later audits — archive §F2, §N1.)

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
- Radius: **open decision** — the documented 3-token rule (rounded-xl/2xl/3xl) does not
  match the codebase (83 arbitrary `rounded-[Xrem]` uses, `rounded-[2rem]` ×47, incl.
  `PortfolioCard.tsx`). Either codify the de-facto scale or run a scoped conversion pass.
  Waiting on Hussain — listed in the queue's "Gaps awaiting a decision." Until decided:
  match the surrounding file's existing radius, don't "fix" either direction.
- Section container: use `.section-shell` (`mx-auto max-w-6xl px-4`) — never write it
  inline. Adopted sitewide in F4. Three intentional exceptions keep their own width:
  `contact/page.tsx` (max-w-4xl), `g/[slug]/GalleryPasswordForm.tsx` (max-w-xl),
  `testimonials/page.tsx` (max-w-7xl).

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
