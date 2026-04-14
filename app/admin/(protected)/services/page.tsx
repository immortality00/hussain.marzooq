import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { ensureOthersCategory } from "@/lib/db/ensureSystemCategories";
import AdminServicesClient from "./AdminServicesClient";
import type { Service, ServiceCategory } from "./lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminServicesPage() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/services");

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await ensureOthersCategory(db);

  const [servicesDocs, categoryDocs] = await Promise.all([
    db.collection("services").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
    db.collection("service_categories").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
  ]);

  const services: Service[] = servicesDocs.map((d) => ({
    id: String(d._id),
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
    inquiriesCount: typeof d.inquiriesCount === "number" ? d.inquiriesCount : 0,
  }));

  const categories: ServiceCategory[] = categoryDocs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
  }));

  return <AdminServicesClient initialServices={services} initialCategories={categories} />;
}