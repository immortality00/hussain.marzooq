import { describe, expect, it } from "vitest";
import { isConfiguredProjectUrl, projectUrlLabel, toProjectUrl } from "@/lib/web-projects";

describe("toProjectUrl", () => {
  it("accepts https and http URLs, returning the normalized href", () => {
    expect(toProjectUrl("https://example.com")).toBe("https://example.com/");
    expect(toProjectUrl("http://example.com/work")).toBe("http://example.com/work");
  });

  it("trims surrounding whitespace", () => {
    expect(toProjectUrl("   https://example.com/a   ")).toBe("https://example.com/a");
  });

  it("rejects empty and whitespace-only input", () => {
    expect(toProjectUrl("")).toBeNull();
    expect(toProjectUrl("   ")).toBeNull();
  });

  it("accepts a scheme-less domain by assuming https", () => {
    expect(toProjectUrl("example.com")).toBe("https://example.com/");
    expect(toProjectUrl("www.example.com/work")).toBe("https://www.example.com/work");
    expect(toProjectUrl("  studio.example.co/portfolio  ")).toBe(
      "https://studio.example.co/portfolio",
    );
  });

  it("rejects non-http(s) protocols", () => {
    expect(toProjectUrl("javascript:alert(1)")).toBeNull();
    expect(toProjectUrl("ftp://example.com")).toBeNull();
    expect(toProjectUrl("mailto:me@example.com")).toBeNull();
  });

  it("rejects strings that cannot be a hostname", () => {
    expect(toProjectUrl("not a url")).toBeNull();
    expect(toProjectUrl("localhost")).toBeNull();
    expect(toProjectUrl("just-a-word")).toBeNull();
  });
});

describe("projectUrlLabel", () => {
  it("returns the hostname without the www prefix", () => {
    expect(projectUrlLabel("https://www.example.com/work")).toBe("example.com");
    expect(projectUrlLabel("https://studio.example.co/portfolio")).toBe("studio.example.co");
  });

  it("resolves a scheme-less domain to its hostname", () => {
    expect(projectUrlLabel("www.example.com/work")).toBe("example.com");
  });

  it("falls back to the trimmed input when the URL is invalid", () => {
    expect(projectUrlLabel("  not a url  ")).toBe("not a url");
  });
});

describe("isConfiguredProjectUrl", () => {
  const configured = ["example.com", "https://studio.example.co/portfolio"];

  it("matches a configured entry after both sides are normalized", () => {
    expect(isConfiguredProjectUrl("https://example.com/", configured)).toBe(true);
    expect(
      isConfiguredProjectUrl("https://studio.example.co/portfolio", configured),
    ).toBe(true);
  });

  it("rejects a URL that is not configured", () => {
    expect(isConfiguredProjectUrl("https://attacker.test/", configured)).toBe(false);
    expect(isConfiguredProjectUrl("https://example.com/other", configured)).toBe(false);
  });

  it("rejects everything when nothing is configured", () => {
    expect(isConfiguredProjectUrl("https://example.com/", [])).toBe(false);
  });

  it("ignores configured entries that are themselves invalid", () => {
    expect(isConfiguredProjectUrl("https://example.com/", ["javascript:alert(1)"])).toBe(false);
  });
});
