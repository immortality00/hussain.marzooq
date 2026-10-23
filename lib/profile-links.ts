import { LINKEDIN, SOCIAL_NETWORKS, linkHost, type ProfileRule, type SocialNetworkKey } from "@/lib/social-links";
import { isHttpUrl } from "@/lib/http-url";

// The About editor's profile links: pick a network and type the username, or pick
// Other site and type the whole address. Shared by the editor and the save route,
// so the address the editor previews is the one the server stores.

export const OTHER_SITE = "other";
export const MAX_PROFILE_LINKS = 20;
const MAX_NAME = 100;
const MAX_VALUE = 500;

export type ProfileNetworkKey = SocialNetworkKey | typeof LINKEDIN.key;
export type ProfileLinkKind = ProfileNetworkKey | typeof OTHER_SITE;
export type ProfileLinkRow = { network: ProfileLinkKind; value: string; shown: boolean };
type ProfileNetwork = { key: ProfileNetworkKey; label: string; hosts: readonly string[]; profile: ProfileRule };

const NETWORKS: readonly ProfileNetwork[] = [...SOCIAL_NETWORKS, LINKEDIN];
const FIRST: ProfileNetworkKey[] = ["instagram", "tiktok", "youtube", "vimeo", "behance", "linkedin", "facebook", "x", "threads", "opensea"];

// The picker's order: Hussain's networks first, the rest A–Z.
export const PROFILE_NETWORKS: readonly ProfileNetwork[] = [
  ...FIRST.map((key) => NETWORKS.find((network) => network.key === key)!),
  ...NETWORKS.filter((network) => !FIRST.includes(network.key)).sort((a, b) => a.label.localeCompare(b.label)),
];

export const profileNetwork = (key: string) => NETWORKS.find((network) => network.key === key) ?? null;

type Parsed = { address: string; name: string } | { error: string } | null;

const article = (label: string) => (/^[aeiox]/i.test(label) ? "an" : "a");
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function hostMatches(network: ProfileNetwork, url: URL) {
  const host = linkHost(url.href);
  return Boolean(host && network.hosts.some((known) => host === known || host.endsWith(`.${known}`)));
}

// `https://www.instagram.com/{name}/` → a pattern for the path. A path with a fixed
// part before the name (`/@{name}`, `/in/{name}`) also takes a page under the
// profile (`/@name/videos`); a bare `/{name}` does not, or `/p/abc` would read as "p".
function pathPattern(address: string) {
  const path = address.slice(address.indexOf("/", "https://".length));
  const [before, after] = path.replace(/\/$/, "").split("{name}");
  const tail = before === "/" ? "/?" : "(?:/.*)?";
  return new RegExp(`^${escapeRegExp(before!)}([^/]+)${escapeRegExp(after!)}${tail}$`, "i");
}

