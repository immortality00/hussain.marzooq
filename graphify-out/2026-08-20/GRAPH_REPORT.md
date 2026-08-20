# Graph Report - hussain.marzooq  (2026-08-20)

## Corpus Check
- 339 files · ~182,497 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1580 nodes · 3837 edges · 96 communities (85 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `01a665f5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Media Appearances Admin
- Media Location + Serializers
- Admin Card Image Editors
- Admin Login + Auth Route
- NFT Query Builder
- Private Galleries Admin
- App Shell + Root Layout
- Runtime Dependencies
- Build Tooling + package.json
- NFT Admin + Inquiries API
- shadcn UI Primitives
- About/Blog Pages
- Common Validators
- Home Testimonials + Trust
- TS Config
- Inquiries Admin UI
- Service Categories Admin
- Access Rate-Limit Routes
- Tag Multi-Select Admin
- Contact Form
- Media Filter + Grid
- Testimonial Form + Banner
- Animation Skills
- Services Admin
- Tag Subpages
- Contact/Services Public Pages
- Media List Admin
- Inquiry Lib Helpers
- Media PATCH Routes
- components.json
- Media Card Grid
- Testimonial Cloudinary Cleanup
- Homepage Sections
- Testimonial Locations
- Session Token Auth
- Services API Client
- Pages Admin + Sections
- Tag Revalidation Routes
- Media Details Sections
- Gallery Form + Hero Bokeh
- Photography/Videography Pages
- Cloudinary Download Helpers
- Page-Settings Routes
- Disciplines + Stars
- People Public Pages
- Core Architecture Concepts
- CI Workflow
- People Admin
- Security + Pipeline Concepts
- Pending Design Sessions
- Graphify Exports
- Content CMS + Tags Concepts
- Design Direction Concepts
- Cloudinary Sign Route
- Graphify Skill Integration
- Graphify Incremental Update
- Graphify Query Traversal
- Graphify Clustering
- Graphify Extraction Rules
- Index Ensure Script
- Admin Protected Layout
- Deployment + Stack Docs
- Globe + Locations Sessions
- Graphify Transcription/Cache
- GeoNames Import Script
- Cloudinary Image Loader
- Next Config + CSP
- Design Skills
- Self-Improving Memory Loop
- Admin Password Hash Script
- Admin Layout
- Removal Requests Stub
- Videography Videos Redirect
- About Rebuild Session
- ESLint Config
- Base URL Helper
- PostCSS Config
- UI Icons
- Starter Boilerplate Logos
- Server Modules Smoke Test
- Vitest Config
- Token Reduction Benchmark
- Session C1 Blog
- Session C3 Analytics
- Session D11 Web Dev Page
- Session D12 People Page
- Session D8 Magnetic Button
- Session NFT1 Contract
- Session NFT2 Minting
- Session P2 Mobile Pass
- Phase 3 — Content & analytics
- Phase S2 — Defects from the 2026-08-17 full-repo audit

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 121 edges
2. `noStoreJson()` - 78 edges
3. `isRecord()` - 52 edges
4. `getPageSeo()` - 43 edges
5. `HM Visuals — Claude Working Document` - 38 edges
6. `requireAdminObjectId()` - 33 edges
7. `requireAdminOr401()` - 31 edges
8. `findByIdOr404()` - 30 edges
9. `asNullableString()` - 29 edges
10. `getPageSections()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `frontend-design skill` --semantically_similar_to--> `redesign-existing-projects skill`  [INFERRED] [semantically similar]
  .claude/skills/frontend-design/SKILL.md → .agents/skills/redesign-existing-projects/SKILL.md
- `AdminProtectedLayout()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/auth/admin.ts
- `TagMultiSelect()` --calls--> `slugifyTag()`  [EXTRACTED]
  app/admin/(protected)/media/components/TagMultiSelect.tsx → lib/server/media-tags.ts
- `CategoryRow()` --calls--> `useSortableRow()`  [EXTRACTED]
  app/admin/(protected)/service-categories/components/CategoryRow.tsx → components/admin/sortable/SortableList.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (96 total, 11 thin omitted)

### Community 0 - "Media Appearances Admin"
Cohesion: 0.05
Nodes (59): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem() (+51 more)

### Community 1 - "Media Location + Serializers"
Cohesion: 0.10
Nodes (46): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+38 more)

### Community 2 - "Admin Card Image Editors"
Cohesion: 0.06
Nodes (34): metadata, AppShell(), CustomCursor(), stepSpring(), stretchFor(), Navbar(), cormorant, FlashItem (+26 more)

### Community 3 - "Admin Login + Auth Route"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 4 - "NFT Query Builder"
Cohesion: 0.15
Nodes (35): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET() (+27 more)

### Community 5 - "Private Galleries Admin"
Cohesion: 0.09
Nodes (40): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+32 more)

### Community 6 - "App Shell + Root Layout"
Cohesion: 0.04
Nodes (45): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+37 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 8 - "Build Tooling + package.json"
Cohesion: 0.12
Nodes (35): asBooleanOrNull(), asFiniteLatitude(), asFiniteLongitude(), asNumberOrNull(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType (+27 more)

### Community 9 - "NFT Admin + Inquiries API"
Cohesion: 0.12
Nodes (27): PATCH(), SLUG_TO_PATH, asString(), isRecord(), isValidObjectIdString(), normalizeSlug(), parseObjectId(), ensureUniqueSlug() (+19 more)

### Community 10 - "shadcn UI Primitives"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 11 - "About/Blog Pages"
Cohesion: 0.14
Nodes (26): generateMetadata(), PhotographyPage(), generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyPage(), generateMetadata(), VideographyTagPage() (+18 more)

### Community 12 - "Common Validators"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 13 - "Home Testimonials + Trust"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+14 more)

### Community 14 - "TS Config"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "Inquiries Admin UI"
Cohesion: 0.06
Nodes (30): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain, HM Visuals — Session Queue, How to use, Minimum to go live, Phase 2 — Preloader & core experience, Phase 2a — Design direction (runs before D4), Phase 3 — Content & analytics (+22 more)

### Community 16 - "Service Categories Admin"
Cohesion: 0.15
Nodes (22): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), BlogPage(), generateMetadata(), ContactPage(), generateMetadata(), SP (+14 more)

### Community 17 - "Access Rate-Limit Routes"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 18 - "Tag Multi-Select Admin"
Cohesion: 0.18
Nodes (23): POST(), asNullableString(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), POST(), GET() (+15 more)

### Community 19 - "Contact Form"
Cohesion: 0.17
Nodes (20): DISCIPLINES, GET(), HomePage(), ServicesPage(), ServiceDetailPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections (+12 more)

### Community 20 - "Media Filter + Grid"
Cohesion: 0.15
Nodes (17): TagMultiSelect(), TagOption, AdminTagsClient(), EMPTY_DRAFT, TagFormCard(), TagRow(), TagsTable(), TagsToolbar() (+9 more)

### Community 21 - "Testimonial Form + Banner"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 22 - "Animation Skills"
Cohesion: 0.16
Nodes (22): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+14 more)

### Community 23 - "Services Admin"
Cohesion: 0.19
Nodes (18): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), resend, sendInquiryNotification() (+10 more)

### Community 24 - "Tag Subpages"
Cohesion: 0.12
Nodes (23): Animation Recipes, animate skill, animation-vocabulary skill, apple-design skill, Spring interruptibility and velocity handoff, emil-design-eng skill, Emil Kowalski animation philosophy, find-animation-opportunities skill (+15 more)

### Community 25 - "Contact/Services Public Pages"
Cohesion: 0.17
Nodes (9): AppearanceBlock(), MediaSurface(), MediaItem, TagLink, formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES (+1 more)

### Community 26 - "Media List Admin"
Cohesion: 0.18
Nodes (14): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServicesToolbar() (+6 more)

### Community 27 - "Inquiry Lib Helpers"
Cohesion: 0.28
Nodes (17): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+9 more)

### Community 28 - "Media PATCH Routes"
Cohesion: 0.19
Nodes (12): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), CategoryRow(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory() (+4 more)

### Community 29 - "components.json"
Cohesion: 0.30
Nodes (17): asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken(), makeGallerySlug() (+9 more)

### Community 30 - "Media Card Grid"
Cohesion: 0.16
Nodes (13): generateMetadata(), PersonDetailPage(), generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag (+5 more)

### Community 31 - "Testimonial Cloudinary Cleanup"
Cohesion: 0.16
Nodes (12): MediaFilterBar(), MediaTagChips(), TagChip, TagChipRow(), StatusFilter, MODES, ModeSwitcher(), ViewerMode (+4 more)

### Community 32 - "Homepage Sections"
Cohesion: 0.20
Nodes (14): createAdminSessionCookies(), hmacHex(), verifyPair(), createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual() (+6 more)

### Community 33 - "Testimonial Locations"
Cohesion: 0.18
Nodes (12): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField(), TextField() (+4 more)

### Community 34 - "Session Token Auth"
Cohesion: 0.29
Nodes (8): PATCH(), VALID_SLUGS, AboutDisciplineCard(), collectSectionImagePublicIds(), EMPTY_SECTION_IMAGE, resolveOptionalCardImage(), TextCard, deleteReplacedSectionImages()

### Community 35 - "Services API Client"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 36 - "Pages Admin + Sections"
Cohesion: 0.16
Nodes (13): HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, HomeHero(), BaseProps, Button() (+5 more)

### Community 37 - "Tag Revalidation Routes"
Cohesion: 0.30
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 38 - "Media Details Sections"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 39 - "Gallery Form + Hero Bokeh"
Cohesion: 0.13
Nodes (16): PATCH(), SLUG_TO_PATH, CTA_LABELS, HomeFeaturedWork(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug (+8 more)

### Community 40 - "Photography/Videography Pages"
Cohesion: 0.18
Nodes (9): Banner, CreateServiceResponse, findCategoryById(), findOthersCategory(), isCreateServiceResponse(), AdminActionFeedback(), AdminActionFeedbackState, AdminActionFeedbackType (+1 more)

### Community 41 - "Cloudinary Download Helpers"
Cohesion: 0.24
Nodes (9): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser() (+1 more)

### Community 42 - "Page-Settings Routes"
Cohesion: 0.22
Nodes (9): GroupCard(), GroupTint, ICON_TINTS, TINTS, SectionsData, RowPill(), SeoDraft, SeoPageForm() (+1 more)

### Community 43 - "Disciplines + Stars"
Cohesion: 0.21
Nodes (10): PageRowCard(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow, SettingsDraft, usePagesAdmin(), useUnsavedChangesGuard() (+2 more)

### Community 44 - "People Public Pages"
Cohesion: 0.26
Nodes (10): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+2 more)

### Community 45 - "Core Architecture Concepts"
Cohesion: 0.24
Nodes (8): getString(), isRecord(), PeopleAdminClient(), WidgetResult, TestimonialsAdminClient(), useAdminAction(), PersonItem, usePeopleAdmin()

### Community 46 - "CI Workflow"
Cohesion: 0.33
Nodes (9): GET(), POST(), serializeTag(), tagCounts(), isReservedTagSlug(), isValidTagSlug(), RESERVED_TAG_SLUGS, slugifyTag() (+1 more)

### Community 47 - "People Admin"
Cohesion: 0.49
Nodes (9): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+1 more)

### Community 48 - "Security + Pipeline Concepts"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 49 - "Pending Design Sessions"
Cohesion: 0.21
Nodes (10): CardImageGroup(), CardImageWarning(), SLUG_LABELS, getString(), ImageField(), isRecord(), MediaPickerModal(), RepeatingListEditor() (+2 more)

### Community 50 - "Graphify Exports"
Cohesion: 0.22
Nodes (10): FalkorDB Cypher Export, Neo4j Cypher Export, Cross-Repo Graph Merge, GitHub Repo Clone, graphify explain (Node Explanation), NetworkX Inline Traversal Fallback, graphify path (Shortest Path), graph.json Output (+2 more)

### Community 51 - "Content CMS + Tags Concepts"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 52 - "Design Direction Concepts"
Cohesion: 0.29
Nodes (7): buildPersonMediaQuery(), getPublicPeople(), isVideoType(), normalizeStringArray(), PublicPersonDetail, PublicPersonIndexItem, toMediaItem()

### Community 53 - "Cloudinary Sign Route"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 54 - "Graphify Skill Integration"
Cohesion: 0.31
Nodes (7): AdminPagesPage(), getAllPageSections(), mergeWithDefaults(), DEFAULTS, getAllPageSeo(), PageSeo, SeoDefaults

### Community 55 - "Graphify Incremental Update"
Cohesion: 0.22
Nodes (9): Phase 1 — Navigation & global systems, Session N1 — Minimal nav + Work overlay — `done`, Session N2 — Page activity toggle system — `done`, Session N3 — SEO + page metadata admin control — `done`, Session N4 — Page header content (extend page_seo) — `done`, Session N5 — Section-level content CMS (homepage + interim pages) — `done`, Session N6 — Homepage section redesign — `done`, Session N7 — Admin-selectable card images (Work overlay + Featured Work) — `done` (+1 more)

### Community 56 - "Graphify Query Traversal"
Cohesion: 0.22
Nodes (9): Phase S — Security & hardening, Session S1 — Finish the security migration — `done`, Session S2 — Reuse audit against the real code rule — `done` (audit + slice S2a), Session S2b — API `[id]`-route boilerplate extraction — `done`, Session S3 — Automated test baseline — `done`, Session S4 — Work overlay card images: decide the empty state — `done`, Session S5 — `page-settings` PATCH treats partial updates as full replacement — `done`, Session S6 — Remove `unoptimized` from testimonial images — `done` (+1 more)

### Community 57 - "Graphify Clustering"
Cohesion: 0.52
Nodes (4): SortableServiceItem(), SortableRow(), SortableList(), useSortableRow()

### Community 58 - "Graphify Extraction Rules"
Cohesion: 0.29
Nodes (7): graphify CLAUDE.md Integration, Watch Mode Auto-Rebuild, Node ID Format Rule, graphify claude install (Native CLAUDE.md), graphify Skill, Python Interpreter Detection, Structural (AST) Extraction

### Community 59 - "Index Ensure Script"
Cohesion: 0.29
Nodes (7): graphify add URL Ingest, Verbatim source_file Rule, Post-Commit Auto-Rebuild Hook, build_merge Replace-on-Re-extract, Graph Diff, Incremental Update, prune_sources Deletion Pruning

### Community 60 - "Admin Protected Layout"
Cohesion: 0.29
Nodes (7): Wiki Export, Cluster-Only Rerun, Community Detection, Community Labeling, God Nodes, GRAPH_REPORT.md Output, Knowledge Graph

### Community 61 - "Deployment + Stack Docs"
Cohesion: 0.29
Nodes (7): Confidence Score Rubric, Hyperedges, Semantic Similarity Edges, Extraction Subagent Prompt, Image Vision Extraction Rules, EXTRACTED/INFERRED/AMBIGUOUS Audit Trail, Parallel Extraction Subagents

### Community 62 - "Globe + Locations Sessions"
Cohesion: 0.33
Nodes (5): localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyViewer()

### Community 63 - "Graphify Transcription/Cache"
Cohesion: 0.29
Nodes (6): Deployment, Getting started, HM Visuals, Stack, Verification, Working document

### Community 64 - "GeoNames Import Script"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 65 - "Cloudinary Image Loader"
Cohesion: 0.29
Nodes (6): HM Visuals — Session Archive, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Session C4 — Media locations: validated city + stored coordinates — `done`, Session D6 — Exhibition globe — `done`, Session L1 — Launch prep checklist — `done` (2026-08-20)

### Community 66 - "Next Config + CSP"
Cohesion: 0.47
Nodes (5): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams

### Community 67 - "Design Skills"
Cohesion: 0.47
Nodes (4): AdminProtectedLayout(), nav, AdminThemeToggle(), useIsMounted()

### Community 68 - "Self-Improving Memory Loop"
Cohesion: 0.33
Nodes (6): MCP Server Export, BFS Traversal, Constrained Query Expansion, Fast Path Existing Graph Query, Graph Health Check, Honesty Rules

### Community 69 - "Admin Password Hash Script"
Cohesion: 0.33
Nodes (6): Whisper Domain-Hint Prompt, Whisper Transcription, Extraction Cache, Gemini Extraction Backend, No API Key Required, Semantic (LLM) Extraction

### Community 70 - "Admin Layout"
Cohesion: 0.33
Nodes (6): Phase 0 — Foundation (must complete before any design session), Session F1 — Remove violations + initialize Lenis — `done`, Session F2 — Code refactoring: extract reusable components — `done`, Session F3 — Split large admin files — `done`, Session F4 — Design-rule cleanup + dead code removal — `done`, Session F5 — Admin orchestration & data-layer consolidation — `done`

### Community 71 - "Removal Requests Stub"
Cohesion: 0.33
Nodes (6): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session N9 — Stop public chrome rendering on admin — `done` (2026-08-19), Session S10 — Two security fixes — `done`, Session S11 — Admin: stop losing work — `done` (2026-08-19), Session S8 — Two resource leaks — `done`, Session S9 — Revalidation coverage — `done`

### Community 72 - "Videography Videos Redirect"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 73 - "About Rebuild Session"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 74 - "ESLint Config"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 75 - "Base URL Helper"
Cohesion: 0.50
Nodes (4): Phase DS — Design system rescue (Impeccable), Session DS0 — Install the design + motion skill stack — `done`, Session DS1 — Evaluate the detector (no install, no hooks) — `done`, Session DS2 — Fold Impeccable findings in; skills for the design gaps — `done`

### Community 76 - "PostCSS Config"
Cohesion: 0.67
Nodes (3): redesign-existing-projects skill, frontend-design LICENSE, frontend-design skill

### Community 77 - "UI Icons"
Cohesion: 0.67
Nodes (3): LESSONS.md / reflect, save-result Feedback Loop, Work Memory Self-Improving Loop

### Community 79 - "Server Modules Smoke Test"
Cohesion: 0.67
Nodes (3): Phase 2 — Preloader & core experience (completed portion), Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done`

### Community 80 - "Vitest Config"
Cohesion: 0.67
Nodes (3): Phase 2a — Design direction (ran before D4), Session D2b — Homepage section pass — `done`, Session D2c — About page rebuild — `done`

### Community 81 - "Token Reduction Benchmark"
Cohesion: 0.67
Nodes (3): Phase T — Tag taxonomy & discipline subpages, Session T1 — Tag taxonomy: `media_tags` + `/admin/tags` — `done`, Session T2 — `/photography/[tag]` and `/videography/[tag]` — `done`

## Knowledge Gaps
- **392 isolated node(s):** `How to use`, `Status legend`, `Completed so far — full specs + outcomes in SESSION-ARCHIVE.md`, `Run order — set by Hussain 2026-08-17`, `Minimum to go live` (+387 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `NFT Query Builder` to `Private Galleries Admin`, `Build Tooling + package.json`, `NFT Admin + Inquiries API`, `About/Blog Pages`, `Home Testimonials + Trust`, `Service Categories Admin`, `Tag Multi-Select Admin`, `Contact Form`, `Media Filter + Grid`, `Animation Skills`, `Services Admin`, `Media List Admin`, `Inquiry Lib Helpers`, `components.json`, `Media Card Grid`, `Session Token Auth`, `Media Details Sections`, `Gallery Form + Hero Bokeh`, `CI Workflow`, `Design Direction Concepts`, `Graphify Skill Integration`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `dependencies` connect `App Shell + Root Layout` to `Admin Card Image Editors`, `Runtime Dependencies`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `How to use`, `Status legend`, `Completed so far — full specs + outcomes in SESSION-ARCHIVE.md` to the rest of the system?**
  _392 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Media Appearances Admin` be split into smaller, more focused modules?**
  _Cohesion score 0.05459770114942529 - nodes in this community are weakly interconnected._
- **Should `Media Location + Serializers` be split into smaller, more focused modules?**
  _Cohesion score 0.09803921568627451 - nodes in this community are weakly interconnected._
- **Should `Admin Card Image Editors` be split into smaller, more focused modules?**
  _Cohesion score 0.061224489795918366 - nodes in this community are weakly interconnected._
- **Should `Admin Login + Auth Route` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._