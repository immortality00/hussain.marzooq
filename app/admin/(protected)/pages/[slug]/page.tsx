import { notFound, redirect } from "next/navigation";
import { isAdminAuthedServer } from "@/lib/auth/admin";
import { getAllPageSettings } from "@/lib/server/page-settings";
import { getAllPageSeo } from "@/lib/server/page-seo";
import { getAllPageSections } from "@/lib/server/page-sections";
import { PAGE_ROWS } from "../lib/rows";
import { PageEditorClient } from "./PageEditorClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ok = await isAdminAuthedServer();
  if (!ok) redirect(`/admin?next=/admin/pages/${slug}`);

  if (!PAGE_ROWS.some((row) => row.key === slug)) notFound();

  const [settings, seo, sections] = await Promise.all([
    getAllPageSettings(),
    getAllPageSeo(),
    getAllPageSections(),
  ]);

  return (
    <PageEditorClient
      slug={slug}
      initialSettings={settings}
      initialSeo={seo}
      initialSections={sections}
    />
  );
}
