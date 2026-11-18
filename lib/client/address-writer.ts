import { addressWriteDelay } from "@/lib/address-values";

// Every change an admin screen makes to its own address goes through here: history.replaceState (no new history
// entry), at least ADDRESS_WRITE_GAP_MS apart, the newest change of each screen part winning. A change is tied
// to the page it was made on, so one still waiting when that page is left is dropped instead of landing on the
// next page. A waiting change is made at once when a link is pressed, so the history entry the browser's Back
// returns to carries it.
type Change = { pathname: string; apply: (search: string) => string };

const waiting = new Map<string, Change>();
let lastWriteAt: number | null = null;
let timer: number | null = null;

function onPress(event: MouseEvent) {
  if ((event.target as Element | null)?.closest?.("a")) flushAddressChanges();
}

export function flushAddressChanges(): void {
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  document.removeEventListener("click", onPress, true);
  if (waiting.size === 0) return;

  const { pathname, search, hash } = window.location;
  let next = search;
  for (const change of waiting.values()) {
    if (change.pathname === pathname) next = change.apply(next);
  }
  waiting.clear();
  if (next === search) return;

  try {
    window.history.replaceState(null, "", `${pathname}${next}${hash}`);
    lastWriteAt = Date.now();
  } catch {
    // Refused by the browser: the screen still works, only its address is behind.
  }
}

export function changeAddress(owner: string, pathname: string, apply: (search: string) => string): void {
  waiting.set(owner, { pathname, apply });
  if (timer !== null) return;
  document.addEventListener("click", onPress, true);
  timer = window.setTimeout(flushAddressChanges, addressWriteDelay(lastWriteAt, Date.now()));
}

export function resetAddressWriter(): void {
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  waiting.clear();
  lastWriteAt = null;
  document.removeEventListener("click", onPress, true);
}
