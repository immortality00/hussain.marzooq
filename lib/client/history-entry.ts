import { previousPageOnSite } from "@/lib/back-target";

// The visit's current page in the browser's history list (Navigation API: Chrome,
// Safari 26.2+, Firefox 147+). Null where the browser has no such list.
export function currentHistoryEntry(): NavigationHistoryEntry | null {
  if (typeof window === "undefined" || !("navigation" in window) || !window.navigation) return null;
  return window.navigation.currentEntry;
}

export function canGoBackOnSite(): boolean {
  const current = currentHistoryEntry();
  if (!current) return false;
  return previousPageOnSite(window.navigation.entries(), current.index, window.location.origin);
}
