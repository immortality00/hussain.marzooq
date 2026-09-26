import type { Db } from "mongodb";
import {
  escapeRegex,
  SECTION_IMAGE_SLUGS,
  usagesInDocs,
  type AssetUsage,
} from "@/lib/asset-usage-locations";

export const ASSET_HOLDING_COLLECTIONS = [
  "media",
  "people_profiles",
  "services",
  "blog_posts",
  "testimonials",
  "page_sections",
  "page_settings",
  "page_seo",
] as const;

async function anyDocMentions(db: Db, collection: string, publicId: string) {
  const docs = await db.collection(collection).find({}).toArray();
  return docs.some((doc) => JSON.stringify(doc).includes(publicId));
}

export async function isCloudinaryAssetReferenced(db: Db, publicId: string): Promise<boolean> {
  const id = publicId.trim();
  if (!id) return true;

  const urlPattern = new RegExp(escapeRegex(id));

  const [media, person, service, post, review] = await Promise.all([
    db.collection("media").findOne(
      { $or: [{ publicId: id }, { posterPublicId: id }] },
      { projection: { _id: 1 } }
    ),
    db.collection("people_profiles").findOne({ avatarUrl: urlPattern }, { projection: { _id: 1 } }),
    db.collection("services").findOne({ imageUrl: urlPattern }, { projection: { _id: 1 } }),
    db.collection("blog_posts").findOne(
      { $or: [{ coverImagePublicId: id }, { coverImageUrl: urlPattern }, { content: urlPattern }] },
      { projection: { _id: 1 } }
    ),
    db.collection("testimonials").findOne(
      { $or: [{ profilePhotoUrl: urlPattern }, { photoUrls: urlPattern }] },
      { projection: { _id: 1 } }
    ),
  ]);
  if (media || person || service || post || review) return true;

  for (const collection of ["page_sections", "page_settings", "page_seo"]) {
    if (await anyDocMentions(db, collection, id)) return true;
  }

  return false;
}

export async function findAssetUsagesByPublicId(
  db: Db,
  publicIds: string[]
): Promise<Map<string, AssetUsage[]>> {
  const ids = Array.from(new Set(publicIds.map((id) => id.trim()).filter(Boolean)));
  const found = new Map<string, AssetUsage[]>();
  if (ids.length === 0) return found;

  const pattern = new RegExp(ids.map(escapeRegex).join("|"));
  const [sections, settings, seo, posts] = await Promise.all([
    db.collection("page_sections").find({ slug: { $in: SECTION_IMAGE_SLUGS } }).toArray(),
    db.collection("page_settings").find({ "cardImage.url": pattern }).toArray(),
    db.collection("page_seo").find({ ogImageUrl: pattern }).toArray(),
    db
      .collection("blog_posts")
      .find(
        { $or: [{ coverImageUrl: pattern }, { content: pattern }] },
        { projection: { title: 1, coverImageUrl: 1, content: 1 } }
      )
      .toArray(),
  ]);

  for (const id of ids) {
    const usages = usagesInDocs({ sections, settings, seo, posts }, id);
    if (usages.length) found.set(id, usages);
  }
  return found;
}

export async function findAssetUsages(db: Db, publicId: string): Promise<AssetUsage[]> {
  const found = await findAssetUsagesByPublicId(db, [publicId]);
  return found.get(publicId.trim()) ?? [];
}
