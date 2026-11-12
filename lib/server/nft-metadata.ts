import type { Db, Document } from "mongodb";
import { ObjectId } from "mongodb";
import { asStringArray } from "@/app/api/_lib/common";
import { uniquePeopleIds } from "@/app/api/_lib/media";
import { LICENCE_FILE_NAME, LICENCE_TEXT, LICENCE_VERSION } from "@/lib/nft/licences";
import {
  exactFileSize,
  ipfsUri,
  MINT_FILE_KINDS,
  MINT_FILE_RULES,
  mintFileClaims,
  mintFieldsForSave,
  type MintFileClaim,
  type MintFileKind,
  type MintFiles,
  type MintRecord,
} from "@/lib/nft/mint-fields";
import { TEZOS_CONTRACTS } from "@/lib/nft/tezos-contracts";
import { buildTzip21, tzip21Problems, type ArtworkEdition } from "@/lib/nft/tzip21";
import { SITE_EMAIL_DOMAIN } from "@/lib/site-emails";
import { deletePinataFile, getPinataFile, listPinataFilesFor, pinText } from "./pinata";

// A token's metadata is final, so it never carries the address of whichever server built it (a dev server's localhost).
const PUBLIC_SITE = `https://${SITE_EMAIL_DOMAIN}`;

export type MetadataResult = { ok: true; mint: MintRecord } | { ok: false; status: number; error: string };

const refuse = (status: number, error: string): MetadataResult => ({ ok: false, status, error });

/** The edition as the item's NFT details state it, or why it cannot be minted. */
export function editionOf(doc: Document): ArtworkEdition | string {
  const nft = doc.nft && typeof doc.nft === "object" ? (doc.nft as Record<string, unknown>) : null;
  if (!asStringArray(doc.categories).includes("nft") || !nft) return "This item is not an NFT.";
  if (nft.onchain) return "This artwork is already registered. Its metadata is final.";
  if (nft.currency !== "XTZ") return "Set the currency to XTZ and save first.";
  if (doc.type === "embed") return "A video link cannot be minted. Upload the file.";
  if (nft.editionType === "1/1") return { type: "1/1" };
  if (nft.editionType === "limited") {
    const total = typeof nft.editionsTotal === "number" ? nft.editionsTotal : 0;
    return total >= 2 ? { type: "limited", total } : "A limited edition needs at least 2 copies. Save the NFT details first.";
  }
  if (nft.editionType === "open" && typeof nft.openUntil === "string") return { type: "open", until: nft.openUntil };
  return "Choose the edition type and save first.";
}

// Only people with a public profile can be named: a token's metadata can never be taken back.
async function publicPeopleNames(db: Db, doc: Document): Promise<string[]> {
  const ids = uniquePeopleIds(doc.peopleIds).filter((id) => ObjectId.isValid(id));
  if (!ids.length) return [];
  const people = await db
    .collection("people_profiles")
    .find({ _id: { $in: ids.map((id) => new ObjectId(id)) }, isPublic: true, isPrivate: { $ne: true } })
    .project({ name: 1 })
    .toArray();
  return people.map((person) => (typeof person.name === "string" ? person.name.trim() : "")).filter(Boolean);
}

async function verifiedFiles(mediaId: string, claims: Record<MintFileKind, MintFileClaim>) {
  const files = {} as MintFiles;
  for (const kind of MINT_FILE_KINDS) {
    const file = await getPinataFile(claims[kind].id);
    const rules = MINT_FILE_RULES[kind];
    if (file.keyvalues.media !== mediaId || file.keyvalues.kind !== kind) {
      return `The ${kind} file was not uploaded for this artwork.`;
    }
    if (!rules.mimeTypes.includes(file.mimeType) || file.size <= 0 || file.size > rules.maxBytes) {
      return `The ${kind} file is not an allowed type or size.`;
    }
    files[kind] = {
      id: file.id,
      cid: file.cid,
      mimeType: file.mimeType,
      size: exactFileSize(file.size, claims[kind].size),
      width: claims[kind].width,
      height: claims[kind].height,
      name: file.name.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100) || `${kind}`,
    };
  }
  return files;
}

