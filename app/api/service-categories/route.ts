import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const rows = await db
    .collection("service_categories")
    .aggregate([
      { $sort: { order: 1, createdAt: -1 } },
      {
        $lookup: {
          from: "services",
          localField: "slug",
          foreignField: "category",
          as: "servicesForCategory",
        },
      },
      { $addFields: { servicesCount: { $size: "$servicesForCategory" } } },
      { $project: { servicesForCategory: 0 } },
    ])
    .toArray();

  const items = rows.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
    servicesCount: typeof d.servicesCount === "number" ? d.servicesCount : 0,
    isSystem: typeof d.isSystem === "boolean" ? d.isSystem : d.slug === "others",
  }));

  return noStore({ ok: true, items });
}

export async function POST(req: Request) {
  const guard = await requireAdminOr401();
  if (guard) return guard as unknown as Response;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const name = asString(body.name).trim();
  const slug = asString(body.slug).trim();

  if (!name) return noStore({ ok: false, error: "Name is required" }, { status: 400 });
  if (!slug || slug.includes(" ")) return noStore({ ok: false, error: "Invalid slug" }, { status: 400 });
  if (slug === "others") return noStore({ ok: false, error: "Slug reserved" }, { status: 409 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const exists = await db.collection("service_categories").findOne({ slug }, { projection: { _id: 1 } });
  if (exists) return noStore({ ok: false, error: "Slug already exists" }, { status: 409 });

  const last = await db.collection("service_categories").find({}).sort({ order: -1 }).limit(1).toArray();
  const nextOrder =
    last.length && typeof last[0]?.order === "number" && Number.isFinite(last[0].order) ? last[0].order + 1 : 0;

  const now = new Date();
  const r = await db.collection("service_categories").insertOne({
    name,
    slug,
    isActive: true,
    order: nextOrder,
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  });

  return noStore({ ok: true, id: r.insertedId.toString() }, { status: 201 });
}