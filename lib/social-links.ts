import { isSectionImage, type SectionImage } from "@/lib/page-sections-shared";

// How the About editor turns what is typed into a profile address
// (lib/profile-links.ts). `{name}` is the username: the first address is the one
// built, the others are also read from a pasted link. A "link" network keeps the
// address shape that was pasted; a "number" network takes a phone number.
export type ProfileRule = {
  field: "name" | "number" | "link";
  addresses: readonly string[];
  // One character a username may contain.
  char: RegExp;
  max?: number;
  lowercase?: boolean;
  reserved?: readonly string[];
  // A path segment links may carry before the profile path.
  prefix?: RegExp;
};

const username = (addresses: string[], char: RegExp, max?: number, extra?: Partial<ProfileRule>): ProfileRule => ({
  field: "name",
  addresses,
  char,
  max,
  ...extra,
});

// Checked 2026-10-24 against one live profile per network. Character sets follow
// each network's published rules; where those disagree or are unpublished, the
// wider set, so a real username is never refused.
const NAME_CHARS = /[A-Za-z0-9._-]/;

// Networks drawn from the built-in icon set (components/site/social-icons.ts).
// A link matches when its host is one of these or a subdomain of one, so
// `m.youtube.com` matches and `instagram.com.example.org` does not.
export const SOCIAL_NETWORKS = [
  { key: "instagram", label: "Instagram", hosts: ["instagram.com", "instagr.am"], profile: username(["https://www.instagram.com/{name}/"], /[A-Za-z0-9._]/, 30) },
  { key: "facebook", label: "Facebook", hosts: ["facebook.com", "fb.com"], profile: username(["https://www.facebook.com/{name}"], /[A-Za-z0-9.]/, undefined, { reserved: ["profile.php"] }) },
  { key: "threads", label: "Threads", hosts: ["threads.net", "threads.com"], profile: username(["https://www.threads.com/@{name}"], /[A-Za-z0-9._]/, 30) },
  { key: "x", label: "X", hosts: ["x.com", "twitter.com"], profile: username(["https://x.com/{name}"], /[A-Za-z0-9_]/, 15) },
  { key: "tiktok", label: "TikTok", hosts: ["tiktok.com"], profile: username(["https://www.tiktok.com/@{name}"], /[A-Za-z0-9._]/, 24) },
  { key: "youtube", label: "YouTube", hosts: ["youtube.com", "youtu.be"], profile: username(["https://www.youtube.com/@{name}"], /[\p{L}\p{N}\p{M}._·-]/u, 30) },
  { key: "vimeo", label: "Vimeo", hosts: ["vimeo.com"], profile: username(["https://vimeo.com/{name}"], NAME_CHARS) },
  { key: "behance", label: "Behance", hosts: ["behance.net"], profile: username(["https://www.behance.net/{name}"], NAME_CHARS) },
  { key: "dribbble", label: "Dribbble", hosts: ["dribbble.com"], profile: username(["https://dribbble.com/{name}"], NAME_CHARS) },
  { key: "artstation", label: "ArtStation", hosts: ["artstation.com"], profile: username(["https://www.artstation.com/{name}"], NAME_CHARS) },
  { key: "500px", label: "500px", hosts: ["500px.com"], profile: username(["https://500px.com/p/{name}"], NAME_CHARS) },
  { key: "flickr", label: "Flickr", hosts: ["flickr.com", "flic.kr"], profile: username(["https://www.flickr.com/photos/{name}/", "https://www.flickr.com/people/{name}/"], /[A-Za-z0-9._@-]/) },
  { key: "vsco", label: "VSCO", hosts: ["vsco.co"], profile: username(["https://vsco.co/{name}/gallery", "https://vsco.co/{name}"], NAME_CHARS) },
  { key: "pinterest", label: "Pinterest", hosts: ["pinterest.com", "pin.it"], profile: username(["https://www.pinterest.com/{name}/"], /[A-Za-z0-9._]/, 30) },
  { key: "tumblr", label: "Tumblr", hosts: ["tumblr.com"], profile: username(["https://www.tumblr.com/{name}"], /[A-Za-z0-9-]/, 32) },
  { key: "snapchat", label: "Snapchat", hosts: ["snapchat.com"], profile: username(["https://www.snapchat.com/@{name}", "https://www.snapchat.com/add/{name}"], NAME_CHARS) },
  { key: "spotify", label: "Spotify", hosts: ["spotify.com"], profile: { field: "link", addresses: ["https://open.spotify.com/artist/{name}", "https://open.spotify.com/user/{name}"], char: NAME_CHARS, prefix: /^\/intl-[a-z-]+(?=\/)/i } },
  { key: "soundcloud", label: "SoundCloud", hosts: ["soundcloud.com"], profile: username(["https://soundcloud.com/{name}"], /[A-Za-z0-9_-]/, 25, { lowercase: true }) },
  { key: "github", label: "GitHub", hosts: ["github.com"], profile: username(["https://github.com/{name}"], /[A-Za-z0-9-]/, 39) },
  { key: "telegram", label: "Telegram", hosts: ["t.me", "telegram.me"], profile: username(["https://t.me/{name}"], /[A-Za-z0-9_]/, 32) },
  { key: "whatsapp", label: "WhatsApp", hosts: ["wa.me", "whatsapp.com"], profile: { field: "number", addresses: ["https://wa.me/{name}"], char: /[0-9]/, max: 15 } },
  { key: "opensea", label: "OpenSea", hosts: ["opensea.io"], profile: username(["https://opensea.io/{name}"], NAME_CHARS) },
  { key: "rarible", label: "Rarible", hosts: ["rarible.com"], profile: username(["https://rarible.com/{name}"], NAME_CHARS) },
] as const;

