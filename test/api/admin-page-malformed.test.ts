import { describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null, isAdminAuthedServer: async () => true }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));

import { PATCH as patchSections } from "@/app/api/admin/page-sections/[slug]/route";
import { PATCH as patchSeo } from "@/app/api/admin/page-seo/[slug]/route";
import { PATCH as patchSettings } from "@/app/api/admin/page-settings/[slug]/route";

const malformed = (path: string, body: string) =>
  new NextRequest(`http://localhost${path}`, {
    method: "PATCH",
    body,
    headers: { "content-type": "application/json" },
  });

const cases = [
  ["page-sections", patchSections, "home"],
  ["page-seo", patchSeo, "home"],
  ["page-settings", patchSettings, "photography"],
] as const;

describe("admin page routes refuse a malformed body", () => {
  test.each(cases)("%s answers 400 for broken JSON and for null", async (name, patch, slug) => {
    for (const body of ["{not json", "null", "[1,2]"]) {
      const res = await patch(malformed(`/api/admin/${name}/${slug}`, body), {
        params: Promise.resolve({ slug }),
      });
      expect(res.status).toBe(400);
      expect(await res.json()).toHaveProperty("error");
    }
  });
});
