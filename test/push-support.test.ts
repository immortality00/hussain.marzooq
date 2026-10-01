import { afterEach, describe, expect, test, vi } from "vitest";
import { urlBase64ToUint8Array, withTimeout } from "@/lib/client/push-support";
import { RESAVE_AFTER_MS, pushDeviceNeedsSave } from "@/lib/client/admin-push-api";

describe("urlBase64ToUint8Array", () => {
  test("decodes unpadded base64url, including - and _", () => {
    const bytes = Uint8Array.from([0xfb, 0xff, 0xbf, 0x01, 0x02]);
    const encoded = Buffer.from(bytes).toString("base64url");
    expect(encoded).toMatch(/[-_]/);
    expect(encoded).not.toContain("=");
    expect(Array.from(urlBase64ToUint8Array(encoded))).toEqual(Array.from(bytes));
  });
});

describe("withTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("resolves with the promise's value when it settles in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), "timed out", 50)).resolves.toBe("ok");
  });

  test("passes the promise's own rejection through", async () => {
    await expect(withTimeout(Promise.reject(new Error("denied")), "timed out", 50)).rejects.toThrow(
      "denied"
    );
  });

  test("rejects with the given message when the promise never settles", async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise(() => {}), "The browser's push service didn't respond.", 1000);
    vi.advanceTimersByTime(1000);
    await expect(pending).rejects.toThrow("The browser's push service didn't respond.");
  });
});

describe("pushDeviceNeedsSave", () => {
  const endpoint = "https://web.push.apple.com/abc";
  const now = 10 * RESAVE_AFTER_MS;
  const saved = (at: number, savedEndpoint = endpoint) => JSON.stringify({ endpoint: savedEndpoint, at });

  test("skips a device saved recently with the same subscription", () => {
    expect(pushDeviceNeedsSave(endpoint, saved(now - 1_000), now)).toBe(false);
  });

  test("saves when nothing was recorded, the record is unreadable, or the subscription changed", () => {
    expect(pushDeviceNeedsSave(endpoint, null, now)).toBe(true);
    expect(pushDeviceNeedsSave(endpoint, "not json", now)).toBe(true);
    expect(pushDeviceNeedsSave(endpoint, saved(now - 1_000, "https://web.push.apple.com/old"), now)).toBe(true);
  });

  test("saves again once a day, and when the recorded time is in the future", () => {
    expect(pushDeviceNeedsSave(endpoint, saved(now - RESAVE_AFTER_MS), now)).toBe(true);
    expect(pushDeviceNeedsSave(endpoint, saved(now + 60_000), now)).toBe(true);
  });
});
