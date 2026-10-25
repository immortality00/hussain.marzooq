"use client";

import { ChipScroller } from "@/components/shared/ChipScroller";
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
    <ChipScroller>
      <button
        type="button"
        onClick={() => setActiveTag("")}
        className={chipClasses(activeTag === "", "shrink-0 whitespace-nowrap")}
      >
        All
      </button>

      {allTags.slice(0, 30).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setActiveTag(t === activeTag ? "" : t)}
          className={chipClasses(t === activeTag, "shrink-0 whitespace-nowrap")}
        >
          {t}
        </button>
      ))}
    </ChipScroller>
  );
}
