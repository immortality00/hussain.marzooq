# Graph Report - hussain.marzooq  (2026-08-21)

## Corpus Check
- 339 files · ~183,415 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1585 nodes · 3830 edges · 100 communities (89 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `23ecff40`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- page.tsx
- cloudinary-assets.ts
- TransitionContext.tsx
- HM Visuals — Claude
- getDb()
- dependencies
- devDependencies
- cn()
- route.ts
- admin.ts
- getPageSeo()
- tag-pages.ts
- testimonials.ts
- compilerOptions
- page.tsx
- asNullableString()
- media-serializers.ts
- page.tsx
- AdminTagsClient.tsx
- AdminServiceCategoriesClient.tsx
- ContactForm.tsx
- route.ts
- lib.ts
- Animation Standards Reference (STANDARDS.md)
- db.ts
- page-sections-shared.ts
- isRecord()
- route.ts
- AdminActionFeedback.tsx
- page-settings.ts
- PageRowCard.tsx
- useServicesAdmin.ts
- components.json
- page-sections.ts
- location-search.ts
- AdminServicesClient.tsx
- Unified /admin/pages surface
- useAdminAction()
- Session T1 — Tag
- PhotographyViewer.tsx
- usePagesAdmin.ts
- AppShell global-chrome consolidation
- route.ts
- route.ts
- page.tsx
- Session D2b — Homepage
- Content-Security-Policy in next.config
- page.tsx
- types.ts
- MediaDetailsSections.tsx
- page seo collection (SEO
- check job
- graph.json Output
- SmartMediaPreview.tsx
- lib.ts
- Session D6 — Exhibition
- ExhibitionGlobe.tsx
- SectionsGroup.tsx
- page.tsx
- public-media.ts
- useModalNavbarLock()
- HomeFeaturedWork.tsx
- useMediaSearch.ts
- route.ts
- graphify Skill
- Incremental Update
- Community Detection
- Extraction Subagent Prompt
- HomeHero.tsx
- email.ts
- HM Visuals
- ensure-indexes.mjs
- page.tsx
- BFS Traversal
- Semantic (LLM) Extraction
- import-geonames-cities.mjs
- cloudinary-image-loader.ts
- next.config.ts
- frontend-design skill
- Work Memory Self-Improving Loop
- generate-admin-password-hash.mjs
- eslint.config.mjs
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- Preloader (GSAP icon sequence
- blog posts collection +
- server-modules.test.ts
- vitest.config.ts
- Token Reduction Benchmark
- Globe earth-day texture
- Globe earth-topology bump map
- Globe Icon
- Session F1 — Remove
- Session F3 — Split

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 121 edges
2. `noStoreJson()` - 78 edges
3. `isRecord()` - 52 edges
4. `getPageSeo()` - 43 edges
5. `HM Visuals — Claude Working Document` - 38 edges
6. `requireAdminObjectId()` - 33 edges
7. `requireAdminOr401()` - 31 edges
8. `findByIdOr404()` - 30 edges
9. `asNullableString()` - 29 edges
10. `getPageSections()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `frontend-design skill` --semantically_similar_to--> `redesign-existing-projects skill`  [INFERRED] [semantically similar]
  .claude/skills/frontend-design/SKILL.md → .agents/skills/redesign-existing-projects/SKILL.md
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/about/page.tsx → lib/server/page-seo.ts
- `TagMultiSelect()` --calls--> `slugifyTag()`  [EXTRACTED]
  app/admin/(protected)/media/components/TagMultiSelect.tsx → lib/server/media-tags.ts
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts
- `AdminTagsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/tags/page.tsx → lib/server/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (100 total, 11 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.06
Nodes (57): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem() (+49 more)

### Community 1 - "page.tsx"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 2 - "cloudinary-assets.ts"
Cohesion: 0.10
Nodes (47): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+39 more)

### Community 3 - "TransitionContext.tsx"
Cohesion: 0.06
Nodes (34): metadata, AppShell(), CustomCursor(), stepSpring(), stretchFor(), Navbar(), cormorant, FlashItem (+26 more)

### Community 4 - "HM Visuals — Claude"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 5 - "getDb()"
Cohesion: 0.18
Nodes (30): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET(), findByIdOr404() (+22 more)

### Community 6 - "dependencies"
Cohesion: 0.04
Nodes (45): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+37 more)

### Community 7 - "devDependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 8 - "cn()"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 9 - "route.ts"
Cohesion: 0.13
Nodes (30): getMediaLists(), MediaLocation, NftCurrency, NftEditionType, NftMeta, NftStatus, normalizeCurrency(), normalizeEditionType() (+22 more)

### Community 10 - "admin.ts"
Cohesion: 0.11
Nodes (25): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), createAdminSessionCookies(), hmacHex() (+17 more)

### Community 11 - "getPageSeo()"
Cohesion: 0.16
Nodes (23): AboutPage(), BlogPage(), DancingPage(), generateMetadata(), generateMetadata(), NftPage(), generateMetadata(), PhotographyPage() (+15 more)

### Community 12 - "tag-pages.ts"
Cohesion: 0.16
Nodes (18): PhotographyTagPage(), VideographyTagPage(), buildPublicMediaQuery(), TagDiscipline, getMediaByTag(), getShowreelItem(), disciplineMatch(), DisciplineTag (+10 more)

### Community 13 - "testimonials.ts"
Cohesion: 0.13
Nodes (23): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+15 more)

