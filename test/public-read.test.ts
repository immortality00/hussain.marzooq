import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({ down: false }));

vi.mock("@/lib/server/db", async () => ({
  getDb: async () => {
    if (state.down) throw Object.assign(new Error("Server selection timed out"), { name: "MongoServerSelectionError" });
    return (await import("@/test/support/memory-db")).memoryDb;
  },
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }));

import { resetMemoryDb } from "@/test/support/memory-db";
import { getPostBySlug } from "@/lib/server/public-blog";
import { getPersonPageBySlug, getPublicPersonBySlug } from "@/lib/server/public-people";
import { getPageSettings, getBlogActive, getFooterPageSettings } from "@/lib/server/page-settings";
import { getTagPage } from "@/lib/server/tag-pages";
import { getPageSeo } from "@/lib/server/page-seo";
import { getTransitionImages } from "@/lib/server/public-media";
import { getSitemapSources } from "@/lib/server/sitemap-sources";

beforeEach(() => {
  resetMemoryDb();
  state.down = false;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const pageReads: [string, () => Promise<unknown>][] = [
  ["blog post", () => getPostBySlug("a-post")],
  ["person page", () => getPersonPageBySlug("someone")],
  ["person metadata", () => getPublicPersonBySlug("someone")],
  ["page settings", () => getPageSettings("dancing")],
  ["blog switch", () => getBlogActive()],
  ["tag page", () => getTagPage({ category: "photography", mediaMode: "image", tagSlug: "portraits" })],
  ["page SEO", () => getPageSeo("about")],
  ["sitemap dates", () => getSitemapSources()],
];

describe("public reads when the database is down", () => {
  test.each(pageReads)("%s throws at request time, so a cached page is kept", async (_name, read) => {
    state.down = true;
    await expect(read()).rejects.toThrow("Server selection timed out");
  });

  test.each(pageReads)("%s falls back during the build", async (_name, read) => {
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    state.down = true;
    await expect(read()).resolves.toBeDefined();
  });

  test("the layout reads never throw", async () => {
    state.down = true;
    await expect(getTransitionImages()).resolves.toEqual([]);
    const footer = await getFooterPageSettings();
    expect(footer.every((page) => page.isActive)).toBe(true);
  });
});

describe("a missing record is still missing", () => {
  test("missing post, person and tag give not-found", async () => {
    expect(await getPostBySlug("nope")).toBeNull();
    expect(await getPersonPageBySlug("nope")).toEqual({ state: "missing" });
    expect(await getTagPage({ category: "photography", mediaMode: "image", tagSlug: "nope" })).toBeNull();
  });
});
