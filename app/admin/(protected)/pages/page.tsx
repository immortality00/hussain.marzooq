import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getAllPageSeo } from "@/lib/server/page-seo";
import { getAllPageSections } from "@/lib/server/page-sections";
import { PagesAdminClient } from "./PagesAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPagesPage() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/pages");

  const [settings, seo, sections] = await Promise.all([
    getAllPageSettings(),
    getAllPageSeo(),
    getAllPageSections(),
  ]);

  return <PagesAdminClient initialSettings={settings} initialSeo={seo} initialSections={sections} />;
}
