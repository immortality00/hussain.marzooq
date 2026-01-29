import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function isValidObjectIdString(s: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(s);
}
async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get("hm_admin")?.value === "ok";
}

function getLimit(url: URL): number {
  const raw = url.searchParams.get("limit");
  const n = raw ? Number(raw) : 50;
  if (!Number.isFinite(n) || n <= 0) return 50;
  return Math.min(Math.floor(n), 200);
}
function getSkip(url: URL): number {
  const raw = url.searchParams.get("skip");
  const n = raw ? Number(raw) : 0;
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = getLimit(url);
  const skip = getSkip(url);

  const status = (url.searchParams.get("status") ?? "").trim();
  const category = (url.searchParams.get("category") ?? "").trim();
  const serviceId = (url.searchParams.get("serviceId") ?? "").trim();

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (serviceId) filter.serviceId = serviceId; // we store as string

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const docs = await db
    .collection("inquiries")
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const items = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    email: typeof d.email === "string" ? d.email : "",
    message: typeof d.message === "string" ? d.message : "",
    category: typeof d.category === "string" ? d.category : null,
    status: typeof d.status === "string" ? d.status : "new",
    serviceId: typeof d.serviceId === "string" ? d.serviceId : null,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
  }));

  const res = NextResponse.json({ ok: true, items });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const name = (asString(body.name) ?? "").trim();
  const email = (asString(body.email) ?? "").trim();
  const message = (asString(body.message) ?? "").trim();

  const category = asString(body.category);
  const rawServiceId = asString(body.serviceId);

  if (!name) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  if (!email) return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  if (!message) return NextResponse.json({ ok: false, error: "Message is required" }, { status: 400 });

  // Strict rule: serviceId is either 24-hex string OR null
  let serviceId: string | null = null;
  if (rawServiceId) {
    const trimmed = rawServiceId.trim();
    if (trimmed.length > 0) {
      if (!isValidObjectIdString(trimmed)) {
        return NextResponse.json({ ok: false, error: "Invalid serviceId" }, { status: 400 });
      }
      serviceId = trimmed;
    }
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("inquiries").insertOne({
    name,
    email,
    message,
    category: category ? category.trim() : null,
    serviceId, // string | null (strict)
    status: "new",
    createdAt: new Date(),
  });

  // Increment count only if serviceId is valid 24-hex
  if (serviceId) {
    await db.collection("services").updateOne(
      { _id: new ObjectId(serviceId) },
      { $inc: { inquiriesCount: 1 } }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}