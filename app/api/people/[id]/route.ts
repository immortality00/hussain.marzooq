import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { findByIdOr404, requireAdminObjectId } from "@/app/api/_lib/admin-route";
import {
  asBooleanOrNull,
  asNullableString,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";
import {
  deleteManagedCloudinaryAsset,
  isAllowedCloudinaryUrl,
} from "@/lib/server/cloudinary-assets";
import { CLOUDINARY_PEOPLE_FOLDER } from "@/lib/cloudinary-folders";
import {
  MIN_PERSON_PASSWORD_LENGTH,
  hashPassword,
  makeAccessToken,
} from "@/lib/password-gate";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  const db = await getDb();

  let slug = baseSlug || "person";
  let counter = 1;

  while (true) {
    const found = await db.collection("people_profiles").findOne({ slug });
    if (!found) return slug;
    if (excludeId && String(found._id) === excludeId) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const db = await getDb();
  const found = await findByIdOr404(db, "people_profiles", oid);
  if (found instanceof Response) return found;
  const { doc } = found;

  return noStoreJson({
    ok: true,
    item: {
      id: String(doc._id),
      name: typeof doc.name === "string" ? doc.name : "",
      slug: typeof doc.slug === "string" ? doc.slug : "",
      bio: typeof doc.bio === "string" ? doc.bio : null,
      avatarUrl: typeof doc.avatarUrl === "string" ? doc.avatarUrl : null,
      isPublic: typeof doc.isPublic === "boolean" ? doc.isPublic : true,
      isPrivate: doc.isPrivate === true,
      hasPassword: typeof doc.passwordHash === "string" && doc.passwordHash.length > 0,
      removalRequestedAt:
        doc.removalRequestedAt instanceof Date ? doc.removalRequestedAt.toISOString() : null,
      removalApprovedAt:
        doc.removalApprovedAt instanceof Date ? doc.removalApprovedAt.toISOString() : null,
    },
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const name = (asNullableString(body.name) ?? "").trim().slice(0, 120);
  const slugInput = (asNullableString(body.slug) ?? "").trim();
  const bio = (asNullableString(body.bio) ?? "").trim().slice(0, 4000);
  const avatarUrl = (asNullableString(body.avatarUrl) ?? "").trim().slice(0, 500);
  const isPublic = asBooleanOrNull(body.isPublic) ?? true;
  const isPrivate = asBooleanOrNull(body.isPrivate) ?? false;
  const password = (asNullableString(body.password) ?? "").trim();

  if (!name) return noStoreJson({ ok: false, error: "Name is required." }, { status: 400 });
  if (!avatarUrl) return noStoreJson({ ok: false, error: "Avatar is required." }, { status: 400 });

  if (!isAllowedCloudinaryUrl(avatarUrl, [CLOUDINARY_PEOPLE_FOLDER])) {
    return noStoreJson(
      { ok: false, error: "Avatar must be uploaded to the people folder." },
      { status: 400 }
    );
  }

  if (password && password.length < MIN_PERSON_PASSWORD_LENGTH) {
    return noStoreJson(
      { ok: false, error: `Password must be at least ${MIN_PERSON_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const slug = await ensureUniqueSlug(slugify(slugInput || name), id);
  const db = await getDb();

  const found = await findByIdOr404(db, "people_profiles", oid, {
    projection: { name: 1, slug: 1, avatarUrl: 1, accessToken: 1, isPrivate: 1, removalApprovedAt: 1 },
  });
  if (found instanceof Response) return found;
  const existing = found.doc;

  const previousName = typeof existing.name === "string" ? existing.name : "";
  const previousSlug = typeof existing.slug === "string" ? existing.slug : null;
  const previousAvatarUrl = typeof existing.avatarUrl === "string" ? existing.avatarUrl : "";
  const existingToken =
    typeof existing.accessToken === "string" && existing.accessToken ? existing.accessToken : "";
  const wasGated = existing.isPrivate === true || existing.removalApprovedAt instanceof Date;

  const now = new Date();
  const set: Record<string, unknown> = {
    name,
    slug,
    bio: bio || null,
    avatarUrl,
    isPublic,
    isPrivate,
    updatedAt: now,
  };
  const unset: Record<string, ""> = {};

  if (password) {
    set.passwordHash = await hashPassword(password);
    set.accessToken = makeAccessToken();
  } else if (isPrivate) {
    set.accessToken = existingToken || makeAccessToken();
  }

  if (!isPrivate) {
    unset.removalApprovedAt = "";
  }

  const update: Record<string, unknown> = { $set: set };
  if (Object.keys(unset).length > 0) update.$unset = unset;

  const result = await db.collection("people_profiles").updateOne({ _id: oid }, update);
  if (!result.matchedCount) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  if (previousName && previousName !== name) {
    await db.collection("media").updateMany(
      { peopleIds: String(oid) },
      { $set: { "people.$[matched]": name, updatedAt: new Date() } },
      { arrayFilters: [{ matched: previousName }] }
    );
  }

  const nowPublic = isPublic && !isPrivate;
  if (nowPublic && wasGated) {
    const media = db.collection("media");
    const linked = await media
      .find({ $or: [{ peopleIds: id }, { people: name }], isPublic: false })
      .project({ _id: 1, peopleIds: 1 })
      .toArray();

    for (const doc of linked) {
      const otherIds = (Array.isArray(doc.peopleIds) ? doc.peopleIds : []).filter(
        (pid): pid is string => typeof pid === "string" && pid !== id
      );

      let blockedByOther = false;
      if (otherIds.length) {
        const gatedOther = await db.collection("people_profiles").findOne({
          _id: { $in: otherIds.filter((pid) => ObjectId.isValid(pid)).map((pid) => new ObjectId(pid)) },
          $or: [{ isPublic: false }, { isPrivate: true }],
        });
        blockedByOther = !!gatedOther;
      }

      if (!blockedByOther) {
        await media.updateOne(
          { _id: doc._id },
          { $set: { isPublic: true, updatedAt: now }, $unset: { removalHiddenBy: "" } }
        );
      }
    }
  }

  if (previousAvatarUrl && previousAvatarUrl !== avatarUrl) {
    await deleteManagedCloudinaryAsset({ url: previousAvatarUrl }, [CLOUDINARY_PEOPLE_FOLDER]);
  }

  revalidatePath("/", "layout");
  if (previousSlug && previousSlug !== slug) revalidatePath(`/people/${previousSlug}`);
  revalidatePath(`/people/${slug}`);

  return noStoreJson({ ok: true, slug });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { id, oid } = gate;

  const db = await getDb();
  const found = await findByIdOr404(db, "people_profiles", oid, {
    projection: { name: 1, slug: 1, avatarUrl: 1 },
  });
  if (found instanceof Response) return found;
  const person = found.doc;

  const personName = typeof person.name === "string" ? person.name : "";
  const personSlug = typeof person.slug === "string" ? person.slug : null;

  const linkedMedia = await db.collection("media").findOne({
    $or: [{ peopleIds: id }, ...(personName ? [{ people: personName }] : [])],
  });

  if (linkedMedia) {
    return noStoreJson(
      {
        ok: false,
        error: "This profile is linked to media. Remove it from media items first.",
      },
      { status: 409 }
    );
  }

  const avatarUrl = typeof person.avatarUrl === "string" ? person.avatarUrl : "";

  const result = await db.collection("people_profiles").deleteOne({ _id: oid });
  if (!result.deletedCount) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  if (avatarUrl) {
    await deleteManagedCloudinaryAsset({ url: avatarUrl }, [CLOUDINARY_PEOPLE_FOLDER]);
  }

  revalidatePath("/people", "layout");
  if (personSlug) revalidatePath(`/people/${personSlug}`);

  return noStoreJson({ ok: true });
}
