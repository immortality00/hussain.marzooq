# Graph Report - hussain.marzooq  (2026-07-14)

## Corpus Check
- 267 files · ~98,958 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1301 nodes · 3160 edges · 77 communities (52 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `46f54cce`
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
- Auth Proxy Middleware
- Mongo Index Setup
- GeoNames Import
- Next.js Framework
- Admin Password Hash
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
- Globe Icon

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 108 edges
2. `noStoreJson()` - 69 edges
3. `requireAdminOr401()` - 51 edges
4. `isRecord()` - 46 edges
5. `getPageSeo()` - 40 edges
6. `HM Visuals — Claude Working Document` - 32 edges
7. `asNullableString()` - 29 edges
8. `getPageSections()` - 25 edges
9. `getAllPageSettings()` - 23 edges
10. `cn()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/about/page.tsx → lib/server/page-seo.ts
- `AdminProtectedLayout()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/auth/admin.ts
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts
- `AdminPagesPage()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/pages/page.tsx → lib/auth/admin.ts
- `usePagesAdmin()` --calls--> `useAdminAction()`  [EXTRACTED]
  app/admin/(protected)/pages/usePagesAdmin.ts → hooks/useAdminAction.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (77 total, 25 thin omitted)

### Community 0 - "Admin Media & People Lists"
Cohesion: 0.06
Nodes (43): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+35 more)

### Community 1 - "Home Sections & Media Cards"
Cohesion: 0.07
Nodes (36): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), AppearanceBlock(), MediaFilterBar(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, MediaSurface() (+28 more)

### Community 2 - "Cloudinary Sign/Upload API"
Cohesion: 0.10
Nodes (47): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+39 more)

### Community 3 - "Media Detail Sections"
Cohesion: 0.09
Nodes (34): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+26 more)

### Community 4 - "Admin Auth & Login"
Cohesion: 0.14
Nodes (22): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+14 more)

### Community 5 - "Private Galleries Admin"
Cohesion: 0.08
Nodes (29): MediaListFilterBar(), Props, PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps (+21 more)

### Community 6 - "Services Admin"
Cohesion: 0.10
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 7 - "Interior Public Pages"
Cohesion: 0.05
Nodes (93): AboutPage(), generateMetadata(), AdminPagesPage(), DISCIPLINES, GET(), BlogPage(), generateMetadata(), ContactPage() (+85 more)

### Community 8 - "shadcn/ui Primitives"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 9 - "Media Domain Model"
Cohesion: 0.15
Nodes (29): asBooleanOrNull(), asNumberOrNull(), Appearance, getMediaLists(), NftCurrency, NftEditionType, NftMeta, NftStatus (+21 more)

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
Cohesion: 0.09
Nodes (45): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), hmacHex(), login(), SearchParams (+37 more)

### Community 14 - "Contact Form"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 15 - "NFT Admin & API"
Cohesion: 0.15
Nodes (34): AdminNftsPage(), GET(), POST(), asString(), isValidObjectIdString(), normalizeSlug(), noStoreJson(), parseObjectId() (+26 more)

### Community 16 - "Home Sections Admin Forms"
Cohesion: 0.14
Nodes (15): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), SLUG_LABELS, AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField() (+7 more)

### Community 17 - "Public Review Form"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 18 - "Shared API Helpers"
Cohesion: 0.22
Nodes (15): asNullableString(), isRecord(), POST(), isValidReorderItem(), POST(), ReorderItem, getClientKey(), POST() (+7 more)

### Community 19 - "Contact/Services Pages"
Cohesion: 0.04
Nodes (46): HM Visuals — Session Queue, How to use, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+38 more)

### Community 20 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, @dnd-kit/core, framer-motion, lucide-react, mongodb, next-cloudinary, next-themes (+15 more)

### Community 21 - "NFT Display Lib"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+14 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.09
Nodes (23): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @tsconfig/recommended (+15 more)

### Community 23 - "Testimonial Cleanup API"
Cohesion: 0.19
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), DELETE(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray() (+6 more)

### Community 24 - "Media Search/Cursor API"
Cohesion: 0.31
Nodes (10): buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseLimit() (+2 more)

### Community 25 - "People/Service Public Pages"
Cohesion: 0.30
Nodes (8): asFiniteNumber(), PATCH(), GET(), AdminTestimonialItem, normalizePhotoUrls(), PublicTestimonial, toAdminTestimonialItem(), toPublicTestimonial()

### Community 26 - "Gallery Access API"
Cohesion: 0.30
Nodes (17): asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken(), makeGallerySlug() (+9 more)

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

### Community 32 - "package.json"
Cohesion: 0.12
Nodes (15): allowScripts, sharp@0.34.5, unrs-resolver@1.11.1, name, overrides, postcss, private, scripts (+7 more)

### Community 33 - "Page Sections Shared"
Cohesion: 0.27
Nodes (10): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), EMPTY_SECTION_IMAGE, isSectionImage(), ALL_PAGE_SECTIONS_SLUGS (+2 more)

### Community 34 - "Home Hero & Bokeh"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 35 - "Admin Protected Layout"
Cohesion: 0.24
Nodes (9): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), hmacHex(), isAdminAuthedServer() (+1 more)

### Community 36 - "Media Query API"
Cohesion: 0.36
Nodes (9): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+1 more)

### Community 37 - "CMS Collections & Sessions"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 38 - "Service Inquiry API"
Cohesion: 0.57
Nodes (6): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH()

### Community 42 - "Navigation & Work Overlay"
Cohesion: 0.06
Nodes (35): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog, Claude tooling for this project, Code quality rules, Commit message format (+27 more)

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
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

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
- **322 isolated node(s):** `graphify`, `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)`, `Step 1 - Ensure graphify is installed` (+317 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `NFT Admin & API` to `Page Sections Shared`, `Home Sections & Media Cards`, `Admin Protected Layout`, `Media Query API`, `Admin Auth & Login`, `Service Inquiry API`, `Services Admin`, `Interior Public Pages`, `Media Domain Model`, `Public Form Security API`, `Shared API Helpers`, `NFT Display Lib`, `Testimonial Cleanup API`, `Media Search/Cursor API`, `People/Service Public Pages`, `Gallery Access API`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `package.json`, `Cloudinary Dep`, `dnd-kit Sortable`, `dnd-kit Utilities`, `Geist Dep`, `GSAP Dep`, `@gsap/react Dep`, `Root Layout & Nav Shell`, `Next Dep`, `Radix UI Dep`, `React Dep`, `React DOM Dep`, `tailwind-merge Dep`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **What connects `graphify`, `Usage`, `What graphify is for` to the rest of the system?**
  _322 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Media & People Lists` be split into smaller, more focused modules?**
  _Cohesion score 0.05955734406438632 - nodes in this community are weakly interconnected._
- **Should `Home Sections & Media Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.073224043715847 - nodes in this community are weakly interconnected._
- **Should `Cloudinary Sign/Upload API` be split into smaller, more focused modules?**
  _Cohesion score 0.09506531204644413 - nodes in this community are weakly interconnected._
- **Should `Media Detail Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.09142857142857143 - nodes in this community are weakly interconnected._