import { ObjectId } from "mongodb";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const mocks = vi.hoisted(() => ({
  sendPostBroadcast: vi.fn<(postId: string, content: { subject: string; html: string }) => Promise<string>>(async () => "bc_1"),
  subscriptionsReady: vi.fn(() => true),
  getBlogActive: vi.fn(async () => true),
}));

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/blog-subscribers", () => ({
  sendPostBroadcast: mocks.sendPostBroadcast,
  subscriptionsReady: mocks.subscriptionsReady,
}));
vi.mock("@/lib/server/page-settings", () => ({ getBlogActive: mocks.getBlogActive }));

import { POST as notify } from "@/app/api/blog/[id]/notify/route";

const id = new ObjectId();
const UPDATED = new Date("2026-10-20T08:00:00Z");

function seed(overrides: Record<string, unknown> = {}) {
  resetMemoryDb({
    blog_posts: [
      {
        _id: id,
        title: "Light that holds",
        slug: "light-that-holds",
        excerpt: "Notes from a night shoot.",
        content: "",
        coverImageUrl: "",
        isPublished: true,
        publishedAt: new Date("2026-10-20T08:00:00Z"),
        updatedAt: UPDATED,
        ...overrides,
      },
    ],
    blog_categories: [],
  });
}

const send = () => notify(new Request("https://hussain.art/api/x", { method: "POST" }), { params: Promise.resolve({ id: String(id) }) });
const stored = () => memory.collections.blog_posts?.[0];

beforeEach(() => seed());
afterEach(() => vi.clearAllMocks());

describe("POST /api/blog/[id]/notify", () => {
  test("sends the post once and records when, leaving updatedAt alone", async () => {
    const res = await send();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.item.notifiedAt).toEqual(expect.any(String));
    expect(mocks.sendPostBroadcast).toHaveBeenCalledWith(
      String(id),
      expect.objectContaining({ subject: "Light that holds" })
    );
    expect(stored()).toMatchObject({ broadcastId: "bc_1", updatedAt: UPDATED });
    expect(stored()?.notifiedAt).toBeInstanceOf(Date);

    const again = await send();
    expect(again.status).toBe(409);
    expect((await again.json()).error).toBe("Already sent to subscribers.");
    expect(mocks.sendPostBroadcast).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["a draft", { isPublished: false, publishedAt: null }],
    ["a post published in the future", { publishedAt: new Date(Date.now() + 60 * 60_000) }],
  ])("refuses %s", async (_label, overrides) => {
    seed(overrides);
    const res = await send();
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("Not sent: the post isn't published.");
    expect(mocks.sendPostBroadcast).not.toHaveBeenCalled();
  });

  test("refuses while the blog is off — the email's link would lead home", async () => {
    mocks.getBlogActive.mockResolvedValueOnce(false);
    expect((await send()).status).toBe(409);
    expect(mocks.sendPostBroadcast).not.toHaveBeenCalled();
  });

  test("refuses when the Resend setup is missing", async () => {
    mocks.subscriptionsReady.mockReturnValueOnce(false);
    expect((await send()).status).toBe(503);
  });

  test("a refused send names Resend's reason and can be tried again", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.sendPostBroadcast.mockRejectedValueOnce(new Error("Resend refused to send the post: quota"));
    const res = await send();
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("Not sent: Resend refused to send the post: quota");
    expect(stored()?.notifiedAt).toBeNull();
    expect((await send()).status).toBe(200);
  });

  test("an unknown post is a 404", async () => {
    resetMemoryDb({ blog_posts: [] });
    expect((await send()).status).toBe(404);
  });
});
