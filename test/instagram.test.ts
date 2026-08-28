import { describe, it, expect } from "vitest";
import { toInstagramEmbedUrl } from "@/lib/instagram";

describe("toInstagramEmbedUrl", () => {
  it("builds the embed URL from a post link", () => {
    expect(toInstagramEmbedUrl("https://www.instagram.com/p/CxAbC123/")).toBe(
      "https://www.instagram.com/p/CxAbC123/embed",
    );
  });

  it("builds the embed URL from a reel link", () => {
    expect(toInstagramEmbedUrl("https://instagram.com/reel/Dy_9-ZZ/")).toBe(
      "https://www.instagram.com/reel/Dy_9-ZZ/embed",
    );
  });

  it("ignores query strings and trailing segments", () => {
    expect(toInstagramEmbedUrl("https://www.instagram.com/p/CxAbC123/?igshid=abc")).toBe(
      "https://www.instagram.com/p/CxAbC123/embed",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(toInstagramEmbedUrl("  https://www.instagram.com/p/CxAbC123  ")).toBe(
      "https://www.instagram.com/p/CxAbC123/embed",
    );
  });

  it("rejects a profile link with no post shortcode", () => {
    expect(toInstagramEmbedUrl("https://www.instagram.com/hussain.marzooq/")).toBeNull();
  });

  it("rejects a non-Instagram host", () => {
    expect(toInstagramEmbedUrl("https://example.com/p/CxAbC123/")).toBeNull();
  });

  it("rejects a lookalike host", () => {
    expect(toInstagramEmbedUrl("https://instagram.com.evil.com/p/CxAbC123/")).toBeNull();
  });

  it("rejects an invalid shortcode", () => {
    expect(toInstagramEmbedUrl("https://www.instagram.com/p/bad code/")).toBeNull();
  });

  it("rejects non-URL garbage", () => {
    expect(toInstagramEmbedUrl("not a url")).toBeNull();
    expect(toInstagramEmbedUrl("")).toBeNull();
  });
});
