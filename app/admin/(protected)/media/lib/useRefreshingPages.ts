"use client";

import { useEffect, useState } from "react";
import { useOnAdminDataChange } from "@/hooks/useAdminData";
import { errorMessage } from "@/hooks/useAdminAction";
import { useLatest } from "@/hooks/useLatest";
import {
  appendUnique,
  fetchMediaPage,
  mediaListUrl,
  refetchLimit,
  type MediaFilters,
  type MediaListItem,
} from "./media-pages";

export type PagesSource = {
  key: string;
  filters: MediaFilters;
  startCursor: string | null;
  autoLoadAfterMs: number | null;
};
type Pages = { key: string; items: MediaListItem[]; nextCursor: string | null };

export function useRefreshingPages(source: PagesSource | null, onError: (message: string) => void) {
  const [pages, setPages] = useState<Pages | null>(null);
  const latest = useLatest({ source });
  const key = source?.key ?? null;
  const autoLoadAfterMs = source?.autoLoadAfterMs ?? null;
  const current = key && pages?.key === key ? pages : null;

  async function load(cursor: string | null, limit: number, append: boolean) {
    const active = source;
    if (!active) return;
    try {
      const page = await fetchMediaPage(mediaListUrl(active.filters, cursor, limit));
      setPages((previous) => ({
        key: active.key,
        items: append && previous?.key === active.key ? appendUnique(previous.items, page.items) : page.items,
        nextCursor: page.nextCursor,
      }));
    } catch (error) {
      onError(errorMessage(error, "Failed to load media."));
    }
  }

  const latestLoad = useLatest(load);
  const startCursor = () => source?.startCursor ?? null;

  useEffect(() => {
    if (!key || autoLoadAfterMs === null) return;
    const timer = window.setTimeout(
      () => void latestLoad.current(latest.current.source?.startCursor ?? null, refetchLimit(0), false),
      autoLoadAfterMs
    );
    return () => window.clearTimeout(timer);
  }, [key, autoLoadAfterMs, latestLoad, latest]);

  useOnAdminDataChange(() => {
    if (current) void load(startCursor(), refetchLimit(current.items.length), false);
  });

  return {
    items: current?.items ?? [],
    nextCursor: current ? current.nextCursor : (source?.startCursor ?? null),
    loading: autoLoadAfterMs !== null && Boolean(key) && !current,
    loadMore: () => load(current ? current.nextCursor : startCursor(), refetchLimit(0), Boolean(current)),
    refresh: () => (current ? load(startCursor(), refetchLimit(current.items.length), false) : Promise.resolve()),
    remove: (ids: string[]) =>
      setPages((previous) =>
        previous ? { ...previous, items: previous.items.filter((item) => !ids.includes(item.id)) } : previous
      ),
  };
}
