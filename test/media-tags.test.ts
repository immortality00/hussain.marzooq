import { describe, expect, test } from "vitest";
import {
  isReservedTagSlug,
  isValidTagSlug,
  slugifyTag,
} from "@/lib/server/media-tags";

describe("slugifyTag", () => {
  test("lowercases and hyphenates", () => {
    expect(slugifyTag("Behind The Scenes")).toBe("behind-the-scenes");
  });

  test("strips punctuation and collapses separators", () => {
    expect(slugifyTag("  Fashion & Editorial!! ")).toBe("fashion-editorial");
  });

  test("trims leading/trailing hyphens", () => {
    expect(slugifyTag("--studio--")).toBe("studio");
  });
});

describe("isValidTagSlug", () => {
  test("accepts a clean slug", () => {
    expect(isValidTagSlug("behind-the-scenes")).toBe(true);
  });

  test("rejects spaces, uppercase and edge hyphens", () => {
    expect(isValidTagSlug("Behind Scenes")).toBe(false);
    expect(isValidTagSlug("FASHION")).toBe(false);
    expect(isValidTagSlug("-fashion")).toBe(false);
    expect(isValidTagSlug("fashion-")).toBe(false);
    expect(isValidTagSlug("")).toBe(false);
  });
});

describe("isReservedTagSlug", () => {
  test("videos is reserved (collides with the static /videography/videos segment)", () => {
    expect(isReservedTagSlug("videos")).toBe(true);
  });

  test("ordinary slugs are not reserved", () => {
    expect(isReservedTagSlug("fashion")).toBe(false);
  });
});
