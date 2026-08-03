# Graph Report - hussain.marzooq  (2026-08-03)

## Corpus Check
- 282 files · ~104,861 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1370 nodes · 3258 edges · 95 communities (70 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2c114ff3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- public-people.ts
- TS Config Globs
- Inquiries Admin
- Root Layout & Nav Shell
- Public Form Security API
- Contact Form
- NFT Admin & API
- Home Sections Admin Forms
- Public Review Form
- route.ts
- Contact/Services Pages
- Runtime Dependencies
- package.json
- Dev Dependencies
- GroupCard.tsx
- Media Search/Cursor API
- README.md
- cloudinary
- shadcn components.json
- Pages Admin (SEO+Sections)
- Location/Geocoding
- Page Sections Data
- Testimonials & AnimatedText
- @dnd-kit/sortable
- Page Sections Shared
- Home Hero & Bokeh
- package.json
- @dnd-kit/utilities
- CMS Collections & Sessions
- geist
- Homepage WebGL Scene
- graphify Exports
- Design Standard & Transitions
- Navigation & Work Overlay
- Featured Work Cards
- Card Image Fields
- cloudinary
- graphify Skill Internals
- Design Tokens & Reusables
- @dnd-kit/sortable
- graphify Query Engine
- @dnd-kit/utilities
- geist
- Auth Proxy Middleware
- Mongo Index Setup
- gsap
- @gsap/react
- GeoNames Import
- next
- Next.js Framework
- radix-ui
- Admin Password Hash
- react
- react-dom
- tailwind-merge
- PageRowCard.tsx
- page-sections-shared.ts
- TestimonialForm.tsx
- cloudinary-image-loader.ts
- AppShell.tsx
- ESLint Config
- ImageField.tsx
- ReviewPhotoStrip.tsx
- route.ts
- WorkOverlay.tsx
- Next Config
- MediaListItem.tsx
- @dnd-kit/core
- lucide-react
- mongodb
- PostCSS Config
- Starter UI Icons
- Starter Boilerplate Logos
- page.tsx
- resend
- three
- db.ts
- Globe Icon
- server-modules.test.ts
- vitest.config.ts
- AppShell

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 108 edges
2. `noStoreJson()` - 69 edges
3. `requireAdminOr401()` - 51 edges
4. `isRecord()` - 46 edges
5. `getPageSeo()` - 40 edges
6. `HM Visuals — Claude Working Document` - 34 edges
7. `asNullableString()` - 29 edges
8. `getPageSections()` - 25 edges
9. `getAllPageSettings()` - 23 edges
10. `cn()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts
- `GET()` --indirect_call--> `serializePrivateGalleryAdminItem()`  [INFERRED]
  app/api/private-galleries/route.ts → lib/server/private-gallery-admin.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/about/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (95 total, 25 thin omitted)

### Community 0 - "Admin Media & People Lists"
Cohesion: 0.18
Nodes (11): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category (+3 more)

### Community 1 - "Home Sections & Media Cards"
Cohesion: 0.26
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 2 - "Cloudinary Sign/Upload API"
Cohesion: 0.11
Nodes (41): POST(), CLOUDINARY_MANAGED_FOLDERS, CloudinaryCleanupResult, CloudinaryResourceType, deleteFolderViaAdminApi(), deleteManagedCloudinaryAsset(), deleteManagedCloudinaryFolderTree(), deleteManagedCloudinaryResourcesByPrefix() (+33 more)

### Community 3 - "Media Detail Sections"
Cohesion: 0.08
Nodes (37): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+29 more)

### Community 4 - "Admin Auth & Login"
Cohesion: 0.15
Nodes (30): AboutPage(), generateMetadata(), BlogPage(), generateMetadata(), generateMetadata(), SP, DancingPage(), generateMetadata() (+22 more)

### Community 5 - "Private Galleries Admin"
Cohesion: 0.10
Nodes (26): PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus() (+18 more)

### Community 6 - "Services Admin"
Cohesion: 0.11
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 7 - "Interior Public Pages"
Cohesion: 0.17
Nodes (24): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+16 more)

### Community 8 - "shadcn/ui Primitives"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 9 - "public-people.ts"
Cohesion: 0.08
Nodes (24): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Phase S — Security & hardening, Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done`, Session F1 — Remove violations + initialize Lenis — `done` (+16 more)

### Community 10 - "TS Config Globs"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 11 - "Inquiries Admin"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 12 - "Root Layout & Nav Shell"
Cohesion: 0.22
Nodes (7): metadata, CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 13 - "Public Form Security API"
Cohesion: 0.22
Nodes (11): PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType(), normalizeStringArray() (+3 more)

### Community 14 - "Contact Form"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 15 - "NFT Admin & API"
Cohesion: 0.17
Nodes (36): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET(), asFiniteNumber() (+28 more)

### Community 16 - "Home Sections Admin Forms"
Cohesion: 0.15
Nodes (14): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), SLUG_LABELS, AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField() (+6 more)

