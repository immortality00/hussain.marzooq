"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminActionFeedback } from "@/components/admin/action-feedback/AdminActionFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminAction } from "@/hooks/useAdminAction";
import { useBulkSelection, runBulkAction } from "@/components/admin/bulk/useBulkSelection";
import { BulkCheckbox } from "@/components/admin/bulk/BulkCheckbox";
import { BulkActionBar } from "@/components/admin/bulk/BulkActionBar";
import { adminButtonClasses } from "@/components/admin/AdminButton";
import { MediaListFilterBar } from "./components/MediaListFilterBar";
import { MediaListItem, type MediaItem } from "./components/MediaListItem";

type AdminMediaListResponse = {
  ok?: boolean;
  items?: MediaItem[];
  nextCursor?: string | null;
  error?: string;
};

type LoadMode = "replace" | "append";

const SEARCH_DEBOUNCE_MS = 250;

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Unknown error";
}

function buildAdminMediaUrl({
  query, category, type, visibility, cursor,
}: {
  query: string; category: string; type: string; visibility: string; cursor?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("limit", "60");
  if (query.trim()) params.set("q", query.trim());
  if (category.trim()) params.set("category", category.trim());
  if (type.trim()) params.set("type", type.trim());
  if (visibility.trim()) params.set("visibility", visibility.trim());
  if (cursor) params.set("cursor", cursor);
  return `/api/media/admin-list?${params.toString()}`;
}

export default function AdminMediaListPage() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") ?? "").trim();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { feedback: banner, setFeedback: setBanner } = useAdminAction();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [typeFilter, setTypeFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");

  const activeFilterLabel = useMemo(() => {
    const parts = [
      query.trim() ? `search "${query.trim()}"` : "",
      categoryFilter ? `category ${categoryFilter}` : "",
      typeFilter ? `type ${typeFilter}` : "",
      visibilityFilter || "",
    ].filter(Boolean);
    return parts.length ? parts.join(" • ") : "all media";
  }, [categoryFilter, query, typeFilter, visibilityFilter]);

  const load = useCallback(
    async (mode: LoadMode = "replace", cursor?: string | null) => {
      setBanner(null);
      if (mode === "append") setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await fetch(
          buildAdminMediaUrl({ query, category: categoryFilter, type: typeFilter, visibility: visibilityFilter, cursor }),
          { cache: "no-store" }
        );
        const data = (await res.json().catch(() => null)) as AdminMediaListResponse | null;
        if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
          setBanner({ type: "err", text: data?.error ?? "Failed to load media." });
          return;
        }
        setItems((prev) => {
          if (mode === "replace") return data.items ?? [];
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...(data.items ?? []).filter((i) => !seen.has(i.id))];
        });
        setNextCursor(data.nextCursor ?? null);
      } catch (e: unknown) {
        setBanner({ type: "err", text: `Failed to load: ${getErrorMessage(e)}` });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categoryFilter, query, typeFilter, visibilityFilter, setBanner]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => { void load("replace"); }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selection = useBulkSelection(items.map((m) => m.id));
  const [bulkBusy, setBulkBusy] = useState(false);

  async function bulkDelete() {
    if (bulkBusy || selection.count === 0) return;
    if (!confirm(`Delete ${selection.count} media item(s) forever? This cannot be undone.`)) return;
    const ids = selection.selectedIds;
    setBulkBusy(true);
    setBanner({ type: "info", text: "Deleting selected media…" });
    const { ok, failed, okIds } = await runBulkAction(ids, async (id) => {
      const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean };
      if (!res.ok || !data?.ok) throw new Error();
    });
    setItems((prev) => prev.filter((x) => !okIds.includes(x.id)));
    setBanner({ type: failed ? "err" : "ok", text: `${ok} deleted${failed ? `, ${failed} failed` : ""}.` });
    selection.clear();
    setBulkBusy(false);
  }

  async function del(id: string) {
    if (deletingId) return;
    if (!confirm("Delete this media forever? This cannot be undone.")) return;
    setDeletingId(id);
    setBanner({ type: "info", text: "Deleting media and cleaning Cloudinary asset…" });
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string };
      if (!res.ok || !data?.ok) {
        setBanner({ type: "err", text: data?.error ?? "Delete failed." });
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
      setBanner({ type: "ok", text: "✅ Media deleted." });
    } catch (e: unknown) {
      setBanner({ type: "err", text: `Delete error: ${getErrorMessage(e)}` });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <AdminPageHeader
        title="Media"
        actions={
          <>
            <Link href="/admin/media" className={adminButtonClasses("default", "md")}>
              Upload new
            </Link>
            <button
              type="button"
              onClick={() => void load("replace")}
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
            onClick={() => void load("append", nextCursor)}
            disabled={loadingMore || Boolean(deletingId)}
            className={adminButtonClasses("default", "md")}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </main>
  );
}
