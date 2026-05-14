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
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search title or tags..."
        className="w-full rounded-2xl border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-md"
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