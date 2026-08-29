"use client";

import { useMemo, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { useAdminAction } from "@/hooks/useAdminAction";
import { SortableList, useSortableRow } from "@/components/admin/sortable/SortableList";
import { slugifyTag } from "@/lib/server/media-tags";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  postsCount: number;
};

const INPUT = "rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

async function readError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: string; postsCount?: number } | null;
  if (data?.error === "CATEGORY_IN_USE") return `In use by ${data.postsCount ?? 0} post(s).`;
  if (data?.error === "Slug already exists") return "That slug is already used.";
  return data?.error ?? `Request failed (${res.status})`;
}

export default function BlogCategoriesAdminClient({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState<Category[]>(initial);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { feedback, notify, setFeedback } = useAdminAction();

  const ordered = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  async function create() {
    const n = name.trim();
    if (!n || busy) {
      if (!n) notify("err", "Name is required.");
      return;
    }
    setBusy(true);
    setFeedback({ type: "info", text: "Creating…" });
    try {
      const res = await fetch("/api/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, slug: slugifyTag(n) }),
      });
      if (!res.ok) throw new Error(await readError(res));
      setName("");
      notify("ok", "Category created.");
      await refresh();
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Create failed.");
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    const res = await fetch("/api/blog-categories", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { items: Category[] };
      setItems(data.items);
    }
  }

  async function patch(id: string, body: Partial<Category>) {
    const res = await fetch(`/api/blog-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await readError(res));
  }

  async function saveRow(cat: Category, next: { name: string; slug: string }) {
    setFeedback({ type: "info", text: "Saving…" });
    try {
      await patch(cat.id, { name: next.name, slug: slugifyTag(next.slug) });
      setItems((prev) => prev.map((c) => (c.id === cat.id ? { ...c, ...next, slug: slugifyTag(next.slug) } : c)));
      notify("ok", "Category saved.");
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Save failed.");
    }
  }

  async function toggle(cat: Category, value: boolean) {
    try {
      await patch(cat.id, { isActive: value });
      setItems((prev) => prev.map((c) => (c.id === cat.id ? { ...c, isActive: value } : c)));
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Update failed.");
    }
  }

  async function remove(cat: Category) {
    const detach = cat.postsCount > 0;
    const msg = detach
      ? `Delete "${cat.name}"? Its ${cat.postsCount} post(s) become Uncategorized.`
      : `Delete "${cat.name}" forever?`;
    if (!confirm(msg)) return;
    setFeedback({ type: "info", text: "Deleting…" });
    try {
      const res = await fetch(`/api/blog-categories/${cat.id}${detach ? "?detach=1" : ""}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await readError(res));
      setItems((prev) => prev.filter((c) => c.id !== cat.id));
      notify("ok", "Category deleted.");
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Delete failed.");
    }
  }

  function onReorder(activeId: string, overId: string) {
    const oldIndex = ordered.findIndex((c) => c.id === activeId);
    const newIndex = ordered.findIndex((c) => c.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;
    setItems(arrayMove(ordered, oldIndex, newIndex).map((c, idx) => ({ ...c, order: idx })));
  }

  async function saveOrder() {
    setBusy(true);
    setFeedback({ type: "info", text: "Saving order…" });
    try {
      await Promise.all(ordered.map((c, idx) => patch(c.id, { order: idx })));
      notify("ok", "Order saved.");
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Failed to save order.");
    } finally {
      setBusy(false);
    }
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
            className={INPUT}
          />
        </label>
        <AdminButton variant="solid" onClick={create} disabled={busy}>
          Add
        </AdminButton>
      </div>

      {ordered.length > 0 ? (
        <SortableList ids={ordered.map((c) => c.id)} onReorder={onReorder} className="space-y-2">
          {ordered.map((cat) => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              onSave={(next) => saveRow(cat, next)}
              onToggle={(v) => toggle(cat, v)}
              onDelete={() => remove(cat)}
            />
          ))}
        </SortableList>
      ) : (
        <div className="rounded-2xl border p-8 text-sm text-muted-foreground">No categories yet.</div>
      )}
    </div>
  );
}

function CategoryRow({
  cat,
  onSave,
  onToggle,
  onDelete,
}: {
  cat: Category;
  onSave: (next: { name: string; slug: string }) => void;
  onToggle: (value: boolean) => void;
  onDelete: () => void;
}) {
  const { setNodeRef, style, handleProps } = useSortableRow(cat.id);
  const [name, setName] = useState(cat.name);
  const [slug, setSlug] = useState(cat.slug);
  const dirty = name !== cat.name || slug !== cat.slug;

  return (
    <div ref={setNodeRef} style={style} className="flex flex-wrap items-center gap-3 rounded-2xl border p-3">
      <button
        type="button"
        {...handleProps}
        aria-label="Drag to reorder"
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="size-4" />
      </button>

      <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT + " min-w-40 flex-1"} />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} className={INPUT + " min-w-40 flex-1 font-mono text-xs"} />

      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{cat.postsCount}</span>

      <AdminToggle checked={cat.isActive} onChange={onToggle} label={`Toggle ${cat.name}`} />

      {dirty ? (
        <AdminButton variant="solid" size="sm" onClick={() => onSave({ name, slug })}>
          Save
        </AdminButton>
      ) : null}

      <AdminButton variant="danger" size="sm" onClick={onDelete}>
        Delete
      </AdminButton>
    </div>
  );
}
