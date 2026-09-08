import { describe, expect, it } from "vitest";
import cloudinaryImageLoader from "@/lib/cloudinary-image-loader";
import { MAX_TRANSFORM_PIXELS, heightCapForWidth } from "@/lib/cloudinary-limits";

const SRC =
  "https://res.cloudinary.com/demo/image/upload/v1782891004/hm_visuals/media/photography/tall.jpg";

describe("heightCapForWidth", () => {
  it("keeps the fitted box under Cloudinary's 25 MP output cap at every srcset width", () => {
    for (const width of [640, 750, 828, 1080, 1200, 1920, 2048, 3840]) {
      expect(width * heightCapForWidth(width)).toBeLessThanOrEqual(MAX_TRANSFORM_PIXELS);
      expect(width * heightCapForWidth(width)).toBeLessThan(25_000_000);
    }
  });

  it("caps the 3840 candidate below the height that made a tall original 400", () => {
    // 4848x8619 scaled to w_3840 is 6827px tall — 26.2 MP, which Cloudinary rejects.
    expect(heightCapForWidth(3840)).toBeLessThan(6827);
  });

  it("stays far above what a small width needs, so narrow renditions are untouched", () => {
    expect(heightCapForWidth(640)).toBeGreaterThan(20_000);
  });

  it("returns 0 for a nonsensical width instead of Infinity", () => {
    expect(heightCapForWidth(0)).toBe(0);
    expect(heightCapForWidth(-10)).toBe(0);
    expect(heightCapForWidth(Number.NaN)).toBe(0);
  });
});

describe("cloudinaryImageLoader", () => {
  it("emits a height bound alongside the width", () => {
    expect(cloudinaryImageLoader({ src: SRC, width: 3840 })).toContain(
      `w_3840,h_${heightCapForWidth(3840)},c_limit,q_auto,f_auto`
    );
  });

  it("honours an explicit quality", () => {
    expect(cloudinaryImageLoader({ src: SRC, width: 640, quality: 60 })).toContain("q_60");
  });

  it("leaves a src that already carries a transform alone", () => {
    const transformed = SRC.replace("/upload/", "/upload/w_100,c_limit/");
    expect(cloudinaryImageLoader({ src: transformed, width: 3840 })).toBe(transformed);
  });

  it("passes a non-Cloudinary src through untouched", () => {
    expect(cloudinaryImageLoader({ src: "/local/photo.jpg", width: 3840 })).toBe("/local/photo.jpg");
  });

  it("sends the private-gallery proxy its width as a query param", () => {
    expect(cloudinaryImageLoader({ src: "/api/media/asset/abc", width: 1200 })).toBe(
      "/api/media/asset/abc?w=1200"
    );
  });
});
