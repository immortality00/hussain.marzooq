import { describe, expect, it } from "vitest";
import {
  compressImageForUpload,
  nextCompressionStep,
} from "@/lib/client/compress-image-for-upload";

describe("nextCompressionStep", () => {
  it("lowers quality before touching dimensions", () => {
    const step = nextCompressionStep({ quality: 0.9, width: 4000, height: 3000 });
    expect(step.quality).toBeCloseTo(0.78);
    expect(step).toMatchObject({ width: 4000, height: 3000 });
  });

  it("keeps lowering quality on every step while it's above the floor", () => {
    let step = { quality: 0.9, width: 4000, height: 3000 };
    for (let i = 0; i < 3; i++) step = nextCompressionStep(step);
    expect(step.quality).toBeGreaterThan(0.5);
    expect(step).toMatchObject({ width: 4000, height: 3000 });
  });

  it("switches to shrinking dimensions once quality bottoms out, and quality stays put", () => {
    const step = nextCompressionStep({ quality: 0.5, width: 4000, height: 3000 });
    expect(step.quality).toBe(0.5);
    expect(step.width).toBeLessThan(4000);
    expect(step.height).toBeLessThan(3000);
  });

  it("never stalls — every call changes either quality or dimensions", () => {
    let step = { quality: 0.9, width: 4000, height: 3000 };
    for (let i = 0; i < 20; i++) {
      const next = nextCompressionStep(step);
      expect(next).not.toEqual(step);
      step = next;
    }
  });
});

describe("compressImageForUpload", () => {
  it("passes a file through unchanged when it's already under the byte cap", async () => {
    const file = new File([new Uint8Array(10)], "small.jpg", { type: "image/jpeg" });
    const result = await compressImageForUpload(file, 1_000_000);
    expect(result).toBe(file);
  });

  it("passes a non-image file through unchanged even when it's over the cap", async () => {
    const file = new File([new Uint8Array(2_000_000)], "clip.mp4", { type: "video/mp4" });
    const result = await compressImageForUpload(file, 1_000_000);
    expect(result).toBe(file);
  });

  it("passes the original through when the browser can't decode it as an image", async () => {
    const original = globalThis.createImageBitmap;
    globalThis.createImageBitmap = async () => {
      throw new Error("not an image");
    };
    try {
      const file = new File([new Uint8Array(2_000_000)], "scan.heic", { type: "image/heic" });
      const result = await compressImageForUpload(file, 1_000_000);
      expect(result).toBe(file);
    } finally {
      globalThis.createImageBitmap = original;
    }
  });
});
