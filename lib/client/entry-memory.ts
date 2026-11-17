import { currentHistoryEntry } from "./history-entry";

// What each visit to a page had — search words, chips, the results it had loaded — kept
// against that page's place in the browser's history, so going Back (the site's button or
// the browser's) puts it back. Memory only: a reload starts fresh. The scope names the page
// (it carries the pathname), so a page that renders while the browser still shows the
// previous entry never reads that entry's memory.
const MAX_ENTRIES = 20;
const memory = new Map<string, Map<string, unknown>>();

export function recallForEntry<T>(scope: string): T | undefined {
  const key = currentHistoryEntry()?.key;
  if (!key) return undefined;
  return memory.get(key)?.get(scope) as T | undefined;
}

export function rememberForEntry(scope: string, value: unknown): void {
  const key = currentHistoryEntry()?.key;
  if (!key) return;
  const entry = memory.get(key) ?? new Map<string, unknown>();
  entry.set(scope, value);
  memory.delete(key);
  memory.set(key, entry);
  while (memory.size > MAX_ENTRIES) {
    const oldest = memory.keys().next().value;
    if (oldest === undefined) break;
    memory.delete(oldest);
  }
}

export function forgetAllEntries(): void {
  memory.clear();
}
