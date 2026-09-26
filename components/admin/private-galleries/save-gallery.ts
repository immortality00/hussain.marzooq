import type {
  AskMediaUsage,
  MediaUsageOption,
} from "@/components/admin/media-usage/useMediaUsageDialog";
import { readMediaInUse } from "@/lib/media-in-use";

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
  | { outcome: "saved" | "cancelled"; mediaIds: string[] }
  | { outcome: "failed"; error: string; mediaIds: string[] };

const GALLERY_USAGE_OPTIONS: MediaUsageOption[] = [
  { answer: "uncheck", label: "Take these out of the gallery" },
  { answer: "remove", label: "Remove from those places and save" },
];

async function postGallery(editingId: string, payload: GalleryPayload, clearPageUsages: boolean) {
  const res = await fetch(
    editingId ? `/api/private-galleries/${encodeURIComponent(editingId)}` : "/api/private-galleries",
    {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, clearPageUsages }),
    }
  );
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  return { ok: res.ok && Boolean(data?.ok), data };
}

export async function saveGalleryWithUsageCheck(
  editingId: string,
  payload: GalleryPayload,
  ask: AskMediaUsage
): Promise<SaveOutcome> {
  let mediaIds = payload.mediaIds;
  let result = await postGallery(editingId, payload, false);
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
    result = await postGallery(editingId, { ...payload, mediaIds }, answer === "remove");
  }

  return result.ok
    ? { outcome: "saved", mediaIds }
    : { outcome: "failed", error: result.data?.error ?? "Save failed.", mediaIds };
}
