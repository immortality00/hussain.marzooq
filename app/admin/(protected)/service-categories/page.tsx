import clientPromise from "@/lib/mongodb";
import AdminServiceCategoriesClient from "./AdminServiceCategoriesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminServiceCategoriesPage() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("service_categories")
    .find({})
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const initial = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
  }));

  return <AdminServiceCategoriesClient initial={initial} />;
}