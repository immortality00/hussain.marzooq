"use client";

import { SearchInput } from "@/components/search/SearchInput";
import MediaTagChips from "./MediaTagChips";

export default function MediaFilterBar({
  q,
  setQ,
  activeTag,
  setActiveTag,
  allTags,
}: {
  q: string;
  setQ: (value: string) => void;
  activeTag: string;
  setActiveTag: (value: string) => void;
  allTags: string[];
}) {
  return (
    <>
      <SearchInput
        value={q}
        onValueChange={setQ}
        onClear={() => setActiveTag("")}
        placeholder="Search by title, location, event, people, tag…"
      />

      <MediaTagChips activeTag={activeTag} setActiveTag={setActiveTag} allTags={allTags} />
    </>
  );
}
