import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
};

export default async function AdminServiceCategoriesPage() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/service-categories");

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("service_categories")
    .find({})
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const items: Category[] = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
  }));

  return (
    <main className="max-w-4xl">
      <h1 className="text-2xl font-semibold">Service Categories</h1>
      <p className="mt-2 text-sm opacity-70">PRD-first view (API-driven mutations).</p>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-12 gap-2 border-b bg-white/5 px-4 py-3 text-xs uppercase opacity-70">
          <div className="col-span-5">Name</div>
          <div className="col-span-5">Slug</div>
          <div className="col-span-1">Active</div>
          <div className="col-span-1">Order</div>
        </div>

        {items.map((c) => (
          <div key={c.id} className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm">
            <div className="col-span-5">{c.name}</div>
            <div className="col-span-5 opacity-80">{c.slug}</div>
            <div className="col-span-1">{c.isActive ? "Yes" : "No"}</div>
            <div className="col-span-1">{c.order}</div>
          </div>
        ))}
      </div>
    </main>
  );
}