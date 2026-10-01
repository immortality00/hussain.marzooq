import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: string[] = [];

const facetRows: Record<string, unknown> = {
  media: { total: [{ n: 12 }], public: [{ n: 9 }], byCategory: [{ _id: "photography", count: 7 }, { _id: "nft", count: 2 }] },
  testimonials: { total: [{ n: 5 }], pending: [{ n: 2 }] },
  inquiries: { new: [{ n: 3 }], active: [{ n: 4 }] },
  people_profiles: { total: [{ n: 6 }], removal: [] },
};

const counts: Record<string, number> = { services: 4, private_galleries: 1 };

vi.mock("@/lib/server/db", () => ({
  getDb: async () => ({
    collection: (name: string) => ({
      aggregate: () => {
        calls.push(`aggregate:${name}`);
        return { toArray: async () => [facetRows[name]] };
      },
      countDocuments: async () => {
        calls.push(`count:${name}`);
        return counts[name];
      },
    }),
  }),
}));

import { getAdminDashboardStats } from "@/lib/server/admin-dashboard";
import { pendingCount } from "@/lib/admin-data";

beforeEach(() => {
  calls.length = 0;
});

describe("admin dashboard counts", () => {
  it("reads each collection once and maps every figure the dashboard shows", async () => {
    const stats = await getAdminDashboardStats();
    expect(stats).toMatchObject({
      media: { total: 12, public: 9 },
      testimonials: { total: 5, pending: 2 },
      inquiries: { new: 3, active: 4 },
      people: 6,
      removalRequests: 0,
      services: 4,
      privateGalleries: 1,
    });
    expect(stats.media.byCategory.find((c) => c.key === "photography")?.count).toBe(7);
    expect(stats.media.byCategory.find((c) => c.key === "showreel")?.count).toBe(0);
    expect(calls.sort()).toEqual(
      [
        "aggregate:inquiries",
        "aggregate:media",
        "aggregate:people_profiles",
        "aggregate:testimonials",
        "count:private_galleries",
        "count:services",
      ].sort()
    );
  });

  it("badge total = reviews to approve + new inquiries + removal requests, from the one set of counts", async () => {
    const stats = await getAdminDashboardStats();
    calls.length = 0;
    expect(pendingCount(stats)).toBe(5);
    expect(calls).toEqual([]);
  });
});
