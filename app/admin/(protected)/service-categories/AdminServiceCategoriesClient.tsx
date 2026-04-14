"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  servicesCount: number;
  isSystem: boolean;
};

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 160);
}

async function patchCategory(
  id: string,
  patch: Partial<Pick<Category, "name" | "slug" | "isActive" | "order">>
) {
  const res = await fetch(`/api/service-categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Update failed");
}

function SortableRow({
  category,
  onEdit,
  onToggle,
  onDelete,
}: {
  category: Category;
  onEdit: (id: string, patch: Partial<Pick<Category, "name" | "slug" | "order">>) => void;
  onToggle: (id: string, value: boolean) => void;
  onDelete: (cat: Category) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm">
      <div className="col-span-1 flex items-center">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-lg border px-2 py-1 text-xs opacity-80 hover:opacity-100"
          title="Drag"
        >
          ⠿
        </button>
      </div>

      <div className="col-span-3">
        <input
          defaultValue={category.name}
          className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== category.name) onEdit(category.id, { name: v });
          }}
          disabled={category.isSystem} // optional lock
        />
      </div>

      <div className="col-span-3">
        <input
          defaultValue={category.slug}
          className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== category.slug) onEdit(category.id, { slug: v });
          }}
          disabled={category.isSystem} // ✅ system slug should not change
        />
      </div>

      <div className="col-span-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={category.isActive} onChange={(e) => onToggle(category.id, e.target.checked)} />
          <span className="text-muted-foreground">{category.isActive ? "Yes" : "No"}</span>
        </label>
      </div>

      <div className="col-span-1 text-muted-foreground">{category.order}</div>

      <div className="col-span-1 text-muted-foreground">{category.servicesCount}</div>

      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          className="rounded-lg border px-2 py-1 text-xs hover:bg-accent transition-colors disabled:opacity-50"
          onClick={() => onDelete(category)}
          disabled={category.isSystem || category.servicesCount > 0}
          title={
            category.isSystem
              ? "System category cannot be deleted"
              : category.servicesCount > 0
              ? "Delete services first"
              : "Delete category"
          }
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminServiceCategoriesClient({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState<Category[]>(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [msg, setMsg] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const ordered = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  async function refresh() {
    setMsg("");
    const res = await fetch("/api/service-categories", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; items?: Category[]; error?: string };
    if (!res.ok || !data.ok || !Array.isArray(data.items)) {
      setMsg(data.error ?? "Refresh failed.");
      return;
    }
    setItems(data.items);
  }

  async function createCategory() {
    setMsg("");
    const n = name.trim();
    const s = (slug.trim() || slugify(n)).trim();
    if (!n) return setMsg("Name is required.");
    if (!s) return setMsg("Slug is required.");

    setCreating(true);
    try {
      const res = await fetch("/api/service-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, slug: s }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Create failed");
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

  async function editCategory(id: string, patch: Partial<Pick<Category, "name" | "slug" | "order">>) {
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
      // API cascade will deactivate services when category turns inactive
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
      const res = await fetch(`/api/service-categories/${cat.id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; servicesCount?: number };
      if (!res.ok || !data.ok) {
        if (data.error === "CATEGORY_HAS_SERVICES") {
          setMsg(`Cannot delete: ${data.servicesCount ?? "some"} services exist under it.`);
        } else {
          setMsg(data.error ?? "Delete failed.");
        }
        return;
      }
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
      // Persist each category order (same pattern as services)
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Service Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag categories to reorder (public tabs follow this order). Turning a category inactive deactivates its services.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void saveOrder()}
          disabled={savingOrder}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-60"
        >
          {savingOrder ? "Saving…" : "Save Order"}
        </button>
      </div>

      <div className="mt-8 rounded-2xl border p-5">
        <div className="text-sm font-medium">Add Category</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug.trim()) setSlug(slugify(e.target.value));
            }}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Name"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Slug"
          />
          <button
            type="button"
            onClick={() => void createCategory()}
            disabled={creating}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {creating ? "Creating…" : "Add"}
          </button>
        </div>

        {msg ? <div className="mt-3 text-sm text-muted-foreground">{msg}</div> : null}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-1"> </div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Slug</div>
          <div className="col-span-2">Active</div>
          <div className="col-span-1">Order</div>
          <div className="col-span-1">Svcs</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ordered.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {ordered.map((c) => (
              <SortableRow
                key={c.id}
                category={c}
                onEdit={(id, patch) => editCategory(id, patch)}
                onToggle={(id, v) => toggleCategory(id, v)}
                onDelete={(cat) => deleteCategory(cat)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}