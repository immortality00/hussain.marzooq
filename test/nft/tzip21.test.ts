import { describe, expect, test } from "vitest";
import { LICENCE_NAME } from "@/lib/nft/licences";
import type { MintFields, MintFiles } from "@/lib/nft/mint-fields";
import { TEZOS_CONTRACTS } from "@/lib/nft/tezos-contracts";
import { buildTzip21, royaltyShare, tzip21Problems, type ArtworkDetails } from "@/lib/nft/tzip21";

const CID = {
  artifact: "bafybeiaz5ge24qwbtl5c24l6sg2dw2uk32hyziwzrixqtg3vnk6fvyph7q",
  display: "bafkreicnu2aqjkoglrlrd65giwo4l64pdajxffk6jtq2vb7yaiopc3yu7m",
  thumbnail: "bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
  licence: "bafkreifjjcie6lypi6ny7amxnfftagclbuxndqonfipmb64f2km2devei4",
};

const files: MintFiles = {
  artifact: { id: "a", cid: CID.artifact, mimeType: "image/png", size: 9_000_000, width: 4000, height: 6000, name: "dune.png" },
  display: { id: "d", cid: CID.display, mimeType: "image/jpeg", size: 700_000, width: 1365, height: 2048, name: "display.jpg" },
  thumbnail: { id: "t", cid: CID.thumbnail, mimeType: "image/jpeg", size: 30_000, width: 233, height: 350, name: "thumbnail.jpg" },
};

const artwork: ArtworkDetails = {
  title: "Dune",
  description: "Sand at dusk.",
  tags: ["fashion", "desert"],
  year: 2026,
  location: "Dubai, United Arab Emirates",
  event: "Light Study",
  people: ["Sara"],
  edition: { type: "1/1" },
};

const fields: MintFields = { floorMutez: 1_000_000, royaltyPercent: 10, commercialFloorMutez: null, showPeople: false };

const build = (over: { artwork?: Partial<ArtworkDetails>; fields?: Partial<MintFields> } = {}) =>
  buildTzip21({
    artwork: { ...artwork, ...over.artwork },
    fields: { ...fields, ...over.fields },
    files,
    licenceUri: `ipfs://${CID.licence}`,
    contracts: TEZOS_CONTRACTS,
    siteUrl: "https://hussain.art",
    now: new Date("2026-11-12T08:00:00.000Z"),
  });

const attribute = (metadata: Record<string, unknown>, name: string) =>
  (metadata.attributes as { name: string; value: string }[]).find((entry) => entry.name === name)?.value;

describe("buildTzip21", () => {
  test("writes what objkt and TzKT read, and passes its own check", () => {
    const metadata = build();
    expect(metadata).toMatchObject({
      name: "Dune",
      description: "Sand at dusk.",
      artifactUri: `ipfs://${CID.artifact}`,
      displayUri: `ipfs://${CID.display}`,
      thumbnailUri: `ipfs://${CID.thumbnail}`,
      creators: [TEZOS_CONTRACTS.creator],
      decimals: 0,
      isBooleanAmount: true,
      shouldPreferSymbol: false,
      symbol: "HART",
      date: "2026-11-12T08:00:00.000Z",
      tags: ["fashion", "desert"],
      rights: `© 2026 Hussain Marzooq. ${LICENCE_NAME}.`,
      rightsUri: `ipfs://${CID.licence}`,
      royalties: { decimals: "4", shares: { [TEZOS_CONTRACTS.payout]: "1000" } },
    });
    expect((metadata.formats as unknown[])[0]).toEqual({
      uri: `ipfs://${CID.artifact}`,
      mimeType: "image/png",
      fileSize: 9_000_000,
      fileName: "dune.png",
      dimensions: { value: "4000x6000", unit: "px" },
    });
    expect(tzip21Problems(metadata, TEZOS_CONTRACTS.payout)).toEqual([]);
  });

  test("the royalty always goes to the payout contract, never a wallet", () => {
    const shares = (build({ fields: { royaltyPercent: 7.5 } }).royalties as { shares: Record<string, string> }).shares;
    expect(shares).toEqual({ [TEZOS_CONTRACTS.payout]: "750" });
    expect(royaltyShare(25)).toBe("2500");
    expect(royaltyShare(0)).toBe("0");
  });

  test("people are named only when the switch is on", () => {
    expect(attribute(build(), "People")).toBeUndefined();
    expect(JSON.stringify(build())).not.toContain("Sara");
    expect(attribute(build({ fields: { showPeople: true } }), "People")).toBe("Sara");
  });

  test("the commercial rights line appears only when they are offered", () => {
    expect(attribute(build(), "Commercial rights")).toBeUndefined();
    expect(attribute(build({ fields: { commercialFloorMutez: 2_000_000 } }), "Commercial rights")).toBe(
      "When bought, they are recorded on-chain and travel with the token. Check https://hussain.art/nft"
    );
  });

  test("editions are labelled, and only a single copy is a boolean amount", () => {
    const limited = build({ artwork: { edition: { type: "limited", total: 25 } } });
    expect(attribute(limited, "Edition")).toBe("Edition of 25");
    expect(limited.isBooleanAmount).toBe(false);
    expect(attribute(build({ artwork: { edition: { type: "open", until: "2026-12-01T00:00:00" } } }), "Edition")).toBe("Open edition");
  });

  test("empty details are left out", () => {
    const metadata = build({ artwork: { description: "", year: null, location: "", event: "" } });
    expect(metadata).not.toHaveProperty("description");
    expect((metadata.attributes as { name: string }[]).map((entry) => entry.name)).toEqual(["Edition", "Licence"]);
  });
});

describe("tzip21Problems", () => {
  test.each([
    [{ name: "" }, "name is missing"],
    [{ artifactUri: "https://example.com/a.png" }, "artifactUri is not an ipfs:// link to a CIDv1"],
    [{ rightsUri: undefined }, "rightsUri is not an ipfs:// link to a CIDv1"],
    [{ decimals: 6 }, "decimals must be 0"],
    [{ creators: ["Hussain Marzooq"] }, "creators must be wallet addresses"],
    [{ formats: [] }, "formats must list the three files"],
    [{ royalties: { decimals: "4", shares: { tz1YQYn8X4XbLVwA8rtSXahJrej8Gd6dEsAP: "1000" } } }, "the royalty must go to the payout contract only"],
    [{ royalties: { decimals: "4", shares: { [TEZOS_CONTRACTS.payout]: "2501" } } }, "the royalty share must be 0 to 25%"],
    [{ royalties: { decimals: 4, shares: { [TEZOS_CONTRACTS.payout]: "1000" } } }, 'royalties.decimals must be "4"'],
  ])("reports %j", (change, problem) => {
    expect(tzip21Problems({ ...build(), ...change }, TEZOS_CONTRACTS.payout)).toContain(problem);
  });
});
