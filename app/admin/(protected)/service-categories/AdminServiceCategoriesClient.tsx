"use client";

import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useBulkSelection, runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import CategoriesTable from "./components/CategoriesTable";
import CategoriesToolbar from "./components/CategoriesToolbar";
import CategoryFormCard from "./components/CategoryFormCard";
import { createCategoryRequest, deleteCategoryRequest, fetchCategories, patchCategory } from "./lib/api";
import type { Category, CategoryPatch } from "./lib/types";
import { getErrorMessage, slugify } from "./lib/utils";

export default function AdminServiceCategoriesClient({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState<Category[]>(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const { feedback, setFeedback } = useAdminAction();

  const actionBusy = creating || savingOrder;

  const ordered = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  const selection = useBulkSelection(ordered.map((c) => c.id));
  const [bulkBusy, setBulkBusy] = useState(false);

  async function bulkSetActive(value: boolean) {
    if (bulkBusy || selection.count === 0) return;
    const ids = selection.selectedIds;
    setBulkBusy(true);
    setFeedback({ type: "info", text: value ? "Activating selected…" : "Deactivating selected…" });
    const { ok, failed } = await runBulkAction(ids, (id) => patchCategory(id, { isActive: value }));
    setFeedback({
      type: failed ? "err" : "ok",
      text: `${ok} ${value ? "activated" : "deactivated"}${failed ? `, ${failed} failed` : ""}.`,
    });
    selection.clear();
    await refresh();
    setBulkBusy(false);
  }

  async function bulkDelete() {
    if (bulkBusy || selection.count === 0) return;
    if (!confirm(`Delete ${selection.count} categor(ies)? System or non-empty ones will be skipped.`))
      return;
    const ids = selection.selectedIds;
    setBulkBusy(true);
    setFeedback({ type: "info", text: "Deleting selected categories…" });
    const { ok, failed } = await runBulkAction(ids, (id) => deleteCategoryRequest(id));
    setFeedback({ type: failed ? "err" : "ok", text: `${ok} deleted${failed ? `, ${failed} skipped/failed` : ""}.` });
    selection.clear();
    await refresh();
    setBulkBusy(false);
  }

  async function refresh() {
    setFeedback(null);

    try {
      const next = await fetchCategories();
      setItems(next);
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    }
  }

  async function createCategory() {
    if (actionBusy) return;

    setFeedback(null);
    const n = name.trim();
    const s = (slug.trim() || slugify(n)).trim();

    if (!n) {
      setFeedback({ type: "err", text: "Name is required." });
      return;
    }

    if (!s) {
      setFeedback({ type: "err", text: "Slug is required." });
      return;
    }

    setCreating(true);
    setFeedback({ type: "info", text: "Creating category…" });

    try {
      await createCategoryRequest(n, s);
      setName("");
      setSlug("");
      await refresh();
      setFeedback({ type: "ok", text: "✅ Category created." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    } finally {
      setCreating(false);
    }
  }

  async function editCategory(id: string, patch: CategoryPatch): Promise<boolean> {
    if (actionBusy) return false;

    setFeedback({ type: "info", text: "Updating category…" });

    try {
      await patchCategory(id, patch);
      setItems((prev) => prev.map((c) => (c.id === id ? ({ ...c, ...patch } as Category) : c)));
      setFeedback({ type: "ok", text: "✅ Category updated." });
      return true;
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
      return false;
    }
  }

  async function toggleCategory(id: string, value: boolean) {
    if (actionBusy) return;

    setFeedback({ type: "info", text: value ? "Activating category…" : "Deactivating category and linked services…" });

    try {
      await patchCategory(id, { isActive: value });
      setItems((prev) => prev.map((c) => (c.id === id ? ({ ...c, isActive: value } as Category) : c)));
      await refresh();
      setFeedback({ type: "ok", text: value ? "✅ Category activated." : "✅ Category deactivated." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    }
  }

  async function deleteCategory(cat: Category) {
    if (actionBusy) return;

    setFeedback(null);

    if (cat.isSystem) {
      setFeedback({ type: "err", text: "This is a system category and cannot be deleted." });
      return;
    }

    if (cat.servicesCount > 0) {
      setFeedback({ type: "err", text: `Cannot delete: ${cat.servicesCount} services exist under it.` });
      return;
    }

    const ok = confirm(`Delete category "${cat.name}" forever?\n\nThis cannot be undone.`);
    if (!ok) return;

    setFeedback({ type: "info", text: `Deleting category "${cat.name}"…` });

    try {
      await deleteCategoryRequest(cat.id);
      setItems((prev) => prev.filter((c) => c.id !== cat.id));
      setFeedback({ type: "ok", text: "✅ Category deleted." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    }
  }

  function onReorder(activeId: string, overId: string) {
    if (actionBusy) return;

    const oldIndex = ordered.findIndex((c) => c.id === activeId);
    const newIndex = ordered.findIndex((c) => c.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(ordered, oldIndex, newIndex).map((c, idx) => ({ ...c, order: idx }));
    setItems(moved);
  }

  async function saveOrder() {
    if (actionBusy) return;

    setSavingOrder(true);
    setFeedback({ type: "info", text: "Saving category order…" });

    try {
      await Promise.all(ordered.map((c, idx) => patchCategory(c.id, { order: idx })));
      await refresh();
      setFeedback({ type: "ok", text: "✅ Order saved." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div>
      <CategoriesToolbar savingOrder={savingOrder} onSaveOrder={saveOrder} />

      <AdminActionFeedback feedback={feedback} />

      <CategoryFormCard
        name={name}
        slug={slug}
        setName={(value) => {
          setName(value);
          if (!slug.trim()) setSlug(slugify(value));
        }}
        setSlug={setSlug}
        onCreate={createCategory}
        creating={creating}
        msg=""
      />

      {ordered.length > 0 && (
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
        ordered={ordered}
        isSelected={selection.isSelected}
        onToggleSelect={selection.toggle}
        onReorder={onReorder}
        onEdit={editCategory}
        onToggle={toggleCategory}
        onDelete={deleteCategory}
      />

      <BulkActionBar
        count={selection.count}
        busy={bulkBusy}
        onClear={selection.clear}
        actions={[
          { label: "Activate", onRun: () => bulkSetActive(true) },
          { label: "Deactivate", onRun: () => bulkSetActive(false) },
          { label: "Delete", tone: "danger", onRun: bulkDelete },
        ]}
      />

      <div className="mt-6">
        <button
          type="button"
          disabled={actionBusy}
          onClick={() => void refresh()}
          className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}