import { adminWrite } from "@/lib/client/admin-store";
import type { SavedMedia } from "../../lib/media-store";
import type { BatchItem } from "./useBatchMediaState";
import { publishAtPayload } from "@/lib/media-schedule";
import { deliveryErrorOf } from "../../lib/editor-actions";

export type BatchCreateResult =
  | {
      ok: true;
      /** A new item, not one the file already had: only new items go into the batch's blog draft. */
      createdId: string | null;
      posterMissing: boolean;
      deliveryError: string | null;
      saved: SavedMedia | null;
    }
  | { ok: false; error: string };

export function buildBatchPayload(item: BatchItem, shared: Record<string, unknown>) {
  const base = {
    ...shared,
    // The batch gets one blog draft for all its new items (createBatchDraft), not one each.
    blogDraft: false,
    title: item.title.trim(),
    description: item.description.trim() || null,
    ...(shared.isPublic === false ? {} : { publishAt: publishAtPayload(item.schedule) }),
  };

  if (item.kind === "link") return { ...base, type: "embed", embedUrl: item.embedUrl };

  return {
    ...base,
    type: item.resourceType === "video" ? "video" : "image",
    secureUrl: item.secureUrl,
    publicId: item.publicId,
    resourceType: item.resourceType,
  };
}

export async function createBatchItem(payload: Record<string, unknown>): Promise<BatchCreateResult> {
  const res = await adminWrite(
    "/api/media/create",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    ["media", "dashboard", "mediaTags"]
  );
  const data = (await res.json().catch(() => null)) as
    | (Partial<SavedMedia> & {
        ok?: boolean;
        error?: string;
        id?: string;
        created?: boolean;
        posterMissing?: boolean;
        deliveryError?: unknown;
      })
    | null;

  if (!res.ok || !data?.ok) return { ok: false, error: data?.error ?? "Save failed." };
  const saved = data.item && data.listItem ? { item: data.item, listItem: data.listItem } : null;
  return {
    ok: true,
    createdId: data.created === true && typeof data.id === "string" ? data.id : null,
    posterMissing: data.posterMissing === true,
    deliveryError: deliveryErrorOf(data),
    saved,
  };
}

/** One blog draft for the batch's new items (U7); a retry adds to the same batch's draft. Returns why not, or null. */
export async function createBatchDraft(mediaIds: string[], batchKey: string): Promise<string | null> {
  if (mediaIds.length === 0) return null;
  try {
    const res = await adminWrite(
      "/api/blog/drafts",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaIds, batchKey }) },
      ["blog"]
    );
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    return res.ok && data?.ok ? null : (data?.error ?? "Save failed.");
  } catch (error) {
    return error instanceof Error ? error.message : "Network error";
  }
}
