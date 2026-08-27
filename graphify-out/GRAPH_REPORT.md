# Graph Report - hussain.marzooq  (2026-08-27)

## Corpus Check
- 349 files · ~189,915 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1936 nodes · 4014 edges · 220 communities (115 shown, 105 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d433cc0`
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
- layout.tsx
- page.tsx
- page.tsx
- eslint.config.mjs
- get-base-url.ts
- postcss.config.mjs
- File Document Icon
- Next.js Logo (starter boilerplate)
- Preloader (GSAP icon sequence
- blog posts collection +
- server-modules.test.ts
- Globe earth-topology bump map
- Globe Icon
- Session F1 — Remove
- clip-path for Animation
- Performance Rules
- Gesture and Drag Interactions
- graphify reference: query, path, explain
- CSS Transform Mastery
- The Sonner Principles (Building Loved Components)
- Spring Animations
- Core Philosophy
- Debugging Animations
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- Phase 2a — Design direction (ran before D4)
- CLAUDE.md
- extraction-spec.md
- clsx
- @dnd-kit/sortable
- gsap
- lucide-react
- mongodb
- next-cloudinary
- react
- react-globe.gl
- tailwind-merge
- three
- animation-vocabulary skill
- apple-design skill
- Spring interruptibility and velocity handoff
- emil-design-eng skill
- Emil Kowalski animation philosophy
- find-animation-opportunities skill
- Animation Audit Playbook (AUDIT.md)
- improve-animations Plan Template
- improve-animations skill
- pick-ui-library skill
- Prototype Picker harness spec
- prototype skill
- review-animations skill
- Animation Standards Reference (STANDARDS.md)
- Strong custom easing curve tokens
- Never ease-in on UI
- Frequency-appropriate motion rule
- GPU-only: transform and opacity
- prefers-reduced-motion accessibility
- Never scale(0) entrance
- Origin-aware transform-origin
- frontend-design LICENSE
- frontend-design skill
- graphify CLAUDE.md Integration
- Watch Mode Auto-Rebuild
- Neo4j Cypher Export
- Hyperedges
- Node ID Format Rule
- Semantic Similarity Edges
- Verbatim source_file Rule
- Extraction Subagent Prompt
- Image Vision Extraction Rules
- Cross-Repo Graph Merge
- GitHub Repo Clone
- graphify claude install (Native CLAUDE.md)
- Post-Commit Auto-Rebuild Hook
- BFS Traversal
- graphify explain (Node Explanation)
- NetworkX Inline Traversal Fallback
- graphify path (Shortest Path)
- Constrained Query Expansion
- save-result Feedback Loop
- Work Memory Self-Improving Loop
- Whisper Transcription
- build_merge Replace-on-Re-extract
- Cluster-Only Rerun
- Graph Diff
- Incremental Update
- prune_sources Deletion Pruning
- EXTRACTED/INFERRED/AMBIGUOUS Audit Trail
- Community Detection
- Community Labeling
- Extraction Cache
- Fast Path Existing Graph Query
- Gemini Extraction Backend
- God Nodes
- Graph Health Check
- graph.json Output
- GRAPH_REPORT.md Output
- HTML Visualization Export
- Python Interpreter Detection
- Knowledge Graph
- No API Key Required
- Parallel Extraction Subagents
- Semantic (LLM) Extraction
- Shrink Guard
- Structural (AST) Extraction
- layout.tsx
- Preloader.tsx
- CustomCursor.tsx
- page-settings.ts
- page-sections-shared.ts
- page.tsx
- PrivateGalleriesAdminClient.tsx
- AdminPageHeader.tsx
- GroupCard.tsx
- cloudinary-folders.ts
- page.tsx
- MediaListItem.tsx
- RepeatingListEditor.tsx
- helpers.ts
- layout.tsx
- AdminThemeToggle.tsx
- GalleryFormFields.tsx
- Phase T — Tag taxonomy & discipline subpages
- cloudinary

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 119 edges
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
- `TagMultiSelect()` --calls--> `slugifyTag()`  [EXTRACTED]
  app/admin/(protected)/media/components/TagMultiSelect.tsx → lib/server/media-tags.ts
- `AdminTagsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/tags/page.tsx → lib/server/db.ts
- `GET()` --indirect_call--> `serializePrivateGalleryAdminItem()`  [INFERRED]
  app/api/private-galleries/route.ts → lib/server/private-gallery-admin.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Extraction Pipeline** — claude_skills_graphify_skill_structural_extraction, claude_skills_graphify_skill_semantic_extraction, claude_skills_graphify_skill_parallel_subagents, claude_skills_graphify_skill_extraction_cache [EXTRACTED 0.90]
- **graphify Export Targets** — claude_skills_graphify_references_exports_neo4j_export, claude_skills_graphify_references_exports_falkordb_export, claude_skills_graphify_references_exports_mcp_server, claude_skills_graphify_references_exports_wiki_export [EXTRACTED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]

## Communities (220 total, 105 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.06
Nodes (50): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem() (+42 more)

### Community 1 - "page.tsx"
Cohesion: 0.25
Nodes (11): createSessionValue(), isSessionValueFresh(), isWithinTtl(), parseIssuedAt(), safeEqual(), config, isAdminAuthed(), isPublicAdminRoute() (+3 more)

### Community 2 - "cloudinary-assets.ts"
Cohesion: 0.27
Nodes (5): AppearanceBlock(), formatDates(), formatMonthYear(), formatPlace(), MONTH_NAMES

### Community 3 - "TransitionContext.tsx"
Cohesion: 0.08
Nodes (25): class-variance-authority, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, @gsap/react, next (+17 more)

### Community 4 - "HM Visuals — Claude"
Cohesion: 0.22
Nodes (13): MediaPickerModal(), buildMediaQuery(), MediaListResponse, mediaMetaText(), mergeMediaItems(), PrivateGalleryMediaCard(), PrivateGalleryMediaCardProps, PrivateGalleryMediaPicker() (+5 more)

### Community 5 - "getDb()"
Cohesion: 0.11
Nodes (41): asBooleanOrNull(), asNumberOrNull(), asString(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType, NftStatus (+33 more)

### Community 6 - "dependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @tsconfig/recommended (+17 more)

### Community 7 - "devDependencies"
Cohesion: 0.17
Nodes (22): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), findByIdOr404(), IdRouteContext (+14 more)

### Community 8 - "cn()"
Cohesion: 0.20
Nodes (9): AdminServiceCategoriesClient(), CategoriesTable(), CategoriesToolbar(), AdminTagsClient(), EMPTY_DRAFT, TagsTable(), runBulkAction(), useAdminAction() (+1 more)

### Community 9 - "route.ts"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip(), SafeImage() (+14 more)

### Community 10 - "admin.ts"
Cohesion: 0.07
Nodes (44): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+36 more)

