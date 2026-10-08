import { beforeEach, describe, expect, test, vi } from "vitest";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit: async () => ({ limited: false }) }));
vi.mock("@/lib/server/admin-alerts", () => ({ queueAdminAlert: vi.fn() }));
vi.mock("@/lib/server/testimonial-upload-sessions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/server/testimonial-upload-sessions")>(
    "@/lib/server/testimonial-upload-sessions"
  );
  return {
    ...actual,
    readUploadCookie: () => ({ sessionId: SESSION, token: "t" }),
    verifyUploadSession: async () => ({ sessionId: SESSION, status: "pending" }),
  };
});

const SESSION = "a".repeat(32);
vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "demo");

vi.stubEnv("ADMIN_COOKIE_SECRET", "form-token-test-secret");

import { POST } from "@/app/api/testimonials/submit/route";
import { issueFormToken } from "@/lib/server/form-token";

const submit = () =>
  POST(
    new Request("http://localhost/api/testimonials/submit", {
      method: "POST",
      body: JSON.stringify({
        name: "Visitor",
        email: "visitor@example.com",
        review: "Lovely work.",
        rating: 5,
        consent: true,
        formToken: issueFormToken("review", Date.now() - 60_000),
        photoUrls: [`https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/testimonials/${SESSION}/photos/one.jpg`],
      }),
    })
  );

const sessionStatus = () => memory.collections.testimonial_upload_sessions?.[0]?.status;

beforeEach(() => {
  resetMemoryDb({ testimonial_upload_sessions: [{ _id: SESSION, status: "pending" }], testimonials: [] });
});

describe("review submit claims its upload session first", () => {
  test("two submits at once with one session save exactly one review", async () => {
    const results = await Promise.all([submit(), submit()]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(memory.collections.testimonials).toHaveLength(1);
    expect(sessionStatus()).toBe("committed");
  });

  test("a failed insert releases the claim so the visitor can try again", async () => {
    memory.failWritesTo.add("testimonials");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failed = await submit();
    expect(failed.status).toBe(500);
    expect(sessionStatus()).toBe("pending");

    memory.failWritesTo.clear();
    expect((await submit()).status).toBe(200);
    expect(memory.collections.testimonials).toHaveLength(1);
  });
});
