export type DateMap = Map<string, Date>;

export type SitemapSources = {
  pages: DateMap;
  pageSettings?: Date;
  serviceCategories?: Date;
  testimonials?: Date;
  blogCategories?: Date;
  media: {
    photography?: Date;
    videography?: Date;
    showreel?: Date;
    nft?: Date;
    exhibited?: Date;
  };
  services: DateMap;
  posts: DateMap;
  tags: DateMap;
  tagMedia: { photography: DateMap; videography: DateMap };
  people: DateMap;
};

export const EMPTY_SITEMAP_SOURCES: SitemapSources = {
  pages: new Map(),
  media: {},
  services: new Map(),
  posts: new Map(),
  tags: new Map(),
  tagMedia: { photography: new Map(), videography: new Map() },
  people: new Map(),
};

export function latest(...values: unknown[]): Date | undefined {
  let newest: Date | undefined;
  for (const value of values) {
    if (value instanceof Date && !Number.isNaN(value.getTime()) && (!newest || value > newest)) {
      newest = value;
    }
  }
  return newest;
}

export function newestIn(map: DateMap): Date | undefined {
  return latest(...map.values());
}

const STATIC_PAGE_SOURCES: Record<string, (s: SitemapSources) => unknown[]> = {
  "/": (s) => [
    s.pages.get("home"),
    s.pageSettings,
    newestIn(s.services),
    s.testimonials,
    s.media.exhibited,
  ],
  "/about": (s) => [s.pages.get("about"), s.pageSettings],
  "/services": (s) => [s.pages.get("services"), newestIn(s.services), s.serviceCategories],
  "/people": (s) => [s.pages.get("people"), newestIn(s.people)],
  "/testimonials": (s) => [s.pages.get("testimonials"), s.testimonials],
  "/contact": (s) => [s.pages.get("contact"), newestIn(s.services)],
  "/privacy": (s) => [s.pages.get("privacy")],
  "/photography": (s) => [s.pages.get("photography"), s.media.photography, newestIn(s.tags)],
  "/videography": (s) => [
    s.pages.get("videography"),
    s.media.videography,
    s.media.showreel,
    newestIn(s.tags),
  ],
  "/nft": (s) => [s.pages.get("nft"), s.media.nft],
  "/dancing": (s) => [s.pages.get("dancing")],
  "/web-development": (s) => [s.pages.get("web-development")],
  "/blog": (s) => [s.pages.get("blog"), newestIn(s.posts), s.blogCategories],
};

export function staticPageModified(sources: SitemapSources, path: string): Date | undefined {
  const pick = STATIC_PAGE_SOURCES[path];
  return pick ? latest(...pick(sources)) : undefined;
}

export function tagPageModified(
  sources: SitemapSources,
  category: "photography" | "videography",
  slug: string
): Date | undefined {
  return latest(
    sources.pages.get(`${category}-tag`),
    sources.tags.get(slug),
    sources.tagMedia[category].get(slug)
  );
}

export function servicePageModified(sources: SitemapSources, slug: string): Date | undefined {
  return latest(sources.services.get(slug), sources.pages.get("services-detail"));
}

export function personPageModified(sources: SitemapSources, slug: string): Date | undefined {
  return latest(sources.people.get(slug), sources.pages.get("people-detail"));
}

export function postPageModified(sources: SitemapSources, slug: string): Date | undefined {
  return latest(sources.posts.get(slug), sources.pages.get("blog-detail"), sources.pages.get("blog"));
}
