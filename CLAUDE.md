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
shadcn/ui new-york (components/ui/ exists and is installed)
Three.js + react-globe.gl (installed, not yet used — remaining Phase 2 work)

## Animation stack — all installed
Framer Motion, GSAP + @gsap/react + ScrollTrigger, Lenis

## Design direction
Dark warm charcoal base (~#1a1814). Photography glows against it.
Both dark and light mode supported with a toggle — dark is the default.
Typography: large, dramatic, editorial. Animated reveals. Type is a design element.
Hero: 3D + animation combined. Must not look like a normal portfolio.
Photography gallery: horizontal scroll desktop, full-screen modal mobile,
search/filter overlay preserving cinematic feel.
Globe: react-globe.gl showing exhibition cities on homepage — pending.
Custom cursor: implemented in AppShell — dot follows mouse, expands on hover.
Grain texture: fixed position, full viewport, uniform CSS noise only, 3-5% opacity,
above backgrounds, below all content and cards.
No gradients. No vignette. No oval shapes. Must not bleed into cards.
Magnetic hover on CTAs — pending.
Admin pages: completely excluded from all design changes. Never touch admin.

## Phase status
Phase 0: Complete
Phase 1: Complete — fonts, mobile nav, email notifications, ISR
Phase 2: In progress — see SESSION-QUEUE.md for per-session status
Phase 3–5: Pending — prompts to be added to SESSION-QUEUE.md

---

## Queue protocol — runs when opening message is exactly "Continue queue"

1. Read SESSION-QUEUE.md at project root
2. Find the next session with status `pending`
3. Set its status to `in-progress` in SESSION-QUEUE.md immediately
4. Run the 3-gate cycle below using that session's prompt

### Gate 1 — Plan
- Read every file connected to the task
- Report every affected file and what could break
- Present the complete plan
- STOP. Write no code until Hussain says yes.

### Gate 2 — Execute
- Make all changes per approved plan
- Follow all coding rules and file output rules below
- Tell Hussain: which URL to open, what to click, what should appear, what to watch in terminal
- STOP. Wait for confirmation that everything works.
- If errors reported: diagnose root cause, fix, repeat Gate 2 check
- Do not proceed to Gate 3 until Hussain explicitly confirms working

### Gate 3 — Commit
- Provide exact git commands:
  git add [exact files changed]
  git commit -m "[type(scope): specific description]"
  git push
- STOP. Wait for Hussain to confirm the push is done.
- When confirmed: set session status to `done` in SESSION-QUEUE.md
- Print exactly this line and stop:
  Session [N] done. Open a new Code tab, open the portfolio folder, and paste: Continue queue

---

## Hussain's workflow
He describes what he wants. Explain the plan and confirm before writing code.

FILE OUTPUT RULE:
- Single file changes: output complete replacement file for manual review
- Multi-file changes (3 or more): edit directly, report what changed
- Never output partial files or snippets

## Coding rules — never break these
- Read relevant files FIRST before changing anything
- Report what is connected and what could be affected before writing any code
- Preserve working logic unless task is specifically a redesign
- Fix root causes, not symptoms
- No dead code, no duplicated logic
- No native confirm() dialogs
- Radius: rounded-xl, rounded-2xl, rounded-3xl only
- Never touch admin pages unless explicitly instructed

## Shared components — always reuse, never reinvent
components/admin/action-feedback/AdminActionFeedback.tsx
components/search/SearchInput.tsx
components/site/PortfolioFallbackPanel.tsx
components/site/Navbar.tsx
components/site/AppShell.tsx — wraps all public pages, all global elements live here

## Design tokens
Surface: surface-1, surface-2, surface-3
Shadows: shadow-soft, shadow-elevated
Colors: OKLCH tokens in globals.css — use variables, never hardcode hex
Radius: rounded-xl, rounded-2xl, rounded-3xl, rounded-[2rem], rounded-[2.25rem]

## Mandatory session behavior — always follow without being asked

### Before every change
Search entire project for every file connected to what you plan to change.
Read all connected files. Report what is affected before writing any code.

### After every change
Tell Hussain exactly what to check:
- Which URL to open in the browser
- What to click or interact with
- What should visually appear or functionally work
- What to watch in the terminal
Be specific. Then wait. Do not provide git commands yet.

### After Hussain explicitly confirms everything works
Only then provide exact git commands:
git add [exact files changed]
git commit -m "[specific: what file, what was done]"
git push
Good: "feat(hero): add Three.js particle field with GSAP text reveal"
Bad: "fix bugs" or "update files"