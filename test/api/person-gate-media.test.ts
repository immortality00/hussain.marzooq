import { beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/server/cloudinary-assets", () => ({
  deleteManagedCloudinaryAsset: vi.fn(),
  isAllowedCloudinaryUrl: () => true,
}));

const PERSON_ID = "507f1f77bcf86cd799439011";
const AVATAR = "https://res.cloudinary.com/x/image/upload/hm_visuals/people/a.jpg";

type Write = { filter: Record<string, unknown>; update: Record<string, unknown> };

let mediaWrites: Write[] = [];
let person: Record<string, unknown>;
let linkedHiddenMedia: Record<string, unknown>[] = [];

function collection(name: string) {
  if (name === "media") {
    return {
      updateMany: async (filter: Record<string, unknown>, update: Record<string, unknown>) => {
        mediaWrites.push({ filter, update });
        return { modifiedCount: 1 };
      },
      updateOne: async (filter: Record<string, unknown>, update: Record<string, unknown>) => {
        mediaWrites.push({ filter, update });
        return { modifiedCount: 1 };
      },
      find: () => ({ project: () => ({ toArray: async () => linkedHiddenMedia }) }),
    };
  }
  return {
    findOne: async (filter: Record<string, unknown>) =>
      filter.slug && filter.slug !== person.slug ? null : person,
    updateOne: async () => ({ matchedCount: 1 }),
    updateMany: async () => ({ modifiedCount: 0 }),
  };
}

vi.mock("@/lib/server/db", () => ({ getDb: async () => ({ collection }) }));

async function patch(body: Record<string, unknown>) {
  const { PATCH } = await import("@/app/api/people/[id]/route");
  return PATCH(
    new Request(`http://localhost/api/people/${PERSON_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ name: "Subject", slug: "subject", avatarUrl: AVATAR, ...body }),
    }),
    { params: Promise.resolve({ id: PERSON_ID }) }
  );
}

const hides = () =>
  mediaWrites.filter((w) => (w.update.$set as { isPublic?: boolean })?.isPublic === false);

const republishes = () =>
  mediaWrites.filter((w) => (w.update.$set as { isPublic?: boolean })?.isPublic === true);

beforeEach(() => {
  mediaWrites = [];
  linkedHiddenMedia = [];
  person = {
    _id: new ObjectId(PERSON_ID),
    name: "Subject",
    slug: "subject",
    avatarUrl: AVATAR,
    isPublic: true,
    isPrivate: false,
    accessToken: "tok",
  };
});

describe("a gated person's media cannot stay public", () => {
  test("password-protecting a profile hides its public media", async () => {
    const res = await patch({ isPublic: true, isPrivate: true, password: "supersecret123" });

    expect(res.status).toBe(200);
    expect(hides()).toHaveLength(1);
    expect(hides()[0].update.$addToSet).toEqual({ removalHiddenBy: PERSON_ID });
  });

  test("hiding a profile outright hides its public media", async () => {
    const res = await patch({ isPublic: false, isPrivate: false });

    expect(res.status).toBe(200);
    expect(hides()).toHaveLength(1);
  });

  test("the hide targets that person by id and by name, and only public items", async () => {
    await patch({ isPublic: true, isPrivate: true, password: "supersecret123" });

    expect(hides()[0].filter).toEqual({
      $or: [{ peopleIds: PERSON_ID }, { people: "Subject" }],
      isPublic: true,
    });
  });

  test("a profile that stays public hides nothing", async () => {
    const res = await patch({ isPublic: true, isPrivate: false });

    expect(res.status).toBe(200);
    expect(hides()).toHaveLength(0);
  });

  test("a previously hidden profile counts as gated, so going public republishes", async () => {
    person.isPublic = false;

    const res = await patch({ isPublic: true, isPrivate: false });

    expect(res.status).toBe(200);
    expect(hides()).toHaveLength(0);
  });
});

describe("republishing a person never un-hides Private Gallery media", () => {
  test("media still delivered as authenticated (gallery-private) is never republished", async () => {
    person.isPublic = false;
    linkedHiddenMedia = [
      { _id: new ObjectId(), peopleIds: [PERSON_ID], deliveryType: "authenticated" },
    ];

    const res = await patch({ isPublic: true, isPrivate: false });

    expect(res.status).toBe(200);
    expect(republishes()).toHaveLength(0);
  });

  test("ordinary hidden media (not gallery-private) is still republished", async () => {
    person.isPublic = false;
    linkedHiddenMedia = [{ _id: new ObjectId(), peopleIds: [PERSON_ID] }];

    const res = await patch({ isPublic: true, isPrivate: false });

    expect(res.status).toBe(200);
    expect(republishes()).toHaveLength(1);
  });
});
