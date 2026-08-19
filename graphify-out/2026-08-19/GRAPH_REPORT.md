# Graph Report - .  (2026-08-19)

## Corpus Check
- 38 files · ~178,771 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1742 nodes · 3667 edges · 119 communities (98 shown, 21 thin omitted)
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
- Community 93
- Community 94
- Community 101
- Community 102
- Community 103
- Community 104
- Community 106
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

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 94 edges
2. `noStoreJson()` - 66 edges
3. `isRecord()` - 44 edges
4. `getPageSeo()` - 42 edges
5. `requireAdminOr401()` - 27 edges
6. `requireAdminObjectId()` - 26 edges
7. `asNullableString()` - 25 edges
8. `cn()` - 25 edges
9. `findByIdOr404()` - 23 edges
10. `getAllPageSettings()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `NftModal()` --indirect_call--> `appearance()`  [INFERRED]
  components/nft/NftModal.tsx → test/admin/appearance-validation.test.ts
- `AdminNftsPage()` --calls--> `getDb()`  [EXTRACTED]
  app/admin/(protected)/nfts/page.tsx → lib/server/db.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/contact/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/page.tsx → lib/server/page-seo.ts
- `generateMetadata()` --calls--> `getPageSeo()`  [EXTRACTED]
  app/people/page.tsx → lib/server/page-seo.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **D2b homepage design system** — session_archive_d2b, claude_button_system, claude_section_system, claude_style_census, claude_button_component [EXTRACTED 0.85]
- **Tag taxonomy + subpages system** — session_archive_t1, session_archive_t2, claude_tag_taxonomy, claude_discipline_subpages, claude_tagchiprow, claude_sortablelist [EXTRACTED 0.85]
- **Auth + CSP security hardening** — session_archive_s1, claude_auth_system, claude_csp, claude_session_token, claude_security_rules [EXTRACTED 0.85]
- **Next.js Starter Template Boilerplate Logos** — public_next_logo, public_vercel_logo [INFERRED 0.85]
- **Next.js Starter Template UI Icons** — public_file_icon, public_globe_icon, public_window_icon [INFERRED 0.75]

## Communities (119 total, 21 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (54): appearanceLocation(), MediaAppearancesSection(), splitLocationLabel(), MediaAssetSection(), MediaDetailsSection(), SelectedPerson, currencies, buildMediaPayload() (+46 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (45): POST(), getPublicIdsFromUrls(), CLOUDINARY_MANAGED_FOLDERS, CloudinaryCleanupResult, CloudinaryResourceType, deleteFolderViaAdminApi(), deleteManagedCloudinaryAsset(), deleteManagedCloudinaryFolderTree() (+37 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (43): asFiniteLatitude(), asFiniteLongitude(), getMediaLists(), MediaLocation, NftCurrency, NftEditionType, NftMeta, NftStatus (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (35): AdminLoginPage(), getSafeNextPath(), getSearchParamValue(), login(), SearchParams, AdminProtectedLayout(), nav, PATCH() (+27 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (47): class-variance-authority, cloudinary, clsx, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, framer-motion, geist (+39 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (29): CardImageWarning(), CardsCtaForm(), CtaOnlyForm(), GroupCard(), GroupTint, ICON_TINTS, TINTS, HomeSectionsForm() (+21 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (43): eslint, eslint-config-next, allowScripts, esbuild@0.28.1, sharp@0.34.5, unrs-resolver@1.11.1, devDependencies, eslint (+35 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (25): PrivateGalleriesAdminClient(), GalleryFormFields(), GalleryFormFieldsProps, GalleryList(), GalleryListProps, buildGalleryUrl(), getGalleryStatus(), parseLocalDateTime() (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (26): HomeTestimonialCard(), HomeTrust(), downloadCloudinaryFile(), toCloudinaryAttachmentUrl(), useModalNavbarLock(), PrivateGalleryBrowser(), Avatar(), getInitials() (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (28): ALLOWED, decrementServiceInquiriesCount(), DELETE(), hasValidServiceId(), incrementServiceInquiriesCount(), PATCH(), GET(), findByIdOr404() (+20 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (24): POST(), getClientAddress(), HeaderGetter, isValidEmail(), isValidFormStartedAt(), POST(), GET(), isAllowedCloudinaryTestimonialUrl() (+16 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (25): asFiniteNumber(), asNullableString(), asNumberOrNull(), asString(), isRecord(), isValidObjectIdString(), normalizeSlug(), parseObjectId() (+17 more)

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
Cohesion: 0.10
Nodes (24): generateMetadata(), HomePage(), DISCIPLINE_LINKS, HomeCreativeSystem(), CTA_LABELS, HomeFeaturedWork(), BaseProps, Button() (+16 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (21): AboutPage(), DISCIPLINE_HREFS, generateMetadata(), BlogPage(), generateMetadata(), DancingPage(), generateMetadata(), generateMetadata() (+13 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (24): buildAccessRateLimitKey(), getClientIp(), POST(), GET(), PrivateGalleryPage(), createPrivateGalleryCookieValue(), getPrivateGalleryCookieSecret(), getPrivateGalleryExpiryDate() (+16 more)

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (20): formatDates(), formatMonthYear(), MONTH_NAMES, buildInquiryContext(), buildInquiryHref(), currencySymbol, displayStatus(), editionLabel() (+12 more)

### Community 20 - "Community 20"
Cohesion: 0.07
Nodes (25): Aggressive Escalation Triggers, Guidelines, Operating Posture, Part 1 — Findings table (REQUIRED), Part 2 — Verdict (REQUIRED), Remedial Preference Hierarchy, Required Output Format, Reviewing Animations (+17 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (15): ContactActions(), ContactForm(), Props, ContactIdentityFields(), ContactServiceSelector(), CategoryMode, ServiceItem, ServiceMode (+7 more)

### Community 22 - "Community 22"
Cohesion: 0.10
Nodes (25): Animation stack (Lenis/GSAP/Three), Appearance shared type, Admin auth / signed session tokens, cloudinary-image-loader.ts, Content Security Policy, Exhibition globe, Image pipeline — Cloudinary custom loader, Known defects table (+17 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (21): 1. Purpose & frequency, 2. Easing & duration, 3. Physicality & origin, 4. Interruptibility, 5. Performance, 6. Accessibility, 7. Cohesion & tokens, 8. Missed opportunities (+13 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (7): ExhibitionCityIndex(), ExhibitionCityModal(), ExhibitionGlobe, HomeExhibitionGlobe(), MediaItem, TagLink, ExhibitionCity

### Community 26 - "Community 26"
Cohesion: 0.17
Nodes (15): CategoryRow(), AdminServicesClient(), getString(), isRecord(), ServiceEditorModal(), WidgetResult, ServiceSimpleSection(), ServicesToolbar() (+7 more)

### Community 27 - "Community 27"
Cohesion: 0.17
Nodes (19): generateMetadata(), PhotographyTagPage(), generateMetadata(), VideographyTagPage(), TagDiscipline, getMediaByTag(), disciplineMatch(), DisciplineTag (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (16): AdminNftsPage(), CleanupResult, cleanupTestimonialCloudinary(), collectTestimonialAssetUrls(), deleteAssetsByPublicIds(), getErrorMessage(), getStringArray(), normalizeFolderPath() (+8 more)

### Community 29 - "Community 29"
Cohesion: 0.10
Nodes (20): 10. Gesture design details (the "feel" checklist), 11. Frame-level smoothness, 12. Materials & depth — translucency conveys hierarchy, 13. Multimodal feedback — motion + sound + haptics, 14. Reduced motion & accessibility, 15. Typography — optical sizing, tracking, leading, 16. Design foundations — the eight principles, 17. Process (+12 more)

### Community 30 - "Community 30"
Cohesion: 0.28
Nodes (16): asBooleanOrNull(), asStringArray(), PATCH(), GET(), POST(), hashGalleryPassword(), isFutureDate(), makeGalleryAccessToken() (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.19
Nodes (16): ContactPage(), generateMetadata(), SP, ServicesPage(), disciplineSlugForCategory(), HomeServicesPreview(), serviceDirections, ServiceCard() (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.10
Nodes (18): Behavior contract, Markup, Reference wiring, Rules, Styles, The Picker, Hard Rules, Invocation Variants (+10 more)

### Community 33 - "Community 33"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 34 - "Community 34"
Cohesion: 0.21
Nodes (11): AdminServiceCategoriesClient(), CategoriesToolbar(), CategoryFormCard(), createCategoryRequest(), deleteCategoryRequest(), fetchCategories(), patchCategory(), Category (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.19
Nodes (6): AdminTagsClient(), EMPTY_DRAFT, TagFormCard(), NewTag, Tag, TagPatch

### Community 36 - "Community 36"
Cohesion: 0.23
Nodes (14): TagMultiSelect(), TagOption, DELETE(), PATCH(), revalidateTagSurfaces(), GET(), POST(), serializeTag() (+6 more)

### Community 37 - "Community 37"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 38 - "Community 38"
Cohesion: 0.11
Nodes (17): Animation Vocabulary, Easing — how speed changes over an animation, Entrances & Exits — how elements appear and disappear, Examples, Feedback & Interaction — responding to the user's actions, Glossary, Instructions, Looping & Ambient Motion — animations that run on their own (+9 more)

### Community 39 - "Community 39"
Cohesion: 0.19
Nodes (13): generateMetadata(), PeoplePage(), generateMetadata(), PersonDetailPage(), MediaGrid(), buildPersonMediaQuery(), getPublicPeople(), getPublicPersonBySlug() (+5 more)

### Community 40 - "Community 40"
Cohesion: 0.20
Nodes (12): PageRowCard(), SectionsData, SeoDraft, SeoPageForm(), EMPTY_SEO_DRAFT, PagesAdminClient(), PAGE_ROWS, PageRow (+4 more)

### Community 41 - "Community 41"
Cohesion: 0.17
Nodes (13): AdminPagesPage(), PATCH(), SLUG_TO_PATH, DISCIPLINES, GET(), ServiceDetailPage(), getAllPageSections(), mergeWithDefaults() (+5 more)

### Community 42 - "Community 42"
Cohesion: 0.30
Nodes (10): TestimonialInspectModal(), ReviewRow(), Avatar(), formatDate(), getInitials(), identityLine(), renderStars(), StatusPill() (+2 more)

### Community 43 - "Community 43"
Cohesion: 0.31
Nodes (14): FALLBACK_TESTIMONIAL_LOCATIONS, normalizeLocationValue(), ResolvedTestimonialLocation, resolveFallbackLocationById(), resolveFallbackLocationByLabel(), searchFallbackLocations(), dedupeLocations(), escapeRegex() (+6 more)

### Community 44 - "Community 44"
Cohesion: 0.12
Nodes (15): 1. Frequency — how often will a user see this?, 2. Purpose — why does this animate?, 3. Speed — can it stay inside budget?, 4. Function — does motion help or hinder here?, Finding Animation Opportunities, Hard Rules, Operating Posture, Part 1 — Opportunities table (+7 more)

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (10): generateMetadata(), renderStars(), TestimonialsPage(), AnimatedText(), AnimatedTextProps, Tag, PortfolioFallbackPanel(), PortfolioFallbackPanelItem (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.23
Nodes (10): MediaFilterBar(), TagChip, TagChipRow(), localFilterItems(), PublicMediaResponse, PublicMediaSearchMode, useMediaSearch(), PhotographyCylinder (+2 more)

### Community 47 - "Community 47"
Cohesion: 0.20
Nodes (12): MediaListFilterBar(), Props, formatNftQuantity(), MediaItem, MediaListItem(), NftData, statusClasses(), AdminMediaListPage() (+4 more)

### Community 48 - "Community 48"
Cohesion: 0.18
Nodes (9): Banner, CreateServiceResponse, findCategoryById(), findOthersCategory(), isCreateServiceResponse(), AdminActionFeedback(), AdminActionFeedbackState, AdminActionFeedbackType (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.23
Nodes (11): ALLOWED_SIGN_KEYS, getClientKey(), isSafeTestimonialFolder(), POST(), sanitizeParamsToSign(), toValidTimestamp(), CLOUDINARY_MEDIA_CATEGORY_FOLDER_MAP, CLOUDINARY_MEDIA_CATEGORY_FOLDERS (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.19
Nodes (8): metadata, AppShell(), CustomCursor(), ALWAYS_ON_PRIMARY, ALWAYS_ON_SECONDARY, DISCIPLINE_PRIMARY, DISCIPLINE_SECONDARY, SiteFooter()

### Community 51 - "Community 51"
Cohesion: 0.24
Nodes (8): getString(), isRecord(), PeopleAdminClient(), WidgetResult, TestimonialsAdminClient(), useAdminAction(), PersonItem, usePeopleAdmin()

### Community 52 - "Community 52"
Cohesion: 0.26
Nodes (7): HeroBokeh(), makeBokehTexture(), DISCIPLINE_ORDER, HomeHero(), SmartImage(), SectionImage, TextCard

### Community 53 - "Community 53"
Cohesion: 0.18
Nodes (12): admin-route.ts helpers, AnimatedText.tsx, Code quality rules (reuse, no comments), PageHeader.tsx, PortfolioCard.tsx, Queue 3-gate protocol, Reusable components rule, useAdminAction hook (+4 more)

### Community 54 - "Community 54"
Cohesion: 0.49
Nodes (9): archiveService(), createService(), deleteServiceForever(), getError(), JsonObject, patchService(), readJson(), saveOrder() (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.38
Nodes (8): generateMetadata(), PhotographyPage(), VideographyPage(), getPhotographyItems(), getShowreelItem(), getVideographyItems(), listPublicMedia(), getDisciplineTagNav()

### Community 56 - "Community 56"
Cohesion: 0.20
Nodes (9): Charts, Common mismatches to catch, How to use this, Interaction & performance, Motion & visuals, Picking The Right Library, State & styling, The list (+1 more)

### Community 57 - "Community 57"
Cohesion: 0.27
Nodes (10): Design direction spec, Design & motion skills routing, OKLCH design tokens (achromatic), Impeccable detector (URL-only here), What is NOT in the design, Radius scale (five values), Style census (measured from code), Session DS0 — design + motion skill stack (+2 more)

### Community 58 - "Community 58"
Cohesion: 0.20
Nodes (4): SmartMediaPreviewFit, SmartMediaPreviewMode, SmartMediaPreviewProps, HEIGHTS

### Community 59 - "Community 59"
Cohesion: 0.38
Nodes (7): cloudinaryTextureUrl(), cylinderItems(), isSmallScreen(), maxTextures(), textureWidth(), coverTexture(), PhotographyCylinder()

### Community 60 - "Community 60"
Cohesion: 0.22
Nodes (8): Accessibility, Design Engineering, Initial Response, prefers-reduced-motion, Review Checklist, Review Format (Required), Stagger Animations, Touch device hover states

### Community 61 - "Community 61"
Cohesion: 0.36
Nodes (5): MEDIA_BASE_PATHS, revalidateMediaSurfaces(), POST(), DELETE(), PATCH()

### Community 62 - "Community 62"
Cohesion: 0.25
Nodes (9): Button.tsx (shared public button), The button system (ghost/solid), The hero is fixed, HeroBokeh.tsx, HomeHero.tsx, Page transitions — content-as-animation, The section system (hairline + rhythm), Session D2b — homepage section pass (+1 more)

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (9): Discipline tag subpages, Photography 3-view viewer, SortableList.tsx (admin dnd), Tag taxonomy — media_tags, TagChipRow.tsx, useMediaSearch / MediaGrid, Session D3 — photography 3-mode viewer, Session T1 — tag taxonomy + /admin/tags (+1 more)

### Community 64 - "Community 64"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (8): buildHomeMarker(), buildMarker(), DUBAI, ExhibitionGlobe(), GlobeDatum, HOME_VIEW, isDubai(), markerSize()

### Community 66 - "Community 66"
Cohesion: 0.28
Nodes (5): DisciplineCard, EYEBROWS, getCylinderRadius(), Props, WorkOverlay()

### Community 67 - "Community 67"
Cohesion: 0.25
Nodes (8): Animate enter states with @starting-style, Buttons must feel responsive, Component Building Principles, Make popovers origin-aware, Never animate from scale(0), Tooltips: skip delay on subsequent hovers, Use blur to mask imperfect transitions, Use CSS transitions over keyframes for interruptible UI

### Community 68 - "Community 68"
Cohesion: 0.29
Nodes (7): MediaPickerModal / ImageField, Page content CMS (3 collections), Session N3 — SEO + page metadata admin, Session N5 — section-level content CMS, Session N6 — homepage section redesign, Session N7 — admin-selectable card images, Session C1 — blog admin + public pages (pending)

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

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
Cohesion: 0.40
Nodes (6): 6-item navigation + Work overlay, Page activity toggle (isActive), WorkOverlay (discipline cards), Session N1 — minimal nav + Work overlay, Session N2 — page activity toggle, Session N8 — People + Testimonials in navbar

### Community 76 - "Community 76"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 77 - "Community 77"
Cohesion: 0.33
Nodes (4): cormorant, FlashItem, HUSSAIN_LETTERS, ITEMS

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
Cohesion: 0.70
Nodes (4): main(), normalizeLocationValue(), parseLine(), unique()

### Community 82 - "Community 82"
Cohesion: 0.50
Nodes (4): Beauty is leverage, Core Philosophy, Taste is trained, not innate, Unseen details compound

### Community 83 - "Community 83"
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

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (3): cloudinaryImageLoader(), hasTransform(), LoaderArgs

### Community 90 - "Community 90"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 91 - "Community 91"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **526 isolated node(s):** `DISCIPLINE_HREFS`, `InquiryStatus`, `nav`, `SelectedPerson`, `currencies` (+521 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 9` to `Community 2`, `Community 3`, `Community 8`, `Community 10`, `Community 11`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 26`, `Community 28`, `Community 30`, `Community 31`, `Community 39`, `Community 41`, `Community 43`, `Community 45`, `Community 52`, `Community 84`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 12` to `Community 16`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `AdminActionFeedback()` connect `Community 48` to `Community 0`, `Community 34`, `Community 7`, `Community 40`, `Community 42`, `Community 47`, `Community 15`, `Community 51`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `DISCIPLINE_HREFS`, `InquiryStatus`, `nav` to the rest of the system?**
  _526 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06234177215189873 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09577677224736049 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06823529411764706 - nodes in this community are weakly interconnected._