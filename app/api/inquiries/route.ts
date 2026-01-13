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
function isAdminCookie(v: string | undefined): boolean {
  return v === "1" || v === "true";
}

function getLimit(url: URL): number {
  const raw = url.searchParams.get("limit");
  const n = raw ? Number(raw) : 200;
  if (!Number.isFinite(n) || n <= 0) return 200;
  return Math.min(Math.floor(n), 1000);
}
function getSkip(url: URL): number {
  const raw = url.searchParams.get("skip");
  const n = raw ? Number(raw) : 0;
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

export async function GET(req: Request) {
  const c = await cookies();
  const isAdmin = isAdminCookie(c.get("hm_admin")?.value);
  if (!isAdmin) {
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

  // support filtering by serviceId whether stored as ObjectId or string
  if (serviceId) {
    const or: Record<string, unknown>[] = [{ serviceId }];
    if (ObjectId.isValid(serviceId)) or.push({ serviceId: new ObjectId(serviceId) });
    filter.$or = or;
  }

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

    // service linkage (may be string or ObjectId in DB; normalize to string)
    serviceId:
      typeof d.serviceId === "string"
        ? d.serviceId
        : d.serviceId && typeof d.serviceId === "object"
          ? String(d.serviceId)
          : null,

    serviceName: typeof d.serviceName === "string" ? d.serviceName : null,
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt ?? ""),
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
  const serviceName = asString(body.serviceName);
  const serviceIdRaw = asString(body.serviceId)?.trim() ?? "";

  if (!name) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  if (!email) return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  if (!message) return NextResponse.json({ ok: false, error: "Message is required" }, { status: 400 });

  // ✅ we store serviceId as STRING in inquiries (simple + consistent for frontend)
  const serviceId = serviceIdRaw ? serviceIdRaw : null;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("inquiries").insertOne({
    name,
    email,
    message,
    category: category ? category.trim() : null,

    serviceId, // string | null
    serviceName: serviceName ? serviceName.trim() : null,

    status: "new",
    createdAt: new Date(),
  });

  // ✅ increment service counter ONLY if user selected a real serviceId
  if (serviceId) {
    const or: Record<string, unknown>[] = [{ _id: serviceId }];
    if (ObjectId.isValid(serviceId)) or.push({ _id: new ObjectId(serviceId) });

    await db.collection("services").updateOne(
      { $or: or },
      { $inc: { inquiriesCount: 1 } }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Cache-Control", "no-store");
  return res;
}