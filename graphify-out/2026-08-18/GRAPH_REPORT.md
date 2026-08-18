# Graph Report - .  (2026-08-18)

## Corpus Check
- 7 files · ~172,787 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1723 nodes · 3587 edges · 134 communities (91 shown, 43 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 158,322 output

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
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
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
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 91 edges
2. `noStoreJson()` - 72 edges
3. `isRecord()` - 48 edges
4. `getPageSeo()` - 39 edges
5. `HM Visuals — Claude Working Document` - 38 edges
6. `asNullableString()` - 29 edges
7. `requireAdminOr401()` - 27 edges
8. `requireAdminObjectId()` - 26 edges
9. `getPageSections()` - 24 edges
10. `findByIdOr404()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/testimonials/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Approved homepage + globe launch-blocking set** — session_archive_session_d2b, session_archive_session_c4, session_archive_session_d6, session_archive_exhibition_globe [EXTRACTED 0.90]
- **S10 security fixes (rate-limiter + email injection)** — session_archive_session_s10, session_archive_admin_login_rate_limiter, session_archive_escape_html_helper, session_archive_get_client_address [EXTRACTED 0.90]
- **Page content CMS — three collections, one admin** — session_archive_page_settings, session_archive_page_seo, session_archive_page_sections, session_archive_admin_pages_route [EXTRACTED 0.85]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (134 total, 43 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (52): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (43): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+35 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (57): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+49 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (40): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload() (+32 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (42): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET() (+34 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (45): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+37 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (36): asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), asNullableString(), asNumberOrNull(), asString(), isRecord(), parseObjectId() (+28 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (29): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+21 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (29): POST(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), buildAccessRateLimitKey(), getClientIp(), POST() (+21 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (25): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), createAdminSessionCookies(), hmacHex() (+17 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (27): generateMetadata(), HomePage(), DISCIPLINE_LINKS, HomeCreativeSystem(), CTA_LABELS, HomeFeaturedWork(), DISCIPLINE_ORDER, HomeHero() (+19 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 16 - "Community 16"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 17 - "Community 17"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (21): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage() (+13 more)

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (21): Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage(), getIdentityLine() (+13 more)

### Community 20 - "Community 20"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (20): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), getPrivateGalleryCookieSecret(), hashGalleryPassword(), isFutureDate() (+12 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 25 - "Community 25"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 26 - "Community 26"
Cohesion: 0.09
Nodes (23): class-variance-authority, cloudinary, clsx, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, next (+15 more)

### Community 27 - "Community 27"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 28 - "Community 28"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 29 - "Community 29"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.20
Nodes (15): ContactPage(), generateMetadata(), SP, generateMetadata(), ServicesPage(), ServiceCard(), PageHeader(), asBool() (+7 more)

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 33 - "Community 33"
Cohesion: 0.20
Nodes (11): DISCIPLINES, GET(), BlogPage(), generateMetadata(), PersonDetailPage(), ServiceDetailPage(), SmartImage(), isSectionImage() (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.16
Nodes (11): PrivateGalleryPage(), generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PageHeaderProps (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.19
Nodes (8): MediaGrid(), MediaSurface(), MediaItem, localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyViewer()

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (14): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (10): MediaFilterBar(), MediaTagChips(), StatusFilter, MODES, ModeSwitcher(), ViewerMode, PhotographyCylinder, PhotographyHorizontal (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 40 - "Community 40"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 41 - "Community 41"
Cohesion: 0.24
Nodes (14): GET(), getPrivateGalleryExpiryDate(), isPrivateGalleryExpired(), isPrivateGalleryUnavailable(), privateGalleryCookieName(), timingSafeStringEqual(), verifyPrivateGalleryCookieValue(), getPrivateGalleryAdminList() (+6 more)

### Community 42 - "Community 42"
Cohesion: 0.24
Nodes (9): generateMetadata(), PeoplePage(), buildPersonMediaQuery(), getPublicPeople(), isVideoType(), normalizeStringArray(), PublicPersonDetail, PublicPersonIndexItem (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.27
Nodes (6): AppearanceBlock(), formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES, NftModal()

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (7): metadata, CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 45 - "Community 45"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 47 - "Community 47"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 48 - "Community 48"
Cohesion: 0.24
Nodes (6): Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS, Preloader()

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (10): /admin/pages consolidated admin, Page activity toggle (isActive), page_sections collection, page_settings collection, Session N2 — Page activity toggle system, Session N5 — Section-level content CMS, Session N6 — Homepage section redesign, Session S5 — page-settings PATCH partial-update bug (+2 more)

### Community 50 - "Community 50"
Cohesion: 0.31
Nodes (10): Impeccable detector (URL-only), PageHeader shared component, page_seo collection, PortfolioCard shared component, Session DS1 — Evaluate the detector, Session DS2 — Fold Impeccable findings in, Session F2 — Extract reusable components, Session N3 — SEO + page metadata admin control (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 52 - "Community 52"
Cohesion: 0.31
Nodes (7): AdminPagesPage(), getAllPageSections(), mergeWithDefaults(), DEFAULTS, getAllPageSeo(), PageSeo, SeoDefaults

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 54 - "Community 54"
Cohesion: 0.42
Nodes (5): HomeTestimonialCard(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser()

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (9): Design + motion skill stack, Preloader component, Session D1 — Preloader, Session DS0 — Install design + motion skill stack, Content-as-animation page transitions, Session D10 — Dancing page, Session D4 — Page transition system, Session D5 — Cursor enhancements (+1 more)

### Community 56 - "Community 56"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 59 - "Community 59"
Cohesion: 0.29
Nodes (7): admin-route.ts helpers, Session F5 — Admin orchestration & data-layer consolidation, Session S2 — Reuse audit, Session S2a — Services-admin feedback consolidation, Session S2b — API [id]-route boilerplate extraction, useAdminAction hook + AdminActionFeedback, Session S11 — Admin: stop losing work

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 61 - "Community 61"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 64 - "Community 64"
Cohesion: 0.47
Nodes (5): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 66 - "Community 66"
Cohesion: 0.40
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 67 - "Community 67"
Cohesion: 0.40
Nodes (6): AboutDisciplineCard component, Button two-look system, Section system (hairline + rhythm), Session D2b — Homepage section pass, Session D2c — About page rebuild, Session D8 — Magnetic button effect

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (6): ServiceCard shared component, Session N1 — Minimal nav + Work overlay, Session N7 — Admin-selectable card images, Session N8 — Add People + Testimonials to navbar, Session S4 — Work overlay card images empty state, Work overlay (nav discipline cards)

### Community 69 - "Community 69"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 70 - "Community 70"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 71 - "Community 71"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 72 - "Community 72"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 73 - "Community 73"
Cohesion: 0.60
Nodes (5): Admin login rate-limiter, Public-form email notification HTML, escapeHtml helper, getClientAddress shared helper, Session S10 — Two security fixes

### Community 74 - "Community 74"
Cohesion: 0.60
Nodes (5): Appearance shared type (locationId/lat/lon), Exhibition globe (react-globe.gl), Session C4 — Media locations: validated city + coordinates, Session D6 — Exhibition globe, Validated location selector (LocationSearch)

### Community 75 - "Community 75"
Cohesion: 0.60
Nodes (5): Content-Security-Policy, Session S1 — Finish the security migration, Session S6 — Remove unoptimized from testimonial images, Signed session token auth, Session L1 — Launch prep checklist

### Community 76 - "Community 76"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 77 - "Community 77"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 78 - "Community 78"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 79 - "Community 79"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 82 - "Community 82"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 84 - "Community 84"
Cohesion: 0.83
Nodes (4): media_tags taxonomy collection, service_categories admin-managed taxonomy, Session T1 — Tag taxonomy media_tags + /admin/tags, Session T2 — /photography/[tag] and /videography/[tag]

### Community 88 - "Community 88"
Cohesion: 0.67
Nodes (3): AppShell(), lenis, lenis

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (3): Session S3 — Automated test baseline, Session S7 — Resolve eslint exhaustive-deps warnings, Vitest test baseline + CI

## Knowledge Gaps
- **568 isolated node(s):** `Who this is for`, `The site`, `Domain & deployment status`, `Stack`, `Image pipeline — Next's optimizer is bypassed (2026-07-31)` (+563 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 4` to `Community 0`, `Community 33`, `Community 5`, `Community 37`, `Community 7`, `Community 39`, `Community 9`, `Community 10`, `Community 11`, `Community 41`, `Community 42`, `Community 18`, `Community 19`, `Community 21`, `Community 30`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `Community 88` to `Community 48`, `Community 44`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `lenis` connect `Community 88` to `Community 26`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain & deployment status` to the rest of the system?**
  _568 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.054945054945054944 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05955734406438632 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07226107226107226 - nodes in this community are weakly interconnected._