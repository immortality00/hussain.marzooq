import { LICENCE_NAME, rightsStatement } from "./licences";
import { ipfsUri, isCidV1, MINT_FILE_KINDS, type MintFields, type MintFiles } from "./mint-fields";
import { isContractAddress, isWalletAddress, TOKEN_SYMBOL, type TezosContracts } from "./tezos-contracts";

// A token's metadata in the TZIP-21 format, as objkt and TzKT read it. Final once registered:
// nothing in it can be changed later, so it holds only what will stay true.

export type ArtworkEdition =
  | { type: "1/1" }
  | { type: "limited"; total: number }
  | { type: "open"; until: string };

export type ArtworkDetails = {
  title: string;
  description: string;
  tags: string[];
  year: number | null;
  location: string;
  event: string;
  people: string[];
  edition: ArtworkEdition;
};

export type Tzip21 = Record<string, unknown>;

const editionLabel = (edition: ArtworkEdition) =>
  edition.type === "1/1"
    ? "1/1"
    : edition.type === "limited"
      ? `Edition of ${edition.total}`
      : "Open edition";

/** Royalty shares use four decimals: 10% is "1000". */
export const royaltyShare = (percent: number) => String(Math.round(percent * 100));

export function buildTzip21(input: {
  artwork: ArtworkDetails;
  fields: MintFields;
  files: MintFiles;
  licenceUri: string;
  contracts: TezosContracts;
  siteUrl: string;
  now: Date;
}): Tzip21 {
  const { artwork, fields, files, contracts } = input;

  const attributes: { name: string; value: string }[] = [{ name: "Edition", value: editionLabel(artwork.edition) }];
  if (artwork.year) attributes.push({ name: "Year", value: String(artwork.year) });
  if (artwork.location) attributes.push({ name: "Location", value: artwork.location });
  if (artwork.event) attributes.push({ name: "Event", value: artwork.event });
  if (fields.showPeople && artwork.people.length) {
    attributes.push({ name: "People", value: artwork.people.join(", ") });
  }
  attributes.push({ name: "Licence", value: LICENCE_NAME });
  if (fields.commercialFloorMutez !== null) {
    attributes.push({
      name: "Commercial rights",
      value: `When bought, they are recorded on-chain and travel with the token. Check ${input.siteUrl}/nft`,
    });
  }

  const metadata: Tzip21 = {
    name: artwork.title,
    ...(artwork.description ? { description: artwork.description } : {}),
    artifactUri: ipfsUri(files.artifact.cid),
    displayUri: ipfsUri(files.display.cid),
    thumbnailUri: ipfsUri(files.thumbnail.cid),
    formats: MINT_FILE_KINDS.map((kind) => ({
      uri: ipfsUri(files[kind].cid),
      mimeType: files[kind].mimeType,
      fileSize: files[kind].size,
      fileName: files[kind].name,
      dimensions: { value: `${files[kind].width}x${files[kind].height}`, unit: "px" },
    })),
    creators: [contracts.creator],
    minter: contracts.creator,
    publishers: ["Hussain.Art"],
    decimals: 0,
    isBooleanAmount: artwork.edition.type === "1/1",
    shouldPreferSymbol: false,
    symbol: TOKEN_SYMBOL,
    date: input.now.toISOString(),
    tags: artwork.tags,
    language: "en",
    attributes,
    rights: rightsStatement(input.now.getUTCFullYear()),
    rightsUri: input.licenceUri,
    royalties: { decimals: "4", shares: { [contracts.payout]: royaltyShare(fields.royaltyPercent) } },
  };

  return metadata;
}

const isIpfsUri = (value: unknown) => typeof value === "string" && value.startsWith("ipfs://") && isCidV1(value.slice(7));
const isText = (value: unknown) => typeof value === "string" && value.trim().length > 0;

/** Everything wrong with a metadata object, in words. Empty = it passes. Run before anything is pinned. */
export function tzip21Problems(metadata: Tzip21, payout: string): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, text: string) => {
    if (!ok) problems.push(text);
  };

  need(isText(metadata.name), "name is missing");
  for (const key of ["artifactUri", "displayUri", "thumbnailUri", "rightsUri"]) {
    need(isIpfsUri(metadata[key]), `${key} is not an ipfs:// link to a CIDv1`);
  }
  need(metadata.decimals === 0, "decimals must be 0");
  need(typeof metadata.isBooleanAmount === "boolean", "isBooleanAmount is missing");
  need(isText(metadata.symbol), "symbol is missing");
  need(isText(metadata.rights), "rights is missing");
  need(typeof metadata.date === "string" && !Number.isNaN(Date.parse(metadata.date)), "date is not a date");
  need(
    Array.isArray(metadata.creators) && metadata.creators.length > 0 && metadata.creators.every((c) => isWalletAddress(String(c))),
    "creators must be wallet addresses"
  );
  need(Array.isArray(metadata.tags) && metadata.tags.every(isText), "tags must be text");

  const formats = Array.isArray(metadata.formats) ? (metadata.formats as Record<string, unknown>[]) : [];
  need(formats.length === 3, "formats must list the three files");
  for (const format of formats) {
    const dimensions = format.dimensions as { value?: unknown; unit?: unknown } | undefined;
    need(
      isIpfsUri(format.uri) &&
        isText(format.mimeType) &&
        typeof format.fileSize === "number" &&
        format.fileSize > 0 &&
        typeof dimensions?.value === "string" &&
        /^\d+x\d+$/.test(dimensions.value) &&
        dimensions.unit === "px",
      "a format entry is incomplete"
    );
  }
  for (const key of ["artifactUri", "displayUri", "thumbnailUri"]) {
    need(formats.some((format) => format.uri === metadata[key]), `${key} has no format entry`);
  }

  const royalties = metadata.royalties as { decimals?: unknown; shares?: Record<string, unknown> } | undefined;
  const shares = royalties?.shares && typeof royalties.shares === "object" ? Object.entries(royalties.shares) : [];
  need(royalties?.decimals === "4", "royalties.decimals must be \"4\"");
  need(
    shares.length === 1 && shares[0][0] === payout && isContractAddress(payout),
    "the royalty must go to the payout contract only"
  );
  need(
    shares.length === 1 && /^\d+$/.test(String(shares[0][1])) && Number(shares[0][1]) <= 2500,
    "the royalty share must be 0 to 25%"
  );

  return problems;
}
