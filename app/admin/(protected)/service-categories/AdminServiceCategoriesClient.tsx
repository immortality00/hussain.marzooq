"use client";

import { useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
  servicesCount?: number;
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

export default function AdminServiceCategoriesClient({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState<Category[]>(initial);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items]);

  async function refresh() {
    setMsg("");
    try {
      const res = await fetch("/api/service-categories", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; items?: Category[]; error?: string };
      if (!res.ok || !data.ok || !Array.isArray(data.items)) {
        setMsg(data.error ?? "Failed to refresh.");
        return;
      }
      setItems(data.items);
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
      const res = await fetch("/api/service-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, slug: s }),
      });

      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Create failed.");
        setCreating(false);
        return;
      }

      setName("");
      setSlug("");
      await refresh();
      setMsg("✅ Category created.");
      setCreating(false);
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
      setCreating(false);
    }
  }

  async function patchCategory(id: string, patch: Partial<Pick<Category, "name" | "slug" | "isActive" | "order">>) {
    setMsg("");
    try {
      const res = await fetch(`/api/service-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Update failed.");
        return;
      }

      setItems((prev) => prev.map((c) => (c.id === id ? ({ ...c, ...patch } as Category) : c)));

      // After toggling inactive, refresh to get updated servicesCount etc
      if ("isActive" in patch) await refresh();
    } catch (e: unknown) {
      setMsg(getErrorMessage(e));
    }
  }

  async function deleteCategory(cat: Category) {
    setMsg("");

    if ((cat.servicesCount ?? 0) > 0) {
      setMsg(`Cannot delete: ${cat.servicesCount} services exist under this category.`);
      return;
    }

    const ok = confirm("Delete this category? This cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetch(`/api/service-categories/${cat.id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean; error?: string; servicesCount?: number };

      if (!res.ok || !data.ok) {
        if (data.error === "CATEGORY_HAS_SERVICES") {
          setMsg(`Cannot delete: ${data.servicesCount ?? "some"} services exist under this category.`);
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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Service Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Categories are used when creating services.{" "}
            <span className="font-medium">Order</span> controls how categories are sorted in admin/public.
          </p>
        </div>
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
            placeholder="Name (e.g. Photography)"
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Slug (e.g. photography)"
          />
          <button
            type="button"
            onClick={() => void createCategory()}
            disabled={creating}
            className="rounded-xl bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {creating ? "Creating..." : "Add"}
          </button>
        </div>

        {msg ? <div className="mt-3 text-sm text-muted-foreground">{msg}</div> : null}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Slug</div>
          <div className="col-span-2">Active</div>
          <div className="col-span-1">Order</div>
          <div className="col-span-2">Services</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {sorted.map((c) => (
          <div key={c.id} className="grid grid-cols-12 gap-2 border-b px-4 py-3 text-sm">
            <div className="col-span-3">
              <input
                defaultValue={c.name}
                className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== c.name) void patchCategory(c.id, { name: v });
                }}
              />
            </div>

            <div className="col-span-3">
              <input
                defaultValue={c.slug}
                className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== c.slug) void patchCategory(c.id, { slug: v });
                }}
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={c.isActive}
                  onChange={(e) => void patchCategory(c.id, { isActive: e.target.checked })}
                />
                <span className="text-muted-foreground">{c.isActive ? "Yes" : "No"}</span>
              </label>
            </div>

            <div className="col-span-1">
              <input
                type="number"
                defaultValue={c.order}
                className="w-full rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v !== c.order) void patchCategory(c.id, { order: v });
                }}
              />
            </div>

            <div className="col-span-2 text-muted-foreground">
              {c.servicesCount ?? 0}
            </div>

            <div className="col-span-1 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => void deleteCategory(c)}
                className="rounded-lg border px-2 py-1 text-xs hover:bg-accent transition-colors disabled:opacity-50"
                disabled={(c.servicesCount ?? 0) > 0}
                title={(c.servicesCount ?? 0) > 0 ? "Delete services first" : "Delete category"}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {sorted.length === 0 ? <div className="p-6 text-sm text-muted-foreground">No categories yet.</div> : null}
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