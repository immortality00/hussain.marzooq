import { describe, expect, it } from "vitest";

import {
  REMEMBER_ABSOLUTE_MS,
  REMEMBER_MS,
  RENEW_AFTER_MS,
  SESSION_ABSOLUTE_MS,
  SESSION_IDLE_MS,
  createSessionValue,
  isSessionValueFresh,
  isWithinTtl,
  parseSession,
  safeEqual,
  sessionCookieMaxAge,
  sessionFailure,
  sessionLifetimeMs,
  shouldRenewSession,
} from "@/lib/auth/session-token";

const T = 1_700_000_000_000;
const tok = (issued: number, started: number, mode: "s" | "r" = "s") => `v3.${issued}.${started}.${mode}.abc`;

describe("createSessionValue", () => {
  it("produces a v3.<issued>.<started>.<s|r>.<32-hex> token", () => {
    expect(createSessionValue(false, T)).toMatch(/^v3\.1700000000000\.1700000000000\.s\.[0-9a-f]{32}$/);
    expect(createSessionValue(true, T)).toMatch(/^v3\.1700000000000\.1700000000000\.r\.[0-9a-f]{32}$/);
  });

  it("a renewal keeps the original login time", () => {
    expect(createSessionValue(true, T + 5_000, T)).toMatch(/^v3\.1700000005000\.1700000000000\.r\./);
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
    expect(parseSession("v2.1700000000000.s.abc")).toBeNull();
    expect(parseSession("v1.1700000000000.abc")).toBeNull();
    expect(parseSession(`v3.${T}.${T}.s`)).toBeNull();
    expect(parseSession(`v3.${T}.${T}.s.abc.def`)).toBeNull();
    expect(parseSession("v3.notanumber.1.s.abc")).toBeNull();
    expect(parseSession(`v3.${T}.notanumber.s.abc`)).toBeNull();
    expect(parseSession(`v3.0.0.s.abc`)).toBeNull();
    expect(parseSession(`v3.${T}.${T}.x.abc`)).toBeNull();
    expect(parseSession(`v3.${T}.${T}.s.`)).toBeNull();
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
    const started = T;
    const now = T + SESSION_ABSOLUTE_MS + day;
    expect(isWithinTtl({ issuedAt: now - 60_000, startedAt: started, remember: false }, now)).toBe(false);
    const rememberNow = T + REMEMBER_ABSOLUTE_MS + day;
    expect(isWithinTtl({ issuedAt: rememberNow - 60_000, startedAt: started, remember: true }, rememberNow)).toBe(false);
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

describe("sessionFailure / isSessionValueFresh", () => {
  it("names the reason a token is unusable", () => {
    expect(sessionFailure("garbage", T)).toBe("malformed");
    expect(sessionFailure(tok(T, T), T + SESSION_IDLE_MS + 1)).toBe("expired");
    expect(sessionFailure(tok(T + 10 * 60_000, T + 10 * 60_000), T)).toBe("future");
    expect(sessionFailure(tok(T, T), T + 1_000)).toBeNull();
  });

  it("reports an absolute-cap breach as expired", () => {
    const now = T + SESSION_ABSOLUTE_MS + 1;
    expect(sessionFailure(tok(now - 1_000, T), now)).toBe("expired");
  });

  it("agrees with sessionFailure", () => {
    expect(isSessionValueFresh(tok(T, T), T + 1_000)).toBe(true);
    expect(isSessionValueFresh(tok(T, T), T + SESSION_IDLE_MS + 1)).toBe(false);
    expect(isSessionValueFresh("garbage", T)).toBe(false);
  });
});

describe("shouldRenewSession", () => {
  it("renews only once a valid token is older than the renew window", () => {
    expect(shouldRenewSession(tok(T, T), T + RENEW_AFTER_MS)).toBe(false);
    expect(shouldRenewSession(tok(T, T), T + RENEW_AFTER_MS + 1)).toBe(true);
  });

  it("never renews an expired, malformed or past-absolute-cap token", () => {
    expect(shouldRenewSession(tok(T, T), T + SESSION_IDLE_MS + 1)).toBe(false);
    expect(shouldRenewSession("garbage", T)).toBe(false);
    const now = T + SESSION_ABSOLUTE_MS + 1;
    expect(shouldRenewSession(tok(now - RENEW_AFTER_MS - 1, T), now)).toBe(false);
  });
});

describe("safeEqual", () => {
  it("is true only for identical strings", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
