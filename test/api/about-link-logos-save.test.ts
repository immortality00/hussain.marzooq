import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { memory, resetMemoryDb } from "@/test/support/memory-db";
import { DEFAULT_SEARCH_PROFILE } from "@/lib/seo/search-profile";

const { deleteManagedCloudinaryAsset, upload, revalidatePath } = vi.hoisted(() => ({
  deleteManagedCloudinaryAsset: vi.fn(),
  upload: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/server/db", async () => ({ getDb: async () => (await import("@/test/support/memory-db")).memoryDb }));
vi.mock("@/lib/auth/admin", () => ({ isAdminAuthedServer: async () => true }));
vi.mock("next/cache", () => ({ revalidatePath, revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock("@/lib/server/cloudinary-assets", () => ({ deleteManagedCloudinaryAsset }));
vi.mock("@/lib/server/cloudinary", () => ({ isCloudinaryConfigured: () => true, ensureCloudinaryConfigured: () => ({}) }));
vi.mock("cloudinary", () => ({ v2: { uploader: { upload } } }));
vi.mock("@/lib/server/upload-ledger", () => ({
  newUploadPublicId: (folder: string) => `${folder}/objkt.com`,
  registerAssetUpload: vi.fn(),
  discardPendingUpload: vi.fn(),
}));

import { PATCH } from "@/app/api/admin/page-sections/[slug]/route";

// Google has an icon for objkt.com only.
const fetchMock = vi.fn(async (input: string | URL) =>
  String(input).includes("domain=objkt.com")
    ? new Response(new Uint8Array(500).fill(1), { status: 200, headers: { "content-type": "image/png" } })
    : new Response(null, { status: 404 })
);

const logo = (host: string) => ({
  host,
  image: { url: `https://res.cloudinary.com/demo/image/upload/v1/hm_visuals/sections/logos/${host}.png`, publicId: `hm_visuals/sections/logos/${host}` },
});

const save = (data: Record<string, unknown>) =>
  PATCH(
    new NextRequest("http://localhost/api/admin/page-sections/about", {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ slug: "about" }) }
  );

// Every link shown on the site unless the test says otherwise.
const profile = (links: string[], shownLinks = links) => ({ ...DEFAULT_SEARCH_PROFILE, links, shownLinks });
const storedAbout = () => memory.collections.page_sections![0]!.data as { linkLogos?: unknown };

beforeEach(() => {
  vi.clearAllMocks();
  resetMemoryDb({ page_sections: [{ slug: "about", data: { profile: profile(["https://old.example/"]), linkLogos: [logo("old.example")] } }] });
  vi.stubGlobal("fetch", fetchMock);
  upload.mockImplementation(async (_file: string, options: { public_id: string }) => ({
    secure_url: `https://res.cloudinary.com/demo/image/upload/v1/${options.public_id}.png`,
    public_id: options.public_id,
    resource_type: "image",
    bytes: 500,
  }));
});

afterEach(() => vi.unstubAllGlobals());

describe("saving About profile links", () => {
  test("stores a logo for a new site, reports one it could not get, and deletes the dropped site's logo", async () => {
    const res = await save({
      profile: profile(["https://instagram.com/h", "https://objkt.com/profile/h", "https://linkedin.com/in/h"]),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.logosMissing).toEqual(["linkedin.com"]);
    expect(storedAbout().linkLogos).toEqual([logo("objkt.com")]);
    expect(body.item.data.linkLogos).toEqual([logo("objkt.com")]);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      "https://www.google.com/s2/favicons?domain=objkt.com&sz=128",
      "https://www.google.com/s2/favicons?domain=linkedin.com&sz=128",
    ]);
    expect(deleteManagedCloudinaryAsset).toHaveBeenCalledWith({ publicId: "hm_visuals/sections/logos/old.example" }, ["hm_visuals/sections"]);
  });

  test("keeps a stored logo without fetching it again", async () => {
    const res = await save({ profile: profile(["https://old.example/"]) });
    expect((await res.json()).logosMissing).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(deleteManagedCloudinaryAsset).not.toHaveBeenCalled();
    expect(storedAbout().linkLogos).toEqual([logo("old.example")]);
  });

  test("ignores logos sent in the request", async () => {
    const forged = { host: "evil.example", image: { url: "https://res.cloudinary.com/x/y.png", publicId: "hm_visuals/media/photography/someone" } };
    await save({ profile: profile(["https://old.example/"]), linkLogos: [forged] });
    expect(storedAbout().linkLogos).toEqual([logo("old.example")]);
  });

  test("clearing the links deletes every stored logo", async () => {
    await save({ profile: profile([]) });
    expect(storedAbout().linkLogos).toEqual([]);
    expect(deleteManagedCloudinaryAsset).toHaveBeenCalledOnce();
  });

  test("links kept off the site fetch nothing, and switching one off deletes its logo", async () => {
    const res = await save({ profile: profile(["https://old.example/", "https://objkt.com/profile/h"], []) });
    expect((await res.json()).logosMissing).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(storedAbout().linkLogos).toEqual([]);
    expect(deleteManagedCloudinaryAsset).toHaveBeenCalledWith({ publicId: "hm_visuals/sections/logos/old.example" }, ["hm_visuals/sections"]);
  });

  test("refreshes every public page", async () => {
    await save({ profile: profile([]) });
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/", "layout");
  });
});
