# Graph Report - .  (2026-08-29)

## Corpus Check
- 40 files · ~199,225 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2012 nodes · 4258 edges · 214 communities (110 shown, 104 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.67)
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
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
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
- Community 185
- Community 186
- Community 187
- Community 188
- Community 189
- Community 190
- Community 191
- Community 192
- Community 193
- Community 194
- Community 195
- Community 196
- Community 197
- Community 198
- Community 199
- Community 200
- Community 201
- Community 202
- Community 203
- Community 204
- Community 205
- Community 206
- Community 207
- Community 208
- Community 209
- Community 210
- Community 211
- Community 212
- Community 213

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 98 edges
2. `adminButtonClasses()` - 70 edges
3. `noStoreJson()` - 65 edges
4. `isRecord()` - 41 edges
5. `HM Visuals — Claude Working Document` - 38 edges
6. `getPageSeo()` - 38 edges
7. `cn()` - 27 edges
8. `requireAdminOr401()` - 26 edges
9. `getPageSections()` - 26 edges
10. `requireAdminObjectId()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `InquiryExpandedCard()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/inquiries/components/InquiryExpandedCard.tsx → components/admin/AdminButton.tsx
- `ServiceSimpleSection()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/services/components/ServiceSimpleSection.tsx → components/admin/AdminButton.tsx
- `ServicesBanner()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/services/components/ServicesBanner.tsx → components/admin/AdminButton.tsx
- `AdminTagsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/tags/page.tsx → lib/server/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (214 total, 104 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (52): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem() (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (50): getMediaLists(), MediaLocation, NftCurrency, NftEditionType, NftMeta, NftStatus, normalizeCurrency(), normalizeEditionType() (+42 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (56): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+48 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (35): TagMultiSelect(), TagOption, ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH() (+27 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (26): MediaListFilterBar(), Props, CategoriesToolbar(), CategoryFormCard(), CategoryRow(), ServicesToolbar(), SortableServiceItem(), TagRow() (+18 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (24): POST(), asNullableString(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), GET(), serializeTag() (+16 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (22): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), BlogPage(), generateMetadata(), ContactPage(), generateMetadata(), SP (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (21): HomeTestimonialCard(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage() (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (24): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), client, createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret() (+16 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (21): AdminPagesPage(), AdminPageEditor(), PATCH(), SLUG_TO_PATH, DISCIPLINES, GET(), isAdminAuthedServer(), AboutSections (+13 more)

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (16): ServicesBanner(), Banner, TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine() (+8 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.08
Nodes (25): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, lenis, lucide-react (+17 more)

### Community 19 - "Community 19"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @tsconfig/recommended (+17 more)

### Community 21 - "Community 21"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (18): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+10 more)

### Community 23 - "Community 23"
Cohesion: 0.13
Nodes (14): MediaFilterBar(), MediaTagChips(), TagChip, TagChipRow(), StatusFilter, TABS, MODES, ModeSwitcher() (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (19): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+11 more)

### Community 25 - "Community 25"
Cohesion: 0.09
Nodes (22): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain, HM Visuals — Session Queue, How to use, Minimum to go live, Phase 2 — Preloader & core experience, Phase 2a — Design direction (runs before D4), Phase 3 — Content & analytics (+14 more)

### Community 26 - "Community 26"
Cohesion: 0.19
Nodes (17): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, createAdminSessionCookies(), hmacHex(), isAdminPasswordConfigured() (+9 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (19): AdminInquiriesPage(), formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.19
Nodes (14): PAGE_ROWS, pageGroup, pageNeedsImage(), PageRow, GROUPS, PagesAdminClient(), EMPTY_SEO_DRAFT, PageEditorClient() (+6 more)

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (17): asFiniteLatitude(), asFiniteLongitude(), asNumberOrNull(), asString(), isRecord(), isValidObjectIdString(), normalizeSlug(), parseObjectId() (+9 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (16): generateMetadata(), HomePage(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, HomeHero() (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.19
Nodes (18): generateMetadata(), PhotographyPage(), generateMetadata(), VideographyPage(), toEmbedUrl(), cloudinaryImageLoader(), hasTransform(), LoaderArgs (+10 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (18): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyTagPage(), TagDiscipline, disciplineMatch(), DisciplineTag, getDisciplineTags() (+10 more)

### Community 33 - "Community 33"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 34 - "Community 34"
Cohesion: 0.18
Nodes (15): InquiriesToolbar(), InquiryExpandedCard(), archiveInquiry(), deleteInquiryForever(), fetchInquiries(), isApiResponse(), patchInquiry(), restoreInquiry() (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (10): CtaFields(), SLUG_LABELS, TextAreaField(), TextField(), RepeatingCardListEditor(), RepeatingListEditor(), CtaCopy, FEATURED_CARD_SLUGS (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.21
Nodes (12): AdminServiceCategoriesPage(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), Service, ServiceCategory (+4 more)

### Community 37 - "Community 37"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 38 - "Community 38"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 39 - "Community 39"
Cohesion: 0.23
Nodes (12): EMPTY_DRAFT, TagFormCard(), TagsTable(), createTagRequest(), deleteTagRequest(), fetchTags(), patchTag(), NewTag (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.21
Nodes (15): generateMetadata(), ServicesPage(), ServiceDetailPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard(), asBool() (+7 more)

### Community 41 - "Community 41"
Cohesion: 0.18
Nodes (8): Appearance, AppearanceBlock(), MediaItem, TagLink, formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 42 - "Community 42"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 43 - "Community 43"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 44 - "Community 44"
Cohesion: 0.16
Nodes (11): generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PageHeaderProps, PortfolioFallbackPanel() (+3 more)

### Community 45 - "Community 45"
Cohesion: 0.15
Nodes (11): AdminDashboard(), CATEGORY_ICONS, AdminProtectedLayout(), AdminSidebarNav(), NAV_GROUPS, NavGroup, NavItem, AdminDashboardStats (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.19
Nodes (11): CardImageGroup(), CardImageWarning(), GroupCard(), GroupTint, ICON_TINTS, TINTS, PageEditorBody(), SectionsData (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.26
Nodes (10): CategoriesTable(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category, CategoryPatch, getErrorMessage() (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 49 - "Community 49"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (11): createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual(), config, isAdminAuthed(), isPublicAdminRoute() (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (13): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+5 more)

### Community 53 - "Community 53"
Cohesion: 0.23
Nodes (14): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+6 more)

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (10): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), MediaGrid(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), useModalNavbarLock() (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.23
Nodes (11): buildContactSheetCells(), ContactSheetCell, ContactSheetState, ContactSheetTransition(), TransitionPhase, collectImagePool(), hrefToPath(), PageTransition (+3 more)

### Community 56 - "Community 56"
Cohesion: 0.18
Nodes (9): getString(), isRecord(), PeopleAdminClient(), statusLabel(), VISIBILITY_OPTIONS, WidgetResult, PersonItem, PersonVisibility (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.27
Nodes (10): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), EMPTY_SECTION_IMAGE, isSectionImage(), resolveOptionalCardImage() (+2 more)

### Community 58 - "Community 58"
Cohesion: 0.21
Nodes (9): Navbar(), DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay(), magneticOffset(), Options (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.23
Nodes (7): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe(), MediaLightbox(), useScrollLock(), ExhibitionCity

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (6): GET(), WebDevelopmentPage(), WebProjectCard(), parseUrl(), projectUrlLabel(), toProjectUrl()

### Community 61 - "Community 61"
Cohesion: 0.21
Nodes (9): metadata, RootLayout(), AppShell(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter() (+1 more)

### Community 62 - "Community 62"
Cohesion: 0.17
Nodes (11): HM Visuals — Session Archive, Phase 2 — Dancing page, Phase 2 — People page, Phase 2 — Preloader & core experience (completed portion), Phase 3 — Content & analytics, Session C4 — Media locations: validated city + stored coordinates — `done`, Session D10 — Dancing page — `done`, Session D12 — People page — `done` (+3 more)

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (7): IconButton(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), fmt(), statusPill()

### Community 64 - "Community 64"
Cohesion: 0.35
Nodes (6): AdminRemovalRequestsPage(), getRemovalRequestHistory(), getRemovalRequestQueue(), RemovalDecisionItem, RemovalRequestItem, toIso()

### Community 65 - "Community 65"
Cohesion: 0.31
Nodes (10): buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseLimit() (+2 more)

### Community 66 - "Community 66"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 67 - "Community 67"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 68 - "Community 68"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 69 - "Community 69"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 70 - "Community 70"
Cohesion: 0.20
Nodes (9): allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, name, overrides, postcss, private (+1 more)

### Community 71 - "Community 71"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (8): buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW, isDubai(), markerSize()

### Community 74 - "Community 74"
Cohesion: 0.28
Nodes (7): CTA_LABELS, HomeFeaturedWork(), buttonClasses(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug

### Community 75 - "Community 75"
Cohesion: 0.22
Nodes (9): scripts, build, db:indexes, dev, lint, start, test, test:watch (+1 more)

### Community 76 - "Community 76"
Cohesion: 0.22
Nodes (9): Phase 1 — Navigation & global systems, Session N1 — Minimal nav + Work overlay — `done`, Session N2 — Page activity toggle system — `done`, Session N3 — SEO + page metadata admin control — `done`, Session N4 — Page header content (extend page_seo) — `done`, Session N5 — Section-level content CMS (homepage + interim pages) — `done`, Session N6 — Homepage section redesign — `done`, Session N7 — Admin-selectable card images (Work overlay + Featured Work) — `done` (+1 more)

### Community 77 - "Community 77"
Cohesion: 0.22
Nodes (9): Phase 4 — People & launch prep, Session D4 — Page transition system — `done` (complete 2026-08-27), Session D4 — Page transition system (engine + homepage shipped 2026-08-20), Session D5 — Cursor enhancements — `done` (2026-08-20), Session D7 — NFT page redesign — `done` (2026-08-21), Session D8 — Magnetic button effect — `done` (2026-08-27), Session D9 — Admin visual redesign — `done`, Session D9b — Admin information architecture — `done` (+1 more)

### Community 78 - "Community 78"
Cohesion: 0.22
Nodes (9): Phase S — Security & hardening, Session S1 — Finish the security migration — `done`, Session S2 — Reuse audit against the real code rule — `done` (audit + slice S2a), Session S2b — API `[id]`-route boilerplate extraction — `done`, Session S3 — Automated test baseline — `done`, Session S4 — Work overlay card images: decide the empty state — `done`, Session S5 — `page-settings` PATCH treats partial updates as full replacement — `done`, Session S6 — Remove `unoptimized` from testimonial images — `done` (+1 more)

### Community 79 - "Community 79"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 80 - "Community 80"
Cohesion: 0.36
Nodes (5): AnySections, CTA_ONLY_SLUGS, SectionsGroup(), WebDevSectionsForm(), PageSectionsMap

### Community 81 - "Community 81"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 82 - "Community 82"
Cohesion: 0.29
Nodes (6): Deployment, Getting started, HM Visuals, Stack, Verification, Working document

### Community 83 - "Community 83"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 84 - "Community 84"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 85 - "Community 85"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 86 - "Community 86"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 87 - "Community 87"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 88 - "Community 88"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 89 - "Community 89"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

### Community 90 - "Community 90"
Cohesion: 0.33
Nodes (6): Phase 0 — Foundation (must complete before any design session), Session F1 — Remove violations + initialize Lenis — `done`, Session F2 — Code refactoring: extract reusable components — `done`, Session F3 — Split large admin files — `done`, Session F4 — Design-rule cleanup + dead code removal — `done`, Session F5 — Admin orchestration & data-layer consolidation — `done`

### Community 91 - "Community 91"
Cohesion: 0.33
Nodes (6): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session N9 — Stop public chrome rendering on admin — `done` (2026-08-19), Session S10 — Two security fixes — `done`, Session S11 — Admin: stop losing work — `done` (2026-08-19), Session S8 — Two resource leaks — `done`, Session S9 — Revalidation coverage — `done`

### Community 92 - "Community 92"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 93 - "Community 93"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 94 - "Community 94"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 96 - "Community 96"
Cohesion: 0.80
Nodes (3): CustomCursor(), stepSpring(), stretchFor()

### Community 97 - "Community 97"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 98 - "Community 98"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 99 - "Community 99"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 100 - "Community 100"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 101 - "Community 101"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 102 - "Community 102"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 103 - "Community 103"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 104 - "Community 104"
Cohesion: 0.50
Nodes (4): Phase DS — Design system rescue (Impeccable), Session DS0 — Install the design + motion skill stack — `done`, Session DS1 — Evaluate the detector (no install, no hooks) — `done`, Session DS2 — Fold Impeccable findings in; skills for the design gaps — `done`

### Community 109 - "Community 109"
Cohesion: 0.67
Nodes (3): Phase 2a — Design direction (ran before D4), Session D2b — Homepage section pass — `done`, Session D2c — About page rebuild — `done`

### Community 110 - "Community 110"
Cohesion: 0.67
Nodes (3): Phase T — Tag taxonomy & discipline subpages, Session T1 — Tag taxonomy: `media_tags` + `/admin/tags` — `done`, Session T2 — `/photography/[tag]` and `/videography/[tag]` — `done`

## Knowledge Gaps
- **693 isolated node(s):** `Who this is for`, `The site`, `Domain & deployment status`, `Stack`, `Image pipeline — Next's optimizer is bypassed (2026-07-31)` (+688 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **104 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 4` to `Community 7`, `Community 10`, `Community 12`, `Community 13`, `Community 15`, `Community 22`, `Community 24`, `Community 26`, `Community 29`, `Community 31`, `Community 32`, `Community 36`, `Community 39`, `Community 40`, `Community 44`, `Community 48`, `Community 49`, `Community 53`, `Community 57`, `Community 65`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `adminButtonClasses()` connect `Community 5` to `Community 0`, `Community 34`, `Community 35`, `Community 36`, `Community 6`, `Community 39`, `Community 8`, `Community 46`, `Community 47`, `Community 16`, `Community 27`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Appearance` connect `Community 41` to `Community 0`, `Community 1`, `Community 53`, `Community 24`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain & deployment status` to the rest of the system?**
  _693 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.060694579681921455 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06025039123630673 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07451923076923077 - nodes in this community are weakly interconnected._