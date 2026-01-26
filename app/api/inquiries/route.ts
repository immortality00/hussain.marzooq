// app/api/inquiries/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Admin-only list
 * GET /api/inquiries?page=1&limit=20&status=new&serviceId=...&category=...
 */
export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const url = new URL(req.url);
  const page = clampInt(Number(url.searchParams.get("page") ?? "1"), 1, 10_000);
  const limit = clampInt(Number(url.searchParams.get("limit") ?? "20"), 1, 100);
  const skip = (page - 1) * limit;

  const status = asString(url.searchParams.get("status")).trim();
  const category = asString(url.searchParams.get("category")).trim();
  const serviceId = asString(url.searchParams.get("serviceId")).trim();

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (serviceId) filter.serviceId = serviceId;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const [docs, total] = await Promise.all([
    db
      .collection("inquiries")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("inquiries").countDocuments(filter),
  ]);

  const items = docs.map((d) => ({
    id: String(d._id),
    name: typeof d.name === "string" ? d.name : "",
    email: typeof d.email === "string" ? d.email : "",
    message: typeof d.message === "string" ? d.message : "",
    category: typeof d.category === "string" ? d.category : null,
    serviceId: typeof d.serviceId === "string" ? d.serviceId : null,
    status: typeof d.status === "string" ? d.status : "new",
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt ?? ""),
  }));

  const res = NextResponse.json({ ok: true, page, limit, total, items });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

/**
 * Public create
 * POST /api/inquiries
 * Body: { name, email, message, category?, serviceId|null, hp? }
 */
export async function POST(req: Request) {
  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const name = asString(body.name).trim();
  const email = asString(body.email).trim();
  const message = asString(body.message).trim();
  const category = asString(body.category).trim();

  // Honeypot
  const hp = asString(body.hp).trim();
  if (hp) {
    // pretend success to bots
    const res = NextResponse.json({ ok: true }, { status: 201 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  // serviceId must be string 24-hex OR null
  const serviceIdField = body.serviceId;
  const serviceIdRaw =
    serviceIdField === null ? null : asNullableString(serviceIdField)?.trim() ?? null;

  if (!name || name.length > 120) {
    return NextResponse.json({ ok: false, error: "Invalid name" }, { status: 400 });
  }
  if (!email || email.length > 254 || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }
  if (!message || message.length > 5000) {
    return NextResponse.json({ ok: false, error: "Invalid message" }, { status: 400 });
  }

  let serviceId: string | null = null;

  if (serviceIdRaw === null) {
    serviceId = null;
  } else if (serviceIdRaw === "") {
    serviceId = null;
  } else {
    if (!OBJECT_ID_RE.test(serviceIdRaw)) {
      return NextResponse.json({ ok: false, error: "Invalid serviceId" }, { status: 400 });
    }
    serviceId = serviceIdRaw;
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const inquiryDoc = {
    name,
    email,
    message,
    category: category || null,
    serviceId, // string or null
    status: "new",
    createdAt: new Date(),
  };

  await db.collection("inquiries").insertOne(inquiryDoc);

  if (serviceId) {
    const r = await db.collection("services").updateOne(
      { _id: new ObjectId(serviceId) },
      { $inc: { inquiriesCount: 1 } }
    );

    // If serviceId not found: keep inquiry; recount tool can repair if needed.
    void r;
  }

  const res = NextResponse.json({ ok: true }, { status: 201 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}