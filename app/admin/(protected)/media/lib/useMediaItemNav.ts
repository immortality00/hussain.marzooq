"use client";

import { useState, useSyncExternalStore } from "react";
import { useAdminSlice } from "@/hooks/useAdminData";
import { errorMessage } from "@/hooks/useAdminAction";
import { getAdminData } from "@/lib/client/admin-store";
import { getPageSet, subscribePageSets } from "./media-page-sets";
import { itemNeighbours, keptKeyOf, loadNextRows, rowsOfView } from "./media-list-rows";
import type { MediaFilters } from "./media-pages";

const none = () => undefined;

function neighboursNow(view: MediaFilters, id: string) {
  const media = getAdminData()?.media;
  if (!media) return itemNeighbours([], id, false);
  const rows = rowsOfView(view, media, getPageSet(keptKeyOf(view)));
  return itemNeighbours(rows.items.map((item) => item.id), id, Boolean(rows.nextCursor));
}

// Previous / Next item in the media editor: the rows of the list view the item was opened from (its search
// and filters, in the list's order). At the last loaded row, Next loads the list's next page first — into the
// same rows, so the list has it too on return. Hidden for an item that is not in those rows (opened from an
// address after a reload).
export function useMediaItemNav(
  id: string,
  view: MediaFilters,
  open: (id: string) => void,
  onError: (message: string) => void
) {
  const [media] = useAdminSlice("media");
  const kept = useSyncExternalStore(subscribePageSets, () => getPageSet(keptKeyOf(view)), none);
  const [loading, setLoading] = useState(false);

  const rows = rowsOfView(view, media, kept);
  const nav = itemNeighbours(rows.items.map((item) => item.id), id, Boolean(rows.nextCursor));

  async function next() {
    if (nav.next) return open(nav.next);
    if (!nav.loadsMore || loading) return;
    setLoading(true);
    try {
      await loadNextRows(view);
      const after = neighboursNow(view, id);
      if (after.next) open(after.next);
    } catch (error) {
      onError(errorMessage(error, "Failed to load media."));
    } finally {
      setLoading(false);
    }
  }

  return {
    shown: Boolean(id) && nav.found,
    previous: nav.previous,
    hasNext: Boolean(nav.next) || nav.loadsMore,
    // The row that takes a deleted item's place in the list: the one after it, else the one before.
    neighbour: nav.next ?? nav.previous,
    loading,
    goPrevious: () => (nav.previous ? open(nav.previous) : undefined),
    goNext: next,
  };
}
