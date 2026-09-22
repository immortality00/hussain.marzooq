import { describe, expect, it } from "vitest";
import { computeChunkRanges } from "@/lib/client/cloudinary-direct-upload";

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
