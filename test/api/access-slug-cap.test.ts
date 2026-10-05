import { afterEach, describe, expect, it, vi } from "vitest";

const { consumeFixedWindowRateLimit, findOne } = vi.hoisted(() => ({
  consumeFixedWindowRateLimit: vi.fn(async () => ({ limited: false, count: 1, resetAt: "" })),
  findOne: vi.fn(async () => null),
}));

vi.mock("@/lib/server/request-guards", () => ({
  consumeFixedWindowRateLimit,
  clearFixedWindowRateLimit: vi.fn(),
}));
vi.mock("@/lib/server/db", () => ({ getDb: async () => ({ collection: () => ({ findOne }) }) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: vi.fn() }) }));

import { POST as galleryAccess } from "@/app/api/private-galleries/access/route";
import { POST as personAccess } from "@/app/api/people/access/route";

const HUGE_SLUG = "a".repeat(1_000_000);

function call(handler: (req: Request) => Promise<Response>, path: string) {
  return handler(
    new Request(`https://hm.test${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-nf-client-connection-ip": "203.0.113.9" },
      body: JSON.stringify({ slug: HUGE_SLUG, password: "guess-1234" }),
    })
  );
}

afterEach(() => vi.clearAllMocks());

describe.each([
  ["private gallery", galleryAccess, "/api/private-galleries/access"],
  ["person", personAccess, "/api/people/access"],
])("%s access with a 1,000,000-character slug", (_label, handler, path) => {
  it("rate-limits and looks up a slug capped at 100 characters", async () => {
    const res = await call(handler, path);

    expect(res.status).toBe(404);
    expect(consumeFixedWindowRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ key: `${"a".repeat(100)}:203.0.113.9` })
    );
    expect(findOne).toHaveBeenCalledWith({ slug: "a".repeat(100) });
  });
});
