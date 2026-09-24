import type { UploadTarget } from "@/lib/client/cloudinary-direct-upload";
import type { LocationOption } from "./types";

export const MAX_REVIEW_PHOTOS = 12;

export const REVIEW_UPLOAD_TARGET: UploadTarget = {
  signEndpoint: "/api/testimonials/upload-signature",
  resourceType: "image",
};

export const UPLOAD_BUTTON_CLASS =
  "rounded-full border border-border/70 bg-background px-4 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-60";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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