# Graph Report - hussain.marzooq  (2026-08-06)

## Corpus Check
- 287 files · ~108,111 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1388 nodes · 3080 edges · 74 communities (58 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50bef0ac`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PhotographyViewer.tsx
- PageRowCard.tsx
- AdminServiceCategoriesClient.tsx
- cloudinary-assets.ts
- types.ts
- requireAdminObjectId()
- dependencies
- admin.ts
- devDependencies
- AdminServicesClient.tsx
- PrivateGalleriesAdminClient.tsx
- testimonials.ts
- getDb()
- cn()
- compilerOptions
- getPageSeo()
- page.tsx
- layout.tsx
- What You Must Do When Invoked
- ContactForm.tsx
- page.tsx
- PublicReviewForm.tsx
- route.ts
- media.ts
- private-galleries.ts
- asNullableString()
- components.json
- page-settings.ts
- private-galleries.ts
- location-search.ts
- route.ts
- page.tsx
- page.tsx
- Reusable components — always use
- route.ts
- Page content CMS (3 collections)
- Image pipeline (custom Cloudinary loader)
- Session D4 — Page transition system
- Impeccable (deterministic design detector)
- graphify reference: extra exports and benchmark
- page-sections.ts
- page.tsx
- ensure-indexes.mjs
- graphify reference: query, path, explain
- HomeHero.tsx
- Code quality rules
- 6-item navigation + Work overlay
- import-geonames-cities.mjs
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- cloudinary-image-loader.ts
- next.config.ts
- README.md
- route.ts
- Animation stack (Lenis/GSAP/Three.js)
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- generate-admin-password-hash.mjs
- CLAUDE.md
- extraction-spec.md
- eslint.config.mjs
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- server-modules.test.ts
- vitest.config.ts
- Globe Icon
- Geist font (next/font)
- Next.js (create-next-app)

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 78 edges
2. `noStoreJson()` - 44 edges
3. `getPageSeo()` - 40 edges
4. `HM Visuals — Claude Working Document` - 35 edges
5. `isRecord()` - 32 edges
6. `requireAdminObjectId()` - 27 edges
7. `findByIdOr404()` - 26 edges
8. `requireAdminOr401()` - 26 edges
9. `getPageSections()` - 25 edges
10. `asNullableString()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `PrivateGalleryPage()` --calls--> `getPrivateGalleryPublicBySlug()`  [EXTRACTED]
  app/g/[slug]/page.tsx → lib/server/private-galleries.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/about/page.tsx → lib/server/page-seo.ts
- `AdminProtectedLayout()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/auth/admin.ts
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts
- `AdminPagesPage()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/pages/page.tsx → lib/auth/admin.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (74 total, 16 thin omitted)

### Community 0 - "PhotographyViewer.tsx"
Cohesion: 0.32
Nodes (15): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+7 more)

### Community 1 - "PageRowCard.tsx"
Cohesion: 0.18
Nodes (14): CardImageGroup(), CardImageWarning(), SLUG_LABELS, getString(), ImageField(), isRecord(), MediaPickerModal(), RepeatingListEditor() (+6 more)

### Community 2 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.06
Nodes (43): MediaListFilterBar(), formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse (+35 more)

### Community 3 - "cloudinary-assets.ts"
Cohesion: 0.07
Nodes (58): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+50 more)

### Community 4 - "types.ts"
Cohesion: 0.09
Nodes (34): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+26 more)

### Community 5 - "requireAdminObjectId()"
Cohesion: 0.10
Nodes (37): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), findByIdOr404(), IdRouteContext (+29 more)

### Community 6 - "dependencies"
Cohesion: 0.04
Nodes (45): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+37 more)

### Community 7 - "admin.ts"
Cohesion: 0.09
Nodes (32): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, AdminProtectedLayout() (+24 more)

### Community 8 - "devDependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 9 - "AdminServicesClient.tsx"
Cohesion: 0.09
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 10 - "PrivateGalleriesAdminClient.tsx"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 11 - "testimonials.ts"
Cohesion: 0.13
Nodes (24): HomePage(), HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal() (+16 more)

### Community 12 - "getDb()"
Cohesion: 0.14
Nodes (23): GET(), asFiniteNumber(), isRecord(), isValidObjectIdString(), normalizeSlug(), parseObjectId(), ensureUniqueSlug(), GET() (+15 more)

### Community 13 - "cn()"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 14 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "getPageSeo()"
Cohesion: 0.05
Nodes (76): AboutPage(), generateMetadata(), DISCIPLINES, GET(), BlogPage(), generateMetadata(), ContactPage(), generateMetadata() (+68 more)

### Community 16 - "page.tsx"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 17 - "layout.tsx"
Cohesion: 0.08
Nodes (21): metadata, AppShell(), CustomCursor(), Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS (+13 more)

### Community 18 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 19 - "ContactForm.tsx"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 20 - "page.tsx"
Cohesion: 0.06
Nodes (32): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain — not sessions yet, do not invent scope, HM Visuals — Session Queue, How to use, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+24 more)