### Community 11 - "getPageSeo()"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 12 - "tag-pages.ts"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 13 - "testimonials.ts"
Cohesion: 0.17
Nodes (7): patchInquiry(), restoreInquiry(), ApiInquiriesResponse, Banner, Inquiry, InquiryStatus, STATUSES

### Community 14 - "compilerOptions"
Cohesion: 0.23
Nodes (4): AdminServicesClient(), ServiceSimpleSection(), BulkCheckbox(), useServicesAdmin()

### Community 15 - "page.tsx"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 16 - "asNullableString()"
Cohesion: 0.11
Nodes (40): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+32 more)

### Community 17 - "media-serializers.ts"
Cohesion: 0.11
Nodes (38): asStringArray(), buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PATCH(), POST(), PrivateGalleryPage() (+30 more)

### Community 18 - "page.tsx"
Cohesion: 0.16
Nodes (21): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyTagPage(), PublicMediaItem, TagDiscipline, getPageSettings(), getMediaByTag() (+13 more)

### Community 19 - "AdminTagsClient.tsx"
Cohesion: 0.17
Nodes (7): TagMultiSelect(), TagOption, createTagRequest(), NewTag, Tag, TagPatch, AdminTagsPage()

### Community 20 - "AdminServiceCategoriesClient.tsx"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 21 - "ContactForm.tsx"
Cohesion: 0.12
Nodes (27): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+19 more)

