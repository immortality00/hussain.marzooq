import { redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { PagesAdminClient } from "./PagesAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPagesPage() {
  const ok = await isAdminAuthedServer();
  if (!ok) redirect("/admin?next=/admin/pages");

  const pages = await getAllPageSettings();
  return <PagesAdminClient initialPages={pages} />;
}
