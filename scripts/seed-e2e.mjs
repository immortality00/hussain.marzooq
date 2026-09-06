import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { MongoClient, ObjectId } from "mongodb";

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

for (const file of ENV_FILES) loadEnvFile(path.join(process.cwd(), file));

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  console.error("Missing MONGODB_URI.");
  process.exit(1);
}

// The seed wipes every collection it writes. Refusing anything that is not
// explicitly an end-to-end database is the only thing standing between a
// mistyped env var and the real library.
if (!dbName || !/(^|[_-])(e2e|test)([_-]|$)/i.test(dbName)) {
  console.error(
    `Refusing to seed "${dbName ?? "(unset)"}" — MONGODB_DB_NAME must name an e2e/test database.`
  );
  process.exit(1);
}

async function scryptHash(password) {
  const salt = crypto.randomBytes(16);
  const derived = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => (error ? reject(error) : resolve(key)));
  });

  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

// Mirrors e2e/fixtures.ts. Kept as a plain literal so this script stays runnable
// by node with no TypeScript step.
const E2E = {
  serviceName: "Seed Editorial Session",
  galleryPassword: "e2e-gallery-password",
  gallerySlug: "e2e-private-gallery",
  photographyCount: 65,
  videographyCount: 4,
};

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

function assetUrl(publicId, resourceType = "image", ext = "jpg") {
  return `https://res.cloudinary.com/${CLOUD}/${resourceType}/upload/v1700000000/${publicId}.${ext}`;
}

const BASE_TIME = Date.parse("2026-09-01T12:00:00.000Z");

function mediaDoc({ index, category, type, title, tags = [], isPublic = true }) {
  const resourceType = type === "video" ? "video" : "image";
  const publicId = `hm_visuals/media/${category}/${category}-${index}`;

  return {
    _id: new ObjectId(),
    type,
    title,
    description: `Seeded ${category} item ${index}.`,
    location: null,
    event: null,
    year: 2026,
    tags,
    categories: [category],
    people: [],
    appearances: [],
    isPublic,
    secureUrl: assetUrl(publicId, resourceType, resourceType === "video" ? "mp4" : "jpg"),
    publicId,
    resourceType,
    deliveryType: "upload",
    createdAt: new Date(BASE_TIME - index * 60_000),
    updatedAt: new Date(BASE_TIME - index * 60_000),
  };
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const collections = [
    "media",
    "media_tags",
    "private_galleries",
    "page_settings",
    "page_seo",
    "page_sections",
    "services",
    "service_categories",
    "testimonials",
    "people_profiles",
    "inquiries",
    "request_guards",
    "removal_requests",
    "blog_posts",
    "blog_categories",
  ];

  for (const name of collections) {
    await db.collection(name).deleteMany({});
  }

  const photography = Array.from({ length: E2E.photographyCount }, (_, offset) =>
    mediaDoc({
      index: offset + 1,
      category: "photography",
      type: "image",
      title: `Seed Photo ${offset + 1}`,
      tags: offset % 3 === 0 ? ["exhibitions"] : [],
    })
  );

  const videography = Array.from({ length: E2E.videographyCount }, (_, offset) =>
    mediaDoc({
      index: offset + 1,
      category: "videography",
      type: "video",
      title: `Seed Film ${offset + 1}`,
    })
  );

  const nft = {
    ...mediaDoc({
      index: 1,
      category: "nft",
      type: "image",
      title: "Seed Collectible",
      tags: ["exhibitions"],
    }),
    // getPublicNfts requires an `nft` object carrying string editionType + status.
    nft: {
      price: 4,
      currency: "ETH",
      editionType: "limited",
      editionsTotal: 10,
      editionsRemaining: 7,
      openUntil: null,
      status: "available",
      marketplaceUrl: "https://example.test/collectible",
    },
  };

  const galleryMedia = mediaDoc({
    index: 900,
    category: "photography",
    type: "image",
    title: "Seed Private Frame",
    isPublic: false,
  });

  await db.collection("media").insertMany([...photography, ...videography, nft, galleryMedia]);

  await db.collection("media_tags").insertOne({
    label: "Exhibitions",
    slug: "exhibitions",
    description: "Seeded tag used by the end-to-end suite.",
    isActive: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection("private_galleries").insertOne({
    title: "E2E Private Gallery",
    slug: E2E.gallerySlug,
    description: "Seeded gallery used by the end-to-end suite.",
    passwordHash: await scryptHash(E2E.galleryPassword),
    accessToken: crypto.randomBytes(24).toString("hex"),
    mediaIds: [String(galleryMedia._id)],
    isActive: true,
    expiresAtUtc: new Date(Date.now() + 30 * 86_400_000),
    expiresAt: new Date(Date.now() + 30 * 86_400_000),
    expiresAtLocal: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection("page_settings").insertMany(
    ["photography", "videography", "nft", "dancing", "web-development", "blog"].map((slug) => ({
      slug,
      isActive: true,
      cardImage: null,
      updatedAt: new Date(),
    }))
  );

  const categoryId = new ObjectId();
  await db.collection("service_categories").insertOne({
    _id: categoryId,
    name: "Photography",
    slug: "photography",
    isActive: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection("services").insertOne({
    name: E2E.serviceName,
    slug: "seed-editorial-session",
    description: "Seeded service used by the end-to-end suite.",
    startingPrice: 1000,
    currency: "AED",
    categoryId: String(categoryId),
    category: "photography",
    imageUrl: "",
    isActive: true,
    isArchived: false,
    order: 0,
    inquiriesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(
    [
      `Seeded "${dbName}":`,
      `  media               ${photography.length + videography.length + 2}`,
      `  photography public  ${photography.length}`,
      `  videography public  ${videography.length}`,
      `  private gallery     /g/${E2E.gallerySlug}`,
    ].join("\n")
  );

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
