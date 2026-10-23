import { adminWrite } from "@/lib/client/admin-store";
import { MediaInUseError, throwIfMediaInUse } from "@/lib/client/media-usage-api";
import type { AskMediaUsage, MediaUsageOption } from "@/components/admin/media-usage/useMediaUsageDialog";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

export type DecisionReply = {
  ok?: boolean;
  error?: string;
  removal?: AdminSnapshot["removal"];
  person?: AdminSnapshot["people"][number] | null;
  deliveryError?: unknown;
};

const REMOVE_AND_APPROVE: MediaUsageOption = {
  answer: "remove",
  label: "Remove from those places and approve",
  variant: "danger",
};

async function decide(id: string, body: Record<string, unknown>): Promise<DecisionReply> {
  const res = await adminWrite(
    `/api/people/${encodeURIComponent(id)}/removal`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    ["removal", "people", "media", "dashboard"]
  );
  const data = (await res.json().catch(() => null)) as DecisionReply | null;
  if (!res.ok || !data?.ok || !data.removal) {
    throwIfMediaInUse(data);
    throw new Error(data?.error ?? "Action failed.");
  }
  return data;
}

// Approving makes the person's files private; a page using one asks first.
export async function decideWithUsageCheck(
  id: string,
  body: Record<string, unknown>,
  ask: AskMediaUsage
): Promise<DecisionReply | null> {
  try {
    return await decide(id, body);
  } catch (e: unknown) {
    if (!(e instanceof MediaInUseError)) throw e;
    if ((await ask(e.items, [REMOVE_AND_APPROVE])) !== "remove") return null;
    return decide(id, { ...body, clearPageUsages: true });
  }
}