### Community 17 - "Public Review Form"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 18 - "route.ts"
Cohesion: 0.17
Nodes (23): POST(), isValidObjectIdString(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), POST(), GET(), isAllowedCloudinaryTestimonialUrl() (+15 more)

### Community 19 - "Contact/Services Pages"
Cohesion: 0.06
Nodes (35): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain — not sessions yet, do not invent scope, HM Visuals — Session Queue, How to use, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+27 more)

### Community 20 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, next, next-cloudinary (+15 more)

### Community 21 - "package.json"
Cohesion: 0.20
Nodes (6): AppearanceBlock(), MediaSurface(), Appearance, MediaItem, formatDates(), formatPlace()

### Community 22 - "Dev Dependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 23 - "GroupCard.tsx"
Cohesion: 0.16
Nodes (12): MediaFilterBar(), MediaTagChips(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), MODES, ModeSwitcher() (+4 more)

### Community 24 - "Media Search/Cursor API"
Cohesion: 0.43
Nodes (6): GeoPoint, getMapEmbedUrl(), TestimonialMap(), getReviewPoint(), normalizeLocationKey(), TestimonialsSection()

### Community 25 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 26 - "cloudinary"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 27 - "shadcn components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 28 - "Pages Admin (SEO+Sections)"
Cohesion: 0.15
Nodes (18): isRecord(), ensureUniqueSlug(), POST(), slugify(), isValidReorderItem(), POST(), ReorderItem, getClientKey() (+10 more)

### Community 29 - "Location/Geocoding"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 30 - "Page Sections Data"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 31 - "Testimonials & AnimatedText"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 32 - "@dnd-kit/sortable"
Cohesion: 0.15
Nodes (15): generateMetadata(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, firstImage(), HomeHero() (+7 more)

### Community 33 - "Page Sections Shared"
Cohesion: 0.32
Nodes (7): DISCIPLINES, GET(), HomePage(), renderStars(), TestimonialsPage(), getAllPageSettings(), getPublicTestimonials()

### Community 34 - "Home Hero & Bokeh"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 35 - "package.json"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 36 - "@dnd-kit/utilities"
Cohesion: 0.24
Nodes (13): ContactPage(), generateMetadata(), ServicesPage(), ServiceDetailPage(), ServiceCard(), asBool(), asNumberOrNull(), asString() (+5 more)

### Community 37 - "CMS Collections & Sessions"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 38 - "geist"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 42 - "Navigation & Work Overlay"
Cohesion: 0.05
Nodes (37): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+29 more)

