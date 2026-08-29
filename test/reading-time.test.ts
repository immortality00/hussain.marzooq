import { describe, it, expect } from "vitest";
import { readingMinutes, readingTimeLabel } from "@/lib/reading-time";

describe("readingMinutes", () => {
  it("returns 1 for empty or whitespace-only text", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("   \n  ")).toBe(1);
  });

  it("returns at least 1 for short text", () => {
    expect(readingMinutes("a few words here")).toBe(1);
  });

  it("rounds to the nearest minute at 200 wpm", () => {
    expect(readingMinutes(Array(200).fill("word").join(" "))).toBe(1);
    expect(readingMinutes(Array(300).fill("word").join(" "))).toBe(2);
    expect(readingMinutes(Array(500).fill("word").join(" "))).toBe(3);
  });

  it("collapses irregular whitespace when counting", () => {
    expect(readingMinutes("one\n\ntwo\tthree    four")).toBe(1);
  });
});

describe("readingTimeLabel", () => {
  it("formats a human label", () => {
    expect(readingTimeLabel("")).toBe("1 min read");
    expect(readingTimeLabel(Array(500).fill("word").join(" "))).toBe("3 min read");
  });
});
