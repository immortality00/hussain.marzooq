# Graph Report - .  (2026-08-20)

## Corpus Check
- 347 files · ~181,925 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1512 nodes · 3791 edges · 94 communities (73 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

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
- About Rebuild Session
- ESLint Config
- PostCSS Config
- UI Icons
- Starter Boilerplate Logos
- Server Modules Smoke Test
- Vitest Config
- Token Reduction Benchmark
- Globe Day Texture
- Globe Topology Map
- Globe Icon
- Session C1 Blog
- Session C2 OG Images
- Session C3 Analytics
- Session D11 Web Dev Page
- Session D12 People Page
- Session D8 Magnetic Button
- Session NFT1 Contract
- Session NFT2 Minting
- Session P2 Mobile Pass

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 121 edges
2. `noStoreJson()` - 78 edges
3. `isRecord()` - 52 edges
4. `getPageSeo()` - 43 edges
5. `requireAdminObjectId()` - 33 edges
6. `requireAdminOr401()` - 31 edges
7. `findByIdOr404()` - 30 edges
8. `asNullableString()` - 29 edges
9. `getPageSections()` - 27 edges
10. `cn()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `frontend-design skill` --semantically_similar_to--> `redesign-existing-projects skill`  [INFERRED] [semantically similar]
  .claude/skills/frontend-design/SKILL.md → .agents/skills/redesign-existing-projects/SKILL.md
- `AdminProtectedLayout()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/auth/admin.ts
- `TagMultiSelect()` --calls--> `slugifyTag()`  [EXTRACTED]
  app/admin/(protected)/media/components/TagMultiSelect.tsx → lib/server/media-tags.ts
- `AdminTagsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/tags/page.tsx → lib/server/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **graphify Query Flows** — claude_skills_graphify_references_query_bfs_traversal, claude_skills_graphify_references_query_dfs_traversal, claude_skills_graphify_references_query_query_expansion, claude_skills_graphify_references_query_path, claude_skills_graphify_references_query_explain [EXTRACTED 0.90]
- **Approved Homepage Section Order** — claude_md_exhibition_globe, claude_md_section_system, claude_md_button_system, claude_md_hero_fixed [EXTRACTED 0.85]
- **Security Baseline (auth + CSP + rules)** — claude_md_auth_state, claude_md_csp, claude_md_security_rules, session_queue_s1 [EXTRACTED 0.85]
- **Launch-Blocking Session Set** — session_queue_d2b, session_queue_d6, session_queue_c4, session_queue_s10, session_queue_l1 [EXTRACTED 1.00]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (94 total, 21 thin omitted)

### Community 0 - "Media Appearances Admin"
Cohesion: 0.06
Nodes (57): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem() (+49 more)

### Community 1 - "Media Location + Serializers"
Cohesion: 0.06
Nodes (72): asFiniteLatitude(), asFiniteLongitude(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType, NftStatus, normalizeCurrency() (+64 more)

### Community 2 - "Admin Card Image Editors"
Cohesion: 0.05
Nodes (55): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+47 more)

### Community 3 - "Admin Login + Auth Route"
Cohesion: 0.10
Nodes (38): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, POST(), asNullableString(), getClientAddress() (+30 more)

### Community 4 - "NFT Query Builder"
Cohesion: 0.08
Nodes (41): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+33 more)

### Community 5 - "Private Galleries Admin"
Cohesion: 0.09
Nodes (28): PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus() (+20 more)

### Community 6 - "App Shell + Root Layout"
Cohesion: 0.06
Nodes (32): metadata, AppShell(), CustomCursor(), Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS (+24 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.04
Nodes (45): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+37 more)

### Community 8 - "Build Tooling + package.json"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 9 - "NFT Admin + Inquiries API"
Cohesion: 0.17
Nodes (29): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET() (+21 more)

### Community 10 - "shadcn UI Primitives"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 11 - "About/Blog Pages"
Cohesion: 0.15
Nodes (23): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), BlogPage(), generateMetadata(), generateMetadata(), SP, DancingPage() (+15 more)

### Community 12 - "Common Validators"
Cohesion: 0.18
Nodes (24): asFiniteNumber(), asNumberOrNull(), asString(), isRecord(), isValidObjectIdString(), normalizeSlug(), parseObjectId(), ensureUniqueSlug() (+16 more)

### Community 13 - "Home Testimonials + Trust"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage() (+14 more)

### Community 14 - "TS Config"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "Inquiries Admin UI"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 16 - "Service Categories Admin"
Cohesion: 0.14
Nodes (17): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), CategoryRow(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory() (+9 more)

### Community 17 - "Access Rate-Limit Routes"
Cohesion: 0.18
Nodes (23): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate(), isPrivateGalleryExpired() (+15 more)

### Community 18 - "Tag Multi-Select Admin"
Cohesion: 0.16
Nodes (16): TagMultiSelect(), TagOption, AdminTagsClient(), EMPTY_DRAFT, TagFormCard(), TagsTable(), TagsToolbar(), createTagRequest() (+8 more)

### Community 19 - "Contact Form"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 20 - "Media Filter + Grid"
Cohesion: 0.15
Nodes (16): MediaFilterBar(), MediaGrid(), MediaTagChips(), TagChip, TagChipRow(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode (+8 more)

### Community 21 - "Testimonial Form + Banner"
Cohesion: 0.19
Nodes (14): Banner, TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars() (+6 more)

### Community 22 - "Animation Skills"
Cohesion: 0.12
Nodes (23): Animation Recipes, animate skill, animation-vocabulary skill, apple-design skill, Spring interruptibility and velocity handoff, emil-design-eng skill, Emil Kowalski animation philosophy, find-animation-opportunities skill (+15 more)

### Community 23 - "Services Admin"
Cohesion: 0.17
Nodes (14): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServicesToolbar() (+6 more)

### Community 24 - "Tag Subpages"
Cohesion: 0.17
Nodes (19): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyTagPage(), TagDiscipline, getPageSettings(), disciplineMatch(), DisciplineTag (+11 more)

### Community 25 - "Contact/Services Public Pages"
Cohesion: 0.19
Nodes (16): ContactPage(), generateMetadata(), ServicesPage(), ServiceDetailPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard() (+8 more)

### Community 26 - "Media List Admin"
Cohesion: 0.15
Nodes (15): MediaListFilterBar(), Props, formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage() (+7 more)

### Community 27 - "Inquiry Lib Helpers"
Cohesion: 0.32
Nodes (15): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+7 more)

### Community 28 - "Media PATCH Routes"
Cohesion: 0.33
Nodes (16): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 29 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 30 - "Media Card Grid"
Cohesion: 0.19
Nodes (9): MediaItem, cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder() (+1 more)

### Community 31 - "Testimonial Cloudinary Cleanup"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 32 - "Homepage Sections"
Cohesion: 0.15
Nodes (13): generateMetadata(), HomePage(), DISCIPLINE_LINKS, HomeCreativeSystem(), HomeExhibitionGlobe(), HomeTrust(), BaseProps, Button() (+5 more)

### Community 33 - "Testimonial Locations"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 34 - "Session Token Auth"
Cohesion: 0.25
Nodes (11): createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual(), config, isAdminAuthed(), isPublicAdminRoute() (+3 more)

### Community 35 - "Services API Client"
Cohesion: 0.29
Nodes (13): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+5 more)

### Community 36 - "Pages Admin + Sections"
Cohesion: 0.18
Nodes (12): AdminPagesPage(), AboutSections, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, getAllPageSections(), mergeWithDefaults() (+4 more)

### Community 37 - "Tag Revalidation Routes"
Cohesion: 0.30
Nodes (11): PATCH(), revalidateTagSurfaces(), GET(), POST(), serializeTag(), tagCounts(), isReservedTagSlug(), isValidTagSlug() (+3 more)

### Community 38 - "Media Details Sections"
Cohesion: 0.20
Nodes (7): AppearanceBlock(), MediaSurface(), TagLink, formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 39 - "Gallery Form + Hero Bokeh"
Cohesion: 0.20
Nodes (8): PrivateGalleryPage(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero(), AnimatedText(), AnimatedTextProps, Tag

### Community 40 - "Photography/Videography Pages"
Cohesion: 0.23
Nodes (11): generateMetadata(), PhotographyPage(), generateMetadata(), VideographyPage(), PortfolioFallbackPanel(), PortfolioFallbackPanelItem, PortfolioFallbackPanelLink, getPhotographyItems() (+3 more)

### Community 41 - "Cloudinary Download Helpers"
Cohesion: 0.19
Nodes (7): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, PrivateGalleryBrowser(), SmartImage()

### Community 42 - "Page-Settings Routes"
Cohesion: 0.22
Nodes (9): PATCH(), SLUG_TO_PATH, PATCH(), SLUG_TO_PATH, isAdminAuthedServer(), client, getDbName(), ALL_PAGE_SECTIONS_SLUGS (+1 more)

### Community 43 - "Disciplines + Stars"
Cohesion: 0.31
Nodes (8): DISCIPLINES, GET(), generateMetadata(), renderStars(), TestimonialsPage(), isSectionImage(), getAllPageSettings(), readCardImage()

### Community 44 - "People Public Pages"
Cohesion: 0.33
Nodes (9): generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType(), normalizeStringArray(), PublicPersonDetail (+1 more)

### Community 45 - "Core Architecture Concepts"
Cohesion: 0.18
Nodes (11): admin-route.ts Helpers (S2b), AppShell Global Element Host, Code Quality Rules, Contact-Sheet Homepage Transition, 6-Item Navigation + Work Overlay, Page Transitions (content-as-animation engine), Preloader (GSAP icon sequence), Reusable Shared Components (+3 more)

### Community 46 - "CI Workflow"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 47 - "People Admin"
Cohesion: 0.29
Nodes (6): getString(), isRecord(), PeopleAdminClient(), WidgetResult, PersonItem, usePeopleAdmin()

### Community 48 - "Security + Pipeline Concepts"
Cohesion: 0.27
Nodes (10): Admin Auth (scrypt hash + HMAC session token), Content-Security-Policy Allowlist, Cloudinary Custom Image Loader Pipeline, 3-Gate Queue Protocol, Standing Security Rules, CLAUDE.md Working Document, Session Archive, Session Queue (+2 more)

### Community 49 - "Pending Design Sessions"
Cohesion: 0.20
Nodes (10): Known Defects Register, Design & Motion Skills Routing, Session D10 — Dancing Page, Session D13 — Final Consistency Pass, Session D4 — Page Transition System, Session D5 — Cursor Enhancements, Session D7 — NFT Page Redesign, Session D9 — Admin Visual Redesign (+2 more)

### Community 50 - "Graphify Exports"
Cohesion: 0.22
Nodes (10): FalkorDB Cypher Export, Neo4j Cypher Export, Cross-Repo Graph Merge, GitHub Repo Clone, graphify explain (Node Explanation), NetworkX Inline Traversal Fallback, graphify path (Shortest Path), graph.json Output (+2 more)

### Community 51 - "Content CMS + Tags Concepts"
Cohesion: 0.25
Nodes (9): Discipline Tag Subpages, Page Content CMS (page_settings/page_seo/page_sections), Page Activity isActive Toggle, Photography 3-View Viewer (Cylinder/Horizontal/Grid), Layout-wide Revalidation Strategy, Tag Taxonomy (media_tags), Session S9 — Revalidation Coverage, Session T1 — Tag Taxonomy + /admin/tags (+1 more)

### Community 52 - "Design Direction Concepts"
Cohesion: 0.32
Nodes (8): Shared Button Two-Look System, Design Direction (measured-from-code spec), Design Tokens & Radius Scale, The Hero Is Fixed, What Is NOT In the Design (bans), Section Hairline System, Session F1 — Remove Violations + Init Lenis, Session D2b — Homepage Sections + Button System

### Community 53 - "Cloudinary Sign Route"
Cohesion: 0.52
Nodes (6): ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp()

### Community 54 - "Graphify Skill Integration"
Cohesion: 0.29
Nodes (7): graphify CLAUDE.md Integration, Watch Mode Auto-Rebuild, Node ID Format Rule, graphify claude install (Native CLAUDE.md), graphify Skill, Python Interpreter Detection, Structural (AST) Extraction

### Community 55 - "Graphify Incremental Update"
Cohesion: 0.29
Nodes (7): graphify add URL Ingest, Verbatim source_file Rule, Post-Commit Auto-Rebuild Hook, build_merge Replace-on-Re-extract, Graph Diff, Incremental Update, prune_sources Deletion Pruning

### Community 56 - "Graphify Query Traversal"
Cohesion: 0.29
Nodes (7): MCP Server Export, BFS Traversal, DFS Traversal, Constrained Query Expansion, Fast Path Existing Graph Query, Graph Health Check, Honesty Rules

### Community 57 - "Graphify Clustering"
Cohesion: 0.29
Nodes (7): Wiki Export, Cluster-Only Rerun, Community Detection, Community Labeling, God Nodes, GRAPH_REPORT.md Output, Knowledge Graph

### Community 58 - "Graphify Extraction Rules"
Cohesion: 0.29
Nodes (7): Confidence Score Rubric, Hyperedges, Semantic Similarity Edges, Extraction Subagent Prompt, Image Vision Extraction Rules, EXTRACTED/INFERRED/AMBIGUOUS Audit Trail, Parallel Extraction Subagents

### Community 59 - "Index Ensure Script"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 60 - "Admin Protected Layout"
Cohesion: 0.47
Nodes (4): AdminProtectedLayout(), nav, AdminThemeToggle(), useIsMounted()

### Community 61 - "Deployment + Stack Docs"
Cohesion: 0.33
Nodes (6): Domain & Deployment Status, Tech Stack (Next.js 16, React 19, MongoDB, Cloudinary, Netlify), Testing & CI (Vitest, no next build), HM Visuals README, Session L1 — Launch Prep (code/docs), Session S3 — Vitest + CI Baseline

### Community 62 - "Globe + Locations Sessions"
Cohesion: 0.40
Nodes (6): Exhibition Globe (react-globe.gl), Validated Media Locations + Coordinates, Session C4 — Validated Media Locations, Session D6 — Exhibition Globe, Minimum-to-Go-Live Set, Session S10 — Login Rate-limit + Email Injection

### Community 63 - "Graphify Transcription/Cache"
Cohesion: 0.33
Nodes (6): Whisper Domain-Hint Prompt, Whisper Transcription, Extraction Cache, Gemini Extraction Backend, No API Key Required, Semantic (LLM) Extraction

### Community 64 - "GeoNames Import Script"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 65 - "Cloudinary Image Loader"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 66 - "Next Config + CSP"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 67 - "Design Skills"
Cohesion: 0.67
Nodes (3): redesign-existing-projects skill, frontend-design LICENSE, frontend-design skill

### Community 68 - "Self-Improving Memory Loop"
Cohesion: 0.67
Nodes (3): LESSONS.md / reflect, save-result Feedback Loop, Work Memory Self-Improving Loop

## Knowledge Gaps
- **310 isolated node(s):** `DISCIPLINE_HREFS`, `InquiryStatus`, `nav`, `SelectedPerson`, `currencies` (+305 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `NFT Admin + Inquiries API` to `Media Location + Serializers`, `Admin Card Image Editors`, `Admin Login + Auth Route`, `NFT Query Builder`, `About/Blog Pages`, `Common Validators`, `Home Testimonials + Trust`, `Access Rate-Limit Routes`, `Tag Multi-Select Admin`, `Services Admin`, `Tag Subpages`, `Contact/Services Public Pages`, `Inquiry Lib Helpers`, `Media PATCH Routes`, `Testimonial Cloudinary Cleanup`, `Homepage Sections`, `Testimonial Locations`, `Pages Admin + Sections`, `Tag Revalidation Routes`, `Photography/Videography Pages`, `Page-Settings Routes`, `Disciplines + Stars`, `People Public Pages`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Build Tooling + package.json`, `App Shell + Root Layout`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **What connects `DISCIPLINE_HREFS`, `InquiryStatus`, `nav` to the rest of the system?**
  _310 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Media Appearances Admin` be split into smaller, more focused modules?**
  _Cohesion score 0.05742296918767507 - nodes in this community are weakly interconnected._
- **Should `Media Location + Serializers` be split into smaller, more focused modules?**
  _Cohesion score 0.06397016637980493 - nodes in this community are weakly interconnected._
- **Should `Admin Card Image Editors` be split into smaller, more focused modules?**
  _Cohesion score 0.050617283950617285 - nodes in this community are weakly interconnected._
- **Should `Admin Login + Auth Route` be split into smaller, more focused modules?**
  _Cohesion score 0.10030165912518854 - nodes in this community are weakly interconnected._