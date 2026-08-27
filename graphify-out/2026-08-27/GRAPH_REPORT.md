# Graph Report - .  (2026-08-27)

## Corpus Check
- 14 files · ~184,963 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1803 nodes · 3941 edges · 185 communities (94 shown, 91 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
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
- Community 96
- Community 97
- Community 98
- Community 100
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
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 173
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 116 edges
2. `noStoreJson()` - 78 edges
3. `isRecord()` - 52 edges
4. `getPageSeo()` - 40 edges
5. `requireAdminObjectId()` - 33 edges
6. `requireAdminOr401()` - 31 edges
7. `findByIdOr404()` - 30 edges
8. `asNullableString()` - 29 edges
9. `getPageSections()` - 25 edges
10. `PATCH()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Navbar()` --references--> `AppShell (global elements host)`  [INFERRED]
  components/site/Navbar.tsx → CLAUDE.md
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `The button system (ghost/solid, no arrow)` --implements--> `Button()`  [EXTRACTED]
  CLAUDE.md → components/shared/Button.tsx
- `Reusable components — always use, never reinvent` --references--> `Button()`  [EXTRACTED]
  CLAUDE.md → components/shared/Button.tsx
- `Button()` --references--> `.hm-btn button geometry`  [EXTRACTED]
  components/shared/Button.tsx → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **D8 magnetic hover mechanism** — hooks_usemagnetichover_use_magnetic_hover, components_shared_button_ref_forwarding, session_archive_data_magnetic_attribute, components_site_stickycta_sticky_cta, components_site_navbar_navbar [EXTRACTED 0.85]
- **D8 scope-against-spec decision** — session_archive_magnetic_scope_decision, claude_find_animation_opportunities_skill, claude_the_hero_is_fixed, session_archive_session_d8 [EXTRACTED 0.85]
- **Block 4 motion sessions D4-D8** — session_archive_session_d4, session_archive_session_d5, session_archive_session_d7, session_archive_session_d8, session_queue_run_order [EXTRACTED 0.75]
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (185 total, 91 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (57): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem() (+49 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (63): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, POST(), getClientAddress(), HeaderGetter (+55 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (50): animate skill (Gate-1 motion spec), The button system (ghost/solid, no arrow), find-animation-opportunities skill, .hm-btn button geometry, Homepage section order, No scroll-jacking rule, Reduced-motion + pointer:fine gate, Reusable components — always use, never reinvent (+42 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (47): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+39 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (29): MediaListFilterBar(), Props, PrivateGalleriesAdminClient(), MediaPickerModal(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (40): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+32 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (34): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET(), findByIdOr404() (+26 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (26): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), BlogPage(), generateMetadata(), ContactPage(), generateMetadata(), SP (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (22): HomeTestimonialCard(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage() (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (20): CategoryRow(), AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection() (+12 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (23): getMediaLists(), resolvePeopleSelection(), MEDIA_BASE_PATHS, revalidateMediaSurfaces(), POST(), DELETE(), PATCH(), isAllowedCloudinaryUrl() (+15 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (23): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate(), isPrivateGalleryExpired() (+15 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (22): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyTagPage(), RESERVED_TAG_SLUGS, TAG_DISCIPLINES, TagDiscipline, getPageSettings() (+14 more)

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (16): TagMultiSelect(), TagOption, AdminTagsClient(), EMPTY_DRAFT, TagFormCard(), TagsTable(), TagsToolbar(), createTagRequest() (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (22): asNullableString(), NftMeta, buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor() (+14 more)

### Community 22 - "Community 22"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 24 - "Community 24"
Cohesion: 0.19
Nodes (14): Banner, TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars() (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (15): PageRowCard(), SectionsData, RowPill(), SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS (+7 more)

### Community 26 - "Community 26"
Cohesion: 0.17
Nodes (17): asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), asString(), MediaLocation, NftCurrency, NftEditionType, NftStatus (+9 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (16): DISCIPLINES, GET(), ServiceDetailPage(), generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps (+8 more)

### Community 28 - "Community 28"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 29 - "Community 29"
Cohesion: 0.15
Nodes (15): PrivateGalleryPage(), generateMetadata(), PhotographyPage(), generateMetadata(), VideographyPage(), MediaSurface(), toEmbedUrl(), PortfolioFallbackPanel() (+7 more)

### Community 30 - "Community 30"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 31 - "Community 31"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 32 - "Community 32"
Cohesion: 0.21
Nodes (11): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (16): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 34 - "Community 34"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (14): asNumberOrNull(), isRecord(), isValidObjectIdString(), parseObjectId(), ensureUniqueSlug(), POST(), slugify(), POST() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.20
Nodes (8): MediaGrid(), MediaItem, TagLink, localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyViewer()

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (10): CardImageGroup(), CardImageWarning(), SLUG_LABELS, getString(), ImageField(), isRecord(), CTA_LABELS, FEATURED_CARD_SLUGS (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 40 - "Community 40"
Cohesion: 0.21
Nodes (12): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType() (+4 more)

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (13): ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard(), asBool(), asNumberOrNull(), asString() (+5 more)

### Community 42 - "Community 42"
Cohesion: 0.21
Nodes (12): ExhibitionCityIndex(), ExhibitionCityModal(), buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW (+4 more)

### Community 43 - "Community 43"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 44 - "Community 44"
Cohesion: 0.17
Nodes (12): AdminPagesPage(), DISCIPLINE_LINKS, AboutSections, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, getAllPageSections() (+4 more)

### Community 45 - "Community 45"
Cohesion: 0.29
Nodes (13): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+5 more)

### Community 46 - "Community 46"
Cohesion: 0.25
Nodes (9): AdminNftsPage(), PATCH(), revalidateTagSurfaces(), POST(), client, getDbName(), isReservedTagSlug(), isValidTagSlug() (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.19
Nodes (9): getString(), isRecord(), PeopleAdminClient(), WidgetResult, TestimonialsAdminClient(), AdminActionFeedbackState, useAdminAction(), PersonItem (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.27
Nodes (10): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), EMPTY_SECTION_IMAGE, isSectionImage(), resolveOptionalCardImage() (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.18
Nodes (10): CardsCtaForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS, HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS (+2 more)

### Community 50 - "Community 50"
Cohesion: 0.21
Nodes (10): metadata, RootLayout(), AppShell(), collectImagePool(), hrefToPath(), PageTransition, prefersReducedMotion(), TransitionCtx (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (8): HomePage(), AppShell (global elements host), Navbar(), StickyCta(), magneticOffset(), Options, useMagneticHover(), getExhibitionCities()

### Community 52 - "Community 52"
Cohesion: 0.22
Nodes (9): MediaFilterBar(), MediaTagChips(), TagChip, TagChipRow(), MODES, ModeSwitcher(), ViewerMode, PhotographyCylinder (+1 more)

### Community 53 - "Community 53"
Cohesion: 0.26
Nodes (10): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl() (+2 more)

### Community 54 - "Community 54"
Cohesion: 0.26
Nodes (8): CtaOnlyForm(), TextAreaField(), TextField(), RepeatingCardListEditor(), RepeatingListEditor(), CtaCopy, TextCard, CtaOnlySections

### Community 55 - "Community 55"
Cohesion: 0.27
Nodes (8): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), isAdminAuthedServer(), ALL_SEO_SLUGS

### Community 56 - "Community 56"
Cohesion: 0.27
Nodes (5): AppearanceBlock(), formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 57 - "Community 57"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 58 - "Community 58"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.36
Nodes (9): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+1 more)

### Community 60 - "Community 60"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 61 - "Community 61"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 62 - "Community 62"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 64 - "Community 64"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 65 - "Community 65"
Cohesion: 0.43
Nodes (5): HomeExhibitionGlobe(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser()

### Community 66 - "Community 66"
Cohesion: 0.36
Nodes (4): buildContactSheetCells(), ContactSheetCell, ContactSheetState, TransitionPhase

### Community 67 - "Community 67"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 68 - "Community 68"
Cohesion: 0.43
Nodes (5): HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero(), SectionImage

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (6): Deployment, Getting started, HM Visuals, Stack, Verification, Working document

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 75 - "Community 75"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 76 - "Community 76"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 79 - "Community 79"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 80 - "Community 80"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 81 - "Community 81"
Cohesion: 0.80
Nodes (3): CustomCursor(), stepSpring(), stretchFor()

### Community 82 - "Community 82"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 84 - "Community 84"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

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

## Knowledge Gaps
- **580 isolated node(s):** `DISCIPLINE_HREFS`, `InquiryStatus`, `nav`, `SelectedPerson`, `currencies` (+575 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **91 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 7` to `Community 1`, `Community 8`, `Community 9`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 27`, `Community 33`, `Community 36`, `Community 39`, `Community 40`, `Community 41`, `Community 44`, `Community 46`, `Community 48`, `Community 55`, `Community 59`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `AdminActionFeedback()` connect `Community 24` to `Community 0`, `Community 32`, `Community 4`, `Community 13`, `Community 47`, `Community 19`, `Community 53`, `Community 25`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `getPageSeo()` connect `Community 8` to `Community 7`, `Community 40`, `Community 41`, `Community 18`, `Community 27`, `Community 29`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `DISCIPLINE_HREFS`, `InquiryStatus`, `nav` to the rest of the system?**
  _580 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05742296918767507 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.060814687320711415 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06892230576441102 - nodes in this community are weakly interconnected._