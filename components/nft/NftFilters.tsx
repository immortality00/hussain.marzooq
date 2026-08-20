"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";

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
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {TABS.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStatusFilter(tab.value)}
              className={`hm-chip ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

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
            className="hm-chip border-border text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Search NFTs"
          onClick={() => setSearchOpen(true)}
          className="hm-chip gap-2 border-border text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      )}
    </section>
  );
}
