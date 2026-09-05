import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/server/cloudinary", () => ({
  ensureCloudinaryConfigured: () => ({ cloudName: "demo", apiKey: "k", apiSecret: "s" }),
}));

const {
  cloudinaryFormatFromUrl,
  fullyQualifiedPublicId,
  normalizeAssetResourceType,
  normalizeDeliveryType,
} = await import("@/lib/server/cloudinary-private");

describe("normalizeDeliveryType", () => {
  test("only 'authenticated' is authenticated", () => {
    expect(normalizeDeliveryType("authenticated")).toBe("authenticated");
    expect(normalizeDeliveryType("upload")).toBe("upload");
    expect(normalizeDeliveryType(undefined)).toBe("upload");
    expect(normalizeDeliveryType("private")).toBe("upload");
  });
});

describe("normalizeAssetResourceType", () => {
  test("only 'video' is video", () => {
    expect(normalizeAssetResourceType("video")).toBe("video");
    expect(normalizeAssetResourceType("image")).toBe("image");
    expect(normalizeAssetResourceType(null)).toBe("image");
  });
});

describe("cloudinaryFormatFromUrl", () => {
  test("reads the extension off a delivery URL", () => {
    expect(
      cloudinaryFormatFromUrl(
        "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/photography/shot.JPG"
      )
    ).toBe("jpg");
    expect(
      cloudinaryFormatFromUrl(
        "https://res.cloudinary.com/demo/video/authenticated/s--x--/v1/hm_visuals/media/videography/clip.mp4"
      )
    ).toBe("mp4");
  });

  test("returns empty for extensionless or missing input", () => {
    expect(cloudinaryFormatFromUrl(null)).toBe("");
    expect(cloudinaryFormatFromUrl("")).toBe("");
    expect(cloudinaryFormatFromUrl("https://res.cloudinary.com/demo/image/upload/v1/folder/name")).toBe("");
  });

  test("ignores a query string", () => {
    expect(cloudinaryFormatFromUrl("https://res.cloudinary.com/d/image/upload/a/b.png?x=1")).toBe("png");
  });
});

describe("fullyQualifiedPublicId", () => {
  test("carries resource type and delivery type", () => {
    expect(
      fullyQualifiedPublicId({
        publicId: "hm_visuals/media/photography/a",
        resourceType: "video",
        deliveryType: "authenticated",
      })
    ).toBe("video/authenticated/hm_visuals/media/photography/a");
  });
});

const { cloudinaryErrorMessage } = await import("@/lib/server/cloudinary-assets");

describe("cloudinaryErrorMessage", () => {
  test("reads Error, string and plain-object rejections", () => {
    expect(cloudinaryErrorMessage(new Error("boom"))).toBe("boom");
    expect(cloudinaryErrorMessage("boom")).toBe("boom");
    expect(cloudinaryErrorMessage({ message: "Cannot change type of a deleted resource" })).toBe(
      "Cannot change type of a deleted resource"
    );
    expect(cloudinaryErrorMessage({ error: { message: "Resource not found" } })).toBe(
      "Resource not found"
    );
  });

  test("never leaks [object Object]", () => {
    expect(cloudinaryErrorMessage({ http_code: 400 })).toBe("Unknown Cloudinary error.");
  });
});
