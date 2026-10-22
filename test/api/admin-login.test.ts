import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextResponse } from "next/server";
import { E2E } from "@/e2e/fixtures";
import { COOKIE_NAME, HINT_NAME, adminSessionSecret, readSessionCookie } from "@/lib/auth/session-token";
import { TRUSTED_DEVICE_COOKIE, issueTrustedDevice } from "@/lib/auth/trusted-device";
import { PENDING_SIGN_IN_COOKIE } from "@/lib/server/sign-in-requests";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { consumeFixedWindowRateLimit, clearFixedWindowRateLimit, after } = vi.hoisted(() => ({
  consumeFixedWindowRateLimit: vi.fn(),
  clearFixedWindowRateLimit: vi.fn(async () => undefined),
  after: vi.fn((task: () => unknown) => void task()),
}));

vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit, clearFixedWindowRateLimit }));
vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("next/server", async (original) => ({ ...(await original<typeof import("next/server")>()), after }));

import { POST } from "@/app/admin/login/route";

const SECRET = "login-test-secret";
const cookiesOf = (res: Response) => (res as NextResponse).cookies;

function login(fields: Record<string, string>, headers: Record<string, string> = {}) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return POST(
    new Request("https://hussain.art/admin/login", {
      method: "POST",
      body,
      headers: { host: "hussain.art", origin: "https://hussain.art", ...headers },
    })
  );
}

const PASSKEY = { credentialId: "cred", counter: 0, transports: ["internal"], name: "iPhone · Safari" };

beforeEach(() => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", E2E.adminPasswordHash);
  vi.stubEnv("ADMIN_COOKIE_SECRET", SECRET);
  resetMemoryDb();
  consumeFixedWindowRateLimit.mockReset().mockResolvedValue({ limited: false });
  clearFixedWindowRateLimit.mockClear();
});

