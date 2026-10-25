import type { PageSectionsSlug, HomeSections } from "@/lib/server/page-sections";
import { heroPhotosOf } from "@/lib/hero-photos";

export type PageRow = {
  key: string;
  label: string;
  settingsSlug?: string;
  // A settingsSlug row that is a plain Main page (Blog), not one of the 5
  // disciplines: it has a visibility toggle but stays in the Main group.
  toggleOnly?: boolean;
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
  {
    key: "services-detail",
    label: "Services — detail page",
    seoSlug: "services-detail",
    seoDetailPage: true,
  },
  { key: "people", label: "People", seoSlug: "people", sectionsSlug: "people" },
  {
    key: "people-detail",
    label: "People — detail page",
    seoSlug: "people-detail",
    seoDetailPage: true,
    sectionsSlug: "people-detail",
  },
  {
    key: "blog",
    label: "Blog",
    settingsSlug: "blog",
    toggleOnly: true,
    seoSlug: "blog",
    sectionsSlug: "blog",
  },
  {
    key: "blog-detail",
    label: "Blog — post page",
    seoSlug: "blog-detail",
    seoDetailPage: true,
  },
  { key: "contact", label: "Contact", seoSlug: "contact", sectionsSlug: "contact" },
  { key: "testimonials", label: "Testimonials", seoSlug: "testimonials", sectionsSlug: "testimonials" },
  { key: "privacy", label: "Privacy", seoSlug: "privacy" },
];

export type PageGroup = "main" | "discipline" | "template";

export function pageGroup(row: PageRow): PageGroup {
  if (row.seoDetailPage) return "template";
  if (row.settingsSlug && !row.toggleOnly) return "discipline";
  return "main";
}

type PageSettingsRecord = Record<string, { isActive?: boolean } | undefined>;

export function pageFlags(pages: { settings: PageSettingsRecord; sections: Record<string, unknown> }) {
  const missingImage = PAGE_ROWS.filter((row) =>
    pageNeedsImage(row, row.sectionsSlug === "home" ? (pages.sections.home as HomeSections | undefined) : undefined)
  ).length;
  const hidden = PAGE_ROWS.filter((row) => row.settingsSlug && pages.settings[row.settingsSlug]?.isActive === false)
    .length;
  return { missingImage, hidden };
}

function pageNeedsImage(row: PageRow, homeSections: HomeSections | undefined): boolean {
  if (row.sectionsSlug !== "home" || !homeSections) return false;
  if (heroPhotosOf(homeSections.hero).length === 0) return true;
  return homeSections.featuredCards.some((card) => !card.image?.url);
}
