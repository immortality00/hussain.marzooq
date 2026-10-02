import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { adminWrite, forgetAdminData } = vi.hoisted(() => ({ adminWrite: vi.fn(), forgetAdminData: vi.fn() }));
vi.mock("@/lib/client/admin-store", () => ({ adminWrite, forgetAdminData }));

import { LOGGED_OUT_PATH, logOutAdmin } from "@/lib/client/admin-logout";

const replace = vi.fn();
const deleteCache = vi.fn(async () => true);

beforeEach(() => {
  adminWrite.mockReset();
  forgetAdminData.mockClear();
  replace.mockClear();
  deleteCache.mockClear();
  vi.stubGlobal("location", { replace });
  vi.stubGlobal("caches", { delete: deleteCache });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("logOutAdmin", () => {
  it("sends the logout in the background, forgets the data and the saved dashboard, then opens sign-in", async () => {
    adminWrite.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    await expect(logOutAdmin()).resolves.toBeNull();
    expect(adminWrite).toHaveBeenCalledWith("/admin/logout", expect.objectContaining({ method: "POST" }), []);
    expect(forgetAdminData).toHaveBeenCalledTimes(1);
    expect(deleteCache).toHaveBeenCalledWith("hm-admin-page-v1");
    expect(replace).toHaveBeenCalledWith(LOGGED_OUT_PATH);
    expect(LOGGED_OUT_PATH).toBe("/admin/sign-in?loggedout=1");
  });

  it("says why when the server cannot be reached or refuses, and leaves everything as it was", async () => {
    adminWrite.mockRejectedValueOnce(new TypeError("Load failed"));
    await expect(logOutAdmin()).resolves.toBe("Could not log out: no connection.");
    adminWrite.mockResolvedValueOnce(new Response("", { status: 503 }));
    await expect(logOutAdmin()).resolves.toBe("Could not log out (error 503).");
    expect(forgetAdminData).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
