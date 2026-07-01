"use client";

import { useEffect, useMemo, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
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
  const [mounted, setMounted] = useState(false);

  const actionBusy = creating || savingOrder;

  useEffect(() => {
    setMounted(true);
  }, []);

  const ordered = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

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

  async function editCategory(id: string, patch: CategoryPatch) {
    if (actionBusy) return;

    setFeedback({ type: "info", text: "Updating category…" });

    try {
      await patchCategory(id, patch);
      setItems((prev) => prev.map((c) => (c.id === id ? ({ ...c, ...patch } as Category) : c)));
      setFeedback({ type: "ok", text: "✅ Category updated." });
    } catch (e: unknown) {
      setFeedback({ type: "err", text: getErrorMessage(e) });
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

  function onDragEnd(e: DragEndEvent) {
    if (actionBusy) return;

    const { active, over } = e;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = ordered.findIndex((c) => c.id === active.id);
    const newIndex = ordered.findIndex((c) => c.id === over.id);
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

      <CategoriesTable
        mounted={mounted}
        ordered={ordered}
        onDragEnd={onDragEnd}
        onEdit={editCategory}
        onToggle={toggleCategory}
        onDelete={deleteCategory}
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