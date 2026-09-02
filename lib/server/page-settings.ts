import { getDb } from "@/lib/server/db";
import { EMPTY_SECTION_IMAGE, isSectionImage } from "@/lib/page-sections-shared";
import type { SectionImage } from "@/lib/page-sections-shared";

export type PageSettings = {
  slug: string;
  isActive: boolean;
  // The image shown on this discipline's card in the Work overlay ("work
  // layout"). Empty means no image — there is no auto-pick fallback.
  cardImage: SectionImage;
  updatedAt: Date;
};

function readCardImage(value: unknown): SectionImage {
  return isSectionImage(value) ? value : EMPTY_SECTION_IMAGE;
}

function defaultPageSettings(slug: string): PageSettings {
  return { slug, isActive: true, cardImage: EMPTY_SECTION_IMAGE, updatedAt: new Date() };
}

export async function getPageSettings(slug: string): Promise<PageSettings> {
  try {
    const db = await getDb();
    const doc = await db.collection("page_settings").findOne({ slug });
    return {
      slug,
      isActive: typeof doc?.isActive === "boolean" ? doc.isActive : true,
      cardImage: readCardImage(doc?.cardImage),
      updatedAt: doc?.updatedAt instanceof Date ? doc.updatedAt : new Date(),
    };
  } catch {
    return defaultPageSettings(slug);
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
  } catch {
    return true;
  }
}

export async function getAllPageSettings(): Promise<PageSettings[]> {
  const SLUGS = ["photography", "videography", "nft", "dancing", "web-development", "blog"];
  try {
    const db = await getDb();
    const docs = await db.collection("page_settings").find({ slug: { $in: SLUGS } }).toArray();
    const map = new Map(docs.map((d) => [d.slug as string, d]));
    return SLUGS.map((slug) => {
      const doc = map.get(slug);
      return {
        slug,
        isActive: typeof doc?.isActive === "boolean" ? doc.isActive : true,
        cardImage: readCardImage(doc?.cardImage),
        updatedAt: doc?.updatedAt instanceof Date ? doc.updatedAt : new Date(),
      };
    });
  } catch {
    return SLUGS.map(defaultPageSettings);
  }
}
