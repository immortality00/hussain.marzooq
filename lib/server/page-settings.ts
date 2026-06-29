import { getDb } from "@/lib/server/db";

export type PageSettings = {
  slug: string;
  isActive: boolean;
  updatedAt: Date;
};

export async function getPageSettings(slug: string): Promise<PageSettings> {
  const db = await getDb();
  const doc = await db.collection("page_settings").findOne({ slug });
  return {
    slug,
    isActive: typeof doc?.isActive === "boolean" ? doc.isActive : true,
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
      updatedAt: doc?.updatedAt instanceof Date ? doc.updatedAt : new Date(),
    };
  });
}
