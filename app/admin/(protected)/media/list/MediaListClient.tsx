"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminLink } from "@/components/admin/AdminLink";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { MediaUsageDialog } from "@/components/admin/media-usage/MediaUsageDialog";
import { MediaListFilterBar } from "./components/MediaListFilterBar";
import { MediaListItem } from "./components/MediaListItem";
import { useMediaListDelete } from "./lib/useMediaListDelete";
import { useMediaListView } from "./lib/useMediaListView";

export default function MediaListClient() {
  const initialCategory = (useSearchParams().get("category") ?? "").trim();
  const { feedback: banner, setFeedback: setBanner } = useAdminAction();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [typeFilter, setTypeFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");

  const { items, nextCursor, loading, loadingMore, loadMore, refresh, removeItems } = useMediaListView(
    { query, category: categoryFilter, type: typeFilter, visibility: visibilityFilter },
    setBanner,
  );

  const activeFilterLabel = useMemo(() => {
    const parts = [
      query.trim() ? `search "${query.trim()}"` : "",
      categoryFilter ? `category ${categoryFilter}` : "",
      typeFilter ? `type ${typeFilter}` : "",
      visibilityFilter || "",
    ].filter(Boolean);
    return parts.length ? parts.join(" • ") : "all media";
  }, [categoryFilter, query, typeFilter, visibilityFilter]);

  const selection = useBulkSelection(items.map((m) => m.id));
  const { del, bulkDelete, deletingId, bulkBusy, usageDialog } = useMediaListDelete({
    items,
    removeItems,
    selection,
    setBanner,
  });

  return (
    <main className="mx-auto max-w-6xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title="Media"
        actions={
          <>
            <AdminLink href="/admin/media" className={adminButtonClasses("default", "md")}>
              Upload new
            </AdminLink>
            <AdminLink href="/admin/media/batch" className={adminButtonClasses("default", "md")}>
              Batch upload
            </AdminLink>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading || Boolean(deletingId)}
              className={adminButtonClasses("default", "md")}
            >
              Refresh
            </button>
          </>
        }
      />

      <AdminActionFeedback feedback={banner} />

      <MediaListFilterBar
        query={query}
        categoryFilter={categoryFilter}
        typeFilter={typeFilter}
        visibilityFilter={visibilityFilter}
        itemCount={items.length}
        activeFilterLabel={activeFilterLabel}
        disabled={Boolean(deletingId)}
        onQueryChange={setQuery}
        onCategoryChange={setCategoryFilter}
        onTypeChange={setTypeFilter}
        onVisibilityChange={setVisibilityFilter}
        onReset={() => { setQuery(""); setCategoryFilter(""); setTypeFilter(""); setVisibilityFilter(""); }}
      />

      {items.length > 0 && (
        <div className="mt-6 flex items-center gap-2.5 text-sm text-muted-foreground">
          <BulkCheckbox
            checked={selection.allSelected}
            indeterminate={selection.count > 0 && !selection.allSelected}
            onChange={selection.toggleAll}
            label="Select all media"
          />
          Select all
        </div>
      )}

      <div className="mt-4 space-y-4">
        {loading && items.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">Loading media…</div>
        ) : null}
        {!loading && items.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
            No media match these filters.
          </div>
        ) : (
          items.map((m, idx) => (
            <div key={m.id} className="flex items-start gap-3">
              <BulkCheckbox
                checked={selection.isSelected(m.id)}
                onChange={() => selection.toggle(m.id)}
                label="Select media item"
                className="mt-4"
              />
              <div className="min-w-0 flex-1">
                <MediaListItem
                  item={m}
                  index={idx}
                  deleting={deletingId === m.id}
                  actionDisabled={Boolean(deletingId)}
                  onDelete={(id) => void del(id)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <BulkActionBar
        count={selection.count}
        busy={bulkBusy}
        onClear={selection.clear}
        actions={[{ label: "Delete", tone: "danger", onRun: bulkDelete }]}
      />

      {nextCursor ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore || Boolean(deletingId)}
            className={adminButtonClasses("default", "md")}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      <MediaUsageDialog dialog={usageDialog} />
    </main>
  );
}
