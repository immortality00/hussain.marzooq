"use client";

import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import BatchMediaClient from "./BatchMediaClient";

export default function AdminMediaBatchPage() {
  return (
    <main className="mx-auto max-w-5xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title="Batch Upload"
        actions={
          <>
            <Link href="/admin/media" className={adminButtonClasses("default", "md")}>
              Single upload
            </Link>
            <Link href="/admin/media/list" className={adminButtonClasses("default", "md")}>
              View list
            </Link>
          </>
        }
      />

      <BatchMediaClient />
    </main>
  );
}
