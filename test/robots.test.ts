import { describe, expect, test } from "vitest";
import robots from "@/app/robots";
import { SITE_URL } from "@/lib/seo/site-url";

const result = robots();
const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
const disallow = [rule.disallow ?? []].flat();

// Google matches a rule as a prefix of path + query, and the longest matching rule wins
// over `Allow: /` — so a URL is blocked when any Disallow rule is a prefix of it.
const blocked = (url: string) => disallow.some((prefix) => url.startsWith(prefix));

describe("robots.txt", () => {
  test("keeps every public page crawlable", () => {
    for (const path of [
      "/",
      "/contact",
      "/services",
      "/services/portrait-session",
      "/blog",
      "/blog/a-post",
      "/photography",
      "/photography/fashion",
      "/people/someone",
    ]) {
      expect(blocked(path), path).toBe(false);
    }
  });

  test("blocks the pre-filled contact links and filter views", () => {
    for (const url of [
      "/contact?category=photography",
      "/contact?service=Portrait%20Inquiry&category=photography&context=Inquiry%20source",
      "/services?category=photography",
      "/blog?category=notes",
    ]) {
      expect(blocked(url), url).toBe(true);
    }
  });

  test("still blocks admin, galleries and the API", () => {
    expect(blocked("/admin/dashboard")).toBe(true);
    expect(blocked("/g/a-gallery")).toBe(true);
    expect(blocked("/api/media/list-public")).toBe(true);
  });

  test("points at the sitemap on the site's own origin", () => {
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(result.host).toBe(SITE_URL);
  });
});
