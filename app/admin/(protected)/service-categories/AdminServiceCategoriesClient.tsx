"use client";

import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { refreshAdminData } from "@/lib/client/admin-store";
import CategoriesTable from "./components/CategoriesTable";
import CategoriesToolbar from "./components/CategoriesToolbar";
import CategoryFormCard from "./components/CategoryFormCard";
import { useCategoryActions } from "./lib/useCategoryActions";
import { slugify } from "./lib/utils";

export default function AdminServiceCategoriesClient() {
  const categories = useCategoryActions();
  const { selection } = categories;

  return (
    <div>
      <CategoriesToolbar savingOrder={categories.savingOrder} onSaveOrder={categories.saveOrder} />

      <AdminActionFeedback feedback={categories.feedback} />

      <CategoryFormCard
        name={categories.name}
        slug={categories.slug}
        setName={(value) => {
          categories.setName(value);
          if (!categories.slug.trim()) categories.setSlug(slugify(value));
        }}
        setSlug={categories.setSlug}
        onCreate={categories.createCategory}
        creating={categories.creating}
        msg=""
      />

      {categories.ordered.length > 0 && (
        <div className="mt-6 flex items-center gap-2.5 text-sm text-muted-foreground">
          <BulkCheckbox
            checked={selection.allSelected}
            indeterminate={selection.count > 0 && !selection.allSelected}
            onChange={selection.toggleAll}
            label="Select all categories"
          />
          Select all
        </div>
      )}

      <CategoriesTable
        ordered={categories.ordered}
        isSelected={selection.isSelected}
        onToggleSelect={selection.toggle}
        onReorder={categories.onReorder}
        onEdit={categories.editCategory}
        onToggle={categories.toggleCategory}
        onDelete={categories.deleteCategory}
      />

      <BulkActionBar
        count={selection.count}
        busy={categories.bulkBusy}
        onClear={selection.clear}
        actions={[
          { label: "Activate", onRun: () => categories.bulkSetActive(true) },
          { label: "Deactivate", onRun: () => categories.bulkSetActive(false) },
          { label: "Delete", tone: "danger", onRun: categories.bulkDelete },
        ]}
      />

      <div className="mt-6">
        <button
          type="button"
          disabled={categories.actionBusy}
          onClick={() => void refreshAdminData()}
          className={adminButtonClasses("default", "md")}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
