# Graph Report - hussain.marzooq  (2026-07-31)

## Corpus Check
- 278 files · ~100,881 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1351 nodes · 3194 edges · 78 communities (64 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `461428cb`
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
- Admin Protected Layout
- @dnd-kit/utilities
- CMS Collections & Sessions
- geist
- Homepage WebGL Scene
- graphify Exports
- Design Standard & Transitions
- Navigation & Work Overlay
- Featured Work Cards
- Card Image Fields
- gsap
- graphify Skill Internals
- Design Tokens & Reusables
- next
- graphify Query Engine
- next-themes
- radix-ui
- Auth Proxy Middleware
- Mongo Index Setup
- framer-motion
- geist
- GeoNames Import
- lenis
- Next.js Framework
- mongodb
- Admin Password Hash
- Route Handler
- next
- next-cloudinary
- react
- react-globe.gl
- tailwind-merge
- cloudinary-image-loader.ts
- ESLint Config
- Next Config
- PostCSS Config
- Starter UI Icons
- Starter Boilerplate Logos
- Globe Icon

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 108 edges
2. `noStoreJson()` - 69 edges
3. `requireAdminOr401()` - 51 edges
4. `isRecord()` - 46 edges
5. `getPageSeo()` - 37 edges
6. `HM Visuals — Claude Working Document` - 32 edges
7. `asNullableString()` - 29 edges
8. `getPageSections()` - 23 edges
9. `getAllPageSettings()` - 23 edges
10. `cn()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/blog/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
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

## Communities (78 total, 14 thin omitted)

### Community 0 - "Admin Media & People Lists"
Cohesion: 0.06
Nodes (43): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+35 more)

### Community 1 - "Home Sections & Media Cards"
Cohesion: 0.08
Nodes (33): HomeTestimonialCard(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), AppearanceBlock(), MediaSurface(), SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps (+25 more)

### Community 2 - "Cloudinary Sign/Upload API"
Cohesion: 0.12
Nodes (37): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+29 more)

### Community 3 - "Media Detail Sections"
Cohesion: 0.07
Nodes (41): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+33 more)

### Community 4 - "Admin Auth & Login"
Cohesion: 0.15
Nodes (20): Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage(), getIdentityLine() (+12 more)

### Community 5 - "Private Galleries Admin"
Cohesion: 0.09
Nodes (27): PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus() (+19 more)

### Community 6 - "Services Admin"
Cohesion: 0.11
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 7 - "Interior Public Pages"
Cohesion: 0.17
Nodes (17): ContactPage(), generateMetadata(), SP, generateMetadata(), ServicesPage(), ServiceDetailPage(), ServiceCard(), PageHeader() (+9 more)

### Community 8 - "shadcn/ui Primitives"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 9 - "public-people.ts"
Cohesion: 0.10
Nodes (19): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done`, Session F1 — Remove violations + initialize Lenis — `done`, Session F2 — Code refactoring: extract reusable components — `done` (+11 more)

### Community 10 - "TS Config Globs"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 11 - "Inquiries Admin"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 12 - "Root Layout & Nav Shell"
Cohesion: 0.19
Nodes (8): metadata, AppShell(), CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 13 - "Public Form Security API"
Cohesion: 0.29
Nodes (18): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+10 more)

### Community 14 - "Contact Form"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 15 - "NFT Admin & API"
Cohesion: 0.14
Nodes (28): AdminNftsPage(), GET(), isValidObjectIdString(), parseObjectId(), GET(), DELETE(), ensureUniqueSlug(), GET() (+20 more)

### Community 16 - "Home Sections Admin Forms"
Cohesion: 0.14
Nodes (15): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), SLUG_LABELS, AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField() (+7 more)

### Community 17 - "Public Review Form"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 18 - "route.ts"
Cohesion: 0.07
Nodes (57): POST(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), buildAccessRateLimitKey(), getClientIp(), POST(), GET() (+49 more)

### Community 19 - "Contact/Services Pages"
Cohesion: 0.06
Nodes (35): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain — not sessions yet, do not invent scope, HM Visuals — Session Queue, How to use, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+27 more)

### Community 20 - "Runtime Dependencies"
Cohesion: 0.04
Nodes (47): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+39 more)

### Community 21 - "package.json"
Cohesion: 0.20
Nodes (7): MediaFilterBar(), MediaGrid(), MediaTagChips(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch()

### Community 22 - "Dev Dependencies"
Cohesion: 0.05
Nodes (38): eslint, eslint-config-next, allowScripts, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint, eslint-config-next (+30 more)

### Community 23 - "GroupCard.tsx"
Cohesion: 0.33
Nodes (5): GroupCard(), GroupTint, ICON_TINTS, TINTS, VisibilityGroup()

### Community 24 - "Media Search/Cursor API"
Cohesion: 0.20
Nodes (16): asNullableString(), buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+8 more)

### Community 25 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 26 - "cloudinary"
Cohesion: 0.19
Nodes (25): getMediaLists(), resolvePeopleSelection(), sanitizeAppearances(), POST(), DELETE(), PATCH(), CloudinaryResourceType, deleteManagedCloudinaryAsset() (+17 more)

