import { describe, expect, test } from "vitest";
import cloudinaryImageLoader from "@/lib/cloudinary-image-loader";
import { isMediaAssetPath, mediaAssetPath } from "@/lib/media-asset-path";

describe("mediaAssetPath", () => {
  test("builds an admin path with no gallery", () => {
    expect(mediaAssetPath("abc123")).toBe("/api/media/asset/abc123");
  });

  test("carries and encodes the gallery slug", () => {
    expect(mediaAssetPath("abc123", "client a")).toBe("/api/media/asset/abc123?g=client%20a");
  });

  test("recognises its own paths only", () => {
    expect(isMediaAssetPath(mediaAssetPath("abc", "g"))).toBe(true);
    expect(isMediaAssetPath("https://res.cloudinary.com/demo/image/upload/v1/a.jpg")).toBe(false);
  });
});

describe("cloudinaryImageLoader", () => {
  test("appends width to a proxy path that already has a query", () => {
    expect(cloudinaryImageLoader({ src: "/api/media/asset/abc?g=x", width: 640 })).toBe(
      "/api/media/asset/abc?g=x&w=640"
    );
  });

  test("appends width to a proxy path with no query", () => {
    expect(cloudinaryImageLoader({ src: "/api/media/asset/abc", width: 320 })).toBe(
      "/api/media/asset/abc?w=320"
    );
  });

  test("still transforms Cloudinary upload URLs", () => {
    expect(
      cloudinaryImageLoader({
        src: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg",
        width: 800,
      })
    ).toBe("https://res.cloudinary.com/demo/image/upload/w_800,c_limit,q_auto,f_auto/v1/a.jpg");
  });

  test("leaves unrelated sources untouched", () => {
    expect(cloudinaryImageLoader({ src: "/local.png", width: 100 })).toBe("/local.png");
  });
});
