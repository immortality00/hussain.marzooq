import { notFound } from "next/navigation";
import { PAGE_ROWS } from "../lib/rows";
import { PageEditorClient } from "./PageEditorClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export const dynamicParams = false;

export function generateStaticParams() {
  return PAGE_ROWS.map((row) => ({ slug: row.key }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!PAGE_ROWS.some((row) => row.key === slug)) notFound();

  return (
    <AdminScreen reads={["pages"]}>
      <PageEditorClient key={slug} slug={slug} />
    </AdminScreen>
  );
}
