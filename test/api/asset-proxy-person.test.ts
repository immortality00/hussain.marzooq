import { ObjectId } from "mongodb";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { resetMemoryDb } from "@/test/support/memory-db";

const { cookieStore, isAdminAuthedServer, consumeFixedWindowRateLimit, signedDeliveryUrl } = vi.hoisted(() => ({
  cookieStore: new Map<string, string>(),
  isAdminAuthedServer: vi.fn(),
  consumeFixedWindowRateLimit: vi.fn(),
  signedDeliveryUrl: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
}));
vi.mock("@/lib/server/db", async () => {
  const { memoryDb } = await import("@/test/support/memory-db");
  return { getDb: async () => memoryDb };
});
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthedServer }));
vi.mock("@/lib/server/request-guards", () => ({ consumeFixedWindowRateLimit }));
vi.mock("@/lib/server/cloudinary-private", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/server/cloudinary-private")>()),
  signedDeliveryUrl,
}));

import { createPersonGateCookieValue, getPersonGateSecret, personGateCookieName } from "@/lib/password-gate";
import { GET } from "@/app/api/media/asset/[mediaId]/route";

const PERSON_ID = "507f1f77bcf86cd799439011";
const OTHER_ID = "507f1f77bcf86cd799439022";

function person(extra: Record<string, unknown> = {}) {
  return { _id: new ObjectId(PERSON_ID), name: "Subject", slug: "subject", isPublic: true, isPrivate: true, accessToken: "tok", ...extra };
}

function photo(extra: Record<string, unknown> = {}) {
  return {
    _id: new ObjectId(),
    title: "Dune",
    publicId: "hm_visuals/media/photography/dune",
    resourceType: "image",
    deliveryType: "authenticated",
    peopleIds: [PERSON_ID],
    isPublic: false,
    ...extra,
  };
}

function unlock(accessToken = "tok", personId = PERSON_ID) {
  cookieStore.set(personGateCookieName(personId), createPersonGateCookieValue(getPersonGateSecret(), personId, accessToken)!);
}

function get(mediaId: string, query = "p=subject") {
  return GET(new Request(`https://hm.test/api/media/asset/${mediaId}?${query}`), {
    params: Promise.resolve({ mediaId }),
  });
}

beforeAll(() => {
  process.env.PERSON_GATE_COOKIE_SECRET = "test-person-secret";
});

beforeEach(() => {
  cookieStore.clear();
  isAdminAuthedServer.mockResolvedValue(false);
  consumeFixedWindowRateLimit.mockResolvedValue({ limited: false });
  signedDeliveryUrl.mockReturnValue("https://res.cloudinary.test/signed.jpg");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("bytes", { status: 200, headers: { "content-type": "image/jpeg" } }))
  );
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("GET /api/media/asset/[mediaId]?p= — an unlocked person's own files", () => {
  test("serves the person's hidden photo with a valid cookie", async () => {
    const dune = photo();
    resetMemoryDb({ people_profiles: [person()], media: [dune], private_galleries: [] });
    unlock();

    const res = await get(String(dune._id));

    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, max-age=300");
    expect(signedDeliveryUrl).toHaveBeenCalledWith(expect.objectContaining({ deliveryType: "authenticated" }));
  });

  test("403s with no cookie, a cookie for another person, or a rotated token", async () => {
    const dune = photo();
    resetMemoryDb({ people_profiles: [person()], media: [dune], private_galleries: [] });

    expect((await get(String(dune._id))).status).toBe(403);
    unlock("tok", OTHER_ID);
    expect((await get(String(dune._id))).status).toBe(403);
    unlock("old-token");
    expect((await get(String(dune._id))).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  test("403s a photo not linked to that person", async () => {
    const stranger = photo({ peopleIds: [OTHER_ID] });
    resetMemoryDb({ people_profiles: [person()], media: [stranger], private_galleries: [] });
    unlock();

    expect((await get(String(stranger._id))).status).toBe(403);
  });

  test("403s a photo in a Private Gallery, even when it is the person's", async () => {
    const dune = photo();
    resetMemoryDb({
      people_profiles: [person()],
      media: [dune],
      private_galleries: [{ _id: new ObjectId(), slug: "client", mediaIds: [String(dune._id)] }],
    });
    unlock();

    expect((await get(String(dune._id))).status).toBe(403);
  });

  test("403s a photo hidden for another, still-gated person", async () => {
    const pair = photo({ peopleIds: [PERSON_ID, OTHER_ID] });
    resetMemoryDb({
      people_profiles: [person(), person({ _id: new ObjectId(OTHER_ID), slug: "other" })],
      media: [pair],
      private_galleries: [],
    });
    unlock();

    expect((await get(String(pair._id))).status).toBe(403);
  });

  test("403s a photo scheduled for later", async () => {
    const later = photo({ isPublic: true, publishAt: new Date(Date.now() + 86_400_000) });
    resetMemoryDb({ people_profiles: [person()], media: [later], private_galleries: [] });
    unlock();

    expect((await get(String(later._id))).status).toBe(403);
  });

  test("403s for a person who is public or hidden — only a password-protected profile opens files", async () => {
    const dune = photo();
    unlock();

    resetMemoryDb({ people_profiles: [person({ isPrivate: false })], media: [dune], private_galleries: [] });
    expect((await get(String(dune._id))).status).toBe(403);

    resetMemoryDb({ people_profiles: [person({ isPublic: false })], media: [dune], private_galleries: [] });
    expect((await get(String(dune._id))).status).toBe(403);
  });

  test("403s an unknown slug and caps the slug before looking it up", async () => {
    const dune = photo();
    resetMemoryDb({ people_profiles: [person()], media: [dune], private_galleries: [] });
    unlock();

    expect((await get(String(dune._id), "p=nobody")).status).toBe(403);
    expect((await get(String(dune._id), `p=${"s".repeat(5000)}`)).status).toBe(403);
  });

  test("is rate-limited like gallery files", async () => {
    consumeFixedWindowRateLimit.mockResolvedValue({ limited: true });
    const dune = photo();
    resetMemoryDb({ people_profiles: [person()], media: [dune], private_galleries: [] });
    unlock();

    expect((await get(String(dune._id))).status).toBe(429);
  });
});
