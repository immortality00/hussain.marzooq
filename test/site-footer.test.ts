import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getFooterPageSettings, getFooterEmails } = vi.hoisted(() => ({
  getFooterPageSettings: vi.fn(),
  getFooterEmails: vi.fn(),
}));
vi.mock("@/lib/server/page-settings", () => ({ getFooterPageSettings }));
vi.mock("@/lib/server/email-list", () => ({ getFooterEmails }));

import { SiteFooter } from "@/components/site/SiteFooter";
import type { SocialItem } from "@/lib/social-links";

const ITEMS: SocialItem[] = [
  { href: "https://instagram.com/h", label: "Instagram", network: "instagram" },
  { href: "https://objkt.com/p/h", label: "objkt.com", logo: "https://res.cloudinary.com/demo/image/upload/o.png" },
];

const EMAILS = [
  { label: "Bookings", address: "book@hussain.art", shown: true },
  { label: "Privacy", address: "privacy@hussain.art", shown: true },
];

async function footerHtml(socialItems: SocialItem[]) {
  return renderToStaticMarkup(await SiteFooter({ socialItems }));
}

// The opening tag of each icon list, by where the footer puts it.
function iconLists(html: string) {
  return [...html.matchAll(/<ul aria-label="Social links" class="([^"]*)"/g)].map((match) => match[1]);
}

beforeEach(() => {
  getFooterPageSettings.mockResolvedValue([
    { slug: "photography", isActive: true },
    { slug: "videography", isActive: true },
    { slug: "blog", isActive: false },
  ]);
  getFooterEmails.mockResolvedValue(EMAILS);
});

describe("SiteFooter", () => {
  it("carries the social icons: under the opening lines from 1024px, under the emails below it", async () => {
    const html = await footerHtml(ITEMS);
    const [wide, narrow] = iconLists(html);

    expect(wide).toContain("hidden lg:flex");
    expect(narrow).toContain("lg:hidden");
    expect(html.indexOf("cinematic clarity")).toBeLessThan(html.indexOf(wide));
    expect(html.indexOf("privacy@hussain.art")).toBeLessThan(html.lastIndexOf(narrow));
    expect(html.match(/href="https:\/\/instagram\.com\/h"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="objkt.com"');
  });

  it("shows no icon lists when no profile link is switched on", async () => {
    expect(iconLists(await footerHtml([]))).toEqual([]);
  });

  it("puts Main beside Explore and the emails two to a row on a phone", async () => {
    const html = await footerHtml(ITEMS);
    expect(html).toContain("grid grid-cols-2");
    expect(html).toMatch(/<ul class="[^"]*grid-cols-2[^"]*lg:flex lg:flex-col/);
    expect(html.indexOf(">Main<")).toBeLessThan(html.indexOf(">Explore<"));
  });

  it("lists About and Testimonials, and marks itself for the floating column", async () => {
    const html = await footerHtml(ITEMS);
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/testimonials"');
    expect(html).toContain("data-site-footer");
  });
});
