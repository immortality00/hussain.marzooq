import { beforeEach, describe, expect, test, vi } from "vitest";

const filters = vi.hoisted(() => [] as Record<string, unknown>[]);

vi.mock("@/lib/server/db", () => ({
  getDb: async () => ({
    collection: () => ({
      find: (filter: Record<string, unknown>) => {
        filters.push(filter);
        const cursor = { sort: () => cursor, limit: () => cursor, toArray: async () => [] };
        return cursor;
      },
    }),
  }),
}));

import { searchTestimonialLocations } from "@/lib/server/location-search";

beforeEach(() => {
  filters.length = 0;
});

describe("city search", () => {
  test("runs one anchored, case-sensitive prefix search the index can serve", async () => {
    await searchTestimonialLocations("Dubaï");
    expect(filters).toHaveLength(1);
    const regex = filters[0]!.searchNames as RegExp;
    expect(regex.source).toBe("^dubai");
    expect(regex.flags).toBe("");
  });

  test("caps the query before searching", async () => {
    await searchTestimonialLocations("a".repeat(500));
    expect((filters[0]!.searchNames as RegExp).source).toBe(`^${"a".repeat(60)}`);
  });

  test("never queries for under two characters", async () => {
    expect(await searchTestimonialLocations("d")).toEqual([]);
    expect(filters).toHaveLength(0);
  });
});
