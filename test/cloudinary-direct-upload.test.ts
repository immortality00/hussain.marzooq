import { describe, expect, it } from "vitest";
import { computeChunkRanges, cloudinaryUploadErrorMessage } from "@/lib/client/cloudinary-direct-upload";

describe("computeChunkRanges", () => {
  it("returns one range covering the whole file when it fits in a chunk", () => {
    expect(computeChunkRanges(10, 20)).toEqual([{ start: 0, end: 10 }]);
  });

  it("splits an exact multiple of the chunk size with no trailing empty range", () => {
    expect(computeChunkRanges(40, 20)).toEqual([
      { start: 0, end: 20 },
      { start: 20, end: 40 },
    ]);
  });

  it("caps the final range at the total size instead of overrunning it", () => {
    expect(computeChunkRanges(45, 20)).toEqual([
      { start: 0, end: 20 },
      { start: 20, end: 40 },
      { start: 40, end: 45 },
    ]);
  });

  it("covers every byte with no gaps or overlaps between consecutive ranges", () => {
    const ranges = computeChunkRanges(123_456_789, 20 * 1024 * 1024);
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i].start).toBe(ranges[i - 1].end);
    }
    expect(ranges[0].start).toBe(0);
    expect(ranges[ranges.length - 1].end).toBe(123_456_789);
  });

  it("returns no ranges for an empty file", () => {
    expect(computeChunkRanges(0, 20)).toEqual([]);
  });
});

describe("cloudinaryUploadErrorMessage", () => {
  it("surfaces Cloudinary's own error message", () => {
    const body = { error: { message: "File size too large. Got 14682765. Maximum is 10485760." } };
    expect(cloudinaryUploadErrorMessage(400, body)).toBe(
      "File size too large. Got 14682765. Maximum is 10485760.",
    );
  });

  it("falls back to a generic message when the body has no error.message", () => {
    expect(cloudinaryUploadErrorMessage(500, {})).toBe("Upload failed (500). Please try again.");
    expect(cloudinaryUploadErrorMessage(400, { error: { message: "" } })).toBe(
      "Upload failed (400). Please try again.",
    );
  });

  it("falls back to a generic message when the response body isn't JSON", () => {
    expect(cloudinaryUploadErrorMessage(413, null)).toBe("Upload failed (413). Please try again.");
    expect(cloudinaryUploadErrorMessage(413, "not json")).toBe(
      "Upload failed (413). Please try again.",
    );
  });
});
