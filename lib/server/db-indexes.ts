import type { CreateIndexesOptions, Db } from "mongodb";

// Relative imports only: the deploy-succeeded Netlify function bundles this file and cannot resolve "@/".

type IndexKeys = Record<string, 1 | -1>;
type IndexRule = {
  collection: string;
  keys: IndexKeys;
  options?: CreateIndexesOptions;
  /** A unique index on a field: refuse with the duplicates named, instead of Mongo's bare error. */
  noDuplicatesIn?: string;
};

const uniqueString = (field: string): IndexRule => ({
  collection: "media",
  keys: { [field]: 1 },
  options: { unique: true, partialFilterExpression: { [field]: { $type: "string" } } },
  noDuplicatesIn: field,
});

/** Every index the site needs except testimonial_locations' (built by scripts/import-geonames-cities.mjs). */
export const DB_INDEXES: IndexRule[] = [
  { collection: "media", keys: { categories: 1, isPublic: 1, createdAt: -1 } },
  { collection: "media", keys: { type: 1, categories: 1, isPublic: 1, createdAt: -1 } },
  { collection: "media", keys: { peopleIds: 1, isPublic: 1, createdAt: -1 } },
  { collection: "media", keys: { tags: 1, isPublic: 1, createdAt: -1 } },
  { collection: "media", keys: { location: 1, isPublic: 1, createdAt: -1 } },
  { collection: "media", keys: { event: 1, isPublic: 1, createdAt: -1 } },
  uniqueString("publicId"),
  uniqueString("embedUrl"),
  { collection: "media", keys: { createdAt: -1 } },

  { collection: "people_profiles", keys: { slug: 1 }, options: { unique: true } },
  { collection: "people_profiles", keys: { name: 1 } },
  { collection: "people_profiles", keys: { isPublic: 1, createdAt: -1 } },
  { collection: "people_profiles", keys: { removalRequestedAt: 1 } },

  { collection: "removal_requests", keys: { status: 1, createdAt: -1 } },
  { collection: "removal_requests", keys: { status: 1, decidedAt: -1 } },
  { collection: "removal_requests", keys: { personId: 1 } },

  { collection: "private_galleries", keys: { slug: 1 }, options: { unique: true } },
  { collection: "private_galleries", keys: { isActive: 1, expiresAtUtc: 1 } },
  { collection: "private_galleries", keys: { updatedAt: -1, createdAt: -1 } },

  { collection: "services", keys: { slug: 1 }, options: { unique: true } },
  { collection: "services", keys: { categoryId: 1, isActive: 1, isArchived: 1, order: 1 } },
  { collection: "services", keys: { category: 1, isActive: 1, isArchived: 1, order: 1 } },
  { collection: "services", keys: { order: 1, createdAt: -1 } },

  { collection: "service_categories", keys: { slug: 1 }, options: { unique: true } },
  { collection: "service_categories", keys: { order: 1, createdAt: -1 } },
  { collection: "service_categories", keys: { isActive: 1, order: 1 } },

  { collection: "media_tags", keys: { slug: 1 }, options: { unique: true } },
  { collection: "media_tags", keys: { order: 1, createdAt: -1 } },
  { collection: "media_tags", keys: { isActive: 1, order: 1 } },

  { collection: "blog_posts", keys: { slug: 1 }, options: { unique: true } },
  { collection: "blog_posts", keys: { isPublished: 1, publishedAt: -1 } },
  { collection: "blog_posts", keys: { category: 1, isPublished: 1, publishedAt: -1 } },
  { collection: "blog_posts", keys: { updatedAt: -1 } },

  { collection: "blog_categories", keys: { slug: 1 }, options: { unique: true } },
  { collection: "blog_categories", keys: { order: 1, createdAt: -1 } },
  { collection: "blog_categories", keys: { isActive: 1, order: 1 } },

  { collection: "blog_signups", keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },

  { collection: "testimonials", keys: { isApproved: 1, sortOrder: 1, approvedAt: -1, createdAt: -1 } },
  { collection: "testimonials", keys: { email: 1, createdAt: -1 }, options: { sparse: true } },

  { collection: "testimonial_upload_sessions", keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },

  { collection: "upload_ledger", keys: { expiresAt: 1 } },

  { collection: "inquiries", keys: { status: 1, isArchived: 1, createdAt: -1 } },
  { collection: "inquiries", keys: { serviceId: 1, isArchived: 1, createdAt: -1 } },
  { collection: "inquiries", keys: { category: 1, createdAt: -1 } },
  { collection: "inquiries", keys: { email: 1, createdAt: -1 } },

  { collection: "push_subscriptions", keys: { endpoint: 1 }, options: { unique: true } },

  { collection: "admin_passkeys", keys: { credentialId: 1 }, options: { unique: true } },
  { collection: "admin_auth_requests", keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },

  { collection: "request_guards", keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },
  { collection: "request_guards", keys: { bucket: 1, type: 1, updatedAt: -1 } },
];

