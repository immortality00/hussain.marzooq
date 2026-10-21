import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/client/admin-store", () => ({ adminWrite: vi.fn() }));

import { saveSummary } from "@/app/admin/(protected)/pages/lib/page-save";

describe("saveSummary", () => {
  test("a plain save says saved", () => {
    expect(saveSummary("About", [{ label: "Sections", kind: "saved", logosMissing: [] }])).toEqual({
      type: "ok",
      text: "About saved.",
    });
  });

  test("names the profile-link sites that got no icon", () => {
    expect(
      saveSummary("About", [
        { label: "Search & social", kind: "saved" },
        { label: "Sections", kind: "saved", logosMissing: ["linkedin.com", "objkt.com"] },
      ])
    ).toEqual({
      type: "info",
      text: "About: saved Search & social, Sections. No icon found for linkedin.com, objkt.com.",
    });
  });

  test("a failure still leads with the failure", () => {
    expect(
      saveSummary("About", [
        { label: "Search & social", kind: "failed", reason: "boom" },
        { label: "Sections", kind: "saved", logosMissing: ["objkt.com"] },
      ])
    ).toEqual({
      type: "err",
      text: "About: saved Sections; Search & social (boom) failed. Try again. No icon found for objkt.com.",
    });
  });
});
