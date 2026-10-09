import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  DEFAULT_SEARCH_PROFILE,
  normalizeSearchProfile,
  publishedProfile,
  searchProfileError,
} from "@/lib/seo/search-profile";

const { getDb, revalidatePath } = vi.hoisted(() => ({ getDb: vi.fn(), revalidatePath: vi.fn() }));

vi.mock("@/lib/auth/admin", () => ({ isAdminAuthedServer: async () => true }));
vi.mock("@/lib/server/db", () => ({ getDb }));
vi.mock("next/cache", () => ({ revalidatePath }));

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

  test("a valid save refreshes /about, the homepage and every service page", async () => {
    const res = await save({ profile: { ...DEFAULT_SEARCH_PROFILE, links: ["https://a.test"] } });
    expect(res.status).toBe(200);
    expect(updateOne).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith("/(site)/about", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/(site)/services/[slug]", "page");
  });
});
