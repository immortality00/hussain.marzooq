import { beforeEach, describe, expect, test, vi } from "vitest";

const { getContactSections } = vi.hoisted(() => ({ getContactSections: vi.fn() }));
vi.mock("@/lib/server/page-sections", () => ({ getContactSections }));

import { getFooterEmails } from "@/lib/server/email-list";

beforeEach(() => vi.clearAllMocks());

describe("getFooterEmails", () => {
  test("returns the addresses set to On site, in order", async () => {
    getContactSections.mockResolvedValue({
      heading: "Write",
      emails: [
        { label: "Bookings", address: "book@hussain.art", shown: true },
        { label: "Inquiries", address: "inquiries@hussain.art", shown: false },
        { label: "Press", address: "press@hussain.art", shown: true },
      ],
    });
    expect((await getFooterEmails()).map((item) => item.address)).toEqual(["book@hussain.art", "press@hussain.art"]);
  });

  test("a failed read shows no email column instead of breaking every page or bringing back a hidden address", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getContactSections.mockRejectedValue(new Error("database unavailable"));
    expect(await getFooterEmails()).toEqual([]);
  });
});
