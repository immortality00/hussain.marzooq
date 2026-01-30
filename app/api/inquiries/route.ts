import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

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

function noStoreJson(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(req: Request) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const url = new URL(req.url);
  const limit = getLimit(url);
  const skip = getSkip(url);

  const status = (url.searchParams.get("status") ?? "").trim();
  const category = (url.searchParams.get("category") ?? "").trim();
  const serviceId = (url.searchParams.get("serviceId") ?? "").trim();

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (serviceId) filter.serviceId = serviceId; // stored as string

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

  return noStoreJson({ ok: true, items });
}

export async function POST(req: Request) {
  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  if (!isRecord(bodyUnknown)) {
    return noStoreJson({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const name = (asString(bodyUnknown.name) ?? "").trim();
  const email = (asString(bodyUnknown.email) ?? "").trim();
  const message = (asString(bodyUnknown.message) ?? "").trim();

  const category = asString(bodyUnknown.category);
  const rawServiceId = asString(bodyUnknown.serviceId);

  if (!name) return noStoreJson({ ok: false, error: "Name is required" }, { status: 400 });
  if (!email) return noStoreJson({ ok: false, error: "Email is required" }, { status: 400 });
  if (!message) return noStoreJson({ ok: false, error: "Message is required" }, { status: 400 });

  // Strict: serviceId is either a valid 24-hex string OR null
  let serviceId: string | null = null;
  if (rawServiceId !== null) {
    const trimmed = rawServiceId.trim();
    if (trimmed !== "") {
      if (!isValidObjectIdString(trimmed)) {
        return noStoreJson({ ok: false, error: "Invalid serviceId" }, { status: 400 });
      }
      serviceId = trimmed;
    }
  }

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  // If serviceId is provided, ensure the service exists (prevents bad links + bad counts)
  if (serviceId) {
    const exists = await db
      .collection("services")
      .findOne({ _id: new ObjectId(serviceId) }, { projection: { _id: 1 } });

    if (!exists) {
      return noStoreJson({ ok: false, error: "Unknown serviceId" }, { status: 400 });
    }
  }

  const doc = {
    name,
    email,
    message,
    category: category ? category : null,
    serviceId, // string | null
    status: "new",
    createdAt: new Date(),
  };

  const r = await db.collection("inquiries").insertOne(doc);

  // Increment only when strictly linked to a serviceId
  if (serviceId) {
    await db
      .collection("services")
      .updateOne({ _id: new ObjectId(serviceId) }, { $inc: { inquiriesCount: 1 } });
  }

  return noStoreJson({ ok: true, id: r.insertedId.toString() });
}