### Community 14 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "page.tsx"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 16 - "asNullableString()"
Cohesion: 0.11
Nodes (38): POST(), isValidObjectIdString(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), GET(), isAllowedCloudinaryTestimonialUrl() (+30 more)

### Community 17 - "media-serializers.ts"
Cohesion: 0.31
Nodes (10): buildCursorCondition(), buildSearchConditions(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseLimit() (+2 more)

### Community 18 - "page.tsx"
Cohesion: 0.15
Nodes (20): ContactPage(), generateMetadata(), SP, generateMetadata(), HomePage(), generateMetadata(), ServicesPage(), disciplineSlugForCategory() (+12 more)

### Community 19 - "AdminTagsClient.tsx"
Cohesion: 0.16
Nodes (16): TagMultiSelect(), TagOption, AdminTagsClient(), EMPTY_DRAFT, TagFormCard(), TagsTable(), TagsToolbar(), createTagRequest() (+8 more)

### Community 20 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.21
Nodes (11): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category (+3 more)

### Community 21 - "ContactForm.tsx"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 22 - "route.ts"
Cohesion: 0.18
Nodes (23): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate(), isPrivateGalleryExpired() (+15 more)

### Community 23 - "lib.ts"
Cohesion: 0.22
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 24 - "Animation Standards Reference (STANDARDS.md)"
Cohesion: 0.12
Nodes (23): Animation Recipes, animate skill, animation-vocabulary skill, apple-design skill, Spring interruptibility and velocity handoff, emil-design-eng skill, Emil Kowalski animation philosophy, find-animation-opportunities skill (+15 more)

### Community 25 - "db.ts"
Cohesion: 0.13
Nodes (17): AdminNftsPage(), CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray() (+9 more)

### Community 26 - "page-sections-shared.ts"
Cohesion: 0.25
Nodes (8): CardsCtaForm(), CtaOnlyForm(), TextAreaField(), TextField(), RepeatingCardListEditor(), CtaCopy, TextCard, CtaOnlySections

### Community 27 - "isRecord()"
Cohesion: 0.22
Nodes (17): asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), asNumberOrNull(), asString(), normalizeSlug(), ensureUniqueSlug(), POST() (+9 more)

### Community 28 - "route.ts"
Cohesion: 0.33
Nodes (16): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 29 - "AdminActionFeedback.tsx"
Cohesion: 0.30
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 30 - "page-settings.ts"
Cohesion: 0.16
Nodes (11): PrivateGalleryPage(), generateMetadata(), renderStars(), TestimonialsPage(), generateMetadata(), AnimatedText(), AnimatedTextProps, Tag (+3 more)

### Community 31 - "PageRowCard.tsx"
Cohesion: 0.15
Nodes (14): GroupCard(), GroupTint, ICON_TINTS, TINTS, PageRowCard(), SectionsData, RowPill(), AnySections (+6 more)

### Community 32 - "useServicesAdmin.ts"
Cohesion: 0.11
Nodes (28): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServicesToolbar() (+20 more)

