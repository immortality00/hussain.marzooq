import { describe, expect, it } from "vitest";
import cloudinaryImageLoader from "@/lib/cloudinary-image-loader";
import {
  STRICT_IMAGE_FORMATS,
  VIDEO_FRAME_TRANSFORM,
  deliveredTransforms,
  strictAllowList,
} from "@/lib/cloudinary-delivery";
import {
  IMAGE_DEVICE_SIZES,
  IMAGE_SIZES,
  TEXTURE_WIDTH,
  TEXTURE_WIDTH_SMALL,
  TRANSITION_IMAGE_WIDTH,
} from "@/lib/image-sizes";
import { cloudinaryTextureUrl } from "@/components/photography/lib";
import { cloudinaryVideoFrameUrl } from "@/lib/seo/structured-data-content";
import nextConfig from "@/next.config";

const PHOTO = "https://res.cloudinary.com/demo/image/upload/v1790282804/hm_visuals/media/photography/a.jpg";
const VIDEO = "https://res.cloudinary.com/demo/video/upload/v1790282804/hm_visuals/media/videography/reel.mp4";

function transformOf(url: string): string {
  const match = url.match(/\/upload\/(.+?)\/v\d+\//);
  return match ? match[1] : "";
}

function extensionOf(url: string): string {
  return url.split(".").pop() ?? "";
}

describe("Cloudinary strict allow list", () => {
  it("next/image uses exactly the pinned widths", () => {
    expect(nextConfig.images?.deviceSizes).toEqual(IMAGE_DEVICE_SIZES);
    expect(nextConfig.images?.imageSizes).toEqual(IMAGE_SIZES);
  });

  it("allows every size the image loader can request, with every image format", () => {
    const allowed = new Set(strictAllowList());
    for (const width of [...IMAGE_DEVICE_SIZES, ...IMAGE_SIZES, TRANSITION_IMAGE_WIDTH]) {
      const transform = transformOf(cloudinaryImageLoader({ src: PHOTO, width }));
      expect(deliveredTransforms()).toContain(transform);
      for (const format of STRICT_IMAGE_FORMATS) expect(allowed.has(`${transform}/${format}`)).toBe(true);
    }
  });

  it("allows both photography cylinder texture sizes", () => {
    for (const width of [TEXTURE_WIDTH, TEXTURE_WIDTH_SMALL]) {
      const url = cloudinaryTextureUrl(PHOTO, width);
      expect(strictAllowList()).toContain(`${transformOf(url)}/${extensionOf(url)}`);
    }
  });

  it("allows the showreel frame used in structured data", () => {
    const url = cloudinaryVideoFrameUrl(VIDEO);
    expect(url).toContain(`/${VIDEO_FRAME_TRANSFORM}/`);
    expect(strictAllowList()).toContain(`${VIDEO_FRAME_TRANSFORM}/${extensionOf(url)}`);
  });

  it("lists every entry once", () => {
    expect(new Set(strictAllowList()).size).toBe(strictAllowList().length);
  });
});
