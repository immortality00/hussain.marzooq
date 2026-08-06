import { Db, ObjectId } from "mongodb";
import { getDb } from "@/lib/server/db";
import {
  findByIdOr404,
  requireAdminObjectId,
  wantsHardDelete,
} from "@/app/api/_lib/admin-route";
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

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const bodyUnknown = (await req.json().catch(() => null)) as unknown;
  const body = isRecord(bodyUnknown) ? bodyUnknown : {};

  const status = asString(body.status).trim();
  const adminNotes =
    typeof body.adminNotes === "string" ? body.adminNotes.trim().slice(0, 5000) : null;
  const nextArchived = typeof body.isArchived === "boolean" ? body.isArchived : null;

  const db = await getDb();

  const found = await findByIdOr404(db, "inquiries", oid);
  if (found instanceof Response) return found;
  const existing = found.doc;

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (status) {
    if (!ALLOWED.has(status)) {
      return noStoreJson({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    patch.status = status;
  }

  if (adminNotes !== null) patch.adminNotes = adminNotes;
  if (nextArchived !== null) patch.isArchived = nextArchived;

  await db.collection("inquiries").updateOne({ _id: oid }, { $set: patch });

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

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminObjectId(ctx);
  if (gate instanceof Response) return gate;
  const { oid } = gate;

  const hard = wantsHardDelete(req);

  const db = await getDb();

  const found = await findByIdOr404(db, "inquiries", oid);
  if (found instanceof Response) return found;
  const inquiry = found.doc;

  const serviceId = inquiry.serviceId;
  const alreadyArchived = inquiry.isArchived === true;
  const shouldDecrement = !alreadyArchived && hasValidServiceId(serviceId);

  if (!hard) {
    await db.collection("inquiries").updateOne(
      { _id: oid },
      { $set: { isArchived: true, updatedAt: new Date() } }
    );

    if (shouldDecrement) {
      await decrementServiceInquiriesCount(db, serviceId);
    }

    return noStoreJson({ ok: true, mode: "archived" });
  }

  await db.collection("inquiries").deleteOne({ _id: oid });

  if (shouldDecrement) {
    await decrementServiceInquiriesCount(db, serviceId);
  }

  return noStoreJson({ ok: true, mode: "deleted" });
}