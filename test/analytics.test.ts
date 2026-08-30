import { describe, it, expect } from "vitest";
import { goatCounterPeriod } from "@/lib/server/analytics";

describe("goatCounterPeriod", () => {
  it("returns end at now and start `days` earlier", () => {
    const now = new Date("2026-08-30T12:00:00.000Z");
    const { start, end } = goatCounterPeriod(now, 30);
    expect(end).toBe("2026-08-30T12:00:00.000Z");
    expect(start).toBe("2026-07-31T12:00:00.000Z");
  });

  it("handles a 7-day window", () => {
    const now = new Date("2026-01-08T00:00:00.000Z");
    const { start } = goatCounterPeriod(now, 7);
    expect(start).toBe("2026-01-01T00:00:00.000Z");
  });

  it("does not mutate the input date", () => {
    const now = new Date("2026-08-30T12:00:00.000Z");
    goatCounterPeriod(now, 30);
    expect(now.toISOString()).toBe("2026-08-30T12:00:00.000Z");
  });
});
