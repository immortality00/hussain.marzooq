# HM Visuals — Session Queue

## How to use
Open a new Code tab → open portfolio folder → paste: **Continue queue**

Claude reads this file, finds the next `pending` session, runs the full
3-gate cycle (plan → execute → commit), marks it `done`, then tells you
to open a new session. You touch three gates per session, nothing else.

---

## Status legend
`done` — complete and committed to GitHub
`in-progress` — current active session (reset to `pending` if session was interrupted)
`pending` — not yet started

---

## Phase 2 — Design transformation

### Session 1 — Animation libraries — `done`
### Session 2 — shadcn/ui components — `done`
### Session 3 — Dark/light mode with toggle — `done`
### Session 4 — Custom cursor — `done`
### Session 5 — Grain texture — `done`
### Session 6 — Typography animation system — `done`

---

### Session 7 — Homepage hero redesign — `done`

Full redesign of the homepage hero. Current state: static two-column
layout. Target: full-viewport dark hero with a Three.js 3D element,
GSAP text reveal using the AnimatedText component from Session 6,
and a cinematic full-bleed image behind the content.
Read components/home/HomeHero.tsx and app/page.tsx first.
Propose the Three.js approach and wait for confirmation before writing
any code. This is the most important component — plan carefully.

---

### Session 8 — Photography gallery horizontal scroll — `pending`

Redesign the photography gallery to horizontal scroll on desktop
and full-screen modal on mobile. Existing search and filter must
stay fully functional — integrate as an overlay that does not
break the horizontal scroll experience.
Read app/photography/page.tsx and every component it imports first.

---

### Session 9 — Exhibition cities globe — `pending`

Implement react-globe.gl on the homepage showing exhibition cities.
Globe must: rotate slowly, show city markers with labels on hover,
use dark charcoal color palette from design tokens, sit in a dedicated
section below the hero.
Read the current homepage structure and the installed react-globe.gl
package before building.

---

### Session 10 — NFT section redesign — `pending`

Redesign NFT page to feel like a premium digital collector experience.
Dark, precise, 3D card flip on hover revealing pricing and edition
details, collector-grade layout.
Read app/nft/page.tsx and all NFT components before proposing anything.

---

### Session 11 — Magnetic button effect — `pending`

Add magnetic hover effect to all primary CTA buttons sitewide.
Cursor approaching a button causes it to subtly attract toward cursor.
Read every file rendering a primary CTA button before building.
Apply consistently everywhere. Admin excluded.

---

### Session 12 — Final consistency pass — `pending`

Review every public page for visual consistency. Check and fix:
dark background consistent everywhere in dark mode, light mode clean,
typography scale consistent, spacing follows token scale, no placeholder
or internal copy visible to visitors.
Read all public page components. Report every inconsistency before fixing.
Admin excluded.

---

## Phase 3 — Content upload and launch
*Prompts to be added*

## Phase 4 — Revenue activation
*Prompts to be added*

## Phase 5 — Base chain NFT smart contract
*Prompts to be added*