import type { LocationOption } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isLocationOption(value: unknown): value is LocationOption {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.lat === "number" &&
    Number.isFinite(value.lat) &&
    typeof value.lon === "number" &&
    Number.isFinite(value.lon) &&
    (typeof value.countryCode === "string" || value.countryCode === null) &&
    (typeof value.population === "number" || value.population === null) &&
    (value.source === "dataset" || value.source === "fallback")
  );
}