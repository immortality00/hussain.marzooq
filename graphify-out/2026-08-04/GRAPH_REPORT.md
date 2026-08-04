# Graph Report - .  (2026-08-04)

## Corpus Check
- 7 files · ~106,391 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1375 nodes · 3247 edges · 74 communities (59 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

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
- Community 35
- page.tsx
- Community 37
- layout.tsx
- Homepage WebGL Scene
- graphify Exports
- Community 41
- Community 42
- Featured Work Cards
- Community 44
- Community 45
- graphify Skill Internals
- Design Tokens & Reusables
- Community 48
- graphify Query Engine
- @dnd-kit/utilities
- geist
- Auth Proxy Middleware
- Mongo Index Setup
- gsap
- @gsap/react
- GeoNames Import
- next
- Community 58
- react
- Removal Requests Admin
- Videography Redirect
- Community 66
- Community 67
- Community 68
- Community 69
- cloudinary-image-loader.ts
- Community 71
- Community 72
- ImageField.tsx

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 104 edges
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
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/blog/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (74 total, 15 thin omitted)

### Community 0 - "Admin Media & People Lists"
Cohesion: 0.06
Nodes (44): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+36 more)

### Community 1 - "Home Sections & Media Cards"
Cohesion: 0.06
Nodes (46): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+38 more)

### Community 2 - "Cloudinary Sign/Upload API"
Cohesion: 0.08
Nodes (57): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+49 more)

### Community 3 - "Media Detail Sections"
Cohesion: 0.09
Nodes (34): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+26 more)

### Community 4 - "Admin Auth & Login"
Cohesion: 0.18
Nodes (37): GET(), asFiniteNumber(), asNumberOrNull(), asString(), isRecord(), isValidObjectIdString(), normalizeSlug(), noStoreJson() (+29 more)

### Community 5 - "Private Galleries Admin"
Cohesion: 0.04
Nodes (45): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+37 more)

### Community 6 - "Services Admin"
Cohesion: 0.09
Nodes (32): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, AdminProtectedLayout() (+24 more)

### Community 7 - "Interior Public Pages"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 8 - "shadcn/ui Primitives"
Cohesion: 0.09
Nodes (28): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+20 more)

### Community 9 - "public-people.ts"
Cohesion: 0.05
Nodes (37): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+29 more)

### Community 10 - "TS Config Globs"
Cohesion: 0.11
Nodes (33): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+25 more)

### Community 11 - "Inquiries Admin"
Cohesion: 0.17
Nodes (25): AboutPage(), generateMetadata(), generateMetadata(), SP, DancingPage(), generateMetadata(), generateMetadata(), NftPage() (+17 more)

### Community 12 - "Root Layout & Nav Shell"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 13 - "Public Form Security API"
Cohesion: 0.06
Nodes (33): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain — not sessions yet, do not invent scope, HM Visuals — Session Queue, How to use, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+25 more)

### Community 14 - "Contact Form"
Cohesion: 0.16
Nodes (25): POST(), asNullableString(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), POST(), GET(), isAllowedCloudinaryTestimonialUrl() (+17 more)

### Community 15 - "NFT Admin & API"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 16 - "Home Sections Admin Forms"
Cohesion: 0.15
Nodes (26): asBooleanOrNull(), Appearance, getMediaLists(), NftCurrency, NftEditionType, NftStatus, normalizeCurrency(), normalizeEditionType() (+18 more)

### Community 17 - "Public Review Form"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 18 - "route.ts"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 19 - "Contact/Services Pages"
Cohesion: 0.08
Nodes (21): metadata, AppShell(), CustomCursor(), Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS (+13 more)

### Community 20 - "Runtime Dependencies"
Cohesion: 0.17
Nodes (24): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+16 more)

