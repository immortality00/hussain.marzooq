import { v2 as cloudinary } from "cloudinary";
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
  parseNftMeta,
  resolvePeopleSelection,
  sanitizeAppearances,
} from "@/app/api/_lib/media";
import { toEmbedUrl } from "@/components/media/utils";
import {
  CLOUDINARY_MEDIA_FOLDER,
  getCloudinaryMediaFolderForCategory,
} from "@/lib/cloudinary-folders";
import { ensureCloudinaryConfigured } from "@/lib/server/cloudinary";
import {
  findPrivateGalleriesUsingMedia,
  formatPrivateGalleryMediaDeleteBlocker,
} from "@/lib/server/private-gallery-admin";
import {
  deleteManagedCloudinaryAsset,
  isAllowedCloudinaryPublicId,
  isAllowedCloudinaryUrl,
  parseCloudinaryAssetFromUrl,
  type CloudinaryResourceType,
} from "@/lib/server/cloudinary-assets";

export const dynamic = "force-dynamic";

type StoredMediaAsset = {
  secureUrl: string | null;
  publicId: string | null;
  resourceType: string | null;
};

type MovedCloudinaryAsset = {
  secureUrl: string;
  publicId: string;
  resourceType: Exclude<CloudinaryResourceType, "raw">;
};

function getStoredMediaAsset(doc: Record<string, unknown>): StoredMediaAsset {
  return {
    secureUrl: typeof doc.secureUrl === "string" ? doc.secureUrl : null,
    publicId: typeof doc.publicId === "string" ? doc.publicId : null,
    resourceType: typeof doc.resourceType === "string" ? doc.resourceType : null,
  };
}

function getCloudinaryFileName(publicId: string) {
  const parts = publicId.split("/").filter(Boolean);
  return parts[parts.length - 1] || `media-${Date.now()}`;
}

function normalizeResourceType(value: string | null | undefined): Exclude<CloudinaryResourceType, "raw"> {
  return value === "video" ? "video" : "image";
}

function assetIsInsideFolder(publicId: string | null | undefined, folder: string) {
  const normalizedPublicId = (publicId ?? "").trim().replace(/^\/+/, "");
  return normalizedPublicId.startsWith(`${folder}/`);
}

function normalizeCloudinaryMediaAsset(input: {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  targetFolder: string;
  allowExistingManagedMediaAsset?: boolean;
}):
  | {
      ok: true;
      secureUrl: string;
      publicId: string;
      resourceType: Exclude<CloudinaryResourceType, "raw">;
      type: "image" | "video";
      isAlreadyInTargetFolder: boolean;
    }
  | { ok: false; error: string } {
  const secureUrl = input.secureUrl.trim();
  const publicId = input.publicId.trim().replace(/^\/+/, "");
  const resourceType = input.resourceType.trim();
  const allowedFolders = input.allowExistingManagedMediaAsset
    ? [CLOUDINARY_MEDIA_FOLDER]
    : [input.targetFolder];

  if (!secureUrl || !publicId || !resourceType) {
    return { ok: false, error: "Uploaded media asset is incomplete." };
  }

  const parsed = parseCloudinaryAssetFromUrl(secureUrl);
  if (!parsed) {
    return { ok: false, error: "Use a valid Cloudinary media URL." };
  }

  if (parsed.resourceType === "raw") {
    return { ok: false, error: "Media uploads must be images or videos." };
  }

  if (parsed.publicId !== publicId) {
    return { ok: false, error: "Uploaded media URL does not match the media public ID." };
  }

  if (resourceType !== "auto" && resourceType !== parsed.resourceType) {
    return { ok: false, error: "Uploaded media resource type does not match the media URL." };
  }

  if (!isAllowedCloudinaryUrl(secureUrl, allowedFolders)) {
    return { ok: false, error: "Uploaded media URL is outside the managed media folder." };
  }

  if (!isAllowedCloudinaryPublicId(publicId, allowedFolders)) {
    return { ok: false, error: "Uploaded media public ID is outside the managed media folder." };
  }

  return {
    ok: true,
    secureUrl,
    publicId,
    resourceType: parsed.resourceType,
    type: parsed.resourceType,
    isAlreadyInTargetFolder: assetIsInsideFolder(publicId, input.targetFolder),
  };
}

function assetsPointToSameCloudinaryFile(a: StoredMediaAsset, b: StoredMediaAsset) {
  return Boolean(a.publicId && b.publicId && a.publicId === b.publicId);
}

async function deleteStoredMediaAsset(asset: StoredMediaAsset) {
  await deleteManagedCloudinaryAsset(asset, [CLOUDINARY_MEDIA_FOLDER]);
}