const REBUILDABLE_CONFLICTS = new Set(["IndexOptionsConflict", "IndexKeySpecsConflict"]);

async function assertNoDuplicates(db: Db, collection: string, field: string) {
  const duplicates = await db
    .collection(collection)
    .aggregate<{ _id: string; count: number }>([
      { $match: { [field]: { $type: "string" } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 20 },
    ])
    .toArray();
  if (duplicates.length === 0) return;
  const list = duplicates.map((d) => `${d._id} (${d.count})`).join(", ");
  throw new Error(`${collection}.${field} has duplicate values, so a unique index cannot be created: ${list}`);
}

/** Creates the index, or drops and rebuilds a same-key index whose options changed. Never drops anything else. */
async function ensureIndex(db: Db, rule: IndexRule): Promise<{ name: string; recreated: boolean }> {
  const collection = db.collection(rule.collection);
  try {
    return { name: await collection.createIndex(rule.keys, rule.options ?? {}), recreated: false };
  } catch (error) {
    if (!REBUILDABLE_CONFLICTS.has((error as { codeName?: string }).codeName ?? "")) throw error;
  }
  const existing = await collection.indexes();
  const conflicting = existing.find((index) => JSON.stringify(index.key) === JSON.stringify(rule.keys));
  if (conflicting?.name) await collection.dropIndex(conflicting.name);
  return { name: await collection.createIndex(rule.keys, rule.options ?? {}), recreated: true };
}

async function ensureCollection(db: Db, collection: string, rules: IndexRule[]) {
  for (const rule of rules) {
    if (rule.noDuplicatesIn) await assertNoDuplicates(db, collection, rule.noDuplicatesIn);
  }
  try {
    const names = await db
      .collection(collection)
      .createIndexes(rules.map((rule) => ({ key: rule.keys, ...rule.options })));
    return names.map((name) => ({ name, recreated: false }));
  } catch (error) {
    if (!REBUILDABLE_CONFLICTS.has((error as { codeName?: string }).codeName ?? "")) throw error;
  }
  const results = [];
  for (const rule of rules) results.push(await ensureIndex(db, rule));
  return results;
}

/** One request per collection; a collection with a changed index falls back to one at a time. */
export async function ensureIndexes(db: Db, log: (line: string) => void = () => {}) {
  const byCollection = new Map<string, IndexRule[]>();
  for (const rule of DB_INDEXES) byCollection.set(rule.collection, [...(byCollection.get(rule.collection) ?? []), rule]);

  const recreated: string[] = [];
  for (const [collection, rules] of byCollection) {
    for (const result of await ensureCollection(db, collection, rules)) {
      if (result.recreated) recreated.push(`${collection}.${result.name}`);
      log(`✓ ${collection}: ${result.name}${result.recreated ? " (recreated)" : ""}`);
    }
  }
  return { total: DB_INDEXES.length, recreated };
}
