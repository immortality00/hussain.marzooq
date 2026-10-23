import { adminWrite } from "@/lib/client/admin-store";
import { expectVersion, throwIfRecordChanged } from "@/lib/record-changed";
import { MediaInUseError, throwIfMediaInUse } from "@/lib/client/media-usage-api";
import { REMOVE_AND_SAVE, type AskMediaUsage } from "@/components/admin/media-usage/useMediaUsageDialog";
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

export type SavedPerson = { item: PersonItem; deliveryError: string | null };

export async function savePerson(
  editingId: string,
  payload: PersonPayload,
  expected?: string | null,
  clearPageUsages = false
): Promise<SavedPerson> {
  const res = await adminWrite(
    editingId ? `/api/people/${encodeURIComponent(editingId)}` : "/api/people",
    {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", ...expectVersion(expected) },
      body: JSON.stringify({ ...payload, clearPageUsages }),
    },
    TOUCHES
  );
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; item?: PersonItem; error?: string; deliveryError?: unknown }
    | null;
  if (!res.ok || !data?.ok || !data.item) {
    throwIfMediaInUse(data);
    throwIfRecordChanged(data);
    throw new Error(data?.error ?? "Save failed.");
  }
  return { item: data.item, deliveryError: typeof data.deliveryError === "string" ? data.deliveryError : null };
}

// Gating a person makes their files private; a page using one asks first.
export async function savePersonWithUsageCheck(
  editingId: string,
  payload: PersonPayload,
  ask: AskMediaUsage,
  expected?: string | null
): Promise<SavedPerson | null> {
  try {
    return await savePerson(editingId, payload, expected);
  } catch (e: unknown) {
    if (!(e instanceof MediaInUseError)) throw e;
    if ((await ask(e.items, [REMOVE_AND_SAVE])) !== "remove") return null;
    return savePerson(editingId, payload, expected, true);
  }
}

export async function deletePerson(id: string) {
  const res = await adminWrite(`/api/people/${encodeURIComponent(id)}`, { method: "DELETE" }, TOUCHES);
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) throw new Error(data?.error ?? "Delete failed.");
}
