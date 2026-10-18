import { describe, expect, test } from "vitest";
import {
  PAST_PUBLISH_ERROR,
  PUBLISH_NOW,
  isScheduled,
  localInputToIso,
  parsePublishAt,
  publicMediaFilter,
  publishAtPayload,
  publishScheduleError,
  publishScheduleFrom,
  scheduleOnCreate,
  scheduleOnUpdate,
  toLocalInputValue,
} from "@/lib/media-schedule";
import { buildPublicMediaQuery } from "@/lib/server/media-serializers";
import { buildBatchPayload } from "@/app/admin/(protected)/media/batch/lib/batch-save";
import type { BatchItem } from "@/app/admin/(protected)/media/batch/lib/useBatchMediaState";

const NOW = new Date("2026-10-18T10:00:00.000Z");
const LATER = new Date("2026-10-24T14:00:00.000Z");
const EARLIER = new Date("2026-10-01T09:00:00.000Z");

// Mirrors how MongoDB evaluates the released filter: `publishAt: null` matches a missing field too.
function released(doc: { publishAt?: Date | null }, now: Date) {
  const [nullClause, lteClause] = publicMediaFilter(now).$and[1]!.$or;
  expect(nullClause).toEqual({ publishAt: null });
  expect(lteClause).toEqual({ publishAt: { $lte: now } });
  return doc.publishAt == null || doc.publishAt.getTime() <= now.getTime();
}

describe("public filter", () => {
  test("every public media query carries the release check", () => {
    const query = buildPublicMediaQuery({ type: "embed", category: "videography" });
    expect(query.$and).toEqual([
      { $or: [{ isPublic: true }, { isPublic: { $exists: false } }] },
      { $or: [{ publishAt: null }, { publishAt: { $lte: expect.any(Date) } }] },
    ]);
    expect(query.type).toBe("embed");
    expect(query.categories).toBe("videography");
  });

  test("hides an item until its publish time", () => {
    expect(released({}, NOW)).toBe(true);
    expect(released({ publishAt: null }, NOW)).toBe(true);
    expect(released({ publishAt: EARLIER }, NOW)).toBe(true);
    expect(released({ publishAt: LATER }, NOW)).toBe(false);
    expect(released({ publishAt: LATER }, LATER)).toBe(true);
  });
});

describe("parsePublishAt", () => {
  test("absent means unchanged, empty means now", () => {
    expect(parsePublishAt(undefined)).toEqual({ ok: true, value: undefined });
    expect(parsePublishAt(null)).toEqual({ ok: true, value: null });
    expect(parsePublishAt("")).toEqual({ ok: true, value: null });
  });

  test("reads an ISO date and refuses anything else", () => {
    expect(parsePublishAt(LATER.toISOString())).toEqual({ ok: true, value: LATER });
    expect(parsePublishAt("tomorrow")).toEqual({ ok: false, error: "Use a valid publish date and time." });
    expect(parsePublishAt(42)).toEqual({ ok: false, error: "Use a valid publish date and time." });
    expect(parsePublishAt({ $gt: "" })).toEqual({ ok: false, error: "Use a valid publish date and time." });
  });
});

describe("scheduleOnCreate", () => {
  test("publishes now by default", () => {
    expect(scheduleOnCreate(null, NOW)).toEqual({ ok: true, set: { publishAt: null } });
    expect(scheduleOnCreate(undefined, NOW)).toEqual({ ok: true, set: { publishAt: null } });
  });

  test("a scheduled item takes its publish time as its date", () => {
    expect(scheduleOnCreate(LATER, NOW)).toEqual({ ok: true, set: { publishAt: LATER, createdAt: LATER } });
  });

  test("refuses a time that has passed", () => {
    expect(scheduleOnCreate(EARLIER, NOW)).toEqual({ ok: false, error: PAST_PUBLISH_ERROR });
    expect(scheduleOnCreate(NOW, NOW)).toEqual({ ok: false, error: PAST_PUBLISH_ERROR });
  });
});

