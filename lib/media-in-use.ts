export const MEDIA_IN_USE = "MEDIA_IN_USE";

export type MediaInUse = { id: string; title: string; usedOn: string[] };

export type MediaUsageChoice = "replace" | "remove";

export function parseMediaUsageChoice(value: unknown): MediaUsageChoice | null {
  return value === "replace" || value === "remove" ? value : null;
}

export function formatMediaInUseError(items: MediaInUse[]) {
  const lines = items.map((item) => `“${item.title}” is used in: ${item.usedOn.join(", ")}`);
  return `${lines.join(". ")}.`;
}

function isMediaInUse(value: unknown): value is MediaInUse {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    Array.isArray(item.usedOn) &&
    item.usedOn.every((label) => typeof label === "string")
  );
}

export function asMediaInUseList(value: unknown): MediaInUse[] {
  return Array.isArray(value) ? value.filter(isMediaInUse) : [];
}

export function readMediaInUse(data: unknown): MediaInUse[] | null {
  if (!data || typeof data !== "object") return null;
  const body = data as Record<string, unknown>;
  if (body.code !== MEDIA_IN_USE) return null;
  const items = asMediaInUseList(body.items);
  return items.length ? items : null;
}
