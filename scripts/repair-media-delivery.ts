import { v2 as cloudinary } from "cloudinary";
import { MongoClient } from "mongodb";
import { ensureCloudinaryConfigured } from "@/lib/server/cloudinary";
import { normalizeAssetResourceType, normalizeDeliveryType } from "@/lib/server/cloudinary-private";
import { privateGalleryMediaIds, requiredDelivery, syncMediaDelivery } from "@/lib/server/media-delivery";

process.loadEnvFile(".env.local");
ensureCloudinaryConfigured();

const apply = process.argv.includes("--apply");
const dbName = process.env.MONGODB_DB_NAME?.trim() || "hm_visuals";
const client = new MongoClient(process.env.MONGODB_URI ?? "");
await client.connect();

try {
  const db = client.db(dbName);
  const docs = await db
    .collection("media")
    .find({ publicId: { $type: "string", $ne: "" } })
    .project({ title: 1, publicId: 1, resourceType: 1, type: 1, deliveryType: 1, isPublic: 1 })
    .toArray();
  const inGallery = await privateGalleryMediaIds(db, docs.map((doc) => String(doc._id)));
  const wrong = docs.filter(
    (doc) => requiredDelivery(doc, inGallery.has(String(doc._id))) !== normalizeDeliveryType(doc.deliveryType)
  );

  console.log(`Database: ${dbName}`);
  console.log(
    `Media whose file delivery does not match its visibility: ${wrong.length}` +
      (apply ? "" : "   (dry run — pass --apply to repair)")
  );
  for (const doc of wrong) {
    const to = requiredDelivery(doc, inGallery.has(String(doc._id)));
    console.log(`  ${to === "authenticated" ? "make private" : "make public "}: ${doc.title ?? "(untitled)"} — ${doc.publicId}`);
  }

  if (apply && wrong.length) {
    const result = await syncMediaDelivery(db, wrong.map((doc) => String(doc._id)));
    console.log(`Switched ${result.converted}, file missing ${result.missing}, failed ${result.failures.length}.`);
    for (const failure of result.failures) console.error(`  FAILED: ${failure.title} — ${failure.error}`);
  }

  const placeholders: typeof docs = [];
  for (const doc of docs) {
    try {
      const resource = await cloudinary.api.resource(String(doc.publicId), {
        resource_type: normalizeAssetResourceType(doc.resourceType ?? doc.type),
        type: normalizeDeliveryType(doc.deliveryType),
      });
      if (resource.placeholder === true || resource.bytes === 0) placeholders.push(doc);
    } catch {
      placeholders.push(doc);
    }
  }

  console.log(`\nMedia whose Cloudinary file is empty or missing: ${placeholders.length}`);
  for (const doc of placeholders) console.log(`  ${doc.title ?? "(untitled)"} — ${doc.publicId}`);
  if (placeholders.length > 0) {
    console.log("\nCheck each for a Cloudinary backup version before re-uploading.");
  }
} finally {
  await client.close();
}