### Community 33 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 34 - "page-sections.ts"
Cohesion: 0.17
Nodes (14): AdminPagesPage(), PATCH(), SLUG_TO_PATH, AboutSections, ALL_PAGE_SECTIONS_SLUGS, BlogSections, BOOKING_CTA, DancingSections (+6 more)

### Community 35 - "location-search.ts"
Cohesion: 0.07
Nodes (28): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain, HM Visuals — Session Queue, How to use, Minimum to go live, Phase 2 — Preloader & core experience, Phase 2a — Design direction (runs before D4), Phase 3 — Content & analytics (+20 more)

### Community 36 - "AdminServicesClient.tsx"
Cohesion: 0.21
Nodes (11): DISCIPLINE_HREFS, generateMetadata(), generateMetadata(), generateMetadata(), generateMetadata(), AboutDisciplineCard(), PageHeader(), PageHeaderProps (+3 more)

### Community 37 - "Unified /admin/pages surface"
Cohesion: 0.23
Nodes (15): asNullableString(), isRecord(), parseObjectId(), POST(), isValidReorderItem(), POST(), ReorderItem, getClientKey() (+7 more)

### Community 38 - "useAdminAction()"
Cohesion: 0.16
Nodes (12): getString(), isRecord(), PeopleAdminClient(), WidgetResult, TestimonialsAdminClient(), AdminActionFeedback(), AdminActionFeedbackState, AdminActionFeedbackType (+4 more)

### Community 39 - "Session T1 — Tag"
Cohesion: 0.23
Nodes (11): MediaListFilterBar(), formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage(), AdminMediaListResponse (+3 more)

### Community 40 - "PhotographyViewer.tsx"
Cohesion: 0.16
Nodes (12): MediaFilterBar(), MediaTagChips(), TagChip, TagChipRow(), MODES, ModeSwitcher(), ViewerMode, PhotographyCylinder (+4 more)

### Community 41 - "usePagesAdmin.ts"
Cohesion: 0.24
Nodes (9): EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow, SettingsDraft, usePagesAdmin(), useUnsavedChangesGuard(), PageSeo (+1 more)

### Community 42 - "AppShell global-chrome consolidation"
Cohesion: 0.22
Nodes (9): DISCIPLINE_LINKS, HomeCreativeSystem(), BaseProps, Button(), buttonClasses(), ButtonProps, ButtonVariant, VARIANT (+1 more)

### Community 43 - "route.ts"
Cohesion: 0.42
Nodes (6): PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), EMPTY_SECTION_IMAGE, resolveOptionalCardImage(), deleteReplacedSectionImages()

### Community 44 - "route.ts"
Cohesion: 0.30
Nodes (11): PATCH(), revalidateTagSurfaces(), GET(), POST(), serializeTag(), tagCounts(), isReservedTagSlug(), isValidTagSlug() (+3 more)

### Community 45 - "page.tsx"
Cohesion: 0.36
Nodes (9): buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor(), parseIds() (+1 more)

### Community 46 - "Session D2b — Homepage"
Cohesion: 0.20
Nodes (9): HM Visuals — Session Archive, Phase 2a — Design direction (ran before D4), Phase S2 — Defects from the 2026-08-17 full-repo audit, Phase S — Security & hardening, Session D2b — Homepage section pass — `done`, Session D2c — About page rebuild — `done`, Session N9 — Stop public chrome rendering on admin — `done` (2026-08-19), Session S11 — Admin: stop losing work — `done` (2026-08-19) (+1 more)

### Community 47 - "Content-Security-Policy in next.config"
Cohesion: 0.31
Nodes (7): CategoryRow(), SortableServiceItem(), TagRow(), RepeatingListEditor(), SortableRow(), SortableList(), useSortableRow()

### Community 48 - "page.tsx"
Cohesion: 0.17
Nodes (17): DISCIPLINES, GET(), generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), ServiceDetailPage(), isSectionImage() (+9 more)

### Community 49 - "types.ts"
Cohesion: 0.35
Nodes (3): MediaSurface(), MediaItem, TagLink

