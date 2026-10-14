"use client";

import { chipClasses } from "@/components/shared/chip-classes";

export default function MediaTagChips({
  activeTag,
  setActiveTag,
  allTags,
}: {
  activeTag: string;
  setActiveTag: (value: string) => void;
  allTags: string[];
}) {
  if (!allTags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setActiveTag("")}
        className={chipClasses(activeTag === "")}
      >
        All
      </button>

      {allTags.slice(0, 30).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setActiveTag(t === activeTag ? "" : t)}
          className={chipClasses(t === activeTag)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
