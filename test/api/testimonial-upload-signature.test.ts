import { afterEach, describe, expect, it, vi } from "vitest";

const SESSION = "0123456789abcdef0123";
const { verifyUploadSession, claimUploadSlot, consumeFixedWindowRateLimit } = vi.hoisted(() => ({
  verifyUploadSession: vi.fn(),
  claimUploadSlot: vi.fn(async () => true),
  consumeFixedWindowRateLimit: vi.fn(async () => ({ limited: false, count: 1, resetAt: "" })),
}));

vi.mock("@/lib/server/db", () => ({ getDb: async () => ({}) }));
vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit }));
vi.mock("@/lib/server/cloudinary", () => ({
  isCloudinaryConfigured: () => true,
  getCloudinaryPublicConfig: () => ({ cloudName: "demo", apiKey: "key" }),
  signCloudinaryParams: (params: Record<string, unknown>) => `sig:${params.public_id}`,
}));
vi.mock("@/lib/server/testimonial-upload-sessions", async (original) => ({
  ...(await original<typeof import("@/lib/server/testimonial-upload-sessions")>()),
  verifyUploadSession,
  claimUploadSlot,
}));

import { POST } from "@/app/api/testimonials/upload-signature/route";
import { sessionPhotosFolder } from "@/lib/server/testimonial-upload-sessions";

function call(folder: string) {
  return POST(
    new Request("https://hm.test/api/testimonials/upload-signature", {
      method: "POST",
      body: JSON.stringify({ paramsToSign: { folder } }),
    })
  );
}

afterEach(() => vi.clearAllMocks());

describe("POST /api/testimonials/upload-signature", () => {
  it("issues a server-chosen public id inside the session folder", async () => {
    verifyUploadSession.mockResolvedValue({ sessionId: SESSION, status: "pending" });

    const res = await call(sessionPhotosFolder(SESSION));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.publicId).toMatch(new RegExp(`^${sessionPhotosFolder(SESSION)}/[a-f0-9]{32}$`));
    expect(body.signature).toBe(`sig:${body.publicId}`);
    expect(body).toMatchObject({ cloudName: "demo", apiKey: "key" });
  });

  it("refuses a folder outside the session without spending an upload slot", async () => {
    verifyUploadSession.mockResolvedValue({ sessionId: SESSION, status: "pending" });

    expect((await call("hm_visuals/media")).status).toBe(400);
    expect(claimUploadSlot).not.toHaveBeenCalled();
  });

  it("refuses when there is no valid session", async () => {
    verifyUploadSession.mockResolvedValue(null);

    expect((await call(sessionPhotosFolder(SESSION))).status).toBe(403);
  });

  it("refuses once the session's upload cap is used", async () => {
    verifyUploadSession.mockResolvedValue({ sessionId: SESSION, status: "pending" });
    claimUploadSlot.mockResolvedValueOnce(false);

    expect((await call(sessionPhotosFolder(SESSION))).status).toBe(403);
  });
});
