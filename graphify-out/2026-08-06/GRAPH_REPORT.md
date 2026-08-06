# Graph Report - .  (2026-08-06)

## Corpus Check
- 12 files · ~108,111 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1362 nodes · 3063 edges · 83 communities (61 shown, 22 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

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
- Exhibition globe
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- Testing & CI (Vitest)
- generate-admin-password-hash.mjs
- CLAUDE.md
- Preloader
- extraction-spec.md
- eslint.config.mjs
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- Session NFT1 — Smart contract architecture planning
- server-modules.test.ts
- vitest.config.ts
- Grain texture rule
- Queue protocol (3-gate cycle)
- Globe Icon
- Geist font (next/font)
- Next.js (create-next-app)
- Session C3 — Plausible Analytics
- Session D11 — Web development page
- Session P2 — Mobile adjustment pass

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 78 edges
2. `noStoreJson()` - 44 edges
3. `getPageSeo()` - 40 edges
4. `isRecord()` - 32 edges
5. `requireAdminObjectId()` - 27 edges
6. `requireAdminOr401()` - 26 edges
7. `findByIdOr404()` - 26 edges
8. `getPageSections()` - 25 edges
9. `asNullableString()` - 23 edges
10. `getAllPageSettings()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --indirect_call--> `serializePrivateGalleryAdminItem()`  [INFERRED]
  app/api/private-galleries/route.ts → lib/server/private-gallery-admin.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/dancing/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/testimonials/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Page content CMS build-out sessions** — session_archive_session_n3, session_archive_session_n4, session_archive_session_n5, session_archive_session_n6, session_archive_session_n7 [EXTRACTED 0.85]
- **Security & hardening sessions** — session_archive_session_s1, session_archive_session_s4, session_archive_session_s5, session_archive_session_s6 [EXTRACTED 0.80]
- **Remaining motion/design D-phase sessions** — session_queue_session_d4, session_queue_session_d5, session_queue_session_d6, session_queue_session_d8 [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (83 total, 22 thin omitted)

### Community 0 - "PhotographyViewer.tsx"
Cohesion: 0.05
Nodes (53): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), AppearanceBlock(), MediaFilterBar(), MediaGrid(), MediaSurface(), MediaTagChips(), SmartMediaPreviewFit (+45 more)

### Community 1 - "PageRowCard.tsx"
Cohesion: 0.05
Nodes (55): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+47 more)

### Community 2 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.06
Nodes (43): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+35 more)

### Community 3 - "cloudinary-assets.ts"
Cohesion: 0.07
Nodes (58): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+50 more)

### Community 4 - "types.ts"
Cohesion: 0.08
Nodes (36): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+28 more)

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
Cohesion: 0.10
Nodes (26): PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus() (+18 more)

### Community 11 - "testimonials.ts"
Cohesion: 0.11
Nodes (28): asFiniteNumber(), HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal() (+20 more)

### Community 12 - "getDb()"
Cohesion: 0.18
Nodes (26): AdminNftsPage(), GET(), asNumberOrNull(), isRecord(), isValidObjectIdString(), normalizeSlug(), noStoreJson(), parseObjectId() (+18 more)

### Community 13 - "cn()"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 14 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "getPageSeo()"
Cohesion: 0.17
Nodes (21): AboutPage(), generateMetadata(), BlogPage(), generateMetadata(), generateMetadata(), SP, DancingPage(), generateMetadata() (+13 more)

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
Cohesion: 0.18
Nodes (14): ContactActions(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode, useContactFormState() (+6 more)

### Community 20 - "page.tsx"
Cohesion: 0.16
Nodes (19): ContactPage(), generateMetadata(), HomePage(), generateMetadata(), ServicesPage(), HomeCreativeSystem(), disciplineSlugForCategory(), HomeServicesPreview() (+11 more)

### Community 21 - "PublicReviewForm.tsx"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 22 - "route.ts"
Cohesion: 0.20
Nodes (16): POST(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), POST(), GET(), isAllowedCloudinaryTestimonialUrl(), NormalizedResolvedLocation (+8 more)

### Community 23 - "media.ts"
Cohesion: 0.17
Nodes (19): asBooleanOrNull(), asString(), Appearance, getMediaLists(), NftCurrency, NftEditionType, NftMeta, NftStatus (+11 more)

### Community 24 - "private-galleries.ts"
Cohesion: 0.20
Nodes (17): asStringArray(), POST(), getPrivateGalleryCookieSecret(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken(), makeGallerySlug(), normalizeLocalDateTimeString() (+9 more)

### Community 25 - "asNullableString()"
Cohesion: 0.19
Nodes (18): asNullableString(), buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+10 more)

### Community 26 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 27 - "page-settings.ts"
Cohesion: 0.21
Nodes (11): DISCIPLINES, GET(), generateMetadata(), ServiceDetailPage(), generateMetadata(), WebDevelopmentPage(), DISCIPLINE_LINKS, SmartImage() (+3 more)

### Community 28 - "private-galleries.ts"
Cohesion: 0.22
Nodes (15): GET(), PrivateGalleryPage(), getPrivateGalleryExpiryDate(), isPrivateGalleryExpired(), isPrivateGalleryUnavailable(), privateGalleryCookieName(), timingSafeStringEqual(), verifyPrivateGalleryCookieValue() (+7 more)

### Community 29 - "location-search.ts"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 30 - "route.ts"
Cohesion: 0.28
Nodes (13): buildAccessRateLimitKey(), getClientIp(), POST(), getClientKey(), POST(), createPrivateGalleryCookieValue(), verifyGalleryPassword(), buildRateLimitId() (+5 more)

### Community 31 - "page.tsx"
Cohesion: 0.18
Nodes (10): generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+2 more)

### Community 32 - "page.tsx"
Cohesion: 0.22
Nodes (11): PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType(), normalizeStringArray() (+3 more)

### Community 33 - "Reusable components — always use"
Cohesion: 0.20
Nodes (12): AnimatedText.tsx, Design tokens (OKLCH, section-shell, radius), MediaPickerModal / ImageField, PageHeader.tsx, PortfolioCard.tsx, Reusable components — always use, ServiceCard.tsx, useAdminAction hook + AdminActionFeedback (+4 more)

### Community 34 - "route.ts"
Cohesion: 0.31
Nodes (10): buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseLimit() (+2 more)

### Community 35 - "Page content CMS (3 collections)"
Cohesion: 0.27
Nodes (10): Page content CMS (3 collections), Session N3 — SEO + page metadata admin, Session N4 — Page header content (extend page_seo), Session N5 — Section-level content CMS, Session N6 — Homepage section redesign, Session S4 — Work overlay card images empty state, Session S5 — page-settings PATCH partial-update fix, Session C1 — Blog admin + public pages (+2 more)

### Community 36 - "Image pipeline (custom Cloudinary loader)"
Cohesion: 0.31
Nodes (9): session-token.ts (signed 2-day TTL token), cloudinary-image-loader.ts, Content-Security-Policy, Image pipeline (custom Cloudinary loader), Security rules, Session S1 — Finish security migration, Session S6 — Remove unoptimized from testimonial images, Session C2 — Open Graph images (+1 more)

### Community 37 - "Session D4 — Page transition system"
Cohesion: 0.25
Nodes (9): Design direction — the standard, No scroll-jacking rule, Page transitions (content-as-animation), Photography 3-view viewer, useMediaSearch / MediaGridResults / MediaTagChips, Session D3 — Photography 3-mode viewer, Session D10 — Dancing page, Session D4 — Page transition system (+1 more)

### Community 38 - "Impeccable (deterministic design detector)"
Cohesion: 0.28
Nodes (9): Design & motion skills routing, Skill conflicts — this project wins, Impeccable (deterministic design detector), Session D13 — Final public consistency pass, Session D5 — Cursor enhancements, Session D8 — Magnetic button effect, Session DS0 — Install design+motion skill stack, Session DS1 — Evaluate the Impeccable detector (+1 more)

### Community 39 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 40 - "page-sections.ts"
Cohesion: 0.22
Nodes (8): AboutSections, ALL_PAGE_SECTIONS_SLUGS, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, mergeWithDefaults(), WebDevSections

### Community 41 - "page.tsx"
Cohesion: 0.50
Nodes (6): generateMetadata(), VideographyPage(), buildPublicMediaQuery(), getShowreelItem(), getVideographyItems(), listPublicMedia()

### Community 42 - "ensure-indexes.mjs"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 43 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 44 - "HomeHero.tsx"
Cohesion: 0.53
Nodes (4): HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero()

### Community 45 - "Code quality rules"
Cohesion: 0.40
Nodes (5): app/api/_lib/admin-route.ts, Code quality rules, Session F3 — Split large admin files, Session S2 — Reuse audit (+ slice S2a), Session S2b — API [id]-route boilerplate extraction

### Community 46 - "6-item navigation + Work overlay"
Cohesion: 0.50
Nodes (5): 6-item navigation + Work overlay, Page activity toggle, Session N1 — Minimal nav + Work overlay, Session N2 — Page activity toggle system, Session N8 — People + Testimonials in navbar

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
Cohesion: 0.67
Nodes (3): Animation stack (Lenis/GSAP/Three.js), Session F1 — Remove violations + init Lenis, Session P1 — Performance audit

### Community 56 - "Exhibition globe"
Cohesion: 0.67
Nodes (3): Exhibition globe, Session C4 — Appearances admin update, Session D6 — Exhibition globe

### Community 59 - "Testing & CI (Vitest)"
Cohesion: 1.00
Nodes (3): Testing & CI (Vitest), Session S3 — Automated test baseline, Session S7 — Resolve eslint exhaustive-deps warnings

## Knowledge Gaps
- **298 isolated node(s):** `WidgetResult`, `CreateServiceResponse`, `InquiryStatus`, `nav`, `SelectedPerson` (+293 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `getDb()` to `PhotographyViewer.tsx`, `PageRowCard.tsx`, `admin.ts`, `AdminServicesClient.tsx`, `testimonials.ts`, `getPageSeo()`, `page.tsx`, `route.ts`, `media.ts`, `private-galleries.ts`, `asNullableString()`, `page-settings.ts`, `private-galleries.ts`, `location-search.ts`, `route.ts`, `page.tsx`, `page.tsx`, `route.ts`, `page-sections.ts`, `page.tsx`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `layout.tsx`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `WidgetResult`, `CreateServiceResponse`, `InquiryStatus` to the rest of the system?**
  _298 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PhotographyViewer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05030643513789581 - nodes in this community are weakly interconnected._
- **Should `PageRowCard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05030864197530864 - nodes in this community are weakly interconnected._
- **Should `AdminServiceCategoriesClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05745814307458143 - nodes in this community are weakly interconnected._
- **Should `cloudinary-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07111501316944688 - nodes in this community are weakly interconnected._