import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { memory, resetMemoryDb } from "@/test/support/memory-db";

const { deleteManagedCloudinaryAsset } = vi.hoisted(() => ({ deleteManagedCloudinaryAsset: vi.fn() }));

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthedServer: async () => true }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("@/lib/server/cloudinary-assets", () => ({ deleteManagedCloudinaryAsset }));

import { PATCH } from "@/app/api/admin/page-sections/[slug]/route";

const UPLOADED = "hm_visuals/sections/abc";
const uploaded = { url: `https://res.cloudinary.com/demo/image/upload/v1/${UPLOADED}.jpg`, publicId: UPLOADED };
const picked = (n: number) => ({ url: `https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/media/p${n}.jpg`, publicId: "" });

const save = (data: unknown) =>
  PATCH(
    new NextRequest("http://localhost/api/admin/page-sections/home", {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ slug: "home" }) }
  );

const storedHero = () => (memory.collections.page_sections![0]!.data as { hero: unknown }).hero;

beforeEach(() => {
  vi.clearAllMocks();
  resetMemoryDb({ page_sections: [{ slug: "home", data: { hero: { image: uploaded } } }] });
});

describe("saving the homepage hero photos", () => {
  test("stores the list in order, drops empty slots and the old single-image key", async () => {
    const res = await save({ hero: { images: [uploaded, { url: "", publicId: "" }, picked(1)] } });

    expect(res.status).toBe(200);
    expect(storedHero()).toEqual({ images: [uploaded, picked(1)] });
    expect((await res.json()).item.data.hero).toEqual({ images: [uploaded, picked(1)] });
  });

  test("an uploaded photo carried from the old single image into the list is kept", async () => {
    await save({ hero: { images: [picked(1), uploaded] } });
    expect(deleteManagedCloudinaryAsset).not.toHaveBeenCalled();
  });

  test("an uploaded photo removed from the list is deleted", async () => {
    await save({ hero: { images: [picked(1)] } });
    expect(deleteManagedCloudinaryAsset).toHaveBeenCalledWith({ publicId: UPLOADED }, ["hm_visuals/sections"]);
  });

  test("an old-style single image from a page opened before the deploy is saved as a list", async () => {
    expect((await save({ hero: { image: picked(2) } })).status).toBe(200);
    expect(storedHero()).toEqual({ images: [picked(2)] });
  });

  test.each([
    ["eleven photos", { images: Array.from({ length: 11 }, (_, i) => picked(i)) }, "The hero takes up to 10 photos."],
    ["something that is not an image", { images: [picked(1), "x"] }, "Hero photos must be a list of images."],
    ["a hero that is not an object", "x", "Hero photos must be a list of images."],
  ])("refuses %s and changes nothing", async (_, hero, error) => {
    const res = await save({ hero });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error });
    expect(storedHero()).toEqual({ image: uploaded });
    expect(deleteManagedCloudinaryAsset).not.toHaveBeenCalled();
  });
});
