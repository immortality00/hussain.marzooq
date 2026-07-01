import { ObjectId } from "mongodb";
import type { AnyBulkWriteOperation, Document } from "mongodb";
import { requireAdminOr401 } from "@/lib/auth/admin";
import { isValidObjectIdString, noStoreJson } from "@/app/api/_lib/common";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const deny = await requireAdminOr401();
  if (deny) return deny;

  try {
    const db = await getDb();

    const servicesCol = db.collection("services");
    const inquiriesCol = db.collection("inquiries");

    const now = new Date();

    await servicesCol.updateMany({}, { $set: { inquiriesCount: 0, updatedAt: now } });

    const rows = await inquiriesCol
      .aggregate([
        {
          $match: {
            serviceId: { $type: "string", $ne: "" },
            isArchived: { $ne: true },
          },
        },
        {
          $group: {
            _id: "$serviceId",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const ops: AnyBulkWriteOperation<Document>[] = [];

    for (const row of rows) {
      if (!row || typeof row !== "object") continue;

      const record = row as Record<string, unknown>;
      const serviceId = typeof record._id === "string" ? record._id : "";
      const count = typeof record.count === "number" ? record.count : 0;

      if (!serviceId || !isValidObjectIdString(serviceId)) continue;

      ops.push({
        updateOne: {
          filter: { _id: new ObjectId(serviceId) },
          update: { $set: { inquiriesCount: count, updatedAt: now } },
        },
      });
    }

    if (ops.length > 0) {
      await servicesCol.bulkWrite(ops, { ordered: false });
    }

    return noStoreJson({
      ok: true,
      groupedInquiryServices: rows.length,
      syncedServices: ops.length,
    });
  } catch {
    return noStoreJson(
      { ok: false, error: "Failed to recount service inquiries." },
      { status: 500 }
    );
  }
}