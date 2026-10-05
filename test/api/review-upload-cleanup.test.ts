import { afterEach, describe, expect, it, vi } from "vitest";

const { verifyUploadSession, deleteUploadSession, folderTree } = vi.hoisted(() => ({
  verifyUploadSession: vi.fn(),
  deleteUploadSession: vi.fn(async () => undefined),
  folderTree: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({ getDb: async () => ({}) }));
vi.mock("@/lib/server/request-guards", () => ({
  consumeFixedWindowRateLimit: async () => ({ limited: false, count: 1, resetAt: "" }),
}));
vi.mock("@/lib/server/cloudinary-assets", () => ({ deleteManagedCloudinaryFolderTree: folderTree }));
vi.mock("@/lib/server/testimonial-upload-sessions", async (original) => ({
  ...(await original<typeof import("@/lib/server/testimonial-upload-sessions")>()),
  verifyUploadSession,
  deleteUploadSession,
}));

import { POST } from "@/app/api/testimonials/upload-session/cleanup/route";

const SESSION = "0123456789abcdef0123";

function call(cookie?: string) {
  return POST(
    new Request("https://hm.test/api/testimonials/upload-session/cleanup", {
      method: "POST",
      headers: cookie ? { cookie } : undefined,
    })
  );
}

afterEach(() => vi.clearAllMocks());

describe("POST /api/testimonials/upload-session/cleanup", () => {
  it("keeps Cloudinary's own error text out of the response", async () => {
    verifyUploadSession.mockResolvedValue({ sessionId: SESSION, status: "pending" });
    folderTree.mockResolvedValue([
      { ok: false, target: "hm_visuals/testimonials/x", action: "delete-folder", error: "api_secret mismatch for key 1234" },
    ]);
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const res = await call();
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body).toEqual({ ok: false, error: "Could not remove the uploaded photos." });
    expect(JSON.stringify(body)).not.toContain("api_secret");
    expect(log).toHaveBeenCalledWith(
      "[review-upload-cleanup] failed",
      "hm_visuals/testimonials/x",
      "api_secret mismatch for key 1234"
    );
    expect(deleteUploadSession).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("answers ok, not a 500, to a cookie that cannot be decoded", async () => {
    verifyUploadSession.mockResolvedValue(null);

    const res = await call("hm_testimonial_upload=%E0%A4%A");

    expect(res.status).toBe(200);
    expect(verifyUploadSession).toHaveBeenCalledWith(expect.anything(), null, { requirePending: true });
  });
});
