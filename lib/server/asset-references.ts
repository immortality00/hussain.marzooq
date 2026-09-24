import type { Db } from "mongodb";

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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