function decode(text: string) {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

function readPath(rule: ProfileRule, url: URL) {
  const path = rule.prefix ? url.pathname.replace(rule.prefix, "") : url.pathname;
  for (const address of rule.addresses) {
    const match = pathPattern(address).exec(path);
    const name = match && decode(match[1]!);
    if (name) return { address, name };
  }
  return null;
}

const fill = (address: string, name: string) =>
  address.replace("{name}", Array.from(name, (ch) => (/[A-Za-z0-9._~@-]/.test(ch) ? ch : encodeURIComponent(ch))).join(""));

function nameError(network: ProfileNetwork, name: string) {
  const { label, profile: rule } = network;
  const length = Array.from(name).length;
  if (rule.field === "number") {
    return /^[1-9][0-9]{6,14}$/.test(name) ? null : `not ${article(label)} ${label} number with its country code`;
  }
  if (length > MAX_NAME) return `usernames are at most ${MAX_NAME} characters`;
  const bad = Array.from(name).find((ch) => !rule.char.test(ch));
  if (bad) return `${label} usernames cannot contain ${/\s/.test(bad) ? "spaces" : `“${bad}”`}`;
  if (rule.max && length > rule.max) return `${label} usernames are at most ${rule.max} characters`;
  if (rule.reserved?.some((word) => word.toLowerCase() === name.toLowerCase())) {
    return `“${name}” is not ${article(label)} ${label} username`;
  }
  return null;
}

function asUrl(value: string) {
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  if (!isHttpUrl(withScheme)) return null;
  try {
    return new URL(withScheme);
  } catch {
    return null;
  }
}

// A scheme, a path, or the network's own host (`instagram.com`) means a pasted
// link rather than a username.
function looksLikeLink(network: ProfileNetwork, value: string) {
  const lower = value.toLowerCase().replace(/^www\./, "");
  return /^[a-z][a-z0-9+.-]*:/i.test(value) || value.includes("/") || network.hosts.includes(lower);
}

// What a typed value means for a network: `name`, `@name` or a full profile link
// all give the same address. Null when the field is empty.
function parse(network: ProfileNetwork, raw: string): Parsed {
  const value = raw.trim();
  if (!value) return null;
  const rule = network.profile;
  const { label } = network;

  if (looksLikeLink(network, value)) {
    const url = asUrl(value);
    if (!url || !hostMatches(network, url)) return { error: `not ${article(label)} ${label} address` };
    const read = readPath(rule, url);
    if (!read) return { error: `not a link to ${article(label)} ${label} profile` };
    const name = rule.lowercase ? read.name.toLowerCase() : read.name;
    const error = nameError(network, name);
    if (error) return { error };
    return { address: fill(rule.field === "link" ? read.address : rule.addresses[0]!, name), name };
  }

  if (rule.field === "link") return { error: `not a link to ${article(label)} ${label} profile` };
  const stripped = rule.field === "number" ? value.replace(/[\s()+.-]/g, "") : value.replace(/^@/, "");
  const name = rule.lowercase ? stripped.toLowerCase() : stripped;
  const error = nameError(network, name);
  return error ? { error } : { address: fill(rule.addresses[0]!, name), name };
}

// The address a row stands for; null when its field is empty.
export function profileLinkAddress(row: Pick<ProfileLinkRow, "network" | "value">): { address: string } | { error: string } | null {
  const value = row.value.trim();
  if (!value) return null;
  if (value.length > MAX_VALUE) return { error: "too long" };
  if (row.network === OTHER_SITE) return isHttpUrl(value) ? { address: value } : { error: "not a valid web address" };
  const network = profileNetwork(row.network);
  if (!network) return { error: "unknown network" };
  const parsed = parse(network, value);
  return parsed && "error" in parsed ? parsed : parsed && { address: parsed.address };
}

// A stored address as the editor shows it: network + username when it fits that
// network's rule, else Other site with the whole address.
export function profileLinkRow(link: string, shown: boolean): ProfileLinkRow {
  const url = asUrl(link.trim());
  const network = url && /^https?:\/\//i.test(link.trim()) ? NETWORKS.find((n) => hostMatches(n, url)) : undefined;
  const parsed = network ? parse(network, link) : null;
  if (!network || !parsed || "error" in parsed) return { network: OTHER_SITE, value: link, shown };
  const { field } = network.profile;
  const value = field === "link" ? parsed.address : field === "number" ? `+${parsed.name}` : parsed.name;
  return { network: network.key, value, shown };
}

export function profileLinkRows(profile: { links: readonly string[]; shownLinks: readonly string[] }) {
  const shown = new Set(profile.shownLinks);
  return profile.links.map((link) => profileLinkRow(link, shown.has(link)));
}

// Picking another network keeps the profile when the new network can show it:
// a username becomes the full address under Other site, and back.
export function withNetwork(row: ProfileLinkRow, network: ProfileLinkKind): ProfileLinkRow {
  const built = profileLinkAddress(row);
  if (!built || "error" in built) return { ...row, network };
  if (network === OTHER_SITE) return { ...row, network, value: built.address };
  const read = profileLinkRow(built.address, row.shown);
  return read.network === network ? read : { ...row, network };
}

// The rows a save sends, as the stored list of addresses. Empty rows are dropped;
// anything else that does not build is refused, naming the row.
export function linksFromRows(value: unknown): { links: string[]; shownLinks: string[] } | { error: string } {
  if (!Array.isArray(value)) return { error: "Profile links must be a list" };
  if (value.length > MAX_PROFILE_LINKS) return { error: `Keep profile links to ${MAX_PROFILE_LINKS} or fewer` };
  const links: string[] = [];
  const shownLinks: string[] = [];
  for (const [index, row] of value.entries()) {
    const { network, value: text, shown } = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
    if (typeof network !== "string" || typeof text !== "string") return { error: `Profile link ${index + 1} is not valid` };
    if (network !== OTHER_SITE && !profileNetwork(network)) return { error: `Profile link ${index + 1}: unknown network` };
    const built = profileLinkAddress({ network: network as ProfileLinkKind, value: text });
    if (!built) continue;
    if ("error" in built) return { error: `Profile link ${index + 1}: ${built.error}` };
    links.push(built.address);
    if (shown === true) shownLinks.push(built.address);
  }
  return { links, shownLinks };
}

// The address as the editor previews it: no scheme, no `www.`, no closing slash.
export const shortAddress = (address: string) =>
  address.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
