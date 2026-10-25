import { createHash } from "node:crypto";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));

import {
  SIGNUP_LINK_TTL_MS,
  createSignup,
  deleteSignup,
  findSignup,
  isSignupToken,
  markSignupConfirmed,
} from "@/lib/server/blog-signups";

beforeEach(() => resetMemoryDb());

describe("unconfirmed blog sign-ups", () => {
  test("store only the token's hash, never the token", async () => {
    const token = await createSignup("reader@example.com");
    const [doc] = memory.collections.blog_signups ?? [];
    expect(isSignupToken(token)).toBe(true);
    expect(doc?._id).toBe(createHash("sha256").update(token).digest("hex"));
    expect(JSON.stringify(doc)).not.toContain(token);
  });

  test("find the address behind a valid link", async () => {
    const token = await createSignup("reader@example.com");
    expect((await findSignup(token))?.email).toBe("reader@example.com");
    expect(await findSignup(token.replace(/.$/, (c) => (c === "A" ? "B" : "A")))).toBeNull();
  });

  test("stop working after 24 hours, before Mongo's sweep has run", async () => {
    const created = new Date("2026-10-24T10:00:00Z");
    const token = await createSignup("reader@example.com", created);
    expect(await findSignup(token, new Date(created.getTime() + SIGNUP_LINK_TTL_MS - 1000))).not.toBeNull();
    expect(await findSignup(token, new Date(created.getTime() + SIGNUP_LINK_TTL_MS))).toBeNull();
  });

  test("remember a confirmation until the link expires", async () => {
    const token = await createSignup("reader@example.com");
    await markSignupConfirmed(token);
    expect((await findSignup(token))?.confirmedAt).toBeInstanceOf(Date);
  });

  test("deleting the sign-up ends the link", async () => {
    const token = await createSignup("reader@example.com");
    await deleteSignup(token);
    expect(await findSignup(token)).toBeNull();
  });

  test("accept only the token shape the site issues", () => {
    expect(isSignupToken("A".repeat(43))).toBe(true);
    for (const bad of ["", "A".repeat(42), "A".repeat(44), `${"A".repeat(42)}=`, `${"A".repeat(42)}/`, 42, null]) {
      expect(isSignupToken(bad)).toBe(false);
    }
  });
});