### Community 22 - "route.ts"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 23 - "lib.ts"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 24 - "Animation Standards Reference (STANDARDS.md)"
Cohesion: 0.08
Nodes (35): AdminServiceCategoriesPage(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, archiveService(), createService(), deleteServiceForever() (+27 more)

### Community 25 - "db.ts"
Cohesion: 0.17
Nodes (14): PageEditorBody(), SectionsData, VisibilityGroup(), PAGE_ROWS, pageGroup, PageRow, GROUPS, PagesAdminClient() (+6 more)

### Community 26 - "page-sections-shared.ts"
Cohesion: 0.18
Nodes (17): asFiniteLatitude(), asFiniteLongitude(), asFiniteNumber(), CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), DELETE(), deleteAssetsByPublicIds() (+9 more)

### Community 27 - "isRecord()"
Cohesion: 0.15
Nodes (13): MediaFilterBar(), MediaTagChips(), TagChip, TagChipRow(), StatusFilter, TABS, MODES, ModeSwitcher() (+5 more)

### Community 28 - "route.ts"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 29 - "AdminActionFeedback.tsx"
Cohesion: 0.29
Nodes (9): generateMetadata(), PhotographyPage(), generateMetadata(), VideographyPage(), getPhotographyItems(), getShowreelItem(), getVideographyItems(), listPublicMedia() (+1 more)

### Community 30 - "page-settings.ts"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 31 - "PageRowCard.tsx"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 33 - "components.json"
Cohesion: 0.04
Nodes (48): About page — rebuilt (D2c, shipped 2026-08-18), Admin design, Analytics, Animation stack status, Blog (C1, pending), Claude tooling for this project, Code quality rules, Commit message format (+40 more)

### Community 34 - "page-sections.ts"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 35 - "location-search.ts"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 36 - "AdminServicesClient.tsx"
Cohesion: 0.19
Nodes (25): GET(), isRecord(), normalizeSlug(), noStoreJson(), parseObjectId(), ensureUniqueSlug(), GET(), POST() (+17 more)

### Community 37 - "Unified /admin/pages surface"
Cohesion: 0.30
Nodes (7): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, cloudinaryImageLoader(), hasTransform(), LoaderArgs, ExhibitionCity

### Community 38 - "useAdminAction()"
Cohesion: 0.20
Nodes (9): allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, name, overrides, postcss, private (+1 more)

### Community 39 - "Session T1 — Tag"
Cohesion: 0.22
Nodes (9): scripts, build, db:indexes, dev, lint, start, test, test:watch (+1 more)

### Community 40 - "PhotographyViewer.tsx"
Cohesion: 0.21
Nodes (12): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType() (+4 more)

### Community 41 - "usePagesAdmin.ts"
Cohesion: 0.15
Nodes (19): ContactPage(), generateMetadata(), ServicesPage(), ServiceDetailPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard() (+11 more)

### Community 42 - "AppShell global-chrome consolidation"
Cohesion: 0.33
Nodes (8): buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW, isDubai(), markerSize()

### Community 43 - "route.ts"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 44 - "route.ts"
Cohesion: 0.19
Nodes (13): PATCH(), SLUG_TO_PATH, PATCH(), SLUG_TO_PATH, createAdminSessionCookies(), hmacHex(), isAdminAuthedServer(), isAdminPasswordConfigured() (+5 more)

### Community 45 - "page.tsx"
Cohesion: 0.14
Nodes (28): POST(), asNullableString(), isValidObjectIdString(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), POST() (+20 more)

### Community 46 - "Session D2b — Homepage"
Cohesion: 0.28
Nodes (12): DELETE(), PATCH(), revalidateTagSurfaces(), GET(), POST(), serializeTag(), tagCounts(), isReservedTagSlug() (+4 more)

