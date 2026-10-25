import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const mocks = vi.hoisted(() => ({
  consumeFixedWindowRateLimit: vi.fn<(args: { bucket: string }) => Promise<{ limited: boolean }>>(async () => ({ limited: false })),
  claimDuplicateWindow: vi.fn(async () => ({ duplicated: false })),
  releaseDuplicateWindow: vi.fn(async () => {}),
  sendVisitorEmail: vi.fn<(inbox: string, to: string, content: { text: string }) => Promise<void>>(async () => {}),
  addSubscriber: vi.fn<(email: string) => Promise<void>>(async () => {}),
  subscriptionsReady: vi.fn(() => true),
  getBlogActive: vi.fn(async () => true),
}));

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/server/request-guards", () => ({
  consumeFixedWindowRateLimit: mocks.consumeFixedWindowRateLimit,
  claimDuplicateWindow: mocks.claimDuplicateWindow,
  releaseDuplicateWindow: mocks.releaseDuplicateWindow,
}));
vi.mock("@/lib/server/email", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/email")>()),
  sendVisitorEmail: mocks.sendVisitorEmail,
}));
vi.mock("@/lib/server/blog-subscribers", () => ({
  addSubscriber: mocks.addSubscriber,
  subscriptionsReady: mocks.subscriptionsReady,
}));
vi.mock("@/lib/server/page-settings", () => ({ getBlogActive: mocks.getBlogActive }));

vi.stubEnv("ADMIN_COOKIE_SECRET", "blog-subscribe-secret");

import { POST as subscribe } from "@/app/api/subscribe/route";
import { POST as confirm } from "@/app/api/subscribe/confirm/route";
import { issueFormToken } from "@/lib/server/form-token";

const ready = (form: "subscribe" | "inquiry" = "subscribe") => issueFormToken(form, Date.now() - 5000);

