import { describe, expect, it } from "vitest";

import {
  REMEMBER_ABSOLUTE_MS,
  REMEMBER_MS,
  REMEMBER_RENEW_AFTER_MS,
  RENEW_AFTER_MS,
  SESSION_ABSOLUTE_MS,
  SESSION_IDLE_MS,
  createSessionValue,
  isWithinTtl,
  issueSessionCookie,
  parseSession,
  readSessionCookie,
  renewAfterMs,
  safeEqual,
  sessionCookieMaxAge,
  sessionCookieOptions,
  sessionLifetimeMs,
} from "@/lib/auth/session-token";

const T = 1_700_000_000_000;
const SECRET = "test-secret";
const tok = (issued: number, started: number, mode: "s" | "r" = "s") => `v4.${issued}.${started}.${mode}.abc`;

async function cookieAt(issuedAt: number, startedAt: number, remember = false) {
  return issueSessionCookie(SECRET, remember, startedAt, issuedAt);
}

describe("createSessionValue", () => {
  it("produces a v4.<issued>.<started>.<s|r>.<32-hex> payload", () => {
    expect(createSessionValue(false, T)).toMatch(/^v4\.1700000000000\.1700000000000\.s\.[0-9a-f]{32}$/);
    expect(createSessionValue(true, T)).toMatch(/^v4\.1700000000000\.1700000000000\.r\.[0-9a-f]{32}$/);
  });

  it("a renewal keeps the original login time", () => {
    expect(createSessionValue(true, T + 5_000, T)).toMatch(/^v4\.1700000005000\.1700000000000\.r\./);
  });

  it("uses a fresh nonce on each call", () => {
    expect(createSessionValue()).not.toBe(createSessionValue());
  });
});

describe("parseSession", () => {
  it("reads issue time, login time and remember flag", () => {
    expect(parseSession(tok(T + 10, T))).toEqual({ issuedAt: T + 10, startedAt: T, remember: false });
    expect(parseSession(tok(T, T, "r"))).toEqual({ issuedAt: T, startedAt: T, remember: true });
  });

  it("rejects anything malformed, including old-format tokens", () => {
    expect(parseSession(`v3.${T}.${T}.s.abc`)).toBeNull();
    expect(parseSession("v2.1700000000000.s.abc")).toBeNull();
    expect(parseSession(`v4.${T}.${T}.s`)).toBeNull();
    expect(parseSession(`v4.${T}.${T}.s.abc.def`)).toBeNull();
    expect(parseSession("v4.notanumber.1.s.abc")).toBeNull();
    expect(parseSession(`v4.${T}.notanumber.s.abc`)).toBeNull();
    expect(parseSession(`v4.0.0.s.abc`)).toBeNull();
    expect(parseSession(`v4.${T}.${T}.x.abc`)).toBeNull();
    expect(parseSession(`v4.${T}.${T}.s.`)).toBeNull();
  });

  it("rejects a login time later than the issue time", () => {
    expect(parseSession(tok(T, T + 1))).toBeNull();
  });
});

describe("lifetimes", () => {
  it("idle: 12h normal, 30 days remembered; absolute: 7 days normal, 90 days remembered", () => {
    expect(sessionLifetimeMs(false)).toBe(SESSION_IDLE_MS);
    expect(sessionLifetimeMs(true)).toBe(REMEMBER_MS);
    expect(SESSION_ABSOLUTE_MS).toBe(7 * 24 * 60 * 60 * 1000);
    expect(REMEMBER_ABSOLUTE_MS).toBe(90 * 24 * 60 * 60 * 1000);
  });

  it("only a remembered device gets a persistent cookie", () => {
    expect(sessionCookieMaxAge(true)).toBe(30 * 24 * 60 * 60);
    expect(sessionCookieMaxAge(false)).toBeUndefined();
    expect(sessionCookieOptions(true).maxAge).toBe(30 * 24 * 60 * 60);
    expect(sessionCookieOptions(false).maxAge).toBeUndefined();
  });

  it("session cookies are httpOnly, lax and site-wide; the hint is readable", () => {
    expect(sessionCookieOptions(true)).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(sessionCookieOptions(true, false).httpOnly).toBe(false);
  });

  it("a remembered device renews once a day, a browser session every 10 minutes", () => {
    expect(renewAfterMs(true)).toBe(REMEMBER_RENEW_AFTER_MS);
    expect(REMEMBER_RENEW_AFTER_MS).toBe(24 * 60 * 60 * 1000);
    expect(renewAfterMs(false)).toBe(RENEW_AFTER_MS);
  });
});