### Community 47 - "Content-Security-Policy in next.config"
Cohesion: 0.36
Nodes (5): getString(), isRecord(), PeopleAdminClient(), WidgetResult, usePeopleAdmin()

### Community 48 - "page.tsx"
Cohesion: 0.36
Nodes (6): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), MediaGrid(), useModalNavbarLock(), PhotographyViewer(), PrivateGalleryBrowser()

### Community 49 - "types.ts"
Cohesion: 0.67
Nodes (3): Phase 2 — Preloader & core experience (completed portion), Session D1 — Preloader — `done`, Session D3 — Photography page: 3-mode viewer — `done`

### Community 50 - "MediaDetailsSections.tsx"
Cohesion: 0.08
Nodes (30): metadata, RootLayout(), AppShell(), CustomCursor(), stepSpring(), stretchFor(), cormorant, FlashItem (+22 more)

### Community 52 - "check job"
Cohesion: 0.21
Nodes (7): MediaSurface(), MediaItem, TagLink, localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch()

### Community 53 - "graph.json Output"
Cohesion: 0.18
Nodes (11): InquiriesToolbar(), AdminInquiriesPage(), AdminMediaListPage(), AdminMediaListResponse, buildAdminMediaUrl(), getErrorMessage(), LoadMode, TestimonialsAdminClient() (+3 more)

### Community 54 - "SmartMediaPreview.tsx"
Cohesion: 0.16
Nodes (13): CardsCtaForm(), CtaOnlyForm(), HomeSectionsForm(), AnySections, CTA_ONLY_SLUGS, SectionsGroup(), TextAreaField(), TextField() (+5 more)

### Community 55 - "lib.ts"
Cohesion: 0.08
Nodes (25): Completed so far — full specs + outcomes in SESSION-ARCHIVE.md, Gaps awaiting a decision from Hussain, HM Visuals — Session Queue, How to use, Minimum to go live, Phase 2 — Preloader & core experience, Phase 2a — Design direction (runs before D4), Phase 3 — Content & analytics (+17 more)

### Community 56 - "Session D6 — Exhibition"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 57 - "ExhibitionGlobe.tsx"
Cohesion: 0.27
Nodes (10): check job, lint (eslint), Node.js 22, npm ci (install), pull_request trigger, push trigger: master branch, push trigger: v2-portfolio branch, test (vitest) (+2 more)

### Community 58 - "SectionsGroup.tsx"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 59 - "page.tsx"
Cohesion: 0.13
Nodes (26): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), BlogPage(), generateMetadata(), generateMetadata(), SP, DancingPage() (+18 more)

### Community 60 - "public-media.ts"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 61 - "useModalNavbarLock()"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 62 - "HomeFeaturedWork.tsx"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 63 - "useMediaSearch.ts"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 64 - "route.ts"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 65 - "graphify Skill"
Cohesion: 0.20
Nodes (9): HM Visuals — Session Archive, Phase 2a — Design direction (ran before D4), Phase 3 — Content & analytics, Phase S — Security & hardening, Session C4 — Media locations: validated city + stored coordinates — `done`, Session D2b — Homepage section pass — `done`, Session D2c — About page rebuild — `done`, Session D6 — Exhibition globe — `done` (+1 more)

### Community 66 - "Incremental Update"
Cohesion: 0.19
Nodes (9): CardImageWarning(), SLUG_LABELS, getString(), ImageField(), isRecord(), CTA_LABELS, HomeFeaturedWork(), FeaturedCard (+1 more)

### Community 67 - "Community Detection"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 68 - "Extraction Subagent Prompt"
Cohesion: 0.09
Nodes (24): generateMetadata(), HomePage(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), HomeExhibitionGlobe(), DISCIPLINE_ORDER (+16 more)

### Community 69 - "HomeHero.tsx"
Cohesion: 0.29
Nodes (6): Deployment, Getting started, HM Visuals, Stack, Verification, Working document

