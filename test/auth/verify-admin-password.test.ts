import crypto from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

// verifyAdminPassword lives in a module that imports `next/headers` for the
// cookie-reading helpers. Those aren't exercised here, so stub the import to keep
// the test isolated from Next's request runtime.
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { isAdminPasswordConfigured, verifyAdminPassword } from "@/lib/auth/admin";

/** Builds a hash in the exact `scrypt:<hexSalt>:<hexHash>` format the app stores. */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("verifyAdminPassword", () => {
  it("accepts the correct password", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", hashPassword("correct horse battery"));
    expect(verifyAdminPassword("correct horse battery")).toBe(true);
  });

  it("rejects an incorrect password", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", hashPassword("correct horse battery"));
    expect(verifyAdminPassword("wrong password")).toBe(false);
  });

  it("returns false when no hash is configured", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    expect(verifyAdminPassword("anything")).toBe(false);
  });

  it("returns false for a hash with the wrong prefix", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", "plaintext-not-scrypt");
    expect(verifyAdminPassword("anything")).toBe(false);
  });

  it("returns false for a non-hex salt/hash", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", "scrypt:xyz:zzz");
    expect(verifyAdminPassword("anything")).toBe(false);
  });
});

describe("isAdminPasswordConfigured", () => {
  it("is true when a hash is set", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", hashPassword("pw"));
    expect(isAdminPasswordConfigured()).toBe(true);
  });

  it("is false when unset", () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    expect(isAdminPasswordConfigured()).toBe(false);
  });
});
