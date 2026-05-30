import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { ensureOthersCategory } from "@/lib/db/ensureSystemCategories";
import { getDb } from "@/lib/server/db";
import AdminServicesClient from "./AdminServicesClient";
import type { Service, ServiceCategory } from "./lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export default async function AdminServicesPage() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/services");

  const db = await getDb();

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

    const record = row as Record<string, unknown>;
    const serviceId = typeof record._id === "string" ? record._id : "";
    const count = safeNumber(record.count, 0);

    if (serviceId) {
      liveCountMap.set(serviceId, count);
    }
  }

  const services: Service[] = servicesDocs.map((doc) => {
    const id = String(doc._id);

    return {
      id,
      name: typeof doc.name === "string" ? doc.name : "",
      slug: typeof doc.slug === "string" ? doc.slug : "",
      category: typeof doc.category === "string" ? doc.category : "others",
      categoryId: typeof doc.categoryId === "string" ? doc.categoryId : null,
      description: typeof doc.description === "string" ? doc.description : "",
      startingPrice: typeof doc.startingPrice === "number" ? doc.startingPrice : null,
      currency: typeof doc.currency === "string" ? doc.currency : "AED",
      imageUrl: typeof doc.imageUrl === "string" ? doc.imageUrl : "",
      isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
      isArchived: typeof doc.isArchived === "boolean" ? doc.isArchived : false,
      order: typeof doc.order === "number" ? doc.order : 0,
      inquiriesCount: liveCountMap.get(id) ?? 0,
    };
  });

  const categories: ServiceCategory[] = categoryDocs.map((doc) => ({
    id: String(doc._id),
    name: typeof doc.name === "string" ? doc.name : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
    order: typeof doc.order === "number" ? doc.order : 0,
  }));

  return <AdminServicesClient initialServices={services} initialCategories={categories} />;
}