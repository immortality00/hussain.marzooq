// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deferred, json, reply, snapshot, tick } from "./support/admin-snapshot";

type Store = typeof import("@/lib/client/admin-store");
let store: Store;

const fetchMock = vi.fn();
const snapshotCalls = () => fetchMock.mock.calls.filter(([url]) => url === "/api/admin/snapshot");

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

async function loaded() {
  fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v1", data: snapshot(["Ada"]) }));
  await store.refreshAdminData();
  await tick();
}

describe("pull to refresh in the admin", () => {
  it("asks the server again even while a check is under way", async () => {
    await loaded();
    const first = deferred();
    fetchMock.mockImplementationOnce(() => first.promise);
    void store.refreshAdminData();
    fetchMock.mockImplementationOnce(() => reply({ ok: true, unchanged: true, version: "v1" }));
    const pulled = store.pullAdminData();
    first.resolve(json({ ok: true, unchanged: true, version: "v1" }));
    await pulled;
    expect(snapshotCalls()).toHaveLength(3);
  });

  it("with nothing new, still has every screen reload what it keeps outside the shared data", async () => {
    await loaded();
    const before = store.getAdminDataGeneration();
    fetchMock.mockImplementationOnce(() => reply({ ok: true, unchanged: true, version: "v1" }));
    expect(await store.pullAdminData()).toBeNull();
    expect(store.getAdminDataGeneration()).toBe(before + 1);
  });

  it("with something new, the screens reload once, for the change", async () => {
    await loaded();
    const before = store.getAdminDataGeneration();
    fetchMock.mockImplementationOnce(() => reply({ ok: true, version: "v2", data: snapshot(["Ada", "Grace"]) }));
    await store.pullAdminData();
    expect(store.getAdminDataGeneration()).toBe(before + 1);
    expect(store.getAdminData()?.inquiries).toHaveLength(2);
  });

  it("is done only once the screens' own reloads are in", async () => {
    await loaded();
    const reload = deferred();
    const unsubscribe = store.subscribeAdminData(() => store.trackAdminReload(reload.promise));
    fetchMock.mockImplementationOnce(() => reply({ ok: true, unchanged: true, version: "v1" }));
    let done = false;
    const pulled = store.pullAdminData().then(() => {
      done = true;
    });
    await tick(20);
    expect(done).toBe(false);
    reload.resolve(json({}));
    await pulled;
    expect(done).toBe(true);
    unsubscribe();
  });

  it("says why the check failed when there is data on screen to keep", async () => {
    await loaded();
    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError("Load failed")));
    expect(await store.pullAdminData()).toBe("No connection.");
    fetchMock.mockImplementationOnce(() => reply({ ok: false, error: "The site's database isn't responding." }, 503));
    expect(await store.pullAdminData()).toBe("The site's database isn't responding.");
    expect(store.getAdminData()?.inquiries).toHaveLength(1);
  });

  it("leaves the reason to the screen when it has nothing to show", async () => {
    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError("Load failed")));
    expect(await store.pullAdminData()).toBeNull();
    expect(store.getAdminDataFailure()).toBe("No connection.");
  });

  it("says nothing more once signed out (the Signed out notice does)", async () => {
    await loaded();
    fetchMock.mockImplementation(() => reply({ ok: false }, 401));
    expect(await store.pullAdminData()).toBeNull();
    expect(store.getAdminSignedOut()).toBe(true);
  });
});
