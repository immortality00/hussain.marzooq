// A media item with a future `publishAt` stays off every public surface until then.
// Runtime-agnostic: the public reads, the save routes and the admin editor all use it.

const MINUTE_MS = 60_000;

export const PUBLIC_MEDIA_VISIBILITY = {
  $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
};

// `publishAt: null` also matches a document without the field (every item saved before scheduling).
export function releasedMediaFilter(now: Date = new Date()) {
  return { $or: [{ publishAt: null }, { publishAt: { $lte: now } }] };
}

export function publicMediaFilter(now: Date = new Date()) {
  return { $and: [PUBLIC_MEDIA_VISIBILITY, releasedMediaFilter(now)] };
}

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isScheduled(publishAt: unknown, now: Date = new Date()): boolean {
  const date = toDate(publishAt);
  return date !== null && date.getTime() > now.getTime();
}

function sameMinute(a: Date, b: Date) {
  return Math.floor(a.getTime() / MINUTE_MS) === Math.floor(b.getTime() / MINUTE_MS);
}

// undefined = the request did not mention it; null = publish now; Date = schedule.
export type PublishAtInput = Date | null | undefined;

export function parsePublishAt(value: unknown): { ok: true; value: PublishAtInput } | { ok: false; error: string } {
  if (value === undefined) return { ok: true, value: undefined };
  if (value === null || value === "") return { ok: true, value: null };
  const date = toDate(value);
  if (!date) return { ok: false, error: "Use a valid publish date and time." };
  return { ok: true, value: date };
}

export const PAST_PUBLISH_ERROR = "Pick a publish time in the future.";

// A scheduled item's date on the site is its publish time, so it shows as the newest when it goes live.
export function scheduleOnCreate(
  publishAt: PublishAtInput,
  now: Date
): { ok: true; set: { publishAt: Date | null; createdAt?: Date } } | { ok: false; error: string } {
  if (!publishAt) return { ok: true, set: { publishAt: null } };
  if (publishAt.getTime() <= now.getTime()) return { ok: false, error: PAST_PUBLISH_ERROR };
  return { ok: true, set: { publishAt, createdAt: publishAt } };
}

export function scheduleOnUpdate(
  incoming: PublishAtInput,
  stored: unknown,
  now: Date
): { ok: true; set: { publishAt?: Date | null; createdAt?: Date } } | { ok: false; error: string } {
  if (incoming === undefined) return { ok: true, set: {} };
  const storedDate = toDate(stored);
  const wasScheduled = storedDate !== null && storedDate.getTime() > now.getTime();

  if (incoming === null) {
    // "Now" on a still-scheduled item publishes it immediately, as the newest.
    return wasScheduled ? { ok: true, set: { publishAt: null, createdAt: now } } : { ok: true, set: {} };
  }

  if (storedDate && sameMinute(incoming, storedDate)) return { ok: true, set: {} };
  if (incoming.getTime() <= now.getTime()) return { ok: false, error: PAST_PUBLISH_ERROR };
  return { ok: true, set: { publishAt: incoming, createdAt: incoming } };
}

// <input type="datetime-local"> works in the browser's own time zone.
export function toLocalInputValue(value: unknown): string {
  const date = toDate(value);
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localInputToIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatPublishAt(value: unknown): string {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// The editor's choice: Now (the default) or a date and time.
export type PublishSchedule = { scheduled: boolean; local: string };

export const PUBLISH_NOW: PublishSchedule = { scheduled: false, local: "" };

export function publishScheduleFrom(publishAt: unknown, now: Date = new Date()): PublishSchedule {
  return isScheduled(publishAt, now) ? { scheduled: true, local: toLocalInputValue(publishAt) } : PUBLISH_NOW;
}

export function publishScheduleError(schedule: PublishSchedule): string | null {
  if (!schedule.scheduled) return null;
  if (!localInputToIso(schedule.local)) return "Pick a publish date and time.";
  return null;
}

export function publishAtPayload(schedule: PublishSchedule): string | null {
  return schedule.scheduled ? localInputToIso(schedule.local) : null;
}
