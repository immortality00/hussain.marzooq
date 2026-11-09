import { describe, expect, test } from "vitest";
import { EMPTY_PROFILE_ROBOTS, hasPublicWork } from "@/lib/person-indexing";

describe("hasPublicWork", () => {
  test("a person with no public photo or video has none", () => {
    expect(hasPublicWork({ photoCount: 0, videoCount: 0 })).toBe(false);
  });

  test("one public photo or one public video is enough", () => {
    expect(hasPublicWork({ photoCount: 1, videoCount: 0 })).toBe(true);
    expect(hasPublicWork({ photoCount: 0, videoCount: 1 })).toBe(true);
  });

  test("an empty profile is kept out of the index but its links are still followed", () => {
    expect(EMPTY_PROFILE_ROBOTS).toEqual({ index: false, follow: true });
  });
});
