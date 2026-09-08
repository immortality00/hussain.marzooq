import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

const DEFAULT_DB_NAME = "hm_visuals";
const ENV_FILES = [".env.local", ".env"];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const equalIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, equalIndex).trim();
    let value = trimmed.slice(equalIndex + 1).trim();

    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

for (const envFile of ENV_FILES) loadEnvFile(path.join(process.cwd(), envFile));

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim() || DEFAULT_DB_NAME;
const apply = process.argv.includes("--apply");

if (!uri) {
  console.error("Missing MONGODB_URI.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const galleryMediaIds = new Set(
  (await db.collection("private_galleries").distinct("mediaIds")).filter(
    (id) => typeof id === "string"
  )
);

const stranded = (
  await db
    .collection("media")
    .find({ deliveryType: "authenticated" })
    .project({ title: 1, publicId: 1, resourceType: 1, type: 1 })
    .toArray()
).filter((doc) => !galleryMediaIds.has(String(doc._id)));

console.log(`Database: ${dbName}`);
console.log(
  `Media on private delivery while belonging to no gallery: ${stranded.length}` +
    (apply ? "" : "   (dry run — pass --apply to repair)")
);

for (const doc of stranded) {
  const resourceType = (doc.resourceType ?? doc.type) === "video" ? "video" : "image";
  const label = `${doc.title ?? "(untitled)"} — ${doc.publicId}`;

  if (!apply) {
    console.log(`  would restore public delivery: ${label}`);
    continue;
  }

  try {
    const result = await cloudinary.uploader.rename(doc.publicId, doc.publicId, {
      resource_type: resourceType,
      type: "authenticated",
      to_type: "upload",
      overwrite: true,
      invalidate: true,
    });

    await db
      .collection("media")
      .updateOne(
        { _id: doc._id },
        { $set: { deliveryType: "upload", secureUrl: result.secure_url } }
      );

    console.log(`  restored: ${label}`);
  } catch (error) {
    console.error(`  FAILED:   ${label} — ${error?.error?.message ?? error?.message ?? error}`);
  }
}

const placeholders = [];
for (const doc of await db
  .collection("media")
  .find({ publicId: { $type: "string", $ne: "" } })
  .project({ title: 1, publicId: 1, resourceType: 1, type: 1, deliveryType: 1 })
  .toArray()) {
  const resourceType = (doc.resourceType ?? doc.type) === "video" ? "video" : "image";
  try {
    const resource = await cloudinary.api.resource(doc.publicId, {
      resource_type: resourceType,
      type: doc.deliveryType === "authenticated" ? "authenticated" : "upload",
    });
    if (resource.placeholder === true || resource.bytes === 0) placeholders.push(doc);
  } catch {
    placeholders.push(doc);
  }
}

console.log(`\nMedia whose Cloudinary file is empty or missing: ${placeholders.length}`);
for (const doc of placeholders) {
  console.log(`  ${doc.title ?? "(untitled)"} — ${doc.publicId}`);
}
if (placeholders.length > 0) {
  console.log("\nThese have no file to restore. Re-upload them, then delete the broken entries.");
}

await client.close();
