import { v2 as cloudinary } from "cloudinary";
import type { Db } from "mongodb";
import { CLOUDINARY_LINK_LOGOS_FOLDER } from "@/lib/cloudinary-folders";
import { uploadResultError, type CloudinaryUploadResponse } from "@/lib/cloudinary-upload-result";
import { ensureCloudinaryConfigured, isCloudinaryConfigured } from "@/lib/server/cloudinary";
import { discardPendingUpload, newUploadPublicId, registerAssetUpload } from "@/lib/server/upload-ledger";
import { settleLimited } from "@/lib/settle-limited";
import { hostsNeedingLogo, linkLogosOf, type LinkLogo } from "@/lib/social-links";

// Google's favicon service: free, keyless. Only this host and its image host are
// ever contacted; the site's own address is a query parameter, never fetched.
const FAVICON_SERVICE = "https://www.google.com/s2/favicons";
const LOGO_SIZE = 128;
const FETCH_TIMEOUT_MS = 6_000;
const UPLOAD_TIMEOUT_MS = 20_000;
const FETCH_LIMIT = 3;
const MAX_LOGO_BYTES = 50_000;
const LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export type ResolvedLinkLogos = { logos: LinkLogo[]; missing: string[] };

function isFaviconHost(url: URL) {
  return url.protocol === "https:" && (url.hostname === "www.google.com" || url.hostname.endsWith(".gstatic.com"));
}

function request(url: string) {
  return fetch(url, { redirect: "manual", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: "no-store" });
}

// Google answers with one redirect to its image host; that hop is followed only
// when it stays on Google, and a second redirect is refused.
async function fetchFavicon(host: string): Promise<string | null> {
  try {
    let res = await request(`${FAVICON_SERVICE}?domain=${encodeURIComponent(host)}&sz=${LOGO_SIZE}`);
    if (res.status >= 300 && res.status < 400) {
      const next = new URL(res.headers.get("location") ?? "", FAVICON_SERVICE);
      if (!isFaviconHost(next)) return null;
      res = await request(next.href);
    }

    const type = (res.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
    const declared = Number(res.headers.get("content-length") ?? 0);
    if (res.status !== 200 || !LOGO_TYPES.has(type) || declared > MAX_LOGO_BYTES) return null;

    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_LOGO_BYTES) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function storeLinkLogo(db: Db, host: string): Promise<LinkLogo | null> {
  const file = await fetchFavicon(host);
  if (!file) return null;

  const publicId = newUploadPublicId(CLOUDINARY_LINK_LOGOS_FOLDER);

  try {
    await registerAssetUpload(db, publicId);
    ensureCloudinaryConfigured();

    const result = (await cloudinary.uploader.upload(file, {
      public_id: publicId,
      resource_type: "image",
      overwrite: false,
      timeout: UPLOAD_TIMEOUT_MS,
    })) as CloudinaryUploadResponse;

    const problem = uploadResultError(result) ?? (result.public_id === publicId ? null : "Unexpected public id.");
    if (problem) throw new Error(problem);

    return { host, image: { url: result.secure_url as string, publicId } };
  } catch (error) {
    console.error("[link-logos] logo upload failed", host, error);
    await discardPendingUpload(db, publicId).catch((discardError: unknown) => {
      console.error("[link-logos] discard failed", publicId, discardError);
    });
    return null;
  }
}

// The logos a save should store: one per site without a built-in icon. A logo
// already stored is kept as is; a site that has none yet is fetched now, and
// one that cannot be fetched is reported in `missing` and retried next save.
export async function resolveLinkLogos(db: Db, links: readonly string[], stored: unknown): Promise<ResolvedLinkLogos> {
  const kept = new Map(linkLogosOf(stored).map((logo) => [logo.host, logo]));
  const hosts = hostsNeedingLogo(links);
  const canStore = isCloudinaryConfigured();

  const results = await settleLimited(hosts, FETCH_LIMIT, async (host) =>
    kept.get(host) ?? (canStore ? storeLinkLogo(db, host) : null)
  );

  const logos: LinkLogo[] = [];
  const missing: string[] = [];
  results.forEach((result, index) => {
    const logo = result.status === "fulfilled" ? result.value : null;
    if (logo) logos.push(logo);
    else missing.push(hosts[index]!);
  });
  return { logos, missing };
}
