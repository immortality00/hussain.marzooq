// The browser's own history list (the Navigation API) says which page came before this
// one. Back returns there only when it is a page of this site; anything else — a search
// engine, a shared link, no page at all — and Back opens the page's listing instead.
export type HistoryEntryLike = { url: string | null };

export function previousPageOnSite(
  entries: readonly HistoryEntryLike[],
  currentIndex: number,
  origin: string,
): boolean {
  const previous = currentIndex > 0 ? entries[currentIndex - 1] : undefined;
  if (!previous?.url) return false;
  try {
    return new URL(previous.url).origin === origin;
  } catch {
    return false;
  }
}

// Whether the page before this one is a given page of this site (any search or hash) — the list an admin
// editor was opened from, so its way back can be the browser's own Back.
export function previousPageIs(
  entries: readonly HistoryEntryLike[],
  currentIndex: number,
  origin: string,
  pathname: string,
): boolean {
  if (!previousPageOnSite(entries, currentIndex, origin)) return false;
  return new URL(entries[currentIndex - 1].url as string).pathname === pathname;
}
