import type { AdminSnapshot } from "@/lib/server/admin-snapshot";
import { ADMIN_BUILD } from "@/lib/admin-data";
import { overviewOf, type AdminPreview } from "../admin-overview";
import { state } from "./state";

const PREVIEW_KEY = "hm.admin.preview";

let preview: AdminPreview | null | undefined;
let overview: { of: AdminSnapshot; value: AdminPreview } | null = null;

function currentOverview(snapshot: AdminSnapshot) {
  if (overview?.of !== snapshot) overview = { of: snapshot, value: overviewOf(snapshot) };
  return overview.value;
}

function readSaved(): AdminPreview | null {
  try {
    const saved = JSON.parse(localStorage.getItem(PREVIEW_KEY) ?? "null") as { build?: unknown; value?: AdminPreview } | null;
    return saved?.build === ADMIN_BUILD && saved.value ? saved.value : null;
  } catch {
    return null;
  }
}

export function getAdminPreview(): AdminPreview | null {
  if (state.data) return currentOverview(state.data);
  if (preview === undefined) preview = readSaved();
  return preview;
}

export function keepPreview(snapshot: AdminSnapshot) {
  preview = currentOverview(snapshot);
  try {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify({ build: ADMIN_BUILD, value: preview }));
  } catch {}
}

export function forgetPreview() {
  preview = null;
  try {
    localStorage.removeItem(PREVIEW_KEY);
  } catch {}
}
