"use client";

import { useEffect, useMemo, type MouseEvent } from "react";
import { AdminLink } from "@/components/admin/AdminLink";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useAddressValues } from "@/hooks/useAddressValues";
import { useDebouncedText } from "@/hooks/useDebouncedSearch";
import { useListReturn } from "@/hooks/useListReturn";
import { leaveList, rowElement } from "@/lib/client/list-return";
import { useBulkSelection } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { MediaUsageDialog } from "@/components/admin/media-usage/MediaUsageDialog";
import { RecordChangedDialog } from "@/components/admin/record-changed/RecordChangedDialog";
import { filtersFromAddress, MEDIA_LIST, MEDIA_LIST_PARAMS } from "../lib/media-list-address";
import { filtersKey } from "../lib/media-pages";
import { rememberShownView } from "../lib/media-page-sets";
import { MediaListFilterBar } from "./components/MediaListFilterBar";
import { MediaListItem } from "./components/MediaListItem";
import { useMediaListDelete } from "./lib/useMediaListDelete";
import { useMediaListLabels } from "./lib/useMediaListLabels";
import { useMediaListView } from "./lib/useMediaListView";

const NO_ADDRESS = { q: "", category: "", type: "", visibility: "" };

export default function MediaListClient() {
  const { feedback: banner, setFeedback: setBanner } = useAdminAction();
  const [address, setAddress] = useAddressValues(MEDIA_LIST_PARAMS);
  const search = useDebouncedText(address.q, (q) => setAddress({ q }));
  const filters = useMemo(() => filtersFromAddress(address), [address]);
  const view = filtersKey(filters);

  useEffect(() => rememberShownView(filters), [filters]);

  const { items, nextCursor, loading, loadingMore, loadMore, refresh, removeItems, replaceItem } = useMediaListView(
    filters,
    setBanner,
  );
  useListReturn(MEDIA_LIST, view, !loading);

  const activeFilterLabel = useMemo(() => {
    const parts = [
      filters.query.trim() ? `search "${filters.query.trim()}"` : "",
      filters.category ? `category ${filters.category}` : "",
      filters.type ? `type ${filters.type}` : "",
      filters.visibility || "",
    ].filter(Boolean);
    return parts.length ? parts.join(" • ") : "all media";
  }, [filters]);

  const selection = useBulkSelection(items.map((m) => m.id));
  const { del, bulkDelete, deletingId, bulkBusy, usageDialog } = useMediaListDelete({
    items,
    removeItems,
    selection,
    setBanner,
  });
  const labels = useMediaListLabels({ replaceItem, setBanner });

  function openItem(id: string, event: MouseEvent<HTMLAnchorElement>) {
    leaveList(MEDIA_LIST, view, id, rowElement(event.currentTarget));
  }

  function resetFilters() {
    search.clear();
    setAddress(NO_ADDRESS);
  }

  return (
    <main className="mx-auto max-w-6xl px-0 py-3 md:px-6 md:py-10">
      <AdminPageHeader
        title="Media"
        actions={
          <>
            <AdminLink href="/admin/media" className={adminButtonClasses("default", "md")}>
              New upload
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
        query={search.text}
        categoryFilter={address.category}
        typeFilter={address.type}
        visibilityFilter={address.visibility}
        itemCount={items.length}
        activeFilterLabel={activeFilterLabel}
        disabled={Boolean(deletingId)}
        onQueryChange={search.setText}
        onQueryClear={search.clear}
        onCategoryChange={(category) => setAddress({ category })}
        onTypeChange={(type) => setAddress({ type })}
        onVisibilityChange={(visibility) => setAddress({ visibility })}
        onReset={resetFilters}
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
                  onOpen={openItem}
                  onDelete={(id) => void del(id)}
                  labels={labels}
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
      <MediaUsageDialog dialog={labels.usageDialog} />
      <RecordChangedDialog dialog={labels.changedDialog} />
    </main>
  );
}