### Community 21 - "PublicReviewForm.tsx"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 22 - "route.ts"
Cohesion: 0.17
Nodes (25): POST(), noStoreJson(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), POST(), GET(), isAllowedCloudinaryTestimonialUrl() (+17 more)

### Community 23 - "media.ts"
Cohesion: 0.13
Nodes (30): asBooleanOrNull(), asNullableString(), asNumberOrNull(), asString(), Appearance, getMediaLists(), NftCurrency, NftEditionType (+22 more)

### Community 24 - "private-galleries.ts"
Cohesion: 0.24
Nodes (13): asStringArray(), GET(), POST(), isFutureDate(), makeGalleryAccessToken(), makeGallerySlug(), normalizeLocalDateTimeString(), parseClientLocalDateTimeToUtc() (+5 more)

### Community 25 - "asNullableString()"
Cohesion: 0.36
Nodes (9): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+1 more)

### Community 26 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 27 - "page-settings.ts"
Cohesion: 0.43
Nodes (5): PATCH(), VALID_SLUGS, isSectionImage(), resolveOptionalCardImage(), readCardImage()

### Community 28 - "private-galleries.ts"
Cohesion: 0.18
Nodes (23): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate(), hashGalleryPassword() (+15 more)

### Community 29 - "location-search.ts"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 30 - "route.ts"
Cohesion: 0.07
Nodes (29): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Phase S — Security & hardening, Phase S — Security & hardening, Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done` (+21 more)

### Community 31 - "page.tsx"
Cohesion: 0.15
Nodes (18): PageRowCard(), SectionsData, RowPill(), SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS (+10 more)

### Community 32 - "page.tsx"
Cohesion: 0.18
Nodes (7): Props, MediaFilterBar(), MediaTagChips(), StatusFilter, SearchInput(), SearchInputProps, PublicPersonIndexItem

### Community 33 - "Reusable components — always use"
Cohesion: 0.05
Nodes (39): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+31 more)

### Community 34 - "route.ts"
Cohesion: 0.15
Nodes (19): AdminNftsPage(), buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+11 more)

### Community 35 - "Page content CMS (3 collections)"
Cohesion: 0.19
Nodes (12): MediaGrid(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), useModalNavbarLock(), MODES, ModeSwitcher() (+4 more)

### Community 36 - "Image pipeline (custom Cloudinary loader)"
Cohesion: 0.19
Nodes (11): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField(), TextField() (+3 more)

### Community 37 - "Session D4 — Page transition system"
Cohesion: 0.26
Nodes (6): AppearanceBlock(), MediaSurface(), Appearance, formatDates(), formatPlace(), toEmbedUrl()

### Community 38 - "Impeccable (deterministic design detector)"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 39 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 40 - "page-sections.ts"
Cohesion: 0.19
Nodes (12): AdminPagesPage(), AboutSections, ALL_PAGE_SECTIONS_SLUGS, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, getAllPageSections() (+4 more)

### Community 42 - "ensure-indexes.mjs"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 43 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 44 - "HomeHero.tsx"
Cohesion: 0.33
Nodes (5): GroupCard(), GroupTint, ICON_TINTS, TINTS, VisibilityGroup()

### Community 45 - "Code quality rules"
Cohesion: 0.29
Nodes (3): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps

### Community 46 - "6-item navigation + Work overlay"
Cohesion: 0.50
Nodes (3): CTA_LABELS, PortfolioCard(), PortfolioCardProps

### Community 47 - "import-geonames-cities.mjs"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 48 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 49 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 50 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 51 - "cloudinary-image-loader.ts"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 52 - "next.config.ts"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 53 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 55 - "Animation stack (Lenis/GSAP/Three.js)"
Cohesion: 0.70
Nodes (3): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), PrivateGalleryBrowser()

## Knowledge Gaps
- **355 isolated node(s):** `Who this is for`, `The site`, `Domain`, `Stack`, `Image pipeline — Next's optimizer is bypassed (2026-07-31)` (+350 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `route.ts` to `PhotographyViewer.tsx`, `admin.ts`, `page-sections.ts`, `AdminServicesClient.tsx`, `testimonials.ts`, `getDb()`, `getPageSeo()`, `route.ts`, `media.ts`, `private-galleries.ts`, `asNullableString()`, `page-settings.ts`, `private-galleries.ts`, `location-search.ts`, `page.tsx`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `layout.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain` to the rest of the system?**
  _355 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AdminServiceCategoriesClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0579476861167002 - nodes in this community are weakly interconnected._
- **Should `cloudinary-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07111501316944688 - nodes in this community are weakly interconnected._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09142857142857143 - nodes in this community are weakly interconnected._
- **Should `requireAdminObjectId()` be split into smaller, more focused modules?**
  _Cohesion score 0.10460992907801418 - nodes in this community are weakly interconnected._