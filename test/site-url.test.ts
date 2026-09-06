import { describe, expect, test } from "vitest";
import { absoluteUrl, normalizeSiteUrl, SITE_URL } from "@/lib/seo/site-url";

describe("normalizeSiteUrl", () => {
  test("falls back when unset or blank", () => {
    expect(normalizeSiteUrl(undefined)).toBe("https://hussain-marzooq.com");
    expect(normalizeSiteUrl("   ")).toBe("https://hussain-marzooq.com");
  });

  test("trims whitespace and trailing slashes", () => {
    expect(normalizeSiteUrl("  https://hussain.art/  ")).toBe("https://hussain.art");
    expect(normalizeSiteUrl("https://hussain.art///")).toBe("https://hussain.art");
  });

  test("leaves a clean origin untouched", () => {
    expect(normalizeSiteUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });
});

describe("absoluteUrl", () => {
  test("root has no trailing slash", () => {
    expect(absoluteUrl("/")).toBe(SITE_URL);
    expect(absoluteUrl("")).toBe(SITE_URL);
  });

  test("joins a path exactly once", () => {
    expect(absoluteUrl("/photography")).toBe(`${SITE_URL}/photography`);
    expect(absoluteUrl("photography")).toBe(`${SITE_URL}/photography`);
    expect(absoluteUrl("//blog/post")).toBe(`${SITE_URL}/blog/post`);
  });
});
