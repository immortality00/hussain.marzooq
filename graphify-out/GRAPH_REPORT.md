# Graph Report - hussain.marzooq  (2026-08-28)

## Corpus Check
- 356 files · ~191,567 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1959 nodes · 3966 edges · 214 communities (109 shown, 105 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- route.ts
- types.ts
- cn()
- cloudinary-assets.ts
- TransitionContext.tsx
- HomeSectionsForm.tsx
- tag-pages.ts
- getDb()
- route.ts
- isRecord()
- PagesAdminClient.tsx
- getPageSeo()
- testimonials.ts
- Animation Recipes
- page.tsx
- compilerOptions
- PhotographyViewer.tsx
- db.ts
- Animation Standards Reference
- adminButtonClasses()
- ContactForm.tsx
- PeopleAdminClient.tsx
- dependencies
- What You Must Do When Invoked
- devDependencies
- Animation Audit Playbook
- AdminButton.tsx
- PublicReviewForm.tsx
- page.tsx
- Apple Design
- page-sections.ts
- types.ts
- Workflow
- Design Audit
- media-serializers.ts
- route.ts
- components.json
- media-picker-utils.ts
- Glossary
- AdminServicesClient.tsx
- PrivateGalleriesAdminClient.tsx
- route.ts
- page.tsx
- Design Direction (measured spec)
- Page Content CMS (3 collections)
- Finding Animation Opportunities
- session-token.ts
- page.tsx
- route.ts
- api.ts
- AdminServiceCategoriesClient.tsx
- api.ts
- components/home/HomeHero.tsx
- Content-Security-Policy (next.config.ts)
- public-media.ts
- components/site/AppShell.tsx
- check job
- The list
- route.ts
- Session D9b — Admin information architec
- SmartMediaPreview.tsx
- lib.ts
- package.json
- Design Engineering
- graphify reference: extra exports and be
- ExhibitionGlobe.tsx
- scripts
- Component Building Principles
- api.ts
- AdminTagsClient.tsx
- TestimonialShared.tsx
- useModalNavbarLock()
- What is NOT in the design (bans)
- Frontend Design
- HM Visuals
- ensure-indexes.mjs
- The Animation Decision Framework
- clip-path for Animation
- Performance Rules
- Gesture and Drag Interactions
- Site-wide Contact-Sheet Page Transition
- graphify reference: query, path, explain
- CSS Transform Mastery
- The Sonner Principles (Building Loved Co
- Spring Animations
- ServiceEditorModal.tsx
- Core Philosophy
- Debugging Animations
- InquiryIcons.tsx
- Deployment Status — NOT DEPLOYED
- graphify reference: add a URL and watch 
- graphify reference: commit hook and nati
- graphify reference: incremental update a
- utils.ts
- graphify reference: GitHub clone and cro
- graphify reference: transcribe video and
- SortableList.tsx
- page.tsx
- app/api/_lib/admin-route.ts helpers
- CLAUDE.md
- MediaPickerModal + ImageField
- cloudinary
- clsx
- eslint.config.mjs
- gsap
- useUnsavedChangesGuard.ts
- get-base-url.ts
- lucide-react
- mongodb
- next-cloudinary
- react
- react-globe.gl
- tailwind-merge
- three
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- Session NFT1 — Smart contract planning (
- server-modules.test.ts
- vitest.config.ts
- animate skill
- animation-vocabulary skill
- apple-design skill
- Spring interruptibility and velocity han
- emil-design-eng skill
- Emil Kowalski animation philosophy
- find-animation-opportunities skill
- Animation Audit Playbook (AUDIT.md)
- improve-animations Plan Template
- improve-animations skill
- pick-ui-library skill
- Prototype Picker harness spec
- prototype skill
- redesign-existing-projects skill
- review-animations skill
- Animation Standards Reference (STANDARDS
- Strong custom easing curve tokens
- Never ease-in on UI
- Frequency-appropriate motion rule
- GPU-only: transform and opacity
- prefers-reduced-motion accessibility
- Never scale(0) entrance
- Origin-aware transform-origin
- frontend-design LICENSE
- frontend-design skill
- components/shared/AnimatedText.tsx
- graphify CLAUDE.md Integration
- graphify add URL Ingest
- Watch Mode Auto-Rebuild
- FalkorDB Cypher Export
- MCP Server Export
- Neo4j Cypher Export
- Token Reduction Benchmark
- Wiki Export
- Confidence Score Rubric
- Hyperedges
- Node ID Format Rule
- Semantic Similarity Edges
- Verbatim source_file Rule
- Extraction Subagent Prompt
- Image Vision Extraction Rules
- Cross-Repo Graph Merge
- GitHub Repo Clone
- graphify claude install (Native CLAUDE.m
- Post-Commit Auto-Rebuild Hook
- BFS Traversal
- graphify explain (Node Explanation)
- LESSONS.md / reflect
- NetworkX Inline Traversal Fallback
- graphify path (Shortest Path)
- Constrained Query Expansion
- save-result Feedback Loop
- Work Memory Self-Improving Loop
- Whisper Domain-Hint Prompt
- Whisper Transcription
- build_merge Replace-on-Re-extract
- Cluster-Only Rerun
- Graph Diff
- Incremental Update
- prune_sources Deletion Pruning
- EXTRACTED/INFERRED/AMBIGUOUS Audit Trail
- Community Detection
- Community Labeling
- Extraction Cache
- Fast Path Existing Graph Query
- Gemini Extraction Backend
- God Nodes
- Graph Health Check
- graph.json Output
- GRAPH_REPORT.md Output
- HTML Visualization Export
- Python Interpreter Detection
- Knowledge Graph
- No API Key Required
- Parallel Extraction Subagents
- Semantic (LLM) Extraction
- Shrink Guard
- Structural (AST) Extraction
- Globe earth-day texture
- Globe earth-topology bump map
- Globe Icon
- Session D7 — NFT page redesign
- Session C1 — Blog (pending)

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 116 edges
2. `noStoreJson()` - 78 edges
3. `adminButtonClasses()` - 70 edges
4. `isRecord()` - 52 edges
5. `getPageSeo()` - 40 edges
6. `HM Visuals — Claude Working Document` - 38 edges
7. `requireAdminObjectId()` - 33 edges
8. `requireAdminOr401()` - 31 edges
9. `findByIdOr404()` - 30 edges
10. `asNullableString()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `DancingPage()` --calls--> `getPageSections()`  [EXTRACTED]
  app/dancing/page.tsx → lib/server/page-sections.ts
- `MediaAssetSection()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/media/components/MediaAssetSection.tsx → components/admin/AdminButton.tsx
- `MediaDetailsSection()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/media/components/MediaDetailsSection.tsx → components/admin/AdminButton.tsx
- `AdminMediaPage()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/media/page.tsx → components/admin/AdminButton.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (214 total, 105 thin omitted)

### Community 0 - "route.ts"
Cohesion: 0.08
Nodes (26): BaseProps, Button(), buttonClasses(), ButtonProps, ButtonVariant, VARIANT, PortfolioCard(), PortfolioCardProps (+18 more)

### Community 1 - "types.ts"
Cohesion: 0.06
Nodes (37): CardImageWarning(), CardsCtaForm(), CtaFields(), CtaOnlyForm(), DancingSectionsForm(), GroupCard(), GroupTint, ICON_TINTS (+29 more)

### Community 2 - "cn()"
Cohesion: 0.06
Nodes (39): metadata, RootLayout(), AppShell(), CustomCursor(), stepSpring(), stretchFor(), Navbar(), cormorant (+31 more)

### Community 3 - "cloudinary-assets.ts"
Cohesion: 0.11
Nodes (40): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+32 more)

### Community 4 - "TransitionContext.tsx"
Cohesion: 0.11
Nodes (41): asFiniteLatitude(), asFiniteLongitude(), asNumberOrNull(), asString(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType (+33 more)

### Community 5 - "HomeSectionsForm.tsx"
Cohesion: 0.08
Nodes (25): class-variance-authority, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, @gsap/react, next (+17 more)

### Community 6 - "tag-pages.ts"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @tsconfig/recommended (+17 more)

### Community 7 - "getDb()"
Cohesion: 0.06
Nodes (44): currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem(), saveMediaItem(), useMediaEditorState(), CryptoCurrency, MediaCategory (+36 more)

### Community 8 - "route.ts"
Cohesion: 0.16
Nodes (35): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET(), findByIdOr404() (+27 more)

### Community 9 - "isRecord()"
Cohesion: 0.15
Nodes (15): InquiriesToolbar(), InquiryExpandedCard(), AdminInquiriesPage(), AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), ServiceSimpleSection(), AdminTagsClient() (+7 more)

### Community 10 - "PagesAdminClient.tsx"
Cohesion: 0.13
Nodes (17): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), ContactPage(), generateMetadata(), SP, generateMetadata(), generateMetadata() (+9 more)

### Community 11 - "getPageSeo()"
Cohesion: 0.12
Nodes (18): AdminDashboard(), CATEGORY_ICONS, PAGE_ROWS, PageGroup, pageNeedsImage(), PageRow, GROUPS, PagesAdminClient() (+10 more)

### Community 12 - "testimonials.ts"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+14 more)

### Community 13 - "Animation Recipes"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 14 - "page.tsx"
Cohesion: 0.12
Nodes (20): AdminServiceCategoriesPage(), AdminServicesPage(), safeNumber(), PATCH(), SLUG_TO_PATH, PATCH(), SLUG_TO_PATH, GET() (+12 more)

### Community 15 - "compilerOptions"
Cohesion: 0.06
Nodes (68): POST(), asNullableString(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), GET(), serializeTag() (+60 more)

### Community 16 - "PhotographyViewer.tsx"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 17 - "db.ts"
Cohesion: 0.26
Nodes (12): isRecord(), isValidObjectIdString(), parseObjectId(), ensureUniqueSlug(), GET(), POST(), slugify(), POST() (+4 more)

### Community 18 - "Animation Standards Reference"
Cohesion: 0.07
Nodes (45): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+37 more)

### Community 19 - "adminButtonClasses()"
Cohesion: 0.14
Nodes (11): AdminServicesClient(), TestimonialInspectModal(), ReviewRow(), TestimonialsAdminClient(), BulkCheckbox(), runBulkAction(), useBulkSelection(), useAdminAction() (+3 more)

### Community 20 - "ContactForm.tsx"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 21 - "PeopleAdminClient.tsx"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 22 - "dependencies"
Cohesion: 0.23
Nodes (14): generateMetadata(), ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard(), asBool(), asNumberOrNull() (+6 more)

### Community 23 - "What You Must Do When Invoked"
Cohesion: 0.18
Nodes (14): ContactActions(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode, useContactFormState() (+6 more)

### Community 24 - "devDependencies"
Cohesion: 0.12
Nodes (18): MediaFilterBar(), MediaGrid(), MediaTagChips(), TagChip, TagChipRow(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode (+10 more)

### Community 25 - "Animation Audit Playbook"
Cohesion: 0.25
Nodes (19): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+11 more)

### Community 26 - "AdminButton.tsx"
Cohesion: 0.19
Nodes (14): DISCIPLINES, GET(), BlogPage(), generateMetadata(), HomePage(), ServiceDetailPage(), generateMetadata(), renderStars() (+6 more)

### Community 27 - "PublicReviewForm.tsx"
Cohesion: 0.17
Nodes (18): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyTagPage(), TagDiscipline, disciplineMatch(), DisciplineTag, getDisciplineTags() (+10 more)

### Community 28 - "page.tsx"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 29 - "Apple Design"
Cohesion: 0.08
Nodes (23): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain, HM Visuals — Session Queue, How to use, Minimum to go live, Phase 2 — Preloader & core experience, Phase 2a — Design direction (runs before D4), Phase 3 — Content & analytics (+15 more)

### Community 30 - "page-sections.ts"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 31 - "types.ts"
Cohesion: 0.17
Nodes (8): AppearanceBlock(), MediaSurface(), MediaItem, TagLink, formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 32 - "Workflow"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 33 - "Design Audit"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 34 - "media-serializers.ts"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 35 - "route.ts"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 36 - "components.json"
Cohesion: 0.39
Nodes (3): DancingPage(), InstagramFeed(), toInstagramEmbedUrl()

### Community 37 - "media-picker-utils.ts"
Cohesion: 0.33
Nodes (16): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 38 - "Glossary"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 39 - "AdminServicesClient.tsx"
Cohesion: 0.19
Nodes (13): getGalleryStatus(), parseLocalDateTime(), buildMediaQuery(), MediaListResponse, mediaMetaText(), mergeMediaItems(), PrivateGalleryMediaCard(), PrivateGalleryMediaCardProps (+5 more)

### Community 40 - "PrivateGalleriesAdminClient.tsx"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 41 - "route.ts"
Cohesion: 0.19
Nodes (15): asFiniteNumber(), CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray() (+7 more)

### Community 42 - "page.tsx"
Cohesion: 0.15
Nodes (12): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, AdminButton(), AdminSidebarNav(), NAV_GROUPS (+4 more)

### Community 43 - "Design Direction (measured spec)"
Cohesion: 0.27
Nodes (13): NftPage(), PhotographyPage(), VideographyPage(), WebDevelopmentPage(), PageHeader(), PageHeaderProps, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+5 more)

### Community 44 - "Page Content CMS (3 collections)"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 45 - "Finding Animation Opportunities"
Cohesion: 0.25
Nodes (11): createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual(), config, isAdminAuthed(), isPublicAdminRoute() (+3 more)

### Community 46 - "session-token.ts"
Cohesion: 0.20
Nodes (12): MediaListFilterBar(), Props, formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage() (+4 more)

### Community 47 - "page.tsx"
Cohesion: 0.41
Nodes (8): PATCH(), revalidateTagSurfaces(), POST(), isReservedTagSlug(), isValidTagSlug(), RESERVED_TAG_SLUGS, slugifyTag(), TAG_DISCIPLINES

### Community 48 - "route.ts"
Cohesion: 0.38
Nodes (4): getString(), isRecord(), PeopleAdminClient(), WidgetResult

### Community 49 - "api.ts"
Cohesion: 0.20
Nodes (7): TagMultiSelect(), TagOption, createTagRequest(), NewTag, Tag, TagPatch, AdminTagsPage()

### Community 50 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.18
Nodes (7): patchInquiry(), restoreInquiry(), ApiInquiriesResponse, Banner, Inquiry, InquiryStatus, STATUSES

### Community 51 - "api.ts"
Cohesion: 0.17
Nodes (13): AdminPagesPage(), DISCIPLINE_LINKS, HomeCreativeSystem(), AboutSections, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS (+5 more)

### Community 52 - "components/home/HomeHero.tsx"
Cohesion: 0.22
Nodes (10): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PhotographyViewer() (+2 more)

### Community 53 - "Content-Security-Policy (next.config.ts)"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 54 - "public-media.ts"
Cohesion: 0.22
Nodes (11): PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType(), normalizeStringArray() (+3 more)

### Community 55 - "components/site/AppShell.tsx"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 56 - "check job"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 57 - "The list"
Cohesion: 0.24
Nodes (5): PrivateGalleriesAdminClient(), GalleryList(), GalleryListProps, PrivateGalleryMediaPicker(), PrivateGalleryMediaPickerProps

### Community 58 - "route.ts"
Cohesion: 0.12
Nodes (11): PageEditorBody(), SectionsData, ServicesBanner(), ServicesToolbar(), SortableServiceItem(), AdminButtonProps, AdminButtonSize, AdminButtonVariant (+3 more)

### Community 59 - "Session D9b — Admin information architec"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 60 - "SmartMediaPreview.tsx"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 61 - "lib.ts"
Cohesion: 0.24
Nodes (7): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, AdminMediaPage()

### Community 62 - "package.json"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 63 - "Design Engineering"
Cohesion: 0.17
Nodes (11): HM Visuals — Session Archive, Phase 2 — Dancing page, Phase 2 — Preloader & core experience (completed portion), Phase 3 — Content & analytics, Phase S — Security & hardening, Session C4 — Media locations: validated city + stored coordinates — `done`, Session D10 — Dancing page — `done`, Session D1 — Preloader — `done` (+3 more)

### Community 64 - "graphify reference: extra exports and be"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 66 - "scripts"
Cohesion: 0.29
Nodes (3): Avatar(), getInitials(), TestimonialItem

### Community 67 - "Component Building Principles"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 68 - "api.ts"
Cohesion: 0.29
Nodes (6): Deployment, Getting started, HM Visuals, Stack, Verification, Working document

### Community 69 - "AdminTagsClient.tsx"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 70 - "TestimonialShared.tsx"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 71 - "useModalNavbarLock()"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 72 - "What is NOT in the design (bans)"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 73 - "Frontend Design"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 74 - "HM Visuals"
Cohesion: 0.20
Nodes (9): allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, name, overrides, postcss, private (+1 more)

### Community 75 - "ensure-indexes.mjs"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 76 - "The Animation Decision Framework"
Cohesion: 0.22
Nodes (9): scripts, build, db:indexes, dev, lint, start, test, test:watch (+1 more)

### Community 77 - "clip-path for Animation"
Cohesion: 0.16
Nodes (10): generateMetadata(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero(), AnimatedText(), AnimatedTextProps, Tag (+2 more)

### Community 78 - "Performance Rules"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 79 - "Gesture and Drag Interactions"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 80 - "Site-wide Contact-Sheet Page Transition"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 81 - "graphify reference: query, path, explain"
Cohesion: 0.60
Nodes (4): getString(), isRecord(), ServiceEditorModal(), WidgetResult

### Community 82 - "CSS Transform Mastery"
Cohesion: 0.22
Nodes (9): Phase 1 — Navigation & global systems, Session N1 — Minimal nav + Work overlay — `done`, Session N2 — Page activity toggle system — `done`, Session N3 — SEO + page metadata admin control — `done`, Session N4 — Page header content (extend page_seo) — `done`, Session N5 — Section-level content CMS (homepage + interim pages) — `done`, Session N6 — Homepage section redesign — `done`, Session N7 — Admin-selectable card images (Work overlay + Featured Work) — `done` (+1 more)

### Community 83 - "The Sonner Principles (Building Loved Co"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 84 - "Spring Animations"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 85 - "ServiceEditorModal.tsx"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 89 - "InquiryIcons.tsx"
Cohesion: 0.22
Nodes (9): Phase 4 — People & launch prep, Session D4 — Page transition system — `done` (complete 2026-08-27), Session D4 — Page transition system (engine + homepage shipped 2026-08-20), Session D5 — Cursor enhancements — `done` (2026-08-20), Session D7 — NFT page redesign — `done` (2026-08-21), Session D8 — Magnetic button effect — `done` (2026-08-27), Session D9 — Admin visual redesign — `done`, Session D9b — Admin information architecture — `done` (+1 more)

### Community 90 - "Deployment Status — NOT DEPLOYED"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 91 - "graphify reference: add a URL and watch "
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 92 - "graphify reference: commit hook and nati"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 93 - "graphify reference: incremental update a"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 107 - "app/api/_lib/admin-route.ts helpers"
Cohesion: 0.25
Nodes (8): Phase S — Security & hardening, Session S1 — Finish the security migration — `done`, Session S2 — Reuse audit against the real code rule — `done` (audit + slice S2a), Session S2b — API `[id]`-route boilerplate extraction — `done`, Session S3 — Automated test baseline — `done`, Session S4 — Work overlay card images: decide the empty state — `done`, Session S6 — Remove `unoptimized` from testimonial images — `done`, Session S7 — Resolve remaining eslint `exhaustive-deps` warnings — `done`

### Community 197 - "God Nodes"
Cohesion: 0.40
Nodes (5): CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP, CLOUDINARY_MEDIA_CATEGORY_FOLDERS, CloudinaryMediaCategory, getCloudinaryMediaFoldersForCategories(), isCloudinaryMediaCategory()

### Community 198 - "Graph Health Check"
Cohesion: 0.33
Nodes (6): Phase 0 — Foundation (must complete before any design session), Session F1 — Remove violations + initialize Lenis — `done`, Session F2 — Code refactoring: extract reusable components — `done`, Session F3 — Split large admin files — `done`, Session F4 — Design-rule cleanup + dead code removal — `done`, Session F5 — Admin orchestration & data-layer consolidation — `done`

### Community 199 - "graph.json Output"
Cohesion: 0.50
Nodes (4): Phase DS — Design system rescue (Impeccable), Session DS0 — Install the design + motion skill stack — `done`, Session DS1 — Evaluate the detector (no install, no hooks) — `done`, Session DS2 — Fold Impeccable findings in; skills for the design gaps — `done`

### Community 200 - "GRAPH_REPORT.md Output"
Cohesion: 0.50
Nodes (4): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session S10 — Two security fixes — `done`, Session S8 — Two resource leaks — `done`, Session S9 — Revalidation coverage — `done`

### Community 201 - "HTML Visualization Export"
Cohesion: 0.67
Nodes (3): Phase 2a — Design direction (ran before D4), Session D2b — Homepage section pass — `done`, Session D2c — About page rebuild — `done`

### Community 202 - "Python Interpreter Detection"
Cohesion: 0.67
Nodes (3): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session N9 — Stop public chrome rendering on admin — `done` (2026-08-19), Session S11 — Admin: stop losing work — `done` (2026-08-19)

### Community 203 - "Knowledge Graph"
Cohesion: 0.67
Nodes (3): Phase T — Tag taxonomy & discipline subpages, Session T1 — Tag taxonomy: `media_tags` + `/admin/tags` — `done`, Session T2 — `/photography/[tag]` and `/videography/[tag]` — `done`

## Knowledge Gaps
- **700 isolated node(s):** `Who this is for`, `The site`, `Domain & deployment status`, `Stack`, `Image pipeline — Next's optimizer is bypassed (2026-07-31)` (+695 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **105 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `route.ts` to `types.ts`, `TransitionContext.tsx`, `PagesAdminClient.tsx`, `testimonials.ts`, `page.tsx`, `compilerOptions`, `db.ts`, `Animation Standards Reference`, `dependencies`, `Animation Audit Playbook`, `AdminButton.tsx`, `PublicReviewForm.tsx`, `media-picker-utils.ts`, `route.ts`, `Design Direction (measured spec)`, `page.tsx`, `api.ts`, `api.ts`, `public-media.ts`, `clip-path for Animation`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `dependencies` connect `HomeSectionsForm.tsx` to `cn()`, `HM Visuals`, `No API Key Required`, `Parallel Extraction Subagents`, `Semantic (LLM) Extraction`, `Shrink Guard`, `Structural (AST) Extraction`, `Globe earth-day texture`, `Globe earth-topology bump map`, `Globe Icon`, `Session D7 — NFT page redesign`, `Session C1 — Blog (pending)`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain & deployment status` to the rest of the system?**
  _700 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07973421926910298 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055191256830601096 - nodes in this community are weakly interconnected._
- **Should `cn()` be split into smaller, more focused modules?**
  _Cohesion score 0.05589225589225589 - nodes in this community are weakly interconnected._
- **Should `cloudinary-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11212121212121212 - nodes in this community are weakly interconnected._