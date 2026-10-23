import { asMediaInUseList, readMediaInUse, type MediaInUse } from "@/lib/media-in-use";

export class MediaInUseError extends Error {
  items: MediaInUse[];
  canReplace: boolean;
  hides: boolean;

  constructor(items: MediaInUse[], canReplace: boolean, message: string, hides = false) {
    super(message);
    this.name = "MediaInUseError";
    this.items = items;
    this.canReplace = canReplace;
    this.hides = hides;
  }
}

export function throwIfMediaInUse(data: unknown) {
  const items = readMediaInUse(data);
  if (!items) return;
  const body = data as Record<string, unknown>;
  throw new MediaInUseError(
    items,
    body.canReplace === true,
    typeof body.error === "string" ? body.error : "This media is used on the site.",
    body.hides === true
  );
}

export async function fetchMediaUsages(ids: string[]): Promise<MediaInUse[]> {
  const res = await fetch("/api/media/usages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: unknown; error?: string } | null;

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error ?? "Could not check where the media is used.");
  }
  return asMediaInUseList(data.items);
}
