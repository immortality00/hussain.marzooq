import type { NftItem } from "./types";

export async function fetchAdminNfts() {
  const res = await fetch("/api/nfts?all=1", { cache: "no-store" });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: NftItem[]; error?: string } | null;
  if (!res.ok || !data?.ok || !Array.isArray(data.items)) {
    throw new Error(data?.error ?? "Failed to load NFTs.");
  }
  return data.items;
}

export async function createNft(body: Record<string, unknown>) {
  const res = await fetch("/api/nfts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; id?: string; error?: string } | null;
  if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Create failed.");
  return data.id ?? null;
}

export async function updateNft(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/nfts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Update failed.");
}

export async function deleteNft(id: string) {
  const res = await fetch(`/api/nfts/${encodeURIComponent(id)}`, { method: "DELETE" });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Delete failed.");
}