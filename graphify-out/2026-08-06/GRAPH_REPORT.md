# Graph Report - hussain.marzooq  (2026-08-06)

## Corpus Check
- 304 files · ~135,492 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1648 nodes · 3581 edges · 107 communities (82 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7999fad9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PhotographyViewer.tsx
- PageRowCard.tsx
- AdminServiceCategoriesClient.tsx
- cloudinary-assets.ts
- types.ts
- requireAdminObjectId()
- dependencies
- admin.ts
- devDependencies
- AdminServicesClient.tsx
- PrivateGalleriesAdminClient.tsx
- testimonials.ts
- getDb()
- cn()
- compilerOptions
- getPageSeo()
- page.tsx
- layout.tsx
- What You Must Do When Invoked
- ContactForm.tsx
- page.tsx
- PublicReviewForm.tsx
- route.ts
- media.ts
- private-galleries.ts
- asNullableString()
- components.json
- page-settings.ts
- private-galleries.ts
- location-search.ts
- route.ts
- page.tsx
- page.tsx
- Reusable components — always use
- route.ts
- Page content CMS (3 collections)
- Image pipeline (custom Cloudinary loader)
- Session D4 — Page transition system
- Impeccable (deterministic design detector)
- graphify reference: extra exports and benchmark
- page-sections.ts
- page.tsx
- ensure-indexes.mjs
- graphify reference: query, path, explain
- HomeHero.tsx
- Code quality rules
- 6-item navigation + Work overlay
- import-geonames-cities.mjs
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- cloudinary-image-loader.ts
- next.config.ts
- README.md
- route.ts
- Animation stack (Lenis/GSAP/Three.js)
- page.tsx
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- Workflow
- generate-admin-password-hash.mjs
- CLAUDE.md
- Design Audit
- extraction-spec.md
- eslint.config.mjs
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- admin.ts
- server-modules.test.ts
- vitest.config.ts
- Glossary
- Finding Animation Opportunities
- Globe Icon
- Geist font (next/font)
- Next.js (create-next-app)
- page.tsx
- The list
- Design Engineering
- route.ts
- Component Building Principles
- TestimonialsSection.tsx
- route.ts
- Frontend Design
- The Animation Decision Framework
- clip-path for Animation
- Performance Rules
- Gesture and Drag Interactions
- layout.tsx
- CSS Transform Mastery
- The Sonner Principles (Building Loved Components)
- Spring Animations
- Core Philosophy
- Debugging Animations
- @gsap/react
- lucide-react
- mongodb
- next-themes
- radix-ui
- react-globe.gl
- resend
- tailwind-merge
- three

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 108 edges
2. `noStoreJson()` - 72 edges
3. `isRecord()` - 48 edges
4. `getPageSeo()` - 40 edges
5. `HM Visuals — Claude Working Document` - 35 edges
6. `requireAdminObjectId()` - 30 edges
7. `asNullableString()` - 29 edges
8. `requireAdminOr401()` - 29 edges
9. `findByIdOr404()` - 27 edges
10. `getPageSections()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/photography/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (107 total, 25 thin omitted)

### Community 0 - "PhotographyViewer.tsx"
Cohesion: 0.26
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 1 - "PageRowCard.tsx"
Cohesion: 0.16
Nodes (13): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField(), TextField() (+5 more)

### Community 2 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.06
Nodes (43): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+35 more)

### Community 3 - "cloudinary-assets.ts"
Cohesion: 0.12
Nodes (39): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+31 more)

### Community 4 - "types.ts"
Cohesion: 0.09
Nodes (33): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+25 more)

### Community 5 - "requireAdminObjectId()"
Cohesion: 0.05
Nodes (127): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET() (+119 more)

### Community 6 - "dependencies"
Cohesion: 0.09
Nodes (23): class-variance-authority, cloudinary, clsx, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, next (+15 more)

### Community 7 - "admin.ts"
Cohesion: 0.23
Nodes (9): CardImageGroup(), CardImageWarning(), SLUG_LABELS, getString(), ImageField(), isRecord(), RepeatingListEditor(), EMPTY_SECTION_IMAGE (+1 more)

### Community 8 - "devDependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 9 - "AdminServicesClient.tsx"
Cohesion: 0.10
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 10 - "PrivateGalleriesAdminClient.tsx"
Cohesion: 0.09
Nodes (28): MediaListFilterBar(), Props, PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps (+20 more)

### Community 11 - "testimonials.ts"
Cohesion: 0.18
Nodes (16): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+8 more)

### Community 12 - "getDb()"
Cohesion: 0.22
Nodes (9): GroupCard(), GroupTint, ICON_TINTS, TINTS, SectionsData, RowPill(), SeoDraft, SeoPageForm() (+1 more)

### Community 13 - "cn()"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 14 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "getPageSeo()"
Cohesion: 0.23
Nodes (18): AboutPage(), generateMetadata(), BlogPage(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage() (+10 more)

### Community 16 - "page.tsx"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 17 - "layout.tsx"
Cohesion: 0.22
Nodes (7): metadata, CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 18 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 19 - "ContactForm.tsx"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 20 - "page.tsx"
Cohesion: 0.06
Nodes (31): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain — not sessions yet, do not invent scope, HM Visuals — Session Queue, How to use, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+23 more)

### Community 21 - "PublicReviewForm.tsx"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 22 - "route.ts"
Cohesion: 0.07
Nodes (59): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, POST() (+51 more)

### Community 23 - "media.ts"
Cohesion: 0.23
Nodes (10): PageRowCard(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow, SettingsDraft, usePagesAdmin(), PageSectionsSlug (+2 more)

### Community 24 - "private-galleries.ts"
Cohesion: 0.24
Nodes (6): Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS, Preloader()

### Community 25 - "asNullableString()"
Cohesion: 0.29
Nodes (6): CTA_LABELS, HomeFeaturedWork(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug

### Community 26 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 27 - "page-settings.ts"
Cohesion: 0.24
Nodes (11): DISCIPLINES, GET(), ServicesPage(), ServiceDetailPage(), generateMetadata(), renderStars(), TestimonialsPage(), getAllPageSettings() (+3 more)

### Community 28 - "private-galleries.ts"
Cohesion: 0.17
Nodes (24): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+16 more)

### Community 29 - "location-search.ts"
Cohesion: 0.40
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 30 - "route.ts"
Cohesion: 0.06
Nodes (31): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Phase DS — Design system rescue (Impeccable), Phase S — Security & hardening, Phase S — Security & hardening, Session D1 — Preloader — `done` (+23 more)

### Community 31 - "page.tsx"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 32 - "page.tsx"
Cohesion: 0.21
Nodes (12): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType() (+4 more)

### Community 33 - "Reusable components — always use"
Cohesion: 0.05
Nodes (39): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+31 more)

### Community 34 - "route.ts"
Cohesion: 0.11
Nodes (32): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+24 more)

### Community 35 - "Page content CMS (3 collections)"
Cohesion: 0.15
Nodes (13): MediaFilterBar(), MediaTagChips(), MediaItem, localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), MODES (+5 more)

### Community 36 - "Image pipeline (custom Cloudinary loader)"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 37 - "Session D4 — Page transition system"
Cohesion: 0.26
Nodes (6): AppearanceBlock(), MediaSurface(), Appearance, formatDates(), formatPlace(), toEmbedUrl()

### Community 38 - "Impeccable (deterministic design detector)"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 39 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 40 - "page-sections.ts"
Cohesion: 0.36
Nodes (6): AdminPagesPage(), getAllPageSections(), mergeWithDefaults(), DEFAULTS, getAllPageSeo(), SeoDefaults

### Community 41 - "page.tsx"
Cohesion: 0.31
Nodes (9): ContactPage(), generateMetadata(), SP, asBool(), asNumberOrNull(), asString(), getActiveServicesForContact(), getPublicServicesData() (+1 more)

### Community 42 - "ensure-indexes.mjs"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 43 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 44 - "HomeHero.tsx"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 45 - "Code quality rules"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 46 - "6-item navigation + Work overlay"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 47 - "import-geonames-cities.mjs"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 48 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 49 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 50 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 51 - "cloudinary-image-loader.ts"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 52 - "next.config.ts"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 53 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 54 - "route.ts"
Cohesion: 0.26
Nodes (10): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), FEATURED_CARD_SLUGS, isSectionImage(), resolveOptionalCardImage() (+2 more)

### Community 55 - "Animation stack (Lenis/GSAP/Three.js)"
Cohesion: 0.52
Nodes (4): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser()

### Community 56 - "page.tsx"
Cohesion: 0.15
Nodes (12): generateMetadata(), generateMetadata(), generateMetadata(), MediaGrid(), AnimatedText(), AnimatedTextProps, Tag, PageHeader() (+4 more)

### Community 59 - "Workflow"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 65 - "Design Audit"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 72 - "admin.ts"
Cohesion: 0.67
Nodes (3): AppShell(), lenis, lenis

### Community 75 - "Glossary"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 76 - "Finding Animation Opportunities"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 80 - "page.tsx"
Cohesion: 0.12
Nodes (19): generateMetadata(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, HomeHero(), disciplineSlugForCategory() (+11 more)

### Community 81 - "The list"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 82 - "Design Engineering"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 84 - "Component Building Principles"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 85 - "TestimonialsSection.tsx"
Cohesion: 0.43
Nodes (6): GeoPoint, getMapEmbedUrl(), TestimonialMap(), getReviewPoint(), normalizeLocationKey(), TestimonialsSection()

### Community 87 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 88 - "The Animation Decision Framework"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 89 - "clip-path for Animation"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 90 - "Performance Rules"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 91 - "Gesture and Drag Interactions"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 92 - "layout.tsx"
Cohesion: 0.27
Nodes (8): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), isAdminAuthedServer(), ALL_SEO_SLUGS

### Community 93 - "CSS Transform Mastery"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 94 - "The Sonner Principles (Building Loved Components)"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 95 - "Spring Animations"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 96 - "Core Philosophy"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 97 - "Debugging Animations"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

## Knowledge Gaps
- **559 isolated node(s):** `InquiryStatus`, `nav`, `SelectedPerson`, `currencies`, `NftMeta` (+554 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `requireAdminObjectId()` to `PhotographyViewer.tsx`, `page.tsx`, `route.ts`, `page-sections.ts`, `AdminServicesClient.tsx`, `page.tsx`, `testimonials.ts`, `private-galleries.ts`, `getPageSeo()`, `page.tsx`, `route.ts`, `route.ts`, `page-settings.ts`, `layout.tsx`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `@gsap/react`, `lucide-react`, `mongodb`, `next-themes`, `radix-ui`, `react-globe.gl`, `devDependencies`, `admin.ts`, `resend`, `tailwind-merge`, `three`, `route.ts`, `route.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `admin.ts` to `private-galleries.ts`, `layout.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **What connects `InquiryStatus`, `nav`, `SelectedPerson` to the rest of the system?**
  _559 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AdminServiceCategoriesClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05955734406438632 - nodes in this community are weakly interconnected._
- **Should `cloudinary-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11627906976744186 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0935374149659864 - nodes in this community are weakly interconnected._