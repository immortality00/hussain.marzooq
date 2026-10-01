import type {
  AskMediaUsage,
  MediaUsageOption,
} from "@/components/admin/media-usage/useMediaUsageDialog";
import { readMediaInUse } from "@/lib/media-in-use";
import { adminWrite } from "@/lib/client/admin-store";
import { expectVersion, throwIfRecordChanged } from "@/lib/record-changed";
import type { GalleryItem } from "./types";

export type GalleryPayload = {
  title: string;
  slug: string;
  description: string;
  password: string;
  isActive: boolean;
  expiresAtLocal: string;
  timezoneOffsetMinutes: number;
  mediaIds: string[];
};

type SaveOutcome =
  | { outcome: "saved"; item: GalleryItem; mediaIds: string[] }
  | { outcome: "cancelled"; mediaIds: string[] }
  | { outcome: "failed"; error: string; mediaIds: string[] };

const GALLERY_USAGE_OPTIONS: MediaUsageOption[] = [
  { answer: "uncheck", label: "Take these out of the gallery" },
  { answer: "remove", label: "Remove from those places and save" },
];

async function postGallery(
  editingId: string,
  payload: GalleryPayload,
  clearPageUsages: boolean,
  expected: string | null | undefined
) {
  const res = await adminWrite(
    editingId ? `/api/private-galleries/${encodeURIComponent(editingId)}` : "/api/private-galleries",
    {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", ...expectVersion(expected) },
      body: JSON.stringify({ ...payload, clearPageUsages }),
    },
    ["galleries", "media", "pages", "dashboard"]
  );
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; item?: GalleryItem } | null;
  throwIfRecordChanged(data);
  return { ok: res.ok && Boolean(data?.ok) && Boolean(data?.item), data };
}

export async function saveGalleryWithUsageCheck(
  editingId: string,
  payload: GalleryPayload,
  ask: AskMediaUsage,
  expected?: string | null
): Promise<SaveOutcome> {
  let mediaIds = payload.mediaIds;
  let result = await postGallery(editingId, payload, false, expected);
  const inUse = readMediaInUse(result.data);

  if (inUse) {
    const answer = await ask(inUse, GALLERY_USAGE_OPTIONS);
    if (answer !== "uncheck" && answer !== "remove") return { outcome: "cancelled", mediaIds };

    if (answer === "uncheck") {
      const inUseIds = new Set(inUse.map((item) => item.id));
      mediaIds = mediaIds.filter((id) => !inUseIds.has(id));
      if (mediaIds.length === 0) {
        return { outcome: "failed", error: "Select at least one media item.", mediaIds };
      }
    }
    result = await postGallery(editingId, { ...payload, mediaIds }, answer === "remove", expected);
  }

  return result.ok && result.data?.item
    ? { outcome: "saved", item: result.data.item, mediaIds }
    : { outcome: "failed", error: result.data?.error ?? "Save failed.", mediaIds };
}

export async function deleteGallery(id: string) {
  const res = await adminWrite(`/api/private-galleries/${encodeURIComponent(id)}`, { method: "DELETE" }, [
    "galleries",
    "media",
    "dashboard",
  ]);
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Delete failed.");
}
