import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/server/db", () => ({
  getDb: async () => {
    throw Object.assign(new Error("Server selection timed out after 10000 ms"), { name: "MongoServerSelectionError" });
  },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: vi.fn(), delete: vi.fn() }),
  headers: async () => new Headers(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: vi.fn(),
}));

vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
vi.stubEnv("CLOUDINARY_API_KEY", "key");
vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
vi.stubEnv("ADMIN_COOKIE_SECRET", "route-errors-secret");

import { routeErrorResponse, isDatabaseUnavailable } from "@/app/api/_lib/route-errors";
import { issueFormToken, type FormKind } from "@/lib/server/form-token";

const json = (body: unknown) => ({ method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
const slugCtx = { params: Promise.resolve({ slug: "a-gallery" }) };
const mediaCtx = { params: Promise.resolve({ mediaId: "64b000000000000000000000" }) };

const oldToken = (form: FormKind) => issueFormToken(form, Date.now() - 60_000);

const routes: [string, () => Promise<Response>][] = [
  ["form token", async () => (await import("@/app/api/form-token/route")).POST(new Request("http://l/x", json({ form: "inquiry" })))],
  ["gallery access", async () => (await import("@/app/api/private-galleries/access/route")).POST(new Request("http://l/x", json({ slug: "g", password: "p" })))],
  ["gallery zip", async () => (await import("@/app/api/private-galleries/download/[slug]/route")).GET(new Request("http://l/x"), slugCtx)],
  ["gallery download url", async () => (await import("@/app/api/private-galleries/download-url/route")).POST(new Request("http://l/x", json({ slug: "g", mediaId: "64b000000000000000000000" })))],
  ["review submit", async () => (await import("@/app/api/testimonials/submit/route")).POST(new Request("http://l/x", json({ name: "A", email: "a@b.co", review: "r", rating: 5, consent: true, formToken: oldToken("review") })))],
  ["review upload signature", async () => (await import("@/app/api/testimonials/upload-signature/route")).POST(new Request("http://l/x", json({ kind: "photos" })))],
  ["review upload session", async () => (await import("@/app/api/testimonials/upload-session/route")).POST(new Request("http://l/x", { method: "POST" }))],
  ["review upload discard", async () => (await import("@/app/api/testimonials/upload-session/discard/route")).POST(new Request("http://l/x", json({ publicId: "x" })))],
  ["review upload cleanup", async () => (await import("@/app/api/testimonials/upload-session/cleanup/route")).POST(new Request("http://l/x", { method: "POST" }))],
  ["work overlay", async () => (await import("@/app/api/work-overlay/route")).GET(new Request("http://l/x"))],
  ["web project preview", async () => (await import("@/app/api/web-projects/preview/route")).GET(new Request("http://l/x?url=example.com"))],
  ["person access", async () => (await import("@/app/api/people/access/route")).POST(new Request("http://l/x", json({ slug: "p", password: "p" })))],
  ["removal request", async () => (await import("@/app/api/people/removal-request/route")).POST(new Request("http://l/x", json({ slug: "p", email: "a@b.co", reason: "please remove", formToken: oldToken("removal") })))],
  ["media search", async () => (await import("@/app/api/media/list-public/route")).GET(new Request("http://l/x?q=a"))],
  ["gallery asset", async () => (await import("@/app/api/media/asset/[mediaId]/route")).GET(new Request("http://l/x?g=a"), mediaCtx)],
  ["inquiry", async () => (await import("@/app/api/inquiries/route")).POST(new Request("http://l/x", json({ name: "A", email: "a@b.co", message: "hello there", formToken: oldToken("inquiry") })))],
  ["media tags", async () => (await import("@/app/api/media-tags/route")).GET(new Request("http://l/x"))],
];

describe("public API routes when the database is down", () => {
  test.each(routes)("%s answers 503 with a reason", async (_name, call) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await call();
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ ok: false, error: "The site's database isn't responding. Try again shortly." });
  });
});

describe("routeErrorResponse", () => {
  test("finds a database failure in an error's cause", () => {
    const inner = Object.assign(new Error("x"), { name: "MongoNetworkError" });
    expect(isDatabaseUnavailable(new Error("wrapped", { cause: inner }))).toBe(true);
    expect(isDatabaseUnavailable(new TypeError("bug"))).toBe(false);
  });

  test("any other error is a plain 500 with no detail", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = routeErrorResponse(new TypeError("secret detail"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: "Something went wrong." });
  });
});
