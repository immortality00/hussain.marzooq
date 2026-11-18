import { describe, expect, it } from "vitest";
import { previousPageIs, previousPageOnSite } from "@/lib/back-target";

const ORIGIN = "https://hussain.art";
const entry = (url: string | null) => ({ url });

describe("previousPageOnSite", () => {
  it("is true when the page before this one is on the site", () => {
    const entries = [entry(`${ORIGIN}/people`), entry(`${ORIGIN}/people/someone`)];
    expect(previousPageOnSite(entries, 1, ORIGIN)).toBe(true);
  });

  it("counts any page of the site, with or without a search or hash", () => {
    const entries = [entry(`${ORIGIN}/photography?view=grid#top`), entry(`${ORIGIN}/photography/fashion`)];
    expect(previousPageOnSite(entries, 1, ORIGIN)).toBe(true);
  });

  it("is false for the first page of the visit", () => {
    expect(previousPageOnSite([entry(`${ORIGIN}/people/someone`)], 0, ORIGIN)).toBe(false);
  });

  it("is false when the page before was another site", () => {
    const entries = [entry("https://www.google.com/search?q=hussain"), entry(`${ORIGIN}/people/someone`)];
    expect(previousPageOnSite(entries, 1, ORIGIN)).toBe(false);
  });

  it("is false for a lookalike host or another scheme", () => {
    for (const url of ["https://hussain.art.example.org/people", "http://hussain.art/people"]) {
      expect(previousPageOnSite([entry(url), entry(`${ORIGIN}/x`)], 1, ORIGIN)).toBe(false);
    }
  });

  it("is false when the browser hides the page before (no URL) or the URL is broken", () => {
    expect(previousPageOnSite([entry(null), entry(`${ORIGIN}/x`)], 1, ORIGIN)).toBe(false);
    expect(previousPageOnSite([entry("not a url"), entry(`${ORIGIN}/x`)], 1, ORIGIN)).toBe(false);
  });

  it("is false when the index is past the list", () => {
    expect(previousPageOnSite([], 3, ORIGIN)).toBe(false);
  });
});

describe("previousPageIs", () => {
  it("is true when the page before is that list, whatever its search", () => {
    const entries = [entry(`${ORIGIN}/admin/media/list?q=seed`), entry(`${ORIGIN}/admin/media?edit=1`)];
    expect(previousPageIs(entries, 1, ORIGIN, "/admin/media/list")).toBe(true);
  });

  it("is false for another page of the site, another site, or no page before", () => {
    const entries = [entry(`${ORIGIN}/admin/dashboard`), entry(`${ORIGIN}/admin/media?edit=1`)];
    expect(previousPageIs(entries, 1, ORIGIN, "/admin/media/list")).toBe(false);
    expect(previousPageIs([entry("https://example.org/admin/media/list"), entry(`${ORIGIN}/x`)], 1, ORIGIN, "/admin/media/list")).toBe(false);
    expect(previousPageIs([entry(`${ORIGIN}/admin/media?edit=1`)], 0, ORIGIN, "/admin/media/list")).toBe(false);
  });
});
