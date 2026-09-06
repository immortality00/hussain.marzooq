import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { rename } = vi.hoisted(() => ({ rename: vi.fn() }));

vi.mock("cloudinary", () => ({
  v2: { uploader: { rename } },
}));

vi.mock("@/lib/server/cloudinary", () => ({
  ensureCloudinaryConfigured: vi.fn(),
}));

import { CLOUDINARY_MEDIA_FOLDER } from "@/lib/cloudinary-folders";
import {
  assetIsInsideFolder,
  assetsPointToSameCloudinaryFile,
  getStoredMediaAsset,
  moveStoredMediaAssetToFolder,
  normalizeUploadedMediaAsset,
} from "@/lib/server/media-asset-management";

const CLOUD = "https://res.cloudinary.com/demo";
const TARGET = `${CLOUDINARY_MEDIA_FOLDER}/photography`;

function uploadUrl(publicId: string, resourceType = "image", ext = "jpg") {
  return `${CLOUD}/${resourceType}/upload/v1700000000/${publicId}.${ext}`;
}

beforeEach(() => {
  rename.mockReset();
  vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("getStoredMediaAsset", () => {
  test("reads the stored asset and defaults an absent delivery type to upload", () => {
    expect(
      getStoredMediaAsset({
        secureUrl: uploadUrl(`${TARGET}/photo`),
        publicId: `${TARGET}/photo`,
        resourceType: "image",
      })
    ).toEqual({
      secureUrl: uploadUrl(`${TARGET}/photo`),
      publicId: `${TARGET}/photo`,
      resourceType: "image",
      deliveryType: "upload",
    });
  });

  test("preserves an authenticated delivery type", () => {
    expect(getStoredMediaAsset({ deliveryType: "authenticated" }).deliveryType).toBe(
      "authenticated"
    );
  });

  test("nulls fields that are not strings", () => {
    expect(getStoredMediaAsset({ secureUrl: 12, publicId: null })).toMatchObject({
      secureUrl: null,
      publicId: null,
      resourceType: null,
    });
  });
});

describe("assetIsInsideFolder / assetsPointToSameCloudinaryFile", () => {
  test("matches only true descendants of the folder", () => {
    expect(assetIsInsideFolder(`${TARGET}/photo`, TARGET)).toBe(true);
    expect(assetIsInsideFolder(`/${TARGET}/photo`, TARGET)).toBe(true);
    expect(assetIsInsideFolder(`${TARGET}-other/photo`, TARGET)).toBe(false);
    expect(assetIsInsideFolder(TARGET, TARGET)).toBe(false);
    expect(assetIsInsideFolder(null, TARGET)).toBe(false);
  });

  test("two assets are the same file only when both public ids are present and equal", () => {
    const base = { secureUrl: null, publicId: `${TARGET}/photo`, resourceType: "image" };

    expect(assetsPointToSameCloudinaryFile(base, { ...base })).toBe(true);
    expect(assetsPointToSameCloudinaryFile(base, { ...base, publicId: `${TARGET}/other` })).toBe(
      false
    );
    expect(assetsPointToSameCloudinaryFile(base, { ...base, publicId: null })).toBe(false);
  });
});

describe("normalizeUploadedMediaAsset", () => {
  const good = {
    secureUrl: uploadUrl(`${TARGET}/photo`),
    publicId: `${TARGET}/photo`,
    resourceType: "image",
    targetFolder: TARGET,
  };

  test("accepts a well-formed upload inside the target folder", () => {
    const result = normalizeUploadedMediaAsset(good);

    expect(result.ok).toBe(true);
    expect((result as { asset: Record<string, unknown> }).asset).toMatchObject({
      publicId: `${TARGET}/photo`,
      resourceType: "image",
      type: "image",
      isAlreadyInTargetFolder: true,
    });
  });

  test("accepts resourceType 'auto' and resolves it from the URL", () => {
    const result = normalizeUploadedMediaAsset({
      ...good,
      secureUrl: uploadUrl(`${TARGET}/clip`, "video", "mp4"),
      publicId: `${TARGET}/clip`,
      resourceType: "auto",
    });

    expect(result.ok).toBe(true);
    expect((result as { asset: { type: string } }).asset.type).toBe("video");
  });

  test("rejects an incomplete asset", () => {
    expect(normalizeUploadedMediaAsset({ ...good, publicId: "  " })).toEqual({
      ok: false,
      error: "Uploaded media asset is incomplete.",
    });
  });

  test("rejects a non-Cloudinary URL", () => {
    expect(
      normalizeUploadedMediaAsset({ ...good, secureUrl: "https://evil.test/photo.jpg" })
    ).toMatchObject({ ok: false });
  });

  test("rejects a URL whose public id does not match the submitted one", () => {
    expect(
      normalizeUploadedMediaAsset({ ...good, secureUrl: uploadUrl(`${TARGET}/somethingelse`) })
    ).toEqual({
      ok: false,
      error: "Uploaded media URL does not match the media public ID.",
    });
  });

  test("rejects a resource type that contradicts the URL", () => {
    expect(
      normalizeUploadedMediaAsset({
        ...good,
        secureUrl: uploadUrl(`${TARGET}/clip`, "video", "mp4"),
        publicId: `${TARGET}/clip`,
        resourceType: "image",
      })
    ).toEqual({
      ok: false,
      error: "Uploaded media resource type does not match the media URL.",
    });
  });

  test("rejects an asset outside the managed media folder", () => {
    expect(
      normalizeUploadedMediaAsset({
        ...good,
        secureUrl: uploadUrl("someone_elses_folder/photo"),
        publicId: "someone_elses_folder/photo",
      })
    ).toMatchObject({ ok: false });
  });

  test("allows an existing managed asset from another media subfolder only when asked", () => {
    const elsewhere = {
      ...good,
      secureUrl: uploadUrl(`${CLOUDINARY_MEDIA_FOLDER}/videography/photo`),
      publicId: `${CLOUDINARY_MEDIA_FOLDER}/videography/photo`,
    };

    expect(normalizeUploadedMediaAsset(elsewhere)).toMatchObject({ ok: false });

    const allowed = normalizeUploadedMediaAsset({
      ...elsewhere,
      allowExistingManagedMediaAsset: true,
    });

    expect(allowed.ok).toBe(true);
    expect((allowed as { asset: { isAlreadyInTargetFolder: boolean } }).asset
      .isAlreadyInTargetFolder).toBe(false);
  });
});

describe("moveStoredMediaAssetToFolder", () => {
  const stored = {
    secureUrl: uploadUrl(`${CLOUDINARY_MEDIA_FOLDER}/videography/photo`),
    publicId: `${CLOUDINARY_MEDIA_FOLDER}/videography/photo`,
    resourceType: "image",
    deliveryType: "upload" as const,
  };

  test("renames into the destination folder and returns the moved asset", async () => {
    rename.mockResolvedValue({
      secure_url: uploadUrl(`${TARGET}/photo`),
      public_id: `${TARGET}/photo`,
      resource_type: "image",
    });

    const moved = await moveStoredMediaAssetToFolder(stored, TARGET);

    expect(rename).toHaveBeenCalledWith(
      `${CLOUDINARY_MEDIA_FOLDER}/videography/photo`,
      `${TARGET}/photo`,
      expect.objectContaining({ resource_type: "image", type: "upload", invalidate: true })
    );
    expect(moved).toEqual({
      secureUrl: uploadUrl(`${TARGET}/photo`),
      publicId: `${TARGET}/photo`,
      resourceType: "image",
    });
  });

  test("carries the authenticated delivery type into the rename (L7)", async () => {
    rename.mockResolvedValue({
      secure_url: uploadUrl(`${TARGET}/photo`),
      public_id: `${TARGET}/photo`,
      resource_type: "image",
    });

    await moveStoredMediaAssetToFolder({ ...stored, deliveryType: "authenticated" }, TARGET);

    expect(rename).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ type: "authenticated" })
    );
  });

  test("no-ops when the asset already sits at the destination", async () => {
    const alreadyThere = {
      secureUrl: uploadUrl(`${TARGET}/photo`),
      publicId: `${TARGET}/photo`,
      resourceType: "image",
      deliveryType: "upload" as const,
    };

    const moved = await moveStoredMediaAssetToFolder(alreadyThere, TARGET);

    expect(rename).not.toHaveBeenCalled();
    expect(moved).toEqual({
      secureUrl: uploadUrl(`${TARGET}/photo`),
      publicId: `${TARGET}/photo`,
      resourceType: "image",
    });
  });

  test("refuses to move an asset outside the managed media folder", async () => {
    const foreign = { ...stored, publicId: "someone_elses_folder/photo" };

    await expect(moveStoredMediaAssetToFolder(foreign, TARGET)).resolves.toBeNull();
    expect(rename).not.toHaveBeenCalled();
  });

  test("returns null for an asset with no public id", async () => {
    await expect(
      moveStoredMediaAssetToFolder({ ...stored, publicId: "  " }, TARGET)
    ).resolves.toBeNull();
    expect(rename).not.toHaveBeenCalled();
  });

  test.each([
    ["a non-object result", null],
    ["a result with no secure_url", { public_id: `${TARGET}/photo` }],
  ])("returns null on %s so the caller does not persist a bad asset", async (_label, result) => {
    rename.mockResolvedValue(result);

    await expect(moveStoredMediaAssetToFolder(stored, TARGET)).resolves.toBeNull();
  });

  test("propagates a Cloudinary rejection rather than silently losing the asset", async () => {
    rename.mockRejectedValue({ error: { message: "Resource not found" } });

    await expect(moveStoredMediaAssetToFolder(stored, TARGET)).rejects.toBeTruthy();
  });
});
