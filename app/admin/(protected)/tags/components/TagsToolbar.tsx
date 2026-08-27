"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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
          className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-60"
        >
          {savingOrder ? "Saving…" : "Save Order"}
        </button>
      }
    />
  );
}
