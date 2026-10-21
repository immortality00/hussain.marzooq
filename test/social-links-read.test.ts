import { beforeEach, describe, expect, test, vi } from "vitest";

const { getAboutSections } = vi.hoisted(() => ({ getAboutSections: vi.fn() }));
vi.mock("@/lib/server/page-sections", () => ({ getAboutSections }));

import { getSocialItems } from "@/lib/server/social-links";

beforeEach(() => vi.clearAllMocks());

describe("getSocialItems", () => {
  test("builds the column from the shown profile links, in profile order, and the stored logos", async () => {
    getAboutSections.mockResolvedValue({
      profile: {
        links: ["https://instagram.com/h", "https://x.com/hidden", "https://objkt.com/p/h"],
        shownLinks: ["https://objkt.com/p/h", "https://instagram.com/h"],
      },
      linkLogos: [{ host: "objkt.com", image: { url: "https://res.cloudinary.com/x/o.png", publicId: "o" } }],
    });
    expect(await getSocialItems()).toEqual([
      { href: "https://instagram.com/h", label: "Instagram", network: "instagram" },
      { href: "https://objkt.com/p/h", label: "objkt.com", logo: "https://res.cloudinary.com/x/o.png" },
    ]);
  });

  test("a failed read shows no icons instead of breaking every page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getAboutSections.mockRejectedValue(new Error("database unavailable"));
    expect(await getSocialItems()).toEqual([]);
  });
});
