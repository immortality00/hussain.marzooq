import clientPromise from "@/lib/mongodb";
import { ensureOthersCategory } from "@/lib/db/ensureSystemCategories";
import AdminServiceCategoriesClient from "./AdminServiceCategoriesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminServiceCategoriesPage() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await ensureOthersCategory(db);

  const [docs, serviceCounts] = await Promise.all([
    db.collection("service_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db
      .collection("services")
      .aggregate<{ _id: string; count: number }>([
        {
          $match: {
            categoryId: { $type: "string", $ne: "" },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
  ]);

  const countMap = new Map<string, number>();
  for (const c of serviceCounts) countMap.set(c._id, c.count);

  const initial = docs.map((d) => {
    const id = String(d._id);
    const slug = typeof d.slug === "string" ? d.slug : "";

    return {
      id,
      name: typeof d.name === "string" ? d.name : "",
      slug,
      isActive: typeof d.isActive === "boolean" ? d.isActive : true,
      order: typeof d.order === "number" ? d.order : 0,
      servicesCount: countMap.get(id) ?? 0,
      isSystem: typeof d.isSystem === "boolean" ? d.isSystem : slug === "others",
    };
  });

  return <AdminServiceCategoriesClient initial={initial} />;
}