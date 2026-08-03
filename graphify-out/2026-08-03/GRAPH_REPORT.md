# Graph Report - .  (2026-08-03)

## Corpus Check
- 49 files · ~105,446 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1373 nodes · 3085 edges · 91 communities (58 shown, 33 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 108 edges
2. `noStoreJson()` - 69 edges
3. `requireAdminOr401()` - 51 edges
4. `isRecord()` - 46 edges
5. `HM Visuals — Claude Working Document` - 34 edges
6. `getPageSeo()` - 34 edges
7. `asNullableString()` - 29 edges
8. `cn()` - 23 edges
9. `PATCH()` - 21 edges
10. `getPageSections()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts
- `PrivateGalleryPage()` --calls--> `getPrivateGalleryPublicBySlug()`  [EXTRACTED]
  app/g/[slug]/page.tsx → lib/server/private-galleries.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/testimonials/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (91 total, 33 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (73): asString(), Appearance, getMediaLists(), NftCurrency, NftEditionType, NftStatus, normalizeCurrency(), normalizeEditionType() (+65 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (40): Props, PrivateGalleriesAdminClient(), AdminActionFeedback(), getString(), ImageField(), isRecord(), MediaPickerModal(), GalleryFormFields() (+32 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (35): HomeTestimonialCard(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), AppearanceBlock(), MediaSurface(), SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps (+27 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (39): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+31 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (30): getString(), isRecord(), PeopleAdminClient(), WidgetResult, AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), createCategoryRequest() (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (30): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+22 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (37): GET(), asFiniteNumber(), asNumberOrNull(), isRecord(), isValidObjectIdString(), normalizeSlug(), noStoreJson(), parseObjectId() (+29 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (37): Admin design, Analytics, Animation stack status, Appearances admin — update needed, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+29 more)

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (26): AboutPage(), generateMetadata(), BlogPage(), generateMetadata(), generateMetadata(), SP, DancingPage(), generateMetadata() (+18 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (28): POST(), asNullableString(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), POST(), GET(), isAllowedCloudinaryTestimonialUrl() (+20 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (34): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain — not sessions yet, do not invent scope, HM Visuals — Session Queue, How to use, Phase 2 — Preloader & core experience, Phase 3 — Content & analytics, Phase 4 — People & launch prep, Phase 5 — NFT smart contract (future) (+26 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (24): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, createAdminSessionCookies() (+16 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (25): HM Visuals — Session Archive, Phase 0 — Foundation (must complete before any design session), Phase 1 — Navigation & global systems, Phase 2 — Preloader & core experience (completed portion), Phase S — Security & hardening, Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done`, Session F1 — Remove violations + initialize Lenis — `done` (+17 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (13): MediaFilterBar(), MediaGrid(), MediaTagChips(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), MODES (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (14): ContactActions(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode, useContactFormState() (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.16
Nodes (21): NftMeta, buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+13 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (21): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate(), isPrivateGalleryExpired() (+13 more)

### Community 23 - "Community 23"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 24 - "Community 24"
Cohesion: 0.26
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (16): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS (+8 more)

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (18): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.17
Nodes (15): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), PortfolioFallbackPanel(), PortfolioFallbackPanelItem, PortfolioFallbackPanelLink, buildPersonMediaQuery() (+7 more)

### Community 28 - "Community 28"
Cohesion: 0.21
Nodes (15): ContactPage(), generateMetadata(), ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard(), asBool() (+7 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.19
Nodes (15): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), DELETE(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray() (+7 more)

### Community 31 - "Community 31"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (12): AdminPagesPage(), DISCIPLINE_LINKS, AboutSections, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, getAllPageSections() (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (15): class-variance-authority, @dnd-kit/sortable, framer-motion, @gsap/react, dependencies, class-variance-authority, @dnd-kit/sortable, framer-motion (+7 more)

### Community 34 - "Community 34"
Cohesion: 0.20
Nodes (10): DISCIPLINES, GET(), ServiceDetailPage(), SmartImage(), DisciplineCard, EYEBROWS, getCylinderRadius(), Props (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.23
Nodes (9): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), client (+1 more)

### Community 36 - "Community 36"
Cohesion: 0.21
Nodes (7): PrivateGalleryPage(), generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag

### Community 37 - "Community 37"
Cohesion: 0.31
Nodes (9): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (7): metadata, CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 39 - "Community 39"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (4): AppShell(), Navbar(), lenis, lenis

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 44 - "Community 44"
Cohesion: 0.47
Nodes (5): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses()

### Community 45 - "Community 45"
Cohesion: 0.47
Nodes (5): AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl(), getErrorMessage(), LoadMode

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

### Community 49 - "Community 49"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 50 - "Community 50"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 51 - "Community 51"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 52 - "Community 52"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 53 - "Community 53"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 54 - "Community 54"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 55 - "Community 55"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **353 isolated node(s):** `Who this is for`, `The site`, `Domain`, `Stack`, `Image pipeline — Next's optimizer is bypassed (2026-07-31)` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 6` to `Community 0`, `Community 32`, `Community 34`, `Community 35`, `Community 2`, `Community 37`, `Community 7`, `Community 10`, `Community 11`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `lenis` connect `Community 42` to `Community 33`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `Community 42` to `Community 38`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06288568909785483 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05687645687645688 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._