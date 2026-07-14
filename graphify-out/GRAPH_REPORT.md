# Graph Report - .  (2026-07-14)

## Corpus Check
- 272 files · ~98,958 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1277 nodes · 3152 edges · 91 communities (65 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.73)
- Token cost: 199,813 input · 35,260 output

## Community Hubs (Navigation)
- Admin Media & People Lists
- Home Sections & Media Cards
- Cloudinary Sign/Upload API
- Media Detail Sections
- Admin Auth & Login
- Private Galleries Admin
- Services Admin
- Interior Public Pages
- shadcn/ui Primitives
- Media Domain Model
- TS Config Globs
- Inquiries Admin
- Root Layout & Nav Shell
- Public Form Security API
- Contact Form
- NFT Admin & API
- Home Sections Admin Forms
- Public Review Form
- Shared API Helpers
- Contact/Services Pages
- Runtime Dependencies
- NFT Display Lib
- Dev Dependencies
- Testimonial Cleanup API
- Media Search/Cursor API
- People/Service Public Pages
- Gallery Access API
- shadcn components.json
- Pages Admin (SEO+Sections)
- Location/Geocoding
- Page Sections Data
- Testimonials & AnimatedText
- package.json
- Page Sections Shared
- Home Hero & Bokeh
- Admin Protected Layout
- Media Query API
- CMS Collections & Sessions
- Service Inquiry API
- Homepage WebGL Scene
- graphify Exports
- Design Standard & Transitions
- Navigation & Work Overlay
- Featured Work Cards
- Card Image Fields
- Visibility Group Cards
- graphify Skill Internals
- Design Tokens & Reusables
- graphify Update/Ingest
- graphify Query Engine
- graphify Core Analysis
- graphify Extraction Spec
- Auth Proxy Middleware
- Mongo Index Setup
- AppShell & Preloader
- Semantic Extraction
- GeoNames Import
- Exhibition Globe
- Next.js Framework
- Work Memory Loop
- Admin Password Hash
- Blog
- Dancing Page
- People Page Privacy
- Web Development Page
- Cloudinary Dep
- dnd-kit Sortable
- dnd-kit Utilities
- ESLint Config
- Geist Dep
- GSAP Dep
- @gsap/react Dep
- Next Dep
- Next Config
- Radix UI Dep
- React Dep
- React DOM Dep
- tailwind-merge Dep
- PostCSS Config
- Starter UI Icons
- Starter Boilerplate Logos
- Animation Stack
- graphify Graph
- Queue Protocol
- Token Benchmark
- Globe Icon

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 108 edges
2. `noStoreJson()` - 69 edges
3. `requireAdminOr401()` - 51 edges
4. `isRecord()` - 46 edges
5. `getPageSeo()` - 40 edges
6. `asNullableString()` - 29 edges
7. `getPageSections()` - 25 edges
8. `getAllPageSettings()` - 23 edges
9. `cn()` - 23 edges
10. `PATCH()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `page_seo collection` --semantically_similar_to--> `page_sections collection`  [INFERRED] [semantically similar]
  CLAUDE.md → SESSION-QUEUE.md
- `Next.js (create-next-app)` --semantically_similar_to--> `Next.js 16 (App Router)`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Animation Stack Members** — claude_lenis, claude_gsap_scrolltrigger, claude_three_js, claude_r3f, claude_react_globe, claude_animation_stack [EXTRACTED 1.00]
- **Homepage WebGL Scene Build Phasing (D2a-D2d)** — session_queue_d2a, session_queue_d2b, session_queue_d2c, session_queue_d2d, claude_homepage_webgl_scene [EXTRACTED 1.00]
- **Page Content CMS Trilogy (/admin/pages)** — claude_page_settings, claude_page_seo, claude_page_sections [EXTRACTED 1.00]
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Query Flows** — claude_skills_graphify_references_query_bfs_traversal, claude_skills_graphify_references_query_dfs_traversal, claude_skills_graphify_references_query_query_expansion, claude_skills_graphify_references_query_path, claude_skills_graphify_references_query_explain [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (91 total, 26 thin omitted)

### Community 0 - "Admin Media & People Lists"
Cohesion: 0.06
Nodes (43): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+35 more)

### Community 1 - "Home Sections & Media Cards"
Cohesion: 0.06
Nodes (40): HomeTestimonialCard(), HomeTrust(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), AppearanceBlock(), MediaFilterBar(), localFilterItems(), PublicMediaResponse (+32 more)

### Community 2 - "Cloudinary Sign/Upload API"
Cohesion: 0.08
Nodes (52): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+44 more)

### Community 3 - "Media Detail Sections"
Cohesion: 0.09
Nodes (34): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+26 more)

### Community 4 - "Admin Auth & Login"
Cohesion: 0.09
Nodes (42): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), hmacHex(), login(), SearchParams (+34 more)

### Community 5 - "Private Galleries Admin"
Cohesion: 0.09
Nodes (28): MediaListFilterBar(), Props, PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps (+20 more)

### Community 6 - "Services Admin"
Cohesion: 0.10
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 7 - "Interior Public Pages"
Cohesion: 0.17
Nodes (26): AboutPage(), generateMetadata(), BlogPage(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage() (+18 more)

### Community 8 - "shadcn/ui Primitives"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 9 - "Media Domain Model"
Cohesion: 0.15
Nodes (28): asBooleanOrNull(), Appearance, getMediaLists(), NftCurrency, NftEditionType, NftMeta, NftStatus, normalizeCurrency() (+20 more)

### Community 10 - "TS Config Globs"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 11 - "Inquiries Admin"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 12 - "Root Layout & Nav Shell"
Cohesion: 0.08
Nodes (21): metadata, AppShell(), CustomCursor(), Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS (+13 more)

### Community 13 - "Public Form Security API"
Cohesion: 0.20
Nodes (19): POST(), asNullableString(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), POST(), GET(), isAllowedCloudinaryTestimonialUrl() (+11 more)

### Community 14 - "Contact Form"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 15 - "NFT Admin & API"
Cohesion: 0.19
Nodes (18): AdminNftsPage(), GET(), isValidObjectIdString(), DELETE(), ensureUniqueSlug(), GET(), PATCH(), slugify() (+10 more)

### Community 16 - "Home Sections Admin Forms"
Cohesion: 0.14
Nodes (15): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), SLUG_LABELS, AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField() (+7 more)

### Community 17 - "Public Review Form"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 18 - "Shared API Helpers"
Cohesion: 0.28
Nodes (17): asNumberOrNull(), asString(), isRecord(), normalizeSlug(), noStoreJson(), DELETE(), PATCH(), GET() (+9 more)

### Community 19 - "Contact/Services Pages"
Cohesion: 0.18
Nodes (17): ContactPage(), generateMetadata(), SP, generateMetadata(), ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections (+9 more)

### Community 20 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, @dnd-kit/core, framer-motion, lucide-react, mongodb, next-cloudinary, next-themes (+15 more)

### Community 21 - "NFT Display Lib"
Cohesion: 0.26
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.09
Nodes (23): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @tsconfig/recommended (+15 more)

### Community 23 - "Testimonial Cleanup API"
Cohesion: 0.16
Nodes (19): asFiniteNumber(), parseObjectId(), CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), DELETE(), deleteAssetsByPublicIds(), GET() (+11 more)

### Community 24 - "Media Search/Cursor API"
Cohesion: 0.18
Nodes (19): buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseLimit() (+11 more)

### Community 25 - "People/Service Public Pages"
Cohesion: 0.16
Nodes (16): DISCIPLINES, GET(), generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), ServiceDetailPage(), getAllPageSettings() (+8 more)

### Community 26 - "Gallery Access API"
Cohesion: 0.32
Nodes (16): asStringArray(), GET(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 27 - "shadcn components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 28 - "Pages Admin (SEO+Sections)"
Cohesion: 0.20
Nodes (13): PageRowCard(), SectionsData, SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow (+5 more)

### Community 29 - "Location/Geocoding"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 30 - "Page Sections Data"
Cohesion: 0.17
Nodes (13): AdminPagesPage(), AboutSections, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, getAllPageSections(), HomeSections (+5 more)

### Community 31 - "Testimonials & AnimatedText"
Cohesion: 0.18
Nodes (10): generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+2 more)

### Community 32 - "package.json"
Cohesion: 0.12
Nodes (15): allowScripts, sharp@0.34.5, unrs-resolver@1.11.1, name, overrides, postcss, private, scripts (+7 more)

### Community 33 - "Page Sections Shared"
Cohesion: 0.27
Nodes (10): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), EMPTY_SECTION_IMAGE, isSectionImage(), ALL_PAGE_SECTIONS_SLUGS (+2 more)

### Community 34 - "Home Hero & Bokeh"
Cohesion: 0.24
Nodes (8): HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, firstImage(), HomeHero(), SmartImage()

### Community 35 - "Admin Protected Layout"
Cohesion: 0.24
Nodes (9): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), hmacHex(), isAdminAuthedServer() (+1 more)

### Community 36 - "Media Query API"
Cohesion: 0.29
Nodes (11): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+3 more)

### Community 37 - "CMS Collections & Sessions"
Cohesion: 0.24
Nodes (11): Cloudinary, MongoDB Atlas, page_sections collection, page_seo collection, page_settings collection, Session D2b — Photography stations, Session N3 — SEO + page metadata admin, Session N4 — Page header content (extend page_seo) (+3 more)

### Community 38 - "Service Inquiry API"
Cohesion: 0.33
Nodes (6): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH()

### Community 39 - "Homepage WebGL Scene"
Cohesion: 0.27
Nodes (10): AnimatedText component, DOM-sync Overlay System, GSAP ScrollTrigger, HeroBokeh component, Hero Ring (hero-ring.glb), Homepage WebGL Scene (camera-on-a-rail), Ice/Frost Look (animated shader), react-three-fiber + drei (+2 more)

### Community 40 - "graphify Exports"
Cohesion: 0.22
Nodes (10): FalkorDB Cypher Export, Neo4j Cypher Export, Cross-Repo Graph Merge, GitHub Repo Clone, graphify explain (Node Explanation), NetworkX Inline Traversal Fallback, graphify path (Shortest Path), graph.json Output (+2 more)

### Community 41 - "Design Standard & Transitions"
Cohesion: 0.25
Nodes (8): aikawakenichi.com (reference), Design Standard (benchmarks), igloo.inc (reference), Page Transitions (content-as-animation), Photography Viewer (3 modes), ten.375.studio (reference), Session D3 — Photography 3-mode viewer, Session D4 — Page transition system

### Community 42 - "Navigation & Work Overlay"
Cohesion: 0.25
Nodes (8): 6-item Navigation, Navbar component, Page Activity Toggle (isActive), Work Overlay, Session D2c — Extend to remaining disciplines, Session N1 — Minimal nav + Work overlay, Session N2 — Page activity toggle system, Session N8 — Add People + Testimonials to navbar

### Community 43 - "Featured Work Cards"
Cohesion: 0.29
Nodes (6): CTA_LABELS, HomeFeaturedWork(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug

### Community 44 - "Card Image Fields"
Cohesion: 0.48
Nodes (5): CardImageGroup(), getString(), ImageField(), isRecord(), SectionImage

### Community 45 - "Visibility Group Cards"
Cohesion: 0.33
Nodes (5): GroupCard(), GroupTint, ICON_TINTS, TINTS, VisibilityGroup()

### Community 46 - "graphify Skill Internals"
Cohesion: 0.29
Nodes (7): graphify CLAUDE.md Integration, Watch Mode Auto-Rebuild, Node ID Format Rule, graphify claude install (Native CLAUDE.md), graphify Skill, Python Interpreter Detection, Structural (AST) Extraction

### Community 47 - "Design Tokens & Reusables"
Cohesion: 0.33
Nodes (7): Design Tokens (OKLCH), PageHeader component, PortfolioCard component, section-shell class, Session D13 — Final public consistency pass, Session D9 — Admin visual redesign, Session F2 — Extract reusable components

### Community 48 - "graphify Update/Ingest"
Cohesion: 0.29
Nodes (7): graphify add URL Ingest, Verbatim source_file Rule, Post-Commit Auto-Rebuild Hook, build_merge Replace-on-Re-extract, Graph Diff, Incremental Update, prune_sources Deletion Pruning

### Community 49 - "graphify Query Engine"
Cohesion: 0.29
Nodes (7): MCP Server Export, BFS Traversal, DFS Traversal, Constrained Query Expansion, Fast Path Existing Graph Query, Graph Health Check, Honesty Rules

### Community 50 - "graphify Core Analysis"
Cohesion: 0.29
Nodes (7): Wiki Export, Cluster-Only Rerun, Community Detection, Community Labeling, God Nodes, GRAPH_REPORT.md Output, Knowledge Graph

### Community 51 - "graphify Extraction Spec"
Cohesion: 0.29
Nodes (7): Confidence Score Rubric, Hyperedges, Semantic Similarity Edges, Extraction Subagent Prompt, Image Vision Extraction Rules, EXTRACTED/INFERRED/AMBIGUOUS Audit Trail, Parallel Extraction Subagents

### Community 52 - "Auth Proxy Middleware"
Cohesion: 0.48
Nodes (6): config, isAdminAuthed(), isPublicAdminRoute(), proxy(), signCookieValue(), toHex()

### Community 53 - "Mongo Index Setup"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 54 - "AppShell & Preloader"
Cohesion: 0.40
Nodes (6): AppShell component, Lenis (smooth scroll), Preloader, Session D1 — Preloader, Session D2d — Preloader handoff + scene polish, Session F1 — Remove violations + Lenis

### Community 55 - "Semantic Extraction"
Cohesion: 0.33
Nodes (6): Whisper Domain-Hint Prompt, Whisper Transcription, Extraction Cache, Gemini Extraction Backend, No API Key Required, Semantic (LLM) Extraction

### Community 56 - "GeoNames Import"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 57 - "Exhibition Globe"
Cohesion: 0.50
Nodes (4): Exhibition Globe, react-globe.gl, Session C4 — Appearances city selector, Session D6 — Exhibition globe

### Community 58 - "Next.js Framework"
Cohesion: 0.67
Nodes (3): Next.js 16 (App Router), Geist font (next/font), Next.js (create-next-app)

### Community 59 - "Work Memory Loop"
Cohesion: 0.67
Nodes (3): LESSONS.md / reflect, save-result Feedback Loop, Work Memory Self-Improving Loop

## Knowledge Gaps
- **259 isolated node(s):** `InquiryStatus`, `nav`, `SelectedPerson`, `currencies`, `NftMeta` (+254 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `NFT Admin & API` to `Home Sections & Media Cards`, `Admin Auth & Login`, `Services Admin`, `Interior Public Pages`, `Media Domain Model`, `Public Form Security API`, `Shared API Helpers`, `Contact/Services Pages`, `NFT Display Lib`, `Testimonial Cleanup API`, `Media Search/Cursor API`, `People/Service Public Pages`, `Gallery Access API`, `Location/Geocoding`, `Page Sections Data`, `Testimonials & AnimatedText`, `Page Sections Shared`, `Home Hero & Bokeh`, `Admin Protected Layout`, `Media Query API`, `Service Inquiry API`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `package.json`, `Cloudinary Dep`, `dnd-kit Sortable`, `dnd-kit Utilities`, `Geist Dep`, `GSAP Dep`, `@gsap/react Dep`, `Root Layout & Nav Shell`, `Next Dep`, `Radix UI Dep`, `React Dep`, `React DOM Dep`, `tailwind-merge Dep`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `InquiryStatus`, `nav`, `SelectedPerson` to the rest of the system?**
  _259 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Media & People Lists` be split into smaller, more focused modules?**
  _Cohesion score 0.05955734406438632 - nodes in this community are weakly interconnected._
- **Should `Home Sections & Media Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.056692242114237 - nodes in this community are weakly interconnected._
- **Should `Cloudinary Sign/Upload API` be split into smaller, more focused modules?**
  _Cohesion score 0.08240794856808883 - nodes in this community are weakly interconnected._
- **Should `Media Detail Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.09142857142857143 - nodes in this community are weakly interconnected._