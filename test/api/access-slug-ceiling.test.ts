import { afterEach, describe, expect, it, vi } from "vitest";

const { consumeFixedWindowRateLimit, findOne } = vi.hoisted(() => ({
  consumeFixedWindowRateLimit: vi.fn<(args: { bucket: string }) => Promise<{ limited: boolean }>>(
    async () => ({ limited: false })
  ),
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

function call(handler: (req: Request) => Promise<Response>, ip: string) {
  return handler(
    new Request("https://hm.test/api/x", {
      method: "POST",
      headers: { "content-type": "application/json", "x-nf-client-connection-ip": ip },
      body: JSON.stringify({ slug: "wedding", password: "guess-1234" }),
    })
  );
}

afterEach(() => {
  vi.clearAllMocks();
  consumeFixedWindowRateLimit.mockImplementation(async () => ({ limited: false }));
});

describe.each([
  ["private gallery", galleryAccess, "private-gallery-access"],
  ["person", personAccess, "person-access"],
])("%s access across many IPs", (_label, handler, bucket) => {
  it("counts every attempt on the slug, whatever the IP", async () => {
    await call(handler, "203.0.113.1");
    expect(consumeFixedWindowRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ bucket: `${bucket}-slug`, key: "wedding", limit: 30 })
    );
  });

  it("refuses before checking the password once the slug ceiling is reached", async () => {
    consumeFixedWindowRateLimit.mockImplementation(async ({ bucket: b }) => ({ limited: b === `${bucket}-slug` }));
    const res = await call(handler, "198.51.100.7");
    expect(res.status).toBe(429);
    expect(findOne).not.toHaveBeenCalled();
  });

  it("does not touch the slug ceiling when the IP is already limited", async () => {
    consumeFixedWindowRateLimit.mockImplementation(async () => ({ limited: true }));
    expect((await call(handler, "198.51.100.8")).status).toBe(429);
    expect(consumeFixedWindowRateLimit).toHaveBeenCalledTimes(1);
  });
});
