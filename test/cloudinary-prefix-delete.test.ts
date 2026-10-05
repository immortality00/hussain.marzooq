import { afterEach, describe, expect, it, vi } from "vitest";

const { deleteByPrefix } = vi.hoisted(() => ({
  deleteByPrefix: vi.fn<(prefix: string, options: { resource_type: string }) => Promise<unknown>>(async () => ({
    deleted: {},
  })),
}));

vi.mock("cloudinary", () => ({ v2: { api: { delete_resources_by_prefix: deleteByPrefix } } }));
vi.mock("@/lib/server/cloudinary", () => ({
  isCloudinaryConfigured: () => true,
  ensureCloudinaryConfigured: () => ({}),
}));

import { deleteManagedCloudinaryResourcesByPrefix } from "@/lib/server/cloudinary-assets";

const FOLDER = "hm_visuals/testimonials/session-1";

afterEach(() => vi.clearAllMocks());

describe("deleteManagedCloudinaryResourcesByPrefix", () => {
  it("deletes images, videos and raw files under the prefix", async () => {
    const result = await deleteManagedCloudinaryResourcesByPrefix(FOLDER, ["hm_visuals/testimonials"], true);

    expect(result).toEqual({ ok: true, target: FOLDER, action: "delete-prefix" });
    expect(deleteByPrefix.mock.calls.map(([prefix, options]) => [prefix, options.resource_type])).toEqual([
      [FOLDER, "image"],
      [FOLDER, "video"],
      [FOLDER, "raw"],
    ]);
  });

  it("reports a failure on any resource type instead of claiming the folder is clear", async () => {
    deleteByPrefix.mockResolvedValueOnce({ deleted: {} }).mockRejectedValueOnce({ error: { message: "Rate limit" } });

    const result = await deleteManagedCloudinaryResourcesByPrefix(FOLDER, ["hm_visuals/testimonials"], true);

    expect(result).toEqual({ ok: false, target: FOLDER, action: "delete-prefix", error: "Rate limit" });
  });

  it("never touches a prefix outside the allowed folders", async () => {
    const result = await deleteManagedCloudinaryResourcesByPrefix("hm_visuals/media", ["hm_visuals/testimonials"], true);

    expect(result).toMatchObject({ ok: false });
    expect(deleteByPrefix).not.toHaveBeenCalled();
  });
});
