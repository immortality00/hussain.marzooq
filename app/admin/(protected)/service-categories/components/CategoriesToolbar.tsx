"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function CategoriesToolbar({
  savingOrder,
  onSaveOrder,
}: {
  savingOrder: boolean;
  onSaveOrder: () => void | Promise<void>;
}) {
  return (
    <AdminPageHeader
      title="Service Categories"
      description="Drag categories to reorder. Turning a category inactive deactivates linked services too."
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