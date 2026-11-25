"use client";

import { ExpandingSearch } from "@/components/search/ExpandingSearch";
import { SearchInput } from "@/components/search/SearchInput";
import { StickyToolbar } from "@/components/shared/StickyToolbar";
import MediaTagChips from "./MediaTagChips";
import { TagChipRow, type TagChip } from "./TagChipRow";

export default function MediaFilterBar({
  q,
  setQ,
  clearQ,
  activeTag,
  setActiveTag,
  allTags,
  showTagChips = true,
  navChips,
  activeTagSlug,
}: {
  q: string;
  setQ: (value: string) => void;
  clearQ: () => void;
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
      <StickyToolbar>
        <div className="flex flex-wrap items-center gap-3">
          <div className="order-last min-w-0 basis-full sm:order-none sm:basis-0 sm:flex-1">
            <TagChipRow chips={navChips} activeSlug={activeTagSlug} scroll boxed />
          </div>
          <div className="w-full sm:w-64 sm:shrink-0">
            <SearchInput
              value={q}
              onValueChange={setQ}
              onClear={clearQ}
              placeholder="Search…"
            />
          </div>
        </div>
      </StickyToolbar>
    );
  }

  // A person's page: the tag chips and the search share one line, the search at the end like
  // the site's other search bars (and clear of the social icons floating on a phone's left
  // edge). On a phone the search is an icon until tapped (ExpandingSearch).
  const tagChips = showTagChips && allTags.length > 0;

  return (
    <StickyToolbar>
      <div className="flex items-center gap-2 md:gap-3">
        {tagChips ? (
          <div className="min-w-0 flex-1">
            <MediaTagChips activeTag={activeTag} setActiveTag={setActiveTag} allTags={allTags} />
          </div>
        ) : null}

        <ExpandingSearch
          value={q}
          onValueChange={setQ}
          onClear={() => {
            clearQ();
            setActiveTag("");
          }}
          placeholder="Search…"
          collapsible={tagChips}
        />
      </div>
    </StickyToolbar>
  );
}
