import { afterEach, describe, expect, it, vi } from "vitest";

const SESSION = "0123456789abcdef0123";
const { verifyUploadSession, claimUploadSlot, consumeFixedWindowRateLimit, markSessionFolderUsed } = vi.hoisted(() => ({
  verifyUploadSession: vi.fn(),
  claimUploadSlot: vi.fn(async () => true),
  consumeFixedWindowRateLimit: vi.fn(async () => ({ limited: false, count: 1, resetAt: "" })),
  markSessionFolderUsed: vi.fn(async () => undefined),
}));

vi.mock("@/lib/server/db", () => ({ getDb: async () => ({}) }));
vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit }));
vi.mock("@/lib/server/cloudinary", () => ({
  isCloudinaryConfigured: () => true,
  getCloudinaryPublicConfig: () => ({ cloudName: "demo", apiKey: "key" }),
  signCloudinaryParams: (params: Record<string, unknown>) => `sig:${JSON.stringify(params)}`,
}));
vi.mock("@/lib/server/upload-ledger", async (original) => ({
  ...(await original<typeof import("@/lib/server/upload-ledger")>()),
  markSessionFolderUsed,
}));
vi.mock("@/lib/server/testimonial-upload-sessions", async (original) => ({
  ...(await original<typeof import("@/lib/server/testimonial-upload-sessions")>()),
  verifyUploadSession,
  claimUploadSlot,
}));

import { POST } from "@/app/api/testimonials/upload-signature/route";
import { sessionFolder, sessionPhotosFolder } from "@/lib/server/testimonial-upload-sessions";

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
    expect(body).toMatchObject({ cloudName: "demo", apiKey: "key" });
  });

  it("signs the allowed photo formats along with the id, and returns them for the upload form", async () => {
    verifyUploadSession.mockResolvedValue({ sessionId: SESSION, status: "pending" });

    const body = await (await call(sessionPhotosFolder(SESSION))).json();

    expect(body.allowedFormats).toBe("jpg,jpeg,png,webp,gif,heic,heif,avif");
    expect(body.allowedFormats).not.toContain("svg");
    expect(body.signature).toBe(
      `sig:${JSON.stringify({ allowed_formats: body.allowedFormats, public_id: body.publicId, timestamp: body.timestamp })}`
    );
  });

  it("marks the session's folder as used once an upload is signed", async () => {
    verifyUploadSession.mockResolvedValue({ sessionId: SESSION, status: "pending" });

    await call(sessionPhotosFolder(SESSION));

    expect(markSessionFolderUsed).toHaveBeenCalledWith(expect.anything(), sessionFolder(SESSION));
  });

  it("refuses a folder outside the session without spending an upload slot", async () => {
    verifyUploadSession.mockResolvedValue({ sessionId: SESSION, status: "pending" });

    expect((await call("hm_visuals/media")).status).toBe(400);
    expect(claimUploadSlot).not.toHaveBeenCalled();
    expect(markSessionFolderUsed).not.toHaveBeenCalled();
  });

  it("refuses when there is no valid session", async () => {
    verifyUploadSession.mockResolvedValue(null);

    expect((await call(sessionPhotosFolder(SESSION))).status).toBe(403);
  });

  it("refuses once the session's upload cap is used", async () => {
    verifyUploadSession.mockResolvedValue({ sessionId: SESSION, status: "pending" });
    claimUploadSlot.mockResolvedValueOnce(false);

    expect((await call(sessionPhotosFolder(SESSION))).status).toBe(403);
    expect(markSessionFolderUsed).not.toHaveBeenCalled();
  });
});
