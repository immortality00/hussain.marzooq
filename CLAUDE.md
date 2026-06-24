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

## Hussain's workflow
He describes what he wants. Explain the plan and confirm before writing code.
Provide COMPLETE replacement files only — never snippets.
He reviews in VS Code and replaces files manually.

## Critical blockers — fix in this exact order
1. FONTS: Geist not imported in app/layout.tsx — renders in system fonts
2. MOBILE NAV: hidden xl:flex — nothing below 1280px, site unnavigable on phones
3. EMAIL: no notification library — inquiries arrive silently (use Resend)
4. CACHING: force-dynamic on all public pages — add ISR + revalidatePath from admin

## Coding rules — never break these
- Complete replacement files only. Zero snippets.
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
components/site/Navbar.tsx — needs mobile hamburger menu added
components/site/AppShell.tsx — wraps all public pages

## Design tokens
Surface: surface-1, surface-2, surface-3
Shadows: shadow-soft, shadow-elevated
Colors: OKLCH tokens in globals.css — use variables, never hardcode hex
Radius: rounded-xl, rounded-2xl, rounded-3xl, rounded-[2rem], rounded-[2.25rem]

## Phase status
Phase 0: Setup (this file + projects + memory)
Phase 1: Fix blockers (fonts, mobile nav, email, ISR) — DO FIRST
Phase 2: Design transformation (3D hero, animations, dark theme, gallery, globe)
Phase 3: Content upload and launch
Phase 4: Revenue (NFT live, dance booking, preset packs)
Phase 5: Smart contract ERC-721 on Base chain

## Mandatory session behavior — always follow without being asked

### Before every change
Search the entire project for every file that imports, references, or connects
to anything you plan to change. Read all connected files. Report what is
connected and what could be affected before writing a single line of code.

### After every file replacement
Immediately tell Hussain exactly what to check to confirm there are no bugs
or errors:
- Which URL to open in the browser
- What to click or interact with
- What should visually appear or functionally work
- What to look for in the terminal for errors
Be specific. Not "check the navbar" — "open localhost:3000, resize the window
below 1280px, confirm the hamburger icon appears, click it, confirm the drawer
opens and all 11 nav items are visible, close it, confirm the page scrolls
normally."

### After Hussain confirms everything works
Without being asked, provide the exact git commands to commit the change:
git add [exact files changed]
git commit -m "[specific description of what was fixed]"
git push
Use a meaningful commit message that describes the actual change, not "fix bugs."