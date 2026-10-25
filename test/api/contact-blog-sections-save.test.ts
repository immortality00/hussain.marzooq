import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthedServer: async () => true }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("@/lib/server/cloudinary-assets", () => ({ deleteManagedCloudinaryAsset: vi.fn() }));

import { PATCH } from "@/app/api/admin/page-sections/[slug]/route";
import { DEFAULT_SUBSCRIBE_COPY } from "@/lib/blog-subscribe-copy";

const save = (slug: string, data: unknown) =>
  PATCH(
    new NextRequest(`http://localhost/api/admin/page-sections/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ slug }) }
  );

const stored = (slug: string) => memory.collections.page_sections!.find((doc) => doc.slug === slug)?.data;

beforeEach(() => {
  vi.clearAllMocks();
  resetMemoryDb({ page_sections: [] });
});

describe("saving the Contact email list", () => {
  test("stores the checked list and heading, and refreshes every public page for the footer", async () => {
    const res = await save("contact", {
      heading: " Write to me ",
      emails: [
        { label: "Inquiries", address: "Inquiries@hussain.art", shown: true },
        { label: "", address: "@hussain.art", shown: true },
        { label: "Press", address: "press@hussain.art", shown: false },
      ],
      extra: "dropped",
    });

    expect(res.status).toBe(200);
    expect(stored("contact")).toEqual({
      heading: "Write to me",
      emails: [
        { label: "Inquiries", address: "inquiries@hussain.art", shown: true },
        { label: "Press", address: "press@hussain.art", shown: false },
      ],
    });
    expect((await res.json()).item.data.emails).toHaveLength(2);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  test.each([
    ["an address on another domain", { emails: [{ label: "Me", address: "me@gmail.com", shown: true }] }, "Email 1: only @hussain.art addresses can be listed."],
    ["a heading that is not text", { heading: ["x"], emails: [] }, "The heading must be text."],
    ["a long heading", { heading: "x".repeat(121), emails: [] }, "The heading is over 120 characters."],
    ["a list that is not a list", { emails: { a: 1 } }, "The email list must be a list."],
  ])("refuses %s and saves nothing", async (_, data, error) => {
    const res = await save("contact", data);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error });
    expect(stored("contact")).toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("an empty list is kept empty", async () => {
    expect((await save("contact", { heading: "", emails: [] })).status).toBe(200);
    expect(stored("contact")).toEqual({ heading: "", emails: [] });
  });
});

describe("saving the blog's subscribe wording", () => {
  const stickyCta = { title: "Ready?", description: "Book.", buttonLabel: "Book" };

  test("stores the wording trimmed beside the booking bar", async () => {
    const subscribe = { heading: " Letters. ", text: "New work.", buttonLabel: "Sign up", confirmation: "Check it." };
    expect((await save("blog", { subscribe, stickyCta })).status).toBe(200);
    expect(stored("blog")).toEqual({ subscribe: { ...subscribe, heading: "Letters." }, stickyCta });
  });

  test("refuses a field that is too long", async () => {
    const res = await save("blog", { subscribe: { ...DEFAULT_SUBSCRIBE_COPY, buttonLabel: "x".repeat(41) }, stickyCta });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Subscribe button label is over 40 characters." });
  });

  test("a blog doc saved before the wording existed reads the defaults", async () => {
    resetMemoryDb({ page_sections: [{ slug: "blog", data: { stickyCta } }] });
    const res = await save("blog", { stickyCta });
    expect((await res.json()).item.data.subscribe).toEqual(DEFAULT_SUBSCRIBE_COPY);
  });
});
