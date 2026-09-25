import { afterEach, describe, expect, test, vi } from "vitest";
import { urlBase64ToUint8Array, withTimeout } from "@/lib/client/push-support";

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