// Files pinned for this artwork that the new record no longer uses: an earlier build's metadata,
// a replaced original. Pinata's Free plan holds 500 files, so they are removed. Never fails the build.
async function removeUnused(mediaId: string, keep: Set<string>) {
  try {
    const stale = (await listPinataFilesFor(mediaId)).filter((file) => !keep.has(file.id));
    await Promise.allSettled(stale.map((file) => deletePinataFile(file.id)));
  } catch (error) {
    console.error("[nft-metadata] could not remove unused files", error instanceof Error ? error.message : error);
  }
}

const fileNameOf = (title: string) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "artwork"}-metadata.json`;

/** Checks everything, pins the licence and the metadata, and stores the result on the media item. */
export async function buildNftMetadata(db: Db, doc: Document, body: Record<string, unknown>): Promise<MetadataResult> {
  const mediaId = String(doc._id);
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  if (!title) return refuse(400, "The artwork needs a title first.");

  const edition = editionOf(doc);
  if (typeof edition === "string") return refuse(400, edition);

  const fields = mintFieldsForSave(body.fields, edition.type === "1/1");
  if (!fields.ok) return refuse(400, fields.error);

  const claims = mintFileClaims(body.files);
  if (!claims.ok) return refuse(400, claims.error);

  const files = await verifiedFiles(mediaId, claims.value);
  if (typeof files === "string") return refuse(400, files);

  const licence = await pinText({
    name: LICENCE_FILE_NAME,
    text: LICENCE_TEXT,
    mimeType: "text/plain",
    keyvalues: { kind: "licence", version: LICENCE_VERSION },
  });

  const now = new Date();
  const metadata = buildTzip21({
    artwork: {
      title,
      description: typeof doc.description === "string" ? doc.description.trim() : "",
      tags: asStringArray(doc.tags),
      year: typeof doc.year === "number" ? doc.year : null,
      location: typeof doc.location === "string" ? doc.location : "",
      event: typeof doc.event === "string" ? doc.event : "",
      people: fields.value.showPeople ? await publicPeopleNames(db, doc) : [],
      edition,
    },
    fields: fields.value,
    files,
    licenceUri: ipfsUri(licence.cid),
    contracts: TEZOS_CONTRACTS,
    siteUrl: PUBLIC_SITE,
    now,
  });

  const problems = tzip21Problems(metadata, TEZOS_CONTRACTS.payout);
  if (problems.length) return refuse(500, `The metadata did not pass its check: ${problems.join("; ")}.`);

  const pinned = await pinText({
    name: fileNameOf(title),
    text: JSON.stringify(metadata, null, 2),
    mimeType: "application/json",
    keyvalues: { media: mediaId, kind: "metadata" },
  });

  const mint: MintRecord = {
    ...fields.value,
    chain: "tezos",
    network: TEZOS_CONTRACTS.network,
    files,
    metadataId: pinned.id,
    metadataUri: ipfsUri(pinned.cid),
    licenceUri: ipfsUri(licence.cid),
    licenceVersion: LICENCE_VERSION,
    builtAt: now.toISOString(),
  };

  // updatedAt is left alone on purpose: an open editor must not be told the item changed under it.
  const written = await db.collection("media").updateOne({ _id: doc._id, "nft.onchain": { $exists: false } }, { $set: { mint } });
  if (written.matchedCount === 0) {
    await deletePinataFile(pinned.id).catch(() => undefined);
    return refuse(409, "This artwork changed while its metadata was being built. Nothing was saved.");
  }

  await removeUnused(mediaId, new Set([pinned.id, ...MINT_FILE_KINDS.map((kind) => files[kind].id)]));
  return { ok: true, mint };
}
