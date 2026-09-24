import type { Appearance } from "./types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Renders a stored "YYYY-MM" value (from the appearance month picker) as
// "Month YYYY". Anything that doesn't match is returned as-is so legacy or
// partial values still display.
export function formatMonthYear(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value;

  const month = MONTH_NAMES[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}

export function formatPlace(a: Appearance) {
  return [a.venue, a.city, a.country].filter(Boolean).join(" • ");
}

export function formatDates(a: Appearance) {
  return [a.dateFrom, a.dateTo].filter(Boolean).map(formatMonthYear).join(" → ");
}