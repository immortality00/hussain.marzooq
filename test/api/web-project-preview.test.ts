import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getPageSections, consumeFixedWindowRateLimit } = vi.hoisted(() => ({
  getPageSections: vi.fn(),
  consumeFixedWindowRateLimit: vi.fn(async () => ({ limited: false, count: 1, resetAt: "" })),
}));

vi.mock("@/lib/server/page-sections", () => ({ getPageSections }));
vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit }));

import { GET } from "@/app/api/web-projects/preview/route";

const fetchMock = vi.fn();

function call(url: string) {
  return GET(
    new Request(`https://hm.test/api/web-projects/preview?url=${encodeURIComponent(url)}`)
  );
}

beforeEach(() => {
  getPageSections.mockResolvedValue({
    projects: { heading: "Selected work.", urls: ["example.com", "https://studio.test/work"] },
  });
  fetchMock.mockResolvedValue(
    new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/jpeg" } })
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("GET /api/web-projects/preview", () => {
  it("screenshots a URL the admin configured", async () => {
    const res = await call("https://example.com");

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(fetchMock.mock.calls[0][0]).toContain("https://example.com/");
  });

  it("matches a configured entry that was stored scheme-less", async () => {
    expect((await call("example.com")).status).toBe(200);
  });

  it("refuses a URL that is not configured, without calling upstream", async () => {
    const res = await call("https://attacker.test/private");

    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses every URL when nothing is configured", async () => {
    getPageSections.mockResolvedValue({ projects: { heading: "", urls: [] } });

    expect((await call("https://example.com")).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a non-http scheme before reading the configured list", async () => {
    const res = await call("javascript:alert(1)");

    expect(res.status).toBe(400);
    expect(getPageSections).not.toHaveBeenCalled();
  });

  it("returns 429 when the rate limit trips", async () => {
    consumeFixedWindowRateLimit.mockResolvedValueOnce({ limited: true, count: 61, resetAt: "" });

    expect((await call("https://example.com")).status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
