# Graph Report - .  (2026-09-02)

## Corpus Check
- 7 files · ~217,186 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2064 nodes · 4203 edges · 248 communities (128 shown, 120 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.68)
- Token cost: 0 input · 147,587 output

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
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 118
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
- Community 135
- Community 136
- Community 137
- Community 138
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
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
- Community 214
- Community 215
- Community 216
- Community 217
- Community 218
- Community 219
- Community 220
- Community 221
- Community 222
- Community 223
- Community 224
- Community 225
- Community 226
- Community 227
- Community 228
- Community 229
- Community 230
- Community 231
- Community 232
- Community 233
- Community 234
- Community 235
- Community 236
- Community 237
- Community 238
- Community 239
- Community 240
- Community 241
- Community 242
- Community 243
- Community 244
- Community 245
- Community 246
- Community 247

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 109 edges
2. `noStoreJson()` - 74 edges
3. `adminButtonClasses()` - 52 edges
4. `isRecord()` - 50 edges
5. `getPageSeo()` - 44 edges
6. `requireAdminObjectId()` - 35 edges
7. `buildPublicMetadata()` - 33 edges
8. `findByIdOr404()` - 32 edges
9. `requireAdminOr401()` - 31 edges
10. `asNullableString()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `InquiryExpandedCard()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/inquiries/components/InquiryExpandedCard.tsx → components/admin/AdminButton.tsx
- `MediaDetailsSection()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/media/components/MediaDetailsSection.tsx → components/admin/AdminButton.tsx
- `TagMultiSelect()` --calls--> `slugifyTag()`  [EXTRACTED]
  app/admin/(protected)/media/components/TagMultiSelect.tsx → lib/server/media-tags.ts
- `MediaListFilterBar()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/media/list/components/MediaListFilterBar.tsx → components/admin/AdminButton.tsx
- `ServicesBanner()` --calls--> `adminButtonClasses()`  [EXTRACTED]
  app/admin/(protected)/services/components/ServicesBanner.tsx → components/admin/AdminButton.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase L launch-readiness sessions** — session_queue_l2, session_queue_l3, session_queue_l7, session_queue_l10, session_queue_l11 [EXTRACTED 0.90]
