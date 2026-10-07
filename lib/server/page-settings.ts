import { cache } from "react";
import { getDb } from "@/lib/server/db";
import { EMPTY_SECTION_IMAGE, isSectionImage } from "@/lib/page-sections-shared";
import type { SectionImage } from "@/lib/page-sections-shared";
import { buildFallback } from "@/lib/server/public-read";

export type PageSettings = {
  slug: string;
  isActive: boolean;
  // The image shown on this discipline's card in the Work overlay ("work
  // layout"). Empty means no image — there is no auto-pick fallback.
  cardImage: SectionImage;
  updatedAt: Date | null;
};

function readCardImage(value: unknown): SectionImage {
  return isSectionImage(value) ? value : EMPTY_SECTION_IMAGE;
}

function defaultPageSettings(slug: string): PageSettings {
  return { slug, isActive: true, cardImage: EMPTY_SECTION_IMAGE, updatedAt: null };
}

export function pageSettingsOf(slug: string, doc: Record<string, unknown> | null | undefined): PageSettings {
  return {
    slug,
    isActive: typeof doc?.isActive === "boolean" ? doc.isActive : true,
    cardImage: readCardImage(doc?.cardImage),
    updatedAt: doc?.updatedAt instanceof Date ? doc.updatedAt : null,
  };
}

export async function getPageSettings(slug: string): Promise<PageSettings> {
  try {
    const db = await getDb();
    return pageSettingsOf(slug, await db.collection("page_settings").findOne({ slug }));
  } catch (error) {
    return buildFallback(error, defaultPageSettings(slug));
  }
}

// Blog is a whole-page on/off switch (not a discipline — it has no Work-overlay
// card). Defaults to active, and stays active on a DB blip so a transient error
// never hides the page.
export async function getBlogActive(): Promise<boolean> {
  try {
    const db = await getDb();
    const doc = await db.collection("page_settings").findOne({ slug: "blog" });
    return typeof doc?.isActive === "boolean" ? doc.isActive : true;
  } catch (error) {
    return buildFallback(error, true);
  }
}

const SETTINGS_SLUGS = ["photography", "videography", "nft", "dancing", "web-development", "blog"];

export async function readAllPageSettings(): Promise<PageSettings[]> {
  const db = await getDb();
  const docs = await db.collection("page_settings").find({ slug: { $in: SETTINGS_SLUGS } }).toArray();
  const map = new Map(docs.map((d) => [d.slug as string, d]));
  return SETTINGS_SLUGS.map((slug) => pageSettingsOf(slug, map.get(slug)));
}

export const getAllPageSettings = cache(async (): Promise<PageSettings[]> => {
  try {
    return await readAllPageSettings();
  } catch (error) {
    return buildFallback(error, SETTINGS_SLUGS.map(defaultPageSettings));
  }
});

export async function getFooterPageSettings(): Promise<PageSettings[]> {
  try {
    return await getAllPageSettings();
  } catch {
    return SETTINGS_SLUGS.map(defaultPageSettings);
  }
}
