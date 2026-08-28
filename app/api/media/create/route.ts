import { requireAdminOr401 } from "@/lib/auth/admin";
import { revalidateMediaSurfaces } from "@/app/api/_lib/revalidate";
import { getDb } from "@/lib/server/db";
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
  resolvePeopleSelection,
  sanitizeAppearances,
} from "@/app/api/_lib/media";
import { toEmbedUrl } from "@/components/media/utils";
import {
  getPrimaryMediaFolder,
  normalizeUploadedMediaAsset,
  type NormalizedCloudinaryMediaAsset,
} from "@/lib/server/media-asset-management";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const typeRaw = asNullableString(bodyUnknown.type)?.trim() ?? "";
  const type = typeRaw === "video" || typeRaw === "embed" ? typeRaw : "image";

  const title = (asNullableString(bodyUnknown.title) ?? "").trim().slice(0, 160);
  const description = (asNullableString(bodyUnknown.description) ?? "").trim().slice(0, 2000);
  const mediaLocation = parseMediaLocation(bodyUnknown);
  const event = (asNullableString(bodyUnknown.event) ?? "").trim().slice(0, 120);

  const yearNum = asNumberOrNull(bodyUnknown.year);
  const year = yearNum !== null && yearNum > 1900 && yearNum < 2100 ? yearNum : null;

  const { tags, categories, peopleIds } = getMediaLists(bodyUnknown);
  const requestedPublic = asBooleanOrNull(bodyUnknown.isPublic) ?? true;
  const appearances = sanitizeAppearances(bodyUnknown.appearances);

  const secureUrl = (asNullableString(bodyUnknown.secureUrl) ?? "").trim();
  const publicId = (asNullableString(bodyUnknown.publicId) ?? "").trim();
  const resourceType = (asNullableString(bodyUnknown.resourceType) ?? "").trim();
  const embedUrl = (asNullableString(bodyUnknown.embedUrl) ?? "").trim();

  if (!title) return noStoreJson({ ok: false, error: "Title required" }, { status: 400 });

  if (categories.length === 0) {
    return noStoreJson({ ok: false, error: "Choose at least one category." }, { status: 400 });
  }

  const isShowreel = categories.includes("showreel");
  const isVideoPlacement = categories.includes("videography") || isShowreel;

  const allowEmbed =
    isVideoPlacement && !categories.includes("photography") && !categories.includes("nft");

  if (type === "embed" && !allowEmbed) {
    return noStoreJson(
      {
        ok: false,
        error: "Embed links are allowed only for videography or showreel.",
      },
      { status: 400 }
    );
  }

  if (categories.includes("nft") && type === "embed") {
    return noStoreJson(
      { ok: false, error: "NFT items must use an uploaded image or video." },
      { status: 400 }
    );
  }

  let normalizedAsset: NormalizedCloudinaryMediaAsset | null = null;
  let normalizedEmbedUrl: string | null = null;

  if (type === "embed") {
    normalizedEmbedUrl = toEmbedUrl(embedUrl);
    if (!normalizedEmbedUrl) {
      return noStoreJson(
        { ok: false, error: "Use a valid YouTube or Vimeo video URL." },
        { status: 400 }
      );
    }
  } else {
    const normalized = normalizeUploadedMediaAsset({
      secureUrl,
      publicId,
      resourceType,
      targetFolder: getPrimaryMediaFolder(categories),
    });

    if (!normalized.ok) {
      return noStoreJson({ ok: false, error: normalized.error }, { status: 400 });
    }

    normalizedAsset = normalized.asset;

    if (isShowreel && normalizedAsset.type !== "video") {
      return noStoreJson(
        { ok: false, error: "Showreel uploads must be video files." },
        { status: 400 }
      );
    }
  }

  const nftParsed = parseNftMeta(bodyUnknown, categories.includes("nft"));
  if (!nftParsed.ok) {
    return noStoreJson({ ok: false, error: nftParsed.error }, { status: 400 });
  }

  const db = await getDb();
  const resolvedPeople = await resolvePeopleSelection(db, { peopleIds });
  const isPublic = resolvedPeople.gatedPersonName ? false : requestedPublic;
  const now = new Date();

  const doc = {
    type: normalizedAsset?.type ?? type,
    title,
    description: description || null,
    location: mediaLocation.location,
    locationId: mediaLocation.locationId,
    locationLat: mediaLocation.locationLat,
    locationLon: mediaLocation.locationLon,
    locationCountryCode: mediaLocation.locationCountryCode,
    event: event || null,
    year,
    tags,
    categories,
    peopleIds: resolvedPeople.peopleIds,
    people: resolvedPeople.people,
    isPublic,
    appearances,
    nft: nftParsed.value,
    secureUrl: normalizedAsset?.secureUrl ?? null,
    publicId: normalizedAsset?.publicId ?? null,
    resourceType: normalizedAsset?.resourceType ?? null,
    embedUrl: type === "embed" ? normalizedEmbedUrl : null,
    order:
      typeof bodyUnknown.order === "number" && Number.isFinite(bodyUnknown.order)
        ? bodyUnknown.order
        : 0,
    updatedAt: now,
  };

  const col = db.collection("media");
  const keyFilter =
    type === "embed"
      ? ({ type: "embed", embedUrl: normalizedEmbedUrl } as const)
      : ({ publicId: normalizedAsset?.publicId } as const);

  await col.updateOne(
    keyFilter,
    { $set: doc, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );

  const found = await col.findOne(keyFilter, { projection: { _id: 1 } });
  const id = found?._id ? String(found._id) : null;

  if (!id) return noStoreJson({ ok: false, error: "Save failed" }, { status: 500 });

  revalidateMediaSurfaces(tags);

  return noStoreJson({ ok: true, id });
}