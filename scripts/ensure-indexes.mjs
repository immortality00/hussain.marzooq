import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

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

if (!uri) {
  console.error("Missing MONGODB_URI.");
  console.error("Set it in .env.local or run with MONGODB_URI before the command.");
  process.exit(1);
}

const client = new MongoClient(uri);

async function createIndex(db, collectionName, keys, options = {}) {
  const collection = db.collection(collectionName);

  try {
    const indexName = await collection.createIndex(keys, options);
    console.log(`✓ ${collectionName}: ${indexName}`);
    return;
  } catch (error) {
    if (error?.codeName !== "IndexOptionsConflict" && error?.code !== 85) throw error;
  }

  const existing = await collection.indexes();
  const conflicting = existing.find(
    (index) => JSON.stringify(index.key) === JSON.stringify(keys)
  );
  if (conflicting) await collection.dropIndex(conflicting.name);

  const indexName = await collection.createIndex(keys, options);
  console.log(`✓ ${collectionName}: ${indexName} (recreated)`);
}

async function assertNoDuplicates(db, collectionName, field) {
  const duplicates = await db
    .collection(collectionName)
    .aggregate([
      { $match: { [field]: { $type: "string" } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 20 },
    ])
    .toArray();

  if (duplicates.length > 0) {
    const list = duplicates.map((d) => `${d._id} (${d.count})`).join(", ");
    throw new Error(
      `${collectionName}.${field} has duplicate values, so a unique index cannot be created: ${list}`
    );
  }
}

async function ensureIndexes() {
  await client.connect();
  const db = client.db(dbName);

  console.log(`Ensuring MongoDB indexes for database: ${dbName}`);

  await createIndex(db, "media", { categories: 1, isPublic: 1, createdAt: -1 });
  await createIndex(db, "media", { type: 1, categories: 1, isPublic: 1, createdAt: -1 });
  await createIndex(db, "media", { peopleIds: 1, isPublic: 1, createdAt: -1 });
  await createIndex(db, "media", { tags: 1, isPublic: 1, createdAt: -1 });
  await createIndex(db, "media", { location: 1, isPublic: 1, createdAt: -1 });
  await createIndex(db, "media", { event: 1, isPublic: 1, createdAt: -1 });
  await assertNoDuplicates(db, "media", "publicId");
  await assertNoDuplicates(db, "media", "embedUrl");
  await createIndex(
    db,
    "media",
    { publicId: 1 },
    { unique: true, partialFilterExpression: { publicId: { $type: "string" } } }
  );
  await createIndex(
    db,
    "media",
    { embedUrl: 1 },
    { unique: true, partialFilterExpression: { embedUrl: { $type: "string" } } }
  );
  await createIndex(db, "media", { createdAt: -1 });

  await createIndex(db, "people_profiles", { slug: 1 }, { unique: true });
  await createIndex(db, "people_profiles", { name: 1 });
  await createIndex(db, "people_profiles", { isPublic: 1, createdAt: -1 });
  await createIndex(db, "people_profiles", { removalRequestedAt: 1 });

  await createIndex(db, "removal_requests", { status: 1, createdAt: -1 });
  await createIndex(db, "removal_requests", { status: 1, decidedAt: -1 });
  await createIndex(db, "removal_requests", { personId: 1 });

  await createIndex(db, "private_galleries", { slug: 1 }, { unique: true });
  await createIndex(db, "private_galleries", { isActive: 1, expiresAtUtc: 1 });
  await createIndex(db, "private_galleries", { updatedAt: -1, createdAt: -1 });

  await createIndex(db, "services", { slug: 1 }, { unique: true });
  await createIndex(db, "services", { categoryId: 1, isActive: 1, isArchived: 1, order: 1 });
  await createIndex(db, "services", { category: 1, isActive: 1, isArchived: 1, order: 1 });
  await createIndex(db, "services", { order: 1, createdAt: -1 });

  await createIndex(db, "service_categories", { slug: 1 }, { unique: true });
  await createIndex(db, "service_categories", { order: 1, createdAt: -1 });
  await createIndex(db, "service_categories", { isActive: 1, order: 1 });

  await createIndex(db, "media_tags", { slug: 1 }, { unique: true });
  await createIndex(db, "media_tags", { order: 1, createdAt: -1 });
  await createIndex(db, "media_tags", { isActive: 1, order: 1 });

  await createIndex(db, "blog_posts", { slug: 1 }, { unique: true });
  await createIndex(db, "blog_posts", { isPublished: 1, publishedAt: -1 });
  await createIndex(db, "blog_posts", { category: 1, isPublished: 1, publishedAt: -1 });
  await createIndex(db, "blog_posts", { updatedAt: -1 });

  await createIndex(db, "blog_categories", { slug: 1 }, { unique: true });
  await createIndex(db, "blog_categories", { order: 1, createdAt: -1 });
  await createIndex(db, "blog_categories", { isActive: 1, order: 1 });

  await createIndex(db, "testimonials", { isApproved: 1, sortOrder: 1, approvedAt: -1, createdAt: -1 });
  await createIndex(db, "testimonials", { email: 1, createdAt: -1 }, { sparse: true });

  await createIndex(db, "testimonial_upload_sessions", { expiresAt: 1 }, { expireAfterSeconds: 0 });

  await createIndex(db, "upload_ledger", { expiresAt: 1 });

  await createIndex(db, "inquiries", { status: 1, isArchived: 1, createdAt: -1 });
  await createIndex(db, "inquiries", { serviceId: 1, isArchived: 1, createdAt: -1 });
  await createIndex(db, "inquiries", { category: 1, createdAt: -1 });
  await createIndex(db, "inquiries", { email: 1, createdAt: -1 });

  await createIndex(db, "site_settings", { key: 1 }, { unique: true });

  await createIndex(db, "request_guards", { expiresAt: 1 }, { expireAfterSeconds: 0 });
  await createIndex(db, "request_guards", { bucket: 1, type: 1, updatedAt: -1 });

  console.log("Done.");
}

ensureIndexes()
  .catch((error) => {
    console.error("Failed to ensure indexes.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });