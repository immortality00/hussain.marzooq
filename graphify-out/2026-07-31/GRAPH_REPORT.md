# Graph Report - hussain.marzooq  (2026-07-30)

## Corpus Check
- 275 files · ~98,899 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1323 nodes · 3159 edges · 68 communities (54 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6c67211c`
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
- GeoNames Import
- Next.js Framework
- Admin Password Hash
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
6. `HM Visuals — Claude Working Document` - 31 edges
7. `asNullableString()` - 29 edges
8. `getPageSections()` - 23 edges
9. `getAllPageSettings()` - 23 edges
10. `cn()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `PrivateGalleryPage()` --calls--> `getPrivateGalleryPublicBySlug()`  [EXTRACTED]
  app/g/[slug]/page.tsx → lib/server/private-galleries.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/testimonials/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (68 total, 14 thin omitted)

### Community 0 - "Admin Media & People Lists"
Cohesion: 0.06
Nodes (43): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+35 more)

### Community 1 - "Home Sections & Media Cards"
Cohesion: 0.09
Nodes (39): HomeTestimonialCard(), HomeTrust(), useModalNavbarLock(), buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel() (+31 more)

### Community 2 - "Cloudinary Sign/Upload API"
Cohesion: 0.11
Nodes (39): ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS, CloudinaryCleanupResult (+31 more)

### Community 3 - "Media Detail Sections"
Cohesion: 0.08
Nodes (39): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+31 more)

### Community 4 - "Admin Auth & Login"
Cohesion: 0.67
Nodes (3): getPublicNfts(), isAppearance(), normalizeStringArray()

### Community 5 - "Private Galleries Admin"
Cohesion: 0.09
Nodes (27): MediaListFilterBar(), Props, PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl() (+19 more)

### Community 6 - "Services Admin"
Cohesion: 0.11
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 7 - "Interior Public Pages"
Cohesion: 0.21
Nodes (21): AboutPage(), generateMetadata(), BlogPage(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage() (+13 more)

### Community 8 - "shadcn/ui Primitives"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 9 - "public-people.ts"
Cohesion: 0.12
Nodes (12): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), AppearanceBlock(), MediaSurface(), SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, Appearance (+4 more)

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
Cohesion: 0.09
Nodes (40): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), hmacHex(), login(), SearchParams (+32 more)

### Community 14 - "Contact Form"
Cohesion: 0.18
Nodes (14): ContactActions(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode, useContactFormState() (+6 more)

### Community 15 - "NFT Admin & API"
Cohesion: 0.05
Nodes (122): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET() (+114 more)

### Community 16 - "Home Sections Admin Forms"
Cohesion: 0.18
Nodes (12): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField(), TextField() (+4 more)

### Community 17 - "Public Review Form"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 18 - "route.ts"
Cohesion: 0.15
Nodes (26): getClientAddress(), isValidEmail(), isValidFormStartedAt(), GET(), isAllowedCloudinaryTestimonialUrl(), NormalizedResolvedLocation, normalizeOptionalPhotoUrl(), normalizeRating() (+18 more)

### Community 19 - "Contact/Services Pages"
Cohesion: 0.05
Nodes (42): HM Visuals — Session Queue, How to use, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+34 more)

### Community 20 - "Runtime Dependencies"
Cohesion: 0.04
Nodes (47): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+39 more)

### Community 21 - "package.json"
Cohesion: 0.12
Nodes (12): MediaFilterBar(), MediaGrid(), MediaTagChips(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), MODES (+4 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.05
Nodes (38): eslint, eslint-config-next, allowScripts, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint, eslint-config-next (+30 more)

### Community 23 - "GroupCard.tsx"
Cohesion: 0.19
Nodes (12): CardImageGroup(), GroupCard(), GroupTint, ICON_TINTS, TINTS, PageRowCard(), SectionsData, SeoDraft (+4 more)

### Community 24 - "Media Search/Cursor API"
Cohesion: 0.13
Nodes (26): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+18 more)

### Community 25 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 26 - "cloudinary"
Cohesion: 0.17
Nodes (18): ContactPage(), generateMetadata(), SP, generateMetadata(), ServicesPage(), ContactForm(), disciplineSlugForCategory(), HomeServicesPreview() (+10 more)

