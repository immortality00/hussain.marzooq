import { describe, expect, test } from "vitest";
import { isActivePath, navItems } from "@/components/site/nav-items";
import { DISCIPLINES } from "@/lib/disciplines";

const ALL = DISCIPLINES.map((d) => d.slug);

describe("navItems", () => {
  test("lists the five disciplines, then the four pages, in order", () => {
    expect(navItems(ALL).map((item) => item.label)).toEqual([
      "Photography",
      "Videography",
      "NFT",
      "Dancing",
      "WebDev",
      "About",
      "Services",
      "People",
      "Testimonials",
    ]);
  });

  test("WebDev links to the web development page; other surfaces keep the full name", () => {
    expect(navItems(ALL)).toContainEqual({ href: "/web-development", label: "WebDev" });
    expect(DISCIPLINES.find((d) => d.slug === "web-development")?.label).toBe("Web Development");
  });

  test("leaves out inactive disciplines and keeps the order of the rest", () => {
    expect(navItems(["web-development", "photography"]).map((item) => item.href)).toEqual([
      "/photography",
      "/web-development",
      "/about",
      "/services",
      "/people",
      "/testimonials",
    ]);
  });

  test("with every discipline off, only the four pages remain", () => {
    expect(navItems([]).map((item) => item.label)).toEqual(["About", "Services", "People", "Testimonials"]);
  });
});

describe("isActivePath", () => {
  test("matches the page and anything under it, not a page that only shares the prefix", () => {
    expect(isActivePath("/photography", "/photography")).toBe(true);
    expect(isActivePath("/photography/studio", "/photography")).toBe(true);
    expect(isActivePath("/photography-old", "/photography")).toBe(false);
    expect(isActivePath("/", "/about")).toBe(false);
  });
});
