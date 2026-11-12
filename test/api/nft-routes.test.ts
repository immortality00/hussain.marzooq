import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ObjectId } from "mongodb";
import { memory, resetMemoryDb } from "@/test/support/memory-db";
import { TEZOS_CONTRACTS } from "@/lib/nft/tezos-contracts";

const { pinata, limited, dbDown } = vi.hoisted(() => ({
  limited: { on: false },
  dbDown: { on: false },
  pinata: {
    ready: true,
    files: new Map<string, Record<string, unknown>>(),
    pinned: [] as { name: string; text: string; keyvalues: Record<string, string> }[],
    deleted: [] as string[],
    listed: [] as Record<string, unknown>[],
    links: [] as Record<string, unknown>[],
    fail: "",
  },
}));

vi.mock("@/lib/auth/admin", () => ({ requireAdminOr401: async () => null }));
vi.mock("@/lib/server/db", async () => {
  const { memoryDb } = await import("@/test/support/memory-db");
  return {
    getDb: async () => {
      if (dbDown.on) throw Object.assign(new Error("Server selection timed out after 10000 ms"), { name: "MongoServerSelectionError" });
      return memoryDb;
    },
  };
});
vi.mock("@/lib/server/request-guards", () => ({
  consumeFixedWindowRateLimit: async () => ({ limited: limited.on, count: 1, resetAt: "" }),
}));
vi.mock("@/lib/server/admin-media", () => ({
  savedAdminMedia: async (_db: unknown, doc: { _id: unknown; mint?: unknown }) => ({
    item: { id: String(doc._id), mint: doc.mint },
    listItem: { id: String(doc._id) },
  }),
}));
vi.mock("@/lib/server/pinata", () => ({
  pinataReady: () => pinata.ready,
  createUploadLink: async (input: Record<string, unknown>) => {
    if (pinata.fail) throw new Error(pinata.fail);
    pinata.links.push(input);
    return "https://uploads.pinata.cloud/v3/files/signed";
  },
  getPinataFile: async (id: string) => {
    const file = pinata.files.get(id);
    if (!file) throw new Error("Pinata answered 404: not found");
    return file;
  },
  pinText: async (input: { name: string; text: string; keyvalues: Record<string, string> }) => {
    if (pinata.fail) throw new Error(pinata.fail);
    pinata.pinned.push(input);
    const licence = input.keyvalues.kind === "licence";
    return {
      id: licence ? "licence-id" : `metadata-${pinata.pinned.length}`,
      cid: licence ? LICENCE_CID : METADATA_CID,
      name: input.name,
      size: input.text.length,
      mimeType: "text/plain",
      keyvalues: input.keyvalues,
    };
  },
  listPinataFilesFor: async () => pinata.listed,
  deletePinataFile: async (id: string) => {
    pinata.deleted.push(id);
  },
}));

const LICENCE_CID = "bafkreifjjcie6lypi6ny7amxnfftagclbuxndqonfipmb64f2km2devei4";
const METADATA_CID = "bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku";
const FILE_CID = "bafybeiaz5ge24qwbtl5c24l6sg2dw2uk32hyziwzrixqtg3vnk6fvyph7q";
const IDS = {
  artifact: "11111111-1111-4111-8111-111111111111",
  display: "22222222-2222-4222-8222-222222222222",
  thumbnail: "33333333-3333-4333-8333-333333333333",
};

import { POST as buildMetadata } from "@/app/api/admin/nft/metadata/route";
import { POST as uploadLink } from "@/app/api/admin/nft/upload-link/route";

const sara = { _id: new ObjectId(), name: "Sara", isPublic: true, isPrivate: false };
const omar = { _id: new ObjectId(), name: "Omar", isPublic: false };
let mediaId: ObjectId;

function seed(item: Record<string, unknown> = {}) {
  mediaId = new ObjectId();
  resetMemoryDb({
    media: [
      {
        _id: mediaId,
        type: "image",
        title: "Dune",
        description: "Sand at dusk.",
        categories: ["nft"],
        tags: ["fashion"],
        year: 2026,
        peopleIds: [String(sara._id), String(omar._id)],
        people: ["Sara", "Omar"],
        nft: { currency: "XTZ", editionType: "1/1", editionsTotal: 1, status: "available" },
        updatedAt: new Date("2026-11-01T00:00:00Z"),
        ...item,
      },
    ],
    people_profiles: [sara, omar],
  });
  const media = String(mediaId);
  pinata.files = new Map([
    [IDS.artifact, { id: IDS.artifact, cid: FILE_CID, name: "dune final.png", size: 9_000_000, mimeType: "image/png", keyvalues: { media, kind: "artifact" } }],
    [IDS.display, { id: IDS.display, cid: FILE_CID, name: "display.jpg", size: 700_000, mimeType: "image/jpeg", keyvalues: { media, kind: "display" } }],
    [IDS.thumbnail, { id: IDS.thumbnail, cid: FILE_CID, name: "thumbnail.jpg", size: 30_000, mimeType: "image/jpeg", keyvalues: { media, kind: "thumbnail" } }],
  ]);
}

