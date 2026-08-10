# Graph Report - .  (2026-08-08)

## Corpus Check
- 2 files · ~136,667 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1675 nodes · 3657 edges · 123 communities (92 shown, 31 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.69)
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
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
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

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 108 edges
2. `noStoreJson()` - 72 edges
3. `isRecord()` - 48 edges
4. `getPageSeo()` - 40 edges
5. `HM Visuals Claude Working Document` - 35 edges
6. `requireAdminObjectId()` - 30 edges
7. `asNullableString()` - 29 edges
8. `requireAdminOr401()` - 29 edges
9. `findByIdOr404()` - 27 edges
10. `getPageSections()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Session D4 — Page transition system` --references--> `animate skill (motion spec)`  [INFERRED]
  SESSION-QUEUE.md → SESSION-ARCHIVE.md
- `AdminProtectedLayout()` --calls--> `isAdminAuthedServer()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/auth/admin.ts
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase DS run order DS0 → DS1 → DS2 → D-sessions** — session_archive_ds0_skill_stack_install, session_archive_ds1_impeccable_detector_eval, session_archive_ds2_fold_impeccable_findings, session_queue_d13_final_consistency_pass [EXTRACTED 0.90]
- **Page CMS built across N2–N7** — session_archive_n2_page_activity_toggle, session_archive_n3_seo_metadata_admin, session_archive_n4_page_header_content, session_archive_n5_section_level_cms, session_archive_page_cms_collections [EXTRACTED 0.85]
- **Phase 2a design sessions precede D4** — session_queue_d2b_homepage_design_pass, session_queue_d2c_about_page_rebuild, session_queue_d4_page_transition_system [EXTRACTED 0.85]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (123 total, 31 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (54): CardImageGroup(), CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS (+46 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (60): AdminLoginPage(), getClientAddress(), getClientKey(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, POST() (+52 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (37): downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), AppearanceBlock(), MediaFilterBar(), MediaGrid(), MediaSurface(), MediaTagChips(), SmartMediaPreviewFit (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (53): POST(), ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MANAGED_FOLDERS (+45 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (33): MediaAppearancesSection(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload(), deleteMediaItem(), fetchMediaItem() (+25 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (32): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET(), findByIdOr404() (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (33): NftMeta, buildCursorCondition(), buildQuery(), Cursor, escapeRegExp(), GET(), makeCursor(), parseCursor() (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (23): AboutPage(), generateMetadata(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata(), NftPage(), generateMetadata() (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (22): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (29): asNumberOrNull(), asString(), Appearance, getMediaLists(), NftCurrency, NftEditionType, NftStatus, normalizeCurrency() (+21 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (30): Accordion / collapse, Animation Recipes, Button press, Drag to dismiss, Drawer / sheet, Dropdown, popover, menu, select, Hold to confirm, Masking a crossfade that won't settle (+22 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (22): HomeTestimonialCard(), HomeTrust(), Avatar(), getInitials(), getIdentityLine(), renderStars(), ReviewModal(), ReviewPhotoStrip() (+14 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (19): IconButton(), InquiriesToolbar(), ArchiveIcon(), DeleteIcon(), RestoreIcon(), InquirySection(), archiveInquiry(), deleteInquiryForever() (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (24): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+16 more)

### Community 17 - "Community 17"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (15): AdminServiceCategoriesPage(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServiceStaticRow() (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 21 - "Community 21"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 22 - "Community 22"
Cohesion: 0.21
Nodes (15): PublicReviewForm(), LocationSearch(), PreviewImage(), ProfilePhotoField(), ReviewPhotosField(), StarPicker(), BannerState, LocationOption (+7 more)

### Community 23 - "Community 23"
Cohesion: 0.18
Nodes (11): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (17): asNullableString(), isRecord(), isValidObjectIdString(), parseObjectId(), ensureUniqueSlug(), GET(), POST(), slugify() (+9 more)

### Community 25 - "Community 25"
Cohesion: 0.09
Nodes (23): class-variance-authority, clsx, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist, next, next-cloudinary (+15 more)

### Community 26 - "Community 26"
Cohesion: 0.26
Nodes (18): buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel(), editionSubline(), formatStableDateTime(), getNftPublicHref() (+10 more)

### Community 27 - "Community 27"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 28 - "Community 28"
Cohesion: 0.19
Nodes (16): ContactPage(), generateMetadata(), SP, ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard() (+8 more)

### Community 29 - "Community 29"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (16): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 33 - "Community 33"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (18): Admin design (visual consistency, D9), Analytics — Plausible (Phase 3, C3), Animation stack status (Lenis, GSAP, Three.js, globe, Framer), Appearances admin — city selector needed (C4), Blog (C1, pending), Dancing page (D10, pending), Design direction — the standard (aikawakenichi, ten.375, igloo), Domain (hussain-marzooq.com on Netlify) (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.30
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.20
Nodes (14): CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getPublicIdsFromUrls(), getStringArray(), normalizeFolderPath() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.21
Nodes (12): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug(), isVideoType() (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 39 - "Community 39"
Cohesion: 0.17
Nodes (11): AdminNftsPage(), PATCH(), SLUG_TO_PATH, PATCH(), SLUG_TO_PATH, GET(), isAdminAuthedServer(), client (+3 more)

### Community 40 - "Community 40"
Cohesion: 0.18
Nodes (10): generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (12): MediaListFilterBar(), Props, formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage() (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (9): Banner, CreateServiceResponse, findCategoryById(), findOthersCategory(), isCreateServiceResponse(), AdminActionFeedback(), AdminActionFeedbackState, AdminActionFeedbackType (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (14): animate skill (motion spec), Session DS0 — Install design + motion skill stack, Session DS1 — Evaluate the Impeccable detector, Session DS2 — Fold Impeccable findings in, frontend-design skill (Anthropic), Impeccable detector (URL-only on this codebase), improve-animations skill, redesign-existing-projects skill (taste-skill) (+6 more)

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (9): generateMetadata(), HomePage(), HeroBokeh(), makeBokehTexture(), DISCIPLINE_LINKS, HomeCreativeSystem(), DISCIPLINE_ORDER, HomeHero() (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.23
Nodes (10): AdminPagesPage(), AboutSections, BlogSections, BOOKING_CTA, DancingSections, DEFAULTS, getAllPageSections(), mergeWithDefaults() (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.24
Nodes (8): getString(), isRecord(), PeopleAdminClient(), WidgetResult, TestimonialsAdminClient(), useAdminAction(), PersonItem, usePeopleAdmin()

### Community 47 - "Community 47"
Cohesion: 0.49
Nodes (9): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (7): metadata, CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 49 - "Community 49"
Cohesion: 0.20
Nodes (11): Content-Security-Policy (dev/prod aware), Session D1 — Preloader, Session D3 — Photography 3-mode viewer, Expiring signed session tokens (2-day TTL), Session F1 — Remove violations + initialize Lenis, No scroll-jacking rule, Session S1 — Finish the security migration, Session S3 — Automated test baseline (Vitest) (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (7): DISCIPLINES, GET(), BlogPage(), ServiceDetailPage(), isSectionImage(), getAllPageSettings(), readCardImage()

### Community 52 - "Community 52"
Cohesion: 0.24
Nodes (10): app/api/_lib/admin-route.ts helpers (S2b), AnimatedText.tsx (word-mode only, scroll-triggered), Code quality rules (reuse over repetition, no big files), useMediaSearch / MediaGridResults / MediaTagChips (D3), No scroll-jacking anywhere, PageHeader.tsx (no eyebrow prop), Photography viewer — Cylinder/Horizontal/Grid (D3), PortfolioCard.tsx (full-bleed image cards) (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.20
Nodes (10): Claude tooling for this project, Commit message format (type(scope): desc), File output rule (single vs multi-file changes), Gate 1 — Plan, Gate 1 security questions (trust boundary, secrets, validation), Gate 2 — Execute, Gate 3 — Commit (doc sync, two commits), graphify — knowledge graph at graphify-out/ (+2 more)

### Community 54 - "Community 54"
Cohesion: 0.24
Nodes (6): Navbar(), cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS, Preloader()

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (9): find-animation-opportunities skill, prototype skill (Emil Kowalski), review-animations skill, Page transitions — content-as-animation, Session D2b — Homepage design pass, Session D4 — Page transition system, Session D7 — NFT page redesign, Session D8 — Magnetic button effect (+1 more)

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 59 - "Community 59"
Cohesion: 0.25
Nodes (8): Current auth state (scrypt hash, HMAC session, 2-day TTL) (S1), Content-Security-Policy in next.config.ts, Empty means empty everywhere (no auto-pick), Image pipeline — Cloudinary custom loader, optimizer bypassed, npm run lint must stay at 0 errors and 0 warnings (S7), Rate limiting — lib/server/request-guards.ts, lib/auth/session-token.ts (runtime-agnostic auth constants), Testing & CI — Vitest (S3)

### Community 60 - "Community 60"
Cohesion: 0.32
Nodes (8): Design & motion skills — routing table, Design tokens (OKLCH, radius open decision, section-shell), Grain texture rule (uniform CSS noise, 3-5% opacity), Impeccable detector (deterministic anti-pattern scan), Impeccable detector — URL-only on this codebase (DS1), No decorative gradients anywhere, Skill conflicts — this project wins, always, What is NOT in the design (no scroll-jack, no gradients, grain)

### Community 61 - "Community 61"
Cohesion: 0.25
Nodes (8): MediaPickerModal + ImageField (N7), Navigation — 6-item nav (Work/About/Services/People/Testimonials/Book), Open Graph images (Phase 3, C2), Page activity toggle (isActive on 5 disciplines), Page content CMS — three collections, one admin surface, page_sections collection (per-slug section content), page_seo collection (title/desc/og + header fields), page_settings collection (visibility + cardImage)

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (8): Session N3 — SEO + page metadata admin control, Session N5 — Section-level content CMS, Session N6 — Homepage section redesign, Page CMS — page_settings / page_seo / page_sections, PortfolioCard shared component, Session S5 — page-settings PATCH partial-update fix, Session D9 — Admin visual redesign, Session D9b — Admin information architecture

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (5): client, createIndex(), ensureIndexes(), ENV_FILES, uri

### Community 65 - "Community 65"
Cohesion: 0.38
Nodes (7): Empty means empty (no auto-pick fallback), Session N1 — Minimal nav + Work overlay, Session N2 — Page activity toggle system, Session N7 — Admin-selectable card images, Session N8 — Add People + Testimonials to navbar, Session S4 — Work overlay card images empty state, Work overlay (5 discipline cards)

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (6): 1. Should this animate at all?, 2. What is the purpose?, 3. What easing should it use?, 4. How fast should it be?, Perceived performance, The Animation Decision Framework

### Community 67 - "Community 67"
Cohesion: 0.33
Nodes (6): clip-path for Animation, Comparison sliders, Hold-to-delete pattern, Image reveals on scroll, Tabs with perfect color transitions, The inset shape

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (6): CSS animations beat JS under load, CSS variables are inheritable, Framer Motion hardware acceleration caveat, Only animate transform and opacity, Performance Rules, Use WAAPI for programmatic CSS animations

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (6): Damping at boundaries, Friction instead of hard stops, Gesture and Drag Interactions, Momentum-based dismissal, Multi-touch protection, Pointer capture for drag

### Community 70 - "Community 70"
Cohesion: 0.47
Nodes (4): AdminProtectedLayout(), nav, AdminThemeToggle(), useIsMounted()

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 72 - "Community 72"
Cohesion: 0.40
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (6): app/api/_lib/admin-route.ts helpers, Session F3 — Split large admin files, Session F5 — Admin orchestration & data-layer consolidation, Session S2 — Reuse audit (+ slice S2a), Session S2b — API [id]-route boilerplate extraction, useAdminAction hook + AdminActionFeedback

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (6): Session F2 — Extract reusable components, Session F4 — Design-rule cleanup + dead code removal, Session N4 — Page header content (extend page_seo), PageHeader shared component, .section-shell container class, Session D10 — Dancing page

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (5): 3D transforms for depth, CSS Transform Mastery, scale() scales children too, transform-origin, translateY with percentages

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (5): Asymmetric enter/exit timing, Cohesion matters, Review your work the next day, The opacity + height combination, The Sonner Principles (Building Loved Components)

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (5): Interruptibility advantage, Spring Animations, Spring-based mouse interactions, Spring configuration, When to use springs

### Community 78 - "Community 78"
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 79 - "Community 79"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 80 - "Community 80"
Cohesion: 0.50
Nodes (4): Debugging Animations, Frame-by-frame inspection, Slow motion testing, Test on real devices

### Community 81 - "Community 81"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 82 - "Community 82"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (3): AppShell(), lenis, lenis

## Knowledge Gaps
- **510 isolated node(s):** `InquiryStatus`, `nav`, `SelectedPerson`, `currencies`, `NftMeta` (+505 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 6` to `Community 0`, `Community 1`, `Community 36`, `Community 37`, `Community 7`, `Community 39`, `Community 8`, `Community 10`, `Community 40`, `Community 45`, `Community 13`, `Community 16`, `Community 18`, `Community 51`, `Community 24`, `Community 26`, `Community 28`, `Community 31`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 25` to `Community 96`, `Community 97`, `Community 99`, `Community 100`, `Community 5`, `Community 102`, `Community 103`, `Community 104`, `Community 105`, `Community 106`, `Community 107`, `Community 108`, `Community 89`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `AppShell()` connect `Community 89` to `Community 48`, `Community 54`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `InquiryStatus`, `nav`, `SelectedPerson` to the rest of the system?**
  _510 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05154320987654321 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06523855890944498 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.053923541247484906 - nodes in this community are weakly interconnected._