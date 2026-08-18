import type { NewTag, Tag, TagPatch } from "./types";

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch("/api/media-tags?scope=admin", { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; items?: Tag[]; error?: string };
  if (!res.ok || !data.ok || !Array.isArray(data.items)) {
    throw new Error(data.error ?? "Refresh failed.");
  }
  return data.items;
}

export async function createTagRequest(tag: NewTag): Promise<{ id: string; slug: string; label: string }> {
  const res = await fetch("/api/media-tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag),
  });

  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    id?: string;
    slug?: string;
    label?: string;
    error?: string;
  };
  if (!res.ok || !data.ok || !data.id || !data.slug) throw new Error(data.error ?? "Create failed");
  return { id: data.id, slug: data.slug, label: data.label ?? tag.label };
}

export async function patchTag(id: string, patch: TagPatch) {
  const res = await fetch(`/api/media-tags/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Update failed");
}

export async function deleteTagRequest(id: string, detach: boolean) {
  const res = await fetch(`/api/media-tags/${id}${detach ? "?detach=1" : ""}`, { method: "DELETE" });
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