### Community 27 - "shadcn components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 28 - "Pages Admin (SEO+Sections)"
Cohesion: 0.20
Nodes (13): PageRowCard(), SectionsData, SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow (+5 more)

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
Cohesion: 0.29
Nodes (16): asFiniteNumber(), asNumberOrNull(), asString(), isRecord(), normalizeSlug(), noStoreJson(), DELETE(), PATCH() (+8 more)

### Community 33 - "Page Sections Shared"
Cohesion: 0.27
Nodes (10): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), EMPTY_SECTION_IMAGE, isSectionImage(), ALL_PAGE_SECTIONS_SLUGS (+2 more)

### Community 34 - "Home Hero & Bokeh"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 35 - "Admin Protected Layout"
Cohesion: 0.27
Nodes (8): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), isAdminAuthedServer(), ALL_SEO_SLUGS

### Community 36 - "@dnd-kit/utilities"
Cohesion: 0.23
Nodes (15): AboutPage(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage(), generateMetadata(), generateMetadata() (+7 more)

### Community 37 - "CMS Collections & Sessions"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 38 - "geist"
Cohesion: 0.21
Nodes (16): buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseLimit() (+8 more)

### Community 42 - "Navigation & Work Overlay"
Cohesion: 0.06
Nodes (35): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+27 more)

### Community 43 - "Featured Work Cards"
Cohesion: 0.23
Nodes (10): AdminPagesPage(), AboutSections, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, getAllPageSections(), mergeWithDefaults() (+2 more)

### Community 44 - "Card Image Fields"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 45 - "gsap"
Cohesion: 0.28
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 46 - "graphify Skill Internals"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 48 - "next"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 50 - "next-themes"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

### Community 52 - "Auth Proxy Middleware"
Cohesion: 0.11
Nodes (25): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, createAdminSessionCookies() (+17 more)

### Community 53 - "Mongo Index Setup"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 54 - "framer-motion"
Cohesion: 0.19
Nodes (9): renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem, PortfolioFallbackPanelLink (+1 more)

### Community 55 - "geist"
Cohesion: 0.20
Nodes (12): Appearance, NftCurrency, NftEditionType, NftMeta, NftStatus, normalizeCurrency(), normalizeEditionType(), normalizeStatus() (+4 more)

### Community 56 - "GeoNames Import"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 57 - "lenis"
Cohesion: 0.25
Nodes (11): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType() (+3 more)

### Community 59 - "mongodb"
Cohesion: 0.23
Nodes (10): generateMetadata(), HomePage(), VideographyPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, HomeTrust(), HomeSections (+2 more)

### Community 62 - "Route Handler"
Cohesion: 0.26
Nodes (8): HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, firstImage(), HomeHero(), SmartImage()

### Community 65 - "next"
Cohesion: 0.22
Nodes (5): MODES, ModeSwitcher(), ViewerMode, PhotographyCylinder, PhotographyHorizontal

### Community 66 - "next-cloudinary"
Cohesion: 0.36
Nodes (6): DISCIPLINES, GET(), BlogPage(), generateMetadata(), getAllPageSettings(), readCardImage()

### Community 67 - "react"
Cohesion: 0.29
Nodes (6): CTA_LABELS, HomeFeaturedWork(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug

### Community 68 - "react-globe.gl"
Cohesion: 0.48
Nodes (5): CardImageGroup(), getString(), ImageField(), isRecord(), SectionImage

### Community 69 - "tailwind-merge"
Cohesion: 0.57
Nodes (6): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH()

### Community 70 - "cloudinary-image-loader.ts"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

## Knowledge Gaps
- **336 isolated node(s):** `Who this is for`, `The site`, `Domain`, `Stack`, `Animation stack status` (+331 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `NFT Admin & API` to `Home Sections & Media Cards`, `Admin Auth & Login`, `Services Admin`, `Interior Public Pages`, `Public Form Security API`, `route.ts`, `Media Search/Cursor API`, `cloudinary`, `@dnd-kit/sortable`, `Page Sections Shared`, `Admin Protected Layout`, `@dnd-kit/utilities`, `geist`, `Featured Work Cards`, `Card Image Fields`, `lenis`, `mongodb`, `next-cloudinary`, `tailwind-merge`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `AdminActionFeedback()` connect `Admin Media & People Lists` to `Media Detail Sections`, `Inquiries Admin`, `Pages Admin (SEO+Sections)`, `Private Galleries Admin`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `noStoreJson()` connect `@dnd-kit/sortable` to `Cloudinary Sign/Upload API`, `next-cloudinary`, `tailwind-merge`, `geist`, `Card Image Fields`, `Public Form Security API`, `NFT Admin & API`, `route.ts`, `Media Search/Cursor API`, `cloudinary`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain` to the rest of the system?**
  _336 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Media & People Lists` be split into smaller, more focused modules?**
  _Cohesion score 0.05745814307458143 - nodes in this community are weakly interconnected._
- **Should `Home Sections & Media Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.08215488215488216 - nodes in this community are weakly interconnected._
- **Should `Cloudinary Sign/Upload API` be split into smaller, more focused modules?**
  _Cohesion score 0.11614401858304298 - nodes in this community are weakly interconnected._