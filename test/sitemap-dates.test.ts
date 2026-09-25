import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
  getDb: vi.fn(async () => {
    throw new Error("unreachable in these tests");
  }),
}));

import { getSitemapSources } from "@/lib/server/sitemap-sources";
import {
  EMPTY_SITEMAP_SOURCES,
  latest,
  personPageModified,
  postPageModified,
  servicePageModified,
  staticPageModified,
  tagPageModified,
  type SitemapSources,
} from "@/lib/sitemap-dates";

const d = (iso: string) => new Date(iso);

function sources(overrides: Partial<SitemapSources> = {}): SitemapSources {
  return {
    ...EMPTY_SITEMAP_SOURCES,
    pages: new Map(),
    media: {},
    services: new Map(),
    posts: new Map(),
    tags: new Map(),
    tagMedia: { photography: new Map(), videography: new Map() },
    people: new Map(),
    ...overrides,
  };
}

describe("latest", () => {
  test("returns the newest real Date and ignores everything else", () => {
    expect(latest(d("2026-01-01"), undefined, "2027-01-01", null, d("2026-03-01"))).toEqual(
      d("2026-03-01")
    );
    expect(latest(new Date("invalid"), undefined)).toBeUndefined();
    expect(latest()).toBeUndefined();
  });
});

describe("staticPageModified", () => {
  test("uses the page's own copy when nothing it lists is newer", () => {
    const s = sources({ pages: new Map([["about", d("2026-05-01")]]) });
    expect(staticPageModified(s, "/about")).toEqual(d("2026-05-01"));
  });

  test("a newer media item moves its discipline page, not unrelated ones", () => {
    const s = sources({
      pages: new Map([
        ["photography", d("2026-01-01")],
        ["nft", d("2026-01-01")],
      ]),
      media: { photography: d("2026-06-10") },
    });
    expect(staticPageModified(s, "/photography")).toEqual(d("2026-06-10"));
    expect(staticPageModified(s, "/nft")).toEqual(d("2026-01-01"));
  });

  test("home reflects services, testimonials and exhibition media", () => {
    const s = sources({
      pages: new Map([["home", d("2026-01-01")]]),
      services: new Map([["wedding", d("2026-02-01")]]),
      testimonials: d("2026-04-01"),
      media: { exhibited: d("2026-03-01") },
    });
    expect(staticPageModified(s, "/")).toEqual(d("2026-04-01"));
  });

  test("unknown dates stay unknown instead of becoming now", () => {
    expect(staticPageModified(sources(), "/privacy")).toBeUndefined();
    expect(staticPageModified(sources(), "/not-a-page")).toBeUndefined();
  });
});

describe("detail pages", () => {
  const s = sources({
    pages: new Map([
      ["services-detail", d("2026-01-01")],
      ["people-detail", d("2026-01-01")],
      ["blog-detail", d("2026-01-01")],
      ["blog", d("2026-02-01")],
      ["photography-tag", d("2026-01-01")],
    ]),
    services: new Map([["wedding", d("2026-05-01")]]),
    people: new Map([["sara", d("2026-06-01")]]),
    posts: new Map([["first-post", d("2025-12-01")]]),
    tags: new Map([["portraits", d("2026-01-15")]]),
    tagMedia: { photography: new Map([["portraits", d("2026-07-01")]]), videography: new Map() },
  });

  test("each uses its own document plus its template copy", () => {
    expect(servicePageModified(s, "wedding")).toEqual(d("2026-05-01"));
    expect(personPageModified(s, "sara")).toEqual(d("2026-06-01"));
    expect(postPageModified(s, "first-post")).toEqual(d("2026-02-01"));
    expect(tagPageModified(s, "photography", "portraits")).toEqual(d("2026-07-01"));
  });

  test("a tag's media in one discipline does not date the other discipline's page", () => {
    expect(tagPageModified(s, "videography", "portraits")).toEqual(d("2026-01-15"));
  });
});

describe("getSitemapSources", () => {
  test("falls back to empty sources when the database is unreachable", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(getSitemapSources()).resolves.toBe(EMPTY_SITEMAP_SOURCES);
    error.mockRestore();
  });
});
