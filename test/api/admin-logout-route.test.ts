import { describe, expect, it } from "vitest";
import { COOKIE_NAME, HINT_NAME } from "@/lib/auth/session-token";
import { POST } from "@/app/admin/logout/route";

function logout(headers: Record<string, string>) {
  return POST(new Request("https://hussain-marzooq.com/admin/logout", { method: "POST", headers }));
}

describe("POST /admin/logout", () => {
  it("refuses a request sent from another site and clears nothing", async () => {
    for (const origin of ["https://evil.example", "null", "not a url"]) {
      const res = await logout({ host: "hussain-marzooq.com", origin });
      expect(res.status, origin).toBe(403);
      expect(await res.json()).toEqual({ ok: false, error: "origin" });
      expect(res.headers.get("set-cookie")).toBeNull();
    }
  });

  it("clears the session and the hint cookie for a same-site request", async () => {
    const res = await logout({ host: "hussain-marzooq.com", origin: "https://hussain-marzooq.com" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.cookies.get(COOKIE_NAME)).toMatchObject({ value: "", maxAge: 0 });
    expect(res.cookies.get(HINT_NAME)).toMatchObject({ value: "", maxAge: 0 });
  });

  it("matches the forwarded host behind the CDN", async () => {
    const res = await logout({
      host: "internal.netlify",
      "x-forwarded-host": "hussain-marzooq.com",
      origin: "https://hussain-marzooq.com",
    });
    expect(res.status).toBe(200);
  });

  it("lets a request with no Origin header through, as login does", async () => {
    expect((await logout({ host: "hussain-marzooq.com" })).status).toBe(200);
  });
});
