import { afterEach, describe, expect, it, vi } from "vitest";

const { registerAssetUpload } = vi.hoisted(() => ({ registerAssetUpload: vi.fn(async () => undefined) }));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/db", () => ({ getDb: async () => ({}) }));
vi.mock("@/lib/server/cloudinary", async (original) => ({
  ...(await original<typeof import("@/lib/server/cloudinary")>()),
  isCloudinaryConfigured: () => true,
  getCloudinaryPublicConfig: () => ({ cloudName: "demo", apiKey: "key" }),
  signCloudinaryParams: (params: Record<string, unknown>) => `sig:${JSON.stringify(params)}`,
}));
vi.mock("@/lib/server/upload-ledger", async (original) => ({
  ...(await original<typeof import("@/lib/server/upload-ledger")>()),
  registerAssetUpload,
  scheduleUploadSweep: vi.fn(),
}));

import { POST } from "@/app/api/sign-cloudinary-params/route";

afterEach(() => vi.clearAllMocks());

describe("POST /api/sign-cloudinary-params (admin)", () => {
  it("signs only the id and timestamp, with no format restriction", async () => {
    const res = await POST(
      new Request("https://hm.test/api/sign-cloudinary-params", {
        method: "POST",
        body: JSON.stringify({ paramsToSign: { folder: "hm_visuals/media/photography" } }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Object.keys(body).sort()).toEqual(["apiKey", "cloudName", "publicId", "signature", "timestamp"]);
    expect(body.signature).toBe(`sig:${JSON.stringify({ public_id: body.publicId, timestamp: body.timestamp })}`);
    expect(registerAssetUpload).toHaveBeenCalledWith(expect.anything(), body.publicId);
  });
});
