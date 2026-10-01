import { adminWrite } from "@/lib/client/admin-store";

const INQUIRY_TOUCHES = ["inquiries", "services"] as const;

export async function patchInquiry(id: string, body: Record<string, unknown>) {
  const res = await adminWrite(
    `/api/inquiries/${encodeURIComponent(id)}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    INQUIRY_TOUCHES
  );
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Update failed");
}

export async function archiveInquiry(id: string) {
  const res = await adminWrite(`/api/inquiries/${encodeURIComponent(id)}`, { method: "DELETE" }, INQUIRY_TOUCHES);
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Archive failed");
}

export async function deleteInquiryForever(id: string) {
  const res = await adminWrite(`/api/inquiries/${encodeURIComponent(id)}?hard=1`, { method: "DELETE" }, INQUIRY_TOUCHES);
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Delete failed");
}

export async function restoreInquiry(id: string) {
  await patchInquiry(id, { isArchived: false });
}