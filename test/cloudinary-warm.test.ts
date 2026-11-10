import { describe, expect, it, vi } from "vitest";
import { warmableUrl, warmImageSizes, warmUrls, WARM_WIDTHS } from "@/lib/server/cloudinary-warm";

const PHOTO = "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/photography/a.jpg";
const POSTER = "https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/posters/b.jpg";

describe("warmableUrl", () => {
  it("takes a public photo and a video link's poster", () => {
    expect(warmableUrl({ type: "image", secureUrl: PHOTO, isPublic: true })).toBe(PHOTO);
    expect(warmableUrl({ type: "embed", posterUrl: POSTER, isPublic: true })).toBe(POSTER);
  });

  it("skips hidden, private-delivery, uploaded video and non-Cloudinary files", () => {
    expect(warmableUrl({ type: "image", secureUrl: PHOTO, isPublic: false })).toBeNull();
    expect(warmableUrl({ type: "image", secureUrl: PHOTO, deliveryType: "authenticated" })).toBeNull();
    expect(warmableUrl({ type: "video", secureUrl: PHOTO })).toBeNull();
    expect(warmableUrl({ type: "image", secureUrl: "https://example.com/a.jpg" })).toBeNull();
    expect(warmableUrl({ type: "embed", posterUrl: null })).toBeNull();
  });
});

describe("warmImageSizes", () => {
  it("asks for every width the site's loader builds, without downloading", async () => {
    const urls = warmUrls(PHOTO);
    expect(urls).toHaveLength(WARM_WIDTHS.length);
    expect(urls[0]).toContain(`/upload/w_${WARM_WIDTHS[0]},`);

    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }));
    const result = await warmImageSizes(PHOTO, fetchImpl as unknown as typeof fetch);
    expect(result).toEqual({ requested: urls.length * 2, failed: [] });
    expect(fetchImpl).toHaveBeenCalledTimes(urls.length * 2);
    for (const call of fetchImpl.mock.calls as unknown as [string, RequestInit][]) {
      expect(call[1].method).toBe("HEAD");
      expect(urls).toContain(call[0]);
    }
  });

  it("adds the Cylinder's two texture sizes for photos", () => {
    const urls = warmUrls(PHOTO, true);
    expect(urls).toHaveLength(WARM_WIDTHS.length + 2);
    expect(urls.some((u) => u.includes("/upload/w_600,c_limit,q_auto,f_auto/"))).toBe(true);
    expect(urls.some((u) => u.includes("/upload/w_420,c_limit,q_auto,f_auto/"))).toBe(true);
  });

  it("reports sizes that failed", async () => {
    const fetchImpl = vi.fn(async (url: string) => new Response(null, { status: url.includes("w_3840") ? 400 : 200 }));
    const { failed } = await warmImageSizes(PHOTO, fetchImpl as unknown as typeof fetch);
    expect(failed).toHaveLength(1);
    expect(failed[0]).toMatch(/^400 .*w_3840/);
  });
});