describe("isWithinTtl", () => {
  it("enforces the idle window", () => {
    const s = { issuedAt: T, startedAt: T, remember: false };
    expect(isWithinTtl(s, T + SESSION_IDLE_MS)).toBe(true);
    expect(isWithinTtl(s, T + SESSION_IDLE_MS + 1)).toBe(false);
  });

  it("a remembered session is idle-valid for 30 days", () => {
    const s = { issuedAt: T, startedAt: T, remember: true };
    expect(isWithinTtl(s, T + REMEMBER_MS)).toBe(true);
    expect(isWithinTtl(s, T + REMEMBER_MS + 1)).toBe(false);
  });

  it("enforces the absolute cap even for a token renewed a minute ago", () => {
    const day = 24 * 60 * 60 * 1000;
    const now = T + SESSION_ABSOLUTE_MS + day;
    expect(isWithinTtl({ issuedAt: now - 60_000, startedAt: T, remember: false }, now)).toBe(false);
    const rememberNow = T + REMEMBER_ABSOLUTE_MS + day;
    expect(isWithinTtl({ issuedAt: rememberNow - 60_000, startedAt: T, remember: true }, rememberNow)).toBe(false);
  });

  it("stays valid right up to the absolute cap while it keeps being renewed", () => {
    const now = T + SESSION_ABSOLUTE_MS;
    expect(isWithinTtl({ issuedAt: now - 60_000, startedAt: T, remember: false }, now)).toBe(true);
  });

  it("tolerates 5 minutes of clock skew, no more", () => {
    const s = { issuedAt: T, startedAt: T, remember: false };
    expect(isWithinTtl(s, T - 5 * 60_000)).toBe(true);
    expect(isWithinTtl(s, T - 5 * 60_000 - 1)).toBe(false);
  });
});

describe("issueSessionCookie / readSessionCookie", () => {
  it("carries the payload and its signature in one value", async () => {
    const cookie = await cookieAt(T, T, true);
    expect(cookie).toMatch(/^v4\.1700000000000\.1700000000000\.r\.[0-9a-f]{32}\.[0-9a-f]{64}$/);
    await expect(readSessionCookie(cookie, SECRET, T + 1_000)).resolves.toEqual({
      ok: true,
      session: { issuedAt: T, startedAt: T, remember: true },
      renew: false,
    });
  });

  it("a renewal keeps the login time and the remember flag", async () => {
    const renewed = await issueSessionCookie(SECRET, true, T, T + 2 * REMEMBER_RENEW_AFTER_MS);
    const check = await readSessionCookie(renewed, SECRET, T + 2 * REMEMBER_RENEW_AFTER_MS);
    expect(check).toMatchObject({ ok: true, session: { startedAt: T, remember: true } });
  });

  it("rejects a value signed with another secret, or edited after signing", async () => {
    const cookie = await cookieAt(T, T, true);
    await expect(readSessionCookie(cookie, "other-secret", T)).resolves.toEqual({ ok: false, reason: "signature" });

    const [version, , started, mode, nonce, signature] = cookie.split(".");
    const extended = [version, T + REMEMBER_MS, started, mode, nonce, signature].join(".");
    await expect(readSessionCookie(extended, SECRET, T + REMEMBER_MS + 1_000)).resolves.toEqual({
      ok: false,
      reason: "signature",
    });

    const promoted = cookie.replace(".r.", ".s.");
    await expect(readSessionCookie(promoted, SECRET, T)).resolves.toEqual({ ok: false, reason: "signature" });
  });

  it("names malformed, legacy, expired and future tokens", async () => {
    await expect(readSessionCookie("", SECRET, T)).resolves.toEqual({ ok: false, reason: "malformed" });
    await expect(readSessionCookie("garbage", SECRET, T)).resolves.toEqual({ ok: false, reason: "malformed" });
    await expect(readSessionCookie(`v3.${T}.${T}.r.${"a".repeat(32)}`, SECRET, T)).resolves.toEqual({
      ok: false,
      reason: "malformed",
    });

    const session = await cookieAt(T, T);
    await expect(readSessionCookie(session, SECRET, T + SESSION_IDLE_MS + 1)).resolves.toEqual({
      ok: false,
      reason: "expired",
    });

    const ahead = await cookieAt(T + 10 * 60_000, T + 10 * 60_000);
    await expect(readSessionCookie(ahead, SECRET, T)).resolves.toEqual({ ok: false, reason: "future" });
  });

  it("reports an absolute-cap breach as expired", async () => {
    const now = T + SESSION_ABSOLUTE_MS + 1;
    const cookie = await cookieAt(now - 1_000, T);
    await expect(readSessionCookie(cookie, SECRET, now)).resolves.toEqual({ ok: false, reason: "expired" });
  });

  it("asks for renewal only once the token is older than its mode's window", async () => {
    const session = await cookieAt(T, T);
    await expect(readSessionCookie(session, SECRET, T + RENEW_AFTER_MS)).resolves.toMatchObject({ renew: false });
    await expect(readSessionCookie(session, SECRET, T + RENEW_AFTER_MS + 1)).resolves.toMatchObject({ renew: true });

    const remembered = await cookieAt(T, T, true);
    await expect(readSessionCookie(remembered, SECRET, T + 6 * 60 * 60 * 1000)).resolves.toMatchObject({
      renew: false,
    });
    await expect(readSessionCookie(remembered, SECRET, T + REMEMBER_RENEW_AFTER_MS + 1)).resolves.toMatchObject({
      renew: true,
    });
  });
});

describe("safeEqual", () => {
  it("is true only for identical strings", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
