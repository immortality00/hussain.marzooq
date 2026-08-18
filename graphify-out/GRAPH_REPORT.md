# Graph Report - hussain.marzooq  (2026-08-19)

## Corpus Check
- 328 files · ~176,619 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1763 nodes · 3622 edges · 118 communities (87 shown, 31 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `40aa2dff`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- AdminServicesClient.tsx
- location-search.ts
- HM Visuals Claude Working Document
- Finding Animation Opportunities
- route.ts
- page.tsx
- types.ts
- useServicesAdmin.ts
- route.ts
- AppShell.tsx
- page.tsx
- page.tsx
- graphify reference: extra exports and benchmark
- layout.tsx
- Current auth state (scrypt hash, HMAC session, 2-day TTL) (S1)
- What is NOT in the design (no scroll-jack, no gradients, grain)
- admin.ts
- Frontend Design
- useModalNavbarLock
- ensure-indexes.mjs
- page.tsx
- common.ts
- page.tsx
- graphify reference: extra exports and benchmark
- page-sections.ts
- ExhibitionGlobe.tsx
- The Sonner Principles (Building Loved Components)
- Spring Animations
- page.tsx
- WorkOverlay.tsx
- Debugging Animations
- route.ts
- graphify reference: add a URL and watch a folder
- clip-path for Animation
- graphify reference: incremental update and cluster-only
- Gesture and Drag Interactions
- three
- cloudinary
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: transcribe video and audio
- AppShell()
- generate-admin-password-hash.mjs
- layout.tsx
- graphify reference: incremental update and cluster-only
- CLAUDE.md
- extraction-spec.md
- AdminThemeToggle.tsx
- @dnd-kit/core
- eslint.config.mjs
- gsap
- react-globe.gl
- resend
- three
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- get-base-url.ts
- Globe Icon
- Geist font (next/font)
- Next.js (create-next-app)
- radix-ui
- react-globe.gl
- resend
- mongodb
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- server-modules.test.ts
- vitest.config.ts
- Globe earth-day texture
- vitest.config.ts
- Globe Icon
- Geist font (next/font)
- Globe earth-topology bump map

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 91 edges
2. `noStoreJson()` - 72 edges
3. `isRecord()` - 48 edges
4. `getPageSeo()` - 39 edges
5. `HM Visuals — Claude Working Document` - 38 edges
6. `asNullableString()` - 29 edges
7. `requireAdminOr401()` - 27 edges
8. `requireAdminObjectId()` - 26 edges
9. `getPageSections()` - 24 edges
10. `findByIdOr404()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/about/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (118 total, 31 thin omitted)

### Community 0 - "getDb()"
Cohesion: 0.15
Nodes (30): asBooleanOrNull(), asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), asNullableString(), asNumberOrNull(), asString(), getMediaLists() (+22 more)

### Community 1 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.07
Nodes (43): MediaDetailsSection(), SelectedPerson, TagMultiSelect(), TagOption, CategoryRow(), AdminServicesClient(), SortableServiceItem(), AdminTagsClient() (+35 more)

### Community 2 - "admin.ts"
Cohesion: 0.06
Nodes (48): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+40 more)

### Community 3 - "PhotographyViewer.tsx"
Cohesion: 0.07
Nodes (34): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+26 more)

### Community 4 - "types.ts"
Cohesion: 0.10
Nodes (34): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, getClientAddress(), HeaderGetter, isValidEmail() (+26 more)

### Community 5 - "PrivateGalleriesAdminClient.tsx"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 6 - "useServicesAdmin.ts"
Cohesion: 0.08
Nodes (33): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+25 more)

### Community 7 - "devDependencies"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 8 - "cloudinary-assets.ts"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 9 - "route.ts"
Cohesion: 0.11
Nodes (23): AdminNftsPage(), PATCH(), SLUG_TO_PATH, PATCH(), SLUG_TO_PATH, isValidObjectIdString(), ensureUniqueSlug(), GET() (+15 more)

### Community 10 - "media-serializers.ts"
Cohesion: 0.05
Nodes (43): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Phase 2a — Design direction (ran before D4), Phase 3 — Content & analytics, Phase DS — Design system rescue (Impeccable), Phase S2 — Defects from the 2026-08-17 full-repo audit (+35 more)

### Community 11 - "getPageSeo()"
Cohesion: 0.05
Nodes (38): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain, HM Visuals — Session Queue, How to use, Minimum to go live, Phase 2 — Preloader & core experience, Phase 2a — Design direction (runs before D4), Phase 3 — Content & analytics (+30 more)

### Community 12 - "cn()"
Cohesion: 0.21
Nodes (16): POST(), isRecord(), parseObjectId(), POST(), isValidReorderItem(), POST(), ReorderItem, getClientKey() (+8 more)

### Community 13 - "Animation Recipes"
Cohesion: 0.10
Nodes (27): generateMetadata(), HomePage(), DISCIPLINE_LINKS, HomeCreativeSystem(), CTA_LABELS, HomeFeaturedWork(), DISCIPLINE_ORDER, HomeHero() (+19 more)

### Community 14 - "testimonials.ts"
Cohesion: 0.16
Nodes (26): BlogPage(), generateMetadata(), generateMetadata(), SP, DancingPage(), generateMetadata(), generateMetadata(), NftPage() (+18 more)

### Community 15 - "HM Visuals Session Archive"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 16 - "Phase 2 — Preloader & core experience"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 17 - "compilerOptions"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 18 - "page.tsx"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 19 - "Animation Standards Reference"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 20 - "page-sections.ts"
Cohesion: 0.17
Nodes (32): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET(), findByIdOr404() (+24 more)

### Community 21 - "What You Must Do When Invoked"
Cohesion: 0.13
Nodes (20): AdminServiceCategoriesClient(), AdminServiceCategoriesPage(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, archiveService(), createService() (+12 more)

### Community 22 - "ContactForm.tsx"
Cohesion: 0.14
Nodes (21): Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage(), getIdentityLine() (+13 more)

### Community 23 - "Animation Audit Playbook"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 24 - "PublicReviewForm.tsx"
Cohesion: 0.07
Nodes (57): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+49 more)

### Community 25 - "public-services.ts"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 26 - "dependencies"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 27 - "lib.ts"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 28 - "page-settings.ts"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 29 - "Apple Design"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, next, next-cloudinary (+15 more)

### Community 30 - "PageRowCard.tsx"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 31 - "Workflow"
Cohesion: 0.16
Nodes (22): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+14 more)

### Community 32 - "Design Audit"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 33 - "page-sections-shared.ts"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 34 - "components.json"
Cohesion: 0.23
Nodes (17): Appearance, buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime() (+9 more)

### Community 35 - "Glossary"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 36 - "AdminServicesClient.tsx"
Cohesion: 0.16
Nodes (8): MediaSurface(), MediaItem, localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), HEIGHTS, PhotographyViewer()

### Community 37 - "location-search.ts"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 38 - "HM Visuals Claude Working Document"
Cohesion: 0.18
Nodes (10): MediaFilterBar(), MediaTagChips(), StatusFilter, MODES, ModeSwitcher(), ViewerMode, PhotographyCylinder, PhotographyHorizontal (+2 more)

### Community 39 - "Finding Animation Opportunities"
Cohesion: 0.07
Nodes (45): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+37 more)

### Community 40 - "route.ts"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 41 - "page.tsx"
Cohesion: 0.42
Nodes (5): HomeTestimonialCard(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser()

### Community 42 - "types.ts"
Cohesion: 0.27
Nodes (12): ContactPage(), generateMetadata(), ServicesPage(), ServiceCard(), asBool(), asNumberOrNull(), asString(), getActiveServicesForContact() (+4 more)

### Community 43 - "useServicesAdmin.ts"
Cohesion: 0.18
Nodes (10): generateMetadata(), PersonDetailPage(), MediaGrid(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+2 more)

### Community 44 - "route.ts"
Cohesion: 0.26
Nodes (10): AdminPagesPage(), DISCIPLINES, GET(), ServiceDetailPage(), isSectionImage(), getAllPageSections(), mergeWithDefaults(), getAllPageSeo() (+2 more)

### Community 45 - "AppShell.tsx"
Cohesion: 0.24
Nodes (9): generateMetadata(), PeoplePage(), buildPersonMediaQuery(), getPublicPeople(), isVideoType(), normalizeStringArray(), PublicPersonDetail, PublicPersonIndexItem (+1 more)

### Community 46 - "page.tsx"
Cohesion: 0.26
Nodes (17): asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken(), makeGallerySlug() (+9 more)

### Community 47 - "page.tsx"
Cohesion: 0.22
Nodes (7): metadata, CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 48 - "graphify reference: extra exports and benchmark"
Cohesion: 0.25
Nodes (11): createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual(), config, isAdminAuthed(), isPublicAdminRoute() (+3 more)

### Community 49 - "layout.tsx"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 50 - "Current auth state (scrypt hash, HMAC session, 2-day TTL) (S1)"
Cohesion: 0.29
Nodes (3): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps

### Community 51 - "What is NOT in the design (no scroll-jack, no gradients, grain)"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 52 - "admin.ts"
Cohesion: 0.24
Nodes (6): Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS, Preloader()

### Community 53 - "Frontend Design"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 54 - "useModalNavbarLock"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 55 - "ensure-indexes.mjs"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 56 - "page.tsx"
Cohesion: 0.40
Nodes (4): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), AboutDisciplineCard()

### Community 59 - "page.tsx"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 60 - "graphify reference: extra exports and benchmark"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 61 - "page-sections.ts"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 62 - "ExhibitionGlobe.tsx"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 63 - "The Sonner Principles (Building Loved Components)"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 64 - "Spring Animations"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 65 - "page.tsx"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 66 - "WorkOverlay.tsx"
Cohesion: 0.40
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 67 - "Debugging Animations"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 68 - "route.ts"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 69 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 70 - "clip-path for Animation"
Cohesion: 0.24
Nodes (7): AppearanceBlock(), formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES, NftModal(), appearance()

### Community 71 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 72 - "Gesture and Drag Interactions"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 73 - "three"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 74 - "cloudinary"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 75 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 76 - "graphify reference: transcribe video and audio"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 77 - "AppShell()"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 78 - "generate-admin-password-hash.mjs"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 79 - "layout.tsx"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 86 - "eslint.config.mjs"
Cohesion: 0.67
Nodes (3): AppShell(), lenis, lenis

## Knowledge Gaps
- **599 isolated node(s):** `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done``, `Session F4 — Design-rule cleanup + dead code removal — `done``, `Session F5 — Admin orchestration & data-layer consolidation — `done`` (+594 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `page-sections.ts` to `getDb()`, `admin.ts`, `types.ts`, `Finding Animation Opportunities`, `route.ts`, `types.ts`, `useServicesAdmin.ts`, `cn()`, `route.ts`, `page.tsx`, `testimonials.ts`, `AppShell.tsx`, `compilerOptions`, `What You Must Do When Invoked`, `ContactForm.tsx`, `Workflow`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Apple Design` to `three`, `postcss.config.mjs`, `Next.js Logo (starter boilerplate)`, `get-base-url.ts`, `Globe Icon`, `Geist font (next/font)`, `cloudinary-assets.ts`, `Next.js (create-next-app)`, `radix-ui`, `react-globe.gl`, `resend`, `mongodb`, `eslint.config.mjs`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `eslint.config.mjs` to `admin.ts`, `page.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done`` to the rest of the system?**
  _599 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getDb()` be split into smaller, more focused modules?**
  _Cohesion score 0.14793741109530584 - nodes in this community are weakly interconnected._
- **Should `AdminServiceCategoriesClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06649616368286446 - nodes in this community are weakly interconnected._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059154929577464786 - nodes in this community are weakly interconnected._