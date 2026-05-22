import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { asStringArray, noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("testimonials")
    .find({})
    .sort({ sortOrder: 1, updatedAt: -1, createdAt: -1 })
    .toArray();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    email: typeof doc.email === "string" ? doc.email : null,
    about: typeof doc.about === "string" ? doc.about : null,
    location: typeof doc.location === "string" ? doc.location : null,
    review: typeof doc.review === "string" ? doc.review : "",
    rating: typeof doc.rating === "number" && doc.rating >= 1 && doc.rating <= 5 ? doc.rating : 0,
    profilePhotoUrl: typeof doc.profilePhotoUrl === "string" ? doc.profilePhotoUrl : null,
    photoUrls: asStringArray(doc.photoUrls, 12),
    isApproved: typeof doc.isApproved === "boolean" ? doc.isApproved : false,
    sortOrder: typeof doc.sortOrder === "number" ? doc.sortOrder : 100,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : null,
  }));

  return noStoreJson({ ok: true, items });
}