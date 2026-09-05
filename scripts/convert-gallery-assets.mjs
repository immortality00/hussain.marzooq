import fs from "node:fs";
import path from "node:path";
import { MongoClient, ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

const DEFAULT_DB_NAME = "hm_visuals";
const ENV_FILES = [".env.local", ".env"];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
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

for (const envFile of ENV_FILES) {
  loadEnvFile(path.join(process.cwd(), envFile));
}

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim() || DEFAULT_DB_NAME;
const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

if (!uri) {
  console.error("Missing MONGODB_URI.");
  console.error("Set it in .env.local or run with MONGODB_URI before the command.");
  process.exit(1);
}

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Missing Cloudinary config (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).");
  process.exit(1);
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

const client = new MongoClient(uri);

function errorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if (typeof error.message === "string") return error.message;
    if (error.error && typeof error.error.message === "string") return error.error.message;
  }
  return "Unknown Cloudinary error.";
}

async function convertGalleryAssets() {
  await client.connect();
  const db = client.db(dbName);

  const galleries = await db.collection("private_galleries").find({}).toArray();
  const mediaIds = new Set();

  for (const gallery of galleries) {
    for (const id of Array.isArray(gallery.mediaIds) ? gallery.mediaIds : []) {
      if (typeof id === "string" && ObjectId.isValid(id)) mediaIds.add(id);
    }
  }

  console.log(`Private galleries: ${galleries.length} · linked media: ${mediaIds.size}`);

  const objectIds = [...mediaIds].map((id) => new ObjectId(id));
  const hidden = await db
    .collection("media")
    .updateMany({ _id: { $in: objectIds } }, { $set: { isPublic: false } });
  console.log(`Hidden from the public site: ${hidden.matchedCount}`);

  let converted = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;

  for (const id of mediaIds) {
    const doc = await db.collection("media").findOne({ _id: new ObjectId(id) });
    if (!doc) continue;

    const publicId = typeof doc.publicId === "string" ? doc.publicId.trim() : "";
    if (!publicId || doc.deliveryType === "authenticated") {
      skipped += 1;
      continue;
    }

    const resourceType = doc.resourceType === "video" || doc.type === "video" ? "video" : "image";

    try {
      const result = await cloudinary.uploader.rename(publicId, publicId, {
        resource_type: resourceType,
        type: "upload",
        to_type: "authenticated",
        overwrite: true,
        invalidate: true,
      });

      await db
        .collection("media")
        .updateOne(
          { _id: doc._id },
          { $set: { deliveryType: "authenticated", secureUrl: result.secure_url } }
        );

      converted += 1;
      console.log(`✓ ${publicId}`);
    } catch (error) {
      const message = errorMessage(error);

      if (/deleted resource|not found/i.test(message)) {
        missing += 1;
        console.log(`– ${publicId}: no file at Cloudinary, hidden only`);
        continue;
      }

      failed += 1;
      console.error(`✗ ${publicId}: ${message}`);
    }
  }

  console.log(
    `Converted ${converted} · already private ${skipped} · no file ${missing} · failed ${failed}`
  );
}

convertGalleryAssets()
  .catch((error) => {
    console.error("Failed to convert private-gallery assets.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
