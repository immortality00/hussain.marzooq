"use client";

import { SearchInput } from "@/components/search/SearchInput";

type StatusFilter = "" | "available" | "sold" | "coming-soon";

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
  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SearchInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search title or tags..."
        wrapperClassName="contents"
      />

      <div className="flex flex-wrap gap-2">
        {[
          { value: "", label: "All" },
          { value: "available", label: "Available" },
          { value: "sold", label: "Sold" },
          { value: "coming-soon", label: "Coming soon" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setStatusFilter(item.value as StatusFilter)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              statusFilter === item.value ? "bg-accent" : "hover:bg-accent/40"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}