import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  serviceId: string | null;
  category: string | null;
  status: string;
  createdAt: string | null;
};

export default async function AdminInquiriesPage() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/inquiries");

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db.collection("inquiries").find({}).sort({ createdAt: -1 }).limit(200).toArray();

  const items: Inquiry[] = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    email: typeof d.email === "string" ? d.email : "",
    message: typeof d.message === "string" ? d.message : "",
    serviceId: typeof d.serviceId === "string" ? d.serviceId : null,
    category: typeof d.category === "string" ? d.category : null,
    status: typeof d.status === "string" ? d.status : "new",
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : (d.createdAt ? String(d.createdAt) : null),
  }));

  return (
    <main className="max-w-6xl">
      <h1 className="text-2xl font-semibold">Inquiries</h1>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-12 gap-2 border-b bg-white/5 px-4 py-3 text-xs uppercase opacity-70">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-4">Message</div>
        </div>

        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm">
            <div className="col-span-2 text-xs opacity-70">{it.createdAt ?? ""}</div>
            <div className="col-span-2">{it.name}</div>
            <div className="col-span-2">{it.email}</div>
            <div className="col-span-2">{it.status}</div>
            <div className="col-span-4 whitespace-pre-wrap">{it.message}</div>
          </div>
        ))}
      </div>
    </main>
  );
}