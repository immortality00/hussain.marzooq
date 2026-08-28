"use client";

import { adminButtonClasses } from "@/components/admin/AdminButton";
import type { NewTag } from "../lib/types";

export default function TagFormCard({
  draft,
  setDraft,
  onCreate,
  creating,
}: {
  draft: NewTag;
  setDraft: (next: NewTag) => void;
  onCreate: () => void | Promise<void>;
  creating: boolean;
}) {
  return (
    <div className="mt-8 rounded-2xl border p-5">
      <div className="text-sm font-medium">Add Tag</div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Label (e.g. Fashion)"
        />
        <input
          value={draft.slug}
          onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
          className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Slug (auto from label)"
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

      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        className="mt-3 h-16 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        placeholder="Description (optional — used on the subpage header)"
      />
    </div>
  );
}
