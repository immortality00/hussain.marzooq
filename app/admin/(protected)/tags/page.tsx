import { getDb } from "@/lib/server/db";
import { sanitizeDisciplines } from "@/lib/server/media-tags";
import AdminTagsClient from "./AdminTagsClient";
import type { Tag } from "./lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminTagsPage() {
  const db = await getDb();

  const [docs, counts] = await Promise.all([
    db.collection("media_tags").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db
      .collection("media")
      .aggregate<{ _id: string; count: number }>([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const countMap = new Map<string, number>();
  for (const row of counts) if (typeof row._id === "string") countMap.set(row._id, row.count);

  const initial: Tag[] = docs.map((doc) => {
    const slug = typeof doc.slug === "string" ? doc.slug : "";
    return {
      id: String(doc._id),
      label: typeof doc.label === "string" ? doc.label : "",
      slug,
      description: typeof doc.description === "string" ? doc.description : "",
      disciplines: sanitizeDisciplines(doc.disciplines),
      isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
      order: typeof doc.order === "number" ? doc.order : 0,
      mediaCount: countMap.get(slug) ?? 0,
    };
  });

  return <AdminTagsClient initial={initial} />;
}
