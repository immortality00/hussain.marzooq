import { noStoreJson } from "@/app/api/_lib/common";
import { formatMediaInUseError, MEDIA_IN_USE, type MediaInUse } from "@/lib/media-in-use";

export function mediaInUseResponse(items: MediaInUse[], extra: Record<string, unknown> = {}) {
  const list = items.map(({ id, title, usedOn }) => ({ id, title, usedOn }));
  return noStoreJson(
    { ok: false, code: MEDIA_IN_USE, error: formatMediaInUseError(list), items: list, ...extra },
    { status: 409 }
  );
}

export function usageUpdateFailedResponse(labels: string[], outcome: string) {
  return noStoreJson(
    { ok: false, error: `Could not update: ${labels.join(", ")}. ${outcome}` },
    { status: 500 }
  );
}
