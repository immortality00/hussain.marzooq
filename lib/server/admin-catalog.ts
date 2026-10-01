import type { Db, Document, ObjectId } from "mongodb";
import { asIsoDate, asString as text } from "@/app/api/_lib/common";

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
    db.collection("media_tags").find({}).sort({ order: 1, createdAt: -1, _id: -1 }).toArray(),
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

  return docs.map((doc) => adminMediaTagOf(doc, counts.get(text(doc.slug)) ?? 0));
}

export function adminMediaTagOf(doc: Document, mediaCount: number) {
  return {
    id: String(doc._id),
    label: text(doc.label),
    slug: text(doc.slug),
    description: text(doc.description),
    isActive: activeOf(doc.isActive),
    order: orderOf(doc.order),
    mediaCount,
  };
}

export async function listAdminBlogCategories(db: Db) {
  const [docs, counts] = await Promise.all([
    db.collection("blog_categories").find({}).sort({ order: 1, createdAt: -1, _id: -1 }).toArray(),
    countBy(db, "blog_posts", "categoryId"),
  ]);

  return docs.map((doc) => adminBlogCategoryOf(doc, counts.get(String(doc._id)) ?? 0));
}

export function adminBlogCategoryOf(doc: Document, postsCount: number) {
  return {
    id: String(doc._id),
    name: text(doc.name),
    slug: text(doc.slug),
    isActive: activeOf(doc.isActive),
    order: orderOf(doc.order),
    postsCount,
  };
}

export async function listAdminServiceCatalog(db: Db) {
  const [serviceDocs, categoryDocs, inquiryCounts, serviceCounts] = await Promise.all([
    db.collection("services").find({}).sort({ order: 1, createdAt: -1, _id: -1 }).toArray(),
    db.collection("service_categories").find({}).sort({ order: 1, createdAt: -1, _id: -1 }).toArray(),
    countBy(db, "inquiries", "serviceId", { isArchived: { $ne: true } }),
    countBy(db, "services", "categoryId"),
  ]);

  const services = serviceDocs.map((doc) => adminServiceOf(doc, inquiryCounts.get(String(doc._id)) ?? 0));

  const categories = categoryDocs.map((doc) => adminServiceCategoryOf(doc, serviceCounts.get(String(doc._id)) ?? 0));

  return { services, categories };
}

export function adminServiceOf(doc: Document, inquiriesCount: number) {
  return {
    id: String(doc._id),
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
    inquiriesCount,
    updatedAt: asIsoDate(doc.updatedAt),
  };
}

export function adminServiceCategoryOf(doc: Document, servicesCount: number) {
  const slug = text(doc.slug);
  return {
    id: String(doc._id),
    name: text(doc.name),
    slug,
    isActive: activeOf(doc.isActive),
    order: orderOf(doc.order),
    servicesCount,
    isSystem: typeof doc.isSystem === "boolean" ? doc.isSystem : slug === "others",
  };
}

export async function savedAdminService(db: Db, oid: ObjectId) {
  const [doc, inquiriesCount] = await Promise.all([
    db.collection("services").findOne({ _id: oid }),
    db.collection("inquiries").countDocuments({ serviceId: String(oid), isArchived: { $ne: true } }),
  ]);
  return doc ? adminServiceOf(doc, inquiriesCount) : null;
}
