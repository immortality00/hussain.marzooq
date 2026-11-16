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
  tag: "tezos-shadownet-v2",
  payout: "KT1MMHoyb2hmQet7FcSJ9UvMqDtXf8PEuyPT",
  collection: "KT19Dsj3JFbFcAujxgmLSiTuT2TxH7WHqyJx",
  sale: "KT1FJAwejtFW4z8V81LBCkuMBDuBRdJU3b73",
  creator: "tz1YQYn8X4XbLVwA8rtSXahJrej8Gd6dEsAP",
};

export const TOKEN_SYMBOL = "HART";

const BASE58 = "[1-9A-HJ-NP-Za-km-z]";
const CONTRACT_ADDRESS = new RegExp(`^KT1${BASE58}{33}$`);
const WALLET_ADDRESS = new RegExp(`^tz[1-4]${BASE58}{33}$`);

export const isContractAddress = (value: string) => CONTRACT_ADDRESS.test(value);
export const isWalletAddress = (value: string) => WALLET_ADDRESS.test(value);
