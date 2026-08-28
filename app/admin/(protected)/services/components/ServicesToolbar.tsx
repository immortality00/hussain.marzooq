"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";

export default function ServicesToolbar({
  busy,
  onSyncInquiryCounts,
  onCreate,
  onSaveOrder,
}: {
  busy: boolean;
  onSyncInquiryCounts: () => void | Promise<void>;
  onCreate: () => void;
  onSaveOrder: () => void | Promise<void>;
}) {
  return (
    <AdminPageHeader
      title="Services"
      className="mt-4"
      actions={
        <>
          <button
            disabled={busy}
            onClick={() => void onSyncInquiryCounts()}
            className={adminButtonClasses("default", "md")}
          >
            Sync Inquiry Counts
          </button>
          <button
            disabled={busy}
            onClick={onCreate}
            className={adminButtonClasses("solid", "md")}
          >
            Create
          </button>
          <button
            disabled={busy}
            onClick={() => void onSaveOrder()}
            className={adminButtonClasses("default", "md")}
          >
            Save Order
          </button>
        </>
      }
    />
  );
}