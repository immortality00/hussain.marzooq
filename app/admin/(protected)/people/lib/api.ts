import { adminWrite } from "@/lib/client/admin-store";
import { expectVersion, throwIfRecordChanged } from "@/lib/record-changed";
import type { PersonItem } from "@/hooks/usePeopleAdmin";

const TOUCHES = ["people", "media", "dashboard"] as const;

export type PersonPayload = {
  name: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  isPublic: boolean;
  isPrivate: boolean;
  password: string;
};

export async function savePerson(editingId: string, payload: PersonPayload, expected?: string | null): Promise<PersonItem> {
  const res = await adminWrite(
    editingId ? `/api/people/${encodeURIComponent(editingId)}` : "/api/people",
    {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", ...expectVersion(expected) },
      body: JSON.stringify(payload),
    },
    TOUCHES
  );
  const data = (await res.json().catch(() => null)) as { ok?: boolean; item?: PersonItem; error?: string } | null;
  if (!res.ok || !data?.ok || !data.item) {
    throwIfRecordChanged(data);
    throw new Error(data?.error ?? "Save failed.");
  }
  return data.item;
}

export async function deletePerson(id: string) {
  const res = await adminWrite(`/api/people/${encodeURIComponent(id)}`, { method: "DELETE" }, TOUCHES);
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Delete failed.");
}
