import { getDb } from "@/lib/server/db";
import BlogCategoriesAdminClient from "./BlogCategoriesAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminBlogCategoriesPage() {
  const db = await getDb();
  const [docs, counts] = await Promise.all([
    db.collection("blog_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db
      .collection("blog_posts")
      .aggregate<{ _id: string; count: number }>([
        { $match: { categoryId: { $type: "string", $ne: "" } } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const countMap = new Map<string, number>();
  for (const row of counts) countMap.set(row._id, row.count);

  const initial = docs.map((doc) => {
    const id = String(doc._id);
    return {
      id,
      name: typeof doc.name === "string" ? doc.name : "",
      slug: typeof doc.slug === "string" ? doc.slug : "",
      isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
      order: typeof doc.order === "number" ? doc.order : 0,
      postsCount: countMap.get(id) ?? 0,
    };
  });

  return <BlogCategoriesAdminClient initial={initial} />;
}
