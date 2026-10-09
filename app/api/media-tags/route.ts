import { revalidatePublicTree } from "@/app/api/_lib/revalidate";
import { adminMediaTagOf, listAdminMediaTags } from "@/lib/server/admin-catalog";
import { listActiveMediaTags } from "@/lib/server/admin-lists";
import { requireAdminOr401, isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { asString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import {
  isReservedTagSlug,
  isValidTagSlug,
  slugifyTag,
} from "@/lib/server/media-tags";
import { withRouteErrors } from "@/app/api/_lib/route-errors";

export const dynamic = "force-dynamic";

const TAG_LIST_RATE_LIMIT_WINDOW_MS = 60_000;
const TAG_LIST_RATE_LIMIT_MAX = 60;

async function handleGet(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");

  if (scope === "admin") {
    if (!(await isAdminAuthedServer())) {
      return noStoreJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    return noStoreJson({ ok: true, items: await listAdminMediaTags(await getDb()) });
  }

  const rateLimit = await consumeFixedWindowRateLimit({
    bucket: "media-tags-list",
    key: getClientAddress(req),
    limit: TAG_LIST_RATE_LIMIT_MAX,
    windowMs: TAG_LIST_RATE_LIMIT_WINDOW_MS,
  });

  if (rateLimit.limited) {
    return noStoreJson({ ok: false, error: "Too many requests. Try again later." }, { status: 429 });
  }

  return noStoreJson({ ok: true, items: await listActiveMediaTags() });
}

export async function POST(req: Request) {
  const guard = await requireAdminOr401();
  if (guard) return guard;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const label = asString(body.label).trim();
  if (!label) return noStoreJson({ ok: false, error: "Label is required" }, { status: 400 });

  const slug = slugifyTag(asString(body.slug) || label);
  if (!slug || !isValidTagSlug(slug)) {
    return noStoreJson({ ok: false, error: "Invalid slug" }, { status: 400 });
  }
  if (isReservedTagSlug(slug)) {
    return noStoreJson({ ok: false, error: "Slug reserved" }, { status: 409 });
  }

  const description = asString(body.description).trim();

  const db = await getDb();

  const exists = await db.collection("media_tags").findOne({ slug }, { projection: { _id: 1 } });
  if (exists) return noStoreJson({ ok: false, error: "Slug already exists" }, { status: 409 });

  const last = await db
    .collection("media_tags")
    .find({})
    .sort({ order: -1 })
    .limit(1)
    .toArray();

  const nextOrder =
    last.length && typeof last[0]?.order === "number" && Number.isFinite(last[0].order)
      ? last[0].order + 1
      : 0;

  const now = new Date();
  const doc = { label, slug, description, isActive: true, order: nextOrder, createdAt: now, updatedAt: now };
  const r = await db.collection("media_tags").insertOne(doc);

  revalidatePublicTree("/photography");
  revalidatePublicTree("/videography");

  return noStoreJson(
    { ok: true, id: r.insertedId.toString(), slug, label, item: adminMediaTagOf({ ...doc, _id: r.insertedId }, 0) },
    { status: 201 }
  );
}

export const GET = withRouteErrors(handleGet);
