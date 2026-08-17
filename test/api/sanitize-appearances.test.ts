import { describe, expect, test } from "vitest";
import { sanitizeAppearances } from "@/app/api/_lib/media";

function base(overrides: Record<string, unknown> = {}) {
  return {
    kind: "exhibited",
    title: "Show",
    venue: "Gallery",
    city: "Dubai",
    country: "United Arab Emirates",
    locationId: "geoname-292223",
    lat: 25.2048,
    lon: 55.2708,
    dateFrom: "2024",
    dateTo: "2025",
    notes: "",
    link: "",
    ...overrides,
  };
}

describe("sanitizeAppearances", () => {
  test("carries a fully resolved location through unchanged", () => {
    const out = sanitizeAppearances([base()]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      locationId: "geoname-292223",
      lat: 25.2048,
      lon: 55.2708,
      city: "Dubai",
      country: "United Arab Emirates",
    });
  });

  test("drops out-of-range coordinates and keeps the entry", () => {
    const out = sanitizeAppearances([base({ lat: 91, lon: 200 })]);
    expect(out).toHaveLength(1);
    expect(out[0].lat).toBeNull();
    expect(out[0].lon).toBeNull();
  });

  test("coerces missing / non-string locationId to null", () => {
    expect(sanitizeAppearances([base({ locationId: undefined })])[0].locationId).toBeNull();
    expect(sanitizeAppearances([base({ locationId: 42 })])[0].locationId).toBeNull();
    expect(sanitizeAppearances([base({ locationId: "  " })])[0].locationId).toBeNull();
  });

  test("accepts numeric strings for coordinates", () => {
    const out = sanitizeAppearances([base({ lat: "25.2048", lon: "55.2708" })]);
    expect(out[0].lat).toBe(25.2048);
    expect(out[0].lon).toBe(55.2708);
  });

  test("still requires a title or venue and a valid kind", () => {
    expect(sanitizeAppearances([base({ title: "", venue: "" })])).toHaveLength(0);
    expect(sanitizeAppearances([base({ kind: "other" })])).toHaveLength(0);
  });

  test("ignores non-array input", () => {
    expect(sanitizeAppearances(null)).toEqual([]);
    expect(sanitizeAppearances("nope")).toEqual([]);
  });
});
