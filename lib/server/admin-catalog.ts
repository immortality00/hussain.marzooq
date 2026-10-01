import type { Db } from "mongodb";
import { ensureOthersCategory } from "@/lib/db/ensureSystemCategories";

const text = (value: unknown) => (typeof value === "string" ? value : "");
const orderOf = (value: unknown) => (typeof value === "number" ? value : 0);
const activeOf = (value: unknown) => (typeof value === "boolean" ? value : true);

async function countBy(db: Db, collection: string, field: string, match: Record<string, unknown> = {}) {
  const rows = await db
    .collection(collection)
    .aggregate<{ _id: unknown; count: number }>([
      { $match: { [field]: { $type: "string", $ne: "" }, ...match } },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    ])
    .toArray();
  const counts = new Map<string, number>();
  for (const row of rows) if (typeof row._id === "string") counts.set(row._id, row.count);
  return counts;
}

export async function listAdminMediaTags(db: Db) {
  const [docs, rows] = await Promise.all([
    db.collection("media_tags").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db
      .collection("media")
      .aggregate<{ _id: unknown; count: number }>([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const counts = new Map<string, number>();
  for (const row of rows) if (typeof row._id === "string") counts.set(row._id, row.count);

  return docs.map((doc) => {
    const slug = text(doc.slug);
    return {
      id: String(doc._id),
      label: text(doc.label),
      slug,
      description: text(doc.description),
      isActive: activeOf(doc.isActive),
      order: orderOf(doc.order),
      mediaCount: counts.get(slug) ?? 0,
    };
  });
}

export async function listAdminBlogCategories(db: Db) {
  const [docs, counts] = await Promise.all([
    db.collection("blog_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    countBy(db, "blog_posts", "categoryId"),
  ]);

  return docs.map((doc) => {
    const id = String(doc._id);
    return {
      id,
      name: text(doc.name),
      slug: text(doc.slug),
      isActive: activeOf(doc.isActive),
      order: orderOf(doc.order),
      postsCount: counts.get(id) ?? 0,
    };
  });
}

export async function listAdminServiceCatalog(db: Db) {
  await ensureOthersCategory(db);

  const [serviceDocs, categoryDocs, inquiryCounts, serviceCounts] = await Promise.all([
    db.collection("services").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db.collection("service_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    countBy(db, "inquiries", "serviceId", { isArchived: { $ne: true } }),
    countBy(db, "services", "categoryId"),
  ]);

  const services = serviceDocs.map((doc) => {
    const id = String(doc._id);
    return {
      id,
      name: text(doc.name),
      slug: text(doc.slug),
      category: typeof doc.category === "string" ? doc.category : "others",
      categoryId: typeof doc.categoryId === "string" ? doc.categoryId : null,
      description: text(doc.description),
      startingPrice: typeof doc.startingPrice === "number" ? doc.startingPrice : null,
      currency: typeof doc.currency === "string" ? doc.currency : "AED",
      imageUrl: text(doc.imageUrl),
      isActive: activeOf(doc.isActive),
      isArchived: typeof doc.isArchived === "boolean" ? doc.isArchived : false,
      order: orderOf(doc.order),
      inquiriesCount: inquiryCounts.get(id) ?? 0,
    };
  });

  const categories = categoryDocs.map((doc) => {
    const id = String(doc._id);
    const slug = text(doc.slug);
    return {
      id,
      name: text(doc.name),
      slug,
      isActive: activeOf(doc.isActive),
      order: orderOf(doc.order),
      servicesCount: serviceCounts.get(id) ?? 0,
      isSystem: typeof doc.isSystem === "boolean" ? doc.isSystem : slug === "others",
    };
  });

  return { services, categories };
}
