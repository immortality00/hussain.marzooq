# Graph Report - .  (2026-08-21)

## Corpus Check
- 6 files · ~183,415 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1600 nodes · 3864 edges · 103 communities (85 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

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
- Session F4 — Design-rule
- Session S10 — Two
- Session P2 — Mobile

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
- `CustomCursor enhancements (spring/stretch/trail)` --semantically_similar_to--> `useMagneticHover magnetic button effect`  [INFERRED] [semantically similar]
  SESSION-ARCHIVE.md → SESSION-QUEUE.md
- `TagMultiSelect()` --calls--> `slugifyTag()`  [EXTRACTED]
  app/admin/(protected)/media/components/TagMultiSelect.tsx → lib/server/media-tags.ts
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts
- `AdminTagsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/tags/page.tsx → lib/server/db.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Page content CMS (3 collections, one admin surface)** — session_archive_page_activity_toggle, session_archive_page_seo, session_archive_page_sections, session_archive_admin_pages_consolidation [EXTRACTED 0.90]
- **Exhibition globe data flow (C4 → D6)** — session_archive_validated_media_locations, session_archive_appearance_shared_type, session_archive_get_exhibition_cities, session_archive_exhibition_globe [EXTRACTED 0.90]
- **Tag taxonomy + subpage system (T1 → T2)** — session_archive_media_tags_taxonomy, session_archive_tag_subpages, session_archive_tag_chip_row, session_archive_sortable_list [EXTRACTED 0.90]
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (103 total, 18 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.06
Nodes (51): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem() (+43 more)

### Community 1 - "page.tsx"
Cohesion: 0.07
Nodes (38): MediaListFilterBar(), Props, formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage() (+30 more)

### Community 2 - "cloudinary-assets.ts"
Cohesion: 0.10
Nodes (46): POST(), CLOUDINARY_MANAGED_FOLDERS, CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP, CLOUDINARY_MEDIA_CATEGORY_FOLDERS, CloudinaryMediaCategory, getCloudinaryMediaFoldersForCategories(), isCloudinaryMediaCategory(), CloudinaryCleanupResult (+38 more)

### Community 3 - "TransitionContext.tsx"
Cohesion: 0.06
Nodes (34): metadata, AppShell(), CustomCursor(), stepSpring(), stretchFor(), Navbar(), cormorant, FlashItem (+26 more)

### Community 4 - "HM Visuals — Claude"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 5 - "getDb()"
Cohesion: 0.16
Nodes (35): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), findByIdOr404(), IdRouteContext (+27 more)

### Community 6 - "dependencies"
Cohesion: 0.04
Nodes (45): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+37 more)

### Community 7 - "devDependencies"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 8 - "cn()"
Cohesion: 0.09
Nodes (24): BaseProps, Button(), buttonClasses(), ButtonProps, ButtonVariant, VARIANT, Button(), buttonVariants (+16 more)

### Community 9 - "route.ts"
Cohesion: 0.13
Nodes (32): asFiniteLatitude(), asFiniteLongitude(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType, NftStatus, normalizeCurrency() (+24 more)

### Community 10 - "admin.ts"
Cohesion: 0.11
Nodes (25): AdminProtectedLayout(), nav, PATCH(), SLUG_TO_PATH, AdminThemeToggle(), useIsMounted(), createAdminSessionCookies(), hmacHex() (+17 more)

### Community 11 - "getPageSeo()"
Cohesion: 0.15
Nodes (23): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage() (+15 more)

### Community 12 - "tag-pages.ts"
Cohesion: 0.13
Nodes (27): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyPage(), generateMetadata(), VideographyTagPage(), buildPublicMediaQuery(), TagDiscipline (+19 more)

### Community 13 - "testimonials.ts"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+14 more)

### Community 14 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "page.tsx"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 16 - "asNullableString()"
Cohesion: 0.18
Nodes (23): POST(), asNullableString(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), POST(), GET() (+15 more)

### Community 17 - "media-serializers.ts"
Cohesion: 0.12
Nodes (27): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+19 more)

### Community 18 - "page.tsx"
Cohesion: 0.15
Nodes (21): ContactPage(), generateMetadata(), SP, generateMetadata(), HomePage(), generateMetadata(), ServicesPage(), ContactForm() (+13 more)

### Community 19 - "AdminTagsClient.tsx"
Cohesion: 0.16
Nodes (16): TagMultiSelect(), TagOption, AdminTagsClient(), EMPTY_DRAFT, TagFormCard(), TagsTable(), TagsToolbar(), createTagRequest() (+8 more)

### Community 20 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.15
Nodes (16): CategoriesToolbar(), CategoryFormCard(), CategoryRow(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category (+8 more)

### Community 21 - "ContactForm.tsx"
Cohesion: 0.18
Nodes (14): ContactActions(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode, useContactFormState() (+6 more)

### Community 22 - "route.ts"
Cohesion: 0.17
Nodes (21): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate(), isPrivateGalleryExpired() (+13 more)

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
Cohesion: 0.19
Nodes (13): CardsCtaForm(), SLUG_LABELS, getString(), ImageField(), isRecord(), TextAreaField(), TextField(), RepeatingCardListEditor() (+5 more)

### Community 27 - "isRecord()"
Cohesion: 0.21
Nodes (17): GET(), asNumberOrNull(), isRecord(), isValidObjectIdString(), parseObjectId(), ensureUniqueSlug(), GET(), POST() (+9 more)

### Community 28 - "route.ts"
Cohesion: 0.29
Nodes (18): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+10 more)

### Community 29 - "AdminActionFeedback.tsx"
Cohesion: 0.23
Nodes (13): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+5 more)

### Community 30 - "page-settings.ts"
Cohesion: 0.17
Nodes (15): DISCIPLINES, GET(), BlogPage(), PersonDetailPage(), ServiceDetailPage(), generateMetadata(), renderStars(), TestimonialsPage() (+7 more)

### Community 31 - "PageRowCard.tsx"
Cohesion: 0.17
Nodes (12): CardImageGroup(), CardImageWarning(), GroupCard(), GroupTint, ICON_TINTS, TINTS, PageRowCard(), SectionsData (+4 more)

### Community 32 - "useServicesAdmin.ts"
Cohesion: 0.23
Nodes (14): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+6 more)

### Community 33 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 34 - "page-sections.ts"
Cohesion: 0.15
Nodes (14): AdminPagesPage(), DISCIPLINE_LINKS, HomeCreativeSystem(), AboutSections, BlogSections, BOOKING_CTA, CtaOnlySections, DancingSections (+6 more)

### Community 35 - "location-search.ts"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 36 - "AdminServicesClient.tsx"
Cohesion: 0.24
Nodes (10): AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServicesToolbar(), Service (+2 more)

### Community 37 - "Unified /admin/pages surface"
Cohesion: 0.16
Nodes (16): Unified /admin/pages surface, Empty means empty (no auto-pick), Page activity toggle (page_settings), page_sections collection (section content CMS), SectionImage admin pick/upload system, Session N1 — Minimal nav + Work overlay, Session N2 — Page activity toggle system, Session N5 — Section-level content CMS (+8 more)

### Community 38 - "useAdminAction()"
Cohesion: 0.19
Nodes (9): getString(), isRecord(), PeopleAdminClient(), WidgetResult, TestimonialsAdminClient(), AdminActionFeedbackState, useAdminAction(), PersonItem (+1 more)

### Community 39 - "Session T1 — Tag"
Cohesion: 0.15
Nodes (15): admin-route.ts [id]-route helpers, media_tags tag taxonomy, Session F5 — Admin orchestration consolidation, Session S11 — Admin stop losing work, Session S2 — Reuse audit, Session S2b — API [id]-route boilerplate extraction, Session T1 — Tag taxonomy media_tags + /admin/tags, Session T2 — Photography/Videography tag subpages (+7 more)

### Community 40 - "PhotographyViewer.tsx"
Cohesion: 0.22
Nodes (9): MediaFilterBar(), MediaTagChips(), TagChip, TagChipRow(), MODES, ModeSwitcher(), ViewerMode, PhotographyCylinder (+1 more)

### Community 41 - "usePagesAdmin.ts"
Cohesion: 0.24
Nodes (9): EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow, SettingsDraft, usePagesAdmin(), useUnsavedChangesGuard(), PageSeo (+1 more)

### Community 42 - "AppShell global-chrome consolidation"
Cohesion: 0.15
Nodes (13): Achromatic NFT status badges, AppShell global-chrome consolidation, Two-look Button system (ghost/solid), CustomCursor enhancements (spring/stretch/trail), NFT hover-flip collector card, Session D5 — Cursor enhancements, Session D7 — NFT page redesign, Session N9 — Stop public chrome on admin (+5 more)

### Community 43 - "route.ts"
Cohesion: 0.29
Nodes (9): PATCH(), SLUG_TO_PATH, PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), resolveOptionalCardImage(), ALL_PAGE_SECTIONS_SLUGS, PageSectionsSlug (+1 more)

### Community 44 - "route.ts"
Cohesion: 0.33
Nodes (9): GET(), POST(), serializeTag(), tagCounts(), isReservedTagSlug(), isValidTagSlug(), RESERVED_TAG_SLUGS, slugifyTag() (+1 more)

### Community 45 - "page.tsx"
Cohesion: 0.21
Nodes (7): PrivateGalleryPage(), generateMetadata(), PhotographyPage(), PortfolioFallbackPanel(), PortfolioFallbackPanelItem, PortfolioFallbackPanelLink, getPhotographyItems()

### Community 46 - "Session D2b — Homepage"
Cohesion: 0.23
Nodes (12): AboutDisciplineCard + About rebuild, Measured design-language census (CLAUDE.md spec), No eyebrows/kickers rule, Impeccable detector (URL-only eval), Design + motion skill stack, Section system (hairline + single rhythm), Session D2b — Homepage section pass, Session D2c — About page rebuild (+4 more)

### Community 47 - "Content-Security-Policy in next.config"
Cohesion: 0.20
Nodes (12): Content-Security-Policy in next.config, No scroll-jacking rule, Session D3 — Photography 3-mode viewer, Session L1 — Launch prep checklist, Session S1 — Finish security migration, Session S3 — Automated test baseline, Session S6 — Remove unoptimized from testimonial images, Session S7 — Resolve eslint exhaustive-deps warnings (+4 more)

### Community 48 - "page.tsx"
Cohesion: 0.31
Nodes (9): generateMetadata(), PeoplePage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType(), normalizeStringArray(), PublicPersonDetail (+1 more)

### Community 49 - "types.ts"
Cohesion: 0.35
Nodes (3): MediaSurface(), MediaItem, TagLink

### Community 50 - "MediaDetailsSections.tsx"
Cohesion: 0.27
Nodes (5): AppearanceBlock(), formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 51 - "page seo collection (SEO"
Cohesion: 0.24
Nodes (11): PageHeader shared component, page_seo collection (SEO + on-page header), PortfolioCard shared component, Session F2 — Extract reusable components, Session N3 — SEO + page metadata admin, Session N4 — Page header content (extend page_seo), Page-transition engine + contact-sheet transition, Session C2 — Open Graph images (+3 more)

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
Cohesion: 0.24
Nodes (10): Shared Appearance type, Exhibition globe (react-globe.gl), getExhibitionCities aggregation, Photography 3-view viewer (Cylinder/Horizontal/Grid), Session C4 — Validated media locations + coordinates, Session D6 — Exhibition globe, Validated media locations + stored coordinates, People page privacy + removal-request system (+2 more)

### Community 57 - "ExhibitionGlobe.tsx"
Cohesion: 0.33
Nodes (8): buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW, isDubai(), markerSize()

### Community 58 - "SectionsGroup.tsx"
Cohesion: 0.29
Nodes (6): CtaOnlyForm(), HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS, SectionsGroup(), PageSectionsMap

### Community 59 - "page.tsx"
Cohesion: 0.43
Nodes (5): AdminServiceCategoriesClient(), AdminServiceCategoriesPage(), AdminServicesPage(), safeNumber(), ensureOthersCategory()

### Community 60 - "public-media.ts"
Cohesion: 0.50
Nodes (4): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, ExhibitionCity

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
Cohesion: 0.52
Nodes (6): ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp()

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
Cohesion: 0.43
Nodes (5): HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero(), SectionImage

### Community 70 - "email.ts"
Cohesion: 0.48
Nodes (4): resend, sendInquiryNotification(), sendTestimonialNotification(), escapeHtml()

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

## Knowledge Gaps
- **357 isolated node(s):** `PortfolioCardProps`, `Who this is for`, `The site`, `Domain & deployment status`, `Stack` (+352 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `getDb()` to `route.ts`, `admin.ts`, `getPageSeo()`, `tag-pages.ts`, `testimonials.ts`, `asNullableString()`, `media-serializers.ts`, `page.tsx`, `AdminTagsClient.tsx`, `route.ts`, `db.ts`, `isRecord()`, `route.ts`, `page-settings.ts`, `page-sections.ts`, `location-search.ts`, `route.ts`, `route.ts`, `page.tsx`, `page.tsx`, `public-media.ts`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `TransitionContext.tsx`, `devDependencies`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **What connects `PortfolioCardProps`, `Who this is for`, `The site` to the rest of the system?**
  _357 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06329113924050633 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06704260651629072 - nodes in this community are weakly interconnected._
- **Should `cloudinary-assets.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09502262443438914 - nodes in this community are weakly interconnected._
- **Should `TransitionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.061224489795918366 - nodes in this community are weakly interconnected._