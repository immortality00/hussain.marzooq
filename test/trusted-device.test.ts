import { describe, expect, it } from "vitest";
import { TRUSTED_DEVICE_MS, isTrustedDevice, issueTrustedDevice } from "@/lib/auth/trusted-device";

const NOW = 1_800_000_000_000;

describe("trusted device cookie", () => {
  it("is trusted for a year after the second step", () => {
    const value = issueTrustedDevice("s", 0, NOW);
    expect(isTrustedDevice(value, "s", 0, NOW)).toBe(true);
    expect(isTrustedDevice(value, "s", 0, NOW + TRUSTED_DEVICE_MS)).toBe(true);
    expect(isTrustedDevice(value, "s", 0, NOW + TRUSTED_DEVICE_MS + 1)).toBe(false);
  });

  it("stops being trusted after sign out everywhere", () => {
    const value = issueTrustedDevice("s", 2, NOW);
    expect(isTrustedDevice(value, "s", 2, NOW)).toBe(true);
    expect(isTrustedDevice(value, "s", 3, NOW)).toBe(false);
  });

  it("is never trusted when edited, signed by another secret, older, or without a secret", () => {
    const value = issueTrustedDevice("s", 0, NOW);
    const [v, , generation, nonce, sig] = value.split(".");
    expect(isTrustedDevice(`${v}.${NOW + 1}.${generation}.${nonce}.${sig}`, "s", 0, NOW)).toBe(false);
    expect(isTrustedDevice(`${v}.${NOW}.5.${nonce}.${sig}`, "s", 5, NOW)).toBe(false);
    expect(isTrustedDevice(value, "other", 0, NOW)).toBe(false);
    expect(isTrustedDevice(value, "", 0, NOW)).toBe(false);
    expect(isTrustedDevice(undefined, "s", 0, NOW)).toBe(false);
    expect(isTrustedDevice("x".repeat(500), "s", 0, NOW)).toBe(false);
    expect(isTrustedDevice(`v1.${NOW}.${nonce}.${sig}`, "s", 0, NOW)).toBe(false);
  });

  it("gives every device its own value", () => {
    expect(issueTrustedDevice("s", 0, NOW)).not.toBe(issueTrustedDevice("s", 0, NOW));
  });
});
