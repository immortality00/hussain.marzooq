# Graph Report - .  (2026-08-18)

## Corpus Check
- 44 files · ~172,487 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1672 nodes · 3567 edges · 129 communities (96 shown, 33 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.65)
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
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
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

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 91 edges
2. `noStoreJson()` - 72 edges
3. `isRecord()` - 48 edges
4. `getPageSeo()` - 39 edges
5. `asNullableString()` - 29 edges
6. `requireAdminOr401()` - 27 edges
7. `requireAdminObjectId()` - 26 edges
8. `getPageSections()` - 24 edges
9. `findByIdOr404()` - 23 edges
10. `cn()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AdminProtectedLayout()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/auth/admin.ts
- `GET()` --indirect_call--> `serializePrivateGalleryAdminItem()`  [INFERRED]
  app/api/private-galleries/route.ts → lib/server/private-gallery-admin.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/services/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/testimonials/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Page Content CMS three-collection system** — claude_page_cms, claude_page_settings, claude_page_seo, claude_page_sections, claude_admin_pages [EXTRACTED 0.90]
- **C4 locations feed D6 globe** — session_queue_session_c4, claude_media_locations, claude_appearance_type, claude_exhibition_globe, session_queue_session_d6 [EXTRACTED 0.90]
- **What is NOT in the design ban list** — claude_not_in_design, claude_no_scroll_jacking, claude_no_eyebrows, claude_no_stat_strips, claude_no_gradients [EXTRACTED 0.90]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (129 total, 33 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (47): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+39 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (37): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (46): POST(), CLOUDINARY_MANAGED_FOLDERS, getCloudinaryMediaFolderForCategory(), CloudinaryCleanupResult, CloudinaryResourceType, deleteFolderViaAdminApi(), deleteManagedCloudinaryAsset(), deleteManagedCloudinaryFolderTree() (+38 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (38): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, GET() (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (38): asStringArray(), buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PATCH(), POST(), PrivateGalleryPage() (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (32): AdminPagesPage(), generateMetadata(), HomePage(), DISCIPLINE_LINKS, HomeCreativeSystem(), CTA_LABELS, HomeFeaturedWork(), DISCIPLINE_ORDER (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (30): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), findByIdOr404(), IdRouteContext (+22 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (26): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), generateMetadata(), generateMetadata(), SP, DancingPage(), generateMetadata() (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (26): AdminNftsPage(), PATCH(), SLUG_TO_PATH, PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, GET() (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (23): AppearanceBlock(), formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES, buildInquiryContext(), buildInquiryHref(), currencySymbol (+15 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (27): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+19 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (23): asBooleanOrNull(), asNumberOrNull(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType, NftStatus, normalizeCurrency() (+15 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (15): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (14): ContactActions(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode, useContactFormState() (+6 more)

### Community 22 - "Community 22"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (18): DISCIPLINES, GET(), BlogPage(), ContactPage(), generateMetadata(), ServicesPage(), ServiceDetailPage(), ServiceCard() (+10 more)

### Community 24 - "Community 24"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (11): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, next (+15 more)

### Community 27 - "Community 27"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 28 - "Community 28"
Cohesion: 0.19
Nodes (15): Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage(), getIdentityLine() (+7 more)

### Community 29 - "Community 29"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (15): POST(), asNullableString(), getClientAddress(), isValidEmail(), isValidFormStartedAt(), POST(), isAllowedCloudinaryTestimonialUrl(), NormalizedResolvedLocation (+7 more)

### Community 32 - "Community 32"
Cohesion: 0.20
Nodes (14): createAdminSessionCookies(), hmacHex(), verifyPair(), createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual() (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 35 - "Community 35"
Cohesion: 0.19
Nodes (13): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), MediaGrid(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug() (+5 more)

### Community 36 - "Community 36"
Cohesion: 0.30
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 37 - "Community 37"
Cohesion: 0.20
Nodes (7): MediaSurface(), MediaItem, localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyViewer()

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (10): MediaFilterBar(), MediaTagChips(), StatusFilter, MODES, ModeSwitcher(), ViewerMode, PhotographyCylinder, PhotographyHorizontal (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 40 - "Community 40"
Cohesion: 0.20
Nodes (12): MediaListFilterBar(), Props, formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage() (+4 more)

### Community 41 - "Community 41"
Cohesion: 0.18
Nodes (9): Banner, CreateServiceResponse, findCategoryById(), findOthersCategory(), isCreateServiceResponse(), AdminActionFeedback(), AdminActionFeedbackState, AdminActionFeedbackType (+1 more)

### Community 42 - "Community 42"
Cohesion: 0.20
Nodes (13): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.19
Nodes (9): generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.17
Nodes (15): Achromatic OKLCH Palette, Button.tsx (shared), Button System (two-look), Design Direction (the spec), Homepage Section Order, Radius Scale (five values), Section System (hairline + one rhythm), Skill conflicts (project wins) (+7 more)

### Community 45 - "Community 45"
Cohesion: 0.24
Nodes (8): getString(), isRecord(), PeopleAdminClient(), WidgetResult, TestimonialsAdminClient(), useAdminAction(), PersonItem, usePeopleAdmin()

### Community 46 - "Community 46"
Cohesion: 0.30
Nodes (9): asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), GET(), AdminTestimonialItem, normalizePhotoUrls(), PublicTestimonial, toAdminTestimonialItem() (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.49
Nodes (9): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (7): metadata, CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (11): Animation Stack (Lenis/GSAP/Three.js/Framer), No decorative gradients rule, Preloader, Session D1 — Preloader (build), Session DS1 — Impeccable detector eval, Session F1 — remove violations + Lenis, Session D10 — Dancing page, Session D13 — final consistency pass (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.24
Nodes (10): /admin/pages (single Pages accordion), MediaPickerModal / ImageField, Page Activity Toggle (isActive), Page Content CMS (three collections), page_sections collection, page_settings collection, Session N2 — page activity toggle, Session N5 — section-level CMS + consolidation (+2 more)

### Community 52 - "Community 52"
Cohesion: 0.24
Nodes (10): admin-route.ts helpers, AnimatedText.tsx, PageHeader.tsx, PortfolioCard.tsx, Reusable Components registry, Tag taxonomy facts (media.tags free-text), useAdminAction hook, Session F2 — extract reusable components (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.31
Nodes (10): Admin Auth (scrypt hash + signed session token), Content-Security-Policy, Domain & Deployment Status (Netlify), Cloudinary Image Pipeline (custom loader), Standing Security Rules, Session S1 — finish security migration, Minimum to go live set, Run Order (launch-first priority) (+2 more)

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (10): The Hero is Fixed, No eyebrows/kickers rule, No scroll-jacking rule, No stat strips rule, What is NOT in the design (ban list), page_seo collection, Photography Viewer (3-view), Session D3 — photography 3-mode viewer (build) (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 56 - "Community 56"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 57 - "Community 57"
Cohesion: 0.24
Nodes (6): Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS, Preloader()

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 59 - "Community 59"
Cohesion: 0.39
Nodes (7): isRecord(), parseObjectId(), isValidReorderItem(), POST(), ReorderItem, getClientKey(), POST()

### Community 60 - "Community 60"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 61 - "Community 61"
Cohesion: 0.33
Nodes (8): buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW, isDubai(), markerSize()

### Community 62 - "Community 62"
Cohesion: 0.42
Nodes (5): HomeTestimonialCard(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser()

### Community 63 - "Community 63"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 64 - "Community 64"
Cohesion: 0.50
Nodes (6): generateMetadata(), VideographyPage(), buildPublicMediaQuery(), getShowreelItem(), getVideographyItems(), listPublicMedia()

### Community 65 - "Community 65"
Cohesion: 0.39
Nodes (5): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe(), ExhibitionCity

### Community 66 - "Community 66"
Cohesion: 0.43
Nodes (6): GeoPoint, getMapEmbedUrl(), TestimonialMap(), getReviewPoint(), normalizeLocationKey(), TestimonialsSection()

### Community 67 - "Community 67"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 73 - "Community 73"
Cohesion: 0.47
Nodes (4): AdminProtectedLayout(), nav, AdminThemeToggle(), useIsMounted()

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (6): Known Defects registry, Session N9 — stop public chrome on admin, Session P1 — performance audit, Session S11 — admin unsaved-work guard, Session S8 — two resource leaks, Session S9 — revalidation coverage

### Community 75 - "Community 75"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 79 - "Community 79"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 80 - "Community 80"
Cohesion: 0.70
Nodes (5): Shared Appearance type, Exhibition Globe (react-globe.gl), Media Locations (validated + coordinates), Session C4 — validated media locations, Session D6 — exhibition globe

### Community 81 - "Community 81"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 82 - "Community 82"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 84 - "Community 84"
Cohesion: 0.50
Nodes (4): 6-item Navigation + Work overlay, Session N1 — minimal nav + Work overlay, Session N8 — People + Testimonials in nav, Session D12 — People page + privacy

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 88 - "Community 88"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 89 - "Community 89"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 90 - "Community 90"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 94 - "Community 94"
Cohesion: 0.67
Nodes (3): AppShell(), lenis, lenis

## Knowledge Gaps
- **516 isolated node(s):** `InquiryStatus`, `nav`, `currencies`, `Props`, `NftData` (+511 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 9` to `Community 3`, `Community 4`, `Community 35`, `Community 7`, `Community 8`, `Community 42`, `Community 46`, `Community 16`, `Community 17`, `Community 19`, `Community 23`, `Community 59`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 26` to `Community 5`, `Community 102`, `Community 104`, `Community 105`, `Community 107`, `Community 108`, `Community 109`, `Community 110`, `Community 111`, `Community 112`, `Community 113`, `Community 114`, `Community 94`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `Community 94` to `Community 48`, `Community 57`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `InquiryStatus`, `nav`, `currencies` to the rest of the system?**
  _516 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06095481670929241 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08525506638714186 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09361393323657474 - nodes in this community are weakly interconnected._