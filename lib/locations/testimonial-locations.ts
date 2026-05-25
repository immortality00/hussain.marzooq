export type ResolvedTestimonialLocation = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  countryCode: string | null;
  population: number | null;
  source: "dataset" | "fallback";
};

export function normalizeLocationValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const FALLBACK_TESTIMONIAL_LOCATIONS: ResolvedTestimonialLocation[] = [
  {
    id: "fallback-dubai-ae",
    label: "Dubai, United Arab Emirates",
    lat: 25.2048,
    lon: 55.2708,
    countryCode: "AE",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-abu-dhabi-ae",
    label: "Abu Dhabi, United Arab Emirates",
    lat: 24.4539,
    lon: 54.3773,
    countryCode: "AE",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-manama-bh",
    label: "Manama, Bahrain",
    lat: 26.2235,
    lon: 50.5876,
    countryCode: "BH",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-riyadh-sa",
    label: "Riyadh, Saudi Arabia",
    lat: 24.7136,
    lon: 46.6753,
    countryCode: "SA",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-doha-qa",
    label: "Doha, Qatar",
    lat: 25.2854,
    lon: 51.531,
    countryCode: "QA",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-kuwait-kw",
    label: "Kuwait City, Kuwait",
    lat: 29.3759,
    lon: 47.9774,
    countryCode: "KW",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-muscat-om",
    label: "Muscat, Oman",
    lat: 23.588,
    lon: 58.3829,
    countryCode: "OM",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-amman-jo",
    label: "Amman, Jordan",
    lat: 31.9539,
    lon: 35.9106,
    countryCode: "JO",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-tokyo-jp",
    label: "Tokyo, Japan",
    lat: 35.6762,
    lon: 139.6503,
    countryCode: "JP",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-osaka-jp",
    label: "Osaka, Japan",
    lat: 34.6937,
    lon: 135.5023,
    countryCode: "JP",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-kyoto-jp",
    label: "Kyoto, Japan",
    lat: 35.0116,
    lon: 135.7681,
    countryCode: "JP",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-new-york-us",
    label: "New York, United States",
    lat: 40.7128,
    lon: -74.006,
    countryCode: "US",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-los-angeles-us",
    label: "Los Angeles, United States",
    lat: 34.0522,
    lon: -118.2437,
    countryCode: "US",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-london-gb",
    label: "London, United Kingdom",
    lat: 51.5072,
    lon: -0.1276,
    countryCode: "GB",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-paris-fr",
    label: "Paris, France",
    lat: 48.8566,
    lon: 2.3522,
    countryCode: "FR",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-amsterdam-nl",
    label: "Amsterdam, Netherlands",
    lat: 52.3676,
    lon: 4.9041,
    countryCode: "NL",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-mumbai-in",
    label: "Mumbai, India",
    lat: 19.076,
    lon: 72.8777,
    countryCode: "IN",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-new-delhi-in",
    label: "New Delhi, India",
    lat: 28.6139,
    lon: 77.209,
    countryCode: "IN",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-singapore-sg",
    label: "Singapore",
    lat: 1.3521,
    lon: 103.8198,
    countryCode: "SG",
    population: null,
    source: "fallback",
  },
  {
    id: "fallback-sydney-au",
    label: "Sydney, Australia",
    lat: -33.8688,
    lon: 151.2093,
    countryCode: "AU",
    population: null,
    source: "fallback",
  },
];

export function searchFallbackLocations(query: string, limit = 8) {
  const normalizedQuery = normalizeLocationValue(query);

  if (normalizedQuery.length < 2) return [];

  return FALLBACK_TESTIMONIAL_LOCATIONS.filter((location) =>
    normalizeLocationValue(location.label).includes(normalizedQuery)
  ).slice(0, limit);
}

export function resolveFallbackLocationById(id: string) {
  return FALLBACK_TESTIMONIAL_LOCATIONS.find((location) => location.id === id) ?? null;
}

export function resolveFallbackLocationByLabel(label: string) {
  const normalizedLabel = normalizeLocationValue(label);

  return (
    FALLBACK_TESTIMONIAL_LOCATIONS.find(
      (location) => normalizeLocationValue(location.label) === normalizedLabel
    ) ?? null
  );
}