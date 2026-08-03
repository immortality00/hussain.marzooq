import { describe, expect, it } from "vitest";

import {
  SESSION_TTL_MS,
  createSessionValue,
  isSessionValueFresh,
  isWithinTtl,
  parseIssuedAt,
  safeEqual,
} from "@/lib/auth/session-token";

describe("createSessionValue", () => {
  it("produces a v1.<ms>.<32-hex-char> token", () => {
    const now = 1_700_000_000_000;
    expect(createSessionValue(now)).toMatch(/^v1\.1700000000000\.[0-9a-f]{32}$/);
  });

  it("uses a fresh nonce on each call", () => {
    expect(createSessionValue()).not.toBe(createSessionValue());
  });
});

describe("parseIssuedAt", () => {
  it("returns the issue time for a well-formed token", () => {
    expect(parseIssuedAt("v1.1700000000000.abc")).toBe(1_700_000_000_000);
  });

  it("rejects malformed tokens", () => {
    expect(parseIssuedAt("v1.1700000000000")).toBeNull(); // too few parts
    expect(parseIssuedAt("v1.1700000000000.abc.def")).toBeNull(); // too many parts
    expect(parseIssuedAt("v2.1700000000000.abc")).toBeNull(); // wrong version
    expect(parseIssuedAt("v1.notanumber.abc")).toBeNull(); // non-numeric timestamp
    expect(parseIssuedAt("v1.0.abc")).toBeNull(); // timestamp <= 0
    expect(parseIssuedAt("v1.-5.abc")).toBeNull(); // negative timestamp
    expect(parseIssuedAt("v1.1700000000000.")).toBeNull(); // empty nonce
  });
});

describe("isWithinTtl", () => {
  const issued = 1_700_000_000_000;

  it("accepts a token inside its lifetime", () => {
    expect(isWithinTtl(issued, issued + SESSION_TTL_MS - 1)).toBe(true);
  });

  it("accepts a token exactly at the TTL boundary", () => {
    expect(isWithinTtl(issued, issued + SESSION_TTL_MS)).toBe(true);
  });

  it("rejects a token one ms past the TTL", () => {
    expect(isWithinTtl(issued, issued + SESSION_TTL_MS + 1)).toBe(false);
  });

  it("tolerates up to 60s of future clock skew", () => {
    expect(isWithinTtl(issued, issued - 60_000)).toBe(true);
  });

  it("rejects a token dated further into the future than the skew allows", () => {
    expect(isWithinTtl(issued, issued - 60_001)).toBe(false);
  });
});

describe("isSessionValueFresh", () => {
  const now = 1_700_000_000_000;

  it("accepts a fresh, well-formed token", () => {
    expect(isSessionValueFresh(`v1.${now}.abc`, now + 1_000)).toBe(true);
  });

  it("rejects an expired token", () => {
    expect(isSessionValueFresh(`v1.${now}.abc`, now + SESSION_TTL_MS + 1)).toBe(false);
  });

  it("rejects a malformed token", () => {
    expect(isSessionValueFresh("garbage", now)).toBe(false);
  });
});

describe("safeEqual", () => {
  it("is true for identical strings", () => {
    expect(safeEqual("abc123", "abc123")).toBe(true);
  });

  it("is false for different-length strings", () => {
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("is false for same-length but differing strings", () => {
    expect(safeEqual("abc", "abd")).toBe(false);
  });
});
