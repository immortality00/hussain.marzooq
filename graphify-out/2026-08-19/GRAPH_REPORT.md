# Graph Report - .  (2026-08-19)

## Corpus Check
- 9 files · ~179,145 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1736 nodes · 3574 edges · 134 communities (109 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.62)
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
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 104
- Community 105
- Community 106
- Community 113
- Community 114
- Community 116
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
1. `getDb()` - 92 edges
2. `noStoreJson()` - 66 edges
3. `isRecord()` - 44 edges
4. `getPageSeo()` - 30 edges
5. `requireAdminOr401()` - 27 edges
6. `requireAdminObjectId()` - 26 edges
7. `asNullableString()` - 25 edges
8. `cn()` - 25 edges
9. `findByIdOr404()` - 23 edges
10. `getAllPageSettings()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/photography/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/videography/page.tsx → lib/server/page-seo.ts
- `AdminProtectedLayout()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/auth/admin.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Achromatic Design Language** — claude_no_gradients, claude_no_eyebrows, claude_no_stat_strips, claude_achromatic_palette, claude_radius_scale [EXTRACTED 0.85]
- **Tag Taxonomy to Subpage Flow** — claude_tag_taxonomy, claude_discipline_subpages, claude_tag_chip_row, claude_use_media_search, claude_revalidation_strategy [EXTRACTED 0.85]
- **Exhibition Globe Data Pipeline** — claude_home_exhibition_globe, claude_media_locations, claude_appearance_type, session_archive_c4, session_archive_d6 [EXTRACTED 0.85]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (134 total, 25 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (63): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, AdminProtectedLayout(), nav, getClientAddress() (+55 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (54): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload() (+46 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (50): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+42 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (36): AdminNftsPage(), ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), findByIdOr404() (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (47): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+39 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (28): MediaListFilterBar(), Props, PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps (+20 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (26): HomeTestimonialCard(), HomeTrust(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser(), Avatar(), getInitials() (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (24): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+16 more)

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (20): formatDates(), formatMonthYear(), MONTH_NAMES, buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel() (+12 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.16
Nodes (14): CardImageWarning(), SLUG_LABELS, getString(), ImageField(), isRecord(), RepeatingListEditor(), SortableRow(), SortableList() (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (19): asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), asString(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (14): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), CategoryRow(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory() (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (14): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServicesToolbar() (+6 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (20): asNullableString(), buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+12 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (19): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyTagPage(), TagDiscipline, getMediaByTag(), disciplineMatch(), DisciplineTag (+11 more)

### Community 24 - "Community 24"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 25 - "Community 25"
Cohesion: 0.19
Nodes (15): GET(), POST(), isRecord(), isValidObjectIdString(), parseObjectId(), ensureUniqueSlug(), POST(), slugify() (+7 more)

### Community 26 - "Community 26"
Cohesion: 0.28
Nodes (16): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.19
Nodes (16): ContactPage(), SP, ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard(), HomeSections (+8 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (16): generateMetadata(), generateMetadata(), NftPage(), generateMetadata(), HomePage(), generateMetadata(), generateMetadata(), renderStars() (+8 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (15): generateMetadata(), PhotographyPage(), generateMetadata(), VideographyPage(), ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe() (+7 more)

### Community 30 - "Community 30"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 31 - "Community 31"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 32 - "Community 32"
Cohesion: 0.19
Nodes (6): AdminTagsClient(), EMPTY_DRAFT, TagFormCard(), NewTag, Tag, TagPatch

### Community 33 - "Community 33"
Cohesion: 0.23
Nodes (14): TagMultiSelect(), TagOption, DELETE(), PATCH(), revalidateTagSurfaces(), GET(), POST(), serializeTag() (+6 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.16
Nodes (3): MediaItem, TagLink, HEIGHTS

### Community 36 - "Community 36"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 37 - "Community 37"
Cohesion: 0.18
Nodes (13): PageRowCard(), SectionsData, SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow (+5 more)

### Community 38 - "Community 38"
Cohesion: 0.14
Nodes (12): DISCIPLINES, GET(), metadata, ServiceDetailPage(), AppShell(), CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY (+4 more)

### Community 39 - "Community 39"
Cohesion: 0.30
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 41 - "Community 41"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 42 - "Community 42"
Cohesion: 0.19
Nodes (11): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField(), TextField() (+3 more)

### Community 43 - "Community 43"
Cohesion: 0.20
Nodes (10): HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, HomeHero(), AnimatedText(), AnimatedTextProps (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.23
Nodes (10): MediaFilterBar(), TagChip, TagChipRow(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyCylinder (+2 more)

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (9): Banner, CreateServiceResponse, findCategoryById(), findOthersCategory(), isCreateServiceResponse(), AdminActionFeedback(), AdminActionFeedbackState, AdminActionFeedbackType (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (11): PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType(), normalizeStringArray() (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.26
Nodes (10): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.24
Nodes (9): AdminPagesPage(), PATCH(), SLUG_TO_PATH, getAllPageSections(), mergeWithDefaults(), ALL_SEO_SLUGS, DEFAULTS, getAllPageSeo() (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.24
Nodes (8): getString(), isRecord(), PeopleAdminClient(), WidgetResult, TestimonialsAdminClient(), useAdminAction(), PersonItem, usePeopleAdmin()

### Community 50 - "Community 50"
Cohesion: 0.21
Nodes (6): generateMetadata(), PageHeader(), PageHeaderProps, PortfolioFallbackPanel(), PortfolioFallbackPanelItem, PortfolioFallbackPanelLink

### Community 51 - "Community 51"
Cohesion: 0.20
Nodes (10): CTA_LABELS, HomeFeaturedWork(), FeaturedCard, FeaturedCardSlug, AboutSections, BlogSections, BOOKING_CTA, DancingSections (+2 more)

### Community 52 - "Community 52"
Cohesion: 0.49
Nodes (9): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+1 more)

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (11): admin-route helpers, Session Token Auth, cloudinary-image-loader, Content-Security-Policy, Custom Cloudinary Image Pipeline, 3-Gate Queue Protocol, Vitest Testing & CI, useAdminAction hook (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.36
Nodes (9): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+1 more)

### Community 56 - "Community 56"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 57 - "Community 57"
Cohesion: 0.27
Nodes (8): BaseProps, Button(), buttonClasses(), ButtonProps, ButtonVariant, VARIANT, PortfolioCard(), PortfolioCardProps

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 59 - "Community 59"
Cohesion: 0.36
Nodes (5): MEDIA_BASE_PATHS, revalidateMediaSurfaces(), POST(), DELETE(), PATCH()

### Community 60 - "Community 60"
Cohesion: 0.28
Nodes (7): getClientKey(), POST(), CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP, CLOUDINARY_MEDIA_CATEGORY_FOLDERS, CloudinaryMediaCategory, getCloudinaryMediaFoldersForCategories(), isCloudinaryMediaCategory()

### Community 61 - "Community 61"
Cohesion: 0.22
Nodes (9): Achromatic OKLCH Palette, No Eyebrows/Kickers Rule, No Decorative Gradients Rule, PageHeader, Five-Value Radius Scale, SiteFooter, SmartMediaPreview, Session DS1 (Impeccable detector eval) (+1 more)

### Community 62 - "Community 62"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (8): buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW, isDubai(), markerSize()

### Community 64 - "Community 64"
Cohesion: 0.28
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 65 - "Community 65"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 66 - "Community 66"
Cohesion: 0.39
Nodes (6): PATCH(), SLUG_TO_PATH, collectSectionImagePublicIds(), ALL_PAGE_SECTIONS_SLUGS, PageSectionsSlug, deleteReplacedSectionImages()

### Community 67 - "Community 67"
Cohesion: 0.33
Nodes (4): GroupCard(), GroupTint, ICON_TINTS, TINTS

### Community 68 - "Community 68"
Cohesion: 0.29
Nodes (7): AnimatedText, AppShell, CustomCursor, Preloader, Session D1 (preloader), Session D5 (cursor enhancements), Session N9 (public chrome on admin)

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (7): Discipline Tag Subpages, MediaTagChips, Media Surface Revalidation, TagChipRow, Session S9 (revalidation coverage), Session T2 (discipline subpages), Session P1 (performance audit)

### Community 70 - "Community 70"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 71 - "Community 71"
Cohesion: 0.29
Nodes (3): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 75 - "Community 75"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 76 - "Community 76"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 77 - "Community 77"
Cohesion: 0.33
Nodes (6): Button Two-Look System, Section System (hairline + one rhythm), Session D2b (homepage sections + Button), Session D10 (dancing page), Session D4 (page transitions), Session D7 (NFT redesign)

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (6): Empty Means Empty Rule, HeroBokeh, The Hero Is Fixed, HomeHero, MediaPickerModal, Session N7 (admin card images)

### Community 79 - "Community 79"
Cohesion: 0.33
Nodes (6): 6-Item Navigation, Page Activity Toggle (isActive), Page Content CMS (/admin/pages), WorkOverlay, Session C1 (blog), Session D12 (people page)

### Community 80 - "Community 80"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 81 - "Community 81"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

### Community 82 - "Community 82"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 83 - "Community 83"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 84 - "Community 84"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (5): Appearance shared type, HomeExhibitionGlobe, Validated Media Locations (coordinates), Session C4 (media locations), Session D6 (exhibition globe)

### Community 86 - "Community 86"
Cohesion: 0.40
Nodes (5): shared/Button.tsx, PortfolioCard, ServiceCard, StickyCta, Session D8 (magnetic buttons)

### Community 87 - "Community 87"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 89 - "Community 89"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 91 - "Community 91"
Cohesion: 0.50
Nodes (4): lib/server/media-tags.ts, admin SortableList, Tag Taxonomy (media_tags), Session T1 (tag taxonomy + SortableList)

### Community 92 - "Community 92"
Cohesion: 0.50
Nodes (4): No Scroll-Jacking Rule, Photography 3-View Viewer, useMediaSearch, Session D3 (photography viewer)

### Community 93 - "Community 93"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 94 - "Community 94"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 95 - "Community 95"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 97 - "Community 97"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 98 - "Community 98"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 99 - "Community 99"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **532 isolated node(s):** `InquiryStatus`, `nav`, `SelectedPerson`, `currencies`, `NftMeta` (+527 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 3` to `Community 0`, `Community 66`, `Community 38`, `Community 7`, `Community 40`, `Community 43`, `Community 12`, `Community 13`, `Community 46`, `Community 48`, `Community 51`, `Community 21`, `Community 22`, `Community 55`, `Community 25`, `Community 26`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `AdminActionFeedback()` connect `Community 45` to `Community 1`, `Community 37`, `Community 5`, `Community 39`, `Community 11`, `Community 47`, `Community 49`, `Community 20`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 8` to `Community 57`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `InquiryStatus`, `nav`, `SelectedPerson` to the rest of the system?**
  _532 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.055651176133103844 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06234177215189873 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08469449485783424 - nodes in this community are weakly interconnected._