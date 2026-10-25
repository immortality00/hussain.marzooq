import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type Result = { data: unknown; error: null } | { data: null; error: { name: string; message: string } };
const ok = (data: unknown): Result => ({ data, error: null });
const no = (message: string): Result => ({ data: null, error: { name: "validation_error", message } });

const api = vi.hoisted(() => ({
  keys: [] as string[],
  segmentsList: vi.fn<() => Promise<Result>>(),
  segmentsCreate: vi.fn<(p: { name: string }) => Promise<Result>>(),
  contactsCreate: vi.fn<(p: Record<string, unknown>) => Promise<Result>>(),
  contactsUpdate: vi.fn<(p: Record<string, unknown>) => Promise<Result>>(),
  contactSegmentsList: vi.fn<(p: Record<string, unknown>) => Promise<Result>>(),
  contactSegmentsAdd: vi.fn<(p: Record<string, unknown>) => Promise<Result>>(),
  broadcastsList: vi.fn<(p: Record<string, unknown>) => Promise<Result>>(),
  broadcastsCreate: vi.fn<(p: Record<string, unknown>) => Promise<Result>>(),
}));

vi.mock("resend", () => ({
  Resend: class {
    constructor(key: string) {
      api.keys.push(key);
    }
    emails = { send: vi.fn() };
    segments = { list: api.segmentsList, create: api.segmentsCreate };
    contacts = {
      create: api.contactsCreate,
      update: api.contactsUpdate,
      segments: { list: api.contactSegmentsList, add: api.contactSegmentsAdd },
    };
    broadcasts = { list: api.broadcastsList, create: api.broadcastsCreate };
  },
}));
vi.mock("@/lib/server/get-base-url", () => ({ getBaseUrl: async () => "https://hussain.art" }));

const content = { subject: "Light", previewText: "Notes", html: "<p>x</p>", text: "x" };

async function load() {
  vi.resetModules();
  return import("@/lib/server/blog-subscribers");
}

beforeEach(() => {
  api.keys.length = 0;
  vi.stubEnv("RESEND_DOMAIN", "hussain.art");
  vi.stubEnv("RESEND_AUDIENCE_KEY", "re_full_access");
  api.segmentsList.mockResolvedValue(ok({ data: [{ id: "seg_blog", name: "Blog subscribers" }] }));
  api.contactsCreate.mockResolvedValue(ok({ id: "c_1" }));
  api.broadcastsList.mockResolvedValue(ok({ data: [] }));
  api.broadcastsCreate.mockResolvedValue(ok({ id: "bc_1" }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("subscriptionsReady", () => {
  test("needs the Full-access key and press@ on the verified domain", async () => {
    expect((await load()).subscriptionsReady()).toBe(true);
    vi.stubEnv("RESEND_AUDIENCE_KEY", " ");
    expect((await load()).subscriptionsReady()).toBe(false);
    vi.stubEnv("RESEND_AUDIENCE_KEY", "re_full_access");
    vi.stubEnv("RESEND_DOMAIN", "");
    expect((await load()).subscriptionsReady()).toBe(false);
  });
});

describe("addSubscriber", () => {
  test("creates the contact in the blog segment, using the Full-access key", async () => {
    await (await load()).addSubscriber("reader@example.com");
    expect(api.keys).toContain("re_full_access");
    expect(api.contactsCreate).toHaveBeenCalledWith({
      email: "reader@example.com",
      unsubscribed: false,
      segments: [{ id: "seg_blog" }],
    });
    expect(api.segmentsCreate).not.toHaveBeenCalled();
  });

  test("creates the segment the first time, then reuses it", async () => {
    api.segmentsList.mockResolvedValue(ok({ data: [{ id: "seg_general", name: "General" }] }));
    api.segmentsCreate.mockResolvedValue(ok({ id: "seg_new" }));
    const subscribers = await load();
    await subscribers.addSubscriber("a@example.com");
    await subscribers.addSubscriber("b@example.com");
    expect(api.segmentsCreate).toHaveBeenCalledTimes(1);
    expect(api.segmentsCreate).toHaveBeenCalledWith({ name: "Blog subscribers" });
    expect(api.contactsCreate).toHaveBeenLastCalledWith(expect.objectContaining({ segments: [{ id: "seg_new" }] }));
  });

  test("an existing contact who confirms again is subscribed again and put in the segment", async () => {
    api.contactsCreate.mockResolvedValue(no("Contact already exists"));
    api.contactsUpdate.mockResolvedValue(ok({ id: "c_1" }));
    api.contactSegmentsList.mockResolvedValue(ok({ data: [] }));
    api.contactSegmentsAdd.mockResolvedValue(ok({ id: "seg_blog" }));
    await (await load()).addSubscriber("reader@example.com");
    expect(api.contactsUpdate).toHaveBeenCalledWith({ email: "reader@example.com", unsubscribed: false });
    expect(api.contactSegmentsAdd).toHaveBeenCalledWith({ email: "reader@example.com", segmentId: "seg_blog" });
  });

  test("throws Resend's own reason when the contact cannot be added", async () => {
    api.contactsCreate.mockResolvedValue(no("Invalid email"));
    api.contactsUpdate.mockResolvedValue(no("Contact not found"));
    await expect((await load()).addSubscriber("reader@example.com")).rejects.toThrow(
      "Resend refused to add the subscriber: Invalid email"
    );
  });
});

describe("sendPostBroadcast", () => {
  test("sends to the blog segment from press@, named after the post", async () => {
    const id = await (await load()).sendPostBroadcast("post1", content);
    expect(id).toBe("bc_1");
    expect(api.broadcastsCreate).toHaveBeenCalledWith({
      name: "blog-post:post1",
      segmentId: "seg_blog",
      from: "Hussain.Art <press@hussain.art>",
      subject: "Light",
      previewText: "Notes",
      html: "<p>x</p>",
      text: "x",
      send: true,
    });
  });

  test("never sends a post twice: a broadcast already out under its name is returned", async () => {
    api.broadcastsList.mockResolvedValue(
      ok({ data: [{ id: "bc_draft", name: "blog-post:post1", status: "draft" }, { id: "bc_old", name: "blog-post:post1", status: "sent" }] })
    );
    expect(await (await load()).sendPostBroadcast("post1", content)).toBe("bc_old");
    expect(api.broadcastsCreate).not.toHaveBeenCalled();
  });

  test("throws Resend's reason when the send is refused", async () => {
    api.broadcastsCreate.mockResolvedValue(no("You have reached your contacts quota."));
    await expect((await load()).sendPostBroadcast("post1", content)).rejects.toThrow(
      "Resend refused to send the post: You have reached your contacts quota."
    );
  });
});
