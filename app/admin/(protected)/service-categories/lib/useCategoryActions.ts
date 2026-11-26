"use client";

import { useState } from "react";
import { useDraftOrder } from "@/hooks/useDraftOrder";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { useBulkRunner } from "@/components/admin/bulk/useBulkRunner";
import { CANNOT_UNDO, deleteQuestion, useConfirmDialog } from "@/components/admin/choice-dialog/ConfirmDialog";
import { countOf } from "@/lib/plural";
import { createCategoryRequest, deleteCategoryRequest, patchCategory } from "./api";
import type { Category, CategoryPatch } from "./types";
import { slugify } from "./utils";

export function useCategoryActions() {
  const [items, setItems] = useAdminSlice("serviceCategories");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const { feedback, setFeedback } = useAdminAction();
  const confirmation = useConfirmDialog(() => setFeedback(null));
  const { ordered, move, save } = useDraftOrder(items, setItems);

  const actionBusy = creating || savingOrder;
  const labelOf = (id: string) => items.find((c) => c.id === id)?.name ?? "Category";
  const fail = (e: unknown) => setFeedback({ type: "err", text: errorMessage(e) });
  const { selection, busy: bulkBusy, run: runBulk } = useBulkRunner(ordered.map((c) => c.id), labelOf, setFeedback);

  function applyActive(ids: string[], value: boolean) {
    setItems((prev) => prev.map((c) => (ids.includes(c.id) ? { ...c, isActive: value } : c)));
  }

  const bulkSetActive = (value: boolean) =>
    runBulk(
      value ? "Activating selected…" : "Deactivating selected…",
      value ? "activated" : "deactivated",
      (id) => patchCategory(id, { isActive: value }),
      (okIds) => applyActive(okIds, value)
    );

  async function bulkDelete() {
    const what = countOf(selection.count, "category", "categories");
    const question = deleteQuestion(what, `Others and any with services are kept. ${CANNOT_UNDO}`);
    if (!(await confirmation.ask(question))) return;
    return runBulk("Deleting selected categories…", "deleted", deleteCategoryRequest, (okIds) =>
      setItems((prev) => prev.filter((c) => !okIds.includes(c.id)))
    );
  }

  async function createCategory() {
    if (actionBusy) return;
    const n = name.trim();
    const s = (slug.trim() || slugify(n)).trim();
    if (!n) return setFeedback({ type: "err", text: "Name is required." });
    if (!s) return setFeedback({ type: "err", text: "Slug is required." });

    setCreating(true);
    setFeedback({ type: "info", text: "Creating category…" });
    try {
      const created = await createCategoryRequest(n, s);
      setItems((prev) => [...prev.filter((c) => c.id !== created.id), created]);
      setName("");
      setSlug("");
      setFeedback({ type: "ok", text: "Category created." });
    } catch (e: unknown) {
      fail(e);
    } finally {
      setCreating(false);
    }
  }

  async function editCategory(id: string, patch: CategoryPatch): Promise<boolean> {
    if (actionBusy) return false;
    setFeedback({ type: "info", text: "Updating category…" });
    try {
      await patchCategory(id, patch);
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      setFeedback({ type: "ok", text: "Category updated." });
      return true;
    } catch (e: unknown) {
      fail(e);
      return false;
    }
  }

  async function toggleCategory(id: string, value: boolean) {
    if (actionBusy) return;
    setFeedback({ type: "info", text: value ? "Activating category…" : "Deactivating category and linked services…" });
    try {
      await patchCategory(id, { isActive: value });
      applyActive([id], value);
      setFeedback({ type: "ok", text: value ? "Category activated." : "Category deactivated." });
    } catch (e: unknown) {
      fail(e);
    }
  }

  async function deleteCategory(cat: Category) {
    if (actionBusy) return;
    if (cat.isSystem) return setFeedback({ type: "err", text: "This is a system category and cannot be deleted." });
    if (cat.servicesCount > 0) {
      return setFeedback({ type: "err", text: `Can't delete “${cat.name}”: it has ${countOf(cat.servicesCount, "service")}.` });
    }
    setFeedback(null);
    if (!(await confirmation.ask(deleteQuestion(`“${cat.name}”`)))) return;

    setFeedback({ type: "info", text: `Deleting category “${cat.name}”…` });
    try {
      await deleteCategoryRequest(cat.id);
      setItems((prev) => prev.filter((c) => c.id !== cat.id));
      setFeedback({ type: "ok", text: "Category deleted." });
    } catch (e: unknown) {
      fail(e);
    }
  }

  async function saveOrder() {
    if (actionBusy) return;
    setSavingOrder(true);
    setFeedback({ type: "info", text: "Saving category order…" });
    try {
      await save((id, order) => patchCategory(id, { order }));
      setFeedback({ type: "ok", text: "Order saved." });
    } catch (e: unknown) {
      fail(e);
    } finally {
      setSavingOrder(false);
    }
  }

  function onReorder(activeId: string, overId: string) {
    if (!actionBusy) move(activeId, overId);
  }

  return {
    ordered, name, setName, slug, setSlug, creating, savingOrder, actionBusy, feedback, selection, bulkBusy,
    bulkSetActive, bulkDelete, createCategory, editCategory, toggleCategory, deleteCategory, saveOrder, onReorder,
    confirmDialog: confirmation.dialog,
  };
}
