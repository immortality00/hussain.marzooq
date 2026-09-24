import type { BatchItem } from "./useBatchMediaState";

export type BatchCreateResult = { ok: true; posterMissing: boolean } | { ok: false; error: string };

export function buildBatchPayload(item: BatchItem, shared: Record<string, unknown>) {
  const base = {
    ...shared,
    title: item.title.trim(),
    description: item.description.trim() || null,
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
  const res = await fetch("/api/media/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
    posterMissing?: boolean;
  } | null;

  if (!res.ok || !data?.ok) return { ok: false, error: data?.error ?? "Save failed." };
  return { ok: true, posterMissing: data.posterMissing === true };
}
