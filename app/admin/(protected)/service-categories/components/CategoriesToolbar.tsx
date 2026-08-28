"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminButtonClasses } from "@/components/admin/AdminButton";

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
          className={adminButtonClasses("default", "md")}
        >
          {savingOrder ? "Saving…" : "Save Order"}
        </button>
      }
    />
  );
}