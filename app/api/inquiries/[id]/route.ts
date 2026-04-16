import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Db, ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["new", "pending", "replied", "approved", "rejected", "resolved"]);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function noStore(body: unknown, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

async function decrementServiceInquiriesCount(db: Db, serviceId: string): Promise<void> {
  await db.collection("services").updateOne(
    { _id: new ObjectId(serviceId) },
    [
      {
        $set: {
          inquiriesCount: {
            $max: [0, { $add: [{ $ifNull: ["$inquiriesCount", 0] }, -1] }],
          },
          updatedAt: new Date(),
        },
      },
    ]
  );
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const status = asString(body.status).trim();
  const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes.trim().slice(0, 5000) : null;
  const isArchived = typeof body.isArchived === "boolean" ? body.isArchived : null;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (status) {
    if (!ALLOWED.has(status)) return noStore({ ok: false, error: "Invalid status" }, { status: 400 });
    patch.status = status;
  }
  if (adminNotes !== null) patch.adminNotes = adminNotes;
  if (isArchived !== null) patch.isArchived = isArchived;

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  await db.collection("inquiries").updateOne({ _id: new ObjectId(id) }, { $set: patch });

  return noStore({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny as unknown as Response;

  const { id } = await params;
  if (!ObjectId.isValid(id)) return noStore({ ok: false, error: "Invalid id" }, { status: 400 });

  const url = new URL(req.url);
  const hard = url.searchParams.get("hard") === "1";

  const client = await clientPromise;
  const db = client.db("hm_visuals");

  const inquiry = await db.collection("inquiries").findOne({ _id: new ObjectId(id) });
  if (!inquiry) return noStore({ ok: false, error: "Not found" }, { status: 404 });

  const serviceId = typeof inquiry.serviceId === "string" ? inquiry.serviceId : null;
  const alreadyArchived = inquiry.isArchived === true;
  const shouldDecrement = !alreadyArchived && serviceId !== null && ObjectId.isValid(serviceId);

  if (!hard) {
    await db.collection("inquiries").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: true, updatedAt: new Date() } }
    );

    if (shouldDecrement) {
      await decrementServiceInquiriesCount(db, serviceId);
    }

    return noStore({ ok: true, mode: "archived" });
  }

  await db.collection("inquiries").deleteOne({ _id: new ObjectId(id) });

  if (shouldDecrement) {
    await decrementServiceInquiriesCount(db, serviceId);
  }

  return noStore({ ok: true, mode: "deleted" });
}