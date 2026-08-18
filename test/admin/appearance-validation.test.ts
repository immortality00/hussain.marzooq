import { describe, expect, test } from "vitest";
import { appearanceError, findFirstAppearanceError } from "@/app/admin/(protected)/media/lib/utils";
import type { Appearance } from "@/app/admin/(protected)/media/lib/types";

function appearance(overrides: Partial<Appearance> = {}): Appearance {
  return {
    kind: "exhibited",
    title: "Solo Show",
    venue: "",
    city: "Dubai",
    country: "United Arab Emirates",
    locationId: "geoname-292223",
    lat: 25.2048,
    lon: 55.2708,
    dateFrom: "",
    dateTo: "",
    notes: "",
    link: "",
    ...overrides,
  };
}

describe("appearanceError", () => {
  test("is null when a title is present", () => {
    expect(appearanceError(appearance())).toBeNull();
  });

  test("flags a missing title (the silent-drop bug)", () => {
    expect(appearanceError(appearance({ title: "" }))).toBeTruthy();
    expect(appearanceError(appearance({ title: "   " }))).toBeTruthy();
  });

  test("a location alone is not enough to save", () => {
    expect(appearanceError(appearance({ title: "" }))).toBeTruthy();
  });
});

describe("findFirstAppearanceError", () => {
  test("returns null when every entry has a name", () => {
    expect(findFirstAppearanceError([appearance(), appearance({ kind: "featured" })])).toBeNull();
  });

  test("points to the first offending entry with its index and kind", () => {
    const result = findFirstAppearanceError([
      appearance(),
      appearance({ kind: "featured", title: "" }),
    ]);
    expect(result).not.toBeNull();
    expect(result?.index).toBe(1);
    expect(result?.kind).toBe("featured");
  });
});
