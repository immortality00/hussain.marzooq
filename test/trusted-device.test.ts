import { describe, expect, it } from "vitest";
import { TRUSTED_DEVICE_MS, isTrustedDevice, issueTrustedDevice } from "@/lib/auth/trusted-device";

const NOW = 1_800_000_000_000;

describe("trusted device cookie", () => {
  it("is trusted for a year after sign-in", () => {
    const value = issueTrustedDevice("s", NOW);
    expect(isTrustedDevice(value, "s", NOW)).toBe(true);
    expect(isTrustedDevice(value, "s", NOW + TRUSTED_DEVICE_MS)).toBe(true);
    expect(isTrustedDevice(value, "s", NOW + TRUSTED_DEVICE_MS + 1)).toBe(false);
  });

  it("is never trusted when edited, signed by another secret, or without a secret", () => {
    const value = issueTrustedDevice("s", NOW);
    const [v, , nonce, sig] = value.split(".");
    expect(isTrustedDevice(`${v}.${NOW + 1}.${nonce}.${sig}`, "s", NOW)).toBe(false);
    expect(isTrustedDevice(value, "other", NOW)).toBe(false);
    expect(isTrustedDevice(value, "", NOW)).toBe(false);
    expect(isTrustedDevice(undefined, "s", NOW)).toBe(false);
    expect(isTrustedDevice("x".repeat(500), "s", NOW)).toBe(false);
  });

  it("gives every sign-in its own value", () => {
    expect(issueTrustedDevice("s", NOW)).not.toBe(issueTrustedDevice("s", NOW));
  });
});