### Community 43 - "Featured Work Cards"
Cohesion: 0.13
Nodes (17): AdminPagesPage(), PagesAdminClient(), CTA_LABELS, HomeFeaturedWork(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug (+9 more)

### Community 44 - "Card Image Fields"
Cohesion: 0.22
Nodes (6): AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem, PortfolioFallbackPanelLink

### Community 45 - "cloudinary"
Cohesion: 0.15
Nodes (29): asNullableString(), asNumberOrNull(), Appearance, getMediaLists(), NftCurrency, NftEditionType, NftStatus, normalizeCurrency() (+21 more)

### Community 46 - "graphify Skill Internals"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 48 - "@dnd-kit/sortable"
Cohesion: 0.42
Nodes (5): HomeTestimonialCard(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser()

### Community 51 - "geist"
Cohesion: 0.29
Nodes (17): asBooleanOrNull(), asStringArray(), PATCH(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken(), makeGallerySlug() (+9 more)

### Community 52 - "Auth Proxy Middleware"
Cohesion: 0.09
Nodes (32): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, AdminProtectedLayout() (+24 more)

### Community 53 - "Mongo Index Setup"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 54 - "gsap"
Cohesion: 0.11
Nodes (30): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+22 more)

### Community 56 - "GeoNames Import"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 59 - "radix-ui"
Cohesion: 0.22
Nodes (13): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+5 more)

### Community 67 - "PageRowCard.tsx"
Cohesion: 0.14
Nodes (17): PageRowCard(), SectionsData, SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PAGE_ROWS, PageRow, SettingsDraft (+9 more)

### Community 68 - "page-sections-shared.ts"
Cohesion: 0.25
Nodes (11): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), CtaCopy, EMPTY_SECTION_IMAGE, isSectionImage() (+3 more)

### Community 69 - "TestimonialForm.tsx"
Cohesion: 0.36
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 70 - "cloudinary-image-loader.ts"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 71 - "AppShell.tsx"
Cohesion: 0.24
Nodes (6): Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS, Preloader()

### Community 73 - "ImageField.tsx"
Cohesion: 0.22
Nodes (9): CardImageGroup(), GroupCard(), GroupTint, ICON_TINTS, TINTS, VisibilityGroup(), getString(), ImageField() (+1 more)

### Community 74 - "ReviewPhotoStrip.tsx"
Cohesion: 0.20
Nodes (14): Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage(), getIdentityLine() (+6 more)

### Community 75 - "route.ts"
Cohesion: 0.29
Nodes (6): getString(), isRecord(), PeopleAdminClient(), WidgetResult, PersonItem, usePeopleAdmin()

### Community 77 - "WorkOverlay.tsx"
Cohesion: 0.40
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 78 - "Next Config"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 79 - "MediaListItem.tsx"
Cohesion: 0.47
Nodes (5): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses()

### Community 86 - "page.tsx"
Cohesion: 0.47
Nodes (5): AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl(), getErrorMessage(), LoadMode

### Community 89 - "db.ts"
Cohesion: 0.33
Nodes (3): AdminNftsPage(), client, getDbName()

### Community 94 - "AppShell"
Cohesion: 0.67
Nodes (3): AppShell(), lenis, lenis

## Knowledge Gaps
- **349 isolated node(s):** `Who this is for`, `The site`, `Domain`, `Stack`, `Image pipeline — Next's optimizer is bypassed (2026-07-31)` (+344 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `NFT Admin & API` to `Home Sections & Media Cards`, `Admin Auth & Login`, `Services Admin`, `Interior Public Pages`, `Public Form Security API`, `route.ts`, `cloudinary`, `Pages Admin (SEO+Sections)`, `Page Sections Shared`, `@dnd-kit/utilities`, `Featured Work Cards`, `cloudinary`, `geist`, `Auth Proxy Middleware`, `gsap`, `radix-ui`, `page-sections-shared.ts`, `ReviewPhotoStrip.tsx`, `db.ts`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `react-dom`, `tailwind-merge`, `@dnd-kit/core`, `lucide-react`, `@dnd-kit/utilities`, `mongodb`, `Dev Dependencies`, `@gsap/react`, `react`, `next`, `resend`, `three`, `AppShell`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `AppShell` to `Root Layout & Nav Shell`, `AppShell.tsx`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain` to the rest of the system?**
  _349 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Cloudinary Sign/Upload API` be split into smaller, more focused modules?**
  _Cohesion score 0.11304347826086956 - nodes in this community are weakly interconnected._
- **Should `Media Detail Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.07946127946127945 - nodes in this community are weakly interconnected._
- **Should `Admin Auth & Login` be split into smaller, more focused modules?**
  _Cohesion score 0.14693446088794926 - nodes in this community are weakly interconnected._