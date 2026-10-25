"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import { ChipScroller } from "@/components/shared/ChipScroller";
import { StickyToolbar } from "@/components/shared/StickyToolbar";
import { chipClasses } from "@/components/shared/chip-classes";

type StatusFilter = "" | "available" | "sold" | "coming-soon";

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "coming-soon", label: "Coming soon" },
];

export default function NftFilters({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
}: {
  query: string;
  setQuery: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.querySelector("input")?.focus();
  }, [searchOpen]);

  return (
    <StickyToolbar>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ChipScroller className="min-w-0" role="tablist" aria-label="Filter by status">
          {TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab.value)}
                className={chipClasses(active, "shrink-0 whitespace-nowrap")}
              >
                {tab.label}
              </button>
            );
          })}
        </ChipScroller>

        {searchOpen ? (
          <div ref={searchRef} className="flex items-center gap-2">
            <SearchInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search title or tags..."
              showClear={false}
              wrapperClassName="contents"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
              className={chipClasses()}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label="Search NFTs"
            onClick={() => setSearchOpen(true)}
            className={chipClasses(false, "gap-2")}
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        )}
      </section>
    </StickyToolbar>
  );
}
