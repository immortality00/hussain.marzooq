import { requireAdminOr401 } from "@/lib/auth/admin";
import { noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import { toAdminTestimonialItem } from "@/lib/server/testimonial-serializers";

export const dynamic = "force-dynamic";

export async function GET() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const db = await getDb();

  const docs = await db
    .collection("testimonials")
    .find({})
    .sort({ sortOrder: 1, updatedAt: -1, createdAt: -1 })
    .toArray();

  const items = docs.map((doc) => toAdminTestimonialItem(doc as Record<string, unknown>));

  return noStoreJson({ ok: true, items });
}