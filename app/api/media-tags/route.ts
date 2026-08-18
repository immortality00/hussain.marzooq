import { revalidatePath } from "next/cache";
import { requireAdminOr401, isAdminAuthedServer } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { getClientAddress } from "@/app/api/_lib/public-form-security";
import { consumeFixedWindowRateLimit } from "@/lib/server/request-guards";
import { asString, isRecord, noStoreJson } from "@/app/api/_lib/common";
import {
  isReservedTagSlug,
  isValidTagSlug,
  sanitizeDisciplines,
  slugifyTag,
} from "@/lib/server/media-tags";

export const dynamic = "force-dynamic";

const TAG_LIST_RATE_LIMIT_WINDOW_MS = 60_000;
const TAG_LIST_RATE_LIMIT_MAX = 60;

async function tagCounts(db: Awaited<ReturnType<typeof getDb>>) {
  const rows = await db
    .collection("media")
    .aggregate<{ _id: string; count: number }>([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ])
    .toArray();

  const map = new Map<string, number>();
  for (const row of rows) if (typeof row._id === "string") map.set(row._id, row.count);
  return map;
}

function serializeTag(doc: Record<string, unknown>, counts: Map<string, number>) {
  const slug = typeof doc.slug === "string" ? doc.slug : "";
  return {
    id: String(doc._id),
    label: typeof doc.label === "string" ? doc.label : "",
    slug,
    description: typeof doc.description === "string" ? doc.description : "",
    disciplines: sanitizeDisciplines(doc.disciplines),
    isActive: typeof doc.isActive === "boolean" ? doc.isActive : true,
    order: typeof doc.order === "number" ? doc.order : 0,
    mediaCount: counts.get(slug) ?? 0,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");
  const db = await getDb();

  if (scope === "admin") {
    if (!(await isAdminAuthedServer())) {
      return noStoreJson({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const [docs, counts] = await Promise.all([
      db.collection("media_tags").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
      tagCounts(db),
    ]);

    return noStoreJson({ ok: true, items: docs.map((d) => serializeTag(d, counts)) });
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

  const docs = await db
    .collection("media_tags")
    .find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const items = docs.map((doc) => ({
    id: String(doc._id),
    label: typeof doc.label === "string" ? doc.label : "",
    slug: typeof doc.slug === "string" ? doc.slug : "",
    description: typeof doc.description === "string" ? doc.description : "",
    disciplines: sanitizeDisciplines(doc.disciplines),
  }));

  return noStoreJson({ ok: true, items });
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
  const disciplines = sanitizeDisciplines(body.disciplines);

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
  const r = await db.collection("media_tags").insertOne({
    label,
    slug,
    description,
    disciplines,
    isActive: true,
    order: nextOrder,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/photography", "layout");
  revalidatePath("/videography", "layout");

  return noStoreJson({ ok: true, id: r.insertedId.toString(), slug, label }, { status: 201 });
}