### Community 70 - "email.ts"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 71 - "HM Visuals"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 72 - "ensure-indexes.mjs"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 73 - "page.tsx"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 74 - "BFS Traversal"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 75 - "Semantic (LLM) Extraction"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 78 - "next.config.ts"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 79 - "frontend-design skill"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 80 - "Work Memory Self-Improving Loop"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 82 - "layout.tsx"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 83 - "page.tsx"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 84 - "page.tsx"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 85 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 86 - "get-base-url.ts"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 87 - "postcss.config.mjs"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 89 - "Next.js Logo (starter boilerplate)"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 186 - "HTML Visualization Export"
Cohesion: 0.22
Nodes (9): Phase 1 — Navigation & global systems, Session N1 — Minimal nav + Work overlay — `done`, Session N2 — Page activity toggle system — `done`, Session N3 — SEO + page metadata admin control — `done`, Session N4 — Page header content (extend page_seo) — `done`, Session N5 — Section-level content CMS (homepage + interim pages) — `done`, Session N6 — Homepage section redesign — `done`, Session N7 — Admin-selectable card images (Work overlay + Featured Work) — `done` (+1 more)

### Community 189 - "No API Key Required"
Cohesion: 0.25
Nodes (8): Phase S — Security & hardening, Session S1 — Finish the security migration — `done`, Session S2 — Reuse audit against the real code rule — `done` (audit + slice S2a), Session S2b — API `[id]`-route boilerplate extraction — `done`, Session S3 — Automated test baseline — `done`, Session S4 — Work overlay card images: decide the empty state — `done`, Session S6 — Remove `unoptimized` from testimonial images — `done`, Session S7 — Resolve remaining eslint `exhaustive-deps` warnings — `done`

### Community 190 - "Parallel Extraction Subagents"
Cohesion: 0.25
Nodes (8): Phase 4 — People & launch prep, Session D4 — Page transition system — `done` (complete 2026-08-27), Session D4 — Page transition system (engine + homepage shipped 2026-08-20), Session D5 — Cursor enhancements — `done` (2026-08-20), Session D7 — NFT page redesign — `done` (2026-08-21), Session D8 — Magnetic button effect — `done` (2026-08-27), Session D9b — Admin information architecture — `done`, Session L1 — Launch prep checklist — `done` (2026-08-20)

### Community 191 - "Semantic (LLM) Extraction"
Cohesion: 0.33
Nodes (6): Phase 0 — Foundation (must complete before any design session), Session F1 — Remove violations + initialize Lenis — `done`, Session F2 — Code refactoring: extract reusable components — `done`, Session F3 — Split large admin files — `done`, Session F4 — Design-rule cleanup + dead code removal — `done`, Session F5 — Admin orchestration & data-layer consolidation — `done`

### Community 192 - "Shrink Guard"
Cohesion: 0.50
Nodes (4): Phase DS — Design system rescue (Impeccable), Session DS0 — Install the design + motion skill stack — `done`, Session DS1 — Evaluate the detector (no install, no hooks) — `done`, Session DS2 — Fold Impeccable findings in; skills for the design gaps — `done`

### Community 193 - "Structural (AST) Extraction"
Cohesion: 0.50
Nodes (4): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session S10 — Two security fixes — `done`, Session S8 — Two resource leaks — `done`, Session S9 — Revalidation coverage — `done`

### Community 194 - "layout.tsx"
Cohesion: 0.19
Nodes (10): Navbar(), StickyCta(), DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay(), magneticOffset() (+2 more)

### Community 195 - "Preloader.tsx"
Cohesion: 0.67
Nodes (3): Phase S2 — Defects from the 2026-08-17 full-repo audit, Session N9 — Stop public chrome rendering on admin — `done` (2026-08-19), Session S11 — Admin: stop losing work — `done` (2026-08-19)

### Community 197 - "page-settings.ts"
Cohesion: 0.25
Nodes (10): AdminPagesPage(), DISCIPLINES, GET(), renderStars(), TestimonialsPage(), isSectionImage(), getAllPageSeo(), getAllPageSettings() (+2 more)

