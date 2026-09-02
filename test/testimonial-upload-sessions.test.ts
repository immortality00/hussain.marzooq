import { createHash } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { Db } from "mongodb";
import {
  buildUploadCookieValue,
  commitUploadSession,
  createUploadSession,
  deleteUploadSession,
  isUrlInSession,
  parseUploadCookieValue,
  readUploadCookie,
  sessionFolder,
  UPLOAD_SESSION_COOKIE,
  verifyUploadSession,
} from "@/lib/server/testimonial-upload-sessions";

const CLOUD = "test-cloud";
const SESSION_A = "11111111-1111-4111-8111-111111111111";
const SESSION_B = "22222222-2222-4222-8222-222222222222";
const TOKEN_A = "a".repeat(64);
const TOKEN_B = "b".repeat(64);

function tokenHashOf(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function makeDb(doc: Record<string, unknown> | null) {
  return {
    collection: () => ({
      findOne: async () => doc,
      insertOne: async (inserted: Record<string, unknown>) => {
        if (doc) Object.assign(doc, inserted);
        return { acknowledged: true };
      },
      updateOne: async (filter: Record<string, unknown>) => ({
        matchedCount: doc && (filter.status === undefined || doc.status === filter.status) ? 1 : 0,
      }),
      deleteOne: async () => ({ deletedCount: doc ? 1 : 0 }),
    }),
  } as unknown as Db;
}

function assetUrl(sessionId: string, kind: "pfp" | "photos") {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/v1700000000/${sessionFolder(sessionId)}/${kind}/file.jpg`;
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = CLOUD;
});

afterAll(() => {
  delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
});

describe("cookie parsing", () => {
  test("round-trips a session id and token", () => {
    const parsed = parseUploadCookieValue(buildUploadCookieValue(SESSION_A, TOKEN_A));
    expect(parsed).toEqual({ sessionId: SESSION_A, token: TOKEN_A });
  });

  test("rejects a missing or malformed cookie value", () => {
    expect(parseUploadCookieValue(null)).toBeNull();
    expect(parseUploadCookieValue("")).toBeNull();
    expect(parseUploadCookieValue("no-dot-here")).toBeNull();
    expect(parseUploadCookieValue(`${SESSION_A}.short`)).toBeNull();
    expect(parseUploadCookieValue(`bad id.${TOKEN_A}`)).toBeNull();
  });

  test("readUploadCookie returns null when the header is absent", () => {
    const request = new Request("https://example.com", { method: "POST" });
    expect(readUploadCookie(request)).toBeNull();
  });

  test("readUploadCookie extracts the session cookie among others", () => {
    const value = buildUploadCookieValue(SESSION_A, TOKEN_A);
    const request = new Request("https://example.com", {
      method: "POST",
      headers: { cookie: `other=1; ${UPLOAD_SESSION_COOKIE}=${value}; another=2` },
    });
    expect(readUploadCookie(request)).toEqual({ sessionId: SESSION_A, token: TOKEN_A });
  });
});

describe("verifyUploadSession", () => {
  const pendingDoc = () => ({
    _id: SESSION_A,
    tokenHash: tokenHashOf(TOKEN_A),
    status: "pending" as const,
    expiresAt: new Date(Date.now() + 60_000),
  });

  test("accepts the matching token", async () => {
    const result = await verifyUploadSession(makeDb(pendingDoc()), { sessionId: SESSION_A, token: TOKEN_A });
    expect(result).toEqual({ sessionId: SESSION_A, status: "pending" });
  });

  test("refuses a cross-session token mismatch", async () => {
    const result = await verifyUploadSession(makeDb(pendingDoc()), { sessionId: SESSION_A, token: TOKEN_B });
    expect(result).toBeNull();
  });

  test("refuses when no cookie credentials are supplied", async () => {
    expect(await verifyUploadSession(makeDb(pendingDoc()), null)).toBeNull();
  });

  test("refuses when the session doc is gone", async () => {
    const result = await verifyUploadSession(makeDb(null), { sessionId: SESSION_A, token: TOKEN_A });
    expect(result).toBeNull();
  });

  test("refuses an expired session", async () => {
    const doc = { ...pendingDoc(), expiresAt: new Date(Date.now() - 1000) };
    const result = await verifyUploadSession(makeDb(doc), { sessionId: SESSION_A, token: TOKEN_A });
    expect(result).toBeNull();
  });

  test("refuses a committed session when requirePending is set", async () => {
    const doc = { ...pendingDoc(), status: "committed" as const };
    expect(
      await verifyUploadSession(makeDb(doc), { sessionId: SESSION_A, token: TOKEN_A }, { requirePending: true })
    ).toBeNull();
    expect(
      await verifyUploadSession(makeDb(doc), { sessionId: SESSION_A, token: TOKEN_A })
    ).toEqual({ sessionId: SESSION_A, status: "committed" });
  });
});

describe("isUrlInSession", () => {
  test("accepts a URL inside the session folder", () => {
    expect(isUrlInSession(assetUrl(SESSION_A, "pfp"), SESSION_A)).toBe(true);
    expect(isUrlInSession(assetUrl(SESSION_A, "photos"), SESSION_A)).toBe(true);
  });

  test("refuses a URL that belongs to another session", () => {
    expect(isUrlInSession(assetUrl(SESSION_B, "photos"), SESSION_A)).toBe(false);
  });

  test("refuses a non-Cloudinary or malformed URL", () => {
    expect(isUrlInSession("https://evil.example.com/whatever.jpg", SESSION_A)).toBe(false);
    expect(isUrlInSession("not a url", SESSION_A)).toBe(false);
  });
});

describe("session lifecycle", () => {
  test("createUploadSession issues a pending doc with a parseable cookie", async () => {
    const captured: Record<string, unknown> = {};
    const session = await createUploadSession(makeDb(captured));

    expect(captured.status).toBe("pending");
    expect(captured._id).toBe(session.sessionId);
    expect(session.maxAgeSeconds).toBeGreaterThan(0);

    const parsed = parseUploadCookieValue(session.cookieValue);
    expect(parsed?.sessionId).toBe(session.sessionId);
    expect(tokenHashOf(parsed?.token ?? "")).toBe(captured.tokenHash);
  });

  test("commitUploadSession only matches a pending session", async () => {
    expect(await commitUploadSession(makeDb({ _id: SESSION_A, status: "pending" }), SESSION_A)).toBe(true);
    expect(await commitUploadSession(makeDb({ _id: SESSION_A, status: "committed" }), SESSION_A)).toBe(false);
  });

  test("deleteUploadSession does not throw", async () => {
    await expect(deleteUploadSession(makeDb({ _id: SESSION_A }), SESSION_A)).resolves.toBeUndefined();
  });
});
