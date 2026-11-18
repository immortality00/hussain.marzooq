import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { NO_FILTERS, type MediaFilters, type MediaListItem } from "./media-pages";

type FullItem = AdminSnapshot["media"]["full"][string];

// The media list's rows past what the shared admin data holds — a search's pages, or the pages past its first
// 300 items ("tail") — kept in memory by view, with each item's full data. The list comes back with the same
// rows at once, and the media editor steps through them for Previous / Next item (loading the next page into
// the same set). Only the newest few sets are kept. `generation` is the admin data generation they were
// loaded at, so a list coming back can tell they may be out of date.
export type PageSet = {
  items: MediaListItem[];
  nextCursor: string | null;
  full: Record<string, FullItem>;
  generation: number;
};

const MAX_SETS = 6;
const sets = new Map<string, PageSet>();
const listeners = new Set<() => void>();
let shownView: MediaFilters = NO_FILTERS;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribePageSets(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPageSet(key: string): PageSet | undefined {
  return sets.get(key);
}

export function setPageSet(key: string, update: (previous: PageSet | undefined) => PageSet): void {
  const next = update(sets.get(key));
  sets.delete(key);
  sets.set(key, next);
  while (sets.size > MAX_SETS) {
    const oldest = sets.keys().next().value;
    if (oldest === undefined) break;
    sets.delete(oldest);
  }
  emit();
}

function updateEvery(change: (set: PageSet) => PageSet | null) {
  let changed = false;
  for (const [key, set] of sets) {
    const next = change(set);
    if (next) {
      sets.set(key, next);
      changed = true;
    }
  }
  if (changed) emit();
}

export function replaceInPageSets(listItem: MediaListItem, full?: FullItem): void {
  updateEvery((set) =>
    set.items.some((item) => item.id === listItem.id)
      ? {
          ...set,
          items: set.items.map((item) => (item.id === listItem.id ? listItem : item)),
          full: full ? { ...set.full, [listItem.id]: full } : set.full,
        }
      : null
  );
}

export function removeFromPageSets(ids: string[]): void {
  updateEvery((set) => {
    if (!set.items.some((item) => ids.includes(item.id))) return null;
    const full = { ...set.full };
    for (const id of ids) delete full[id];
    return { ...set, items: set.items.filter((item) => !ids.includes(item.id)), full };
  });
}

export function keptFullItem(id: string): FullItem | null {
  for (const set of [...sets.values()].reverse()) {
    if (set.full[id]) return set.full[id];
  }
  return null;
}

// The search and filters the media list showed last: the view the editor steps through and goes back to.
export function rememberShownView(filters: MediaFilters): void {
  shownView = filters;
}

export function shownMediaView(): MediaFilters {
  return shownView;
}

export function forgetPageSets(): void {
  sets.clear();
  shownView = NO_FILTERS;
  emit();
}
