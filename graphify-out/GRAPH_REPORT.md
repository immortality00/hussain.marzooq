# Graph Report - hussain.marzooq  (2026-08-19)

## Corpus Check
- 333 files · ~178,771 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1790 nodes · 3699 edges · 113 communities (95 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `19cfabb9`
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
- useServicesAdmin.ts
- page.tsx
- graphify reference: extra exports and benchmark
- page-sections.ts
- ExhibitionGlobe.tsx
- The Sonner Principles (Building Loved Components)
- Spring Animations
- page.tsx
- WorkOverlay.tsx
- Debugging Animations
- graphify reference: add a URL and watch a folder
- clip-path for Animation
- graphify reference: incremental update and cluster-only
- Gesture and Drag Interactions
- three
- cloudinary
- graphify reference: transcribe video and audio
- AppShell()
- generate-admin-password-hash.mjs
- layout.tsx
- graphify reference: incremental update and cluster-only
- page.tsx
- CLAUDE.md
- extraction-spec.md
- @dnd-kit/core
- eslint.config.mjs
- gsap
- @gsap/react
- get-base-url.ts
- CategoriesToolbar.tsx
- mongodb
- next-themes
- radix-ui
- react-globe.gl
- Globe Icon
- Next.js (create-next-app)
- react-globe.gl
- mongodb
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- server-modules.test.ts
- Globe earth-day texture
- vitest.config.ts
- Globe Icon
- Geist font (next/font)
- Globe earth-topology bump map

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 94 edges
2. `noStoreJson()` - 66 edges
3. `isRecord()` - 44 edges
4. `getPageSeo()` - 42 edges
5. `HM Visuals — Claude Working Document` - 38 edges
6. `requireAdminOr401()` - 27 edges
7. `requireAdminObjectId()` - 26 edges
8. `asNullableString()` - 25 edges
9. `cn()` - 25 edges
10. `findByIdOr404()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `AdminProtectedLayout()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/auth/admin.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (113 total, 18 thin omitted)

### Community 0 - "getDb()"
Cohesion: 0.06
Nodes (59): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload() (+51 more)

### Community 1 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.08
Nodes (48): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+40 more)

### Community 2 - "admin.ts"
Cohesion: 0.12
Nodes (22): asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), asString(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType (+14 more)

### Community 3 - "PhotographyViewer.tsx"
Cohesion: 0.25
Nodes (11): createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual(), config, isAdminAuthed(), isPublicAdminRoute() (+3 more)

### Community 4 - "types.ts"
Cohesion: 0.04
Nodes (47): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+39 more)

### Community 5 - "PrivateGalleriesAdminClient.tsx"
Cohesion: 0.06
Nodes (43): CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS, HomeSectionsForm() (+35 more)

### Community 6 - "useServicesAdmin.ts"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 7 - "devDependencies"
Cohesion: 0.08
Nodes (28): MediaListFilterBar(), Props, PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl() (+20 more)

### Community 8 - "cloudinary-assets.ts"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+14 more)

### Community 9 - "route.ts"
Cohesion: 0.17
Nodes (33): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), findByIdOr404() (+25 more)

### Community 10 - "media-serializers.ts"
Cohesion: 0.06
Nodes (69): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, POST(), getClientAddress(), HeaderGetter (+61 more)

### Community 11 - "getPageSeo()"
Cohesion: 0.17
Nodes (15): GET(), asNumberOrNull(), isValidObjectIdString(), ensureUniqueSlug(), GET(), POST(), slugify(), POST() (+7 more)

### Community 12 - "cn()"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 13 - "Animation Recipes"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 14 - "testimonials.ts"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "HM Visuals Session Archive"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 16 - "Phase 2 — Preloader & core experience"
Cohesion: 0.19
Nodes (11): DISCIPLINE_LINKS, HomeCreativeSystem(), BaseProps, Button(), buttonClasses(), ButtonProps, ButtonVariant, VARIANT (+3 more)

