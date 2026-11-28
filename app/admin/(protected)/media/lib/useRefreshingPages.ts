"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useOnAdminDataChange } from "@/hooks/useAdminData";
import { errorMessage } from "@/hooks/useAdminAction";
import { useLatest } from "@/hooks/useLatest";
import { getAdminDataGeneration } from "@/lib/client/admin-store";
import type { SavedMedia } from "./media-store";
import {
  appendUnique,
  fetchMediaPage,
  mediaListUrl,
  refetchLimit,
  type MediaFilters,
} from "./media-pages";
import {
  getPageSet,
  removeFromPageSets,
  replaceInPageSets,
  setPageSet,
  subscribePageSets,
  type PageSet,
} from "./media-page-sets";

export type PagesSource = {
  key: string;
  filters: MediaFilters;
  startCursor: string | null;
  autoLoadAfterMs: number | null;
  // The media list's rows: kept in memory by `key` with each item's full data (media-page-sets.ts), so the
  // list comes back with them and its editor can step through them. The pickers keep theirs to themselves.
  keep?: boolean;
};
type LocalPages = PageSet & { key: string };

const none = () => undefined;

export function useRefreshingPages(source: PagesSource | null, onError: (message: string) => void) {
  const keptKey = source?.keep ? source.key : null;
  const kept = useSyncExternalStore(subscribePageSets, () => (keptKey ? getPageSet(keptKey) : undefined), none);
  const [local, setLocal] = useState<LocalPages | null>(null);
  const latest = useLatest({ source });
  const key = source?.key ?? null;
  const autoLoadAfterMs = source?.autoLoadAfterMs ?? null;
  const current: PageSet | null = keptKey ? (kept ?? null) : key && local?.key === key ? local : null;

  function store(active: PagesSource, update: (previous: PageSet | null) => PageSet) {
    if (active.keep) {
      setPageSet(active.key, (previous) => update(previous ?? null));
      return;
    }
    setLocal((previous) => ({ ...update(previous?.key === active.key ? previous : null), key: active.key }));
  }

  async function load(cursor: string | null, limit: number, append: boolean) {
    const active = source;
    if (!active) return;
    try {
      const page = await fetchMediaPage(mediaListUrl(active.filters, cursor, limit, Boolean(active.keep)));
      const generation = getAdminDataGeneration();
      store(active, (previous) => ({
        items: append && previous ? appendUnique(previous.items, page.items) : page.items,
        nextCursor: page.nextCursor,
        full: { ...(append && previous ? previous.full : {}), ...(page.full ?? {}) },
        generation,
      }));
    } catch (error) {
      onError(errorMessage(error, "Failed to load media."));
    }
  }

  const latestLoad = useLatest(load);
  const startCursor = () => source?.startCursor ?? null;

  useEffect(() => {
    if (!key) return;
    const active = latest.current.source;
    const cached = active?.keep ? getPageSet(active.key) : undefined;
    if (cached) {
      // Kept from an earlier showing: on screen at once, and loaded again if the data has changed since.
      if (cached.generation !== getAdminDataGeneration()) {
        void latestLoad.current(active?.startCursor ?? null, refetchLimit(cached.items.length), false);
      }
      return;
    }
    if (autoLoadAfterMs === null) return;
    const timer = window.setTimeout(
      () => void latestLoad.current(latest.current.source?.startCursor ?? null, refetchLimit(0), false),
      autoLoadAfterMs
    );
    return () => window.clearTimeout(timer);
  }, [key, autoLoadAfterMs, latestLoad, latest]);

  useOnAdminDataChange(() => (current ? load(startCursor(), refetchLimit(current.items.length), false) : undefined));

  return {
    items: current?.items ?? [],
    nextCursor: current ? current.nextCursor : (source?.startCursor ?? null),
    loading: autoLoadAfterMs !== null && Boolean(key) && !current,
    loadMore: () => load(current ? current.nextCursor : startCursor(), refetchLimit(0), Boolean(current)),
    refresh: () => (current ? load(startCursor(), refetchLimit(current.items.length), false) : Promise.resolve()),
    remove: (ids: string[]) => {
      if (keptKey) return removeFromPageSets(ids);
      setLocal((previous) =>
        previous ? { ...previous, items: previous.items.filter((item) => !ids.includes(item.id)) } : previous
      );
    },
    replace: (saved: SavedMedia) => {
      if (keptKey) return replaceInPageSets(saved.listItem, saved.item);
      setLocal((previous) =>
        previous
          ? { ...previous, items: previous.items.map((item) => (item.id === saved.listItem.id ? saved.listItem : item)) }
          : previous
      );
    },
  };
}
