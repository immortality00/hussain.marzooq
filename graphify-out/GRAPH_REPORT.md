# Graph Report - hussain.marzooq  (2026-09-02)

## Corpus Check
- 412 files · ~219,128 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2155 nodes · 5195 edges · 212 communities (107 shown, 105 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `39ef5fc9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- SmartMediaPreview.tsx
- public-media.ts
- components/site/AppShell.tsx
- check job
- The list
- route.ts
- Session D9b — Admin information architec
- SmartMediaPreview.tsx
- page.tsx
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
- lucide-react
- ensure-indexes.mjs
- The Animation Decision Framework
- clip-path for Animation
- Performance Rules
- Gesture and Drag Interactions
- mongodb
- graphify reference: query, path, explain
- CSS Transform Mastery
- The Sonner Principles (Building Loved Co
- Spring Animations
- ServiceEditorModal.tsx
- import-geonames-cities.mjs
- WorkOverlay.tsx
- layout.tsx
- useModalVisibilityEvents.ts
- Deployment Status — NOT DEPLOYED
- graphify reference: add a URL and watch 
- graphify reference: commit hook and nati
- Preloader.tsx
- resend
- graphify reference: GitHub clone and cro
- MediaLightbox.tsx
- CustomCursor.tsx
- IconButton.tsx
- route.ts
- session-token.ts
- page.tsx
- extraction-spec.md
- Preloader.tsx
- clsx
- useUnsavedChangesGuard.ts
- react
- tailwind-merge
- lenis
- CardImageGroup.tsx
- lucide-react
- vitest.config.ts
- apple-design skill
- emil-design-eng skill
- Emil Kowalski animation philosophy
- find-animation-opportunities skill
- Animation Audit Playbook (AUDIT.md)
- improve-animations Plan Template
- review-animations skill
- Strong custom easing curve tokens
- Never scale(0) entrance
- graphify CLAUDE.md Integration
- graphify add URL Ingest
- Watch Mode Auto-Rebuild
- FalkorDB Cypher Export
- MCP Server Export
- Neo4j Cypher Export
- graphify CLAUDE.md Integration
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
- Community Detection
- Community Labeling
- Extraction Cache
- Fast Path Existing Graph Query
- Gemini Extraction Backend
- geist
- Graph Health Check
- graph.json Output
- GRAPH_REPORT.md Output
- @gsap/react
- next
- Knowledge Graph
- radix-ui
- Knowledge Graph
- Semantic (LLM) Extraction
- Parallel Extraction Subagents
- Semantic (LLM) Extraction
- Globe earth-day texture
- Globe earth-topology bump map
- Globe Icon
- Session D7 — NFT page redesign
- Session C1 — Blog (pending)
- react
- Globe earth-day texture
- Globe earth-topology bump map
- Globe Icon
- MediaGrid.tsx
- SearchInput.tsx
- lib.ts
- Phase 2 — Preloader & core experience (completed portion)
- Phase S2 — Defects from the 2026-08-17 full-repo audit
- Phase T — Tag taxonomy & discipline subpages
- cloudinary
- @dnd-kit/sortable
- framer-motion
- next
- react
- react-markdown
- tailwind-merge
- testimonials.ts
- Graph Health Check
- HomeCreativeSystem.tsx
- ExhibitionGlobe.tsx
- page.tsx
- Python Interpreter Detection
- SingleReviewCard.tsx
- InquiryIcons.tsx
- InquirySection.tsx
- page.tsx
- Shrink Guard
- Structural (AST) Extraction
- ModeSwitcher.tsx
- PhotographyCylinder.tsx
- utils.ts

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 163 edges
2. `noStoreJson()` - 96 edges
3. `adminButtonClasses()` - 82 edges
4. `isRecord()` - 62 edges
5. `getPageSeo()` - 45 edges
6. `requireAdminObjectId()` - 41 edges
7. `findByIdOr404()` - 38 edges
8. `HM Visuals — Claude Working Document` - 38 edges
9. `requireAdminOr401()` - 36 edges
10. `asNullableString()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `AdminBlogCategoriesPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/blog-categories/page.tsx → lib/server/db.ts
- `InquiryExpandedCard()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/inquiries/components/InquiryExpandedCard.tsx → components/admin/AdminButton.tsx
- `MediaDetailsSection()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/media/components/MediaDetailsSection.tsx → components/admin/AdminButton.tsx
- `ServiceEditorModal()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/services/components/ServiceEditorModal.tsx → components/admin/AdminButton.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (212 total, 105 thin omitted)

### Community 0 - "route.ts"
Cohesion: 0.07
Nodes (45): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+37 more)

