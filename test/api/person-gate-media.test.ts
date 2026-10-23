import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { convertAssetDeliveryType } = vi.hoisted(() => ({
  convertAssetDeliveryType: vi.fn(async (params: { publicId: string; to: string }) => ({
    ok: true as const,
    secureUrl: `https://res.cloudinary.com/demo/image/${params.to}/v2/${params.publicId}.jpg`,
  })),
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/server/db", async () => {
  const { memoryDb } = await import("@/test/support/memory-db");
  return { getDb: async () => memoryDb };
});
vi.mock("@/lib/server/cloudinary-assets", async () => ({
  ...(await vi.importActual<object>("@/lib/server/cloudinary-assets")),
  deleteManagedCloudinaryAsset: vi.fn(),
  isAllowedCloudinaryUrl: () => true,
}));
vi.mock("@/lib/server/cloudinary-private", async () => ({
  ...(await vi.importActual<object>("@/lib/server/cloudinary-private")),
  convertAssetDeliveryType,
}));
vi.mock("@/lib/server/removal-requests", () => ({
  getRemovalRequestQueue: async () => [],
  getRemovalRequestHistory: async () => [],
}));

import { PATCH } from "@/app/api/people/[id]/route";
import { POST as decideRemoval } from "@/app/api/people/[id]/removal/route";

const PERSON_ID = "507f1f77bcf86cd799439011";
const OTHER_ID = "507f1f77bcf86cd799439022";
const AVATAR = "https://res.cloudinary.com/x/image/upload/hm_visuals/people/a.jpg";
const uploadUrl = (publicId: string) => `https://res.cloudinary.com/demo/image/upload/v1/${publicId}.jpg`;

type Doc = Record<string, unknown>;

function person(extra: Doc = {}): Doc {
  return {
    _id: new ObjectId(PERSON_ID),
    name: "Subject",
    slug: "subject",
    avatarUrl: AVATAR,
    isPublic: true,
    isPrivate: false,
    accessToken: "tok",
    ...extra,
  };
}

function photo(title: string, extra: Doc = {}): Doc {
  const publicId = `hm_visuals/media/photography/${title.toLowerCase()}`;
  return {
    _id: new ObjectId(),
    title,
    type: "image",
    resourceType: "image",
    publicId,
    secureUrl: uploadUrl(publicId),
    peopleIds: [PERSON_ID],
    people: ["Subject"],
    isPublic: true,
    ...extra,
  };
}

function patch(body: Doc) {
  return PATCH(
    new Request(`http://localhost/api/people/${PERSON_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ name: "Subject", slug: "subject", avatarUrl: AVATAR, ...body }),
    }),
    { params: Promise.resolve({ id: PERSON_ID }) }
  );
}

function approve(extra: Doc = {}) {
  return decideRemoval(
    new Request(`http://localhost/api/people/${PERSON_ID}/removal`, {
      method: "POST",
      body: JSON.stringify({ action: "approve", password: "supersecret123", ...extra }),
    }),
    { params: Promise.resolve({ id: PERSON_ID }) }
  );
}

const gate = { isPublic: true, isPrivate: true, password: "supersecret123" };
const mediaNamed = (title: string) => memory.collections.media!.find((doc) => doc.title === title)!;
const heroUrl = () => (memory.collections.page_sections![0]!.data as { hero: { images: { url: string }[] } }).hero.images[0]!.url;

function seed({ people = [person()], media = [] as Doc[], galleries = [] as Doc[], heroPhoto = "" } = {}) {
  resetMemoryDb({
    people_profiles: people,
    media,
    private_galleries: galleries,
    page_sections: [{ slug: "home", data: { hero: { images: [{ url: heroPhoto, publicId: "" }] } } }],
  });
}

beforeEach(() => seed());
afterEach(() => vi.clearAllMocks());

describe("a gated person's media cannot stay public", () => {
  test("password-protecting a profile hides its public media and marks who hid it", async () => {
    seed({ media: [photo("Dune")] });

    expect((await patch(gate)).status).toBe(200);
    expect(mediaNamed("Dune")).toMatchObject({ isPublic: false, removalHiddenBy: [PERSON_ID] });
  });

  test("hiding a profile outright hides its public media", async () => {
    seed({ media: [photo("Dune")] });

    expect((await patch({ isPublic: false, isPrivate: false })).status).toBe(200);
    expect(mediaNamed("Dune").isPublic).toBe(false);
  });

  test("media linked only by name is hidden too, and unrelated media is untouched", async () => {
    seed({ media: [photo("Named", { peopleIds: [] }), photo("Other", { peopleIds: [], people: ["Someone"] })] });

    await patch(gate);

    expect(mediaNamed("Named").isPublic).toBe(false);
    expect(mediaNamed("Other").isPublic).toBe(true);
  });

  test("a profile that stays public hides nothing and switches no file", async () => {
    seed({ media: [photo("Dune")] });

    expect((await patch({ isPublic: true, isPrivate: false })).status).toBe(200);
    expect(mediaNamed("Dune").isPublic).toBe(true);
    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });
});

