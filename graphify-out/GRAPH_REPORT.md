# Graph Report - hussain.marzooq  (2026-08-03)

## Corpus Check
- 285 files · ~105,987 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1376 nodes · 3265 edges · 68 communities (53 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ccbb1b33`
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
- page.tsx
- layout.tsx
- Homepage WebGL Scene
- graphify Exports
- Featured Work Cards
- graphify Skill Internals
- Design Tokens & Reusables
- graphify Query Engine
- @dnd-kit/utilities
- geist
- Auth Proxy Middleware
- Mongo Index Setup
- gsap
- @gsap/react
- GeoNames Import
- next
- radix-ui
- Admin Password Hash
- Videography Redirect
- react-dom
- cloudinary-image-loader.ts
- PostCSS Config
- Starter UI Icons
- Starter Boilerplate Logos
- page.tsx
- resend
- three
- db.ts
- Globe Icon

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
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/testimonials/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/about/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (68 total, 15 thin omitted)

### Community 0 - "Admin Media & People Lists"
Cohesion: 0.08
Nodes (54): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+46 more)

### Community 1 - "Home Sections & Media Cards"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 2 - "Cloudinary Sign/Upload API"
Cohesion: 0.20
Nodes (6): AppearanceBlock(), MediaSurface(), Appearance, MediaItem, formatDates(), formatPlace()

### Community 3 - "Media Detail Sections"
Cohesion: 0.08
Nodes (36): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+28 more)

### Community 4 - "Admin Auth & Login"
Cohesion: 0.06
Nodes (42): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+34 more)

### Community 5 - "Private Galleries Admin"
Cohesion: 0.05
Nodes (52): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+44 more)

### Community 6 - "Services Admin"
Cohesion: 0.06
Nodes (110): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET() (+102 more)

### Community 7 - "Interior Public Pages"
Cohesion: 0.08
Nodes (37): AdminProtectedLayout(), nav, AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult (+29 more)

### Community 8 - "shadcn/ui Primitives"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 9 - "public-people.ts"
Cohesion: 0.05
Nodes (37): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+29 more)

### Community 10 - "TS Config Globs"
Cohesion: 0.20
Nodes (22): AboutPage(), generateMetadata(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage(), generateMetadata() (+14 more)

### Community 11 - "Inquiries Admin"
Cohesion: 0.06
Nodes (69): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, POST() (+61 more)

### Community 12 - "Root Layout & Nav Shell"
Cohesion: 0.06
Nodes (33): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain — not sessions yet, do not invent scope, HM Visuals — Session Queue, How to use, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+25 more)

### Community 13 - "Public Form Security API"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 14 - "Contact Form"
Cohesion: 0.22
Nodes (13): hmacHex(), verifyPair(), createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual(), config (+5 more)

### Community 15 - "NFT Admin & API"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 16 - "Home Sections Admin Forms"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 17 - "Public Review Form"
Cohesion: 0.07
Nodes (27): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Phase S — Security & hardening, Phase S — Security & hardening, Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done` (+19 more)

### Community 18 - "route.ts"
Cohesion: 0.18
Nodes (10): MediaFilterBar(), MediaTagChips(), StatusFilter, MODES, ModeSwitcher(), ViewerMode, PhotographyCylinder, PhotographyHorizontal (+2 more)

### Community 19 - "Contact/Services Pages"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 20 - "Runtime Dependencies"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 21 - "package.json"
Cohesion: 0.11
Nodes (32): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+24 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.23
Nodes (10): HomeTestimonialCard(), HomeTrust(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser(), normalizeStringArray(), PublicTestimonial (+2 more)

### Community 23 - "GroupCard.tsx"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 24 - "Media Search/Cursor API"
Cohesion: 0.26
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 26 - "cloudinary"
Cohesion: 0.26
Nodes (10): Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage(), getIdentityLine() (+2 more)

### Community 27 - "shadcn components.json"
Cohesion: 0.21
Nodes (12): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType() (+4 more)

### Community 28 - "Pages Admin (SEO+Sections)"
Cohesion: 0.17
Nodes (18): ContactPage(), generateMetadata(), SP, generateMetadata(), HomePage(), ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview() (+10 more)

### Community 29 - "Location/Geocoding"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 30 - "Page Sections Data"
Cohesion: 0.31
Nodes (6): MediaGrid(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyViewer()

### Community 31 - "Testimonials & AnimatedText"
Cohesion: 0.43
Nodes (6): GeoPoint, getMapEmbedUrl(), TestimonialMap(), getReviewPoint(), normalizeLocationKey(), TestimonialsSection()

### Community 32 - "@dnd-kit/sortable"
Cohesion: 0.19
Nodes (12): AdminPagesPage(), AboutSections, ALL_PAGE_SECTIONS_SLUGS, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, getAllPageSections() (+4 more)

### Community 33 - "Page Sections Shared"
Cohesion: 0.04
Nodes (45): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+37 more)

### Community 34 - "Home Hero & Bokeh"
Cohesion: 0.29
Nodes (7): DISCIPLINES, GET(), BlogPage(), ServiceDetailPage(), isSectionImage(), getAllPageSettings(), readCardImage()

### Community 36 - "page.tsx"
Cohesion: 0.18
Nodes (10): generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+2 more)

### Community 38 - "layout.tsx"
Cohesion: 0.08
Nodes (21): metadata, AppShell(), CustomCursor(), Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS (+13 more)

### Community 39 - "Homepage WebGL Scene"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 40 - "graphify Exports"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 43 - "Featured Work Cards"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 46 - "graphify Skill Internals"
Cohesion: 0.23
Nodes (8): HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, HomeHero(), SmartImage(), SectionImage

### Community 47 - "Design Tokens & Reusables"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 49 - "graphify Query Engine"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 50 - "@dnd-kit/utilities"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 51 - "geist"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 52 - "Auth Proxy Middleware"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 53 - "Mongo Index Setup"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 54 - "gsap"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 55 - "@gsap/react"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 59 - "radix-ui"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

## Knowledge Gaps
- **349 isolated node(s):** `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done``, `Session F4 — Design-rule cleanup + dead code removal — `done``, `Session F5 — Admin orchestration & data-layer consolidation — `done`` (+344 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Services Admin` to `@dnd-kit/sortable`, `Home Hero & Bokeh`, `page.tsx`, `Interior Public Pages`, `TS Config Globs`, `Inquiries Admin`, `graphify Skill Internals`, `package.json`, `Dev Dependencies`, `Media Search/Cursor API`, `shadcn components.json`, `Pages Admin (SEO+Sections)`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Page Sections Shared` to `shadcn/ui Primitives`, `layout.tsx`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **What connects `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done`` to the rest of the system?**
  _349 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Media & People Lists` be split into smaller, more focused modules?**
  _Cohesion score 0.07826546800634585 - nodes in this community are weakly interconnected._
- **Should `Home Sections & Media Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Media Detail Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.0841799709724238 - nodes in this community are weakly interconnected._
- **Should `Admin Auth & Login` be split into smaller, more focused modules?**
  _Cohesion score 0.05921325051759834 - nodes in this community are weakly interconnected._