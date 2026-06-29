import { SearchInput } from "@/components/search/SearchInput";
import { MEDIA_CATEGORIES } from "../../lib/utils";

type Props = {
  query: string;
  categoryFilter: string;
  typeFilter: string;
  visibilityFilter: string;
  itemCount: number;
  activeFilterLabel: string;
  disabled: boolean;
  onQueryChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onVisibilityChange: (v: string) => void;
  onReset: () => void;
};

export function MediaListFilterBar({
  query,
  categoryFilter,
  typeFilter,
  visibilityFilter,
  itemCount,
  activeFilterLabel,
  disabled,
  onQueryChange,
  onCategoryChange,
  onTypeChange,
  onVisibilityChange,
  onReset,
}: Props) {
  return (
    <>
      <section className="mt-6 rounded-2xl border p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <SearchInput
            value={query}
            onValueChange={onQueryChange}
            placeholder="Search title, tags, people..."
            wrapperClassName="md:col-span-2"
            inputClassName="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            clearButtonClassName="mt-2 rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent"
          />

          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All categories</option>
            {MEDIA_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All types</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="embed">Embed</option>
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => onVisibilityChange(e.target.value)}
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 md:col-span-4">
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className="rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      <div className="mt-4 text-xs text-muted-foreground">
        Showing {itemCount} result{itemCount === 1 ? "" : "s"} for {activeFilterLabel}.
      </div>
    </>
  );
}
