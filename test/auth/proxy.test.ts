import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";
import {
  COOKIE_NAME,
  HINT_NAME,
  REMEMBER_MS,
  REMEMBER_RENEW_AFTER_MS,
  issueSessionCookie,
  readSessionCookie,
} from "@/lib/auth/session-token";

const SECRET = "proxy-test-secret";
const DAY = 24 * 60 * 60 * 1000;

function request(path: string, { cookie, fetchMode }: { cookie?: string; fetchMode?: string } = {}) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  if (fetchMode) headers.set("sec-fetch-mode", fetchMode);
  return new NextRequest(`https://hussain-marzooq.com${path}`, { headers });
}

beforeEach(() => {
  vi.stubEnv("ADMIN_COOKIE_SECRET", SECRET);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("proxy", () => {
  it("lets the sign-in and logout routes through without a session", async () => {
    const res = await proxy(request("/admin"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("sends a page request with no cookie to sign-in, with no reason shown", async () => {
    const res = await proxy(request("/admin/dashboard", { fetchMode: "navigate" }));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location") ?? "");
    expect(location.pathname).toBe("/admin");
    expect(location.searchParams.get("next")).toBe("/admin/dashboard");
    expect(location.searchParams.has("signedout")).toBe(false);
  });

  it("answers an in-app request that fails the check with 401, not the sign-in page", async () => {
    const missing = await proxy(request("/admin/inquiries", { fetchMode: "cors" }));
    expect(missing.status).toBe(401);
    expect(missing.headers.get("location")).toBeNull();

    const forged = await issueSessionCookie("another-secret", true);
    const rejected = await proxy(
      request("/admin/inquiries", { fetchMode: "same-origin", cookie: `${COOKIE_NAME}=${forged}` })
    );
    expect(rejected.status).toBe(401);
  });

  it("treats a request without fetch metadata as a page load", async () => {
    const res = await proxy(request("/admin/inquiries"));
    expect(res.status).toBe(307);
  });

  it("names the reason when a page request carries a bad session", async () => {
    const old = await issueSessionCookie(SECRET, false, Date.now() - 2 * DAY, Date.now() - 2 * DAY);
    const res = await proxy(request("/admin/media", { cookie: `${COOKIE_NAME}=${old}; ${HINT_NAME}=1` }));
    const location = new URL(res.headers.get("location") ?? "");
    expect(location.searchParams.get("signedout")).toBe("expired");
    expect(res.headers.get("set-cookie")).toContain(`${HINT_NAME}=;`);
  });

  it("passes a fresh remembered session without rewriting its cookie", async () => {
    const cookie = await issueSessionCookie(SECRET, true);
    const res = await proxy(request("/admin/dashboard", { cookie: `${COOKIE_NAME}=${cookie}; ${HINT_NAME}=1` }));
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("renews a remembered session after a day as one persistent cookie with the same login time", async () => {
    const startedAt = Date.now() - 3 * DAY;
    const issuedAt = Date.now() - REMEMBER_RENEW_AFTER_MS - 60_000;
    const cookie = await issueSessionCookie(SECRET, true, startedAt, issuedAt);
    const res = await proxy(request("/admin/dashboard", { cookie: `${COOKIE_NAME}=${cookie}` }));

    const renewed = res.cookies.get(COOKIE_NAME);
    expect(renewed?.maxAge).toBe(REMEMBER_MS / 1000);
    expect(renewed?.httpOnly).toBe(true);
    expect(res.cookies.get("hm_admin_sig")).toBeUndefined();
    expect(res.cookies.get(HINT_NAME)?.value).toBe("1");

    const check = await readSessionCookie(renewed?.value ?? "", SECRET);
    expect(check).toMatchObject({ ok: true, renew: false, session: { startedAt, remember: true } });
  });
});