describe("a gated person's files lose their public address", () => {
  test("gating switches every linked file to private delivery", async () => {
    seed({ media: [photo("Dune")] });

    await patch(gate);

    expect(convertAssetDeliveryType).toHaveBeenCalledWith(
      expect.objectContaining({ publicId: "hm_visuals/media/photography/dune", from: "upload", to: "authenticated" })
    );
    expect(mediaNamed("Dune")).toMatchObject({
      deliveryType: "authenticated",
      secureUrl: "https://res.cloudinary.com/demo/image/authenticated/v2/hm_visuals/media/photography/dune.jpg",
    });
  });

  test("a file that could not be switched is reported, and the item stays hidden", async () => {
    seed({ media: [photo("Dune")] });
    convertAssetDeliveryType.mockResolvedValueOnce({ ok: false, error: "Rate limited" } as never);

    const res = await patch(gate);

    expect(res.status).toBe(200);
    expect((await res.json()).deliveryError).toContain("“Dune” is hidden, but its file could not be made private (Rate limited)");
    expect(mediaNamed("Dune")).toMatchObject({ isPublic: false });
    expect(mediaNamed("Dune").deliveryType).toBeUndefined();
  });

  test("a file Cloudinary no longer has is not a failure", async () => {
    seed({ media: [photo("Dune")] });
    convertAssetDeliveryType.mockResolvedValueOnce({ ok: false, error: "Resource not found" } as never);

    expect((await (await patch(gate)).json()).deliveryError).toBeUndefined();
  });

  test("a video link has no file to switch", async () => {
    seed({ media: [photo("Clip", { type: "embed", publicId: null, secureUrl: null })] });

    await patch(gate);

    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });
});

describe("gating a person whose photo a page uses", () => {
  test("is refused before anything is written, naming the photo and the place", async () => {
    const dune = photo("Dune");
    seed({ media: [dune], heroPhoto: String(dune.secureUrl) });

    const res = await patch(gate);

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: "MEDIA_IN_USE", items: [{ title: "Dune", usedOn: ["Home — hero photo 1"] }] });
    expect(memory.collections.people_profiles![0]!.isPrivate).toBe(false);
    expect(mediaNamed("Dune").isPublic).toBe(true);
    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });

  test("with clearPageUsages empties the place, then gates and locks", async () => {
    const dune = photo("Dune");
    seed({ media: [dune], heroPhoto: String(dune.secureUrl) });

    expect((await patch({ ...gate, clearPageUsages: true })).status).toBe(200);
    expect(heroUrl()).toBe("");
    expect(mediaNamed("Dune")).toMatchObject({ isPublic: false, deliveryType: "authenticated" });
  });

  test("a photo already private is not asked about again", async () => {
    const dune = photo("Dune", { isPublic: false, deliveryType: "authenticated" });
    seed({ media: [dune], heroPhoto: String(dune.secureUrl) });

    expect((await patch(gate)).status).toBe(200);
  });
});

describe("making a gated person public again", () => {
  test("republishes their hidden media and puts its files back on public delivery", async () => {
    seed({
      people: [person({ isPublic: false })],
      media: [photo("Dune", { isPublic: false, deliveryType: "authenticated", removalHiddenBy: [PERSON_ID] })],
    });

    expect((await patch({ isPublic: true, isPrivate: false })).status).toBe(200);
    expect(mediaNamed("Dune")).toMatchObject({ isPublic: true, deliveryType: "upload" });
    expect(mediaNamed("Dune").removalHiddenBy).toBeUndefined();
  });

  test("never republishes media that is in a Private Gallery, and its file stays private", async () => {
    const dune = photo("Dune", { isPublic: false, deliveryType: "authenticated" });
    seed({
      people: [person({ isPublic: false })],
      media: [dune],
      galleries: [{ _id: new ObjectId(), slug: "client", mediaIds: [String(dune._id)] }],
    });

    await patch({ isPublic: true, isPrivate: false });

    expect(mediaNamed("Dune")).toMatchObject({ isPublic: false, deliveryType: "authenticated" });
    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });

  test("keeps media hidden and private while another linked person is still gated", async () => {
    seed({
      people: [person({ isPublic: false }), person({ _id: new ObjectId(OTHER_ID), slug: "other", isPrivate: true })],
      media: [photo("Pair", { isPublic: false, deliveryType: "authenticated", peopleIds: [PERSON_ID, OTHER_ID] })],
    });

    await patch({ isPublic: true, isPrivate: false });

    expect(mediaNamed("Pair")).toMatchObject({ isPublic: false, deliveryType: "authenticated" });
  });
});

describe("approving a removal request", () => {
  test("hides and locks the person's media", async () => {
    seed({ media: [photo("Dune")] });

    expect((await approve()).status).toBe(200);
    expect(memory.collections.people_profiles![0]!.isPrivate).toBe(true);
    expect(mediaNamed("Dune")).toMatchObject({ isPublic: false, deliveryType: "authenticated" });
  });

  test("asks first when a page uses one of the photos", async () => {
    const dune = photo("Dune");
    seed({ media: [dune], heroPhoto: String(dune.secureUrl) });

    expect((await approve()).status).toBe(409);
    expect(memory.collections.people_profiles![0]!.isPrivate).toBe(false);

    expect((await approve({ clearPageUsages: true })).status).toBe(200);
    expect(heroUrl()).toBe("");
    expect(mediaNamed("Dune").deliveryType).toBe("authenticated");
  });
});