- **Security stack (auth, rate limiting, CSP)** — claude_auth_system, claude_session_token, claude_request_guards, claude_get_client_address, claude_csp [EXTRACTED 0.90]
- **Page content CMS evolution (N2-N7)** — session_archive_n2, session_archive_n3, session_archive_n4, session_archive_n5, claude_page_content_cms [EXTRACTED 0.85]
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (248 total, 120 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (63): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+55 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (41): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem() (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (40): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), DancingPage(), generateMetadata() (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (37): HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, DISCIPLINE_ORDER, HomeHero(), buildInquiryContext(), buildInquiryHref(), currencySymbol (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (39): PATCH(), SLUG_TO_PATH, POST(), CLOUDINARY_MANAGED_FOLDERS, collectSectionImagePublicIds(), CloudinaryCleanupResult, CloudinaryResourceType, deleteFolderViaAdminApi() (+31 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (30): asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), asNumberOrNull(), asString(), isRecord(), normalizeSlug(), MediaLocation (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.17
Nodes (32): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET(), findByIdOr404() (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (25): MediaListFilterBar(), Props, MediaPickerModal(), GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+17 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (27): PageEditorBody(), SectionsData, AnySections, CTA_ONLY_SLUGS, SectionsGroup(), SeoDraft, PAGE_ROWS, PageGroup (+19 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (22): BlogAdminClient(), formatDate(), BlogMarkdownField(), BlogPostEditor(), EMPTY, TagsInput(), EditBlogPostPage(), createPost() (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (25): GET(), ContactPage(), SP, ServicesPage(), ServiceDetailPage(), HomeServicesPreview(), serviceDirections, ServiceCard() (+17 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (19): AdminServiceCategoriesPage(), archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson() (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (18): InquiriesToolbar(), CategoriesToolbar(), CategoryFormCard(), ServicesToolbar(), TagsToolbar(), AdminButton(), adminButtonClasses(), AdminButtonProps (+10 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (19): AdminServiceCategoriesClient(), CategoriesTable(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category, CategoryPatch (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.19
Nodes (25): getMediaLists(), resolvePeopleSelection(), sanitizeAppearances(), MEDIA_BASE_PATHS, revalidateMediaSurfaces(), POST(), DELETE(), PATCH() (+17 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (18): POST(), asNullableString(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), POST(), GET() (+10 more)

### Community 19 - "Community 19"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (22): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), hashGalleryPassword() (+14 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (18): BlogPage(), BlogPostPage(), BlogCard(), formatBlogDate(), readingMinutes(), readingTimeLabel(), getBlogActive(), asString() (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (17): createAdminSessionCookies(), hmacHex(), isAdminPasswordConfigured(), parseScryptHash(), verifyAdminPassword(), verifyPair(), createSessionValue(), isSessionValueFresh() (+9 more)

### Community 24 - "Community 24"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 25 - "Community 25"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 26 - "Community 26"
Cohesion: 0.17
Nodes (16): ServicesBanner(), Banner, TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine() (+8 more)

### Community 27 - "Community 27"
Cohesion: 0.19
Nodes (14): TagMultiSelect(), TagOption, EMPTY_DRAFT, TagFormCard(), TagsTable(), createTagRequest(), deleteTagRequest(), fetchTags() (+6 more)

### Community 28 - "Community 28"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, @dnd-kit/core, @dnd-kit/utilities, gsap, mongodb, next-cloudinary, dependencies (+15 more)

### Community 29 - "Community 29"
Cohesion: 0.19
Nodes (15): AdminDashboard(), CATEGORY_ICONS, pageNeedsImage(), AdminPagesPage(), AdminPageEditor(), PATCH(), SLUG_TO_PATH, isAdminAuthedServer() (+7 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (16): isValidObjectIdString(), parseObjectId(), ensureUniqueSlug(), GET(), POST(), slugify(), POST(), isValidReorderItem() (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 32 - "Community 32"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 33 - "Community 33"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (8): BusyAction, Editor, STEPS, MediaWizardPreview(), Admin, GalleryWizard(), STEPS, WizardTabs()

### Community 35 - "Community 35"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 36 - "Community 36"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 37 - "Community 37"
Cohesion: 0.23
Nodes (15): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, buildRateLimitId(), claimDuplicateWindow(), clearFixedWindowRateLimit() (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.21
Nodes (7): CtaFields(), TextAreaField(), TextField(), RepeatingCardListEditor(), RepeatingListEditor(), CtaCopy, CtaOnlySections

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
Cohesion: 0.20
Nodes (7): AppearanceBlock(), MediaItem, TagLink, formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (8): InquiryExpandedCard(), patchInquiry(), restoreInquiry(), ApiInquiriesResponse, Banner, Inquiry, InquiryStatus, STATUSES

### Community 44 - "Community 44"
Cohesion: 0.23
Nodes (12): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+4 more)

### Community 45 - "Community 45"
Cohesion: 0.20
Nodes (14): PeoplePage(), PersonDetailPage(), buildPersonDetail(), buildPersonMediaQuery(), getPersonPageBySlug(), getPublicPeople(), getPublicPersonBySlug(), isPersonGated() (+6 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (9): MediaFilterBar(), MediaGrid(), MediaTagChips(), TagChip, TagChipRow(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.17
Nodes (3): PhotographyCylinder, PhotographyHorizontal, ModalPortal()

### Community 48 - "Community 48"
Cohesion: 0.21
Nodes (7): Category, CategoryRow(), CategoryRow(), TagRow(), SortableRow(), SortableList(), useSortableRow()

### Community 49 - "Community 49"
Cohesion: 0.19
Nodes (5): PeopleAdminClient(), statusLabel(), VISIBILITY_OPTIONS, CloudinaryUploadButton(), CloudinaryUploaded

### Community 50 - "Community 50"
Cohesion: 0.21
Nodes (6): CardImageWarning(), SLUG_LABELS, SeoPageForm(), ImageField(), FEATURED_CARD_SLUGS, SectionImage

### Community 51 - "Community 51"
Cohesion: 0.15
Nodes (14): Achromatic OKLCH Palette, Button System (two-look), Design Direction Spec, No Stat Strips / No Eyebrows ban, components/shared/PageHeader.tsx, components/shared/PortfolioCard.tsx, Five-value Radius Scale, Section System (hairline + rhythm) (+6 more)

### Community 52 - "Community 52"
Cohesion: 0.15
Nodes (13): components/admin/AdminButton.tsx, Admin Mobile Pass (A1), cloudinary-image-loader.ts, CloudinaryUploadButton (admin uploader), Content-Security-Policy (next.config.ts), Dancing page (Instagram embeds), Cloudinary Image Pipeline (custom loader), components/shared/ModalPortal.tsx (+5 more)

### Community 53 - "Community 53"
Cohesion: 0.18
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, NoResults()

### Community 54 - "Community 54"
Cohesion: 0.41
Nodes (9): POST(), createPersonGateCookieValue(), getPersonGateSecret(), personGateCookieName(), scryptAsync(), signGatePayload(), timingSafeStringEqual(), verifyPassword() (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (9): getIdentityLine(), renderStars(), ReviewModal(), GeoPoint, getMapEmbedUrl(), TestimonialMap(), getReviewPoint(), normalizeLocationKey() (+1 more)

### Community 56 - "Community 56"
Cohesion: 0.18
Nodes (11): BlogContent (react-markdown, no dangerouslySetInnerHTML), Blog System (blog_posts + blog_categories), Discipline Tag Subpages, Exhibition Globe (react-globe.gl), getExhibitionCities, Validated Media Locations + coordinates, Page Content CMS (3 collections), components/admin/sortable/SortableList.tsx (+3 more)

### Community 57 - "Community 57"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 58 - "Community 58"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 59 - "Community 59"
Cohesion: 0.33
Nodes (6): AdminAnalytics(), AnalyticsRow, AnalyticsStats, getGoatCounterStats(), goatCounterPeriod(), toRows()

### Community 60 - "Community 60"
Cohesion: 0.33
Nodes (5): AdminMobileNav(), AdminSidebarNav(), NAV_GROUPS, NavGroup, NavItem

### Community 61 - "Community 61"
Cohesion: 0.31
Nodes (6): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe(), useModalNavbarLock(), ExhibitionCity

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (6): HomeTestimonialCard(), getPublicTestimonials(), normalizeStringArray(), PublicTestimonial, PublicTestimonialsData, toPublicTestimonial()

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 64 - "Community 64"
Cohesion: 0.28
Nodes (5): GroupCard(), GroupTint, ICON_TINTS, TINTS, AdminToggle()

### Community 65 - "Community 65"
Cohesion: 0.39
Nodes (7): AdminRemovalRequestsPage(), countPendingRemovalRequests(), getRemovalRequestHistory(), getRemovalRequestQueue(), RemovalDecisionItem, RemovalRequestItem, toIso()

### Community 66 - "Community 66"
Cohesion: 0.28
Nodes (6): CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP, CLOUDINARY_MEDIA_CATEGORY_FOLDERS, CloudinaryMediaCategory, getCloudinaryMediaFolderForCategory(), getCloudinaryMediaFoldersForCategories(), isCloudinaryMediaCategory()

### Community 67 - "Community 67"
Cohesion: 0.28
Nodes (5): metadata, SiteAnalytics(), AppShell(), lenis, lenis

### Community 68 - "Community 68"
Cohesion: 0.22
Nodes (9): Analytics (GoatCounter), components/site/AppShell.tsx, getTransitionImages (fail-safe pool), Site-wide Contact-Sheet Page Transition, Preloader (D1), SiteAnalytics + getGoatCounterStats, TransitionProvider / usePageTransition, Session C3 (analytics — GoatCounter) (+1 more)

### Community 69 - "Community 69"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 70 - "Community 70"
Cohesion: 0.28
Nodes (6): Navbar(), ARC_RADIUS, DisciplineCard, maxSway(), Props, WorkOverlay()

### Community 71 - "Community 71"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 72 - "Community 72"
Cohesion: 0.39
Nodes (4): EMPTY_SECTION_IMAGE, isSectionImage(), resolveOptionalCardImage(), TextCard

### Community 73 - "Community 73"
Cohesion: 0.29
Nodes (5): CTA_LABELS, PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug

### Community 74 - "Community 74"
Cohesion: 0.36
Nodes (4): buildContactSheetCells(), ContactSheetCell, ContactSheetState, TransitionPhase

### Community 75 - "Community 75"
Cohesion: 0.36
Nodes (6): collectImagePool(), hrefToPath(), PageTransition, prefersReducedMotion(), TransitionCtx, TransitionProvider()

### Community 76 - "Community 76"
Cohesion: 0.57
Nodes (4): GET(), parseUrl(), projectUrlLabel(), toProjectUrl()

### Community 77 - "Community 77"
Cohesion: 0.33
Nodes (7): components/shared/NoResults.tsx, No Scroll-Jacking rule, Photography Viewer (Cylinder/Horizontal/Grid), Testing & CI (Vitest, no next build), Session L10 (release-confidence test layer), Session L11 (full verification gate), Session L6 (real pagination on browsing)

### Community 78 - "Community 78"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 79 - "Community 79"
Cohesion: 0.29
Nodes (6): Deployment, Getting started, HM Visuals, Stack, Verification, Working document

### Community 80 - "Community 80"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 81 - "Community 81"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 82 - "Community 82"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 83 - "Community 83"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 84 - "Community 84"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 85 - "Community 85"
Cohesion: 0.47
Nodes (5): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses()

### Community 86 - "Community 86"
Cohesion: 0.47
Nodes (5): AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl(), getErrorMessage(), LoadMode

### Community 87 - "Community 87"
Cohesion: 0.60
Nodes (5): ALLOWED_SIGN_KEYS, isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp()

### Community 88 - "Community 88"
Cohesion: 0.40
Nodes (6): Admin Auth (scrypt hash + HMAC session), getClientAddress (public-form-security.ts), Rate Limiting (request-guards.ts), lib/auth/session-token.ts, Session L2 (rate-limit client-address fix), Session L3 (testimonial upload-session ownership)

### Community 89 - "Community 89"
Cohesion: 0.33
Nodes (6): lib/seo/page-metadata.ts buildPublicMetadata, Empty Means Empty rule, HomeHero + HeroBokeh (fixed, not to redesign), Open Graph Images (buildPublicMetadata), Session N7 (admin-selectable card images), Session L8 (SEO, email, legal surfaces)

### Community 90 - "Community 90"
Cohesion: 0.47
Nodes (6): lib/password-gate.ts, People Privacy System (3-state), Private Galleries gate (lib/private-galleries.ts), Removal Request Flow + audit collection, Session D12 (people privacy system), Session L7 (private gallery authenticated delivery)

### Community 91 - "Community 91"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 92 - "Community 92"
Cohesion: 0.53
Nodes (4): cylinderItems(), isSmallScreen(), maxTextures(), textureWidth()

### Community 93 - "Community 93"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

### Community 94 - "Community 94"
Cohesion: 0.53
Nodes (4): ReviewPhotoStrip(), getIdentityLine(), renderStars(), SingleReviewCard()

### Community 95 - "Community 95"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 96 - "Community 96"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 97 - "Community 97"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 98 - "Community 98"
Cohesion: 0.50
Nodes (5): 6-item Navigation, Page Activity Toggle (isActive), components/site/WorkOverlay.tsx, Session N1 (minimal nav + Work overlay), Session N2 (page activity toggle)

### Community 100 - "Community 100"
Cohesion: 0.80
Nodes (3): CustomCursor(), stepSpring(), stretchFor()

### Community 101 - "Community 101"
Cohesion: 0.60
Nodes (3): Avatar(), getInitials(), SafeImage()

### Community 102 - "Community 102"
Cohesion: 0.60
Nodes (3): magneticOffset(), Options, useMagneticHover()

### Community 103 - "Community 103"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 104 - "Community 104"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 105 - "Community 105"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 111 - "Community 111"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 112 - "Community 112"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 113 - "Community 113"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 116 - "Community 116"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 121 - "Community 121"
Cohesion: 0.67
Nodes (3): GET(), serializeTag(), tagCounts()

### Community 124 - "Community 124"
Cohesion: 0.67
Nodes (3): app/api/_lib/admin-route.ts, useAdminAction hook, Session F5 (admin orchestration consolidation)

## Knowledge Gaps
- **644 isolated node(s):** `Editor`, `BusyAction`, `STEPS`, `AdminMediaListResponse`, `LoadMode` (+639 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **120 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 7` to `Community 0`, `Community 65`, `Community 3`, `Community 4`, `Community 6`, `Community 39`, `Community 41`, `Community 44`, `Community 13`, `Community 17`, `Community 18`, `Community 20`, `Community 54`, `Community 62`, `Community 121`, `Community 27`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 28` to `Community 67`, `Community 5`, `Community 138`, `Community 144`, `Community 146`, `Community 147`, `Community 148`, `Community 151`, `Community 152`, `Community 153`, `Community 154`, `Community 155`, `Community 156`, `Community 157`, `Community 158`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `Editor`, `BusyAction`, `STEPS` to the rest of the system?**
  _644 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05359937402190924 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06189640035118525 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12156633547632963 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._