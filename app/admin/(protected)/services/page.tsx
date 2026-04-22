import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { ensureOthersCategory } from "@/lib/db/ensureSystemCategories";
import AdminServicesClient from "./AdminServicesClient";
import type { Service, ServiceCategory } from "./lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export default async function AdminServicesPage() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/services");

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await ensureOthersCategory(db);

  const [servicesDocs, categoryDocs, inquiryCountRows] = await Promise.all([
    db.collection("services").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db.collection("service_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db
      .collection("inquiries")
      .aggregate([
        {
          $match: {
            serviceId: { $type: "string", $ne: "" },
            isArchived: { $ne: true },
          },
        },
        {
          $group: {
            _id: "$serviceId",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
  ]);

  const liveCountMap = new Map<string, number>();
  for (const row of inquiryCountRows) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const serviceId = typeof r._id === "string" ? r._id : "";
    const count = safeNumber(r.count, 0);
    if (serviceId) liveCountMap.set(serviceId, count);
  }

  const services: Service[] = servicesDocs.map((d) => {
    const id = String(d._id);

    return {
      id,
      name: typeof d.name === "string" ? d.name : "",
      slug: typeof d.slug === "string" ? d.slug : "",
      category: typeof d.category === "string" ? d.category : "others",
      description: typeof d.description === "string" ? d.description : "",
      startingPrice: typeof d.startingPrice === "number" ? d.startingPrice : null,
      currency: typeof d.currency === "string" ? d.currency : "AED",
      imageUrl: typeof d.imageUrl === "string" ? d.imageUrl : "",
      isActive: typeof d.isActive === "boolean" ? d.isActive : true,
      isArchived: typeof d.isArchived === "boolean" ? d.isArchived : false,
      order: typeof d.order === "number" ? d.order : 0,
      inquiriesCount: liveCountMap.get(id) ?? 0,
    };
  });

  const categories: ServiceCategory[] = categoryDocs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
  }));

  return <AdminServicesClient initialServices={services} initialCategories={categories} />;
}