describe("POST /admin/login", () => {
  it("signs in with the right password, sets the session and hint cookies and says where to go", async () => {
    const res = await login({ password: E2E.adminPassword, remember: "on", next: "/admin/inquiries" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, next: "/admin/inquiries" });
    expect(res.headers.get("cache-control")).toBe("no-store");

    const session = await readSessionCookie(cookiesOf(res).get(COOKIE_NAME)?.value ?? "", adminSessionSecret());
    expect(session).toMatchObject({ ok: true, session: { remember: true, generation: 0 } });
    expect(cookiesOf(res).get(HINT_NAME)?.value).toBe("1");
    expect(clearFixedWindowRateLimit).toHaveBeenCalledWith({ bucket: "admin-login", key: "anonymous" });
  });

  it("never sends the visitor anywhere outside the admin after sign-in", async () => {
    for (const next of ["//evil.com", "https://evil.com/admin/x", "/admin/sign-in", "/admin/logout", "/admin/login/approval"]) {
      const res = await login({ password: E2E.adminPassword, next });
      expect((await res.json()).next, next).toBe("/admin/dashboard");
    }
  });

  it("refuses a wrong password, counts the attempt and sets no cookie", async () => {
    const res = await login({ password: "not-the-password" });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, error: "wrong" });
    expect(cookiesOf(res).get(COOKIE_NAME)).toBeUndefined();
    expect(consumeFixedWindowRateLimit).toHaveBeenCalledTimes(2);
    expect(clearFixedWindowRateLimit).not.toHaveBeenCalled();
    expect(cookiesOf(res).get(TRUSTED_DEVICE_COOKIE)).toBeUndefined();
  });

  it("never trusts a device on the password alone", async () => {
    const res = await login({ password: E2E.adminPassword });
    expect(cookiesOf(res).get(TRUSTED_DEVICE_COOKIE)).toBeUndefined();
  });

  it("asks an untrusted device for the second step once a passkey exists, and opens no session", async () => {
    memory.collections.admin_passkeys = [PASSKEY];
    const res = await login(
      { password: E2E.adminPassword, remember: "on", next: "/admin/inquiries" },
      { "user-agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/141.0 Safari/537.36" }
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, step: "second" });
    expect(cookiesOf(res).get(COOKIE_NAME)).toBeUndefined();

    const pending = cookiesOf(res).get(PENDING_SIGN_IN_COOKIE);
    expect(pending).toMatchObject({ httpOnly: true, path: "/admin", sameSite: "strict", maxAge: 300 });
    const [request] = memory.collections.admin_auth_requests ?? [];
    expect(request).toMatchObject({ remember: true, next: "/admin/inquiries", device: "Windows · Chrome" });
    expect(String(request?.tokenHash)).not.toContain(pending?.value.split(".")[1] ?? "-");
  });

  it("lets a trusted device in with the password alone, under the current counter", async () => {
    memory.collections.admin_passkeys = [PASSKEY];
    memory.collections.admin_security = [{ _id: "admin", generation: 3 }];
    const cookie = `${TRUSTED_DEVICE_COOKIE}=${issueTrustedDevice(SECRET, 3)}`;
    const res = await login({ password: E2E.adminPassword }, { cookie });
    expect(await res.json()).toEqual({ ok: true, next: "/admin/dashboard" });
    const session = await readSessionCookie(cookiesOf(res).get(COOKIE_NAME)?.value ?? "", adminSessionSecret());
    expect(session).toMatchObject({ ok: true, session: { generation: 3 } });

    const before = `${TRUSTED_DEVICE_COOKIE}=${issueTrustedDevice(SECRET, 2)}`;
    expect(await (await login({ password: E2E.adminPassword }, { cookie: before })).json()).toEqual({
      ok: true,
      step: "second",
    });
  });

  it("counts an unknown device against the site-wide ceiling and refuses once it is reached", async () => {
    consumeFixedWindowRateLimit.mockImplementation(async ({ bucket }: { bucket: string }) => ({
      limited: bucket === "admin-login-site",
    }));
    const res = await login({ password: E2E.adminPassword });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: "locked" });
    expect(cookiesOf(res).get(COOKIE_NAME)).toBeUndefined();
  });

  it("lets a trusted device past the site-wide ceiling, but not past its own IP limit", async () => {
    consumeFixedWindowRateLimit.mockImplementation(async ({ bucket }: { bucket: string }) => ({
      limited: bucket === "admin-login-site",
    }));
    const cookie = `${TRUSTED_DEVICE_COOKIE}=${issueTrustedDevice(SECRET, 0)}`;
    const res = await login({ password: E2E.adminPassword }, { cookie });
    expect(res.status).toBe(200);
    expect(consumeFixedWindowRateLimit).toHaveBeenCalledTimes(1);

    consumeFixedWindowRateLimit.mockResolvedValue({ limited: true });
    expect((await login({ password: E2E.adminPassword }, { cookie })).status).toBe(429);
  });

  it("ignores a forged or foreign trusted-device cookie", async () => {
    consumeFixedWindowRateLimit.mockImplementation(async ({ bucket }: { bucket: string }) => ({
      limited: bucket === "admin-login-site",
    }));
    for (const value of [issueTrustedDevice("another-secret", 0), "v1.1.aa.bb", "garbage"]) {
      const res = await login({ password: E2E.adminPassword }, { cookie: `${TRUSTED_DEVICE_COOKIE}=${value}` });
      expect(res.status, value).toBe(429);
    }
  });

  it("locks out before checking the password once the attempts run out", async () => {
    consumeFixedWindowRateLimit.mockResolvedValue({ limited: true });
    const res = await login({ password: E2E.adminPassword });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: "locked" });
    expect(cookiesOf(res).get(COOKIE_NAME)).toBeUndefined();
  });

  it("refuses a request sent from another site before doing anything", async () => {
    const res = await login({ password: E2E.adminPassword }, { origin: "https://evil.com" });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false, error: "origin" });
    expect(consumeFixedWindowRateLimit).not.toHaveBeenCalled();
  });

  it("says the admin is not configured when the password hash or cookie secret is missing", async () => {
    vi.stubEnv("ADMIN_COOKIE_SECRET", "");
    const res = await login({ password: E2E.adminPassword });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, error: "config" });
  });
});
