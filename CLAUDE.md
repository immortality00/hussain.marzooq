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
Framer Motion, GSAP + @gsap/react + ScrollTrigger, Lenis

## Design direction
Dark warm charcoal base (~#1a1814). Photography glows against it.
Typography: large, dramatic, editorial. Animated reveals. Type is a design element.
Hero: 3D + animation combined. Must not look like a normal portfolio.
Photography gallery: horizontal scroll desktop, full-screen modal mobile,
search/filter overlay that preserves the cinematic feel.
Globe: react-globe.gl showing exhibition cities on homepage.
Custom cursor, grain texture overlay, magnetic hover on CTAs.
Dark is always the default — no light mode.

## Phase status
Phase 0: Complete
Phase 1: Complete — fonts, mobile nav, email notifications, ISR all fixed
Phase 2: In progress — design transformation

## Hussain's workflow
He describes what he wants. Explain the plan and confirm before writing code.

FILE OUTPUT RULE:
- Single file changes: output the complete replacement file so Hussain
  can review and replace manually in VS Code
- Multi-file changes (3 or more files): edit files directly without
  outputting — do not ask permission, just edit and report what changed
- Never output partial files or snippets for either case

## Coding rules — never break these
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
components/site/AppShell.tsx — wraps all public pages, place global
elements here (cursor, grain texture, etc.)

## Design tokens
Surface: surface-1, surface-2, surface-3
Shadows: shadow-soft, shadow-elevated
Colors: OKLCH tokens in globals.css — use variables, never hardcode hex
Radius: rounded-xl, rounded-2xl, rounded-3xl, rounded-[2rem], rounded-[2.25rem]

## Mandatory session behavior — always follow without being asked

### Before every change
Search the entire project for every file that imports, references, or
connects to anything you plan to change. Read all connected files. Report
what is connected and what could be affected before writing a single line
of code.

### After every change
Tell Hussain exactly what to check to confirm no bugs or errors:
- Which URL to open in the browser (e.g. localhost:3000)
- What to click or interact with
- What should visually appear or functionally work
- What to look for in the terminal for errors
Be specific. Not "check the navbar" but "open localhost:3000, resize below
1280px, confirm the hamburger icon appears, click it, confirm all 11 nav
items are visible, close it, confirm the page scrolls normally."

Then wait. Do not provide git commands yet.

### After Hussain explicitly confirms everything works
Only after Hussain confirms — never before — provide the exact git commands:
git add [exact list of files changed]
git commit -m "[specific: what file, what was fixed, what was preserved]"
git push

Commit message format:
Good: "feat(cursor): add custom magnetic cursor component to AppShell"
Good: "feat(hero): add Three.js 3D element and GSAP text reveal to HomeHero"
Bad: "fix bugs" or "update files"