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

export async function getPageSettings(slug: string): Promise<PageSettings> {
  const db = await getDb();
  const doc = await db.collection("page_settings").findOne({ slug });
  return {
    slug,
    isActive: typeof doc?.isActive === "boolean" ? doc.isActive : true,
    cardImage: readCardImage(doc?.cardImage),
    updatedAt: doc?.updatedAt instanceof Date ? doc.updatedAt : new Date(),
  };
}

export async function getAllPageSettings(): Promise<PageSettings[]> {
  const SLUGS = ["photography", "videography", "nft", "dancing", "web-development"];
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
}
