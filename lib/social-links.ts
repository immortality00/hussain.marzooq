import { isSectionImage, type SectionImage } from "@/lib/page-sections-shared";

// Networks drawn from the built-in icon set (components/site/social-icons.ts).
// A link matches when its host is one of these or a subdomain of one, so
// `m.youtube.com` matches and `instagram.com.example.org` does not.
export const SOCIAL_NETWORKS = [
  { key: "instagram", label: "Instagram", hosts: ["instagram.com", "instagr.am"] },
  { key: "facebook", label: "Facebook", hosts: ["facebook.com", "fb.com"] },
  { key: "threads", label: "Threads", hosts: ["threads.net", "threads.com"] },
  { key: "x", label: "X", hosts: ["x.com", "twitter.com"] },
  { key: "tiktok", label: "TikTok", hosts: ["tiktok.com"] },
  { key: "youtube", label: "YouTube", hosts: ["youtube.com", "youtu.be"] },
  { key: "vimeo", label: "Vimeo", hosts: ["vimeo.com"] },
  { key: "behance", label: "Behance", hosts: ["behance.net"] },
  { key: "dribbble", label: "Dribbble", hosts: ["dribbble.com"] },
  { key: "artstation", label: "ArtStation", hosts: ["artstation.com"] },
  { key: "500px", label: "500px", hosts: ["500px.com"] },
  { key: "flickr", label: "Flickr", hosts: ["flickr.com", "flic.kr"] },
  { key: "vsco", label: "VSCO", hosts: ["vsco.co"] },
  { key: "pinterest", label: "Pinterest", hosts: ["pinterest.com", "pin.it"] },
  { key: "tumblr", label: "Tumblr", hosts: ["tumblr.com"] },
  { key: "snapchat", label: "Snapchat", hosts: ["snapchat.com"] },
  { key: "spotify", label: "Spotify", hosts: ["spotify.com"] },
  { key: "soundcloud", label: "SoundCloud", hosts: ["soundcloud.com"] },
  { key: "github", label: "GitHub", hosts: ["github.com"] },
  { key: "telegram", label: "Telegram", hosts: ["t.me", "telegram.me"] },
  { key: "whatsapp", label: "WhatsApp", hosts: ["wa.me", "whatsapp.com"] },
  { key: "opensea", label: "OpenSea", hosts: ["opensea.io"] },
  { key: "rarible", label: "Rarible", hosts: ["rarible.com"] },
] as const;

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
