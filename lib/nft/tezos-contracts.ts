// The Tezos contracts the site talks to. Constants in code, never database values:
// a changed address is a code change, reviewed and tested (test/nft/tezos-contracts.test.ts).
// Source and deployment record: github.com/immortality00/hussain-nft-contracts.

export type TezosNetwork = "shadownet" | "mainnet";

export type TezosContracts = {
  network: TezosNetwork;
  tag: string;
  payout: string;
  collection: string;
  sale: string;
  /** The collection's admin wallet: the creator written into every token's metadata. */
  creator: string;
};

export const TEZOS_CONTRACTS: TezosContracts = {
  network: "shadownet",
  tag: "tezos-shadownet-v1",
  payout: "KT1BQMafNM1H67Tf4m7EtrAjsr1d3PvH9v3F",
  collection: "KT1CuxLwWSWuHysExf2GYJ3272xg7VnhoZdY",
  sale: "KT1R5nwPWnZivkF9W1qE1eEhfN7tgWrGNsdm",
  creator: "tz1YQYn8X4XbLVwA8rtSXahJrej8Gd6dEsAP",
};

export const TOKEN_SYMBOL = "HART";

const BASE58 = "[1-9A-HJ-NP-Za-km-z]";
const CONTRACT_ADDRESS = new RegExp(`^KT1${BASE58}{33}$`);
const WALLET_ADDRESS = new RegExp(`^tz[1-4]${BASE58}{33}$`);

export const isContractAddress = (value: string) => CONTRACT_ADDRESS.test(value);
export const isWalletAddress = (value: string) => WALLET_ADDRESS.test(value);
