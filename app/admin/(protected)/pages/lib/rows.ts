import type { PageSectionsSlug, HomeSections } from "@/lib/server/page-sections";

export type PageRow = {
  key: string;
  label: string;
  settingsSlug?: string;
  seoSlug?: string;
  seoDetailPage?: boolean;
  sectionsSlug?: PageSectionsSlug;
};

export const PAGE_ROWS: PageRow[] = [
  { key: "home", label: "Home", seoSlug: "home", sectionsSlug: "home" },
  { key: "about", label: "About", seoSlug: "about", sectionsSlug: "about" },
  {
    key: "photography",
    label: "Photography",
    settingsSlug: "photography",
    seoSlug: "photography",
    sectionsSlug: "photography",
  },
  {
    key: "photography-tag",
    label: "Photography — tag page",
    seoSlug: "photography-tag",
    seoDetailPage: true,
  },
  {
    key: "videography",
    label: "Videography",
    settingsSlug: "videography",
    seoSlug: "videography",
    sectionsSlug: "videography",
  },
  {
    key: "videography-tag",
    label: "Videography — tag page",
    seoSlug: "videography-tag",
    seoDetailPage: true,
  },
  { key: "nft", label: "NFT", settingsSlug: "nft", seoSlug: "nft", sectionsSlug: "nft" },
  { key: "dancing", label: "Dancing", settingsSlug: "dancing", seoSlug: "dancing", sectionsSlug: "dancing" },
  {
    key: "web-development",
    label: "Web Development",
    settingsSlug: "web-development",
    seoSlug: "web-development",
    sectionsSlug: "web-development",
  },
  { key: "services", label: "Services", seoSlug: "services" },
  { key: "people", label: "People", seoSlug: "people", sectionsSlug: "people" },
  {
    key: "people-detail",
    label: "People — detail page",
    seoSlug: "people-detail",
    seoDetailPage: true,
    sectionsSlug: "people-detail",
  },
  { key: "blog", label: "Blog", seoSlug: "blog", sectionsSlug: "blog" },
  { key: "contact", label: "Contact", seoSlug: "contact" },
  { key: "testimonials", label: "Testimonials", seoSlug: "testimonials", sectionsSlug: "testimonials" },
];

export type PageGroup = "main" | "discipline" | "template";

export function pageGroup(row: PageRow): PageGroup {
  if (row.seoDetailPage) return "template";
  if (row.settingsSlug) return "discipline";
  return "main";
}

export function pageNeedsImage(
  row: PageRow,
  ctx: { isActive: boolean; cardImageUrl?: string; homeSections?: HomeSections },
): boolean {
  if (row.settingsSlug && ctx.isActive && !ctx.cardImageUrl) return true;
  if (row.sectionsSlug === "home" && ctx.homeSections) {
    if (!ctx.homeSections.hero?.image?.url) return true;
    if (ctx.homeSections.featuredCards.some((card) => !card.image?.url)) return true;
  }
  return false;
}
