import { ObjectId, type Db } from "mongodb";
import { asNumberOrNull, asString, asStringArray, isRecord } from "./common";

export type Appearance = {
  kind: "featured" | "exhibited";
  title: string;
  venue: string;
  city: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  notes: string;
  link: string;
};

export type NftCurrency = "ETH" | "SOL" | "XTZ" | "BTC";
export type NftEditionType = "1/1" | "limited" | "open";
export type NftStatus = "available" | "sold" | "coming-soon";

export type NftMeta = {
  price: number | null;
  currency: NftCurrency;
  editionType: NftEditionType;
  editionsTotal: number | null;
  editionsRemaining: number | null;
  openUntil: string | null;
  status: NftStatus;
  marketplaceUrl: string | null;
};

export type ResolvedPeopleSelection = {
  peopleIds: string[];
  people: string[];
};

export function sanitizeAppearances(v: unknown): Appearance[] {
  if (!Array.isArray(v)) return [];
  const out: Appearance[] = [];

  for (const item of v) {
    if (!isRecord(item)) continue;

    const kindRaw = asString(item.kind);
    const kind = kindRaw === "featured" ? "featured" : kindRaw === "exhibited" ? "exhibited" : null;
    if (!kind) continue;

    const title = asString(item.title).trim().slice(0, 160);
    const venue = asString(item.venue).trim().slice(0, 160);
    const city = asString(item.city).trim().slice(0, 120);
    const country = asString(item.country).trim().slice(0, 120);
    const dateFrom = asString(item.dateFrom).trim().slice(0, 32);
    const dateTo = asString(item.dateTo).trim().slice(0, 32);
    const notes = asString(item.notes).trim().slice(0, 2000);
    const link = asString(item.link).trim().slice(0, 500);

    if (!title && !venue) continue;

    out.push({ kind, title, venue, city, country, dateFrom, dateTo, notes, link });
    if (out.length >= 50) break;
  }

  return out;
}

export function isCloudinarySecureUrl(url: string): boolean {
  return /^https:\/\/res\.cloudinary\.com\//i.test(url.trim());
}

export function getMediaLists(v: Record<string, unknown>) {
  return {
    tags: asStringArray(v.tags),
    categories: asStringArray(v.categories),
    peopleIds: asStringArray(v.peopleIds),
  };
}

export async function resolvePeopleSelection(
  db: Db,
  input: {
    peopleIds?: string[];
  }
): Promise<ResolvedPeopleSelection> {
  const rawIds = Array.isArray(input.peopleIds) ? input.peopleIds : [];
  const uniqueIds = Array.from(
    new Set(
      rawIds
        .map((value) => value.trim())
        .filter((value) => ObjectId.isValid(value))
    )
  ).slice(0, 60);

  if (uniqueIds.length === 0) {
    return { peopleIds: [], people: [] };
  }

  const docs = await db
    .collection("people_profiles")
    .find(
      { _id: { $in: uniqueIds.map((value) => new ObjectId(value)) } },
      { projection: { _id: 1, name: 1 } }
    )
    .toArray();

  const nameById = new Map(
    docs
      .filter((doc) => typeof doc.name === "string" && doc.name.trim())
      .map((doc) => [String(doc._id), String(doc.name).trim()])
  );

  const peopleIds: string[] = [];
  const people: string[] = [];

  for (const id of uniqueIds) {
    const name = nameById.get(id);
    if (!name) continue;
    peopleIds.push(id);
    people.push(name);
  }

  return { peopleIds, people };
}

function toPositiveInt(v: unknown): number | null {
  const n = asNumberOrNull(v);
  if (n === null) return null;
  const rounded = Math.floor(n);
  return rounded >= 1 ? rounded : null;
}

function normalizeCurrency(v: string): NftCurrency | null {
  const value = v.trim().toUpperCase();
  if (value === "ETH" || value === "SOL" || value === "XTZ" || value === "BTC") return value;
  return null;
}

function normalizeEditionType(v: string): NftEditionType | null {
  if (v === "1/1" || v === "limited" || v === "open") return v;
  return null;
}

function normalizeStatus(v: string): NftStatus | null {
  if (v === "available" || v === "sold" || v === "coming-soon") return v;
  return null;
}

function parseFutureDateTimeString(v: unknown): string | null {
  const raw = asString(v).trim();
  if (!raw) return null;

  const normalized = raw.length === 16 ? `${raw}:00` : raw;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() <= Date.now()) return null;

  return normalized.slice(0, 19);
}

export function parseNftMeta(
  input: unknown,
  enabled: boolean
): { ok: true; value: NftMeta | null } | { ok: false; error: string } {
  if (!enabled) return { ok: true, value: null };

  const source = isRecord(input) && isRecord(input.nft) ? input.nft : isRecord(input) ? input : {};

  const currency = normalizeCurrency(asString(source.currency));
  if (!currency) return { ok: false, error: "Choose a valid NFT currency." };

  const editionType = normalizeEditionType(asString(source.editionType));
  if (!editionType) return { ok: false, error: "Choose a valid edition type." };

  const status = normalizeStatus(asString(source.status));
  if (!status) return { ok: false, error: "Choose a valid NFT status." };

  const marketplaceUrlRaw = asString(source.marketplaceUrl).trim();
  if (marketplaceUrlRaw && !marketplaceUrlRaw.startsWith("https://")) {
    return { ok: false, error: "Marketplace URL must start with https://." };
  }

  const price = asNumberOrNull(source.price);

  let editionsTotal: number | null = null;
  let editionsRemaining: number | null = null;
  let openUntil: string | null = null;

  if (editionType === "1/1") {
    editionsTotal = 1;
    editionsRemaining = status === "sold" ? 0 : 1;
  } else if (editionType === "limited") {
    editionsTotal = toPositiveInt(source.editionsTotal);
    if (!editionsTotal) return { ok: false, error: "Total editions is required for limited editions." };

    if (status === "sold") {
      editionsRemaining = 0;
    } else {
      const parsedRemaining = toPositiveInt(source.editionsRemaining);
      if (parsedRemaining === null && asNumberOrNull(source.editionsRemaining) === 0) {
        editionsRemaining = 0;
      } else {
        editionsRemaining = parsedRemaining;
      }
    }

    if (editionsRemaining === null || editionsRemaining < 0) {
      return { ok: false, error: "Remaining editions is required for limited editions." };
    }

    if (editionsRemaining > editionsTotal) {
      return { ok: false, error: "Remaining editions cannot be higher than total editions." };
    }
  } else {
    openUntil = parseFutureDateTimeString(source.openUntil);
    if (!openUntil) {
      return { ok: false, error: "Open edition end date and time must be in the future." };
    }
  }

  return {
    ok: true,
    value: {
      price,
      currency,
      editionType,
      editionsTotal,
      editionsRemaining,
      openUntil,
      status,
      marketplaceUrl: marketplaceUrlRaw || null,
    },
  };
}