function post(handler: (req: Request) => Promise<Response>, body: unknown) {
  return handler(
    new Request("https://hussain.art/api/x", {
      method: "POST",
      headers: { "content-type": "application/json", "x-nf-client-connection-ip": "203.0.113.9" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

const signUp = (overrides: Record<string, unknown> = {}) =>
  post(subscribe, { email: "Reader@Example.com", formToken: ready(), ...overrides });

function linkToken() {
  const text = mocks.sendVisitorEmail.mock.calls.at(-1)?.[2].text ?? "";
  return text.match(/#t=([A-Za-z0-9_-]{43})/)?.[1] ?? "";
}

beforeEach(() => resetMemoryDb());
afterEach(() => vi.clearAllMocks());

describe("POST /api/subscribe", () => {
  test("sends a confirmation from press@ and stores only the link's hash", async () => {
    const res = await signUp();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, message: "Check your inbox to confirm." });
    expect(mocks.sendVisitorEmail).toHaveBeenCalledWith("press", "reader@example.com", expect.anything());
    const token = linkToken();
    expect(token).not.toBe("");
    expect(memory.collections.blog_signups?.[0]).toMatchObject({
      _id: createHash("sha256").update(token).digest("hex"),
      email: "reader@example.com",
    });
  });

  test.each([
    ["not JSON", "{oops"],
    ["an array", "[]"],
    ["over 4 KB", JSON.stringify({ email: "a@b.co", pad: "x".repeat(5000) })],
  ])("refuses a body that is %s", async (_label, body) => {
    expect((await post(subscribe, body)).status).toBe(400);
    expect(mocks.sendVisitorEmail).not.toHaveBeenCalled();
  });

  test.each(["", "not-an-email", "a,victim@example.com", "a@b.co<x@y.z>", `${"a".repeat(250)}@b.co`, 42])(
    "refuses the address %j",
    async (email) => {
      expect((await signUp({ email })).status).toBe(400);
      expect(mocks.sendVisitorEmail).not.toHaveBeenCalled();
    }
  );

  test("answers a filled honeypot like a success and sends nothing", async () => {
    const res = await signUp({ website: "spam.example" });
    expect(res.status).toBe(200);
    expect(mocks.sendVisitorEmail).not.toHaveBeenCalled();
  });

  test.each([
    ["missing", undefined],
    ["forged", "v1.subscribe.1.deadbeef"],
    ["for another form", ready("inquiry")],
    ["too fresh", issueFormToken("subscribe")],
  ])("refuses a form token that is %s", async (_label, formToken) => {
    expect((await signUp({ formToken })).status).toBe(400);
    expect(mocks.sendVisitorEmail).not.toHaveBeenCalled();
  });

  test("is unavailable without the Resend setup, and while the blog is off", async () => {
    mocks.subscriptionsReady.mockReturnValueOnce(false);
    expect((await signUp()).status).toBe(503);
    mocks.getBlogActive.mockResolvedValueOnce(false);
    expect((await signUp()).status).toBe(404);
    expect(mocks.sendVisitorEmail).not.toHaveBeenCalled();
  });

  test("limits each IP", async () => {
    mocks.consumeFixedWindowRateLimit.mockResolvedValueOnce({ limited: true });
    expect((await signUp()).status).toBe(429);
    expect(mocks.consumeFixedWindowRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ bucket: "blog-subscribe", key: "203.0.113.9" })
    );
    expect(mocks.sendVisitorEmail).not.toHaveBeenCalled();
  });

  test("emails one address once a day, with the same answer either way", async () => {
    mocks.claimDuplicateWindow.mockResolvedValueOnce({ duplicated: true });
    const res = await signUp();
    expect(await res.json()).toEqual({ ok: true, message: "Check your inbox to confirm." });
    expect(mocks.claimDuplicateWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "blog-subscribe-address",
        key: createHash("sha256").update("reader@example.com").digest("hex"),
      })
    );
    expect(mocks.sendVisitorEmail).not.toHaveBeenCalled();
  });

  test("stops at the site-wide daily cap and frees the address for tomorrow", async () => {
    mocks.consumeFixedWindowRateLimit.mockImplementation(async ({ bucket }) => ({ limited: bucket === "blog-subscribe-site" }));
    expect((await signUp()).status).toBe(429);
    expect(mocks.releaseDuplicateWindow).toHaveBeenCalledWith(expect.objectContaining({ bucket: "blog-subscribe-address" }));
    expect(mocks.sendVisitorEmail).not.toHaveBeenCalled();
    mocks.consumeFixedWindowRateLimit.mockImplementation(async () => ({ limited: false }));
  });

  test("a failed send leaves nothing behind, so the visitor can try again", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.sendVisitorEmail.mockRejectedValueOnce(new Error("Resend rejected"));
    const res = await signUp();
    expect(res.status).toBe(502);
    expect((await res.json()).error).not.toContain("Resend");
    expect(memory.collections.blog_signups ?? []).toHaveLength(0);
    expect(mocks.releaseDuplicateWindow).toHaveBeenCalled();
  });
});

describe("POST /api/subscribe/confirm", () => {
  async function pendingToken() {
    await signUp();
    return linkToken();
  }

  test("adds the address to Resend once; opening the link again still answers confirmed", async () => {
    const token = await pendingToken();
    const res = await post(confirm, { token });
    expect(res.status).toBe(200);
    expect(mocks.addSubscriber).toHaveBeenCalledWith("reader@example.com");
    expect(memory.collections.blog_signups?.[0]?.confirmedAt).toBeInstanceOf(Date);
    expect((await post(confirm, { token })).status).toBe(200);
    expect(mocks.addSubscriber).toHaveBeenCalledTimes(1);
  });

  test.each([undefined, "short", "A".repeat(44), `${"A".repeat(42)}!`])("refuses the token %j", async (token) => {
    expect((await post(confirm, { token })).status).toBe(400);
    expect(mocks.consumeFixedWindowRateLimit).not.toHaveBeenCalled();
  });

  test("an unknown link has expired", async () => {
    expect((await post(confirm, { token: "A".repeat(43) })).status).toBe(410);
    expect(mocks.addSubscriber).not.toHaveBeenCalled();
  });

  test("keeps the link when Resend fails, so the same link works on retry", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const token = await pendingToken();
    mocks.addSubscriber.mockRejectedValueOnce(new Error("Resend refused"));
    const failed = await post(confirm, { token });
    expect(failed.status).toBe(502);
    expect((await failed.json()).error).not.toContain("Resend");
    expect((await post(confirm, { token })).status).toBe(200);
  });

  test("limits each IP", async () => {
    mocks.consumeFixedWindowRateLimit.mockResolvedValueOnce({ limited: true });
    expect((await post(confirm, { token: "A".repeat(43) })).status).toBe(429);
  });
});