### Community 17 - "compilerOptions"
Cohesion: 0.17
Nodes (24): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), BlogPage(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata() (+16 more)

### Community 18 - "page.tsx"
Cohesion: 0.04
Nodes (45): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Phase 2a — Design direction (ran before D4), Phase 3 — Content & analytics, Phase DS — Design system rescue (Impeccable), Phase S2 — Defects from the 2026-08-17 full-repo audit (+37 more)

### Community 19 - "Animation Standards Reference"
Cohesion: 0.19
Nodes (20): formatDates(), formatMonthYear(), MONTH_NAMES, buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel() (+12 more)

### Community 20 - "page-sections.ts"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 21 - "What You Must Do When Invoked"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 22 - "ContactForm.tsx"
Cohesion: 0.06
Nodes (35): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain, HM Visuals — Session Queue, How to use, Minimum to go live, Phase 2 — Preloader & core experience, Phase 2a — Design direction (runs before D4), Phase 3 — Content & analytics (+27 more)

### Community 23 - "Animation Audit Playbook"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 24 - "PublicReviewForm.tsx"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 26 - "dependencies"
Cohesion: 0.18
Nodes (14): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServicesToolbar() (+6 more)

### Community 27 - "lib.ts"
Cohesion: 0.16
Nodes (19): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyTagPage(), MediaGrid(), getMediaByTag(), disciplineMatch(), DisciplineTag (+11 more)

### Community 28 - "page-settings.ts"
Cohesion: 0.18
Nodes (16): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+8 more)

### Community 29 - "Apple Design"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 30 - "PageRowCard.tsx"
Cohesion: 0.25
Nodes (18): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+10 more)

### Community 31 - "Workflow"
Cohesion: 0.18
Nodes (17): ContactPage(), generateMetadata(), SP, generateMetadata(), ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections (+9 more)

### Community 32 - "Design Audit"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 33 - "page-sections-shared.ts"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 34 - "components.json"
Cohesion: 0.15
Nodes (22): asNullableString(), NftMeta, buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor() (+14 more)

### Community 35 - "Glossary"
Cohesion: 0.19
Nodes (6): AdminTagsClient(), EMPTY_DRAFT, TagFormCard(), NewTag, Tag, TagPatch

### Community 36 - "AdminServicesClient.tsx"
Cohesion: 0.21
Nodes (15): TagMultiSelect(), TagOption, DELETE(), PATCH(), revalidateTagSurfaces(), GET(), POST(), serializeTag() (+7 more)

### Community 37 - "location-search.ts"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 38 - "HM Visuals Claude Working Document"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 39 - "Finding Animation Opportunities"
Cohesion: 0.24
Nodes (9): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser() (+1 more)

### Community 40 - "route.ts"
Cohesion: 0.14
Nodes (17): PageRowCard(), SectionsData, SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow (+9 more)

### Community 41 - "page.tsx"
Cohesion: 0.14
Nodes (16): AdminPagesPage(), CTA_LABELS, HomeFeaturedWork(), FeaturedCard, FeaturedCardSlug, TextCard, AboutSections, BlogSections (+8 more)

### Community 42 - "types.ts"
Cohesion: 0.30
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 43 - "useServicesAdmin.ts"
Cohesion: 0.26
Nodes (10): DISCIPLINES, GET(), generateMetadata(), HomePage(), generateMetadata(), renderStars(), TestimonialsPage(), getAllPageSettings() (+2 more)

### Community 44 - "route.ts"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 45 - "AppShell.tsx"
Cohesion: 0.18
Nodes (10): generateMetadata(), PersonDetailPage(), ServiceDetailPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+2 more)

### Community 46 - "page.tsx"
Cohesion: 0.23
Nodes (10): MediaFilterBar(), TagChip, TagChipRow(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyCylinder (+2 more)

### Community 47 - "page.tsx"
Cohesion: 0.22
Nodes (12): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+4 more)

### Community 48 - "graphify reference: extra exports and benchmark"
Cohesion: 0.18
Nodes (9): Banner, CreateServiceResponse, findCategoryById(), findOthersCategory(), isCreateServiceResponse(), AdminActionFeedback(), AdminActionFeedbackState, AdminActionFeedbackType (+1 more)

### Community 49 - "layout.tsx"
Cohesion: 0.36
Nodes (7): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), ALL_PAGE_SECTIONS_SLUGS, deleteReplacedSectionImages()

