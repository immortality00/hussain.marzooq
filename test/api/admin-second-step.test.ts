import { beforeEach, describe, expect, it, vi } from "vitest";
import { E2E } from "@/e2e/fixtures";
import { COOKIE_NAME, adminSessionSecret, readSessionCookie } from "@/lib/auth/session-token";
import { TRUSTED_DEVICE_COOKIE, isTrustedDevice } from "@/lib/auth/trusted-device";
import { PENDING_SIGN_IN_COOKIE, decideApproval, openSignInRequest } from "@/lib/server/sign-in-requests";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { queueApprovalRequest, verifyAuthenticationResponse } = vi.hoisted(() => ({
  queueApprovalRequest: vi.fn(),
  verifyAuthenticationResponse: vi.fn(),
}));

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit: async () => ({ limited: false }) }));
vi.mock("@/lib/server/admin-alerts", () => ({ queueApprovalRequest }));
vi.mock("@simplewebauthn/server", () => ({
  generateAuthenticationOptions: async () => ({ challenge: `challenge-${Math.random()}`, allowCredentials: [] }),
  verifyAuthenticationResponse,
}));

import { POST as passkeyOptions } from "@/app/admin/login/passkey/options/route";
import { POST as passkeyAnswer } from "@/app/admin/login/passkey/route";
import { GET as checkApproval, POST as startApproval } from "@/app/admin/login/approval/route";

const SECRET = "second-step-secret";
const PASSKEY = {
  credentialId: "cred",
  publicKey: { buffer: new Uint8Array([1, 2, 3]) },
  counter: 0,
  transports: ["internal"],
  name: "iPhone · Safari",
};

