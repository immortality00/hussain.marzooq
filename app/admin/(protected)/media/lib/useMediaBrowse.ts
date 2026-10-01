"use client";

import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage } from "@/hooks/useAdminAction";
import { refreshAdminData } from "@/lib/client/admin-store";
import { appendUnique, loadMoreSharedMedia, NO_FILTERS, sharedMediaIsFull } from "./media-pages";
import { useRefreshingPages } from "./useRefreshingPages";

export function useMediaBrowse(onError: (message: string) => void) {
  const [media] = useAdminSlice("media");
  const shared = sharedMediaIsFull(media);
  const tail = useRefreshingPages(
    shared && media.nextCursor
      ? { key: "tail", filters: NO_FILTERS, startCursor: media.nextCursor, autoLoadAfterMs: null }
      : null,
    onError
  );

  async function loadMore() {
    if (shared) return tail.loadMore();
    try {
      await loadMoreSharedMedia();
    } catch (error) {
      onError(errorMessage(error, "Failed to load media."));
    }
  }

  return {
    items: tail.items.length ? appendUnique(media.items, tail.items) : media.items,
    nextCursor: shared ? tail.nextCursor : media.nextCursor,
    loading: false,
    loadMore,
    refresh: async () => {
      await Promise.all([refreshAdminData(), tail.refresh()]);
    },
    remove: tail.remove,
  };
}