describe("scheduleOnUpdate", () => {
  test("leaves everything alone when the request does not mention it", () => {
    expect(scheduleOnUpdate(undefined, LATER, NOW)).toEqual({ ok: true, set: {} });
  });

  test("Now on a live item changes nothing, so it keeps its place", () => {
    expect(scheduleOnUpdate(null, undefined, NOW)).toEqual({ ok: true, set: {} });
    expect(scheduleOnUpdate(null, EARLIER, NOW)).toEqual({ ok: true, set: {} });
  });

  test("Now on a scheduled item publishes it immediately, as the newest", () => {
    expect(scheduleOnUpdate(null, LATER, NOW)).toEqual({ ok: true, set: { publishAt: null, createdAt: NOW } });
  });

  test("an unchanged time is accepted even after it has passed", () => {
    const sameMinute = new Date(EARLIER.getTime() + 20_000);
    expect(scheduleOnUpdate(sameMinute, EARLIER, NOW)).toEqual({ ok: true, set: {} });
  });

  test("a changed time must be in the future", () => {
    const next = new Date("2026-11-01T08:00:00.000Z");
    expect(scheduleOnUpdate(next, LATER, NOW)).toEqual({ ok: true, set: { publishAt: next, createdAt: next } });
    expect(scheduleOnUpdate(EARLIER, LATER, NOW)).toEqual({ ok: false, error: PAST_PUBLISH_ERROR });
    expect(scheduleOnUpdate(LATER, undefined, NOW)).toEqual({ ok: true, set: { publishAt: LATER, createdAt: LATER } });
  });
});

describe("editor schedule", () => {
  test("a scheduled item opens on Schedule with its time; a live one on Now", () => {
    expect(publishScheduleFrom(LATER.toISOString(), NOW)).toEqual({
      scheduled: true,
      local: toLocalInputValue(LATER),
    });
    expect(publishScheduleFrom(EARLIER.toISOString(), NOW)).toEqual(PUBLISH_NOW);
    expect(publishScheduleFrom(null, NOW)).toEqual(PUBLISH_NOW);
    expect(isScheduled(LATER, NOW)).toBe(true);
    expect(isScheduled(EARLIER, NOW)).toBe(false);
  });

  test("the local field round-trips to the same instant", () => {
    const local = toLocalInputValue(LATER);
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(localInputToIso(local)).toBe(LATER.toISOString());
    expect(localInputToIso("2026-10-24")).toBeNull();
  });

  test("Schedule needs a date and time; Now sends null", () => {
    expect(publishScheduleError(PUBLISH_NOW)).toBeNull();
    expect(publishScheduleError({ scheduled: true, local: "" })).toBe("Pick a publish date and time.");
    expect(publishAtPayload(PUBLISH_NOW)).toBeNull();
    expect(publishAtPayload({ scheduled: true, local: toLocalInputValue(LATER) })).toBe(LATER.toISOString());
  });
});

describe("batch payload", () => {
  const link = (id: string, schedule: BatchItem["schedule"]): BatchItem => ({
    kind: "link",
    id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
    preview: null,
    title: id,
    description: "",
    schedule,
  });

  test("each item carries its own publish time", () => {
    const shared = { isPublic: true, categories: ["videography"] };
    const first = buildBatchPayload(link("aaaaaaaaaaa", PUBLISH_NOW), shared);
    const second = buildBatchPayload(link("bbbbbbbbbbb", { scheduled: true, local: toLocalInputValue(LATER) }), shared);
    expect(first.publishAt).toBeNull();
    expect(second.publishAt).toBe(LATER.toISOString());
  });

  test("a hidden batch sends no schedule", () => {
    const payload = buildBatchPayload(link("ccccccccccc", { scheduled: true, local: toLocalInputValue(LATER) }), {
      isPublic: false,
    });
    expect("publishAt" in payload).toBe(false);
  });
});
