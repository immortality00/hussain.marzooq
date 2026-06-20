import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import {
  asBooleanOrNull,
  asNullableString,
  asNumberOrNull,
  asStringArray,
  isRecord,
  noStoreJson,
  parseObjectId,
} from "@/app/api/_lib/common";
import {
  getMediaLists,
  parseNftMeta,
  resolvePeopleSelection,
  sanitizeAppearances,
} from "@/app/api/_lib/media";
import { toEmbedUrl } from "@/components/media/utils";
import {
  assetIsInsideFolder,
  assetsPointToSameCloudinaryFile,
  deleteStoredMediaAsset,
  getPrimaryMediaFolder,
  getStoredMediaAsset,
  moveStoredMediaAssetToFolder,
  normalizeUploadedMediaAsset,
  type StoredMediaAsset,
} from "@/lib/server/media-asset-management";
import {
  findPrivateGalleriesUsingMedia,
  formatPrivateGalleryMediaDeleteBlocker,
} from "@/lib/server/private-gallery-admin";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const db = await getDb();
  const doc = await db.collection("media").findOne({ _id: oid });

  if (!doc) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const rawPeopleIds = asStringArray(doc.peopleIds);
  const rawPeople = asStringArray(doc.people);
  const resolvedPeople = await resolvePeopleSelection(db, { peopleIds: rawPeopleIds });

  const item = {
    id: String(doc._id),
    type: typeof doc.type === "string" ? doc.type : "image",
    title: typeof doc.title === "string" ? doc.title : "",
    description: typeof doc.description === "string" ? doc.description : null,
    location: typeof doc.location === "string" ? doc.location : null,
    event: typeof doc.event === "string" ? doc.event : null,
    year: typeof doc.year === "number" ? doc.year : null,
    tags: asStringArray(doc.tags),
    categories: asStringArray(doc.categories),
    peopleIds: resolvedPeople.peopleIds,
    people: resolvedPeople.people.length ? resolvedPeople.people : rawPeople,
    appearances: sanitizeAppearances(doc.appearances),
    nft: doc.nft && typeof doc.nft === "object" ? doc.nft : null,
    isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    publicId: typeof doc.publicId === "string" ? doc.publicId : null,
    resourceType: typeof doc.resourceType === "string" ? doc.resourceType : null,
    embedUrl: typeof doc.embedUrl === "string" ? doc.embedUrl : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };

  return noStoreJson({ ok: true, item });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const title = (asNullableString(bodyUnknown.title) ?? "").trim().slice(0, 160);
  if (!title) return noStoreJson({ ok: false, error: "Title required" }, { status: 400 });

  const description = (asNullableString(bodyUnknown.description) ?? "").trim().slice(0, 2000);
  const location = (asNullableString(bodyUnknown.location) ?? "").trim().slice(0, 120);
  const event = (asNullableString(bodyUnknown.event) ?? "").trim().slice(0, 120);

  const yearNum = asNumberOrNull(bodyUnknown.year);
  const year = yearNum !== null && yearNum > 1900 && yearNum < 2100 ? yearNum : null;

  const { tags, categories, peopleIds } = getMediaLists(bodyUnknown);
  const isPublic = asBooleanOrNull(bodyUnknown.isPublic);
  const appearances = sanitizeAppearances(bodyUnknown.appearances);

  if (categories.length === 0) {
    return noStoreJson({ ok: false, error: "Choose at least one category." }, { status: 400 });
  }

  const targetFolder = getPrimaryMediaFolder(categories);
  const incomingType = asNullableString(bodyUnknown.type);
  const incomingEmbedUrl = asNullableString(bodyUnknown.embedUrl);
  const incomingSecureUrl = asNullableString(bodyUnknown.secureUrl);
  const incomingPublicId = asNullableString(bodyUnknown.publicId);
  const incomingResourceType = asNullableString(bodyUnknown.resourceType);

  const isShowreel = categories.includes("showreel");
  const isVideoPlacement = categories.includes("videography") || isShowreel;

  const allowEmbed =
    isVideoPlacement && !categories.includes("photography") && !categories.includes("nft");

  if (incomingType === "embed" && !allowEmbed) {
    return noStoreJson(
      {
        ok: false,
        error: "Embed links are allowed only for videography or showreel.",
      },
      { status: 400 }
    );
  }

  if (categories.includes("nft") && incomingType === "embed") {
    return noStoreJson(
      { ok: false, error: "NFT items must use an uploaded image or video." },
      { status: 400 }
    );
  }

  const nftParsed = parseNftMeta(bodyUnknown, categories.includes("nft"));
  if (!nftParsed.ok) {
    return noStoreJson({ ok: false, error: nftParsed.error }, { status: 400 });
  }

  const db = await getDb();
  const existingMedia = await db.collection("media").findOne({ _id: oid });
  if (!existingMedia) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const oldAsset = getStoredMediaAsset(existingMedia);
  const resolvedPeople = await resolvePeopleSelection(db, { peopleIds });

  const set: Record<string, unknown> = {
    title,
    description: description || null,
    location: location || null,
    event: event || null,
    year,
    tags,
    categories,
    peopleIds: resolvedPeople.peopleIds,
    people: resolvedPeople.people,
    appearances,
    nft: nftParsed.value,
    updatedAt: new Date(),
  };

  if (typeof isPublic === "boolean") set.isPublic = isPublic;

  let replacementAsset: StoredMediaAsset | null = null;

  if (incomingType === "embed") {
    const normalizedEmbedUrl = toEmbedUrl((incomingEmbedUrl ?? "").trim());
    if (!normalizedEmbedUrl) {
      return noStoreJson(
        { ok: false, error: "Use a valid YouTube or Vimeo video URL." },
        { status: 400 }
      );
    }

    set.type = "embed";
    set.embedUrl = normalizedEmbedUrl;
    set.secureUrl = null;
    set.publicId = null;
    set.resourceType = null;
  }

  const hasIncomingAsset =
    typeof incomingSecureUrl === "string" &&
    incomingSecureUrl.length > 0 &&
    typeof incomingPublicId === "string" &&
    incomingPublicId.length > 0 &&
    typeof incomingResourceType === "string" &&
    incomingResourceType.length > 0;

  if (
    isShowreel &&
    incomingType !== "embed" &&
    !hasIncomingAsset &&
    oldAsset.publicId &&
    oldAsset.resourceType !== "video"
  ) {
    return noStoreJson(
      { ok: false, error: "Showreel uploads must be video files." },
      { status: 400 }
    );
  }

  if (hasIncomingAsset) {
    const normalizedAsset = normalizeUploadedMediaAsset({
      secureUrl: incomingSecureUrl,
      publicId: incomingPublicId,
      resourceType: incomingResourceType,
      targetFolder,
      allowExistingManagedMediaAsset: true,
    });

    if (!normalizedAsset.ok) {
      return noStoreJson({ ok: false, error: normalizedAsset.error }, { status: 400 });
    }

    if (isShowreel && normalizedAsset.asset.type !== "video") {
      return noStoreJson(
        { ok: false, error: "Showreel uploads must be video files." },
        { status: 400 }
      );
    }

    const incomingAsset: StoredMediaAsset = {
      secureUrl: normalizedAsset.asset.secureUrl,
      publicId: normalizedAsset.asset.publicId,
      resourceType: normalizedAsset.asset.resourceType,
    };

    const isExistingAsset = Boolean(
      oldAsset.publicId && normalizedAsset.asset.publicId === oldAsset.publicId
    );

    if (isExistingAsset && !normalizedAsset.asset.isAlreadyInTargetFolder) {
      const movedAsset = await moveStoredMediaAssetToFolder(oldAsset, targetFolder);

      if (!movedAsset) {
        return noStoreJson(
          { ok: false, error: "Could not move the media file to the selected category folder." },
          { status: 500 }
        );
      }

      set.secureUrl = movedAsset.secureUrl;
      set.publicId = movedAsset.publicId;
      set.resourceType = movedAsset.resourceType;
      set.type = movedAsset.resourceType;
      set.embedUrl = null;

      replacementAsset = {
        secureUrl: movedAsset.secureUrl,
        publicId: movedAsset.publicId,
        resourceType: movedAsset.resourceType,
      };
    } else {
      if (!normalizedAsset.asset.isAlreadyInTargetFolder) {
        return noStoreJson(
          { ok: false, error: "Uploaded media URL is outside the selected media category folder." },
          { status: 400 }
        );
      }

      set.secureUrl = normalizedAsset.asset.secureUrl;
      set.publicId = normalizedAsset.asset.publicId;
      set.resourceType = normalizedAsset.asset.resourceType;
      set.type = normalizedAsset.asset.type;
      set.embedUrl = null;

      replacementAsset = incomingAsset;
    }
  } else if (
    incomingType !== "embed" &&
    oldAsset.publicId &&
    !assetIsInsideFolder(oldAsset.publicId, targetFolder)
  ) {
    const movedAsset = await moveStoredMediaAssetToFolder(oldAsset, targetFolder);

    if (!movedAsset) {
      return noStoreJson(
        { ok: false, error: "Could not move the media file to the selected category folder." },
        { status: 500 }
      );
    }

    set.secureUrl = movedAsset.secureUrl;
    set.publicId = movedAsset.publicId;
    set.resourceType = movedAsset.resourceType;
    set.type = movedAsset.resourceType;
    set.embedUrl = null;

    replacementAsset = {
      secureUrl: movedAsset.secureUrl,
      publicId: movedAsset.publicId,
      resourceType: movedAsset.resourceType,
    };
  }

  const result = await db.collection("media").updateOne({ _id: oid }, { $set: set });
  if (!result.matchedCount) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  if (oldAsset.publicId) {
    const switchedToEmbed = incomingType === "embed";
    const replacedWithDifferentAsset =
      replacementAsset !== null && !assetsPointToSameCloudinaryFile(oldAsset, replacementAsset);

    if (switchedToEmbed || replacedWithDifferentAsset) {
      await deleteStoredMediaAsset(oldAsset);
    }
  }

  return noStoreJson({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await ctx.params;
  const oid = parseObjectId(id);
  if (!oid) return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });

  const db = await getDb();
  const media = await db.collection("media").findOne({ _id: oid });
  if (!media) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const mediaAsset = getStoredMediaAsset(media);
  const galleryDocs = await findPrivateGalleriesUsingMedia(db, String(oid));

  if (galleryDocs.length > 0) {
    return noStoreJson(
      {
        ok: false,
        error: formatPrivateGalleryMediaDeleteBlocker(galleryDocs),
      },
      { status: 409 }
    );
  }

  const result = await db.collection("media").deleteOne({ _id: oid });
  if (!result.deletedCount) {
    return noStoreJson({ ok: false, error: "Delete failed" }, { status: 500 });
  }

  await deleteStoredMediaAsset(mediaAsset);

  return noStoreJson({ ok: true });
}