import type { Appearance } from "./types";

export function formatPlace(a: Appearance) {
  return [a.venue, a.city, a.country].filter(Boolean).join(" • ");
}

export function formatDates(a: Appearance) {
  return [a.dateFrom, a.dateTo].filter(Boolean).join(" → ");
}