import { ObjectId } from "mongodb";
import { getDb } from "@/lib/server/db";
import {
  normalizeLocationValue,
  resolveFallbackLocationById,
  resolveFallbackLocationByLabel,
  searchFallbackLocations,
  type ResolvedTestimonialLocation,
} from "@/lib/locations/testimonial-locations";

const LOCATION_COLLECTION = "testimonial_locations";

type LocationDocument = {
  _id?: ObjectId;
  geonameId?: string;
  label: string;
  name: string;
  asciiName: string;
  countryCode: string;
  countryName?: string | null;
  admin1Code?: string | null;
  lat: number;
  lon: number;
  population: number;
  searchNames: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toSearchResult(doc: LocationDocument): ResolvedTestimonialLocation {
  const id = doc.geonameId || (doc._id ? String(doc._id) : doc.label);

  return {
    id,
    label: doc.label,
    lat: doc.lat,
    lon: doc.lon,
    countryCode: doc.countryCode || null,
    population: typeof doc.population === "number" ? doc.population : null,
    source: "dataset",
  };
}

function isValidLocationDoc(doc: LocationDocument) {
  return (
    typeof doc.label === "string" &&
    doc.label.trim().length > 0 &&
    typeof doc.lat === "number" &&
    Number.isFinite(doc.lat) &&
    typeof doc.lon === "number" &&
    Number.isFinite(doc.lon)
  );
}

function dedupeLocations(locations: ResolvedTestimonialLocation[]) {
  const seen = new Set<string>();
  const result: ResolvedTestimonialLocation[] = [];

  for (const location of locations) {
    const key = `${normalizeLocationValue(location.label)}:${location.lat.toFixed(5)}:${location.lon.toFixed(5)}`;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(location);
  }

  return result;
}

export async function searchTestimonialLocations(query: string, limit = 8) {
  const normalizedQuery = normalizeLocationValue(query).slice(0, 120);

  if (normalizedQuery.length < 2) return [];

  const fallbackResults = searchFallbackLocations(normalizedQuery, limit);

  try {
    const db = await getDb();
    const collection = db.collection<LocationDocument>(LOCATION_COLLECTION);

    const prefixRegex = new RegExp(`^${escapeRegex(normalizedQuery)}`, "i");
    const containsRegex = new RegExp(escapeRegex(normalizedQuery), "i");

    const prefixDocs = await collection
      .find({ searchNames: prefixRegex })
      .sort({ population: -1, label: 1 })
      .limit(limit)
      .toArray();

    const remaining = Math.max(0, limit - prefixDocs.length);
    let containsDocs: LocationDocument[] = [];

    if (remaining > 0) {
      containsDocs = await collection
        .find({ searchNames: containsRegex })
        .sort({ population: -1, label: 1 })
        .limit(remaining)
        .toArray();
    }

    const datasetResults = [...prefixDocs, ...containsDocs]
      .filter(isValidLocationDoc)
      .map(toSearchResult);

    return dedupeLocations([...datasetResults, ...fallbackResults]).slice(0, limit);
  } catch {
    return fallbackResults;
  }
}

export async function resolveTestimonialLocationById(id: string) {
  const trimmedId = id.trim();

  if (!trimmedId) return null;

  const fallback = resolveFallbackLocationById(trimmedId);
  if (fallback) return fallback;

  try {
    const db = await getDb();
    const collection = db.collection<LocationDocument>(LOCATION_COLLECTION);

    const doc = await collection.findOne({ geonameId: trimmedId });

    if (!doc || !isValidLocationDoc(doc)) return null;

    return toSearchResult(doc);
  } catch {
    return null;
  }
}

export async function resolveTestimonialLocationByLabel(label: string) {
  const normalizedLabel = normalizeLocationValue(label).slice(0, 180);

  if (!normalizedLabel) return null;

  const fallback = resolveFallbackLocationByLabel(normalizedLabel);
  if (fallback) return fallback;

  try {
    const db = await getDb();
    const collection = db.collection<LocationDocument>(LOCATION_COLLECTION);

    const doc = await collection.findOne({ searchNames: normalizedLabel });

    if (!doc || !isValidLocationDoc(doc)) return null;

    return toSearchResult(doc);
  } catch {
    return null;
  }
}