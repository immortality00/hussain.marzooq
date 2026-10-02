import { afterEach, describe, expect, it, vi } from "vitest";
import { requestAdminLogin } from "@/lib/auth/admin-login";

function answer(status: number, body: unknown) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status })));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requestAdminLogin", () => {
  it("returns where to go after a successful sign-in", async () => {
    answer(200, { ok: true, next: "/admin/inquiries" });
    await expect(requestAdminLogin(new FormData())).resolves.toEqual({ ok: true, next: "/admin/inquiries" });
  });

  it("turns each refusal into the message the sign-in page shows", async () => {
    answer(401, { ok: false, error: "wrong" });
    await expect(requestAdminLogin(new FormData())).resolves.toEqual({ ok: false, message: "Wrong password." });
    answer(429, { ok: false, error: "locked" });
    await expect(requestAdminLogin(new FormData())).resolves.toMatchObject({ message: expect.stringContaining("Too many") });
  });

  it("says what happened when the answer is not one it knows, or nothing came back", async () => {
    answer(500, "Internal Server Error");
    await expect(requestAdminLogin(new FormData())).resolves.toEqual({ ok: false, message: "Could not sign in (error 500)." });
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Load failed"))));
    await expect(requestAdminLogin(new FormData())).resolves.toEqual({ ok: false, message: "No connection." });
  });
});
