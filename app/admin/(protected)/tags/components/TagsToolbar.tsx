"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";

export default function TagsToolbar({
  savingOrder,
  onSaveOrder,
}: {
  savingOrder: boolean;
  onSaveOrder: () => void | Promise<void>;
}) {
  return (
    <AdminPageHeader
      title="Tags"
      description="Media tags power the discipline subpages. Drag to reorder. Deactivating a tag hides its subpage and chips but keeps it on existing media."
      actions={
        <button
          type="button"
          onClick={() => void onSaveOrder()}
          disabled={savingOrder}
          className={adminButtonClasses("default", "md")}
        >
          {savingOrder ? "Saving…" : "Save Order"}
        </button>
      }
    />
  );
}