const post = (handler: (req: Request) => Promise<Response>, path: string, body: unknown) =>
  handler(new Request(`http://localhost${path}`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

const goodBody = (over: Record<string, unknown> = {}) => ({
  mediaId: String(mediaId),
  fields: { floor: "1", royalty: "10", commercialFloor: "", showPeople: false },
  files: {
    artifact: { id: IDS.artifact, width: 4000, height: 6000 },
    display: { id: IDS.display, width: 1365, height: 2048 },
    thumbnail: { id: IDS.thumbnail, width: 233, height: 350 },
  },
  ...over,
});

const build = (body: unknown) => post(buildMetadata, "/api/admin/nft/metadata", body);
const link = (body: unknown) => post(uploadLink, "/api/admin/nft/upload-link", body);
const stored = () => memory.collections.media![0] as Record<string, unknown>;

beforeEach(() => {
  seed();
  Object.assign(pinata, { ready: true, pinned: [], deleted: [], listed: [], links: [], fail: "" });
  limited.on = false;
  dbDown.on = false;
});

afterEach(() => vi.restoreAllMocks());

describe("POST /api/admin/nft/upload-link", () => {
  test("gives a link for one kind of file, with a clean name", async () => {
    const res = await link({ mediaId: String(mediaId), kind: "artifact", fileName: "../../dune final (1).png" });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, url: "https://uploads.pinata.cloud/v3/files/signed", maxBytes: 100 * 1024 * 1024 });
    expect(pinata.links[0]).toEqual({ mediaId: String(mediaId), kind: "artifact", fileName: "dune-final--1-.png" });
  });

  test("the display and thumbnail names are fixed", async () => {
    await link({ mediaId: String(mediaId), kind: "thumbnail", fileName: "evil.html" });
    expect(pinata.links[0]?.fileName).toBe("thumbnail.jpg");
  });

  test.each([
    ["not json", "{"],
    ["an array", [1]],
    ["no media id", { kind: "artifact" }],
    ["a bad media id", { mediaId: "../x", kind: "artifact" }],
    ["an operator as id", { mediaId: { $ne: "" }, kind: "artifact" }],
    ["an unknown kind", { mediaId: "507f1f77bcf86cd799439011", kind: "metadata" }],
    ["an oversized body", { mediaId: "507f1f77bcf86cd799439011", kind: "artifact", fileName: "x".repeat(5000) }],
  ])("refuses %s", async (_name, body) => {
    const res = await link(body);
    expect(res.status).toBe(400);
    expect(pinata.links).toHaveLength(0);
  });

  test("503 without a key, 429 past the limit, 502 with Pinata's reason", async () => {
    pinata.ready = false;
    expect((await link({ mediaId: String(mediaId), kind: "artifact" })).status).toBe(503);
    pinata.ready = true;
    limited.on = true;
    expect((await link({ mediaId: String(mediaId), kind: "artifact" })).status).toBe(429);
    limited.on = false;
    pinata.fail = "Pinata answered 403: Key lacks org:files:write";
    const res = await link({ mediaId: String(mediaId), kind: "artifact" });
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("Pinata answered 403: Key lacks org:files:write");
  });
});

