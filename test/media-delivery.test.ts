import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, memoryDb, resetMemoryDb } from "@/test/support/memory-db";

const { convertAssetDeliveryType } = vi.hoisted(() => ({
  convertAssetDeliveryType: vi.fn(async (params: { publicId: string; to: string }) => ({
    ok: true as const,
    secureUrl: `https://res.cloudinary.com/demo/image/${params.to}/v2/${params.publicId}.jpg`,
  })),
}));

vi.mock("@/lib/server/cloudinary-private", async () => ({
  ...(await vi.importActual<object>("@/lib/server/cloudinary-private")),
  convertAssetDeliveryType,
}));

import {
  deliveryFailureText,
  requiredDelivery,
  syncMediaDelivery,
} from "@/lib/server/media-delivery";
import { makeMediaPrivateForGallery, releaseMediaFromPrivateGalleries } from "@/lib/server/private-gallery-assets";

const db = memoryDb as never;

function item(title: string, extra: Record<string, unknown> = {}) {
  return { _id: new ObjectId(), title, type: "image", publicId: `hm_visuals/media/${title}`, isPublic: true, ...extra };
}

const byTitle = (title: string) => memory.collections.media!.find((doc) => doc.title === title)!;
const ids = () => memory.collections.media!.map((doc) => String(doc._id));

beforeEach(() => resetMemoryDb({ media: [], private_galleries: [] }));
afterEach(() => vi.clearAllMocks());

describe("requiredDelivery", () => {
  test("a public item outside every gallery stays on the CDN", () => {
    expect(requiredDelivery({ isPublic: true }, false)).toBe("upload");
    expect(requiredDelivery({}, false)).toBe("upload");
  });

  test("a hidden item, or one in a gallery, is private", () => {
    expect(requiredDelivery({ isPublic: false }, false)).toBe("authenticated");
    expect(requiredDelivery({ isPublic: true }, true)).toBe("authenticated");
  });
});

describe("syncMediaDelivery", () => {
  test("locks hidden items, unlocks public ones and leaves matching ones alone", async () => {
    memory.collections.media = [
      item("hidden", { isPublic: false }),
      item("public-locked", { deliveryType: "authenticated" }),
      item("already-public"),
      item("already-locked", { isPublic: false, deliveryType: "authenticated" }),
    ];

    const result = await syncMediaDelivery(db, ids());

    expect(result).toEqual({ converted: 2, missing: 0, failures: [] });
    expect(byTitle("hidden")).toMatchObject({
      deliveryType: "authenticated",
      secureUrl: "https://res.cloudinary.com/demo/image/authenticated/v2/hm_visuals/media/hidden.jpg",
    });
    expect(byTitle("public-locked").deliveryType).toBe("upload");
    expect(convertAssetDeliveryType).toHaveBeenCalledTimes(2);
  });

  test("keeps a public-flagged item private while a gallery holds it", async () => {
    const member = item("member", { deliveryType: "authenticated" });
    memory.collections.media = [member];
    memory.collections.private_galleries = [{ _id: new ObjectId(), mediaIds: [String(member._id)] }];

    await syncMediaDelivery(db, ids());

    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
  });

  test("skips items with no file", async () => {
    memory.collections.media = [item("embed", { type: "embed", publicId: null, isPublic: false })];

    expect(await syncMediaDelivery(db, ids())).toEqual({ converted: 0, missing: 0, failures: [] });
  });

  test("counts a file Cloudinary no longer has as missing, not failed", async () => {
    memory.collections.media = [item("gone", { isPublic: false })];
    convertAssetDeliveryType.mockResolvedValueOnce({ ok: false, error: "Resource not found - gone" } as never);

    expect(await syncMediaDelivery(db, ids())).toEqual({ converted: 0, missing: 1, failures: [] });
    expect(byTitle("gone").deliveryType).toBeUndefined();
  });

  test("reports a real failure with its direction and leaves the record as it was", async () => {
    memory.collections.media = [item("busy", { isPublic: false }), item("back", { deliveryType: "authenticated" })];
    convertAssetDeliveryType
      .mockResolvedValueOnce({ ok: false, error: "Rate limited" } as never)
      .mockRejectedValueOnce(new Error("Network down"));

    const { failures } = await syncMediaDelivery(db, ids());

    expect(failures).toEqual([
      { title: "busy", error: "Rate limited", to: "authenticated" },
      { title: "back", error: "Network down", to: "upload" },
    ]);
    expect(deliveryFailureText(failures)).toBe(
      "“busy” is hidden, but its file could not be made private (Rate limited). " +
        "“back” could not be made public again (Network down). Save again to retry."
    );
  });

  test("does not overwrite a record whose file was replaced meanwhile", async () => {
    memory.collections.media = [item("raced", { isPublic: false })];
    convertAssetDeliveryType.mockImplementationOnce(async (params: { publicId: string; to: string }) => {
      byTitle("raced").publicId = "hm_visuals/media/replacement";
      return { ok: true as const, secureUrl: `https://res.cloudinary.com/demo/image/${params.to}/v2/x.jpg` };
    });

    await syncMediaDelivery(db, ids());

    expect(byTitle("raced").deliveryType).toBeUndefined();
  });

  test("ignores ids that are not object ids", async () => {
    expect(await syncMediaDelivery(db, ["nope", ""])).toEqual({ converted: 0, missing: 0, failures: [] });
  });

  test("deliveryFailureText is null with nothing to report", () => {
    expect(deliveryFailureText([])).toBeNull();
  });
});

describe("private galleries", () => {
  test("attaching hides every member, then locks its file", async () => {
    memory.collections.media = [item("a"), item("b")];

    const result = await makeMediaPrivateForGallery(db, ids());

    expect(result).toMatchObject({ hidden: 2, converted: 2, failures: [] });
    expect(byTitle("a")).toMatchObject({ isPublic: false, deliveryType: "authenticated" });
  });

  test("a public gallery leaves its photos as they are: a public photo stays on the CDN", async () => {
    const member = item("client");
    memory.collections.media = [member];
    memory.collections.private_galleries = [{ _id: new ObjectId(), visibility: "public", mediaIds: [String(member._id)] }];

    await syncMediaDelivery(db, ids());

    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
    expect(byTitle("client")).toMatchObject({ isPublic: true });
    expect(byTitle("client").deliveryType).toBeUndefined();
  });

  test("a photo in a public and a private gallery is still private", async () => {
    const member = item("both", { isPublic: false });
    memory.collections.media = [member];
    memory.collections.private_galleries = [
      { _id: new ObjectId(), visibility: "public", mediaIds: [String(member._id)] },
      { _id: new ObjectId(), mediaIds: [String(member._id)] },
    ];

    await syncMediaDelivery(db, ids());

    expect(byTitle("both").deliveryType).toBe("authenticated");
  });

  test("leaving the last gallery keeps a still-hidden item's file private", async () => {
    memory.collections.media = [item("left", { isPublic: false, deliveryType: "authenticated" })];

    await releaseMediaFromPrivateGalleries(db, ids());

    expect(convertAssetDeliveryType).not.toHaveBeenCalled();
    expect(byTitle("left").deliveryType).toBe("authenticated");
  });
});
