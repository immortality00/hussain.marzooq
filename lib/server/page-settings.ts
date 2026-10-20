import { cache } from "react";
import { getDb } from "@/lib/server/db";
import { buildFallback } from "@/lib/server/public-read";

export type PageSettings = {
  slug: string;
  isActive: boolean;
  updatedAt: Date | null;
};

function defaultPageSettings(slug: string): PageSettings {
  return { slug, isActive: true, updatedAt: null };
}

export function pageSettingsOf(slug: string, doc: Record<string, unknown> | null | undefined): PageSettings {
  return {
    slug,
    isActive: typeof doc?.isActive === "boolean" ? doc.isActive : true,
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

// Blog is a whole-page on/off switch (not a discipline). Defaults to active,
// and stays active on a DB blip so a transient error never hides the page.
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
