import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { emit, state, type AdminSlice } from "./state";
import { noteApplied } from "./changes";
import { forgetPreview, keepPreview } from "./preview";
import { forgetAnalytics } from "./analytics";

export type SliceUpdate<T> = T | ((previous: T) => T);
type MediaPage = Pick<AdminSnapshot["media"], "items" | "nextCursor" | "full">;

export function setAdminSlice<K extends AdminSlice>(key: K, next: SliceUpdate<AdminSnapshot[K]>) {
  if (!state.data) return;
  const previous = state.data[key];
  const value = typeof next === "function" ? (next as (p: AdminSnapshot[K]) => AdminSnapshot[K])(previous) : next;
  if (value === previous) return;
  state.data = { ...state.data, [key]: value };
  state.version = null;
  noteApplied(key);
  keepPreview(state.data);
  emit();
}

export function appendAdminMedia(page: MediaPage) {
  if (!state.data) return;
  const media = state.data.media;
  const listed = new Set(media.items.map((item) => item.id));
  state.data = {
    ...state.data,
    media: {
      items: [...media.items, ...page.items.filter((item) => !listed.has(item.id))],
      nextCursor: page.nextCursor,
      full: { ...media.full, ...page.full },
    },
  };
  emit();
}

export function forgetAdminData() {
  state.data = null;
  state.version = null;
  forgetPreview();
  forgetAnalytics();
  emit();
}
