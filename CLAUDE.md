# HM Visuals — Claude Working Document

## Who this is for
Hussain Marzooq — internationally exhibited photographer and videographer,
active NFT artist (OpenSea + multiple platforms, wants own smart contract),
working dance teacher with established student base,
web developer returning after a gap. Dubai-based, international market.

## The site
A premium creative portfolio + custom admin platform replacing an existing
live site as a full rebrand. The admin works. Content is ready. The site
needs to launch — opportunities are being missed every week without it.

## Stack
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
MongoDB Atlas, Cloudinary, Vercel
shadcn/ui new-york (configured, but components/ui/ does not exist — install before using)
Three.js + react-globe.gl (installed, NOT yet implemented — Phase 2 work)

## Animation stack (Phase 2 — not yet installed)
Framer Motion — page transitions and component animations
GSAP + ScrollTrigger — scroll-driven sequences
Lenis — smooth scrolling

## Design direction
Dark warm charcoal base (~#1a1814). Not pure black — photos glow against it.
Typography: Large, dramatic, editorial. Animated reveals. Type is a design element.
Hero: 3D + animation combined. Must not look like a normal portfolio.
Photography gallery: horizontal scroll (desktop), full-screen modal (mobile),
search/filter overlay that doesn't break the cinematic feel.
Globe: react-globe.gl showing exhibition cities on homepage.
Custom cursor, grain texture overlay, magnetic hover on CTAs.
Dark is always the default — no light mode.

## Hussain's workflow
He describes what he wants. You explain the plan and ask before writing code.
You provide COMPLETE replacement files only — never snippets, never partials.
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
- No native confirm() dialogs anywhere.
- Radius: rounded-xl, rounded-2xl, rounded-3xl only (no arbitrary values).

## Shared components — always reuse, never reinvent
- components/admin/action-feedback/AdminActionFeedback.tsx — all admin feedback
- components/search/SearchInput.tsx — all search inputs everywhere
- components/site/PortfolioFallbackPanel.tsx — all empty states
- components/site/Navbar.tsx — needs mobile menu (hamburger) added
- components/site/AppShell.tsx — wraps all public pages

## Design tokens
Surface: surface-1, surface-2, surface-3
Shadows: shadow-soft, shadow-elevated
Colors: OKLCH tokens in globals.css — use variables, never hardcode hex
Radius: rounded-xl, rounded-2xl, rounded-3xl, rounded-[2rem], rounded-[2.25rem]

## Phase status
Phase 0: Setup (complete when this file exists and projects are created)
Phase 1: Fix blockers (fonts, mobile nav, email, ISR) — DO THIS FIRST
Phase 2: Design transformation (3D hero, animations, dark theme, gallery, globe)
Phase 3: Content upload and launch
Phase 4: Revenue (NFT live, dance booking path, preset packs)
Phase 5: Smart contract ERC-721 on Base chain, mint page on portfolio