### Community 50 - "Current auth state (scrypt hash, HMAC session, 2-day TTL) (S1)"
Cohesion: 0.19
Nodes (8): metadata, AppShell(), CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 51 - "What is NOT in the design (no scroll-jack, no gradients, grain)"
Cohesion: 0.29
Nodes (6): getString(), isRecord(), PeopleAdminClient(), WidgetResult, PersonItem, usePeopleAdmin()

### Community 52 - "admin.ts"
Cohesion: 0.43
Nodes (5): HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero(), SectionImage

### Community 53 - "Frontend Design"
Cohesion: 0.36
Nodes (9): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+1 more)

### Community 54 - "useModalNavbarLock"
Cohesion: 0.49
Nodes (9): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+1 more)

### Community 55 - "ensure-indexes.mjs"
Cohesion: 0.33
Nodes (9): generateMetadata(), PhotographyPage(), generateMetadata(), VideographyPage(), getPhotographyItems(), getShowreelItem(), getVideographyItems(), listPublicMedia() (+1 more)

### Community 56 - "page.tsx"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 57 - "common.ts"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 58 - "useServicesAdmin.ts"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 59 - "page.tsx"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 60 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 61 - "page-sections.ts"
Cohesion: 0.36
Nodes (5): MEDIA_BASE_PATHS, revalidateMediaSurfaces(), POST(), DELETE(), PATCH()

### Community 62 - "ExhibitionGlobe.tsx"
Cohesion: 0.47
Nodes (4): AdminProtectedLayout(), nav, AdminThemeToggle(), useIsMounted()

### Community 63 - "The Sonner Principles (Building Loved Components)"
Cohesion: 0.60
Nodes (5): isRecord(), parseObjectId(), isValidReorderItem(), POST(), ReorderItem

### Community 64 - "Spring Animations"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 65 - "page.tsx"
Cohesion: 0.33
Nodes (8): buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW, isDubai(), markerSize()

### Community 66 - "WorkOverlay.tsx"
Cohesion: 0.28
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 67 - "Debugging Animations"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 69 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 70 - "clip-path for Animation"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 71 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 72 - "Gesture and Drag Interactions"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 73 - "three"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 74 - "cloudinary"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 76 - "graphify reference: transcribe video and audio"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 77 - "AppShell()"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

### Community 78 - "generate-admin-password-hash.mjs"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 79 - "layout.tsx"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 80 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 81 - "page.tsx"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 82 - "CLAUDE.md"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 83 - "extraction-spec.md"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 85 - "@dnd-kit/core"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 86 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 87 - "gsap"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 89 - "get-base-url.ts"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 90 - "CategoriesToolbar.tsx"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 91 - "mongodb"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **606 isolated node(s):** `Who this is for`, `The site`, `Domain & deployment status`, `Stack`, `Image pipeline — Next's optimizer is bypassed (2026-07-31)` (+601 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `route.ts` to `components.json`, `admin.ts`, `cloudinary-assets.ts`, `page.tsx`, `media-serializers.ts`, `getPageSeo()`, `useServicesAdmin.ts`, `AppShell.tsx`, `Workflow`, `layout.tsx`, `compilerOptions`, `Animation Standards Reference`, `Frontend Design`, `dependencies`, `page-settings.ts`, `PageRowCard.tsx`, `The Sonner Principles (Building Loved Components)`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `AdminActionFeedback()` connect `graphify reference: extra exports and benchmark` to `getDb()`, `PrivateGalleriesAdminClient.tsx`, `devDependencies`, `route.ts`, `types.ts`, `page.tsx`, `HM Visuals Session Archive`, `What is NOT in the design (no scroll-jack, no gradients, grain)`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `getPageSeo()` connect `compilerOptions` to `route.ts`, `useServicesAdmin.ts`, `AppShell.tsx`, `ensure-indexes.mjs`, `lib.ts`, `Workflow`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain & deployment status` to the rest of the system?**
  _606 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getDb()` be split into smaller, more focused modules?**
  _Cohesion score 0.05663474692202462 - nodes in this community are weakly interconnected._
- **Should `AdminServiceCategoriesClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08181818181818182 - nodes in this community are weakly interconnected._
- **Should `admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12315270935960591 - nodes in this community are weakly interconnected._