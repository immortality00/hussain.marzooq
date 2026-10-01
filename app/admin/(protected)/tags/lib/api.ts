import { adminWrite } from "@/lib/client/admin-store";
import type { NewTag, Tag, TagPatch } from "./types";

export async function createTagRequest(tag: NewTag): Promise<Tag> {
  const res = await adminWrite(
    "/api/media-tags",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(tag) },
    ["mediaTags"]
  );

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; item?: Tag; error?: string };
  if (!res.ok || !data.ok || !data.item) throw new Error(data.error ?? "Create failed");
  return data.item;
}

export async function patchTag(id: string, patch: TagPatch) {
  const res = await adminWrite(
    `/api/media-tags/${id}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) },
    patch.slug === undefined ? ["mediaTags"] : ["mediaTags", "media"]
  );

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Update failed");
}

export async function deleteTagRequest(id: string, detach: boolean) {
  const res = await adminWrite(`/api/media-tags/${id}${detach ? "?detach=1" : ""}`, { method: "DELETE" }, [
    "mediaTags",
    "media",
  ]);
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; usedBy?: number };

  if (!res.ok || !data.ok) {
    if (data.error === "TAG_IN_USE") {
      const err = new Error("TAG_IN_USE");
      (err as Error & { usedBy?: number }).usedBy = data.usedBy ?? 0;
      throw err;
    }
    throw new Error(data.error ?? "Delete failed.");
  }
}
