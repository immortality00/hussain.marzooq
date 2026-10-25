import { SearchInput } from "@/components/search/SearchInput";
import { ChipScroller } from "@/components/shared/ChipScroller";
import { StickyToolbar } from "@/components/shared/StickyToolbar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { MEDIA_CATEGORIES } from "../../lib/utils";
import { adminInputClasses } from "@/components/admin/admin-input";

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

const SELECT = adminInputClasses("md", "w-auto shrink-0");

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
  const filtered = Boolean(query.trim() || categoryFilter || typeFilter || visibilityFilter);

  return (
    <>
      <StickyToolbar surface="admin" className="mt-6 [--sticky-bleed:0.75rem] md:[--sticky-bleed:2.75rem]">
        <section className="flex flex-col gap-2 rounded-2xl border p-3 lg:flex-row lg:items-center lg:gap-3">
          <SearchInput
            value={query}
            onValueChange={onQueryChange}
            placeholder="Search title, tags, people..."
            showClear={false}
            wrapperClassName="min-w-0 lg:flex-1"
            inputClassName={adminInputClasses()}
          />

          <ChipScroller className="lg:shrink-0">
            <select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)} className={SELECT}>
              <option value="">All categories</option>
              {MEDIA_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>

            <select value={typeFilter} onChange={(e) => onTypeChange(e.target.value)} className={SELECT}>
              <option value="">All types</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="embed">Embed</option>
            </select>

            <select value={visibilityFilter} onChange={(e) => onVisibilityChange(e.target.value)} className={SELECT}>
              <option value="">All visibility</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            {filtered ? (
              <button
                type="button"
                onClick={onReset}
                disabled={disabled}
                className={adminButtonClasses("default", "md", "shrink-0 whitespace-nowrap")}
              >
                Clear filters
              </button>
            ) : null}
          </ChipScroller>
        </section>
      </StickyToolbar>

      <div className="mt-4 text-xs text-muted-foreground">
        Showing {itemCount} result{itemCount === 1 ? "" : "s"} for {activeFilterLabel}.
      </div>
    </>
  );
}