async function moveStoredMediaAssetToFolder(
  asset: StoredMediaAsset,
  targetFolder: string
): Promise<MovedCloudinaryAsset | null> {
  const publicId = (asset.publicId ?? "").trim().replace(/^\/+/, "");
  if (!publicId) return null;

  if (!isAllowedCloudinaryPublicId(publicId, [CLOUDINARY_MEDIA_FOLDER])) return null;

  const resourceType = normalizeResourceType(asset.resourceType);
  const fileName = getCloudinaryFileName(publicId);
  const destinationPublicId = `${targetFolder}/${fileName}`;

  if (destinationPublicId === publicId) {
    const parsed = asset.secureUrl ? parseCloudinaryAssetFromUrl(asset.secureUrl) : null;

    return {
      secureUrl: asset.secureUrl ?? "",
      publicId,
      resourceType: parsed?.resourceType === "video" ? "video" : resourceType,
    };
  }

  ensureCloudinaryConfigured();

  const renameResult = (await cloudinary.uploader.rename(publicId, destinationPublicId, {
    resource_type: resourceType,
    invalidate: true,
    overwrite: false,
  })) as unknown;

  if (!renameResult || typeof renameResult !== "object") return null;

  const result = renameResult as Record<string, unknown>;
  const movedSecureUrl = typeof result.secure_url === "string" ? result.secure_url : "";
  const movedPublicId = typeof result.public_id === "string" ? result.public_id : destinationPublicId;
  const movedResourceType =
    result.resource_type === "video" || result.resource_type === "image"
      ? result.resource_type
      : resourceType;

  if (!movedSecureUrl || !movedPublicId) return null;

  return {
    secureUrl: movedSecureUrl,
    publicId: movedPublicId,
    resourceType: movedResourceType,
  };
}

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

  const tags = asStringArray(bodyUnknown.tags);
  const categories = asStringArray(bodyUnknown.categories);
  const peopleIds = asStringArray(bodyUnknown.peopleIds);
  const isPublic = asBooleanOrNull(bodyUnknown.isPublic);
  const appearances = sanitizeAppearances(bodyUnknown.appearances);

  if (categories.length === 0) {
    return noStoreJson({ ok: false, error: "Choose at least one category." }, { status: 400 });
  }

  const targetFolder = getCloudinaryMediaFolderForCategory(categories[0]);
  const incomingType = asNullableString(bodyUnknown.type);
  const incomingEmbedUrl = asNullableString(bodyUnknown.embedUrl);
  const incomingSecureUrl = asNullableString(bodyUnknown.secureUrl);
  const incomingPublicId = asNullableString(bodyUnknown.publicId);
  const incomingResourceType = asNullableString(bodyUnknown.resourceType);

  const allowEmbed =
    categories.includes("videography") &&
    !categories.includes("photography") &&
    !categories.includes("nft");

  if (incomingType === "embed" && !allowEmbed) {
    return noStoreJson(
      {
        ok: false,
        error: "Embed links are allowed only for videography.",
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

  if (hasIncomingAsset) {
    const normalizedAsset = normalizeCloudinaryMediaAsset({
      secureUrl: incomingSecureUrl,
      publicId: incomingPublicId,
      resourceType: incomingResourceType,
      targetFolder,
      allowExistingManagedMediaAsset: true,
    });

    if (!normalizedAsset.ok) {
      return noStoreJson({ ok: false, error: normalizedAsset.error }, { status: 400 });
    }

    const incomingAsset: StoredMediaAsset = {
      secureUrl: normalizedAsset.secureUrl,
      publicId: normalizedAsset.publicId,
      resourceType: normalizedAsset.resourceType,
    };

    const isExistingAsset =
      oldAsset.publicId && normalizedAsset.publicId === oldAsset.publicId;

    if (isExistingAsset && !normalizedAsset.isAlreadyInTargetFolder) {
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
      if (!normalizedAsset.isAlreadyInTargetFolder) {
        return noStoreJson(
          { ok: false, error: "Uploaded media URL is outside the selected media category folder." },
          { status: 400 }
        );
      }

      set.secureUrl = normalizedAsset.secureUrl;
      set.publicId = normalizedAsset.publicId;
      set.resourceType = normalizedAsset.resourceType;
      set.type = normalizedAsset.type;
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
  if (!result.deletedCount) return noStoreJson({ ok: false, error: "Delete failed" }, { status: 500 });

  await deleteStoredMediaAsset(mediaAsset);

  return noStoreJson({ ok: true });
}