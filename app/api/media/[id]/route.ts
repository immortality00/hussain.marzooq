import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

type Appearance = {
  kind: "featured" | "exhibited";
  title: string;
  venue: string;
  city: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  notes: string;
  link: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function asBool(v: unknown): boolean | null {
  return typeof v === "boolean" ? v : null;
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);
}
function sanitizeAppearances(v: unknown): Appearance[] {
  if (!Array.isArray(v)) return [];
  const out: Appearance[] = [];
  for (const item of v) {
    if (!isRecord(item)) continue;
    const kindRaw = asString(item.kind).trim();
    const kind = kindRaw === "featured" ? "featured" : kindRaw === "exhibited" ? "exhibited" : null;
    if (!kind) continue;

    out.push({
      kind,
      title: asString(item.title).slice(0, 160),
      venue: asString(item.venue).slice(0, 160),
      city: asString(item.city).slice(0, 120),
      country: asString(item.country).slice(0, 120),
      dateFrom: asString(item.dateFrom).slice(0, 32),
      dateTo: asString(item.dateTo).slice(0, 32),
      notes: asString(item.notes).slice(0, 2000),
      link: asString(item.link).slice(0, 500),
    });

    if (out.length >= 50) break;
  }
  return out;
}

function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) return noStore({ ok: false, error: "Invalid body" }, { status: 400 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  // allowed fields only
  if ("title" in bodyUnknown) patch.title = asString(bodyUnknown.title).trim().slice(0, 160);
  if ("description" in bodyUnknown) patch.description = asString(bodyUnknown.description).trim().slice(0, 2000) || null;
  if ("location" in bodyUnknown) patch.location = asString(bodyUnknown.location).trim().slice(0, 120) || null;
  if ("event" in bodyUnknown) patch.event = asString(bodyUnknown.event).trim().slice(0, 120) || null;

  if ("year" in bodyUnknown) {
    const y = Number(asString(bodyUnknown.year).trim());
    patch.year = Number.isFinite(y) && y > 1900 && y < 2100 ? y : null;
  }

  if ("tags" in bodyUnknown) patch.tags = asStringArray(bodyUnknown.tags);
  if ("categories" in bodyUnknown) patch.categories = asStringArray(bodyUnknown.categories);
  if ("people" in bodyUnknown) patch.people = asStringArray(bodyUnknown.people);

  if ("isPublic" in bodyUnknown) {
    const b = asBool(bodyUnknown.isPublic);
    if (b !== null) patch.isPublic = b;
  }

  if ("appearances" in bodyUnknown) patch.appearances = sanitizeAppearances(bodyUnknown.appearances);

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("media").updateOne({ _id: new ObjectId(id) }, { $set: patch });

  return noStore({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("media").deleteOne({ _id: new ObjectId(id) });

  return noStore({ ok: true });
}