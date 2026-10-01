"use client";

import { useState } from "react";
import { useDraftOrder } from "@/hooks/useDraftOrder";
import { useAdminSlice } from "@/hooks/useAdminData";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { adminInputClasses } from "@/components/admin/admin-input";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { errorMessage, useAdminAction } from "@/hooks/useAdminAction";
import { SortableList } from "@/components/admin/sortable/SortableList";
import { slugifyTag } from "@/lib/server/media-tags";
import { BlogCategoryRow } from "./components/BlogCategoryRow";
import { createBlogCategory, deleteBlogCategory, patchBlogCategory, type BlogCategory } from "./lib/api";

export default function BlogCategoriesAdminClient() {
  const [items, setItems] = useAdminSlice("blogCategories");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { feedback, notify, setFeedback } = useAdminAction();
  const { ordered, move, save } = useDraftOrder(items, setItems);

  async function attempt(busyText: string, work: () => Promise<void>, okText: string) {
    setFeedback({ type: "info", text: busyText });
    try {
      await work();
      notify("ok", okText);
    } catch (e) {
      notify("err", errorMessage(e, "Request failed."));
    }
  }

  async function create() {
    const n = name.trim();
    if (!n) return notify("err", "Name is required.");
    if (busy) return;
    setBusy(true);
    await attempt("Creating…", async () => {
      const created = await createBlogCategory(n, slugifyTag(n));
      setItems((prev) => [...prev.filter((c) => c.id !== created.id), created]);
      setName("");
    }, "Category created.");
    setBusy(false);
  }

  const saveRow = (cat: BlogCategory, next: { name: string; slug: string }) =>
    attempt("Saving…", async () => {
      const slug = slugifyTag(next.slug);
      await patchBlogCategory(cat.id, { name: next.name, slug });
      setItems((prev) => prev.map((c) => (c.id === cat.id ? { ...c, name: next.name, slug } : c)));
    }, "Category saved.");

  async function toggle(cat: BlogCategory, value: boolean) {
    try {
      await patchBlogCategory(cat.id, { isActive: value });
      setItems((prev) => prev.map((c) => (c.id === cat.id ? { ...c, isActive: value } : c)));
    } catch (e) {
      notify("err", errorMessage(e, "Update failed."));
    }
  }

  function remove(cat: BlogCategory) {
    const detach = cat.postsCount > 0;
    const question = detach
      ? `Delete "${cat.name}"? Its ${cat.postsCount} post(s) become Uncategorized.`
      : `Delete "${cat.name}" forever?`;
    if (!confirm(question)) return;
    return attempt("Deleting…", async () => {
      await deleteBlogCategory(cat.id, detach);
      setItems((prev) => prev.filter((c) => c.id !== cat.id));
    }, "Category deleted.");
  }

  async function saveOrder() {
    setBusy(true);
    await attempt("Saving order…", () => save((id, order) => patchBlogCategory(id, { order })), "Order saved.");
    setBusy(false);
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Blog Categories"
        actions={
          ordered.length > 1 ? (
            <AdminButton variant="default" onClick={saveOrder} disabled={busy}>
              Save order
            </AdminButton>
          ) : undefined
        }
      />

      <AdminActionFeedback feedback={feedback} className="" />

      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-1.5">
          <span className="block text-xs text-muted-foreground">New category</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="Category name"
            className={adminInputClasses("md", "w-auto")}
          />
        </label>
        <AdminButton variant="solid" onClick={create} disabled={busy}>
          Add
        </AdminButton>
      </div>

      {ordered.length > 0 ? (
        <SortableList ids={ordered.map((c) => c.id)} onReorder={move} className="space-y-2">
          {ordered.map((cat) => (
            <BlogCategoryRow
              key={`${cat.id}:${cat.name}:${cat.slug}`}
              cat={cat}
              onSave={(next) => void saveRow(cat, next)}
              onToggle={(v) => void toggle(cat, v)}
              onDelete={() => void remove(cat)}
            />
          ))}
        </SortableList>
      ) : (
        <div className="rounded-2xl border p-8 text-sm text-muted-foreground">No categories yet.</div>
      )}
    </div>
  );
}
