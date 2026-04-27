import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import {
  asBooleanOrNull,
  asNullableString,
  asNumberOrNull,
  isRecord,
  noStoreJson,
} from "@/app/api/_lib/common";
import { getMediaLists, isCloudinarySecureUrl, sanitizeAppearances } from "@/app/api/_lib/media";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });

  const typeRaw = asNullableString(bodyUnknown.type)?.trim() ?? "";
  const type = typeRaw === "video" || typeRaw === "embed" ? typeRaw : "image";

  const title = (asNullableString(bodyUnknown.title) ?? "").trim().slice(0, 160);
  const description = (asNullableString(bodyUnknown.description) ?? "").trim().slice(0, 2000);
  const location = (asNullableString(bodyUnknown.location) ?? "").trim().slice(0, 120);
  const event = (asNullableString(bodyUnknown.event) ?? "").trim().slice(0, 120);

  const yearNum = asNumberOrNull(bodyUnknown.year);
  const year = yearNum !== null && yearNum > 1900 && yearNum < 2100 ? yearNum : null;

  const { tags, categories, people } = getMediaLists(bodyUnknown);
  const isPublic = asBooleanOrNull(bodyUnknown.isPublic) ?? true;
  const appearances = sanitizeAppearances(bodyUnknown.appearances);

  const secureUrl = (asNullableString(bodyUnknown.secureUrl) ?? "").trim();
  const publicId = (asNullableString(bodyUnknown.publicId) ?? "").trim();
  const resourceType = (asNullableString(bodyUnknown.resourceType) ?? "").trim();
  const embedUrl = (asNullableString(bodyUnknown.embedUrl) ?? "").trim();

  if (!title) return noStoreJson({ ok: false, error: "Title required" }, { status: 400 });

  if (type === "embed") {
    if (!embedUrl) return noStoreJson({ ok: false, error: "embedUrl required" }, { status: 400 });
  } else {
    if (!secureUrl || !isCloudinarySecureUrl(secureUrl)) {
      return noStoreJson({ ok: false, error: "Invalid secureUrl" }, { status: 400 });
    }
    if (!publicId) return noStoreJson({ ok: false, error: "publicId required" }, { status: 400 });
    if (resourceType !== "image" && resourceType !== "video" && resourceType !== "auto") {
      return noStoreJson({ ok: false, error: "Invalid resourceType" }, { status: 400 });
    }
  }

  const now = new Date();

  const doc = {
    type,
    title,
    description: description || null,
    location: location || null,
    event: event || null,
    year,
    tags,
    categories,
    people,
    isPublic,
    appearances,
    secureUrl: type === "embed" ? null : secureUrl,
    publicId: type === "embed" ? null : publicId,
    resourceType: type === "embed" ? null : resourceType,
    embedUrl: type === "embed" ? embedUrl : null,
    order: typeof bodyUnknown.order === "number" && Number.isFinite(bodyUnknown.order) ? bodyUnknown.order : 0,
    updatedAt: now,
  };

  const client = await clientPromise;
  const db = client.db("hm_visuals");
  const col = db.collection("media");

  const keyFilter =
    type === "embed"
      ? ({ type: "embed", embedUrl } as const)
      : ({ publicId } as const);

  await col.updateOne(keyFilter, { $set: doc, $setOnInsert: { createdAt: now } }, { upsert: true });

  const found = await col.findOne(keyFilter, { projection: { _id: 1 } });
  const id = found?._id ? String(found._id) : null;

  if (!id) return noStoreJson({ ok: false, error: "Save failed" }, { status: 500 });
  return noStoreJson({ ok: true, id });
}