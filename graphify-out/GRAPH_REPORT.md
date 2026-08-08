# Graph Report - .  (2026-08-08)

## Corpus Check
- 21 files · ~136,186 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1670 nodes · 3658 edges · 105 communities (80 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- getDb()
- AdminServiceCategoriesClient.tsx
- admin.ts
- PhotographyViewer.tsx
- types.ts
- PrivateGalleriesAdminClient.tsx
- useServicesAdmin.ts
- devDependencies
- cloudinary-assets.ts
- route.ts
- media-serializers.ts
- getPageSeo()
- cn()
- Animation Recipes
- testimonials.ts
- HM Visuals Session Archive
- Phase 2 — Preloader & core experience
- compilerOptions
- page.tsx
- Animation Standards Reference
- page-sections.ts
- What You Must Do When Invoked
- ContactForm.tsx
- Animation Audit Playbook
- PublicReviewForm.tsx
- public-services.ts
- dependencies
- lib.ts
- page-settings.ts
- Apple Design
- PageRowCard.tsx
- Workflow
- Design Audit
- page-sections-shared.ts
- components.json
- Glossary
- isAdminAuthedServer()
- page.tsx
- HM Visuals Claude Working Document
- Finding Animation Opportunities
- SectionsGroup.tsx
- layout.tsx
- The list
- Reusable components — always use, never reinvent
- Queue protocol — 3-gate cycle (Continue queue)
- AppShell.tsx
- Design Engineering
- ImageField.tsx
- graphify reference: extra exports and benchmark
- Component Building Principles
- Current auth state (scrypt hash, HMAC session, 2-day TTL) (S1)
- What is NOT in the design (no scroll-jack, no gradients, grain)
- Page content CMS — three collections, one admin surface
- Frontend Design
- HomeHero.tsx
- ensure-indexes.mjs
- The Animation Decision Framework
- clip-path for Animation
- Performance Rules
- Gesture and Drag Interactions
- graphify reference: query, path, explain
- WorkOverlay.tsx
- CSS Transform Mastery
- The Sonner Principles (Building Loved Components)
- Spring Animations
- import-geonames-cities.mjs
- Core Philosophy
- Debugging Animations
- route.ts
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- cloudinary-image-loader.ts
- next.config.ts
- README.md
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AppShell()
- generate-admin-password-hash.mjs
- CLAUDE.md
- extraction-spec.md
- cloudinary
- @dnd-kit/core
- eslint.config.mjs
- gsap
- @gsap/react
- lucide-react
- mongodb
- next-themes
- radix-ui
- react-globe.gl
- resend
- three
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- server-modules.test.ts
- vitest.config.ts
- Globe Icon
- Geist font (next/font)
- Next.js (create-next-app)

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 108 edges
2. `noStoreJson()` - 72 edges
3. `isRecord()` - 48 edges
4. `getPageSeo()` - 40 edges
5. `HM Visuals Claude Working Document` - 35 edges
6. `requireAdminObjectId()` - 30 edges
7. `asNullableString()` - 29 edges
8. `requireAdminOr401()` - 29 edges
9. `findByIdOr404()` - 27 edges
10. `HM Visuals Session Archive` - 26 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/testimonials/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (105 total, 25 thin omitted)

### Community 0 - "getDb()"
Cohesion: 0.05
Nodes (122): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET() (+114 more)

### Community 1 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.06
Nodes (43): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+35 more)

### Community 2 - "admin.ts"
Cohesion: 0.07
Nodes (54): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, buildAccessRateLimitKey() (+46 more)

### Community 3 - "PhotographyViewer.tsx"
Cohesion: 0.06
Nodes (34): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), AppearanceBlock(), MediaFilterBar(), MediaGrid(), MediaSurface(), MediaTagChips(), SmartMediaPreviewFit (+26 more)

### Community 4 - "types.ts"
Cohesion: 0.08
Nodes (39): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+31 more)

### Community 5 - "PrivateGalleriesAdminClient.tsx"
Cohesion: 0.08
Nodes (28): MediaListFilterBar(), Props, PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl() (+20 more)

### Community 6 - "useServicesAdmin.ts"
Cohesion: 0.10
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 7 - "devDependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 8 - "cloudinary-assets.ts"
Cohesion: 0.12
Nodes (37): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+29 more)

### Community 9 - "route.ts"
Cohesion: 0.14
Nodes (30): POST(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), POST(), GET(), isAllowedCloudinaryTestimonialUrl(), NormalizedResolvedLocation (+22 more)

### Community 10 - "media-serializers.ts"
Cohesion: 0.11
Nodes (33): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+25 more)