### Community 198 - "page-sections-shared.ts"
Cohesion: 0.36
Nodes (7): PATCH(), VALID_SLUGS, collectSectionImagePublicIds(), EMPTY_SECTION_IMAGE, FEATURED_CARD_SLUGS, resolveOptionalCardImage(), deleteReplacedSectionImages()

### Community 199 - "page.tsx"
Cohesion: 0.27
Nodes (6): AdminDashboard(), CATEGORY_ICONS, pageNeedsImage(), AdminDashboardStats, getAdminDashboardStats(), MEDIA_CATEGORY_LABELS

### Community 200 - "PrivateGalleriesAdminClient.tsx"
Cohesion: 0.31
Nodes (4): PrivateGalleriesAdminClient(), GalleryList(), GalleryListProps, usePrivateGalleriesAdmin()

### Community 201 - "AdminPageHeader.tsx"
Cohesion: 0.36
Nodes (3): ServicesToolbar(), TagsToolbar(), AdminPageHeader()

### Community 202 - "GroupCard.tsx"
Cohesion: 0.29
Nodes (5): GroupCard(), GroupTint, ICON_TINTS, TINTS, SeoDraft

### Community 203 - "cloudinary-folders.ts"
Cohesion: 0.38
Nodes (6): CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP, CLOUDINARY_MEDIA_CATEGORY_FOLDERS, CloudinaryMediaCategory, getCloudinaryMediaFolderForCategory(), getCloudinaryMediaFoldersForCategories(), isCloudinaryMediaCategory()

### Community 204 - "page.tsx"
Cohesion: 0.47
Nodes (5): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams

### Community 205 - "MediaListItem.tsx"
Cohesion: 0.47
Nodes (5): formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses()

### Community 206 - "RepeatingListEditor.tsx"
Cohesion: 0.53
Nodes (4): RepeatingListEditor(), SortableRow(), SortableList(), useSortableRow()

### Community 207 - "helpers.ts"
Cohesion: 0.50
Nodes (3): getGalleryStatus(), parseLocalDateTime(), GalleryItem

### Community 214 - "Phase T — Tag taxonomy & discipline subpages"
Cohesion: 0.67
Nodes (3): Phase T — Tag taxonomy & discipline subpages, Session T1 — Tag taxonomy: `media_tags` + `/admin/tags` — `done`, Session T2 — `/photography/[tag]` and `/videography/[tag]` — `done`

## Knowledge Gaps
- **686 isolated node(s):** `Who this is for`, `The site`, `Domain & deployment status`, `Stack`, `Image pipeline — Next's optimizer is bypassed (2026-07-31)` (+681 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **105 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `AdminServicesClient.tsx` to `getDb()`, `devDependencies`, `route.ts`, `media-serializers.ts`, `page.tsx`, `AdminTagsClient.tsx`, `ContactForm.tsx`, `Animation Standards Reference (STANDARDS.md)`, `page-sections-shared.ts`, `AdminActionFeedback.tsx`, `Unified /admin/pages surface`, `PhotographyViewer.tsx`, `usePagesAdmin.ts`, `route.ts`, `page.tsx`, `Session D2b — Homepage`, `Session D6 — Exhibition`, `page.tsx`, `Extraction Subagent Prompt`, `page-settings.ts`, `page-sections-shared.ts`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `dependencies` connect `TransitionContext.tsx` to `CustomCursor.tsx`, `useAdminAction()`, `import-geonames-cities.mjs`, `cloudinary-image-loader.ts`, `generate-admin-password-hash.mjs`, `MediaDetailsSections.tsx`, `page seo collection (SEO`, `File Document Icon`, `GRAPH_REPORT.md Output`, `cloudinary`, `Python Interpreter Detection`, `Knowledge Graph`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `Who this is for`, `The site`, `Domain & deployment status` to the rest of the system?**
  _686 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061938061938061936 - nodes in this community are weakly interconnected._
- **Should `TransitionContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `getDb()` be split into smaller, more focused modules?**
  _Cohesion score 0.1096938775510204 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._