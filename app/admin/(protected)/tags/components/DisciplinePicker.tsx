"use client";

import { TAG_DISCIPLINES, type TagDiscipline } from "@/lib/server/media-tags";

export default function DisciplinePicker({
  selected,
  onToggle,
}: {
  selected: TagDiscipline[];
  onToggle: (discipline: TagDiscipline, next: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TAG_DISCIPLINES.map((d) => {
        const active = selected.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => onToggle(d, !active)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              active ? "bg-foreground text-background" : "hover:bg-accent"
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
