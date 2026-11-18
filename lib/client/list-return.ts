import { placeElementAt, restorePageScroll } from "./page-scroll";

// Where an admin list is come back to after its editor: the row that was opened (or the item the editor moved
// on to), put back at the height it had on screen and marked; without a row, the scroll the list was left at.
// One record per list, in memory, taken once — by the next showing of the same view (same search and filters).
export type ListReturn = { view: string; rowId: string | null; top: number | null; scrollY: number };

const records = new Map<string, ListReturn>();
const MARK_MS = 2000;

export const ROW_ATTRIBUTE = "data-list-row";

export function rowElement(from: EventTarget | null): Element | null {
  return from instanceof Element ? from.closest(`[${ROW_ATTRIBUTE}]`) : null;
}

export function leaveList(list: string, view: string, rowId: string | null, row: Element | null): void {
  records.set(list, {
    view,
    rowId,
    top: row ? Math.round(row.getBoundingClientRect().top) : null,
    scrollY: Math.round(window.scrollY),
  });
}

// The editor moved to another item (Previous / Next), deleted one, or made a new one (`top: null`: shown where
// the list puts it, not at the old height).
export function returnToRow(list: string, rowId: string | null, options: { newRow?: boolean } = {}): void {
  const record = records.get(list);
  if (!record) return;
  records.set(list, { ...record, rowId, ...(options.newRow ? { top: null } : {}) });
}

export function takeListReturn(list: string, view: string): ListReturn | null {
  const record = records.get(list);
  records.delete(list);
  return record && record.view === view ? record : null;
}

export function forgetListReturns(): void {
  records.clear();
}

function findRow(rowId: string): Element | null {
  for (const row of document.querySelectorAll(`[${ROW_ATTRIBUTE}]`)) {
    if (row.getAttribute(ROW_ATTRIBUTE) === rowId) return row;
  }
  return null;
}

function markRow(row: Element) {
  row.classList.add("hm-row-returned");
  window.setTimeout(() => row.classList.remove("hm-row-returned"), MARK_MS);
}

export function showListReturn(record: ListReturn): void {
  const row = record.rowId ? findRow(record.rowId) : null;
  if (!row) return restorePageScroll(record.scrollY);
  if (record.top === null) row.scrollIntoView({ block: "nearest" });
  else placeElementAt(row, record.top);
  markRow(row);
}

// An item an alert opened (`?open=<id>`): brought into view and marked, once its row is on screen. False when the
// row is not there yet.
export function revealRow(rowId: string): boolean {
  const row = findRow(rowId);
  if (!row) return false;
  row.scrollIntoView({ block: "center" });
  markRow(row);
  return true;
}
