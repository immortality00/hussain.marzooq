import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { sendNotification, deleteMany, stored, FakeWebPushError } = vi.hoisted(() => {
  class FakeWebPushError extends Error {
    constructor(readonly statusCode: number) {
      super(`push service answered ${statusCode}`);
    }
  }
  return {
    sendNotification: vi.fn(),
    deleteMany: vi.fn(async () => ({ deletedCount: 0 })),
    stored: [] as { endpoint: string; keys: { p256dh: string; auth: string } }[],
    FakeWebPushError,
  };
});

vi.mock("web-push", () => ({
  default: { sendNotification },
  WebPushError: FakeWebPushError,
}));

vi.mock("@/lib/server/db", () => ({
  getDb: async () => ({
    collection: () => ({
      find: () => ({ toArray: async () => stored }),
      deleteMany,
    }),
  }),
}));

import { cleanDeviceLabel, parsePushSubscription } from "@/lib/push-subscription";
import { sendAdminPush } from "@/lib/server/push";

const KEYS = {
  p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
  auth: "tBHItJI5svbpez7KI4CCXg",
};

describe("parsePushSubscription", () => {
  test.each([
    "https://web.push.apple.com/QGuQyavXutnMH7aw",
    "https://fcm.googleapis.com/fcm/send/abc123",
    "https://updates.push.services.mozilla.com/wpush/v2/abc",
    "https://wns2-par02p.notify.windows.com/w/?token=abc",
  ])("accepts a browser push service endpoint: %s", (endpoint) => {
    expect(parsePushSubscription({ endpoint, keys: KEYS })).toEqual({ endpoint, keys: KEYS });
  });

  test.each([
    ["non-https", "http://fcm.googleapis.com/fcm/send/abc"],
    ["unknown host", "https://attacker.example/collect"],
    ["lookalike host", "https://push.apple.com.attacker.example/x"],
    ["internal host", "https://169.254.169.254/latest/meta-data"],
    ["not a URL", "definitely not a url"],
  ])("rejects %s", (_label, endpoint) => {
    expect(parsePushSubscription({ endpoint, keys: KEYS })).toBeNull();
  });

  test("rejects missing or malformed keys", () => {
    const endpoint = "https://web.push.apple.com/abc";
    expect(parsePushSubscription({ endpoint })).toBeNull();
    expect(parsePushSubscription({ endpoint, keys: { p256dh: KEYS.p256dh } })).toBeNull();
    expect(parsePushSubscription({ endpoint, keys: { ...KEYS, auth: "not base64url!" } })).toBeNull();
  });

  test("rejects non-objects", () => {
    expect(parsePushSubscription(null)).toBeNull();
    expect(parsePushSubscription("https://web.push.apple.com/abc")).toBeNull();
  });
});

describe("cleanDeviceLabel", () => {
  test("collapses whitespace and caps length", () => {
    expect(cleanDeviceLabel("  iPhone  ·   Safari ")).toBe("iPhone · Safari");
    expect(cleanDeviceLabel("x".repeat(200))).toHaveLength(80);
  });

  test("falls back for empty input", () => {
    expect(cleanDeviceLabel("")).toBe("Unknown device");
    expect(cleanDeviceLabel(42)).toBe("Unknown device");
  });
});

describe("sendAdminPush", () => {
  const payload = { title: "New inquiry — Sara", body: "Wedding Film", url: "/admin/inquiries" };

  beforeEach(() => {
    vi.stubEnv("VAPID_PUBLIC_KEY", "public-key");
    vi.stubEnv("VAPID_PRIVATE_KEY", "private-key");
    stored.length = 0;
    stored.push(
      { endpoint: "https://web.push.apple.com/live", keys: KEYS },
      { endpoint: "https://fcm.googleapis.com/fcm/send/gone", keys: KEYS },
      { endpoint: "https://updates.push.services.mozilla.com/wpush/v2/flaky", keys: KEYS }
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  test("does nothing when VAPID keys are missing", async () => {
    vi.stubEnv("VAPID_PRIVATE_KEY", "");
    await expect(sendAdminPush(payload)).resolves.toEqual({ sent: 0, removed: 0, failed: 0 });
    expect(sendNotification).not.toHaveBeenCalled();
  });

  test("sends to every device and deletes the ones the push service reports gone", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    sendNotification.mockImplementation(async (sub: { endpoint: string }) => {
      if (sub.endpoint.endsWith("/gone")) throw new FakeWebPushError(410);
      if (sub.endpoint.endsWith("/flaky")) throw new FakeWebPushError(500);
      return { statusCode: 201 };
    });

    await expect(sendAdminPush(payload)).resolves.toEqual({ sent: 1, removed: 1, failed: 1 });

    expect(sendNotification).toHaveBeenCalledTimes(3);
    const [, body, options] = sendNotification.mock.calls[0];
    expect(JSON.parse(body)).toEqual(payload);
    expect(options.vapidDetails).toMatchObject({ publicKey: "public-key", privateKey: "private-key" });
    expect(deleteMany).toHaveBeenCalledWith({
      endpoint: { $in: ["https://fcm.googleapis.com/fcm/send/gone"] },
    });
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });
});
