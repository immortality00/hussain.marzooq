import { getMediaByTag } from "@/lib/server/public-media";
import type { PublicMediaItem } from "@/lib/server/media-serializers";
import {
  getDisciplineTags,
  getPublicMediaTag,
  type PublicMediaTag,
} from "@/lib/server/public-media-tags";
import { getPageSeo, type PageSeo } from "@/lib/server/page-seo";
import { getPageSections } from "@/lib/server/page-sections";
import type { TagDiscipline } from "@/lib/server/media-tags";
import type { TagChip } from "@/components/media/TagChipRow";
import type { TagLink } from "@/components/media/types";

type TagPageInput = {
  category: TagDiscipline;
  mediaMode: "image" | "video";
  tagSlug: string;
};

export type TagPageData = {
  tag: PublicMediaTag;
  items: PublicMediaItem[];
  chips: TagChip[];
  tagLinks: Record<string, TagLink>;
  header: { title: string; description: string };
  stickyCta: { title: string; description: string; buttonLabel: string };
};

function applyTag(template: string, label: string) {
  return template.replaceAll("{tag}", label);
}

function seoSlugFor(category: TagDiscipline) {
  return `${category}-tag`;
}

async function getDisciplineTagNavImpl({
  category,
  mediaMode,
}: {
  category: TagDiscipline;
  mediaMode: "image" | "video";
}): Promise<{ chips: TagChip[]; tagLinks: Record<string, TagLink> }> {
  const disciplineTags = await getDisciplineTags({ category, mediaMode });
  const basePath = `/${category}`;

  const tagLinks: Record<string, TagLink> = {};
  const chips: TagChip[] = [];
  for (const t of disciplineTags) {
    const href = `${basePath}/${t.slug}`;
    tagLinks[t.slug] = { label: t.label, href };
    chips.push({ slug: t.slug, label: t.label, href });
  }

  return { chips, tagLinks };
}

export async function getDisciplineTagNav(args: {
  category: TagDiscipline;
  mediaMode: "image" | "video";
}): Promise<{ chips: TagChip[]; tagLinks: Record<string, TagLink> }> {
  try {
    return await getDisciplineTagNavImpl(args);
  } catch {
    return { chips: [], tagLinks: {} };
  }
}

export async function getTagMeta({
  category,
  tagSlug,
}: {
  category: TagDiscipline;
  tagSlug: string;
}): Promise<{ tag: PublicMediaTag; seo: PageSeo } | null> {
  try {
    const [tag, seo] = await Promise.all([
      getPublicMediaTag(tagSlug),
      getPageSeo(seoSlugFor(category)),
    ]);
    if (!tag) return null;
    return { tag, seo };
  } catch {
    return null;
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
  } catch {
    return null;
  }
}
