"use client";

import { useEffect, useState } from "react";
import { useLatest } from "@/hooks/useLatest";
import type { StepDirection } from "@/lib/popup-sequence";

/** What a popup needs to offer previous / next. */
export type PopupNav = {
  hasPrevious: boolean;
  /** An item after this one, loaded or still to load. */
  hasNext: boolean;
  /** The next item is already in the list (no page to wait for). */
  nextLoaded: boolean;
  /** Next was pressed on the last loaded item: waiting for the next page. */
  waiting: boolean;
  /** Moves that way; false when there is nothing to move to (nor a page to wait for). */
  step: (direction: StepDirection) => boolean;
};

/** The list's own paging ("Load more"), so Next can go past the items loaded so far. */
export type MorePages = {
  canLoadMore: boolean;
  isLoadingMore: boolean;
  /** The last page request failed. */
  failed: boolean;
  loadMore: () => unknown;
};

const NO_MORE: MorePages = { canLoadMore: false, isLoadingMore: false, failed: false, loadMore: () => undefined };

/** The next page starts loading this close to the end of the loaded items, so Next rarely waits. */
export const LOAD_AHEAD = 5;

/**
 * Which item a popup shows, and the way to the ones either side of it in the list on screen
 * — its order, search and filters. The one place the shown item lives (DL1 ties each item's
 * address to it). The latest copy of the item is read from the list by id. `preload` starts
 * the files of the items either side downloading, so moving on rarely waits.
 */
export function usePopupSequence<T extends { id: string }>(
  items: T[],
  { more = NO_MORE, preload }: { more?: MorePages; preload?: (item: T) => void } = {}
) {
  const [shown, setShown] = useState<T | null>(null);
  const [waitingAfter, setWaitingAfter] = useState<string | null>(null);
  const preloadRef = useLatest(preload);
  const loadMoreRef = useLatest(more.loadMore);

  const index = shown ? items.findIndex((item) => item.id === shown.id) : -1;
  const active = index >= 0 ? items[index] : shown;
  const previousItem = index > 0 ? items[index - 1] : null;
  const nextItem = index >= 0 && index + 1 < items.length ? items[index + 1] : null;

  useEffect(() => {
    const load = preloadRef.current;
    if (!load) return;
    if (nextItem) load(nextItem);
    if (previousItem) load(previousItem);
  }, [nextItem, previousItem, preloadRef]);

  // Near the end of what is loaded, the next page is fetched before Next is pressed.
  const nearEnd = index >= 0 && items.length - 1 - index < LOAD_AHEAD;
  const shouldLoadAhead = nearEnd && more.canLoadMore && !more.isLoadingMore && !more.failed;
  useEffect(() => {
    if (shouldLoadAhead) void loadMoreRef.current();
  }, [shouldLoadAhead, items.length, loadMoreRef]);

  // Next was pressed on the last loaded item: move on once the next page is in, or stop
  // waiting when no page is coming (the end, a failed request, the visitor moved on).
  if (waitingAfter !== null) {
    if (waitingAfter !== active?.id || index < 0) {
      setWaitingAfter(null);
    } else if (index + 1 < items.length) {
      setShown(items[index + 1]);
      setWaitingAfter(null);
    } else if (!more.canLoadMore || (more.failed && !more.isLoadingMore)) {
      setWaitingAfter(null);
    }
  }

  const hasPrevious = previousItem !== null;
  const nextLoaded = nextItem !== null;
  const hasNext = nextLoaded || (index >= 0 && more.canLoadMore);

  function step(direction: StepDirection): boolean {
    if (!active || index < 0) return false;
    if (direction === -1) {
      if (!previousItem) return false;
      setShown(previousItem);
      setWaitingAfter(null);
      return true;
    }
    if (nextItem) {
      setShown(nextItem);
      return true;
    }
    if (!more.canLoadMore) return false;
    setWaitingAfter(active.id);
    if (!more.isLoadingMore) void more.loadMore();
    return true;
  }

  const nav: PopupNav | null = active
    ? { hasPrevious, hasNext, nextLoaded, waiting: waitingAfter !== null, step }
    : null;

  return {
    active,
    nav,
    open: (item: T) => {
      setShown(item);
      setWaitingAfter(null);
    },
    close: () => {
      setShown(null);
      setWaitingAfter(null);
    },
  };
}
