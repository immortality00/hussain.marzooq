import {
  asBooleanOrNull,
  asNullableString,
  asNumberOrNull,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import {
  getMediaLists,
  parseMediaLocation,
  parseNftMeta,
  sanitizeAppearances,
} from "@/app/api/_lib/media";
import { getPrimaryMediaFolder } from "@/lib/server/media-asset-management";
import { isMediaAssetPath } from "@/lib/media-asset-path";
import { parseMediaUsageChoice } from "@/lib/media-in-use";
import { parseVideoLink } from "@/lib/video-embed";

function badRequest(error: string) {
  return { ok: false as const, response: noStoreJson({ ok: false, error }, { status: 400 }) };
}

function hasText(value: string | null): value is string {
  return typeof value === "string" && value.length > 0;
}

export function parseMediaPatch(body: unknown) {
  if (!isRecord(body)) return badRequest("Invalid body");

  const title = (asNullableString(body.title) ?? "").trim().slice(0, 160);
  if (!title) return badRequest("Title required");

  const description = (asNullableString(body.description) ?? "").trim().slice(0, 2000);
  const mediaLocation = parseMediaLocation(body);
  const event = (asNullableString(body.event) ?? "").trim().slice(0, 120);

  const yearNum = asNumberOrNull(body.year);
  const year = yearNum !== null && yearNum > 1900 && yearNum < 2100 ? yearNum : null;

  const { tags, categories, peopleIds } = getMediaLists(body);
  const isPublic = asBooleanOrNull(body.isPublic);
  const appearances = sanitizeAppearances(body.appearances);

  if (categories.length === 0) return badRequest("Choose at least one category.");

  const targetFolder = getPrimaryMediaFolder(categories);
  const incomingType = asNullableString(body.type);
  const incomingEmbedUrl = asNullableString(body.embedUrl);
  const incomingSecureUrl = asNullableString(body.secureUrl);
  const incomingPublicId = asNullableString(body.publicId);
  const incomingResourceType = asNullableString(body.resourceType);
  const usageChoice = parseMediaUsageChoice(body.usages);

  const incomingAsset =
    hasText(incomingSecureUrl) &&
    !isMediaAssetPath(incomingSecureUrl) &&
    hasText(incomingPublicId) &&
    hasText(incomingResourceType)
      ? { secureUrl: incomingSecureUrl, publicId: incomingPublicId, resourceType: incomingResourceType }
      : null;

  const isShowreel = categories.includes("showreel");
  const isVideoPlacement = categories.includes("videography") || isShowreel;
  const allowEmbed =
    isVideoPlacement && !categories.includes("photography") && !categories.includes("nft");
  const isEmbed = incomingType === "embed";

  if (isEmbed && !allowEmbed) {
    return badRequest("Embed links are allowed only for videography or showreel.");
  }

  const video = isEmbed ? parseVideoLink(incomingEmbedUrl ?? "") : null;
  if (isEmbed && !video) return badRequest("Use a valid YouTube or Vimeo video URL.");

  const nftParsed = parseNftMeta(body, categories.includes("nft"));
  if (!nftParsed.ok) return badRequest(nftParsed.error);

  return {
    ok: true as const,
    input: {
      title,
      description,
      mediaLocation,
      event,
      year,
      tags,
      categories,
      peopleIds,
      isPublic,
      appearances,
      nft: nftParsed.value,
      targetFolder,
      isEmbed,
      isShowreel,
      video,
      incomingAsset,
      usageChoice,
    },
  };
}

export type MediaPatchInput = Extract<ReturnType<typeof parseMediaPatch>, { ok: true }>["input"];
