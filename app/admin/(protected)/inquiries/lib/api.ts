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