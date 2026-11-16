import { describe, expect, test } from "vitest";
import { isContractAddress, isWalletAddress, TEZOS_CONTRACTS, TOKEN_SYMBOL } from "@/lib/nft/tezos-contracts";

describe("Tezos contract constants", () => {
  test("are the addresses recorded for the tagged deployment", () => {
    expect(TEZOS_CONTRACTS).toEqual({
      network: "shadownet",
      tag: "tezos-shadownet-v2",
      payout: "KT1MMHoyb2hmQet7FcSJ9UvMqDtXf8PEuyPT",
      collection: "KT19Dsj3JFbFcAujxgmLSiTuT2TxH7WHqyJx",
      sale: "KT1FJAwejtFW4z8V81LBCkuMBDuBRdJU3b73",
      creator: "tz1YQYn8X4XbLVwA8rtSXahJrej8Gd6dEsAP",
    });
    expect(TOKEN_SYMBOL).toBe("HART");
  });

  test("each is a well-formed address of its kind, and all three contracts differ", () => {
    const { payout, collection, sale, creator } = TEZOS_CONTRACTS;
    for (const address of [payout, collection, sale]) expect(isContractAddress(address)).toBe(true);
    expect(isWalletAddress(creator)).toBe(true);
    expect(new Set([payout, collection, sale]).size).toBe(3);
  });

  test("address checks refuse lookalikes", () => {
    expect(isContractAddress("tz1YQYn8X4XbLVwA8rtSXahJrej8Gd6dEsAP")).toBe(false);
    expect(isContractAddress("KT1MMHoyb2hmQet7FcSJ9UvMqDtXf8PEuyP")).toBe(false);
    expect(isContractAddress("KT1MMHoyb2hmQet7FcSJ9UvMqDtXf8PEuyPT ")).toBe(false);
    expect(isWalletAddress("tz5YQYn8X4XbLVwA8rtSXahJrej8Gd6dEsAP")).toBe(false);
    expect(isWalletAddress("tz1YQYn8X4XbLVwA8rtSXahJrej8Gd6dEs0P")).toBe(false);
  });
});
