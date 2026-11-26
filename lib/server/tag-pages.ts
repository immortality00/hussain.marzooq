import { getMediaByTag } from "@/lib/server/public-media";
import type { PublicMediaItem } from "@/lib/server/media-serializers";
import {
  getDisciplineTags,
  getPublicMediaTag,
  type PublicMediaTag,
} from "@/lib/server/public-media-tags";
import { getPageSeo, type PageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { withAllChip, type TagChip } from "@/components/media/tag-chips";
import type { TagLink, TagLinks } from "@/components/media/types";
import { buildFallback } from "@/lib/server/public-read";

/** The disciplines with tag pages. */
type TagPageDiscipline = keyof TagLinks;

type TagPageInput = {
  category: TagPageDiscipline;
  mediaMode: "image" | "video";
  tagSlug: string;
};

export type TagPageData = {
  tag: PublicMediaTag;
  items: PublicMediaItem[];
  chips: TagChip[];
  tagLinks: TagLinks;
  header: { title: string; description: string };
  stickyCta: { title: string; description: string; buttonLabel: string };
};

function applyTag(template: string, label: string) {
  return template.replaceAll("{tag}", label);
}

function seoSlugFor(category: TagPageDiscipline) {
  return `${category}-tag`;
}

type TagNav = { chips: TagChip[]; tagLinks: TagLinks };

async function getDisciplineTagNavImpl({
  category,
  mediaMode,
}: {
  category: TagPageDiscipline;
  mediaMode: "image" | "video";
}): Promise<TagNav> {
  const disciplineTags = await getDisciplineTags({ category, mediaMode });
  const basePath = `/${category}`;

  const pages: Record<string, TagLink> = {};
  const chips: TagChip[] = [];
  for (const t of disciplineTags) {
    const href = `${basePath}/${t.slug}`;
    pages[t.slug] = { label: t.label, href };
    chips.push({ slug: t.slug, label: t.label, href });
  }

  return { chips: withAllChip(basePath, chips), tagLinks: { [category]: pages } };
}

export async function getDisciplineTagNav(args: {
  category: TagPageDiscipline;
  mediaMode: "image" | "video";
}): Promise<TagNav> {
  try {
    return await getDisciplineTagNavImpl(args);
  } catch (error) {
    return buildFallback(error, { chips: [], tagLinks: {} });
  }
}

const NO_NAV: TagNav = { chips: [], tagLinks: {} };

/**
 * Both disciplines' tag pages, for a page that shows photos and films together (a person,
 * the globe, the NFTs). A discipline whose page is switched off has none: its tag pages
 * send visitors home.
 */
export async function getTagLinks(): Promise<TagLinks> {
  const active = new Set((await getAllPageSettings()).filter((page) => page.isActive).map((page) => page.slug));
  const [photography, videography] = await Promise.all([
    active.has("photography") ? getDisciplineTagNav({ category: "photography", mediaMode: "image" }) : NO_NAV,
    active.has("videography") ? getDisciplineTagNav({ category: "videography", mediaMode: "video" }) : NO_NAV,
  ]);
  return { ...photography.tagLinks, ...videography.tagLinks };
}

export async function getTagMeta({
  category,
  tagSlug,
}: {
  category: TagPageDiscipline;
  tagSlug: string;
}): Promise<{ tag: PublicMediaTag; seo: PageSeo } | null> {
  try {
    const [tag, seo] = await Promise.all([
      getPublicMediaTag(tagSlug),
      getPageSeo(seoSlugFor(category)),
    ]);
    if (!tag) return null;
    return { tag, seo };
  } catch (error) {
    return buildFallback(error, null);
  }
}

async function getTagPageImpl({
  category,
  mediaMode,
  tagSlug,
}: TagPageInput): Promise<TagPageData | null> {
  const tag = await getPublicMediaTag(tagSlug);
  if (!tag) return null;

  const [items, nav, seo, sections] = await Promise.all([
    getMediaByTag({ category, mediaMode, tagSlug }),
    getDisciplineTagNav({ category, mediaMode }),
    getPageSeo(seoSlugFor(category)),
    getPageSections(category),
  ]);

  const { chips, tagLinks } = nav;

  return {
    tag,
    items,
    chips,
    tagLinks,
    header: {
      title: applyTag(seo.headerTitle || "{tag}", tag.label),
      description: tag.description || applyTag(seo.headerDescription, tag.label),
    },
    stickyCta: sections.stickyCta,
  };
}

export async function getTagPage(input: TagPageInput): Promise<TagPageData | null> {
  try {
    return await getTagPageImpl(input);
  } catch (error) {
    return buildFallback(error, null);
  }
}
