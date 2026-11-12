import { describe, expect, test } from "vitest";
import { isContractAddress, isWalletAddress, TEZOS_CONTRACTS, TOKEN_SYMBOL } from "@/lib/nft/tezos-contracts";

describe("Tezos contract constants", () => {
  test("are the addresses recorded for the tagged deployment", () => {
    expect(TEZOS_CONTRACTS).toEqual({
      network: "shadownet",
      tag: "tezos-shadownet-v1",
      payout: "KT1BQMafNM1H67Tf4m7EtrAjsr1d3PvH9v3F",
      collection: "KT1CuxLwWSWuHysExf2GYJ3272xg7VnhoZdY",
      sale: "KT1R5nwPWnZivkF9W1qE1eEhfN7tgWrGNsdm",
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
    expect(isContractAddress("KT1BQMafNM1H67Tf4m7EtrAjsr1d3PvH9v3")).toBe(false);
    expect(isContractAddress("KT1BQMafNM1H67Tf4m7EtrAjsr1d3PvH9v3F ")).toBe(false);
    expect(isWalletAddress("tz5YQYn8X4XbLVwA8rtSXahJrej8Gd6dEsAP")).toBe(false);
    expect(isWalletAddress("tz1YQYn8X4XbLVwA8rtSXahJrej8Gd6dEs0P")).toBe(false);
  });
});
