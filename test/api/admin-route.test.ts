import { ObjectId } from "mongodb";
import { afterEach, describe, expect, test, vi } from "vitest";

// requireAdminObjectId composes requireAdminOr401 (which reads cookies via
// next/headers) with ObjectId validation. Mock the auth guard so these tests
// exercise the param-validation branch without a real request context.
vi.mock("@/lib/auth/admin", () => ({
  requireAdminOr401: vi.fn(),
}));

import { requireAdminOr401 } from "@/lib/auth/admin";
import {
  findByIdOr404,
  requireAdminObjectId,
  wantsHardDelete,
} from "@/app/api/_lib/admin-route";

const mockedGuard = vi.mocked(requireAdminOr401);

function ctxFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("requireAdminObjectId", () => {
  test("returns the 401 Response when the admin guard denies", async () => {
    const denial = new Response(null, { status: 401 });
    mockedGuard.mockResolvedValue(denial);

    const result = await requireAdminObjectId(ctxFor("507f1f77bcf86cd799439011"));

    expect(result).toBe(denial);
  });

  test("returns a 400 Response for a malformed id when authed", async () => {
    mockedGuard.mockResolvedValue(null);

    const result = await requireAdminObjectId(ctxFor("not-an-object-id"));

    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false });
  });

  test("returns the id string and parsed oid for a valid id when authed", async () => {
    mockedGuard.mockResolvedValue(null);
    const id = "507f1f77bcf86cd799439011";

    const result = await requireAdminObjectId(ctxFor(id));

    expect(result).not.toBeInstanceOf(Response);
    const { id: gotId, oid } = result as { id: string; oid: ObjectId };
    expect(gotId).toBe(id);
    expect(oid).toBeInstanceOf(ObjectId);
    expect(String(oid)).toBe(id);
  });
});

describe("findByIdOr404", () => {
  const oid = new ObjectId("507f1f77bcf86cd799439011");

  function fakeDb(returned: unknown) {
    const findOne = vi.fn().mockResolvedValue(returned);
    const db = { collection: vi.fn(() => ({ findOne })) };
    return { db, findOne };
  }

  test("returns the document when found", async () => {
    const doc = { _id: oid, name: "x" };
    const { db, findOne } = fakeDb(doc);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await findByIdOr404(db as any, "media", oid);

    expect(result).not.toBeInstanceOf(Response);
    expect((result as { doc: unknown }).doc).toBe(doc);
    expect(findOne).toHaveBeenCalledWith({ _id: oid }, undefined);
  });

  test("returns a 404 Response when absent", async () => {
    const { db } = fakeDb(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await findByIdOr404(db as any, "media", oid);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(404);
  });

  test("forwards find options (projections) to the driver", async () => {
    const { db, findOne } = fakeDb({ _id: oid });
    const options = { projection: { slug: 1 } };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await findByIdOr404(db as any, "people_profiles", oid, options);

    expect(findOne).toHaveBeenCalledWith({ _id: oid }, options);
  });
});

describe("wantsHardDelete", () => {
  test("true only when ?hard=1", () => {
    expect(wantsHardDelete(new Request("https://x.test/api/services/1?hard=1"))).toBe(true);
    expect(wantsHardDelete(new Request("https://x.test/api/services/1?hard=0"))).toBe(false);
    expect(wantsHardDelete(new Request("https://x.test/api/services/1"))).toBe(false);
  });
});
