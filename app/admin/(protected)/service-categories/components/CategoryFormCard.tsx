"use client";

import { adminButtonClasses } from "@/components/admin/AdminButton";

export default function CategoryFormCard({
  name,
  slug,
  setName,
  setSlug,
  onCreate,
  creating,
  msg,
}: {
  name: string;
  slug: string;
  setName: (value: string) => void;
  setSlug: (value: string) => void;
  onCreate: () => void | Promise<void>;
  creating: boolean;
  msg: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border p-5">
      <div className="text-sm font-medium">Add Category</div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          onClick={() => void onCreate()}
          disabled={creating}
          className={adminButtonClasses("solid", "md")}
        >
          {creating ? "Creating…" : "Add"}
        </button>
      </div>

      {msg ? <div className="mt-3 text-sm text-muted-foreground">{msg}</div> : null}
    </div>
  );
}