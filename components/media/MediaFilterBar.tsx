"use client";

import { SearchInput } from "@/components/search/SearchInput";
import MediaTagChips from "./MediaTagChips";
import { TagChipRow, type TagChip } from "./TagChipRow";

export default function MediaFilterBar({
  q,
  setQ,
  activeTag,
  setActiveTag,
  allTags,
  showTagChips = true,
  navChips,
  activeTagSlug,
}: {
  q: string;
  setQ: (value: string) => void;
  activeTag: string;
  setActiveTag: (value: string) => void;
  allTags: string[];
  showTagChips?: boolean;
  // When supplied, the in-place filter chips are replaced by a sideways-scroll
  // row of links to the tag subpages, sharing the toolbar row with the search
  // box. Absent elsewhere (e.g. /people), where the filter chips stay.
  navChips?: TagChip[];
  activeTagSlug?: string;
}) {
  if (navChips) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="order-last min-w-0 basis-full sm:order-none sm:basis-0 sm:flex-1">
          <TagChipRow chips={navChips} activeSlug={activeTagSlug} scroll boxed />
        </div>
        <div className="w-full sm:w-64 sm:shrink-0">
          <SearchInput
            value={q}
            onValueChange={setQ}
            onClear={() => setQ("")}
            placeholder="Search…"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <SearchInput
        value={q}
        onValueChange={setQ}
        onClear={() => setActiveTag("")}
        placeholder="Search by title, location, event, people, tag…"
      />

      {showTagChips && (
        <MediaTagChips activeTag={activeTag} setActiveTag={setActiveTag} allTags={allTags} />
      )}
    </>
  );
}
