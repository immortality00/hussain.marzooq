import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

// memory-db cannot run the pipeline update claimDuplicateWindow uses (it would never report a
// duplicate), so the dedupe window is a Map here.
const guards = vi.hoisted(() => {
  const live = new Map<string, number>();
  const id = ({ bucket, key }: { bucket: string; key: string }) => `${bucket}:${key}`;
  return {
    live,
    claimDuplicateWindow: vi.fn(async (args: { bucket: string; key: string; windowMs: number }) => {
      const duplicated = (live.get(id(args)) ?? 0) > Date.now();
      if (!duplicated) live.set(id(args), Date.now() + args.windowMs);
      return { duplicated };
    }),
    releaseDuplicateWindow: vi.fn(async (args: { bucket: string; key: string }) => {
      live.delete(id(args));
    }),
  };
});

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/server/request-guards", () => ({
  consumeFixedWindowRateLimit: async () => ({ limited: false }),
  claimDuplicateWindow: guards.claimDuplicateWindow,
  releaseDuplicateWindow: guards.releaseDuplicateWindow,
}));
vi.mock("@/lib/server/admin-alerts", () => ({ queueAdminAlert: vi.fn() }));

vi.stubEnv("ADMIN_COOKIE_SECRET", "form-token-test-secret");

import { POST } from "@/app/api/inquiries/route";
import { issueFormToken } from "@/lib/server/form-token";

const EMAIL = "visitor@example.com";
const MESSAGE = "A portrait session in Dubai next month.";

const send = (overrides: Record<string, unknown> = {}) =>
  POST(
    new Request("http://localhost/api/inquiries", {
      method: "POST",
      body: JSON.stringify({
        name: "Visitor",
        email: EMAIL,
        message: MESSAGE,
        formToken: issueFormToken("inquiry", Date.now() - 60_000),
        ...overrides,
      }),
    })
  );

beforeEach(() => {
  resetMemoryDb({ inquiries: [], services: [] });
  guards.live.clear();
  vi.clearAllMocks();
});

describe("inquiry duplicate window", () => {
  test("a failed save releases the window, so the same inquiry can be sent again", async () => {
    memory.failWritesTo.add("inquiries");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await send()).status).toBe(500);
    expect(guards.live.size).toBe(0);

    memory.failWritesTo.clear();
    const retry = await send();
    expect(retry.status).toBe(200);
    expect(memory.collections.inquiries).toHaveLength(1);
  });

  test("a saved inquiry still blocks an identical resend", async () => {
    expect((await send()).status).toBe(200);
    const again = await send();
    expect(again.status).toBe(409);
    expect(memory.collections.inquiries).toHaveLength(1);
  });

  test("a refused service never claims the window", async () => {
    const serviceId = new ObjectId().toHexString();
    expect((await send({ serviceId })).status).toBe(400);
    expect((await send({ serviceId })).status).toBe(400);
    expect(guards.claimDuplicateWindow).not.toHaveBeenCalled();
  });

  test("the window is keyed by a hash, never the visitor's email or message", async () => {
    memory.failWritesTo.add("inquiries");
    vi.spyOn(console, "error").mockImplementation(() => {});
    await send();

    const [claimed] = guards.claimDuplicateWindow.mock.calls[0]!;
    const [released] = guards.releaseDuplicateWindow.mock.calls[0]!;
    expect(claimed.key).toMatch(/^[0-9a-f]{64}$/);
    expect(released).toEqual({ bucket: "public-inquiries-dedupe", key: claimed.key });
    expect(JSON.stringify([claimed, released])).not.toMatch(/visitor@example\.com|portrait session/i);
  });
});
