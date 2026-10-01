// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KNOWN_VERSION_HEADER } from "@/lib/admin-data";

type Store = typeof import("@/lib/client/admin-store");
let store: Store;

const fetchMock = vi.fn();

function snapshot(inquiryNames: string[]) {
  return {
    dashboard: { stats: { media: { total: 0 }, inquiries: { total: 0, new: 0, active: 0 } }, missingImage: 0, hidden: 0 },
    notificationCount: inquiryNames.length,
    push: { publicKey: null, devices: [] },
    inquiries: inquiryNames.map((name, i) => ({ id: String(i), name, status: "new" })),
    testimonials: [] as { id: string; isApproved: boolean }[],
    people: [],
    services: [],
    galleries: [],
    removal: { items: [], history: [] },
    pages: { settings: {}, seo: {}, sections: {} },
    media: { items: [], nextCursor: null, full: {} },
  };
}

function reply(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
}

function deferred() {
  let resolve: (value: Response) => void = () => {};
  const promise = new Promise<Response>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

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

const names = () => (store.getAdminData() as unknown as ReturnType<typeof snapshot> | null)?.inquiries.map((i) => i.name);

describe("admin data on the phone", () => {
  it("loads everything once and then asks only whether it changed", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    expect(names()).toEqual(["Ada"]);

    fetchMock.mockImplementationOnce(() => reply({ ok: true, unchanged: true, version: "v1" }));
    await store.refreshAdminData();
    expect(fetchMock.mock.calls[1][1].headers[KNOWN_VERSION_HEADER]).toBe("v1");
    expect(names()).toEqual(["Ada"]);
  });

  it("replaces the data when something changed elsewhere", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v2", data: snapshot(["Ada", "Grace"]) }));
    await store.refreshAdminData();
    expect(names()).toEqual(["Ada", "Grace"]);
  });

  it("never sends two checks at once: a plain check joins the one in flight", async () => {
    const first = deferred();
    fetchMock.mockImplementationOnce(() => first.promise);
    const a = store.refreshAdminData();
    const b = store.refreshAdminData();
    first.resolve(new Response(JSON.stringify({ ok: true, version: "v1", data: snapshot(["Ada"]) })));
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

    first.resolve(new Response(JSON.stringify({ ok: true, version: "v1", data: snapshot(["Ada"]) })));
    await Promise.all([a, b, c]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(names()).toEqual(["Grace"]);
  });

  it("throws away an answer that started before a change made here, and asks again", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada", "Grace"]) }));
    await store.refreshAdminData();

    const stale = deferred();
    fetchMock.mockImplementationOnce(() => stale.promise);
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v3", data: snapshot(["Grace"]) }));

    const running = store.refreshAdminData();
    await new Promise((r) => setTimeout(r, 5));
    store.setAdminSlice("inquiries", (items) => items.filter((item) => item.name !== "Ada"));
    stale.resolve(new Response(JSON.stringify({ ok: true, version: "v2", data: snapshot(["Ada", "Grace"]) })));
    await running;

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(names()).toEqual(["Grace"]);
  });

  it("asks for everything again after a change made here", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    store.setAdminSlice("inquiries", []);
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v2", data: snapshot([]) }));
    await store.refreshAdminData();
    expect(fetchMock.mock.calls[1][1].headers).toBeUndefined();
  });

  it("keeps only the dashboard numbers on the phone, and forgets them on logout", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    const saved = JSON.parse(localStorage.getItem("hm.admin.preview") ?? "{}");
    expect(Object.keys(saved).sort()).toEqual(["dashboard", "notificationCount", "push"]);
    expect(JSON.stringify(saved)).not.toContain("Ada");

    store.forgetAdminData();
    expect(localStorage.getItem("hm.admin.preview")).toBeNull();
    expect(store.getAdminData()).toBeNull();
  });

  it("counts what needs attention from the lists on the phone, so the badge follows a change at once", async () => {
    const data = { ...snapshot(["Ada", "Grace"]), testimonials: [{ id: "t", isApproved: false }] };
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data }));
    await store.refreshAdminData();
    expect(store.getAdminPreview()?.notificationCount).toBe(3);

    store.setAdminSlice("testimonials", (items) => items.map((item) => ({ ...item, isApproved: true })));
    expect(store.getAdminPreview()?.notificationCount).toBe(2);
    expect(store.getAdminPreview()?.dashboard.stats.testimonials).toEqual({ total: 1, pending: 0 });
    expect(JSON.parse(localStorage.getItem("hm.admin.preview") ?? "{}").notificationCount).toBe(2);
  });

  it("holds a newly opened screen until the check for a change made here has answered", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    const held = (reads?: Parameters<typeof store.screenHeld>[1]) => store.screenHeld(store.getAdminChanges(), reads);
    expect(held()).toBe(false);

    await new Promise((r) => setTimeout(r, 2));
    const check = deferred();
    fetchMock.mockImplementationOnce(() => check.promise);
    store.markAdminDataChanged();
    expect(held()).toBe(true);
    expect(held(["inquiries"])).toBe(true);
    check.resolve(new Response(JSON.stringify({ ok: true, version: "v2", data: snapshot(["Ada"]) })));
    await store.refreshAdminData();
    expect(held()).toBe(false);
  });

  it("does not hold the list a change was applied to, only the screens it may have touched", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    await new Promise((r) => setTimeout(r, 2));
    fetchMock.mockImplementation(() => new Promise(() => {}));

    store.setAdminSlice("inquiries", (items) => items.slice(1));
    store.markAdminDataChanged();
    const changes = store.getAdminChanges();
    expect(store.screenHeld(changes, ["inquiries"])).toBe(false);
    expect(store.screenHeld(changes, ["inquiries", "services"])).toBe(true);
    expect(store.screenHeld(changes)).toBe(true);

    store.setAdminSlice("people", []);
    expect(store.screenHeld(store.getAdminChanges(), ["people"])).toBe(true);
  });

  it("lets a held screen open when the check fails, showing what the phone has", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    await new Promise((r) => setTimeout(r, 2));
    fetchMock.mockImplementation(() => Promise.reject(new Error("offline")));
    store.markAdminDataChanged();
    await store.refreshAdminData();
    expect(store.screenHeld(store.getAdminChanges())).toBe(false);
    expect(names()).toEqual(["Ada"]);
  });

  it("holds background work until the data has loaded", async () => {
    const first = deferred();
    fetchMock.mockImplementationOnce(() => first.promise);
    const loading = store.refreshAdminData();
    const order: string[] = [];
    const task = store.runAfterAdminData(async () => {
      order.push("task");
    });
    await new Promise((r) => setTimeout(r, 5));
    expect(order).toEqual([]);
    first.resolve(new Response(JSON.stringify({ ok: true, version: "v1", data: snapshot([]) })));
    await loading;
    await task;
    expect(order).toEqual(["task"]);
  });

  it("reports a failure only when there is nothing to show", async () => {
    fetchMock.mockImplementationOnce(() => reply({ ok: false, error: "Database is down." }, 500));
    await store.refreshAdminData();
    expect(store.getAdminDataFailure()).toBe("Database is down.");

    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();
    expect(store.getAdminDataFailure()).toBeNull();

    fetchMock.mockImplementationOnce(() => Promise.reject(new Error("offline")));
    await store.refreshAdminData();
    expect(store.getAdminDataFailure()).toBeNull();
    expect(names()).toEqual(["Ada"]);
  });

  it("sends a signed-out visitor with nothing on screen to sign in, remembering where they were", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, origin: "https://hussain-marzooq.com", pathname: "/admin/inquiries", search: "", assign });
    fetchMock.mockImplementationOnce(() => reply({ ok: false, error: "Unauthorized" }, 401));
    await store.refreshAdminData();
    expect(assign).toHaveBeenCalledWith("https://hussain-marzooq.com/admin?next=%2Fadmin%2Finquiries");
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
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
    await store.refreshAdminData();

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
