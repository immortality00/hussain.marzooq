import { adminWrite } from "@/lib/client/admin-store";
import { MediaInUseError, throwIfMediaInUse } from "@/lib/client/media-usage-api";
import { expectVersion, throwIfRecordChanged } from "@/lib/record-changed";
import { REMOVE_AND_SAVE, type AskMediaUsage } from "@/components/admin/media-usage/useMediaUsageDialog";
import { CHANGE_TOUCHES, deliveryErrorOf } from "../../lib/editor-actions";
import type { SavedMedia } from "../../lib/media-store";

export type LabelChange = { tags: string[] } | { peopleIds: string[] };
export type SavedLabels = { saved: SavedMedia; deliveryError: string | null };

async function sendLabels(
  id: string,
  change: LabelChange,
  expected: string | null | undefined,
  clearPageUsages: boolean
): Promise<SavedLabels> {
  const res = await adminWrite(
    `/api/media/${encodeURIComponent(id)}/labels`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...expectVersion(expected) },
      body: JSON.stringify({ ...change, ...(clearPageUsages ? { clearPageUsages: true } : {}) }),
    },
    CHANGE_TOUCHES
  );

  const data = (await res.json().catch(() => null)) as
    | (Partial<SavedMedia> & { ok?: boolean; error?: string; deliveryError?: unknown })
    | null;

  if (!res.ok || !data?.ok) {
    throwIfMediaInUse(data);
    throwIfRecordChanged(data);
    throw new Error(data?.error ?? "Save failed.");
  }
  if (!data.item || !data.listItem) throw new Error("The server did not return the saved media.");

  return { saved: { item: data.item, listItem: data.listItem }, deliveryError: deliveryErrorOf(data) };
}

// null: a page uses the photo and the question was cancelled.
export async function saveMediaLabels(
  id: string,
  change: LabelChange,
  expected: string | null | undefined,
  ask: AskMediaUsage
): Promise<SavedLabels | null> {
  try {
    return await sendLabels(id, change, expected, false);
  } catch (e: unknown) {
    if (!(e instanceof MediaInUseError)) throw e;
    if ((await ask(e.items, [REMOVE_AND_SAVE])) !== "remove") return null;
    return sendLabels(id, change, expected, true);
  }
}
