import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

type Listed = { id: string; createdAt: string | null };

function after(item: Listed, last: Listed) {
  const a = item.createdAt ?? "";
  const b = last.createdAt ?? "";
  return a < b || (a === b && item.id < last.id);
}

export function keepLoadedMedia(next: AdminSnapshot, previous: AdminSnapshot | null): AdminSnapshot {
  const old = previous?.media;
  const page = next.media;
  const last = page.items[page.items.length - 1];
  if (!old || !last || !page.nextCursor || old.items.length <= page.items.length) return next;

  const listed = new Set(page.items.map((item) => item.id));
  const older = old.items.filter((item) => !listed.has(item.id) && after(item, last));
  if (older.length === 0) return next;

  const full = { ...page.full };
  for (const item of older) if (old.full[item.id]) full[item.id] = old.full[item.id];
  return { ...next, media: { items: [...page.items, ...older], nextCursor: old.nextCursor, full } };
}
