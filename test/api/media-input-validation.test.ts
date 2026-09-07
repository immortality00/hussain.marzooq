import { describe, expect, it } from "vitest";
import { asHttpUrl, parseNftMeta, sanitizeAppearances } from "@/app/api/_lib/media";

describe("asHttpUrl", () => {
  it("keeps http and https URLs", () => {
    expect(asHttpUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(asHttpUrl("http://example.com")).toBe("http://example.com");
  });

  it("drops other schemes and unparseable values", () => {
    expect(asHttpUrl("javascript:alert(1)")).toBe("");
    expect(asHttpUrl("mailto:a@b.com")).toBe("");
    expect(asHttpUrl("ftp://example.com")).toBe("");
    expect(asHttpUrl("example.com")).toBe("");
    expect(asHttpUrl(42)).toBe("");
  });

  it("returns an empty string for empty input", () => {
    expect(asHttpUrl("   ")).toBe("");
  });
});

describe("sanitizeAppearances link validation", () => {
  it("stores a valid https link", () => {
    const out = sanitizeAppearances([
      { kind: "exhibited", title: "Show", link: "https://gallery.test/show" },
    ]);
    expect(out[0].link).toBe("https://gallery.test/show");
  });

  it("drops a javascript: link but keeps the appearance", () => {
    const out = sanitizeAppearances([
      { kind: "exhibited", title: "Show", link: "javascript:alert(1)" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].link).toBe("");
  });
});

describe("parseNftMeta price", () => {
  const base = {
    currency: "ETH",
    editionType: "1/1",
    status: "available",
  };

  it("accepts a zero or positive price", () => {
    expect(parseNftMeta({ ...base, price: 0 }, true)).toMatchObject({ ok: true });
    expect(parseNftMeta({ ...base, price: 2.5 }, true)).toMatchObject({ ok: true });
  });

  it("rejects a negative price", () => {
    const result = parseNftMeta({ ...base, price: -1 }, true);
    expect(result.ok).toBe(false);
  });
});
