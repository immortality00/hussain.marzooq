import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  DEFAULT_SEARCH_PROFILE,
  normalizeSearchProfile,
  publishedProfile,
  searchProfileError,
  shownProfileLinks,
} from "@/lib/seo/search-profile";

const { getDb, revalidatePath } = vi.hoisted(() => ({ getDb: vi.fn(), revalidatePath: vi.fn() }));

vi.mock("@/lib/auth/admin", () => ({ isAdminAuthedServer: async () => true }));
vi.mock("@/lib/server/db", () => ({ getDb }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/server/link-logos", () => ({ resolveLinkLogos: async () => ({ logos: [], missing: [] }) }));

import { PATCH } from "@/app/api/admin/page-sections/[slug]/route";

describe("normalizeSearchProfile", () => {
  test("missing keys take the defaults, stored empty strings stay empty", () => {
    expect(normalizeSearchProfile(undefined)).toEqual(DEFAULT_SEARCH_PROFILE);
    expect(normalizeSearchProfile({ city: "", links: ["a", 3] })).toMatchObject({
      name: "Hussain Marzooq",
      city: "",
      links: ["a"],
    });
  });

  test("shown links are kept only when they are in the list, once each", () => {
    expect(
      normalizeSearchProfile({
        links: ["https://a.test", "https://b.test"],
        shownLinks: ["https://b.test", "https://b.test", "https://gone.test", 7],
      }).shownLinks
    ).toEqual(["https://b.test"]);
    expect(normalizeSearchProfile({ links: ["https://a.test"] }).shownLinks).toEqual([]);
  });

  test("garbage falls back to defaults field by field", () => {
    expect(normalizeSearchProfile({ name: 4, image: "x" })).toEqual(DEFAULT_SEARCH_PROFILE);
    expect(normalizeSearchProfile([])).toEqual(DEFAULT_SEARCH_PROFILE);
  });
});

describe("searchProfileError", () => {
  const with_ = (patch: Partial<typeof DEFAULT_SEARCH_PROFILE>) =>
    searchProfileError({ ...DEFAULT_SEARCH_PROFILE, ...patch });

  test("the defaults and empty rows are valid", () => {
    expect(with_({})).toBeNull();
    expect(with_({ links: ["", "https://www.instagram.com/h"] })).toBeNull();
  });

  test("names the first link that is not a web address", () => {
    expect(with_({ links: ["https://a.test", "instagram.com/h"] })).toBe(
      "Profile link 2 is not a valid web address",
    );
    expect(with_({ links: ["javascript:alert(1)"] })).toBe("Profile link 1 is not a valid web address");
  });

  test("rejects a malformed email or phone, too many links and overlong text", () => {
    expect(with_({ email: "not-an-email" })).toBe("Email is not a valid address");
    expect(with_({ phone: "call me" })).toBe("Phone is not a valid number");
    expect(with_({ links: Array(21).fill("") })).toBe("Keep profile links to 20 or fewer");
    expect(with_({ jobTitle: "x".repeat(201) })).toBe("Job title is too long");
  });
});

describe("shownProfileLinks", () => {
  test("lists the shown links in the profile's order", () => {
    expect(
      shownProfileLinks({
        ...DEFAULT_SEARCH_PROFILE,
        links: ["https://a.test", "https://b.test", "https://c.test"],
        shownLinks: ["https://c.test", "https://a.test"],
      })
    ).toEqual(["https://a.test", "https://c.test"]);
  });
});

describe("publishedProfile", () => {
  test("trims, drops what is invalid and keeps the name", () => {
    expect(
      publishedProfile({
        ...DEFAULT_SEARCH_PROFILE,
        name: "",
        jobTitle: "  Photographer ",
        links: [" https://a.test ", "ftp://b.test", ""],
        email: "bad",
      }),
    ).toMatchObject({ name: "Hussain Marzooq", jobTitle: "Photographer", links: ["https://a.test"], email: "" });
  });
});

describe("PATCH /api/admin/page-sections/about", () => {
  const updateOne = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    getDb.mockResolvedValue({
      collection: () => ({ findOne: async () => null, updateOne }),
    });
  });

  function save(data: unknown) {
    return PATCH(
      new Request("https://hm.test/api/admin/page-sections/about", {
        method: "PATCH",
        body: JSON.stringify(data),
      }) as never,
      { params: Promise.resolve({ slug: "about" }) },
    );
  }

  test("refuses a bad profile link with a message naming it, before touching the database", async () => {
    const res = await save({ profile: { ...DEFAULT_SEARCH_PROFILE, links: ["instagram"] } });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Profile link 1 is not a valid web address" });
    expect(getDb).not.toHaveBeenCalled();
  });

  const rows = (linkRows: unknown) => save({ profile: { ...DEFAULT_SEARCH_PROFILE, linkRows } });
  const storedProfile = () => updateOne.mock.calls[0]![1].$set.data.profile;

  test("builds the stored links from the network rows and never stores the rows", async () => {
    const res = await rows([
      { network: "instagram", value: "@hussain.art", shown: true },
      { network: "linkedin", value: "https://www.linkedin.com/in/hussain-marzooq?trk=x", shown: false },
      { network: "other", value: "https://objkt.com/profile/hussain", shown: true },
      { network: "tiktok", value: "  ", shown: true },
    ]);
    expect(res.status).toBe(200);
    expect(storedProfile()).toMatchObject({
      links: [
        "https://www.instagram.com/hussain.art/",
        "https://www.linkedin.com/in/hussain-marzooq/",
        "https://objkt.com/profile/hussain",
      ],
      shownLinks: ["https://www.instagram.com/hussain.art/", "https://objkt.com/profile/hussain"],
    });
    expect(storedProfile()).not.toHaveProperty("linkRows");
  });

  test.each([
    ["an unknown network", [{ network: "myspace", value: "hussain" }], "Profile link 1: unknown network"],
    ["a username outside the rule", [{ network: "x", value: "a", shown: true }, { network: "x", value: "hussain-art" }], "Profile link 2: X usernames cannot contain “-”"],
    ["an oversized username", [{ network: "vimeo", value: "a".repeat(101) }], "Profile link 1: usernames are at most 100 characters"],
    ["an oversized field", [{ network: "vimeo", value: "a".repeat(100_000) }], "Profile link 1: too long"],
    ["a javascript: username", [{ network: "instagram", value: "javascript:alert(1)" }], "Profile link 1: not an Instagram address"],
    ["a javascript: address", [{ network: "other", value: "javascript:alert(1)" }], "Profile link 1: not a valid web address"],
    ["a row that is not an object", ["https://a.test"], "Profile link 1 is not valid"],
    ["rows that are not a list", { network: "x", value: "a" }, "Profile links must be a list"],
    ["21 rows", Array(21).fill({ network: "x", value: "a" }), "Keep profile links to 20 or fewer"],
  ])("refuses %s, naming it, before touching the database", async (_, linkRows, error) => {
    const res = await rows(linkRows);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error });
    expect(getDb).not.toHaveBeenCalled();
  });

  test("refuses a body that is not JSON", async () => {
    const res = await PATCH(
      new Request("https://hm.test/api/admin/page-sections/about", { method: "PATCH", body: "{profile:" }) as never,
      { params: Promise.resolve({ slug: "about" }) },
    );
    expect(res.status).toBe(400);
    expect(getDb).not.toHaveBeenCalled();
  });

  test("a valid save refreshes every public page, since each shows the profile's social links", async () => {
    const res = await save({ profile: { ...DEFAULT_SEARCH_PROFILE, links: ["https://a.test"] } });
    expect(res.status).toBe(200);
    expect(updateOne).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/", "layout");
  });
});
