import { describe, expect, test } from "vitest";
import {
  exactFileSize,
  isCidV1,
  isPinataFileId,
  mintFieldsForSave,
  mintFileClaims,
  mutezToTez,
  storedMintRecord,
  tezToMutez,
} from "@/lib/nft/mint-fields";

const ID = "01919457-c2c6-770e-9391-8c72c4f41f64";

describe("tez amounts", () => {
  test("convert exactly, with no floating point", () => {
    expect(tezToMutez("1")).toBe(1_000_000);
    expect(tezToMutez("0.1")).toBe(100_000);
    expect(tezToMutez("2.000001")).toBe(2_000_001);
    expect(tezToMutez(" 5555 ")).toBe(5_555_000_000);
    expect(tezToMutez(0.3)).toBe(300_000);
    expect(mutezToTez(2_500_000)).toBe("2.5");
    expect(mutezToTez(1_000_000)).toBe("1");
    expect(mutezToTez(1)).toBe("0.000001");
  });

  test("refuse anything that is not a plain amount", () => {
    for (const bad of ["", "abc", "-1", "1.0000001", "1e6", "1,5", ".5", "1.", "99999999999", null, {}, [], true]) {
      expect(tezToMutez(bad)).toBeNull();
    }
  });
});

describe("mintFieldsForSave", () => {
  const good = { floor: "1.5", royalty: "10", commercialFloor: "", showPeople: false };

  test("accepts the fields and stores mutez", () => {
    expect(mintFieldsForSave(good, true)).toEqual({
      ok: true,
      value: { floorMutez: 1_500_000, royaltyPercent: 10, commercialFloorMutez: null, showPeople: false },
    });
    expect(mintFieldsForSave({ ...good, royalty: "0", commercialFloor: "3", showPeople: true }, true)).toEqual({
      ok: true,
      value: { floorMutez: 1_500_000, royaltyPercent: 0, commercialFloorMutez: 3_000_000, showPeople: true },
    });
  });

  test.each([
    [{ ...good, floor: "0" }, true, "Floor price must be more than 0."],
    [{ ...good, floor: "free" }, true, "Floor price: use a number in tez, up to six decimals."],
    [{ ...good, royalty: "25.01" }, true, "Royalty: use a number from 0 to 25, up to two decimals."],
    [{ ...good, royalty: "-1" }, true, "Royalty: use a number from 0 to 25, up to two decimals."],
    [{ ...good, royalty: "" }, true, "Royalty: use a number from 0 to 25, up to two decimals."],
    [{ ...good, commercialFloor: "2" }, false, "Commercial rights are for single-copy artworks only."],
    [{ ...good, commercialFloor: "0" }, true, "Commercial rights floor must be more than 0."],
    [{ ...good, commercialFloor: { $gt: "" } }, true, "Commercial rights floor: use a number in tez, up to six decimals."],
    [{ ...good, showPeople: "yes" }, true, "Show people's names: on or off."],
    [null, true, "Floor price: use a number in tez, up to six decimals."],
    [[good], true, "Floor price: use a number in tez, up to six decimals."],
  ])("refuses %j", (input, single, error) => {
    expect(mintFieldsForSave(input, single)).toEqual({ ok: false, error });
  });

  test("royalty takes the maximum exactly", () => {
    expect(mintFieldsForSave({ ...good, royalty: "25" }, true).ok).toBe(true);
  });
});

describe("file claims", () => {
  const file = { id: ID, width: 4000, height: 6000 };

  test("keep only ids and pixel sizes", () => {
    const claims = mintFileClaims({ artifact: { ...file, cid: "x" }, display: file, thumbnail: file });
    const kept = { ...file, size: null };
    expect(claims).toEqual({ ok: true, value: { artifact: kept, display: kept, thumbnail: kept } });
    expect(mintFileClaims({ artifact: { ...file, size: 900 }, display: { ...file, size: -1 }, thumbnail: { ...file, size: "9" } })).toEqual({
      ok: true,
      value: { artifact: { ...file, size: 900 }, display: kept, thumbnail: kept },
    });
  });

  test.each([
    [{ display: file, thumbnail: file }, "artifact"],
    [{ artifact: file, display: { ...file, id: "../etc" }, thumbnail: file }, "display"],
    [{ artifact: file, display: file, thumbnail: { ...file, width: 0 } }, "thumbnail"],
    [{ artifact: { ...file, height: 1.5 }, display: file, thumbnail: file }, "artifact"],
    [{ artifact: { ...file, width: "4000" }, display: file, thumbnail: file }, "artifact"],
  ])("refuses %j", (input, kind) => {
    expect(mintFileClaims(input)).toEqual({ ok: false, error: `The ${kind} file is missing or not valid.` });
  });
});

test("the exact size is the browser's only when it is just under Pinata's", () => {
  expect(exactFileSize(10_333_960, 10_331_950)).toBe(10_331_950);
  expect(exactFileSize(5086, 5086)).toBe(5086);
  expect(exactFileSize(10_333_960, null)).toBe(10_333_960);
  expect(exactFileSize(10_333_960, 1)).toBe(10_333_960);
  expect(exactFileSize(10_333_960, 99_000_000)).toBe(10_333_960);
});

test("CID and file id checks", () => {
  expect(isCidV1("bafybeiaz5ge24qwbtl5c24l6sg2dw2uk32hyziwzrixqtg3vnk6fvyph7q")).toBe(true);
  expect(isCidV1("bafkreicnu2aqjkoglrlrd65giwo4l64pdajxffk6jtq2vb7yaiopc3yu7m")).toBe(true);
  expect(isCidV1("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG")).toBe(false);
  expect(isCidV1("bafy/../../x")).toBe(false);
  expect(isPinataFileId(ID)).toBe(true);
  expect(isPinataFileId(`${ID}/x`)).toBe(false);
});

test("a broken stored record reads as not built", () => {
  expect(storedMintRecord(null)).toBeNull();
  expect(storedMintRecord({ metadataUri: 5 })).toBeNull();
  expect(storedMintRecord({ metadataUri: "ipfs://x", files: {}, floorMutez: 1 })).not.toBeNull();
});
