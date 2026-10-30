import { describe, expect, test } from "vitest";
import { overviewOf } from "@/lib/client/admin-overview";
import type { AdminSnapshot } from "@/lib/server/admin-snapshot";

function data(posts: { waiting: boolean; isPublished: boolean }[]) {
  return {
    dashboard: { stats: { inquiries: { new: 0, active: 0 } } },
    testimonials: [],
    inquiries: [],
    removal: { items: [], history: [] },
    people: [],
    services: [],
    galleries: [],
    pages: { settings: {}, seo: {}, sections: {}, sectionsUpdatedAt: {} },
    blog: { posts, forms: {}, categoryOptions: [] },
    push: { publicKey: null, devices: [] },
  } as unknown as AdminSnapshot;
}

describe("dashboard: blog drafts waiting (U7)", () => {
  test("counts the drafts made from new media that still wait, from the list on the phone", () => {
    const overview = overviewOf(
      data([
        { waiting: true, isPublished: false },
        { waiting: true, isPublished: false },
        { waiting: false, isPublished: false },
        { waiting: false, isPublished: true },
      ])
    );
    expect(overview.dashboard.stats.blogDrafts).toBe(2);
  });

  test("they don't light the red badge", () => {
    expect(overviewOf(data([{ waiting: true, isPublished: false }])).notificationCount).toBe(0);
  });
});