### Community 21 - "package.json"
Cohesion: 0.07
Nodes (26): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Phase S — Security & hardening, Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done`, Session F1 — Remove violations + initialize Lenis — `done` (+18 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 23 - "GroupCard.tsx"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 24 - "Media Search/Cursor API"
Cohesion: 0.18
Nodes (16): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+8 more)

### Community 25 - "README.md"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 26 - "cloudinary"
Cohesion: 0.26
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 27 - "shadcn components.json"
Cohesion: 0.13
Nodes (17): AdminPagesPage(), CTA_LABELS, HomeFeaturedWork(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug, AboutSections (+9 more)

### Community 28 - "Pages Admin (SEO+Sections)"
Cohesion: 0.15
Nodes (12): MediaListFilterBar(), Props, MediaFilterBar(), MediaTagChips(), StatusFilter, MODES, ModeSwitcher(), ViewerMode (+4 more)

### Community 29 - "Location/Geocoding"
Cohesion: 0.21
Nodes (15): ContactPage(), generateMetadata(), ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard(), asBool() (+7 more)

### Community 30 - "Page Sections Data"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 31 - "Testimonials & AnimatedText"
Cohesion: 0.34
Nodes (15): asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken(), makeGallerySlug() (+7 more)

### Community 32 - "@dnd-kit/sortable"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 33 - "Page Sections Shared"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 34 - "Home Hero & Bokeh"
Cohesion: 0.22
Nodes (6): MediaSurface(), MediaItem, localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch()

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (8): renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem, PortfolioFallbackPanelLink

### Community 36 - "page.tsx"
Cohesion: 0.22
Nodes (11): generateMetadata(), PeoplePage(), generateMetadata(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType(), normalizeStringArray() (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.21
Nodes (10): generateMetadata(), HomePage(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, HomeHero() (+2 more)

### Community 38 - "layout.tsx"
Cohesion: 0.23
Nodes (9): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), client (+1 more)

### Community 39 - "Homepage WebGL Scene"
Cohesion: 0.26
Nodes (8): DISCIPLINES, GET(), BlogPage(), generateMetadata(), PersonDetailPage(), ServiceDetailPage(), SmartImage(), getAllPageSettings()

### Community 40 - "graphify Exports"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 41 - "Community 41"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 42 - "Community 42"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 43 - "Featured Work Cards"
Cohesion: 0.36
Nodes (6): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), MediaGrid(), useModalNavbarLock(), PhotographyViewer(), PrivateGalleryBrowser()

### Community 44 - "Community 44"
Cohesion: 0.32
Nodes (4): AppearanceBlock(), Appearance, formatDates(), formatPlace()

### Community 45 - "Community 45"
Cohesion: 0.43
Nodes (6): GeoPoint, getMapEmbedUrl(), TestimonialMap(), getReviewPoint(), normalizeLocationKey(), TestimonialsSection()

### Community 46 - "graphify Skill Internals"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 47 - "Design Tokens & Reusables"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 48 - "Community 48"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 49 - "graphify Query Engine"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 50 - "@dnd-kit/utilities"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 51 - "geist"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 52 - "Auth Proxy Middleware"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 53 - "Mongo Index Setup"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 54 - "gsap"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **349 isolated node(s):** `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done``, `Session F4 — Design-rule cleanup + dead code removal — `done``, `Session F5 — Admin orchestration & data-layer consolidation — `done`` (+344 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Admin Auth & Login` to `@dnd-kit/sortable`, `Page Sections Shared`, `page.tsx`, `Community 37`, `layout.tsx`, `Services Admin`, `shadcn/ui Primitives`, `Homepage WebGL Scene`, `TS Config Globs`, `Inquiries Admin`, `Contact Form`, `Home Sections Admin Forms`, `Runtime Dependencies`, `Media Search/Cursor API`, `cloudinary`, `shadcn components.json`, `Location/Geocoding`, `Testimonials & AnimatedText`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `lenis` connect `Contact/Services Pages` to `Private Galleries Admin`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **What connects `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done`` to the rest of the system?**
  _349 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Media & People Lists` be split into smaller, more focused modules?**
  _Cohesion score 0.05627545353572751 - nodes in this community are weakly interconnected._
- **Should `Home Sections & Media Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.06086956521739131 - nodes in this community are weakly interconnected._
- **Should `Cloudinary Sign/Upload API` be split into smaller, more focused modules?**
  _Cohesion score 0.07596153846153846 - nodes in this community are weakly interconnected._
- **Should `Media Detail Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.09142857142857143 - nodes in this community are weakly interconnected._