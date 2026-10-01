import { adminWrite } from "@/lib/client/admin-store";
import { expectVersion, RecordChangedError, throwIfRecordChanged, type RecordChangedAnswer } from "@/lib/record-changed";

export type SavePart<T> = {
  label: string;
  url: string;
  body: unknown;
  version: string | null;
  apply: (saved: T) => void;
};

export type PartOutcome = { label: string; kind: "saved" | "failed" | "reloaded" | "kept"; reason?: string };

async function send<T>(part: SavePart<T>, version: string | null): Promise<T> {
  const res = await adminWrite(
    part.url,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...expectVersion(version) },
      body: JSON.stringify(part.body),
    },
    ["pages"]
  );
  const data = (await res.json().catch(() => null)) as { item?: T; error?: unknown } | null;
  if (!res.ok) {
    throwIfRecordChanged(data);
    throw new Error(typeof data?.error === "string" ? data.error : "");
  }
  if (!data?.item) throw new Error("The server did not return the saved page.");
  return data.item;
}

const versionOfItem = (item: unknown) => (item as { updatedAt?: string | null } | null)?.updatedAt ?? null;

export async function savePageParts(
  parts: SavePart<unknown>[],
  ask: () => Promise<RecordChangedAnswer>
): Promise<PartOutcome[]> {
  const outcomes = new Map<string, PartOutcome>();
  let pending = parts.map((part) => ({ part, version: part.version }));

  while (pending.length) {
    const results = await Promise.allSettled(pending.map(({ part, version }) => send(part, version)));
    const conflicts: { part: SavePart<unknown>; current: unknown }[] = [];
    results.forEach((result, index) => {
      const { part } = pending[index]!;
      if (result.status === "fulfilled") {
        part.apply(result.value);
        outcomes.set(part.label, { label: part.label, kind: "saved" });
      } else if (result.reason instanceof RecordChangedError) {
        conflicts.push({ part, current: result.reason.current });
      } else {
        const reason = result.reason instanceof Error ? result.reason.message : "";
        outcomes.set(part.label, { label: part.label, kind: "failed", reason });
      }
    });
    if (!conflicts.length) break;

    const answer = await ask();
    if (answer === "reload") conflicts.forEach(({ part, current }) => part.apply(current));
    if (answer !== "overwrite") {
      const kind = answer === "reload" ? "reloaded" : "kept";
      conflicts.forEach(({ part }) => outcomes.set(part.label, { label: part.label, kind }));
      break;
    }
    pending = conflicts.map(({ part, current }) => ({ part, version: versionOfItem(current) }));
  }

  return parts.map((part) => outcomes.get(part.label)!);
}

export function saveSummary(rowLabel: string, outcomes: PartOutcome[]) {
  const labels = (kind: PartOutcome["kind"]) => outcomes.filter((o) => o.kind === kind).map((o) => o.label);
  const saved = labels("saved");
  const failed = outcomes
    .filter((o) => o.kind === "failed")
    .map((o) => (o.reason ? `${o.label} (${o.reason})` : o.label));
  const notes = [
    labels("reloaded").length ? `Loaded the newer version of ${labels("reloaded").join(", ")}.` : "",
    labels("kept").length ? `${labels("kept").join(", ")} not saved — changed on another device.` : "",
  ].filter(Boolean);

  if (failed.length) {
    const head = saved.length
      ? `${rowLabel}: saved ${saved.join(", ")}; ${failed.join(", ")} failed. Try again.`
      : `${rowLabel} not saved — ${failed.join(", ")} failed. Try again.`;
    return { type: "err" as const, text: [head, ...notes].join(" ") };
  }
  if (notes.length) {
    const head = saved.length ? `${rowLabel}: saved ${saved.join(", ")}.` : "";
    return { type: "info" as const, text: [head, ...notes].filter(Boolean).join(" ") };
  }
  return { type: "ok" as const, text: outcomes.length > 1 ? `${rowLabel} saved — ${saved.join(", ")}.` : `${rowLabel} saved.` };
}
