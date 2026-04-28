"use client";

import { useEffect, useMemo, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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
  const [msg, setMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ordered = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  async function refresh() {
    setMsg("");
    try {
      const next = await fetchCategories();
      setItems(next);
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    }
  }

  async function createCategory() {
    setMsg("");
    const n = name.trim();
    const s = (slug.trim() || slugify(n)).trim();

    if (!n) return setMsg("Name is required.");
    if (!s) return setMsg("Slug is required.");

    setCreating(true);
    try {
      await createCategoryRequest(n, s);
      setName("");
      setSlug("");
      await refresh();
      setMsg("✅ Created.");
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    } finally {
      setCreating(false);
    }
  }

  async function editCategory(id: string, patch: CategoryPatch) {
    setMsg("");
    try {
      await patchCategory(id, patch);
      setItems((prev) => prev.map((c) => (c.id === id ? ({ ...c, ...patch } as Category) : c)));
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    }
  }

  async function toggleCategory(id: string, value: boolean) {
    setMsg("");
    try {
      await patchCategory(id, { isActive: value });
      setItems((prev) => prev.map((c) => (c.id === id ? ({ ...c, isActive: value } as Category) : c)));
      await refresh();
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    }
  }

  async function deleteCategory(cat: Category) {
    setMsg("");

    if (cat.isSystem) return setMsg("This is a system category and cannot be deleted.");
    if (cat.servicesCount > 0) return setMsg(`Cannot delete: ${cat.servicesCount} services exist under it.`);

    const ok = confirm(`Delete category "${cat.name}" forever?\n\nThis cannot be undone.`);
    if (!ok) return;

    try {
      await deleteCategoryRequest(cat.id);
      setItems((prev) => prev.filter((c) => c.id !== cat.id));
      setMsg("✅ Deleted.");
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    }
  }

  function onDragEnd(e: DragEndEvent) {
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
    setMsg("");
    setSavingOrder(true);
    try {
      await Promise.all(ordered.map((c, idx) => patchCategory(c.id, { order: idx })));
      setMsg("✅ Order saved.");
      await refresh();
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div>
      <CategoriesToolbar savingOrder={savingOrder} onSaveOrder={saveOrder} />

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
        msg={msg}
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
          onClick={() => void refresh()}
          className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}