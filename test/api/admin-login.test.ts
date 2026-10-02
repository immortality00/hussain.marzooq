import { beforeEach, describe, expect, it, vi } from "vitest";
import { E2E } from "@/e2e/fixtures";
import { COOKIE_NAME, HINT_NAME, readSessionCookie } from "@/lib/auth/session-token";

const { consumeFixedWindowRateLimit, clearFixedWindowRateLimit, after } = vi.hoisted(() => ({
  consumeFixedWindowRateLimit: vi.fn(),
  clearFixedWindowRateLimit: vi.fn(async () => undefined),
  after: vi.fn((task: () => unknown) => void task()),
}));

vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit, clearFixedWindowRateLimit }));
vi.mock("next/server", async (original) => ({ ...(await original<typeof import("next/server")>()), after }));

import { POST } from "@/app/admin/login/route";

const SECRET = "login-test-secret";

function login(fields: Record<string, string>, headers: Record<string, string> = {}) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  return POST(
    new Request("https://hussain-marzooq.com/admin/login", {
      method: "POST",
      body,
      headers: { host: "hussain-marzooq.com", origin: "https://hussain-marzooq.com", ...headers },
    })
  );
}

beforeEach(() => {
  vi.stubEnv("ADMIN_PASSWORD_HASH", E2E.adminPasswordHash);
  vi.stubEnv("ADMIN_COOKIE_SECRET", SECRET);
  consumeFixedWindowRateLimit.mockReset().mockResolvedValue({ limited: false });
  clearFixedWindowRateLimit.mockClear();
});

describe("POST /admin/login", () => {
  it("signs in with the right password, sets the session and hint cookies and says where to go", async () => {
    const res = await login({ password: E2E.adminPassword, remember: "on", next: "/admin/inquiries" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, next: "/admin/inquiries" });
    expect(res.headers.get("cache-control")).toBe("no-store");

    const session = await readSessionCookie(res.cookies.get(COOKIE_NAME)?.value ?? "", SECRET);
    expect(session).toMatchObject({ ok: true, session: { remember: true } });
    expect(res.cookies.get(HINT_NAME)?.value).toBe("1");
    expect(clearFixedWindowRateLimit).toHaveBeenCalledWith({ bucket: "admin-login", key: "anonymous" });
  });

  it("never sends the visitor anywhere outside the admin after sign-in", async () => {
    for (const next of ["//evil.com", "https://evil.com/admin/x", "/admin/sign-in", "/admin/logout"]) {
      const res = await login({ password: E2E.adminPassword, next });
      expect((await res.json()).next, next).toBe("/admin/dashboard");
    }
  });

  it("refuses a wrong password, counts the attempt and sets no cookie", async () => {
    const res = await login({ password: "not-the-password" });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, error: "wrong" });
    expect(res.cookies.get(COOKIE_NAME)).toBeUndefined();
    expect(consumeFixedWindowRateLimit).toHaveBeenCalledTimes(1);
    expect(clearFixedWindowRateLimit).not.toHaveBeenCalled();
  });

  it("locks out before checking the password once the attempts run out", async () => {
    consumeFixedWindowRateLimit.mockResolvedValue({ limited: true });
    const res = await login({ password: E2E.adminPassword });
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, error: "locked" });
    expect(res.cookies.get(COOKIE_NAME)).toBeUndefined();
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
