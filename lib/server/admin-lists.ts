import type { Db, Document, Filter, ObjectId } from "mongodb";
import { asIsoDate as isoOrNull, asNullableString, asString } from "@/app/api/_lib/common";
import { ADMIN_ACTIVE_INQUIRY_LIMIT, ADMIN_ARCHIVED_INQUIRY_LIMIT } from "@/lib/admin-data";
import { getDb } from "./db";
import { serializePrivateGalleryAdminItem } from "./private-gallery-admin";
import { toAdminTestimonialItem } from "./testimonial-serializers";

async function findInquiries(filter: Filter<Document>, limit: number) {
  const db = await getDb();
  const docs = await db.collection("inquiries").find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit).toArray();

  return docs.map((d) => ({
    id: String(d._id),
    name: asString(d.name),
    email: asString(d.email),
    message: asString(d.message),
    category: asNullableString(d.category),
    serviceId: asNullableString(d.serviceId),
    serviceName: asNullableString(d.serviceName),
    status: asNullableString(d.status) ?? "new",
    adminNotes: asString(d.adminNotes),
    isArchived: d.isArchived === true,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
  }));
}

export async function listAdminInquiries() {
  const [active, archived] = await Promise.all([
    findInquiries({ isArchived: { $ne: true } }, ADMIN_ACTIVE_INQUIRY_LIMIT),
    findInquiries({ isArchived: true }, ADMIN_ARCHIVED_INQUIRY_LIMIT),
  ]);
  return [...active, ...archived];
}

export async function listAdminTestimonials() {
  const db = await getDb();
  const docs = await db
    .collection("testimonials")
    .find({})
    .sort({ sortOrder: 1, updatedAt: -1, createdAt: -1, _id: -1 })
    .toArray();

  return docs.map((doc) => toAdminTestimonialItem(doc as Record<string, unknown>));
}

export function toAdminPersonItem(doc: Document) {
  return {
    id: String(doc._id),
    name: asString(doc.name),
    slug: asString(doc.slug),
    bio: asNullableString(doc.bio),
    avatarUrl: asNullableString(doc.avatarUrl),
    isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
    isPrivate: doc.isPrivate === true,
    hasPassword: typeof doc.passwordHash === "string" && doc.passwordHash.length > 0,
    removalRequestedAt: isoOrNull(doc.removalRequestedAt),
    removalApprovedAt: isoOrNull(doc.removalApprovedAt),
    updatedAt: isoOrNull(doc.updatedAt),
  };
}

export async function storedPerson(db: Db, oid: ObjectId) {
  const doc = await db.collection("people_profiles").findOne({ _id: oid });
  return doc ? toAdminPersonItem(doc) : null;
}

export async function listAdminPeople() {
  const db = await getDb();
  const docs = await db
    .collection("people_profiles")
    .find({})
    .sort({ updatedAt: -1, createdAt: -1, _id: -1 })
    .toArray();
  return docs.map(toAdminPersonItem);
}

export async function storedGallery(db: Db, oid: ObjectId) {
  const doc = await db.collection("private_galleries").findOne({ _id: oid });
  return doc ? serializePrivateGalleryAdminItem(doc) : null;
}

export async function listAdminPrivateGalleries() {
  const db = await getDb();
  const docs = await db
    .collection("private_galleries")
    .find({})
    .sort({ updatedAt: -1, createdAt: -1, _id: -1 })
    .toArray();
  return docs.map(serializePrivateGalleryAdminItem);
}

export async function listActiveMediaTags() {
  const db = await getDb();
  const docs = await db.collection("media_tags").find({ isActive: true }).sort({ order: 1, createdAt: -1 }).toArray();

  return docs.map((doc) => ({
    id: String(doc._id),
    label: asString(doc.label),
    slug: asString(doc.slug),
    description: asString(doc.description),
  }));
}
