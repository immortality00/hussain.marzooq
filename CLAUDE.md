# HM Visuals — Claude Working Document

## Who this is for
Hussain Marzooq — internationally exhibited photographer and videographer,
active NFT artist (OpenSea + multiple platforms, wants own smart contract),
working dance teacher with established student base,
web developer returning after a gap. Dubai-based, international market.

## The site
Replacing an existing live site as a full rebrand. The admin works and
content is ready. The site needs to launch — opportunities are missed
every week without it.

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
MongoDB Atlas, Cloudinary, Vercel
shadcn/ui new-york (configured, but components/ui/ does not exist — install before using)
Three.js + react-globe.gl (installed, NOT yet used — Phase 2 work)

## Animation stack (Phase 2 — not yet installed)
Framer Motion, GSAP + ScrollTrigger, Lenis

## Design direction
Dark warm charcoal base (~#1a1814). Photography glows against it.
Typography: large, dramatic, editorial. Animated reveals. Type is a design element.
Hero: 3D + animation combined. Must not look like a normal portfolio.
Photography gallery: horizontal scroll desktop, full-screen modal mobile,
search/filter overlay that preserves the cinematic feel.
Globe: react-globe.gl showing exhibition cities on homepage.
Custom cursor, grain texture overlay, magnetic hover on CTAs.
Dark is always the default — no light mode.

## Hussain's workflow — non-negotiable
- NEVER edit, create, or modify files directly. Ever.
- ALWAYS output the complete replacement file in full so Hussain can copy
  it and replace the file manually in VS Code.
- A complete file means every single line — imports, unchanged sections,
  everything. Never a partial file. Never "replace lines X to Y."
- Hussain replaces the file himself. You do not touch the filesystem.

## Critical blockers — fix in this exact order
1. FONTS: Geist not imported in app/layout.tsx — renders in system fonts
2. MOBILE NAV: hidden xl:flex — nothing below 1280px, site unnavigable on phones
3. EMAIL: no notification library — inquiries arrive silently (use Resend)
4. CACHING: force-dynamic on all public pages — add ISR + revalidatePath from admin

## Coding rules — never break these
- Complete replacement files only. Zero snippets. Zero partial files.
- Read relevant files FIRST. Tell Hussain what you found before changing anything.
- Preserve working logic unless task is specifically a redesign.
- Fix root causes, not symptoms.
- No dead code. No duplicated logic.
- Check for existing helpers before writing new ones.
- No native confirm() dialogs.
- Radius: rounded-xl, rounded-2xl, rounded-3xl only.

## Shared components — always reuse, never reinvent
components/admin/action-feedback/AdminActionFeedback.tsx
components/search/SearchInput.tsx
components/site/PortfolioFallbackPanel.tsx
components/site/Navbar.tsx
components/site/AppShell.tsx

## Design tokens
Surface: surface-1, surface-2, surface-3
Shadows: shadow-soft, shadow-elevated
Colors: OKLCH tokens in globals.css — use variables, never hardcode hex
Radius: rounded-xl, rounded-2xl, rounded-3xl, rounded-[2rem], rounded-[2.25rem]

## Phase status
Phase 0: Setup — complete
Phase 1: Fix blockers (fonts, mobile nav, email, ISR)
Phase 2: Design transformation (3D hero, animations, dark theme, gallery, globe)
Phase 3: Content upload and launch
Phase 4: Revenue (NFT live, dance booking, preset packs)
Phase 5: Smart contract ERC-721 on Base chain

## Mandatory session behavior — always follow without being asked

### Before every change
Search the entire project for every file that imports, references, or connects
to anything you plan to change. Read all connected files. Report what is
connected and what could be affected before writing a single line of code.

### Outputting changes
Output the complete replacement file in full. Never edit files directly.
Never use file-writing tools. Hussain copies and replaces manually in VS Code.
After outputting the file, list every change you made versus the original —
line by line if needed — so Hussain knows exactly what is different.

### After outputting a replacement file
Tell Hussain exactly what to check to confirm no bugs or errors:
- Which URL to open in the browser (e.g. localhost:3000)
- What to click or interact with
- What should visually appear or functionally work
- What to look for in the terminal for errors
Be specific. Not "check the navbar" but "open localhost:3000, resize below
1280px, confirm the hamburger icon appears, click it, confirm all 11 nav
items are visible in the drawer, close it, confirm the page scrolls normally."

Then wait. Do not provide git commands yet.

### After Hussain explicitly confirms everything works
Only after Hussain says it works — never before — provide the exact git
commands. The commit message must accurately describe every file changed
and what was done to each one:
git add [exact list of files changed — no wildcards unless truly everything]
git commit -m "[specific description: what file, what was fixed, what was preserved]"
git push

### Commit message format
Bad: "fix bugs" or "update files"
Good: "fix(layout): add Geist font via next/font/google, apply to html element"
Good: "feat(navbar): add mobile hamburger drawer below xl, preserve desktop nav and modal events"
One commit per logical change. Never bundle unrelated fixes into one commit.