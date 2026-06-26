"use client";

import { SearchInput } from "@/components/search/SearchInput";

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

      {allTags.length ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag("")}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              activeTag === "" ? "bg-accent" : "hover:bg-accent/40"
            }`}
          >
            All
          </button>

          {allTags.slice(0, 30).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTag(t === activeTag ? "" : t)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                t === activeTag ? "bg-accent" : "hover:bg-accent/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
