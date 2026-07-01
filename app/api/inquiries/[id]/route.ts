import { Db, ObjectId } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { getDb } from "@/lib/server/db";
import { asString, isRecord, noStoreJson } from "@/app/api/_lib/common";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(["new", "pending", "replied", "approved", "rejected", "resolved"]);

function hasValidServiceId(serviceId: unknown): serviceId is string {
  return typeof serviceId === "string" && ObjectId.isValid(serviceId);
}

async function incrementServiceInquiriesCount(db: Db, serviceId: string): Promise<void> {
  await db.collection("services").updateOne(
    { _id: new ObjectId(serviceId) },
    {
      $inc: { inquiriesCount: 1 },
      $set: { updatedAt: new Date() },
    }
  );
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
  if (deny) return deny;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const status = asString(body.status).trim();
  const adminNotes =
    typeof body.adminNotes === "string" ? body.adminNotes.trim().slice(0, 5000) : null;
  const nextArchived = typeof body.isArchived === "boolean" ? body.isArchived : null;

  const db = await getDb();

  const existing = await db.collection("inquiries").findOne({ _id: new ObjectId(id) });
  if (!existing) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (status) {
    if (!ALLOWED.has(status)) {
      return noStoreJson({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    patch.status = status;
  }

  if (adminNotes !== null) patch.adminNotes = adminNotes;
  if (nextArchived !== null) patch.isArchived = nextArchived;

  await db.collection("inquiries").updateOne({ _id: new ObjectId(id) }, { $set: patch });

  const serviceId = existing.serviceId;
  const prevArchived = existing.isArchived === true;

  if (nextArchived !== null && nextArchived !== prevArchived && hasValidServiceId(serviceId)) {
    if (nextArchived) {
      await decrementServiceInquiriesCount(db, serviceId);
    } else {
      await incrementServiceInquiriesCount(db, serviceId);
    }
  }

  return noStoreJson({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return noStoreJson({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  const url = new URL(req.url);
  const hard = url.searchParams.get("hard") === "1";

  const db = await getDb();

  const inquiry = await db.collection("inquiries").findOne({ _id: new ObjectId(id) });
  if (!inquiry) return noStoreJson({ ok: false, error: "Not found" }, { status: 404 });

  const serviceId = inquiry.serviceId;
  const alreadyArchived = inquiry.isArchived === true;
  const shouldDecrement = !alreadyArchived && hasValidServiceId(serviceId);

  if (!hard) {
    await db.collection("inquiries").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: true, updatedAt: new Date() } }
    );

    if (shouldDecrement) {
      await decrementServiceInquiriesCount(db, serviceId);
    }

    return noStoreJson({ ok: true, mode: "archived" });
  }

  await db.collection("inquiries").deleteOne({ _id: new ObjectId(id) });

  if (shouldDecrement) {
    await decrementServiceInquiriesCount(db, serviceId);
  }

  return noStoreJson({ ok: true, mode: "deleted" });
}