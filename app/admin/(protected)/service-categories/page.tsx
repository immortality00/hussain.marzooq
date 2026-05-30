import { getDb } from "@/lib/server/db";
import { ensureOthersCategory } from "@/lib/db/ensureSystemCategories";
import AdminServiceCategoriesClient from "./AdminServiceCategoriesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminServiceCategoriesPage() {
  const db = await getDb();

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
  for (const row of serviceCounts) {
    countMap.set(row._id, row.count);
  }

  const initial = docs.map((doc) => {
    const id = String(doc._id);
    const slug = typeof doc.slug === "string" ? doc.slug : "";

    return {
      id,
      name: typeof doc.name === "string" ? doc.name : "",
      slug,
      isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
      order: typeof doc.order === "number" ? doc.order : 0,
      servicesCount: countMap.get(id) ?? 0,
      isSystem: typeof doc.isSystem === "boolean" ? doc.isSystem : slug === "others",
    };
  });

  return <AdminServiceCategoriesClient initial={initial} />;
}