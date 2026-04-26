import type { ApiInquiriesResponse } from "./types";

export function isApiResponse(v: unknown): v is ApiInquiriesResponse {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.ok === true) return Array.isArray(r.items);
  if (r.ok === false) return true;
  return false;
}

export async function fetchInquiries(statusFilter: string) {
  const params = new URLSearchParams();
  params.set("all", "1");
  if (statusFilter) params.set("status", statusFilter);

  const res = await fetch(`/api/inquiries?${params.toString()}`, { cache: "no-store" });
  const raw = (await res.json().catch(() => null)) as unknown;
  return { res, raw };
}

export async function patchInquiry(id: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Update failed");
}

export async function archiveInquiry(id: string) {
  const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, { method: "DELETE" });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Archive failed");
}

export async function deleteInquiryForever(id: string) {
  const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}?hard=1`, { method: "DELETE" });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Delete failed");
}

export async function restoreInquiry(id: string) {
  await patchInquiry(id, { isArchived: false });
}