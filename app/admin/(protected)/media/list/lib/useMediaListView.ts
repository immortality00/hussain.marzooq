"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminActionFeedbackState } from "@/components/admin/action-feedback/AdminActionFeedback";
import { applyUpdate, useAdminSlice, type Update } from "@/hooks/useAdminData";
import { refreshAdminData } from "@/lib/client/admin-store";
import { keepFoundMedia } from "../../lib/found-media";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

type MediaItem = AdminSnapshot["media"]["items"][number];

export type MediaFilters = { query: string; category: string; type: string; visibility: string };
type FilteredPage = { key: string; items: MediaItem[]; nextCursor: string | null };
type ListResponse = {
  ok?: boolean;
  items?: MediaItem[];
  nextCursor?: string | null;
  full?: AdminSnapshot["media"]["full"];
  error?: string;
};

const SEARCH_DEBOUNCE_MS = 250;

const filterKey = (f: MediaFilters) => JSON.stringify([f.query.trim(), f.category.trim(), f.type.trim(), f.visibility.trim()]);
const isDefaultView = (f: MediaFilters) => !f.query.trim() && !f.category.trim() && !f.type.trim() && !f.visibility.trim();

function listUrl(filters: MediaFilters, cursor: string | null, full: boolean) {
  const params = new URLSearchParams({ limit: "60" });
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category.trim()) params.set("category", filters.category.trim());
  if (filters.type.trim()) params.set("type", filters.type.trim());
  if (filters.visibility.trim()) params.set("visibility", filters.visibility.trim());
  if (cursor) params.set("cursor", cursor);
  if (full) params.set("full", "1");
  return `/api/media/admin-list?${params.toString()}`;
}

function appendUnique(previous: MediaItem[], next: MediaItem[]) {
  const seen = new Set(previous.map((item) => item.id));
  return [...previous, ...next.filter((item) => !seen.has(item.id))];
}

async function fetchPage(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json().catch(() => null)) as ListResponse | null;
  if (!res.ok || !data?.ok || !Array.isArray(data.items)) throw new Error(data?.error ?? "Failed to load media.");
  return data;
}

export function useMediaListView(filters: MediaFilters, setBanner: (next: AdminActionFeedbackState) => void) {
  const [media, setMedia] = useAdminSlice("media");
  const [filtered, setFiltered] = useState<FilteredPage | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const key = filterKey(filters);
  const defaultView = isDefaultView(filters);
  const current = filtered?.key === key ? filtered : null;
  const items = defaultView ? media.items : (current?.items ?? []);
  const nextCursor = defaultView ? media.nextCursor : (current?.nextCursor ?? null);
  const loading = !defaultView && !current;

  const { query, category, type, visibility } = filters;
  const loadFiltered = useCallback(
    async (cursor: string | null) => {
      try {
        const data = await fetchPage(listUrl({ query, category, type, visibility }, cursor, true));
        keepFoundMedia(data.full);
        setFiltered((previous) => ({
          key,
          items: cursor && previous?.key === key ? appendUnique(previous.items, data.items ?? []) : (data.items ?? []),
          nextCursor: data.nextCursor ?? null,
        }));
      } catch (error) {
        setBanner({ type: "err", text: error instanceof Error ? error.message : "Failed to load media." });
      }
    },
    [query, category, type, visibility, key, setBanner]
  );

  useEffect(() => {
    if (defaultView) return;
    const timer = window.setTimeout(() => void loadFiltered(null), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [defaultView, loadFiltered]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      if (!defaultView) return await loadFiltered(nextCursor);
      const data = await fetchPage(listUrl(filters, nextCursor, true));
      setMedia((previous) => ({
        items: appendUnique(previous.items, data.items ?? []),
        nextCursor: data.nextCursor ?? null,
        full: { ...previous.full, ...(data.full ?? {}) },
      }));
    } catch (error) {
      setBanner({ type: "err", text: error instanceof Error ? error.message : "Failed to load media." });
    } finally {
      setLoadingMore(false);
    }
  }

  function refresh() {
    setBanner(null);
    return defaultView ? refreshAdminData() : loadFiltered(null);
  }

  function setItems(update: Update<MediaItem[]>) {
    setMedia((previous) => ({ ...previous, items: applyUpdate(update, previous.items) }));
    setFiltered((previous) => (previous ? { ...previous, items: applyUpdate(update, previous.items) } : previous));
  }

  return { items, nextCursor, loading, loadingMore, loadMore, refresh, setItems };
}
