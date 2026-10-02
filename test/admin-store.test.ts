// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_BUILD, KNOWN_VERSION_HEADER, MEDIA_COUNT_HEADER } from "@/lib/admin-data";

type Store = typeof import("@/lib/client/admin-store");
let store: Store;

const fetchMock = vi.fn();

type MediaItems = import("@/lib/server/admin-snapshot").AdminSnapshot["media"]["items"];

function mediaItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: `m${i}`, title: `M${i}`, createdAt: null })) as unknown as MediaItems;
}

function snapshot(inquiryNames: string[], media = 2, build = ADMIN_BUILD) {
  return {
    build,
    dashboard: { stats: { media: { total: 0 }, inquiries: { new: 0, active: 0 } }, missingImage: 0, hidden: 0 },
    notificationCount: inquiryNames.length,
    push: { publicKey: null, devices: [] },
    inquiries: inquiryNames.map((name, i) => ({ id: String(i), name, status: "new", isArchived: false })),
    testimonials: [] as { id: string; isApproved: boolean }[],
    people: [],
    services: [],
    galleries: [],
    removal: { items: [], history: [] },
    pages: { settings: {}, seo: {}, sections: {}, sectionsUpdatedAt: {} },
    media: { items: mediaItems(media), nextCursor: "next", full: {} },
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

const reply = (body: unknown, status = 200) => Promise.resolve(json(body, status));

function deferred() {
  let resolve: (value: Response) => void = () => {};
  const promise = new Promise<Response>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const tick = (ms = 2) => new Promise((r) => setTimeout(r, ms));
const snapshotCalls = () => fetchMock.mock.calls.filter(([url]) => url === "/api/admin/snapshot");
const headersOf = (call: number) => snapshotCalls()[call]![1].headers as Record<string, string>;

beforeEach(async () => {
  vi.resetModules();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  localStorage.clear();
  sessionStorage.clear();
  store = await import("@/lib/client/admin-store");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const data = () => store.getAdminData() as unknown as ReturnType<typeof snapshot> | null;
const names = () => data()?.inquiries.map((i) => i.name);

async function loaded(inquiryNames = ["Ada"], media = 2) {
  fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(inquiryNames, media) }));
  await store.refreshAdminData();
  await tick();
}

describe("admin data on the phone", () => {
  it("loads everything once and then asks only whether it changed", async () => {
    await loaded();
    expect(names()).toEqual(["Ada"]);

    fetchMock.mockImplementationOnce(() => reply({ ok: true, unchanged: true, version: "v1" }));
    await store.refreshAdminData();
    expect(headersOf(1)[KNOWN_VERSION_HEADER]).toBe("v1");
    expect(names()).toEqual(["Ada"]);
  });

  it("replaces only what changed elsewhere, keeping everything else the same objects", async () => {
    await loaded(["Ada"]);
    const before = data()!;
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v2", data: snapshot(["Ada", "Grace"]) }));
    await store.refreshAdminData();
    expect(names()).toEqual(["Ada", "Grace"]);
    expect(data()!.inquiries[0]).toBe(before.inquiries[0]);
    expect(data()!.media).toBe(before.media);
    expect(data()!.pages).toBe(before.pages);
  });

  it("never sends two checks at once: a plain check joins the one in flight", async () => {
    const first = deferred();
    fetchMock.mockImplementationOnce(() => first.promise);
    const a = store.refreshAdminData();
    const b = store.refreshAdminData();
    first.resolve(json({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await Promise.all([a, b]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("runs one more check, after the one in flight, when told something changed", async () => {
    const first = deferred();
    fetchMock.mockImplementationOnce(() => first.promise);
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v2", data: snapshot(["Grace"]) }));

    const a = store.refreshAdminData();
    const b = store.refreshAdminData({ changed: true });
    const c = store.refreshAdminData({ changed: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    first.resolve(json({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await Promise.all([a, b, c]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(names()).toEqual(["Grace"]);
  });

  it("throws away an answer that started before a change written here, and asks again", async () => {
    await loaded(["Ada", "Grace"]);

    const stale = deferred();
    fetchMock.mockImplementationOnce(() => stale.promise);
    const running = store.refreshAdminData();
    await tick(5);

    fetchMock.mockImplementationOnce(() => reply({ ok: true }));
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v3", data: snapshot(["Grace"]) }));
    await store.adminWrite("/api/inquiries/0", { method: "DELETE" }, ["inquiries"]);
    stale.resolve(json({ ok: true, version: "v2", data: snapshot(["Ada", "Grace"]) }));
    await running;

    expect(snapshotCalls()).toHaveLength(3);
    expect(names()).toEqual(["Grace"]);
  });

  it("runs exactly one check per change, and keeps the version so an unchanged answer stays small", async () => {
    await loaded();
    fetchMock.mockImplementationOnce(() => reply({ ok: true }));
    fetchMock.mockImplementationOnce(() => reply({ ok: true, unchanged: true, version: "v1" }));
    await store.adminWrite("/api/media-tags/x", { method: "PATCH" }, ["mediaTags"]);
    await store.refreshAdminData();
    await tick(5);
    expect(snapshotCalls()).toHaveLength(2);
    expect(headersOf(1)[KNOWN_VERSION_HEADER]).toBe("v1");
  });

  it("does not start a check for a request that changes no data", async () => {
    await loaded();
    fetchMock.mockImplementationOnce(() => reply({ ok: true }));
    await store.adminWrite("/api/admin/push/test", { method: "POST" }, []);
    await tick(5);
    expect(snapshotCalls()).toHaveLength(1);
  });

  it("asks for everything again after the phone's copy was changed here", async () => {
    await loaded();
    store.setAdminSlice("inquiries", []);
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v2", data: snapshot([]) }));
    await store.refreshAdminData();
    expect(headersOf(1)[KNOWN_VERSION_HEADER]).toBeUndefined();
  });
});

describe("media pages on the phone", () => {
  it("asks for as many media items as the phone is showing, so every check covers them", async () => {
    await loaded(["Ada"], 60);
    expect(headersOf(0)[MEDIA_COUNT_HEADER]).toBe("60");

    store.appendAdminMedia({ items: mediaItems(120).slice(60), nextCursor: "later", full: {} });
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v2", data: snapshot(["Ada"], 120) }));
    await store.refreshAdminData();
    expect(headersOf(1)[MEDIA_COUNT_HEADER]).toBe("120");
    expect(data()!.media.items).toHaveLength(120);
  });

  it("asks again when Load more finished while a check for fewer items was out", async () => {
    await loaded(["Ada"], 60);
    const stale = deferred();
    fetchMock.mockImplementationOnce(() => stale.promise);
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v3", data: snapshot(["Ada"], 120) }));
    const running = store.refreshAdminData();
    store.appendAdminMedia({ items: mediaItems(120).slice(60), nextCursor: null, full: {} });
    stale.resolve(json({ ok: true, version: "v2", data: snapshot(["Ada"], 60) }));
    await running;
    expect(headersOf(2)[MEDIA_COUNT_HEADER]).toBe("120");
    expect(data()!.media.items).toHaveLength(120);
  });

  it("never asks for more than 300, and does not loop when more are shown", async () => {
    await loaded(["Ada"], 300);
    store.appendAdminMedia({ items: mediaItems(360).slice(300), nextCursor: null, full: {} });
    fetchMock.mockImplementationOnce(() => reply({ ok: true, unchanged: true, version: "v1" }));
    await store.refreshAdminData();
    expect(snapshotCalls()).toHaveLength(2);
    expect(headersOf(1)[MEDIA_COUNT_HEADER]).toBe("300");
  });

  it("Load more is not a change: it holds no screen", async () => {
    await loaded();
    store.appendAdminMedia({ items: mediaItems(4).slice(2), nextCursor: null, full: {} });
    expect(store.screenHeld(store.getAdminChanges(), ["inquiries"])).toBe(false);
    expect(store.screenHeld(store.getAdminChanges(), ["media"])).toBe(false);
  });
});

describe("what stays on the phone", () => {
  it("keeps only the dashboard numbers, tagged with the build, and forgets them on logout", async () => {
    await loaded();
    const saved = JSON.parse(localStorage.getItem("hm.admin.preview") ?? "{}");
    expect(saved.build).toBe(ADMIN_BUILD);
    expect(Object.keys(saved.value).sort()).toEqual(["dashboard", "notificationCount", "push"]);
    expect(JSON.stringify(saved)).not.toContain("Ada");

    store.forgetAdminData();
    expect(localStorage.getItem("hm.admin.preview")).toBeNull();
    expect(store.getAdminData()).toBeNull();
  });

  it("ignores numbers saved by another build", async () => {
    localStorage.setItem("hm.admin.preview", JSON.stringify({ build: "older", value: { notificationCount: 9 } }));
    expect(store.getAdminPreview()).toBeNull();
  });

  it("counts what needs attention from the lists on the phone, so the badge follows a change at once", async () => {
    const withReview = { ...snapshot(["Ada", "Grace"]), testimonials: [{ id: "t", isApproved: false }] };
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: withReview }));
    await store.refreshAdminData();
    expect(store.getAdminPreview()?.notificationCount).toBe(3);

    store.setAdminSlice("testimonials", (items) => items.map((item) => ({ ...item, isApproved: true })));
    expect(store.getAdminPreview()?.notificationCount).toBe(2);
    expect(store.getAdminPreview()?.dashboard.stats.testimonials).toEqual({ total: 1, pending: 0 });
    expect(JSON.parse(localStorage.getItem("hm.admin.preview") ?? "{}").value.notificationCount).toBe(2);
  });

  it("does not count an archived inquiry as new", async () => {
    const archived = snapshot(["Ada", "Grace"]);
    archived.inquiries[1]!.isArchived = true;
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: archived }));
    await store.refreshAdminData();
    expect(store.getAdminPreview()?.notificationCount).toBe(1);
    expect(store.getAdminPreview()?.dashboard.stats.inquiries).toEqual({ new: 1, active: 1 });
  });
});

describe("after a deploy", () => {
  it("reloads once when the server runs a different build, and only once", async () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    fetchMock.mockImplementation(() => reply({ ok: true, version: "v9", data: snapshot(["Ada"], 2, "newer") }));
    await store.refreshAdminData();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(store.getAdminData()).toBeNull();

    await store.refreshAdminData();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(names()).toEqual(["Ada"]);
  });
});

describe("holding a screen until a change written here is confirmed", () => {
  it("holds only screens that show data the change touched", async () => {
    await loaded();
    fetchMock.mockImplementation(() => new Promise(() => {}));
    void store.adminWrite("/api/private-galleries/g", { method: "PATCH" }, ["galleries", "media"]);
    await tick();
    const changes = store.getAdminChanges();
    expect(store.screenHeld(changes, ["media"])).toBe(true);
    expect(store.screenHeld(changes, ["testimonials"])).toBe(false);
  });

  it("does not hold the list the change's own reply already updated", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    fetchMock.mockImplementationOnce(() => reply({ ok: true }));
    fetchMock.mockImplementation(() => new Promise(() => {}));
    await store.adminWrite("/api/inquiries/0", { method: "PATCH" }, ["inquiries", "services"]);
    store.setAdminSlice("inquiries", (items) => items.slice(1));
    const changes = store.getAdminChanges();
    expect(store.screenHeld(changes, ["inquiries"])).toBe(false);
    expect(store.screenHeld(changes, ["services"])).toBe(true);
  });

  it("releases the hold when the confirming check answers", async () => {
    await loaded();
    const check = deferred();
    fetchMock.mockImplementationOnce(() => reply({ ok: true }));
    fetchMock.mockImplementationOnce(() => check.promise);
    await store.adminWrite("/api/inquiries/0", { method: "PATCH" }, ["inquiries"]);
    expect(store.screenHeld(store.getAdminChanges(), ["inquiries"])).toBe(true);
    check.resolve(json({ ok: true, version: "v2", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    expect(store.screenHeld(store.getAdminChanges(), ["inquiries"])).toBe(false);
  });

  it("lets a held screen open when the check fails, showing what the phone has", async () => {
    await loaded();
    fetchMock.mockImplementationOnce(() => reply({ ok: true }));
    fetchMock.mockImplementation(() => Promise.reject(new Error("offline")));
    await store.adminWrite("/api/inquiries/0", { method: "PATCH" }, ["inquiries"]);
    await store.refreshAdminData();
    expect(store.screenHeld(store.getAdminChanges(), ["inquiries"])).toBe(false);
    expect(names()).toEqual(["Ada"]);
  });
});

describe("loading and signing in", () => {
  it("holds background work until the data has loaded", async () => {
    const first = deferred();
    fetchMock.mockImplementationOnce(() => first.promise);
    const loading = store.refreshAdminData();
    const order: string[] = [];
    const task = store.runAfterAdminData(async () => {
      order.push("task");
    });
    await tick(5);
    expect(order).toEqual([]);
    first.resolve(json({ ok: true, version: "v1", data: snapshot([]) }));
    await loading;
    await task;
    expect(order).toEqual(["task"]);
  });

  it("reports a failure only when there is nothing to show, in plain words", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: false, error: "Database is down." }, 500));
    await store.refreshAdminData();
    expect(store.getAdminDataFailure()).toBe("Database is down.");

    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError("Load failed")));
    await store.refreshAdminData();
    expect(store.getAdminDataFailure()).toBe("No connection.");

    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    expect(store.getAdminDataFailure()).toBeNull();

    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError("Load failed")));
    await store.refreshAdminData();
    expect(store.getAdminDataFailure()).toBeNull();
    expect(names()).toEqual(["Ada"]);
  });

  it("sends a signed-out visitor with nothing on screen to sign in, remembering where they were", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, origin: "https://hussain-marzooq.com", pathname: "/admin/inquiries", search: "", assign });
    fetchMock.mockImplementationOnce(() => reply({ ok: false, error: "Unauthorized" }, 401));
    await store.refreshAdminData();
    expect(assign).toHaveBeenCalledWith("https://hussain-marzooq.com/admin/sign-in?next=%2Fadmin%2Finquiries");
  });

  it("never bounces between a screen and sign-in: a second sign-out within a minute stays put", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, origin: "https://hussain-marzooq.com", pathname: "/admin/inquiries", search: "", assign });
    fetchMock.mockImplementation(() => reply({ ok: false, error: "Unauthorized" }, 401));
    await store.refreshAdminData();
    await store.refreshAdminData();
    expect(assign).toHaveBeenCalledTimes(1);
    expect(store.getAdminSignedOut()).toBe(true);
  });

  it("never navigates away from a screen with data: retries once, then shows it is signed out", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, origin: "https://hussain-marzooq.com", pathname: "/admin/inquiries", search: "", assign });
    await loaded();

    fetchMock.mockImplementationOnce(() => reply({ ok: false, error: "Unauthorized" }, 401));
    fetchMock.mockImplementationOnce(() => reply({ ok: true, unchanged: true, version: "v1" }));
    await store.refreshAdminData();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(store.getAdminSignedOut()).toBe(false);

    fetchMock.mockImplementation(() => reply({ ok: false, error: "Unauthorized" }, 401));
    await store.refreshAdminData();
    expect(store.getAdminSignedOut()).toBe(true);
    expect(assign).not.toHaveBeenCalled();
    expect(names()).toEqual(["Ada"]);
  });
});
