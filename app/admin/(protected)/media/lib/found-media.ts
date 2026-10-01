import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

type FullItem = AdminSnapshot["media"]["full"][string];

const found = new Map<string, FullItem>();

export function keepFoundMedia(full: Record<string, FullItem> | undefined) {
  for (const [id, item] of Object.entries(full ?? {})) found.set(id, item);
}

export function forgetFoundMedia(ids: string[]) {
  for (const id of ids) found.delete(id);
}

export const foundMedia = (id: string) => found.get(id) ?? null;