### Community 11 - "getPageSeo()"
Cohesion: 0.20
Nodes (22): AboutPage(), generateMetadata(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage(), generateMetadata() (+14 more)

### Community 12 - "cn()"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 13 - "Animation Recipes"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 14 - "testimonials.ts"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+14 more)

### Community 15 - "HM Visuals Session Archive"
Cohesion: 0.10
Nodes (32): SiteFooter.tsx (glass-panel low-contrast finding), StickyCta.tsx (glass-panel low-contrast finding), WorkOverlay.tsx (9px discipline sublabels finding), Impeccable detector (URL-only 59-rule scan on this codebase), HM Visuals Session Archive, Session D1 — Preloader (GSAP icon sequence + Hussain.Art reveal), Session D13 — absorbs DS1's 5 Real design findings, Session D3 — Photography 3-view viewer (Cylinder/Horizontal/Grid) (+24 more)

### Community 16 - "Phase 2 — Preloader & core experience"
Cohesion: 0.09
Nodes (32): Gap 2 — About rebuild unscheduled, Gap 1 — Homepage design session missing, Gap 3 — Radius scale decision, Gap 4 — Tests / CI baseline (S3 shipped), Gaps awaiting a decision from Hussain, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep (+24 more)

### Community 17 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 18 - "page.tsx"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 19 - "Animation Standards Reference"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 20 - "page-sections.ts"
Cohesion: 0.11
Nodes (21): AdminPagesPage(), generateMetadata(), HomePage(), DISCIPLINE_LINKS, HomeCreativeSystem(), CTA_LABELS, HomeFeaturedWork(), PortfolioCard() (+13 more)

### Community 21 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 22 - "ContactForm.tsx"
Cohesion: 0.18
Nodes (14): ContactActions(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode, useContactFormState() (+6 more)

### Community 23 - "Animation Audit Playbook"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 24 - "PublicReviewForm.tsx"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 25 - "public-services.ts"
Cohesion: 0.17
Nodes (18): ContactPage(), generateMetadata(), SP, generateMetadata(), ServicesPage(), ContactForm(), disciplineSlugForCategory(), HomeServicesPreview() (+10 more)

### Community 26 - "dependencies"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, next, next-cloudinary (+15 more)

### Community 27 - "lib.ts"
Cohesion: 0.26
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 28 - "page-settings.ts"
Cohesion: 0.17
Nodes (17): DISCIPLINES, GET(), BlogPage(), generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), isSectionImage() (+9 more)

### Community 29 - "Apple Design"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 30 - "PageRowCard.tsx"
Cohesion: 0.18
Nodes (15): PageRowCard(), SectionsData, RowPill(), SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS (+7 more)

### Community 31 - "Workflow"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 32 - "Design Audit"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 33 - "page-sections-shared.ts"
Cohesion: 0.19
Nodes (11): CardsCtaForm(), SLUG_LABELS, TextAreaField(), TextField(), RepeatingCardListEditor(), RepeatingListEditor(), CtaCopy, EMPTY_SECTION_IMAGE (+3 more)

### Community 34 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 35 - "Glossary"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 36 - "isAdminAuthedServer()"
Cohesion: 0.20
Nodes (13): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, AdminThemeToggle(), useIsMounted() (+5 more)

### Community 37 - "page.tsx"
Cohesion: 0.16
Nodes (11): ServiceDetailPage(), generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel() (+3 more)

### Community 38 - "HM Visuals Claude Working Document"
Cohesion: 0.12
Nodes (18): Admin design (visual consistency, D9), Analytics — Plausible (Phase 3, C3), Animation stack status (Lenis, GSAP, Three.js, globe, Framer), Appearances admin — city selector needed (C4), Blog (C1, pending), Dancing page (D10, pending), Design direction — the standard (aikawakenichi, ten.375, igloo), Domain (hussain-marzooq.com on Netlify) (+10 more)

### Community 39 - "Finding Animation Opportunities"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 40 - "SectionsGroup.tsx"
Cohesion: 0.18
Nodes (10): CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS, HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS (+2 more)

### Community 41 - "layout.tsx"
Cohesion: 0.22
Nodes (7): metadata, CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 42 - "The list"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 43 - "Reusable components — always use, never reinvent"
Cohesion: 0.24
Nodes (10): app/api/_lib/admin-route.ts helpers (S2b), AnimatedText.tsx (word-mode only, scroll-triggered), Code quality rules (reuse over repetition, no big files), useMediaSearch / MediaGridResults / MediaTagChips (D3), No scroll-jacking anywhere, PageHeader.tsx (no eyebrow prop), Photography viewer — Cylinder/Horizontal/Grid (D3), PortfolioCard.tsx (full-bleed image cards) (+2 more)

### Community 44 - "Queue protocol — 3-gate cycle (Continue queue)"
Cohesion: 0.20
Nodes (10): Claude tooling for this project, Commit message format (type(scope): desc), File output rule (single vs multi-file changes), Gate 1 — Plan, Gate 1 security questions (trust boundary, secrets, validation), Gate 2 — Execute, Gate 3 — Commit (doc sync, two commits), graphify — knowledge graph at graphify-out/ (+2 more)

### Community 45 - "AppShell.tsx"
Cohesion: 0.24
Nodes (6): Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS, Preloader()

### Community 46 - "Design Engineering"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 47 - "ImageField.tsx"
Cohesion: 0.33
Nodes (6): CardImageGroup(), CardImageWarning(), getString(), ImageField(), isRecord(), MediaPickerModal()

### Community 48 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 49 - "Component Building Principles"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 50 - "Current auth state (scrypt hash, HMAC session, 2-day TTL) (S1)"
Cohesion: 0.25
Nodes (8): Current auth state (scrypt hash, HMAC session, 2-day TTL) (S1), Content-Security-Policy in next.config.ts, Empty means empty everywhere (no auto-pick), Image pipeline — Cloudinary custom loader, optimizer bypassed, npm run lint must stay at 0 errors and 0 warnings (S7), Rate limiting — lib/server/request-guards.ts, lib/auth/session-token.ts (runtime-agnostic auth constants), Testing & CI — Vitest (S3)

### Community 51 - "What is NOT in the design (no scroll-jack, no gradients, grain)"
Cohesion: 0.32
Nodes (8): Design & motion skills — routing table, Design tokens (OKLCH, radius open decision, section-shell), Grain texture rule (uniform CSS noise, 3-5% opacity), Impeccable detector (deterministic anti-pattern scan), Impeccable detector — URL-only on this codebase (DS1), No decorative gradients anywhere, Skill conflicts — this project wins, always, What is NOT in the design (no scroll-jack, no gradients, grain)

### Community 52 - "Page content CMS — three collections, one admin surface"
Cohesion: 0.25
Nodes (8): MediaPickerModal + ImageField (N7), Navigation — 6-item nav (Work/About/Services/People/Testimonials/Book), Open Graph images (Phase 3, C2), Page activity toggle (isActive on 5 disciplines), Page content CMS — three collections, one admin surface, page_sections collection (per-slug section content), page_seo collection (title/desc/og + header fields), page_settings collection (visibility + cardImage)

### Community 53 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 54 - "HomeHero.tsx"
Cohesion: 0.43
Nodes (5): HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero(), SectionImage

### Community 55 - "ensure-indexes.mjs"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 56 - "The Animation Decision Framework"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 57 - "clip-path for Animation"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 58 - "Performance Rules"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 59 - "Gesture and Drag Interactions"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 60 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 61 - "WorkOverlay.tsx"
Cohesion: 0.40
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 62 - "CSS Transform Mastery"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 63 - "The Sonner Principles (Building Loved Components)"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 64 - "Spring Animations"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 65 - "import-geonames-cities.mjs"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 66 - "Core Philosophy"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 67 - "Debugging Animations"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 68 - "route.ts"
Cohesion: 0.67
Nodes (3): PATCH(), SLUG_TO_PATH, ALL_SEO_SLUGS

### Community 69 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 70 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 71 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 72 - "cloudinary-image-loader.ts"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 73 - "next.config.ts"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 74 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 77 - "AppShell()"
Cohesion: 0.67
Nodes (3): AppShell(), lenis, lenis

## Knowledge Gaps
- **507 isolated node(s):** `InquiryStatus`, `nav`, `SelectedPerson`, `currencies`, `NftMeta` (+502 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `getDb()` to `admin.ts`, `isAdminAuthedServer()`, `route.ts`, `useServicesAdmin.ts`, `page.tsx`, `route.ts`, `media-serializers.ts`, `getPageSeo()`, `testimonials.ts`, `page-sections.ts`, `public-services.ts`, `lib.ts`, `page-settings.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `three`, `devDependencies`, `AppShell()`, `cloudinary`, `@dnd-kit/core`, `gsap`, `@gsap/react`, `lucide-react`, `mongodb`, `next-themes`, `radix-ui`, `react-globe.gl`, `resend`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell()` to `layout.tsx`, `AppShell.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `InquiryStatus`, `nav`, `SelectedPerson` to the rest of the system?**
  _507 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getDb()` be split into smaller, more focused modules?**
  _Cohesion score 0.05376437783199721 - nodes in this community are weakly interconnected._
- **Should `AdminServiceCategoriesClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05955734406438632 - nodes in this community are weakly interconnected._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06716417910447761 - nodes in this community are weakly interconnected._