describe("POST /api/admin/nft/metadata", () => {
  test("pins the licence and the metadata and stores the record", async () => {
    const res = await build(goodBody());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.mint).toMatchObject({
      chain: "tezos",
      network: "shadownet",
      floorMutez: 1_000_000,
      royaltyPercent: 10,
      commercialFloorMutez: null,
      showPeople: false,
      metadataUri: `ipfs://${METADATA_CID}`,
      licenceUri: `ipfs://${LICENCE_CID}`,
      licenceVersion: "1.0",
    });
    expect(body.item.mint.metadataUri).toBe(`ipfs://${METADATA_CID}`);
    expect((stored().mint as { files: { artifact: { name: string } } }).files.artifact.name).toBe("dune-final.png");

    const [licence, metadata] = pinata.pinned;
    expect(licence.keyvalues).toEqual({ kind: "licence", version: "1.0" });
    expect(metadata.keyvalues).toEqual({ media: String(mediaId), kind: "metadata" });
    expect(metadata.name).toBe("dune-metadata.json");
    const json = JSON.parse(metadata.text);
    expect(json.royalties.shares).toEqual({ [TEZOS_CONTRACTS.payout]: "1000" });
    expect(json.rightsUri).toBe(`ipfs://${LICENCE_CID}`);
    expect(metadata.text).not.toContain("localhost");
    expect(metadata.text).not.toContain("Sara");
  });

  test("the commercial rights line always names the public site, and the browser's exact size is used", async () => {
    const body = goodBody({ fields: { floor: "1", royalty: "10", commercialFloor: "3", showPeople: false } });
    (body.files as Record<string, Record<string, unknown>>).artifact.size = 8_998_000;
    await build(body);
    const json = JSON.parse(pinata.pinned[1].text);
    expect(pinata.pinned[1].text).toContain("Check https://hussain.art/nft");
    expect(json.formats[0].fileSize).toBe(8_998_000);
    expect(json.formats[1].fileSize).toBe(700_000);
  });

  test("does not touch updatedAt, so an open editor is not told the item changed", async () => {
    await build(goodBody());
    expect(stored().updatedAt).toEqual(new Date("2026-11-01T00:00:00Z"));
  });

  test("names only people with a public profile, and only when switched on", async () => {
    await build(goodBody({ fields: { floor: "1", royalty: "10", commercialFloor: "", showPeople: true } }));
    const text = pinata.pinned[1].text;
    expect(text).toContain("Sara");
    expect(text).not.toContain("Omar");
  });

  test("removes this artwork's files the new record does not use", async () => {
    pinata.listed = [{ id: IDS.artifact }, { id: "old-metadata" }, { id: "replaced-original" }, { id: "metadata-2" }];
    await build(goodBody());
    expect(pinata.deleted.sort()).toEqual(["old-metadata", "replaced-original"]);
  });

  test.each([
    ["a file uploaded for another artwork", () => pinata.files.get(IDS.artifact)!.keyvalues = { media: "507f1f77bcf86cd799439011", kind: "artifact" }, "The artifact file was not uploaded for this artwork."],
    ["a file of another kind", () => pinata.files.set(IDS.display, pinata.files.get(IDS.thumbnail)!), "The display file was not uploaded for this artwork."],
    ["a type the kind does not allow", () => (pinata.files.get(IDS.thumbnail)!.mimeType = "text/html"), "The thumbnail file is not an allowed type or size."],
    ["an oversized thumbnail", () => (pinata.files.get(IDS.thumbnail)!.size = 2 * 1024 * 1024), "The thumbnail file is not an allowed type or size."],
  ])("refuses %s", async (_name, change, error) => {
    change();
    const res = await build(goodBody());
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(error);
    expect(pinata.pinned).toHaveLength(0);
    expect(stored().mint).toBeUndefined();
  });

  test.each([
    [{ categories: ["photography"], nft: null }, "This item is not an NFT."],
    [{ nft: { currency: "ETH", editionType: "1/1" } }, "Set the currency to XTZ and save first."],
    [{ type: "embed" }, "A video link cannot be minted. Upload the file."],
    [{ title: " " }, "The artwork needs a title first."],
    [{ nft: { currency: "XTZ", editionType: "limited", editionsTotal: 1 } }, "A limited edition needs at least 2 copies. Save the NFT details first."],
    [{ nft: { currency: "XTZ", editionType: "1/1", onchain: { tokenId: 4 } } }, "This artwork is already registered. Its metadata is final."],
  ])("refuses an item like %j", async (item, error) => {
    seed(item);
    const res = await build(goodBody());
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(error);
    expect(pinata.pinned).toHaveLength(0);
  });

  test("commercial rights are refused on an edition", async () => {
    seed({ nft: { currency: "XTZ", editionType: "limited", editionsTotal: 10 } });
    const res = await build(goodBody({ fields: { floor: "1", royalty: "10", commercialFloor: "5", showPeople: false } }));
    expect((await res.json()).error).toBe("Commercial rights are for single-copy artworks only.");
  });

  test.each([
    ["not json", "{"],
    ["an array", []],
    ["no media id", { fields: {}, files: {} }],
    ["an operator as id", { ...goodBody(), mediaId: { $ne: "" } }],
    ["a royalty over the maximum", goodBody({ fields: { floor: "1", royalty: "26", commercialFloor: "", showPeople: false } })],
    ["no files", goodBody({ files: {} })],
    ["a 100 KB body", goodBody({ extra: "x".repeat(100_000) })],
  ])("refuses %s with 400", async (_name, body) => {
    const res = await build(body);
    expect(res.status).toBe(400);
    expect(pinata.pinned).toHaveLength(0);
  });

  test("404 for an unknown artwork, 503 without a key, 429 past the limit", async () => {
    expect((await build({ ...goodBody(), mediaId: String(new ObjectId()) })).status).toBe(404);
    pinata.ready = false;
    expect((await build(goodBody())).status).toBe(503);
    pinata.ready = true;
    limited.on = true;
    expect((await build(goodBody())).status).toBe(429);
  });

  test("a Pinata failure is a 502 with its reason, and nothing is stored", async () => {
    pinata.fail = "Pinata answered 500: storage limit reached";
    const res = await build(goodBody());
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("Pinata answered 500: storage limit reached");
    expect(stored().mint).toBeUndefined();
  });

  test("the database being down is a 503 with a reason", async () => {
    dbDown.on = true;
    const res = await build(goodBody());
    expect(res.status).toBe(503);
  });
});
