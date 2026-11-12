// What the admin sets before an artwork is registered on Tezos, and the files pinned for it.
// Shared by the editor (as-you-type checks) and the metadata route (the real gate).

export const ROYALTY_DEFAULT_PERCENT = 10;
export const ROYALTY_MAX_PERCENT = 25;
export const MUTEZ_PER_TEZ = 1_000_000;
const MAX_TEZ = 1_000_000_000;

export const MINT_FILE_KINDS = ["artifact", "display", "thumbnail"] as const;
export type MintFileKind = (typeof MINT_FILE_KINDS)[number];

export const DISPLAY_LONG_EDGE = 2048;
export const THUMBNAIL_LONG_EDGE = 350;

const MB = 1024 * 1024;

/** What each upload link allows. Over 100 MB needs Pinata's resumable upload, which is not built yet. */
export const MINT_FILE_RULES: Record<MintFileKind, { maxBytes: number; mimeTypes: string[] }> = {
  artifact: {
    maxBytes: 100 * MB,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/tiff", "image/gif", "video/mp4", "video/quicktime"],
  },
  display: { maxBytes: 10 * MB, mimeTypes: ["image/jpeg"] },
  thumbnail: { maxBytes: MB, mimeTypes: ["image/jpeg"] },
};

export type MintFile = {
  id: string;
  cid: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  name: string;
};

export type MintFiles = Record<MintFileKind, MintFile>;

export type MintFields = {
  floorMutez: number;
  royaltyPercent: number;
  /** Null = commercial rights are never offered for this artwork. Only a single-copy artwork can carry one. */
  commercialFloorMutez: number | null;
  showPeople: boolean;
};

export type MintRecord = MintFields & {
  chain: "tezos";
  network: string;
  files: MintFiles;
  metadataId: string;
  metadataUri: string;
  licenceUri: string;
  licenceVersion: string;
  builtAt: string;
};

export const isMintFileKind = (value: unknown): value is MintFileKind =>
  typeof value === "string" && (MINT_FILE_KINDS as readonly string[]).includes(value);

// A base32 CIDv1, the only form the collection contract accepts in a metadata link.
const CID_V1 = /^baf[a-z2-7]{50,100}$/;
export const isCidV1 = (value: unknown): value is string => typeof value === "string" && CID_V1.test(value);
export const ipfsUri = (cid: string) => `ipfs://${cid}`;

const PINATA_FILE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isPinataFileId = (value: unknown): value is string =>
  typeof value === "string" && PINATA_FILE_ID.test(value);

/** "2.5" → 2500000. Exact: no floating point, at most six decimals. Null for anything else. */
export function tezToMutez(value: unknown): number | null {
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  const match = /^(\d{1,10})(?:\.(\d{1,6}))?$/.exec(text);
  if (!match) return null;
  const whole = Number(match[1]);
  if (whole > MAX_TEZ) return null;
  return whole * MUTEZ_PER_TEZ + Number((match[2] ?? "").padEnd(6, "0"));
}

export function mutezToTez(mutez: number): string {
  const whole = Math.floor(mutez / MUTEZ_PER_TEZ);
  const rest = String(mutez % MUTEZ_PER_TEZ).padStart(6, "0").replace(/0+$/, "");
  return rest ? `${whole}.${rest}` : String(whole);
}

function royaltyOf(value: unknown): number | null {
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (!/^\d{1,2}(?:\.\d{1,2})?$/.test(text)) return null;
  const percent = Number(text);
  return percent <= ROYALTY_MAX_PERCENT ? percent : null;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** The mint fields as the server stores them, or the reason they are refused. */
export function mintFieldsForSave(input: unknown, singleCopy: boolean): Result<MintFields> {
  const source = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};

  const floorMutez = tezToMutez(source.floor);
  if (floorMutez === null) return { ok: false, error: "Floor price: use a number in tez, up to six decimals." };
  if (floorMutez <= 0) return { ok: false, error: "Floor price must be more than 0." };

  const royaltyPercent = royaltyOf(source.royalty);
  if (royaltyPercent === null) {
    return { ok: false, error: `Royalty: use a number from 0 to ${ROYALTY_MAX_PERCENT}, up to two decimals.` };
  }

  let commercialFloorMutez: number | null = null;
  const commercial = typeof source.commercialFloor === "string" ? source.commercialFloor.trim() : source.commercialFloor;
  if (commercial !== "" && commercial !== null && commercial !== undefined) {
    if (!singleCopy) return { ok: false, error: "Commercial rights are for single-copy artworks only." };
    commercialFloorMutez = tezToMutez(commercial);
    if (commercialFloorMutez === null) {
      return { ok: false, error: "Commercial rights floor: use a number in tez, up to six decimals." };
    }
    if (commercialFloorMutez <= 0) return { ok: false, error: "Commercial rights floor must be more than 0." };
  }

  if (typeof source.showPeople !== "boolean") return { ok: false, error: "Show people's names: on or off." };

  return { ok: true, value: { floorMutez, royaltyPercent, commercialFloorMutez, showPeople: source.showPeople } };
}

const dimension = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 100_000 ? value : null;

export type MintFileClaim = { id: string; width: number; height: number; size: number | null };

/** The three files the browser says it pinned: ids and pixel sizes only. Everything else is read from Pinata. */
export function mintFileClaims(input: unknown): Result<Record<MintFileKind, MintFileClaim>> {
  const source = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
  const claims = {} as Record<MintFileKind, MintFileClaim>;
  for (const kind of MINT_FILE_KINDS) {
    const entry = source[kind];
    const file = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    const width = dimension(file.width);
    const height = dimension(file.height);
    if (!isPinataFileId(file.id) || width === null || height === null) {
      return { ok: false, error: `The ${kind} file is missing or not valid.` };
    }
    const size = typeof file.size === "number" && Number.isInteger(file.size) && file.size > 0 ? file.size : null;
    claims[kind] = { id: file.id, width, height, size };
  }
  return { ok: true, value: claims };
}

// Pinata reports a large file a little bigger than it is (IPFS splits it into blocks and counts their wrapping).
// The browser knows the exact size, so its number is used when it is at most 1% + 1 KB under Pinata's.
export function exactFileSize(reported: number, claimed: number | null): number {
  if (claimed === null || claimed > reported) return reported;
  return reported - claimed <= reported * 0.01 + 1024 ? claimed : reported;
}

/** Reads a stored record back; a broken one reads as "not built". */
export function storedMintRecord(value: unknown): MintRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<MintRecord>;
  if (typeof record.metadataUri !== "string" || !record.files || typeof record.floorMutez !== "number") return null;
  return JSON.parse(JSON.stringify(record)) as MintRecord;
}