// In the editor's picker, but not in the built-in icon set (Simple Icons dropped
// it), so its icon is fetched like any other site's.
export const LINKEDIN = {
  key: "linkedin",
  label: "LinkedIn",
  hosts: ["linkedin.com"],
  profile: username(["https://www.linkedin.com/in/{name}/"], /[\p{L}\p{N}\p{M}-]/u, 100),
} as const;

export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];
export type SocialNetworkKey = SocialNetwork["key"];

// The column holds at most this many icons; the profile keeps every link for search.
export const SOCIAL_DOCK_MAX = 8;

export type LinkLogo = { host: string; image: SectionImage };

export type SocialItem =
  | { href: string; label: string; network: SocialNetworkKey }
  | { href: string; label: string; logo: string };

const HOST_LABEL = /^[a-z0-9-]{1,63}$/;
const MAX_HOST = 253;

function parseHttpUrl(link: string): URL | null {
  try {
    const url = new URL(link.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function hostLabelsValid(host: string) {
  const labels = host.split(".");
  return (
    labels.length >= 2 &&
    labels.every((label) => HOST_LABEL.test(label) && !label.startsWith("-") && !label.endsWith("-")) &&
    !/^\d+$/.test(labels[labels.length - 1]!)
  );
}

// The site a link points at, lower-case and without `www.`. Null for anything that
// is not a public domain name: IP addresses, `localhost`, single-label hosts.
export function linkHost(link: string): string | null {
  const url = parseHttpUrl(link);
  if (!url) return null;
  const host = url.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
  if (!host || host.length > MAX_HOST || !hostLabelsValid(host)) return null;
  return host;
}

export function socialNetworkOf(link: string): SocialNetwork | null {
  const host = linkHost(link);
  if (!host) return null;
  return (
    SOCIAL_NETWORKS.find((network) =>
      network.hosts.some((known) => host === known || host.endsWith(`.${known}`))
    ) ?? null
  );
}

// Sites whose links have no built-in icon, so their own logo is fetched instead.
export function hostsNeedingLogo(links: readonly string[]): string[] {
  const hosts = new Set<string>();
  for (const link of links) {
    if (socialNetworkOf(link)) continue;
    const host = linkHost(link);
    if (host) hosts.add(host);
  }
  return Array.from(hosts);
}

export function isLinkLogo(value: unknown): value is LinkLogo {
  if (!value || typeof value !== "object") return false;
  const { host, image } = value as Record<string, unknown>;
  return typeof host === "string" && Boolean(host) && isSectionImage(image) && Boolean(image.url);
}

export function linkLogosOf(value: unknown): LinkLogo[] {
  return Array.isArray(value) ? value.filter(isLinkLogo) : [];
}

// What the column shows, in the profile's order: a built-in icon, else the site's
// stored logo, else nothing.
export function socialItems(links: readonly string[], logos: readonly LinkLogo[]): SocialItem[] {
  const logoByHost = new Map(logos.map((logo) => [logo.host, logo.image.url]));
  const seen = new Set<string>();
  const items: SocialItem[] = [];

  for (const raw of links) {
    const url = parseHttpUrl(raw);
    if (!url || seen.has(url.href)) continue;

    const network = socialNetworkOf(url.href);
    const host = linkHost(url.href);
    const logo = host ? logoByHost.get(host) : undefined;
    if (network) items.push({ href: url.href, label: network.label, network: network.key });
    else if (host && logo) items.push({ href: url.href, label: host, logo });
    else continue;

    seen.add(url.href);
    if (items.length === SOCIAL_DOCK_MAX) break;
  }
  return items;
}
