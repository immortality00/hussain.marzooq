import clientPromise from "@/lib/mongodb";
import { ensureOthersCategory } from "@/lib/db/ensureSystemCategories";
import AdminServiceCategoriesClient from "./AdminServiceCategoriesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminServiceCategoriesPage() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  // ✅ Ensure system category exists
  await ensureOthersCategory(db);

  const docs = await db
    .collection("service_categories")
    .find({})
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const slugs = docs
    .map((d) => (typeof d.slug === "string" ? d.slug : ""))
    .filter(Boolean);

  const counts = await db
    .collection("services")
    .aggregate<{ _id: string; count: number }>([
      { $match: { category: { $in: slugs } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])
    .toArray();

  const countMap = new Map<string, number>();
  for (const c of counts) countMap.set(c._id, c.count);

  const initial = docs.map((d) => {
    const slug = typeof d.slug === "string" ? d.slug : "";
    return {
      id: String(d._id),
      name: typeof d.name === "string" ? d.name : "",
      slug,
      isActive: typeof d.isActive === "boolean" ? d.isActive : true,
      order: typeof d.order === "number" ? d.order : 0,
      servicesCount: countMap.get(slug) ?? 0,
      isSystem: typeof d.isSystem === "boolean" ? d.isSystem : slug === "others",
    };
  });

  return <AdminServiceCategoriesClient initial={initial} />;
}