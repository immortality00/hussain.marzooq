import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function looksTruthy(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "ok" || s.length > 10;
}
async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  const knownNames = ["admin", "admin_auth", "admin_session", "admin_token", "hm_admin"];

  for (const name of knownNames) {
    const v = store.get(name)?.value;
    if (typeof v === "string" && looksTruthy(v)) return true;
  }
  for (const c of store.getAll()) {
    const n = c.name.toLowerCase();
    if (n.includes("admin") && looksTruthy(c.value)) return true;
  }
  return false;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("service_categories")
    .find({})
    .sort({ order: 1, createdAt: -1 })
    .toArray();

  const items = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    slug: typeof d.slug === "string" ? d.slug : "",
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
    order: typeof d.order === "number" ? d.order : 0,
  }));

  const res = NextResponse.json({ ok: true, items });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: Request) {
  const okAdmin = await isAdminRequest();
  if (!okAdmin) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });

  const nameRaw = asString(body.name);
  const name = (nameRaw ?? "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });

  const slug = slugify(name);
  if (!slug) return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const exists = await db.collection("service_categories").findOne({ slug });
  if (exists) {
    return NextResponse.json({ ok: false, error: "Category already exists" }, { status: 400 });
  }

  const result = await db.collection("service_categories").insertOne({
    name,
    slug,
    isActive: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const res = NextResponse.json({ ok: true, id: String(result.insertedId) });
  res.headers.set("Cache-Control", "no-store");
  return res;
}