import { beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";

const PERSON_ID = new ObjectId().toString();
const OTHER_GATED_ID = new ObjectId().toString();
const OTHER_PUBLIC_ID = new ObjectId().toString();

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "cookie" }) }),
}));

vi.mock("@/lib/password-gate", () => ({
  getPersonGateSecret: () => "secret",
  personGateCookieName: (id: string) => `hm_person_${id}`,
  verifyPersonGateCookieValue: () => true,
}));

function toComparable(value: unknown) {
  return value instanceof ObjectId ? value.toHexString() : value;
}

function matchesField(value: unknown, cond: unknown): boolean {
  if (cond !== null && typeof cond === "object" && !Array.isArray(cond)) {
    const ops = cond as Record<string, unknown>;
    if ("$ne" in ops) return toComparable(value) !== toComparable(ops.$ne);
    if ("$exists" in ops) return (value !== undefined) === ops.$exists;
    if ("$in" in ops) {
      const list = (ops.$in as unknown[]).map(toComparable);
      if (Array.isArray(value)) return value.some((v) => list.includes(toComparable(v)));
      return list.includes(toComparable(value));
    }
  }
  if (Array.isArray(value)) return value.map(toComparable).includes(toComparable(cond));
  return toComparable(value) === toComparable(cond);
}

function matchesFilter(doc: Record<string, unknown>, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, cond]) => {
    if (key === "$and") return (cond as Record<string, unknown>[]).every((f) => matchesFilter(doc, f));
    if (key === "$or") return (cond as Record<string, unknown>[]).some((f) => matchesFilter(doc, f));
    return matchesField(doc[key], cond);
  });
}

let personDoc: Record<string, unknown>;
let mediaDocs: Record<string, unknown>[];
let otherPeople: Record<string, unknown>[];

function collection(name: string) {
  if (name === "people_profiles") {
    return {
      findOne: async (filter: Record<string, unknown>) =>
        matchesFilter(personDoc, filter) ? personDoc : null,
      find: (filter: Record<string, unknown>) => ({
        project: () => ({
          toArray: async () => otherPeople.filter((d) => matchesFilter(d, filter)),
        }),
      }),
    };
  }
  if (name === "media") {
    return {
      find: (filter: Record<string, unknown>) => ({
        sort: () => ({
          limit: () => ({
            toArray: async () => mediaDocs.filter((d) => matchesFilter(d, filter)),
          }),
        }),
      }),
    };
  }
  throw new Error(`unexpected collection ${name}`);
}

vi.mock("@/lib/server/db", () => ({ getDb: async () => ({ collection }) }));

beforeEach(() => {
  personDoc = {
    _id: new ObjectId(PERSON_ID),
    name: "Subject",
    slug: "subject",
    isPrivate: true,
    accessToken: "tok",
    passwordHash: "hash",
  };
  mediaDocs = [];
  otherPeople = [];
});

describe("an unlocked private person page", () => {
  test("shows the person's own hidden media", async () => {
    mediaDocs = [{ _id: new ObjectId(), peopleIds: [PERSON_ID], isPublic: false }];

    const { getPersonPageBySlug } = await import("@/lib/server/public-people");
    const result = await getPersonPageBySlug("subject");

    expect(result.state).toBe("open");
    if (result.state === "open") expect(result.person.mediaItems).toHaveLength(1);
  });

  test("never reveals media that is still delivered as authenticated (Private Gallery)", async () => {
    mediaDocs = [
      { _id: new ObjectId(), peopleIds: [PERSON_ID], isPublic: false, deliveryType: "authenticated" },
    ];

    const { getPersonPageBySlug } = await import("@/lib/server/public-people");
    const result = await getPersonPageBySlug("subject");

    expect(result.state).toBe("open");
    if (result.state === "open") expect(result.person.mediaItems).toHaveLength(0);
  });

  test("never reveals media hidden because a different, still-gated person appears in it", async () => {
    mediaDocs = [
      { _id: new ObjectId(), peopleIds: [PERSON_ID, OTHER_GATED_ID], isPublic: false },
    ];
    otherPeople = [{ _id: new ObjectId(OTHER_GATED_ID), isPrivate: true }];

    const { getPersonPageBySlug } = await import("@/lib/server/public-people");
    const result = await getPersonPageBySlug("subject");

    expect(result.state).toBe("open");
    if (result.state === "open") expect(result.person.mediaItems).toHaveLength(0);
  });

  test("still shows media co-appearing with an ordinary, non-gated person", async () => {
    mediaDocs = [
      { _id: new ObjectId(), peopleIds: [PERSON_ID, OTHER_PUBLIC_ID], isPublic: false },
    ];
    otherPeople = [{ _id: new ObjectId(OTHER_PUBLIC_ID), isPrivate: false, isPublic: true }];

    const { getPersonPageBySlug } = await import("@/lib/server/public-people");
    const result = await getPersonPageBySlug("subject");

    expect(result.state).toBe("open");
    if (result.state === "open") expect(result.person.mediaItems).toHaveLength(1);
  });
});
