import { afterEach, describe, expect, test, vi } from "vitest";
import { urlBase64ToUint8Array, withTimeout } from "@/lib/client/push-support";
import { createHash } from "node:crypto";
import { endpointHash, pushDeviceState } from "@/lib/push-subscription";

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

describe("push device state", () => {
  const endpoint = "https://web.push.apple.com/abc";
  const device = async (url: string) => ({ endpointHash: await endpointHash(url) });

  test("hashes an endpoint the same way on the server and the phone, without revealing it", async () => {
    const expected = createHash("sha256").update(endpoint).digest("base64url").slice(0, 22);
    expect(await endpointHash(endpoint)).toBe(expected);
    expect(await endpointHash(endpoint)).not.toContain("push.apple.com");
  });

  test("is on only while the server's device list holds this device", async () => {
    const hash = await endpointHash(endpoint);
    const devices = [await device(endpoint)];
    expect(pushDeviceState({ endpoint, hash, savedEndpoint: endpoint, devices })).toBe("on");
  });

  test("shows off when this device was removed from the list, instead of claiming it is on", async () => {
    const hash = await endpointHash(endpoint);
    const devices = [await device("https://web.push.apple.com/other")];
    expect(pushDeviceState({ endpoint, hash, savedEndpoint: endpoint, devices })).toBe("off");
  });

  test("saves again when the browser's subscription changed since this device last saved it", async () => {
    const hash = await endpointHash(endpoint);
    expect(pushDeviceState({ endpoint, hash, savedEndpoint: "https://web.push.apple.com/old", devices: [] })).toBe("resave");
    expect(pushDeviceState({ endpoint, hash, savedEndpoint: null, devices: [] })).toBe("resave");
  });

  test("is off without a subscription", () => {
    expect(pushDeviceState({ endpoint: null, hash: null, savedEndpoint: null, devices: [] })).toBe("off");
  });
});