### Community 1 - "types.ts"
Cohesion: 0.05
Nodes (58): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaDetailsSection(), SelectedPerson, currencies, BusyAction, Editor (+50 more)

### Community 2 - "cn()"
Cohesion: 0.16
Nodes (23): AboutPage(), DISCIPLINE_HREFS, DancingPage(), NftPage(), PeoplePage(), PhotographyPage(), PhotographyTagPage(), VideographyPage() (+15 more)

### Community 3 - "cloudinary-assets.ts"
Cohesion: 0.25
Nodes (19): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+11 more)

### Community 4 - "TransitionContext.tsx"
Cohesion: 0.08
Nodes (54): buildAccessRateLimitKey(), POST(), GET(), POST(), PrivateGalleryPage(), CLOUDINARY_MANAGED_FOLDERS, createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret() (+46 more)

### Community 5 - "HomeSectionsForm.tsx"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @tsconfig/recommended (+17 more)

### Community 6 - "tag-pages.ts"
Cohesion: 0.19
Nodes (22): TagMultiSelect(), TagOption, PATCH(), POST(), asDate(), PATCH(), asDate(), POST() (+14 more)

### Community 7 - "getDb()"
Cohesion: 0.15
Nodes (39): DELETE(), GET(), DELETE(), GET(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId() (+31 more)

### Community 8 - "route.ts"
Cohesion: 0.15
Nodes (20): MediaPickerModal(), GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime(), buildMediaQuery(), MediaListResponse (+12 more)

### Community 9 - "isRecord()"
Cohesion: 0.06
Nodes (50): AdminDashboard(), CATEGORY_ICONS, CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaFields(), CtaOnlyForm(), DancingSectionsForm() (+42 more)

### Community 10 - "PagesAdminClient.tsx"
Cohesion: 0.13
Nodes (20): BlogMarkdownField(), BlogPostEditor(), EMPTY, TagsInput(), EditBlogPostPage(), createPost(), deletePost(), ERROR_MESSAGES (+12 more)

### Community 11 - "getPageSeo()"
Cohesion: 0.16
Nodes (19): ServicesPage(), ServiceDetailPage(), HomeServicesPreview(), serviceDirections, ServiceCard(), Discipline, DISCIPLINE_HREF, disciplineForCategory() (+11 more)

### Community 12 - "testimonials.ts"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 13 - "Animation Recipes"
Cohesion: 0.15
Nodes (22): AdminServicesClient(), ServiceEditorModal(), ServicesBanner(), ServiceSimpleSection(), archiveService(), createService(), deleteServiceForever(), getError() (+14 more)

### Community 14 - "page.tsx"
Cohesion: 0.12
Nodes (21): BlogAdminClient(), formatDate(), BlogCategoriesAdminClient(), Category, AdminMediaPage(), RemovalRequestsClient(), ServicesToolbar(), TagsToolbar() (+13 more)

### Community 15 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 16 - "PhotographyViewer.tsx"
Cohesion: 0.20
Nodes (13): AdminServiceCategoriesClient(), CategoriesTable(), CategoriesToolbar(), CategoryFormCard(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory() (+5 more)

### Community 17 - "db.ts"
Cohesion: 0.10
Nodes (44): asFiniteLatitude(), asFiniteLongitude(), asNumberOrNull(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType, NftStatus (+36 more)

### Community 18 - "Animation Standards Reference"
Cohesion: 0.16
Nodes (19): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, createAdminSessionCookies(), isAdminPasswordConfigured(), parseScryptHash() (+11 more)

### Community 19 - "adminButtonClasses()"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 20 - "ContactForm.tsx"
Cohesion: 0.33
Nodes (16): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 21 - "PeopleAdminClient.tsx"
Cohesion: 0.18
Nodes (18): BlogPage(), BlogPostPage(), BlogCard(), formatBlogDate(), readingMinutes(), readingTimeLabel(), getBlogActive(), asString() (+10 more)

### Community 22 - "dependencies"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 23 - "What You Must Do When Invoked"
Cohesion: 0.07
Nodes (28): After L11 — the release gate and deploy, Block A — launch blockers, Block B — before the domain goes public, Block C — hardening; may trail launch by a few days, Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Final — runs after every other Phase L session, Gaps awaiting a decision from Hussain, HM Visuals — Session Queue (+20 more)

### Community 24 - "devDependencies"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 25 - "Animation Audit Playbook"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 26 - "AdminButton.tsx"
Cohesion: 0.30
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 27 - "PublicReviewForm.tsx"
Cohesion: 0.23
Nodes (12): EMPTY_DRAFT, TagFormCard(), TagsTable(), createTagRequest(), deleteTagRequest(), fetchTags(), patchTag(), NewTag (+4 more)

### Community 28 - "page.tsx"
Cohesion: 0.07
Nodes (27): class-variance-authority, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, gsap, @gsap/react, lucide-react (+19 more)

### Community 29 - "Apple Design"
Cohesion: 0.20
Nodes (18): generateMetadata(), generateMetadata(), generateMetadata(), ContactPage(), generateMetadata(), SP, generateMetadata(), generateMetadata() (+10 more)

### Community 30 - "page-sections.ts"
Cohesion: 0.25
Nodes (13): POST(), asNullableString(), isValidObjectIdString(), isValidEmail(), POST(), POST(), ensureUniqueSlug(), POST() (+5 more)

### Community 31 - "types.ts"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 32 - "Workflow"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 33 - "Design Audit"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 34 - "media-serializers.ts"
Cohesion: 0.09
Nodes (21): AdminInquiriesPage(), PeopleAdminClient(), statusLabel(), VISIBILITY_OPTIONS, PrivateGalleriesAdminClient(), AdminTagsClient(), TestimonialsAdminClient(), BulkAction (+13 more)

### Community 35 - "route.ts"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 36 - "components.json"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 37 - "media-picker-utils.ts"
Cohesion: 0.14
Nodes (18): generateMetadata(), generateMetadata(), TagDiscipline, DEFAULTS, PageSeo, SeoDefaults, disciplineMatch(), DisciplineTag (+10 more)

### Community 38 - "Glossary"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 39 - "AdminServicesClient.tsx"
Cohesion: 0.10
Nodes (19): HM Visuals — Session Archive, §L2 — Trusted client IP + request-guard correctness (2026-09-02) — `done`, Phase 2 — Dancing page, Phase 2 — People page, Phase 2 — Preloader & core experience, Phase 2 — Preloader & core experience (completed portion), Phase 3 — Content & analytics, Phase S — Security & hardening (+11 more)

### Community 40 - "PrivateGalleriesAdminClient.tsx"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 41 - "route.ts"
Cohesion: 0.12
Nodes (20): AdminBlogCategoriesPage(), AdminServiceCategoriesPage(), AdminServicesPage(), safeNumber(), PATCH(), SLUG_TO_PATH, PATCH(), SLUG_TO_PATH (+12 more)

### Community 42 - "page.tsx"
Cohesion: 0.26
Nodes (6): Appearance, AppearanceBlock(), formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 43 - "Design Direction (measured spec)"
Cohesion: 0.22
Nodes (13): InquiriesToolbar(), InquiryExpandedCard(), archiveInquiry(), deleteInquiryForever(), fetchInquiries(), isApiResponse(), patchInquiry(), restoreInquiry() (+5 more)

### Community 44 - "Page Content CMS (3 collections)"
Cohesion: 0.23
Nodes (12): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+4 more)

### Community 45 - "Finding Animation Opportunities"
Cohesion: 0.16
Nodes (21): POST(), createPersonGateCookieValue(), getPersonGateSecret(), personGateCookieName(), scryptAsync(), signGatePayload(), timingSafeStringEqual(), verifyPassword() (+13 more)

### Community 46 - "session-token.ts"
Cohesion: 0.13
Nodes (17): MediaFilterBar(), MediaSurface(), MediaTagChips(), TagChip, TagChipRow(), MediaItem, TagLink, localFilterItems() (+9 more)

### Community 47 - "page.tsx"
Cohesion: 0.25
Nodes (11): createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual(), config, isAdminAuthed(), isPublicAdminRoute() (+3 more)

### Community 48 - "route.ts"
Cohesion: 0.27
Nodes (11): CategoryRow(), MediaAssetSection(), CategoryRow(), SortableServiceItem(), TagRow(), adminButtonClasses(), CloudinaryUploadButton(), CloudinaryUploaded (+3 more)

### Community 49 - "api.ts"
Cohesion: 0.23
Nodes (8): getClientAddress(), HeaderGetter, GET(), POST(), GET(), parseUrl(), projectUrlLabel(), toProjectUrl()

### Community 50 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.20
Nodes (9): allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, name, overrides, postcss, private (+1 more)

### Community 51 - "api.ts"
Cohesion: 0.22
Nodes (9): scripts, build, db:indexes, dev, lint, start, test, test:watch (+1 more)

### Community 52 - "components/home/HomeHero.tsx"
Cohesion: 0.20
Nodes (10): Phase 4 — People & launch prep, Session D13 — Final public consistency pass — `done` — shipped 2026-08-29, Session D4 — Page transition system — `done` (complete 2026-08-27), Session D4 — Page transition system (engine + homepage shipped 2026-08-20), Session D5 — Cursor enhancements — `done` (2026-08-20), Session D7 — NFT page redesign — `done` (2026-08-21), Session D8 — Magnetic button effect — `done` (2026-08-27), Session D9 — Admin visual redesign — `done` (+2 more)

### Community 53 - "SmartMediaPreview.tsx"
Cohesion: 0.18
Nodes (5): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS, NoResults()

### Community 54 - "public-media.ts"
Cohesion: 0.53
Nodes (3): resend, sendInquiryNotification(), escapeHtml()

### Community 55 - "components/site/AppShell.tsx"
Cohesion: 0.43
Nodes (6): GeoPoint, getMapEmbedUrl(), TestimonialMap(), getReviewPoint(), normalizeLocationKey(), TestimonialsSection()

### Community 56 - "check job"
Cohesion: 0.22
Nodes (9): Phase 1 — Navigation & global systems, Session N1 — Minimal nav + Work overlay — `done`, Session N2 — Page activity toggle system — `done`, Session N3 — SEO + page metadata admin control — `done`, Session N4 — Page header content (extend page_seo) — `done`, Session N5 — Section-level content CMS (homepage + interim pages) — `done`, Session N6 — Homepage section redesign — `done`, Session N7 — Admin-selectable card images (Work overlay + Featured Work) — `done` (+1 more)

### Community 57 - "The list"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 58 - "route.ts"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 59 - "Session D9b — Admin information architec"
Cohesion: 0.33
Nodes (6): AdminAnalytics(), AnalyticsRow, AnalyticsStats, getGoatCounterStats(), goatCounterPeriod(), toRows()

### Community 60 - "SmartMediaPreview.tsx"
Cohesion: 0.13
Nodes (17): AdminProtectedLayout(), AdminMobileNav(), AdminSidebarNav(), AdminThemeToggle(), useIsMounted(), NAV_GROUPS, NavGroup, NavItem (+9 more)

### Community 61 - "page.tsx"
Cohesion: 0.27
Nodes (7): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe(), ModalPortal(), useScrollLock(), ExhibitionCity

### Community 62 - "package.json"
Cohesion: 0.14
Nodes (20): HomeTestimonialCard(), HomeTrust(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser(), Avatar(), getInitials() (+12 more)

### Community 63 - "Design Engineering"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 64 - "graphify reference: extra exports and be"
Cohesion: 0.60
Nodes (4): parseObjectId(), isValidReorderItem(), POST(), ReorderItem

### Community 65 - "ExhibitionGlobe.tsx"
Cohesion: 0.39
Nodes (7): AdminRemovalRequestsPage(), countPendingRemovalRequests(), getRemovalRequestHistory(), getRemovalRequestQueue(), RemovalDecisionItem, RemovalRequestItem, toIso()

### Community 66 - "scripts"
Cohesion: 0.14
Nodes (26): isValidFormStartedAt(), isAllowedCloudinaryTestimonialUrl(), NormalizedResolvedLocation, normalizeOptionalPhotoUrl(), normalizeRating(), normalizeResolvedLocation(), POST(), POST() (+18 more)

### Community 67 - "Component Building Principles"
Cohesion: 0.06
Nodes (35): metadata, RootLayout(), SiteAnalytics(), AppShell(), CustomCursor(), stepSpring(), stretchFor(), Navbar() (+27 more)

### Community 68 - "api.ts"
Cohesion: 0.25
Nodes (8): Phase S — Security & hardening, Session S1 — Finish the security migration — `done`, Session S2 — Reuse audit against the real code rule — `done` (audit + slice S2a), Session S2b — API `[id]`-route boilerplate extraction — `done`, Session S3 — Automated test baseline — `done`, Session S4 — Work overlay card images: decide the empty state — `done`, Session S6 — Remove `unoptimized` from testimonial images — `done`, Session S7 — Resolve remaining eslint `exhaustive-deps` warnings — `done`

### Community 69 - "AdminTagsClient.tsx"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 71 - "useModalNavbarLock()"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 72 - "What is NOT in the design (bans)"
Cohesion: 0.08
Nodes (32): AboutDisciplineCard(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), CTA_LABELS, HomeFeaturedWork(), DISCIPLINE_ORDER (+24 more)

### Community 77 - "clip-path for Animation"
Cohesion: 0.33
Nodes (6): Phase 0 — Foundation (must complete before any design session), Session F1 — Remove violations + initialize Lenis — `done`, Session F2 — Code refactoring: extract reusable components — `done`, Session F3 — Split large admin files — `done`, Session F4 — Design-rule cleanup + dead code removal — `done`, Session F5 — Admin orchestration & data-layer consolidation — `done`

### Community 78 - "Performance Rules"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 79 - "Gesture and Drag Interactions"
Cohesion: 0.29
Nodes (6): Deployment, Getting started, HM Visuals, Stack, Verification, Working document

### Community 80 - "mongodb"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 81 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 82 - "CSS Transform Mastery"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 83 - "The Sonner Principles (Building Loved Co"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 84 - "Spring Animations"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 85 - "ServiceEditorModal.tsx"
Cohesion: 0.20
Nodes (12): MediaListFilterBar(), Props, formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage() (+4 more)

### Community 87 - "WorkOverlay.tsx"
Cohesion: 0.52
Nodes (6): ALLOWED_SIGN_KEYS, POST(), sanitizeParamsToSign(), toValidTimestamp(), sessionPhotosFolder(), sessionProfileFolder()

### Community 89 - "useModalVisibilityEvents.ts"
Cohesion: 0.50
Nodes (4): Phase DS — Design system rescue (Impeccable), Session DS0 — Install the design + motion skill stack — `done`, Session DS1 — Evaluate the detector (no install, no hooks) — `done`, Session DS2 — Fold Impeccable findings in; skills for the design gaps — `done`

### Community 90 - "Deployment Status — NOT DEPLOYED"
Cohesion: 0.50
Nodes (4): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session S10 — Two security fixes — `done`, Session S8 — Two resource leaks — `done`, Session S9 — Revalidation coverage — `done`

### Community 91 - "graphify reference: add a URL and watch "
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 92 - "graphify reference: commit hook and nati"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 95 - "Preloader.tsx"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 96 - "resend"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 97 - "graphify reference: GitHub clone and cro"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 98 - "MediaLightbox.tsx"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics — shipped (C3, 2026-08-30), Animation stack status, Blog (C1, shipped 2026-08-29), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 103 - "IconButton.tsx"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 104 - "route.ts"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 105 - "session-token.ts"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 106 - "page.tsx"
Cohesion: 0.33
Nodes (7): IconButton(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), fmt(), statusPill()

### Community 111 - "extraction-spec.md"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 112 - "Preloader.tsx"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 113 - "clsx"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 116 - "useUnsavedChangesGuard.ts"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 121 - "react"
Cohesion: 0.67
Nodes (3): Phase 2a — Design direction (ran before D4), Session D2b — Homepage section pass — `done`, Session D2c — About page rebuild — `done`

### Community 124 - "lenis"
Cohesion: 0.67
Nodes (3): Phase 3 — Content & analytics, Session C4 — Media locations: validated city + stored coordinates — `done`, Session D6 — Exhibition globe — `done`

### Community 133 - "apple-design skill"
Cohesion: 0.15
Nodes (14): GET(), HomePage(), PersonDetailPage(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag (+6 more)

### Community 136 - "Emil Kowalski animation philosophy"
Cohesion: 0.67
Nodes (3): Phase 3 — Content & analytics, Session C1 — Blog admin + public pages — `done` (2026-08-29), Session C2 — Open Graph images — `done` (2026-08-29)

### Community 139 - "improve-animations Plan Template"
Cohesion: 0.67
Nodes (3): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session N9 — Stop public chrome rendering on admin — `done` (2026-08-19), Session S11 — Admin: stop losing work — `done` (2026-08-19)

### Community 162 - "Neo4j Cypher Export"
Cohesion: 0.67
Nodes (3): Phase T — Tag taxonomy & discipline subpages, Session T1 — Tag taxonomy: `media_tags` + `/admin/tags` — `done`, Session T2 — `/photography/[tag]` and `/videography/[tag]` — `done`

## Knowledge Gaps
- **727 isolated node(s):** `DISCIPLINE_HREFS`, `Category`, `EMPTY`, `ERROR_MESSAGES`, `CATEGORY_ICONS` (+722 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **105 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `getDb()` to `route.ts`, `cn()`, `cloudinary-assets.ts`, `TransitionContext.tsx`, `apple-design skill`, `tag-pages.ts`, `isRecord()`, `PagesAdminClient.tsx`, `getPageSeo()`, `db.ts`, `Animation Standards Reference`, `ContactForm.tsx`, `PeopleAdminClient.tsx`, `PublicReviewForm.tsx`, `Apple Design`, `page-sections.ts`, `media-picker-utils.ts`, `Glossary`, `route.ts`, `Page Content CMS (3 collections)`, `Finding Animation Opportunities`, `api.ts`, `SmartMediaPreview.tsx`, `package.json`, `graphify reference: extra exports and be`, `ExhibitionGlobe.tsx`, `scripts`, `What is NOT in the design (bans)`, `WorkOverlay.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `dependencies` connect `page.tsx` to `Component Building Principles`, `Frontend Design`, `Animation Audit Playbook (AUDIT.md)`, `lucide-react`, `ensure-indexes.mjs`, `The Animation Decision Framework`, `AdminServiceCategoriesClient.tsx`, `Strong custom easing curve tokens`, `import-geonames-cities.mjs`, `Never scale(0) entrance`, `layout.tsx`, `graphify CLAUDE.md Integration`, `graphify add URL Ingest`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `DISCIPLINE_HREFS`, `Category`, `EMPTY` to the rest of the system?**
  _727 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07372549019607844 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05056179775280899 - nodes in this community are weakly interconnected._
- **Should `TransitionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07985193019566367 - nodes in this community are weakly interconnected._
- **Should `HomeSectionsForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._