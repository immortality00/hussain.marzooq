import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getAllPageSeo } from "@/lib/server/page-seo";
import { SeoAdminClient } from "./SeoAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSeoPage() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/seo");

  const pages = await getAllPageSeo();
  return <SeoAdminClient initialPages={pages} />;
}
