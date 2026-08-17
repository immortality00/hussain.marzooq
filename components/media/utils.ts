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

export function toEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  let u: URL;
  try {
    u = new URL(input);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = u.searchParams.get("v");
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  if (host === "youtu.be") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }

  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0];
    if (!id) return null;
    return `https://player.vimeo.com/video/${id}`;
  }

  if (host === "player.vimeo.com") return input;
  if (host === "youtube-nocookie.com") return input;
  if (host === "youtube.com" && u.pathname.includes("/embed/")) return input;

  return null;
}