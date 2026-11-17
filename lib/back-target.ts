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
