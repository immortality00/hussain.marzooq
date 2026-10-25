import { SITE_EMAIL, SITE_EMAIL_DOMAIN } from "@/lib/site-emails";

/** One address in the list visitors see (footer and Contact). Edited in Pages → Contact. */
export type EmailListItem = { label: string; address: string; shown: boolean };

export const EMAIL_LIST_MAX = 10;
export const EMAIL_LABEL_MAX = 60;
export const EMAIL_HEADING_MAX = 120;
const LOCAL_PART_MAX = 64;

/** What visitors see until the list is saved in admin. */
export const DEFAULT_EMAIL_LIST: EmailListItem[] = [
  { label: "Bookings", address: SITE_EMAIL.book, shown: true },
  { label: "Inquiries", address: SITE_EMAIL.inquiries, shown: true },
  { label: "Press & galleries", address: SITE_EMAIL.press, shown: true },
  { label: "Privacy", address: SITE_EMAIL.privacy, shown: true },
  { label: "Hussain directly", address: SITE_EMAIL.hussain, shown: true },
];

export const SITE_EMAIL_SUFFIX = `@${SITE_EMAIL_DOMAIN}`;

/** The name before @hussain.art; a value on any other domain comes back whole. */
export function localPartOf(address: string): string {
  return address.toLowerCase().endsWith(SITE_EMAIL_SUFFIX) ? address.slice(0, -SITE_EMAIL_SUFFIX.length) : address;
}

/** A name typed in the editor as a full address. A pasted "@hussain.art" ending is not doubled. */
export function siteAddressOf(name: string): string {
  return `${localPartOf(name.trim())}${SITE_EMAIL_SUFFIX}`;
}

const LOCAL_PART = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

/** Why the name before @hussain.art can't be used, or null. iCloud allows letters, numbers, `.`, `-` and `_`. */
export function localPartError(name: string): string | null {
  const value = name.trim().toLowerCase();
  if (!value) return `add the name before ${SITE_EMAIL_SUFFIX}`;
  if (value.length > LOCAL_PART_MAX) return `the name before ${SITE_EMAIL_SUFFIX} is over ${LOCAL_PART_MAX} characters`;
  if (!LOCAL_PART.test(value) || value.includes("..")) {
    return `use letters, numbers, dots, hyphens or underscores before ${SITE_EMAIL_SUFFIX}, starting and ending with a letter or number`;
  }
  return null;
}

function rowError(row: Record<string, unknown>): string | null {
  if (row.label !== undefined && typeof row.label !== "string") return "the label must be text";
  if (typeof row.label === "string" && row.label.trim().length > EMAIL_LABEL_MAX) {
    return `the label is over ${EMAIL_LABEL_MAX} characters`;
  }
  if (typeof row.address !== "string") return "the address must be text";
  const address = row.address.trim().toLowerCase();
  if (!address.endsWith(SITE_EMAIL_SUFFIX)) return `only ${SITE_EMAIL_SUFFIX} addresses can be listed`;
  return localPartError(localPartOf(address));
}

const isBlankRow = (row: Record<string, unknown>) =>
  (typeof row.label !== "string" || !row.label.trim()) &&
  (typeof row.address !== "string" || !localPartOf(row.address.trim()).trim());

/** The list as stored: trimmed, lowercase addresses, empty rows dropped. A bad row is refused by its number. */
export function emailListForSave(value: unknown): { emails: EmailListItem[] } | { error: string } {
  if (!Array.isArray(value) || value.length > EMAIL_LIST_MAX * 5) return { error: "The email list must be a list." };
  const emails: EmailListItem[] = [];
  for (const [index, row] of value.entries()) {
    const n = index + 1;
    if (!row || typeof row !== "object" || Array.isArray(row)) return { error: `Email ${n}: not a valid row.` };
    const item = row as Record<string, unknown>;
    if (isBlankRow(item)) continue;
    const error = rowError(item);
    if (error) return { error: `Email ${n}: ${error}.` };
    const address = (item.address as string).trim().toLowerCase();
    if (emails.some((saved) => saved.address === address)) return { error: `Email ${n}: ${address} is already in the list.` };
    emails.push({ label: typeof item.label === "string" ? item.label.trim() : "", address, shown: item.shown === true });
  }
  if (emails.length > EMAIL_LIST_MAX) return { error: `The list takes up to ${EMAIL_LIST_MAX} addresses.` };
  return { emails };
}

/** The rows set to On site, in order. Anything malformed in a stored list is left out. */
export function shownEmails(list: unknown): EmailListItem[] {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item): item is EmailListItem =>
      Boolean(item) && typeof item.address === "string" && item.address !== "" && item.shown === true
  ).map((item) => ({ ...item, label: typeof item.label === "string" ? item.label : "" }));
}
