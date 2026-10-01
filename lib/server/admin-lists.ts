import { ADMIN_INQUIRY_LIMIT } from "@/lib/admin-data";
import { getDb } from "./db";
import { serializePrivateGalleryAdminItem } from "./private-gallery-admin";
import { toAdminTestimonialItem } from "./testimonial-serializers";

const text = (value: unknown) => (typeof value === "string" ? value : "");
const textOrNull = (value: unknown) => (typeof value === "string" ? value : null);

export async function listAdminInquiries({ status = "", all = false }: { status?: string; all?: boolean } = {}) {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (!all) filter.isArchived = { $ne: true };

  const db = await getDb();
  const docs = await db.collection("inquiries").find(filter).sort({ createdAt: -1 }).limit(ADMIN_INQUIRY_LIMIT).toArray();

  return docs.map((d) => ({
    id: String(d._id),
    name: text(d.name),
    email: text(d.email),
    message: text(d.message),
    category: textOrNull(d.category),
    serviceId: textOrNull(d.serviceId),
    serviceName: textOrNull(d.serviceName),
    status: typeof d.status === "string" ? d.status : "new",
    adminNotes: text(d.adminNotes),
    isArchived: typeof d.isArchived === "boolean" ? d.isArchived : false,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
  }));
}

export async function listAdminTestimonials() {
  const db = await getDb();
  const docs = await db
    .collection("testimonials")
    .find({})
    .sort({ sortOrder: 1, updatedAt: -1, createdAt: -1 })
    .toArray();

  return docs.map((doc) => toAdminTestimonialItem(doc as Record<string, unknown>));
}

export async function listAdminPeople() {
  const db = await getDb();
  const docs = await db.collection("people_profiles").find({}).sort({ updatedAt: -1, createdAt: -1 }).toArray();

  return docs.map((doc) => ({
    id: String(doc._id),
    name: text(doc.name),
    slug: text(doc.slug),
    bio: textOrNull(doc.bio),
    avatarUrl: textOrNull(doc.avatarUrl),
    isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
    isPrivate: doc.isPrivate === true,
    hasPassword: typeof doc.passwordHash === "string" && doc.passwordHash.length > 0,
    removalRequestedAt: doc.removalRequestedAt instanceof Date ? doc.removalRequestedAt.toISOString() : null,
    removalApprovedAt: doc.removalApprovedAt instanceof Date ? doc.removalApprovedAt.toISOString() : null,
  }));
}

export async function listAdminPrivateGalleries() {
  const db = await getDb();
  const docs = await db.collection("private_galleries").find({}).sort({ updatedAt: -1, createdAt: -1 }).toArray();
  return docs.map(serializePrivateGalleryAdminItem);
}

export async function listActiveMediaTags() {
  const db = await getDb();
  const docs = await db.collection("media_tags").find({ isActive: true }).sort({ order: 1, createdAt: -1 }).toArray();

  return docs.map((doc) => ({
    id: String(doc._id),
    label: text(doc.label),
    slug: text(doc.slug),
    description: text(doc.description),
  }));
}