function call(
  handler: (req: Request) => Promise<Response>,
  cookie: string | null,
  { method = "POST", body, origin = "https://hussain.art" }: { method?: string; body?: unknown; origin?: string } = {}
) {
  const headers: Record<string, string> = { host: "hussain.art", origin };
  if (cookie) headers.cookie = `${PENDING_SIGN_IN_COOKIE}=${cookie}`;
  return handler(
    new Request("https://hussain.art/admin/login/x", {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );
}

const pendingCookie = () => openSignInRequest({ remember: true, next: "/admin/inquiries", device: "Windows · Chrome" });
const requestDoc = () => memory.collections.admin_auth_requests?.[0];

beforeEach(() => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", E2E.adminPasswordHash);
  vi.stubEnv("ADMIN_COOKIE_SECRET", SECRET);
  resetMemoryDb({ admin_passkeys: [{ ...PASSKEY }], admin_security: [{ _id: "admin", generation: 2 }] });
  queueApprovalRequest.mockClear();
  verifyAuthenticationResponse.mockReset().mockImplementation(async ({ response }: { response: { ok?: boolean } }) => ({
    verified: response.ok === true,
    authenticationInfo: { newCounter: 1 },
  }));
});

async function signedIn(res: Response) {
  const session = await readSessionCookie(
    (res as unknown as { cookies: { get(name: string): { value: string } | undefined } }).cookies.get(COOKIE_NAME)
      ?.value ?? "",
    adminSessionSecret()
  );
  return session;
}

describe("second sign-in step — passkey", () => {
  it("refuses without the cookie the password step sets, or from another site", async () => {
    expect((await call(passkeyOptions, null)).status).toBe(401);
    expect(await (await call(passkeyOptions, "a".repeat(32) + "." + "b".repeat(64))).json()).toEqual({
      ok: false,
      error: "expired",
    });
    expect((await call(passkeyOptions, await pendingCookie(), { origin: "https://evil.com" })).status).toBe(403);
  });

  it("signs in and trusts the device after a good Face ID answer, once", async () => {
    const cookie = await pendingCookie();
    const options = await call(passkeyOptions, cookie);
    expect((await options.json()).ok).toBe(true);
    expect(requestDoc()?.challenge).toMatch(/^challenge-/);

    const res = await call(passkeyAnswer, cookie, { body: { id: "cred", ok: true } });
    expect(await res.json()).toEqual({ ok: true, next: "/admin/inquiries" });
    expect(await signedIn(res)).toMatchObject({ ok: true, session: { remember: true, generation: 2 } });
    const cookies = (res as unknown as { cookies: { get(name: string): { value: string } | undefined } }).cookies;
    expect(isTrustedDevice(cookies.get(TRUSTED_DEVICE_COOKIE)?.value, SECRET, 2)).toBe(true);
    expect(cookies.get(PENDING_SIGN_IN_COOKIE)?.value).toBe("");
    expect(memory.collections.admin_auth_requests).toHaveLength(0);
    expect(memory.collections.admin_passkeys?.[0]).toMatchObject({ counter: 1 });

    const again = await call(passkeyAnswer, cookie, { body: { id: "cred", ok: true } });
    expect(again.status).toBe(401);
  });

  it("refuses a bad answer, an unknown passkey, a reused challenge and an oversized body", async () => {
    const cookie = await pendingCookie();
    await call(passkeyOptions, cookie);
    expect(await (await call(passkeyAnswer, cookie, { body: { id: "cred", ok: false } })).json()).toEqual({
      ok: false,
      error: "passkey",
    });
    expect(requestDoc()?.attempts).toBe(1);
    expect((await call(passkeyAnswer, cookie, { body: { id: "cred", ok: true } })).status).toBe(401);

    await call(passkeyOptions, cookie);
    expect((await call(passkeyAnswer, cookie, { body: { id: "someone-else", ok: true } })).status).toBe(401);
    expect((await call(passkeyAnswer, cookie, { body: { id: "x".repeat(20_000) } })).status).toBe(400);
    expect((await call(passkeyAnswer, cookie, { body: ["not", "an", "object"] })).status).toBe(400);
  });

  it("drops the request after five failed answers", async () => {
    const cookie = await pendingCookie();
    for (let i = 0; i < 5; i += 1) {
      await call(passkeyOptions, cookie);
      await call(passkeyAnswer, cookie, { body: { id: "cred", ok: false } });
    }
    expect(memory.collections.admin_auth_requests).toHaveLength(0);
  });
});

describe("second sign-in step — approval from another device", () => {
  it("asks once, then waits, then signs in when approved", async () => {
    const cookie = await pendingCookie();
    const first = await (await call(startApproval, cookie)).json();
    const second = await (await call(startApproval, cookie)).json();
    expect(first.number).toBeGreaterThanOrEqual(10);
    expect(first.number).toBeLessThan(100);
    expect(second.number).toBe(first.number);
    expect(queueApprovalRequest).toHaveBeenCalledTimes(1);
    expect(queueApprovalRequest).toHaveBeenCalledWith("Windows · Chrome");
    expect((requestDoc() as { approval: { choices: number[] } }).approval.choices).toContain(first.number);

    expect(await (await call(checkApproval, cookie, { method: "GET" })).json()).toEqual({ ok: true, status: "pending" });

    await decideApproval(String(requestDoc()?._id), "approved");
    const res = await call(checkApproval, cookie, { method: "GET" });
    expect(await res.json()).toEqual({ ok: true, status: "approved", next: "/admin/inquiries" });
    expect(await signedIn(res)).toMatchObject({ ok: true, session: { generation: 2 } });
    expect((await call(checkApproval, cookie, { method: "GET" })).status).toBe(401);
  });

  it("says so when the other device refused, and forgets the request", async () => {
    const cookie = await pendingCookie();
    await call(startApproval, cookie);
    await decideApproval(String(requestDoc()?._id), "rejected");
    const res = await call(checkApproval, cookie, { method: "GET" });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, error: "rejected" });
    expect(await signedIn(res)).toMatchObject({ ok: false });
    expect(memory.collections.admin_auth_requests).toHaveLength(0);
  });

  it("is expired before approval was asked for, or after five minutes", async () => {
    const cookie = await pendingCookie();
    expect((await call(checkApproval, cookie, { method: "GET" })).status).toBe(401);
    await call(startApproval, cookie);
    requestDoc()!.expiresAt = new Date(Date.now() - 1);
    expect(await (await call(checkApproval, cookie, { method: "GET" })).json()).toEqual({ ok: false, error: "expired" });
    expect(await decideApproval(String(requestDoc()?._id), "approved")).toBe(false);
  });
});