### Community 50 - "MediaDetailsSections.tsx"
Cohesion: 0.27
Nodes (5): AppearanceBlock(), formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 51 - "page seo collection (SEO"
Cohesion: 0.22
Nodes (9): Phase 1 — Navigation & global systems, Session N1 — Minimal nav + Work overlay — `done`, Session N2 — Page activity toggle system — `done`, Session N3 — SEO + page metadata admin control — `done`, Session N4 — Page header content (extend page_seo) — `done`, Session N5 — Section-level content CMS (homepage + interim pages) — `done`, Session N6 — Homepage section redesign — `done`, Session N7 — Admin-selectable card images (Work overlay + Featured Work) — `done` (+1 more)

### Community 52 - "check job"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 53 - "graph.json Output"
Cohesion: 0.22
Nodes (10): FalkorDB Cypher Export, Neo4j Cypher Export, Cross-Repo Graph Merge, GitHub Repo Clone, graphify explain (Node Explanation), NetworkX Inline Traversal Fallback, graphify path (Shortest Path), graph.json Output (+2 more)

### Community 54 - "SmartMediaPreview.tsx"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 55 - "lib.ts"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 56 - "Session D6 — Exhibition"
Cohesion: 0.25
Nodes (8): Phase S — Security & hardening, Session S1 — Finish the security migration — `done`, Session S2 — Reuse audit against the real code rule — `done` (audit + slice S2a), Session S2b — API `[id]`-route boilerplate extraction — `done`, Session S3 — Automated test baseline — `done`, Session S4 — Work overlay card images: decide the empty state — `done`, Session S6 — Remove `unoptimized` from testimonial images — `done`, Session S7 — Resolve remaining eslint `exhaustive-deps` warnings — `done`

### Community 57 - "ExhibitionGlobe.tsx"
Cohesion: 0.33
Nodes (8): buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW, isDubai(), markerSize()

### Community 58 - "SectionsGroup.tsx"
Cohesion: 0.21
Nodes (10): CardImageGroup(), CardImageWarning(), HomeSectionsForm(), SLUG_LABELS, getString(), ImageField(), isRecord(), MediaPickerModal() (+2 more)

### Community 59 - "page.tsx"
Cohesion: 0.33
Nodes (6): Phase 0 — Foundation (must complete before any design session), Session F1 — Remove violations + initialize Lenis — `done`, Session F2 — Code refactoring: extract reusable components — `done`, Session F3 — Split large admin files — `done`, Session F4 — Design-rule cleanup + dead code removal — `done`, Session F5 — Admin orchestration & data-layer consolidation — `done`

### Community 60 - "public-media.ts"
Cohesion: 0.42
Nodes (5): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, PublicMediaItem, ExhibitionCity

