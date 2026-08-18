"use client";

import type { TagDiscipline } from "@/lib/server/media-tags";
import type { NewTag } from "../lib/types";
import DisciplinePicker from "./DisciplinePicker";

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
  function toggleDiscipline(discipline: TagDiscipline, next: boolean) {
    const set = new Set(draft.disciplines);
    if (next) set.add(discipline);
    else set.delete(discipline);
    setDraft({ ...draft, disciplines: Array.from(set) });
  }

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
          className="rounded-xl bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
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

      <div className="mt-3 space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Subpage disciplines</div>
        <DisciplinePicker selected={draft.disciplines} onToggle={toggleDiscipline} />
      </div>
    </div>
  );
}