### Community 27 - "shadcn components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 28 - "Pages Admin (SEO+Sections)"
Cohesion: 0.20
Nodes (13): AdminPagesPage(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, SettingsDraft, usePagesAdmin(), PageSectionsMap, PageSectionsSlug (+5 more)

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
Cohesion: 0.14
Nodes (14): DISCIPLINES, GET(), PrivateGalleryPage(), ServiceDetailPage(), generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText() (+6 more)

### Community 33 - "Page Sections Shared"
Cohesion: 0.33
Nodes (8): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), isSectionImage(), ALL_PAGE_SECTIONS_SLUGS, deleteReplacedSectionImages()

### Community 34 - "Home Hero & Bokeh"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 35 - "Admin Protected Layout"
Cohesion: 0.24
Nodes (9): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), hmacHex(), isAdminAuthedServer() (+1 more)

### Community 36 - "@dnd-kit/utilities"
Cohesion: 0.25
Nodes (11): generateMetadata(), HomePage(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, firstImage(), HomeHero(), PublicMediaItem (+3 more)

### Community 37 - "CMS Collections & Sessions"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 38 - "geist"
Cohesion: 0.22
Nodes (11): PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType(), normalizeStringArray() (+3 more)

### Community 42 - "Navigation & Work Overlay"
Cohesion: 0.06
Nodes (34): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog, Claude tooling for this project, Code quality rules, Commit message format (+26 more)

### Community 43 - "Featured Work Cards"
Cohesion: 0.15
Nodes (14): CTA_LABELS, HomeFeaturedWork(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug, AboutSections, BlogSections (+6 more)

### Community 44 - "Card Image Fields"
Cohesion: 0.26
Nodes (8): SLUG_LABELS, getString(), ImageField(), isRecord(), MediaPickerModal(), RepeatingListEditor(), EMPTY_SECTION_IMAGE, FEATURED_CARD_SLUGS

### Community 45 - "gsap"
Cohesion: 0.17
Nodes (9): DISCIPLINE_LINKS, HomeCreativeSystem(), SmartImage(), DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay() (+1 more)

### Community 46 - "graphify Skill Internals"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 48 - "next"
Cohesion: 0.67
Nodes (4): cloudinaryTextureUrl(), cylinderItems(), coverTexture(), PhotographyCylinder()

### Community 50 - "next-themes"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

### Community 52 - "Auth Proxy Middleware"
Cohesion: 0.48
Nodes (6): config, isAdminAuthed(), isPublicAdminRoute(), proxy(), signCookieValue(), toHex()

### Community 53 - "Mongo Index Setup"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 56 - "GeoNames Import"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

## Knowledge Gaps
- **324 isolated node(s):** `How to use`, `Status legend`, `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done`` (+319 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `NFT Admin & API` to `@dnd-kit/sortable`, `Page Sections Shared`, `Home Sections & Media Cards`, `Admin Protected Layout`, `@dnd-kit/utilities`, `Admin Auth & Login`, `Services Admin`, `Interior Public Pages`, `geist`, `Featured Work Cards`, `Public Form Security API`, `route.ts`, `Media Search/Cursor API`, `cloudinary`, `Pages Admin (SEO+Sections)`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `AdminActionFeedback()` connect `Admin Media & People Lists` to `Media Detail Sections`, `Private Galleries Admin`, `Inquiries Admin`, `GroupCard.tsx`, `Pages Admin (SEO+Sections)`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `getAllPageSettings()` connect `@dnd-kit/sortable` to `@dnd-kit/utilities`, `geist`, `Interior Public Pages`, `Root Layout & Nav Shell`, `NFT Admin & API`, `cloudinary`, `Pages Admin (SEO+Sections)`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `How to use`, `Status legend`, `Session F1 — Remove violations + initialize Lenis — `done`` to the rest of the system?**
  _324 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Media & People Lists` be split into smaller, more focused modules?**
  _Cohesion score 0.05745814307458143 - nodes in this community are weakly interconnected._
- **Should `Home Sections & Media Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.09292929292929293 - nodes in this community are weakly interconnected._
- **Should `Cloudinary Sign/Upload API` be split into smaller, more focused modules?**
  _Cohesion score 0.11184939091915837 - nodes in this community are weakly interconnected._