### Community 61 - "useModalNavbarLock()"
Cohesion: 0.43
Nodes (5): HomeExhibitionGlobe(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser()

### Community 62 - "HomeFeaturedWork.tsx"
Cohesion: 0.29
Nodes (6): CTA_LABELS, HomeFeaturedWork(), PortfolioCard(), PortfolioCardProps, FeaturedCard, FeaturedCardSlug

### Community 63 - "useMediaSearch.ts"
Cohesion: 0.29
Nodes (6): MediaGrid(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyViewer()

### Community 64 - "route.ts"
Cohesion: 0.50
Nodes (4): Phase 4 — People & launch prep, Session D5 — Cursor enhancements — `done` (2026-08-20), Session D7 — NFT page redesign — `done` (2026-08-21), Session L1 — Launch prep checklist — `done` (2026-08-20)

### Community 65 - "graphify Skill"
Cohesion: 0.29
Nodes (7): graphify CLAUDE.md Integration, Watch Mode Auto-Rebuild, Node ID Format Rule, graphify claude install (Native CLAUDE.md), graphify Skill, Python Interpreter Detection, Structural (AST) Extraction

### Community 66 - "Incremental Update"
Cohesion: 0.29
Nodes (7): graphify add URL Ingest, Verbatim source_file Rule, Post-Commit Auto-Rebuild Hook, build_merge Replace-on-Re-extract, Graph Diff, Incremental Update, prune_sources Deletion Pruning

### Community 67 - "Community Detection"
Cohesion: 0.29
Nodes (7): Wiki Export, Cluster-Only Rerun, Community Detection, Community Labeling, God Nodes, GRAPH_REPORT.md Output, Knowledge Graph

### Community 68 - "Extraction Subagent Prompt"
Cohesion: 0.29
Nodes (7): Confidence Score Rubric, Hyperedges, Semantic Similarity Edges, Extraction Subagent Prompt, Image Vision Extraction Rules, EXTRACTED/INFERRED/AMBIGUOUS Audit Trail, Parallel Extraction Subagents

### Community 69 - "HomeHero.tsx"
Cohesion: 0.53
Nodes (4): HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero()

### Community 70 - "email.ts"
Cohesion: 0.50
Nodes (4): Phase DS — Design system rescue (Impeccable), Session DS0 — Install the design + motion skill stack — `done`, Session DS1 — Evaluate the detector (no install, no hooks) — `done`, Session DS2 — Fold Impeccable findings in; skills for the design gaps — `done`

### Community 71 - "HM Visuals"
Cohesion: 0.29
Nodes (6): Deployment, Getting started, HM Visuals, Stack, Verification, Working document

### Community 72 - "ensure-indexes.mjs"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 73 - "page.tsx"
Cohesion: 0.47
Nodes (5): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams

### Community 74 - "BFS Traversal"
Cohesion: 0.33
Nodes (6): MCP Server Export, BFS Traversal, Constrained Query Expansion, Fast Path Existing Graph Query, Graph Health Check, Honesty Rules

### Community 75 - "Semantic (LLM) Extraction"
Cohesion: 0.33
Nodes (6): Whisper Domain-Hint Prompt, Whisper Transcription, Extraction Cache, Gemini Extraction Backend, No API Key Required, Semantic (LLM) Extraction

### Community 76 - "import-geonames-cities.mjs"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 77 - "cloudinary-image-loader.ts"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 78 - "next.config.ts"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 79 - "frontend-design skill"
Cohesion: 0.67
Nodes (3): redesign-existing-projects skill, frontend-design LICENSE, frontend-design skill

### Community 80 - "Work Memory Self-Improving Loop"
Cohesion: 0.67
Nodes (3): LESSONS.md / reflect, save-result Feedback Loop, Work Memory Self-Improving Loop

### Community 90 - "Preloader (GSAP icon sequence"
Cohesion: 0.50
Nodes (4): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session S10 — Two security fixes — `done`, Session S8 — Two resource leaks — `done`, Session S9 — Revalidation coverage — `done`

### Community 91 - "blog posts collection +"
Cohesion: 0.67
Nodes (3): Phase 2 — Preloader & core experience (completed portion), Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done`

### Community 98 - "Session F1 — Remove"
Cohesion: 0.67
Nodes (3): Phase 3 — Content & analytics, Session C4 — Media locations: validated city + stored coordinates — `done`, Session D6 — Exhibition globe — `done`

### Community 99 - "Session F3 — Split"
Cohesion: 0.67
Nodes (3): Phase T — Tag taxonomy & discipline subpages, Session T1 — Tag taxonomy: `media_tags` + `/admin/tags` — `done`, Session T2 — `/photography/[tag]` and `/videography/[tag]` — `done`

## Knowledge Gaps
- **393 isolated node(s):** `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done``, `Session F4 — Design-rule cleanup + dead code removal — `done``, `Session F5 — Admin orchestration & data-layer consolidation — `done`` (+388 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `getDb()` to `route.ts`, `admin.ts`, `getPageSeo()`, `tag-pages.ts`, `testimonials.ts`, `asNullableString()`, `media-serializers.ts`, `page.tsx`, `AdminTagsClient.tsx`, `route.ts`, `db.ts`, `isRecord()`, `route.ts`, `useServicesAdmin.ts`, `page-sections.ts`, `Unified /admin/pages surface`, `route.ts`, `route.ts`, `page.tsx`, `page.tsx`, `public-media.ts`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `TransitionContext.tsx`, `devDependencies`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **What connects `Session F1 — Remove violations + initialize Lenis — `done``, `Session F2 — Code refactoring: extract reusable components — `done``, `Session F3 — Split large admin files — `done`` to the rest of the system?**
  _393 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055600106923282544 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `cloudinary-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09506531204644413 - nodes in this community are weakly interconnected._
- **Should `TransitionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061224489795918366 - nodes in this community are weakly interconnected._