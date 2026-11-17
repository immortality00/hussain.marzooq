// Each history entry's last scroll position, by the entry's key. Kept in memory while the
// page runs and written to sessionStorage when the page is left (pagehide), so a reload or
// a return from another site finds it too. Only the newest 50 are kept.
const STORAGE_KEY = "hm.scroll-positions";
const MAX_POSITIONS = 50;

let positions: Map<string, number> | null = null;

function all(): Map<string, number> {
  if (positions) return positions;
  positions = new Map();
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(stored)) {
      for (const pair of stored) {
        if (Array.isArray(pair) && typeof pair[0] === "string" && Number.isFinite(pair[1])) {
          positions.set(pair[0], pair[1]);
        }
      }
    }
  } catch {
    // Blocked or broken storage: start from memory only.
  }
  return positions;
}

export function saveScroll(key: string, y: number): void {
  const map = all();
  map.delete(key);
  map.set(key, Math.max(0, Math.round(y)));
  while (map.size > MAX_POSITIONS) {
    const oldest = map.keys().next().value;
    if (oldest === undefined) break;
    map.delete(oldest);
  }
}

export function savedScroll(key: string): number | undefined {
  return all().get(key);
}

export function persistScroll(): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...all()]));
  } catch {
    // Storage full or blocked: positions still work until the page is left.
  }
}

export function resetScrollPositions(): void {
  positions = null;
}
